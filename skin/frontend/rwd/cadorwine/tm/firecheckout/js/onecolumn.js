var OnecolumnCheckout = {
    currentStep: null,

    init: function() {
        $$('.onecolumn').first().insert({
            bottom: '<div id="scrolling-spacer"></div>'
        });
        this.stepForward($$('.onecolumn .step').first(), false);
        this.addObservers();
    },

    /**
     * @param  {DOM.Element} step   Step to activate
     * @param  {boolean} scroll      Flag, to indicate that scrolling should be used or not
     */
    stepForward: function(step, scroll) {
        if (!step) {
            return;
        }

        if (this.currentStep) {
            if (!this.validateStep(this.currentStep)) {
                return false;
            }
            this.currentStep.addClassName('completed').removeClassName('current');
        }

        this.latestStep = this.currentStep;
        this.currentStep = step;
        step.addClassName('current activated');
        this._handleScroll.bind(this).delay(0.1, scroll);
    },

    /**
     * Go to specified step and deactivate all completed steps
     */
    stepTo: function(step, scroll) {
        if (!step) {
            return;
        }

        step.nextSiblings().each(function(el) {
            el.removeClassName('current')
                .removeClassName('completed')
                .removeClassName('activated');
        });

        this.latestStep = this.currentStep;
        this.currentStep = step;
        step.removeClassName('completed').addClassName('current');
        this._handleScroll.bind(this).delay(0.1, scroll);
    },

    _handleScroll: function(scroll) {
        var step = this.currentStep;

        var sidebar = $$('.onecolumn-aside').first();
        if (sidebar && sidebar.getStyle('display') !== 'none') {
            var scrollingSpaceNeeded = step.viewportOffset().top - 20,
                viewportOffsetBottom = document.viewport.getScrollOffsets().top + document.viewport.getDimensions().height,
                availableScrollingSpace = (document.body.getHeight() - $('scrolling-spacer').getHeight()) - viewportOffsetBottom;

            if (scrollingSpaceNeeded > availableScrollingSpace) {
                if (step.viewportOffset().top === sidebar.viewportOffset().top) { // first step
                    $('scrolling-spacer').setStyle({
                        height: - availableScrollingSpace + 'px'
                    });
                } else {
                    $('scrolling-spacer').setStyle({
                        height: scrollingSpaceNeeded - availableScrollingSpace + 'px'
                    });
                }

                // min-height on content block fix
                availableScrollingSpace = (document.body.getHeight() - $('scrolling-spacer').getHeight()) - viewportOffsetBottom;
                if (availableScrollingSpace < 0) {
                    $('scrolling-spacer').setStyle({
                        height: - availableScrollingSpace + 'px'
                    });
                }
            } else {
                $('scrolling-spacer').setStyle({
                    height: 0 + 'px'
                });
            }
        }

        if (false !== scroll) {
            FC.Utils.scrollTo(step, {
                duration: 0.5,
                offset: -20
            }, true);
        }
    },

    addObservers: function() {
        var self = this;

        // next step buttons
        $$('.step .next').each(function(el) {
            el.observe('click', function() {
                var step = el.up('.step'),
                    method = step.readAttribute('data-step-save');

                if (method && self[method]) {
                    self[method](el, self.stepForward.bind(self, step.next('.step')));
                } else {
                    self.stepForward(step.next('.step'));
                }
            });
        });

        // previous step buttons
        $$('.step .edit').each(function(el) {
            el.observe('click', function() {
                self.stepTo(el.up('.step'), false);
            });
        });

        // login button
        $$('.step .btn-login').each(function(el) {
            el.observe('click', function() {
                var email = $('billing\:email'),
                    password = $('billing\:customer_password'),
                    messageContainer = $$('.step-name .block-content').first();

                if (!Validation.validate(email) || !Validation.validate(password)) {
                    return;
                }

                // captcha integration
                var loginWindow = $('firecheckout-login-window');
                if (loginWindow.down('#user_login')) {
                    firecheckoutWindow
                        .update(loginWindow, {
                            maxWidth: 400
                        })
                        .show();
                    loginWindow.down('#email').setValue(email.getValue());
                    loginWindow.down('#pass').setValue(password.getValue());
                    var captchaInput = loginWindow.down('#captcha_user_login');
                    if (captchaInput) {
                        captchaInput.focus();
                    }
                    return;
                }

                self.setLoadingButton(el);
                new Ajax.Request(checkout.urls.login, {
                    parameters: {
                        'login[username]': email.getValue(),
                        'login[password]': password.getValue()
                    },
                    onSuccess: function(transport) {
                        var response = {};
                        try {
                            response = transport.responseText.evalJSON();
                        } catch (e) {
                            response.error = e;
                        }

                        self.setLoadingButton(el, false);
                        FC.Messenger.clear(messageContainer);
                        if (response.error) {
                            FC.Messenger.add(response.error, messageContainer, 'error');
                            checkout.validator.scrollToError();
                            checkout.updateCaptcha('user_login');
                            password.focus();
                            password.setSelectionRange(0, password.value.length);
                        }
                        if (response.redirect) {
                            document.location = response.redirect;
                        }
                    }
                });
            });
        });

        // forgot password button
        $$('.step .link-forgot-password').each(function(el) {
            el.observe('click', function(e) {
                Event.stop(e);
                var email = $('billing\:email'),
                    messageContainer = $$('.step-name .block-content').first();

                FC.ForgotPassword.forgot(email, messageContainer, el);
            });
        });

        // email verification
        var emailField = $('billing\:email');
        if (emailField) {
            emailField.observe('change', self.onEmailChange.bind(self));
            if (emailField.value.length && Validation.validate(emailField)) {
                self.onEmailChange();
            }
        }

        var guestCheckbox = $('billing\:guest_account');
        if (guestCheckbox) {
            guestCheckbox.observe('click', function(e) {
                self.toggleGuestMode(this.checked);
            });
        }
    },

    onEmailChange: function() {
        var self = this,
            emailField = $('billing\:email'),
            buttonSet = $('step-name').down('.step-buttons-set'),
            messageContainer = $$('.step-name .block-content').first();

        FC.Messenger.clear(messageContainer);

        if (!emailField.value.length || !Validation.validate(emailField)) {
            hint = emailField.up('.hint--always');
            hint.writeAttribute('aria-label', hint.readAttribute('data-default-hint'));
            self.toggleLogin(false);
            return;
        }
        checkout.setLoadingField(emailField);
        self.setDisableButtonSet(buttonSet);
        self.verifyEmail(emailField.value, function(result) {
            checkout.setLoadingField(emailField, false);
            self.setDisableButtonSet(buttonSet, false);
            if (!result.success) {
                alert('An error has occured during request processing. Try again please');
            }
            self.toggleLogin(result.exists);
        });
    },

    verifyEmail: function(email, callback) {
        new Ajax.Request(checkout.urls.email_verification, {
            parameters: {
                email: email
            },
            onFailure: function(transport) {
                callback({
                    success: false
                });
            },
            onSuccess: function(transport) {
                try {
                    response = transport.responseText.evalJSON();
                } catch (err) {
                    callback({success: false});
                    return false;
                }
                callback({
                    success: true,
                    exists: response.exists
                });
            }
        });
    },

    toggleLogin: function(customerExistsFlag) {
        var registerCheckboxWrapper = $('register-customer-checkbox'),
            guestCheckboxWraper = $('guest-customer-checkbox');

        if (customerExistsFlag) {
            if (!guestCheckboxWraper || !guestCheckboxWraper.down('input:checked')) {
                this.toggleGuestMode(false);
            }

            if (registerCheckboxWrapper) {
                registerCheckboxWrapper.hide();
            }
            if (guestCheckboxWraper) {
                guestCheckboxWraper.show();
            }
        } else {
            this.toggleGuestMode(true);

            if (registerCheckboxWrapper) {
                registerCheckboxWrapper.show();
                if (!registerCheckboxWrapper.down('input:checked')) {
                    billing.setCreateAccount(false);
                } else {
                    billing.setCreateAccount(true);
                }
            } else if ($('register-customer-password').hasClassName('hidden-registration')) {
                billing.setCreateAccount(false);
            } else {
                // registration is required
                billing.setCreateAccount(true);
            }
            if (guestCheckboxWraper) {
                guestCheckboxWraper.hide();
            }
        }
    },

    toggleGuestMode: function(flag) {
        var name = $$('.field-name').first(),
            stepName = $$('.step-name').first(),
            hint = $('billing\:email').up('.hint--always');

        if (flag) {
            hint.writeAttribute('aria-label', '');
            stepName.removeClassName('mode-login');
            billing.setCreateAccount(false);
            name.show();
        } else {
            hint.writeAttribute('aria-label', hint.readAttribute('data-login-hint'));
            this.stepTo(stepName, false);
            stepName.addClassName('mode-login');
            billing.setCreateAccount(true);
            $('billing\:confirm_password').disable(); // fix autofill in Chrome iOS
            name.hide();
        }
    },

    validateStep: function(step) {
        if (!step.validator) {
            step.validator = new FC.Validator(step);
        }
        return step.validator.validate();
    },

    setDisableButtonSet: function(set, status) {
        checkout.setDisableButtonSet(set, status);
    },

    setLoadingButton: function(button, status) {
        checkout.setLoadingButton(button, status);
    },

    saveStep: function(url, button, callback, params) {
        var self = this;

        params = Object.extend({
            urlSuffix: '',
            force_validation: 1
        }, params || {});

        self.setLoadingButton(button);
        var result = checkout.update(
            url + params.urlSuffix,
            params,
            function(response) {
                self.setLoadingButton(button, false);
                try {
                    response = response.responseText.evalJSON();
                } catch (err) {
                    return;
                }
                if (response.error) {
                    return;
                }
                callback();
            }
        );
        if (false === result) {
            self.setLoadingButton(button, false);
        }
    },

    saveName: function(button, callback, options) {
        var self = this;

        if (!self.validateStep(button.up('.step'))) {
            return;
        }

        options = Object.extend({
            force_validation: 0
        }, options || {});

        self.saveStep(checkout.urls.billing_address, button, callback, options);
    },

    saveAddress: function(button, callback, options) {
        var self = this;
        if (!self.validateStep(button.up('.step'))) {
            return;
        }

        self.saveStep(
            checkout.urls.billing_address_with_validation,
            button,
            function() {
                var sameAsBilling = $('shipping:same_as_billing');
                if (sameAsBilling && !sameAsBilling.checked) {
                    self.saveStep(checkout.urls.shipping_address, button, callback, options);
                } else {
                    callback();
                }
            },
            options
        );
    },

    saveShippingMethod: function(button, callback, options) {
        var self = this;
        if (!shippingMethod.validate() || !self.validateStep(button.up('.step'))) {
            this.scrollToError($$('.step-shipping-method').first());
            return;
        }
        self.saveStep(checkout.urls.shipping_method, button, callback, options);
    },

    savePaymentMethod: function(button, callback, options) {
        var self = this;
        if (!payment.validate() || !self.validateStep(button.up('.step'))) {
            this.scrollToError($$('.step-payment-method').first());
            return;
        }
        self.saveStep(checkout.urls.payment_method, button, callback, options);
    },

    saveShippingAndPaymentMethods: function(button, callback, options) {
        var self = this;
        if (!shippingMethod.validate() || !payment.validate() || !self.validateStep(button.up('.step'))) {
            this.scrollToError($$('.step-shipping-payment-method').first());
            return;
        }
        self.saveStep(checkout.urls.shipping_method, button, function() {
            self.saveStep(checkout.urls.payment_method, button, function() {
                callback();
            }, options);
        }, options);
    },

    scrollToError: function(step) {
        var validationMessages = step.select('.messages').findAll(function(el) {
            return el.visible();
        });

        FC.Utils.scrollTo(validationMessages);
    }
};

var OrderSummary = {
    cloneOrderTotals: function() {
        var div = $('order-total-clone');
        if (!div) {
            return;
        }
        var totals = $('checkout-review-table').down('tfoot');
        div.update('<tfoot>' + totals.innerHTML.stripScripts() + '</tfoot>');
    },

    init: function() {
        var self = this;
        self.cloneOrderTotals.defer();
        document.observe('firecheckout:setResponseAfter', function(e) {
            self.cloneOrderTotals.defer();
        });
    }
};

document.observe('dom:loaded', function() {
    OnecolumnCheckout.init();

    if (typeof reviewInfo !== 'undefined') {
        reviewInfo.editBlock = reviewInfo.editBlock.wrap(function(o, id) {
            o(id);

            var block = $(id),
                sameAsBilling = $('shipping:same_as_billing');

            if (-1 !== id.indexOf('address') && (!block || (sameAsBilling && sameAsBilling.checked))) {
                block = $('billing-address');
            }

            OnecolumnCheckout.stepTo(block.up('.step'), false);
        });
    }

    // USPS Address Verification
    if (FC.AddressVerification) {
        FC.AddressVerification.prototype.doSkipVerificationRequest = function() {
            var step = OnecolumnCheckout.currentStep;

            OnecolumnCheckout.saveAddress(
                step.down('.step-buttons-set .next'),
                OnecolumnCheckout.stepForward.bind(OnecolumnCheckout, step.next('.step')),
                {
                    urlSuffix: '?skip-address-verification=1'
                }
            );
        };
    }
});

document.observe('firecheckout:setLoadWaitingBefore', function(e) {
    var buttons = OnecolumnCheckout.currentStep.down('.step-buttons-set');
    if (buttons) {
        OnecolumnCheckout.setDisableButtonSet(buttons, e.memo.flag);
    }

    // enable previous step buttons
    var prevStep = OnecolumnCheckout.latestStep;
    if (prevStep) {
        buttons = prevStep.down('.step-buttons-set');
        if (buttons) {
            OnecolumnCheckout.setDisableButtonSet(buttons, false);
        }
    }
});

document.observe('firecheckout:setResponseAfter', function(e) {
    var step = false;

    if (e.memo.response.onecolumn_step) {
        step = e.memo.response.onecolumn_step;
    } else if (e.memo.response.goto_section) {
        var gotoMapping = {
            'payment'           : 'step-shipping-payment-method',
            'shipping_method'   : 'step-shipping-payment-method',
            'shipping'          : 'step-address',
            'billing'           : 'step-address',
            'review'            : 'step-review'
        };
        step = gotoMapping[e.memo.response.goto_section];
    }

    if (step) {
        OnecolumnCheckout.stepTo($(step), true);
    }
});
