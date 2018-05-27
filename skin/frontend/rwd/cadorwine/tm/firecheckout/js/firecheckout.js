var FireCheckout = Class.create();
FireCheckout.prototype = {

    _requestStates: {},

    initialize: function(form, urls, translations) {
        this.translations = translations;
        this.urls         = urls;
        this.form         = form;
        this.loadCounter  = 0;
        this.loadWaiting  = false;

        this.validator = new FC.Validator(this.form);
        if (typeof payment === 'object') {
            payment.saveUrl = this.urls.payment_method;
            this.validator.afterValidate.push(payment.validate.bind(payment));
        }
        if (typeof shippingMethod === 'object') {
            shippingMethod.saveUrl = this.urls.shipping_method;
            this.validator.afterValidate.push(shippingMethod.validate.bind('shippingMethod'));
        }
        if (typeof review === 'object') {
            this.validator.afterValidate.push(review.validate.bind(review));
        }
        // if (typeof FC.Taxvat === 'object') {
        //     this.validator.afterValidate.push(FC.Taxvat.validate);
        // }

        this._addEventListeners();
    },

    isRtl: function() {
        return FC.Rtl.isRtl();
    },

    _addEventListeners: function() {
        var self = this;

        $('firecheckout-login-form') && $('firecheckout-login-form').observe('submit', function(e) {
            if (typeof event != 'undefined') { // ie9 fix
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
            }
            Event.stop(e);

            if (!loginForm.validator.validate()) {
                return false;
            }

            self.setLoadingButton($('send2'));

            new Ajax.Request($('firecheckout-login-form').action, {
                parameters: $('firecheckout-login-form').serialize(),
                onSuccess: function(transport) {
                    FC.Messenger.clear('firecheckout-login-form');

                    var response = transport.responseText.evalJSON();
                    if (response.error) {
                        FC.Utils.shake($('firecheckout-login-form').up('.firecheckout-window'));
                        FC.Messenger.add(response.error, 'firecheckout-login-form', 'error');
                        self.updateCaptcha('user_login');
                    }
                    if (response.redirect) {
                        document.location = response.redirect;
                        return;
                    }
                    self.setLoadingButton($('send2'), false);
                }
            });
        });

        $('firecheckout-forgot-password-form') && $('firecheckout-forgot-password-form').observe('submit', function(e) {
            if (typeof event != 'undefined') { // ie9 fix
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
            }
            Event.stop(e);

            if (!forgotForm.validator.validate()) {
                return false;
            }

            self.setLoadingButton($('btn-forgot'));

            new Ajax.Request($('firecheckout-forgot-password-form').action, {
                parameters: $('firecheckout-forgot-password-form').serialize(),
                onSuccess: function(transport) {
                    FC.Messenger.clear('firecheckout-forgot-password-form');

                    self.setLoadingButton($('btn-forgot'), false);

                    var response = transport.responseText.evalJSON();
                    if (response.error) {
                        FC.Utils.shake($('firecheckout-forgot-password-for').up('.firecheckout-window'));
                        FC.Messenger.add(response.error, 'firecheckout-forgot-password-form', 'error');
                        self.updateCaptcha('user_forgotpassword');
                    } else if (response.message) {
                        FC.Messenger.clear('firecheckout-login-form');
                        FC.Messenger.add(response.message, 'firecheckout-login-form', 'success');
                        firecheckoutWindow.activate('login');
                    }
                }
            });
        });

        // discount form
        var discountToggler = $('discount_block_toggle');
        if (discountToggler) {
            discountToggler.observe('click', function() {
                checkout.toggleDiscountForm(this.checked);
            });

            var input = $('coupon-code');
            if (input && input.getValue().length) {
                this.toggleDiscountForm(true);
            }
        }
    },

    toggleDiscountForm: function(flag) {
        if ($('discount_block_toggle')) {
            $('discount_block_toggle').writeAttribute('checked', flag);
        }
        // can't use toogleClassName because of old prototype.js
        var method = flag ? 'addClassName' : 'removeClassName';
        $$('.discount-block .form').invoke(method, 'shown');
    },

    ajaxFailure: function(){
        location.href = this.urls.failure;
    },

    _disableEnableAll: function(element, isDisabled) {
        var descendants = element.descendants();
        for (var k in descendants) {
            descendants[k].disabled = isDisabled;
        }
        element.disabled = isDisabled;
    },

    setDisableButtonSet: function(set, status) {
        if (false === status) {
            set.select('button').each(function(button) {
                button.removeClassName('disabled').enable();
            });
        } else {
            set.select('button').each(function(button) {
                button.addClassName('disabled').disable();
            });
        }
    },

    setLoadWaiting: function(flag) {
        FC.Loader.toggle(flag);

        var container = $('review-buttons-container');
        if (FC.Loader.isActive()) {
            container.addClassName('disabled');
            container.setStyle({opacity:0.5});
            this._disableEnableAll(container, true);
        } else {
            container.removeClassName('disabled');
            container.setStyle({opacity:1});
            this._disableEnableAll(container, false);
        }
        this.loadWaiting = FC.Loader.isActive();
    },

    setLoadingField: function(field, flag) {
        FC.Loader.toggle((flag !== false), field);
    },

    setLoadingButton: function(button, flag) {
        if (!button) {
            return;
        }
        FC.Loader.toggle((flag !== false), button);
    },

    validate: function() {
        return this.validator.validate();
    },

    back: function() {
        FC.Utils.scrollTo(this.form, true);
    },

    getFormData: function() {
        document.fire('firecheckout:formSerializeBefore');
        var params = Form.serialize(this.form, true);
        document.fire('firecheckout:formSerializeAfter', {
            params: params
        });
        return params;
    },

    save: function(urlSuffix, forceSave) {
        if (this.loadWaiting != false) {
            return;
        }

        if (!this.validate()) {
            return;
        }

        if (payment.currentMethod) {
            // stripe integration
            if (!forceSave && payment.currentMethod.indexOf("stripe") === 0) {
                if ('undefined' !== typeof createStripeToken) {
                    // createStripeToken(); // Stripe
                } else {
                    payment.save(); // TemplateTag_Stripe
                }
                return;
            }
            // stripe integration

            // payone integration
            if (!forceSave && payment.currentMethod.indexOf("payone_") === 0) {
                payment.save();
                return;
            }
            // payone integration

            // phoenix ipayment integration
            if (!forceSave && payment.currentMethod.indexOf("ipayment_") === 0) {
                payment.save();
                return;
            }
            // phoenix ipayment integration

            // paymill integration
            if (!forceSave && payment.currentMethod.indexOf("paymill") === 0) {
                if (typeof paymill_onestep_cc !== 'undefined') {
                    paymill_onestep_cc(function() {
                        checkout.save('', true);
                    });
                    return;
                }
            }
            // paymill integration

            // phoenix_wirecard
            if (!forceSave && payment.currentMethod.indexOf("wirecard_checkout_page") === 0) {
                payment.save();
                return;
            }
            // phoenix_wirecard
        }

        // infostrates tnt
        if (!forceSave && (typeof shippingMethod === 'object')
            && shippingMethod.getCurrentMethod().indexOf("tnt_") === 0
            && typeof shippingMethodTnt !== 'undefined') {

            shippingMethodTnt(shippingMethodTntUrl);
            return;
        }
        // infostrates tnt

        var params = this.getFormData();

        // braintree integration
        if (payment.currentMethod && "braintree" === payment.currentMethod) {
            if (typeof braintree !== 'undefined') {
                $('payment_form_braintree').select('input, select').each(function(element) {
                    if (element.readAttribute('data-encrypt') === 'true') {
                        params[element.readAttribute('name')] = braintree.encrypt(element.value);
                    } else if (element.readAttribute('data-encrypted-name')) {
                        params[element.readAttribute('data-encrypted-name')] = braintree.encrypt(element.value);
                    }
                });
            }
        }
        // braintree integration

        var memo = {
            forceSave: forceSave,
            params: params,
            stopFurtherProcessing: false
        };
        document.fire('firecheckout:saveBefore', memo);
        if (true === memo.stopFurtherProcessing) {
            return;
        }

        checkout.setLoadWaiting(true);
        checkout.setLoadingButton($$('button.btn-checkout')[0]);

        urlSuffix = urlSuffix || '';
        var request = new Ajax.Request(this.urls.save + urlSuffix, {
            method:'post',
            parameters:params,
            onSuccess: this.setResponse.bind(this),
            onFailure: this.ajaxFailure.bind(this)
        });
    },

    /**
     * @param  {String}   url
     * @param  {Object}   params
     * @param  {Function} callback
     * @return {false|undefined}   Returns false if request was not sent
     */
    update: function(url, params, callback) {
        var self = this;
        if (self._requestStates[url]) {
            // prevent multiple requests when using form autofill
            return false;
        }
        self._requestStates[url] = true;

        params = params || {};
        var parameters = {};
        if (!params || !params.params_only) {
            parameters = this.getFormData();
        } else {
            var formKey = $(this.form).down('input[name="form_key"]');
            if (formKey) {
                parameters.form_key = formKey.getValue();
            }
        }

        if (typeof url == 'object') {
            params = url;
            url = this.urls.update;
        }
        for (var i in params) {
            parameters[i] = params[i];
            if (!params[i] || typeof params[i] === 'object') {
                continue;
            }
            var el = $('checkout-' + i + '-load');
            if (!el) {
                el = $$('.checkout-' + i + '-load').first();
            }
            if (el) {
                el.addClassName('updating');
            }
        }

        if (typeof callback === 'function') {
            callback = {
                beforeSetResponse: callback
            };
        }

        document.fire('firecheckout:updateBefore', {
            url: url,
            parameters: parameters
        });

        checkout.setLoadWaiting(true);
        var request = new Ajax.Request(url, {
            method: 'post',
            onSuccess: function(response) {
                document.fire('firecheckout:updateAfter', {
                    url: url,
                    parameters: parameters
                });

                self._requestStates[url] = false;

                if (callback && callback.beforeSetResponse) {
                    response.stopFurtherProcessing = false;

                    callback.beforeSetResponse(response);

                    if (true === response.stopFurtherProcessing) {
                        return;
                    }
                }

                self.setResponse(response);

                if (callback && callback.afterSetResponse) {
                    callback.afterSetResponse(response);
                }
            },
            onFailure: function(response) {
                document.fire('firecheckout:updateAfter', {
                    url: url,
                    parameters: parameters
                });

                self._requestStates[url] = false;

                if (callback && callback.beforeSetResponse) {
                    response.stopFurtherProcessing = false;

                    callback.beforeSetResponse(response);

                    if (true === response.stopFurtherProcessing) {
                        return;
                    }
                }

                self.ajaxFailure(response);

                if (callback && callback.afterSetResponse) {
                    callback.afterSetResponse(response);
                }
            },
            parameters: parameters
        });
    },

    updateSections: function(sections) {
        if (typeof sections === 'string') {
            sections = [sections];
        }

        var params = {
            'sections[]': sections
        };
        sections.each(function(section) {
            params[section] = 1;
        });
        checkout.update(checkout.urls.update_sections, params);
    },

    saveField: function(field, url, params, callback) {
        var self = this;
        self.setLoadingField(field);
        var result = this.update(url, params, callback);
        if (false === result) {
            self.setLoadingField(field, false);
        }
    },

    updateCaptcha: function(id) {
        var captchaEl = $(id);
        if (captchaEl && captchaEl.captcha) {
            captchaEl.captcha.refresh(captchaEl.previous('img.captcha-reload'));
            // try to focus input element:
            var inputEl = $('captcha_' + id);
            if (inputEl) {
                inputEl.focus();
            }
        }
    },

    parseMessages: function(response) {
        var msg = '';
        if (response.error_messages) {
            msg = response.error_messages;
        } else if (response.message) {
            msg = response.message;
        }
        if (typeof(msg) == 'object') {
            msg = msg.join("\n");
        }
        return msg;
    },

    setResponse: function(response) {
        var serverResponse = response;
        var responseUrl = response.request.url || response.transport.responseURL;
        try {
            response = response.responseText.evalJSON();

            // Fix for IE < EDGE
            if (!responseUrl && response.responseUrl) {
                responseUrl = response.responseUrl;
            }

            document.fire('firecheckout:setResponseBefore', {
                serverResponse: serverResponse,
                response: response,
                url: responseUrl
            });
        } catch (err) {
            alert('An error has occured during request processing. Try again please');
            $(this.form).select('.updating').invoke('removeClassName', 'updating');
            checkout.setLoadWaiting(false);
            checkout.setLoadingButton($$('button.btn-checkout')[0], false);
            return false;
        }

        if (response.redirect) {
            location.href = response.redirect;
            return true;
        }

        if (response.success) {
            window.location = this.urls.success;
            return;
        } else {
            if (response.captcha) {
                this.updateCaptcha(response.captcha);
            }
            var messages = '';
            if ((messages = this.parseMessages(response))) {
                alert(messages);
            }
        }

        if (response.update_section) {
            if (response.update_section.name && response.update_section.html) {
                // standard magento response
                response.update_section[response.update_section.name] = response.update_section.html;
                delete response.update_section.name;
                delete response.update_section.html;
            }
            for (var i in response.update_section) {
                var el = $('checkout-' + i + '-load');
                if (!el) {
                    el = $$('.checkout-' + i + '-load').first();
                }
                if (el) {
                    // Collect entered data to restore it after html update
                    var data = {},
                        iterators = {};
                    el.select('input, select').each(function(input) {
                        if (input.type === 'hidden') {
                            // tnt_infostrates fix for hidden inputs
                            if (input.up('#tnt_cp')) {
                                return;
                            }
                            // subscribepro fix for hidden inputs
                            if (input.up('#payment_form_subscribe_pro')) {
                                return;
                            }
                        }

                        var key;
                        if (input.id && input.id.length && input.id.indexOf(' ') === -1) {
                            key = '#' + input.id;
                        } else if (input.name && input.name.length) {
                            if (input.hasClassName('qty')) {
                                // fix to prevent cart qty restore in case of some validation error
                                return;
                            }
                            key = '[name="' + input.name + '"]';
                        } else {
                            return;
                        }

                        if (typeof iterators[key] === 'undefined') {
                            iterators[key] = 0;
                        }
                        iterators[key]++;

                        if ($$(key).length > 1) {
                            key += ':nth-child(' + iterators[key] + ')';
                        }

                        if ('radio' == input.type || 'checkbox' == input.type) {
                            data[key] = input.checked;
                        } else {
                            data[key] = input.getValue();
                        }
                    });

                    el.update(response.update_section[i]).removeClassName('updating');

                    if (i == 'coupon-discount' || i == 'giftcard') {
                        continue;
                    }

                    for (var j in data) {
                        if (!j) {
                            continue;
                        }
                        var input = el.down(j);
                        if (input) {
                            if ('radio' == input.type || 'checkbox' == input.type) {
                                input.checked = data[j];
                            } else {
                                input.setValue(data[j]);
                            }
                        }
                    }
                }

                if (i === 'shipping-method' && typeof shippingMethod !== 'undefined') {
                    shippingMethod.addObservers();
                } else if (i === 'review') {
                    this.addCartObservers();
                }
            }
        }

        if (response.method) {
            if ('centinel' == response.method) {
                this.showCentinel();
            } else if (0 === response.method.indexOf('billsafe')) {
                lpg.open();
                var form = $('firecheckout-form');
                form.action = BILLSAFE_FORM_ACTION;
                form.submit();
            }

            // SagePay Server Integration
            // else if ('sagepayserver' === response.method) {
            //     var revertStyles = function(el) {
            //         el.setStyle({
            //             height: '500px'
            //         });
            //     };
            //     $('sage-pay-server-iframe').observe('load', function() {
            //         $$('.d-sh-tl, .d-sh-tr').each(function(el) {
            //             el.setStyle({
            //                 height: 'auto'
            //             });
            //             revertStyles.delay(0.03, el);
            //         });
            //     });
            //     sgps_placeOrder();
            // }
            // End of SagePay Server Integration
        }

        if (response.popup) {
            this.showPopup(response.popup);
        } else if (response.afterform) {
            $('firecheckout-form').insert({
                after: response.afterform.content
            });
        } else if (response.body) {
            $(document.body).insert({
                'bottom': response.body.content
            });
        }

        $(this.form).select('.updating').invoke('removeClassName', 'updating');
        checkout.setLoadWaiting(false);
        checkout.setLoadingButton($$('button.btn-checkout')[0], false);

        document.fire('firecheckout:setResponseAfter', {
            serverResponse: serverResponse,
            response: response,
            url: responseUrl
        });

        return false;
    },

    showPopup: function(popup) {
        var id = 'firecheckout-window-' + popup.id,
            cnt = $(id);
        if (!cnt) {
            cnt = new Element('div');
            cnt.writeAttribute('id', id);
            cnt.hide();
        }
        cnt.update(popup.content);


        if (popup.window) {
            var wnd = new FC.Window(popup.window);
        } else {
            var wnd = firecheckoutWindow;
        }

        var oldContent = wnd.content.down();
        oldContent && $(document.body).insert(oldContent.hide());
        wnd.update(cnt)
            .setModal(popup.modal)
            .show();
    },

    showCentinel: function() {
        var oldContent = firecheckoutWindow.content.down();
        oldContent && $(document.body).insert(oldContent.hide());
        firecheckoutWindow
            .update($('checkout-centinel-iframe-load').show())
            .show();
    },

    addCartObservers: function() {
        fireCart.initialize();
    },

    gotoSection: function(){},
    reloadProgressBlock: function(){}
};

// billing
var Billing = Class.create();
Billing.prototype = {
    save: function() {
        checkout.update(checkout.urls.billing_address);
    },

    initialize: function(){
        var self = this;

        var functions = {};
        var _fields = FC.Ajax.getSaveTriggers('billing', 'shipping'),
            fields = [];
        // clean duplicates
        _fields.each(function(selector) {
            var s = selector.replace(/shipping/g, 'billing');
            var skip = fields.detect(function(_selector) {
                return _selector === s;
            });
            if (!skip) {
                fields.push(selector);
            }
        });
        fields.concat(['billing-address-select']).each(function(selector) {
            selector = selector.replace(/shipping/g, 'billing');
            if (selector === 'billing:street') {
                selector = '[name="billing[street][]"]';
            }

            if (selector[0].match(/[a-zA-Z0-9_]/)) {
                field = $(selector);
                if (field) {
                    field = [field];
                } else {
                    field = [];
                }
            } else {
                field = $$(selector);
            }
            if (field.length) {
                field.each(function(_field) {
                    _field.observe('change', function() {
                        var sections,
                            sameAsBilling = $('shipping:same_as_billing');

                        if (!sameAsBilling || (sameAsBilling && sameAsBilling.checked)) {
                            sections = FC.Ajax.getSectionsToUpdate('billing', 'shipping');
                        } else {
                            sections = FC.Ajax.getSectionsToUpdate('billing');
                        }

                        if (functions[_field.id]) {
                            functions[_field.id]();
                        }
                        if (sections.length) {
                            // give some time to update another fields in case
                            // of some autocompleter
                            checkout.saveField.bind(checkout).delay(
                                0.2,
                                _field,
                                checkout.urls.billing_address,
                                FC.Ajax.arrayToJson(sections),
                                checkout.setLoadingField.bind(checkout, _field, false)
                            );
                        }
                    });
                });
            }
        });

        // TIG_PostNL
        // if ($('virtual:billing:street2')) {
        //     $('virtual:billing:street2').observe('change', function() {
        //         var sections,
        //             sameAsBilling = $('shipping:same_as_billing');

        //         if (!sameAsBilling || (sameAsBilling && sameAsBilling.checked)) {
        //             sections = FC.Ajax.getSectionsToUpdate('billing', 'shipping');
        //         } else {
        //             sections = FC.Ajax.getSectionsToUpdate('billing');
        //         }

        //         if (sections.length) {
        //             checkout.update.bind(checkout).delay(
        //                 0.1,
        //                 checkout.urls.billing_address,
        //                 FC.Ajax.arrayToJson(sections)
        //             );
        //         }
        //     });
        // }
        // TIG_PostNL

        var createAccount = $('billing:register_account');
        this.setCreateAccount(createAccount ? createAccount.checked : 1); // create account if checkbox is missing

        if ($('billing-address-select') && $('billing-address-select').getValue()) {
            $('billing-address').removeClassName('fc-new-address');
            $('billing-address').addClassName('fc-saved-address');
        }
    },

    newAddress: function(isNew){
        if (isNew) {
            this.resetSelectedAddress();
            $('billing-address').removeClassName('fc-saved-address');
            $('billing-address').addClassName('fc-new-address');
            Element.show('billing-new-address-form');
        } else {
            $('billing-address').removeClassName('fc-new-address');
            $('billing-address').addClassName('fc-saved-address');
            Element.hide('billing-new-address-form');
        }
    },

    resetSelectedAddress: function(){
        var selectElement = $('billing-address-select');
        if (selectElement) {
            selectElement.value='';
        }
        var form = $('billing-new-address-form');
        if (form) {
            form.select('input[type="text"], select, textarea').each(function(el) {
                if (el.id.indexOf('country_id') > -1 || el.id.indexOf('region_id') > -1) {
                    // keep default values in the country and state elements
                    return;
                }
                el.setValue('');
                FC.Utils.fireEvent(el, 'change');
            });
        }
    },

    setCreateAccount: function(flag) {
        var password = $('register-customer-password'),
            confirmPassword = $$('.field-confirm-password').first();
        if (flag) {
            if (password) {
                password.removeClassName('fc-pw-hidden');
                password.select('input').each(function(el) {
                    el.tabIndex = 0;
                    el.addClassName('required-entry');
                });
                $('billing:customer_password').addClassName('validate-password');
                $('billing:confirm_password').addClassName('validate-cpassword');
            }
            if (confirmPassword) {
                $('billing:confirm_password').enable();
            }
            $(document.body).fire('login:setMethod', {method : 'register'});
        } else {
            if (password) {
                password.addClassName('fc-pw-hidden');
                password.select('input').each(function(el) {
                    el.tabIndex = -1;
                    el.removeClassName('required-entry');
                });
                password.select('.validation-advice').invoke('remove');
                $('billing:customer_password').removeClassName('validate-password');
                $('billing:confirm_password').removeClassName('validate-cpassword');
            }
            if (confirmPassword) {
                $('billing:confirm_password').disable();
            }
            $(document.body).fire('login:setMethod', {method : 'guest'});
        }
    }
};

// shipping
var Shipping = Class.create();
Shipping.prototype = {
    save: function() {
        checkout.update(checkout.urls.shipping_address);
    },

    initialize: function(form) {
        this.form = form;

        var input = $$('[name="billing[use_for_shipping]"]:checked').first();
        this.currentUseForShippingValue = input ? input.getValue() : 1;

        var functions = {};
        var fields = FC.Ajax.getSaveTriggers('shipping');
        fields.concat(['shipping-address-select']).each(function(selector) {
            if (selector === 'shipping:street') {
                selector = '[name="shipping[street][]"]';
            }

            if (selector[0].match(/[a-zA-Z0-9_]/)) {
                field = $(selector);
                if (field) {
                    field = [field];
                } else {
                    field = [];
                }
                // if (relatedFields[selector]) {
                //     var relatedField = $(relatedFields[selector]);
                //     if (relatedField) {
                //         field.push(relatedField);
                //     }
                // }
            } else {
                field = $$(selector);
            }
            if (field.length) {
                field.each(function(_field) {
                    _field.observe('change', function() {
                        if (functions[_field.id]) {
                            functions[_field.id]();
                        }
                        if ($('shipping:same_as_billing') && $('shipping:same_as_billing').checked) {
                            return;
                        }
                        var sections = FC.Ajax.getSectionsToUpdate('shipping');
                        if (sections.length) {
                            // give some time to update another fields in case
                            // of some autocompleter
                            checkout.saveField.bind(checkout).delay(
                                0.2,
                                _field,
                                checkout.urls.shipping_address,
                                FC.Ajax.arrayToJson(sections),
                                checkout.setLoadingField.bind(checkout, _field, false)
                            );
                        }
                    });
                });
            }
        });

        // TIG_PostNL
        // if ($('virtual:shipping:street2')) {
        //     $('virtual:shipping:street2').observe('change', function() {
        //         var sections = FC.Ajax.getSectionsToUpdate('shipping');
        //         if (sections.length) {
        //             checkout.update.bind(checkout).delay(
        //                 0.1,
        //                 checkout.urls.shipping_address,
        //                 FC.Ajax.arrayToJson(sections)
        //             );
        //         }
        //     });
        // }
        // TIG_PostNL

        if ($('shipping-address-select') && $('shipping-address-select').getValue()) {
            $('shipping-address').removeClassName('fc-new-address');
            $('shipping-address').addClassName('fc-saved-address');
        }
    },

    newAddress: function(isNew) {
        if (isNew) {
            this.resetSelectedAddress();
            $('shipping-address').removeClassName('fc-saved-address');
            $('shipping-address').addClassName('fc-new-address');
            Element.show('shipping-new-address-form');
        } else {
            $('shipping-address').removeClassName('fc-new-address');
            $('shipping-address').addClassName('fc-saved-address');
            Element.hide('shipping-new-address-form');
        }
    },

    resetSelectedAddress: function() {
        var selectElement = $('shipping-address-select');
        if (selectElement) {
            selectElement.value = '';
        }
        var form = $('shipping-new-address-form');
        if (form) {
            form.select('input[type="text"], select, textarea').each(function(el) {
                if (el.id.indexOf('country_id') > -1 || el.id.indexOf('region_id') > -1) {
                    // keep default values in the country and state elements
                    return;
                }
                el.setValue('');
                FC.Utils.fireEvent(el, 'change');
            });
        }
    },

    setSameAsBilling: function(flag, dontSyncTheRadios) {
        $('shipping:same_as_billing').checked = flag;
        if (!dontSyncTheRadios) {
            // Wyomind_Pickupatstore radio integration @see billing.phtml
            $('billing:use_for_shipping_no').checked = !flag;
            $('billing:use_for_shipping_yes').checked = flag;
        }
        // this.syncWithBilling();

        if (FC.Ajax.getSaveTriggers('shipping') && typeof checkout !== 'undefined') {
            var url = flag ? checkout.urls.billing_address : checkout.urls.shipping_address,
                sections = FC.Ajax.getSectionsToUpdate('shipping');

            if (sections.length) {
                checkout.update(url, FC.Ajax.arrayToJson(sections));
            }
        }

        if (flag) {
            $('shipping-address').hide();
        } else {
            $('shipping-address').show();

            // crafty clicks fix
            if (typeof _cp_instances !== 'undefined' && _cp_instances.length) {
                var el = $('shipping:country_id');
                if (el) {
                    if (document.createEvent) {
                        var oEvent = document.createEvent("HTMLEvents");
                        oEvent.initEvent('change', true, true);
                        el.dispatchEvent(oEvent);
                    } else {
                        var oEvent = document.createEventObject();
                        el.fireEvent('onchange', oEvent);
                    }
                }
            }
            // crafty clicks fix
        }

        // Wyomind_Pickupatstore integration
        // @see wyomind_puckupatstore.js
        var input = $$('[name="billing[use_for_shipping]"]:checked').first();
        var previousUseForShippingValue = this.currentUseForShippingValue,
            currentUseForShippingValue  = input ? input.getValue() : 1;

        document.fire('firecheckout:setSameAsBillingAfter', {
            flag: flag,
            previousUseForShippingValue : previousUseForShippingValue,
            currentUseForShippingValue  : currentUseForShippingValue
        });

        this.currentUseForShippingValue = currentUseForShippingValue;
    },

    syncWithBilling: function () {
        $('billing-address-select') && this.newAddress(!$('billing-address-select').value);
        if (!$('billing-address-select') || !$('billing-address-select').value) {
            arrElements = $('shipping-address').select('input,select');
            for (var elemIndex in arrElements) {
                if (arrElements[elemIndex].id) {
                    var sourceField = $(arrElements[elemIndex].id.replace(/^shipping:/, 'billing:'));
                    if (sourceField){
                        arrElements[elemIndex].value = sourceField.value;
                    }
                }
            }
            //$('shipping:country_id').value = $('billing:country_id').value;
            shippingRegionUpdater.update();
            $('shipping:region_id').value = $('billing:region_id').value;
            $('shipping:region').value = $('billing:region').value;
            //shippingForm.elementChildLoad($('shipping:country_id'), this.setRegionValue.bind(this));
        } else {
            $('shipping-address-select').value = $('billing-address-select').value;
        }
    },

    setRegionValue: function(){
        $('shipping:region').value = $('billing:region').value;
    }
};

// shipping method
var ShippingMethod = Class.create();
ShippingMethod.prototype = {
    initialize: function() {
        this.form = 'firecheckout-form';
        this.addObservers();
    },

    save: function() {
        // infostrates tnt dummy
    },

    reset: function() {
        $$('input[name="shipping_method"]').each(function(el) {
            el.checked = '';
        });
        var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
        if (sections.length) {
            sections.push('remove-shipping');
            checkout.update(
                checkout.urls.shipping_method,
                FC.Ajax.arrayToJson(sections)
            );
        }
    },

    addObservers: function() {
        var self = this;

        this.setCheckedRadios(); // fix for "hide other shipping methods if free is in the list"

        $$('input[name="shipping_method"]').each(function(el) {
            el.observe('click', function() {
                document.fire('firecheckout:shippingMethod:clickBefore', {
                    el: el
                });

                var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
                if (sections.length) {
                    checkout.update(
                        checkout.urls.shipping_method,
                        FC.Ajax.arrayToJson(sections)
                    );
                }

                /* Storepickup integration */
                var storepickupBox = $('free-location-box');
                if (storepickupBox) {
                    if ('storepickup_storepickup' == this.value) {
                        storepickupBox.show();
                    } else {
                        storepickupBox.hide();
                    }
                }
                /* Storepickup integration */

                /* Relaypoint integration */
                var relaypointBox = $("relaypoint");
                if (relaypointBox) {
                    if ('relaypoint_relaypoint' == this.value) {
                        relaypointBox.show();
                    } else {
                        relaypointBox.hide();
                    }
                }
                /* Relaypoint integration */

                /* Delivery Date */
                if (typeof deliveryDate == 'object') {
                    deliveryDate.toggleDisplay(this.value);
                }
                /* Delivery Date */

                /* Infostrates TNT */
                if (-1 !== this.value.indexOf('tnt_') && typeof radioCheck !== 'undefined') {
                    radioCheck();
                }
                /* Infostrates TNT */
            });
        });

        if ($('shipping-method-reset')) {
            $('shipping-method-reset').stopObserving('click');
            $('shipping-method-reset').observe('click', function() {
                self.reset();
            });
        }

        /* Storepickup integration */
        var storepickupRadio = $('s_method_storepickup_storepickup');
        if (storepickupRadio) {
            if (storepickupRadio.checked) {
                $('free-location-box').show();
            } else {
                $('free-location-box').hide();
            }
        }
        /* Storepickup integration */

        /* Relaypoint integration */
        var relaypointRadio = $('s_method_relaypoint_relaypoint');
        if (relaypointRadio) {
            if (relaypointRadio.checked) {
                $("relaypoint").show();
            } else {
                $("relaypoint").hide();
            }
        }
        /* Relaypoint integration */

        /* uSplitRates Unirgy integration */
        $$('.shipment-methods').each(function(el) {
            el.observe('change', function() {
                var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
                if (sections.length) {
                    checkout.update(
                        checkout.urls.shipping_method,
                        FC.Ajax.arrayToJson(sections)
                    );
                }
            });
        });
        /* uSplitRates Unirgy integration */

        /* Delivery Date */
        if (typeof deliveryDate == 'object') {
            deliveryDate.toggleDisplay();
        }
        /* Delivery Date */

        /* MageWorx Multifees */
        $$('.multifees-shipping-fee').each(function(el) {
            el.select('input[type="checkbox"]').each(function(el) {
                el.stopObserving('change');
                el.observe('change', function(e) {
                    firecheckoutMultifees(this);
                });
            });
        });
        /* MageWorx Multifees */

        /* Aitoc_Aitgiftwrap */
        var giftwrap = $('gift_wrap');
        if (giftwrap) {
            giftwrap.observe('click', function() {
                var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
                if (sections.length) {
                    checkout.update(
                        checkout.urls.shipping_method,
                        FC.Ajax.arrayToJson(sections)
                    );
                }
            });
        }
        /* Aitoc_Aitgiftwrap */

        /* EE Giftwrap */
        document.observe('dom:loaded', function() {
            var giftwrap = $('onepage-checkout-shipping-method-additional-load');
            var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
            if (giftwrap && sections.length) {
                var giftOptions = giftwrap.select('select');
                giftOptions.each(function(el) {
                    el.observe('change', function() {
                        checkout.update(checkout.urls.shipping_method, {
                            review: 1
                        });
                    });
                });
                if (giftOptions.length) {
                    checkout.update(checkout.urls.shipping_method, {
                        review: 1
                    });
                }
                var giftToggles = giftwrap.select('input[type="checkbox"]');
                giftToggles.each(function(el) {
                    el.observe('click', function() {
                        if (this.checked) {
                            return;
                        }
                        checkout.update(checkout.urls.shipping_method, {
                            review: 1
                        });
                    });
                });
            }
        });
        /* EE Giftwrap */

        document.body.fire('firecheckout:shippingMethod:addObserversAfter');
    },

    setCheckedRadios: function() {
        $$('[name="shipping_method"]').each(function(el) {
            if (!el.hasAttribute('checked') || el.readAttribute('checked') === false) {
                el.checked = false;
                return;
            }
            el.checked = 'checked';
            el.writeAttribute('checked', 'checked');
        });
    },

    getCurrentMethod: function() {
        var input = $$('input[name="shipping_method"]').find(function(el) {
            return el.checked;
        });
        if (input) {
            return input.value;
        }
        return '';
    },

    validate: function() {
        FC.Messenger.clear('checkout-shipping-method-load');
        var methods = document.getElementsByName('shipping_method');
        if (methods.length==0) {
            FC.Messenger.add(
                Translator.translate('Your order cannot be completed at this time as there is no shipping methods available for it. Please make necessary changes in your shipping address.'),
                'checkout-shipping-method-load',
                'error'
            );
            return false;
        }

        /* Relaypoint integration */
        if (typeof updateshipping == 'function' && typeof relaypointUpdateShippingUrl != 'undefined') {
            if (false === updateshipping(relaypointUpdateShippingUrl)) {
                return false;
            }
        }
        /* Relaypoint integration */

        for (var i=0; i<methods.length; i++) {
            if (methods[i].checked) {
                return true;
            }
        }
        FC.Messenger.add(
            Translator.translate('Please specify shipping method.'),
            'checkout-shipping-method-load',
            'error'
        );
        return false;
    }
};

// payment
var Payment = Class.create();
Payment.prototype = {
    beforeInitFunc:$H({}),
    afterInitFunc:$H({}),
    beforeValidateFunc:$H({}),
    afterValidateFunc:$H({}),
    initialize: function(container){
        this.cnt = container;
        this.form = 'firecheckout-form';
    },

    save: function() {
        // dummy for phoenix/ipayment
        checkout.setLoadWaiting(false);
        checkout.save('', true); // do not call for ipayment methods anymore
    },

    onSave: function() {
        checkout.setLoadWaiting(false);
        checkout.save('', true);
    },

    onComplete: function() {
        // dummy for payone
    },

    addObservers: function() {
        var self = this;

        if ($('payment-method-reset')) {
            $('payment-method-reset').stopObserving('click');
            $('payment-method-reset').observe('click', function() {
                $$('input[name="payment[method]"]').each(function(el) {
                    el.checked = '';
                });
                self.switchMethod();
                var sections = FC.Ajax.getSectionsToUpdate('payment-method');
                if (sections.length) {
                    sections.push('payment[remove]');
                    checkout.update(
                        checkout.urls.payment_method,
                        FC.Ajax.arrayToJson(sections)
                    );
                }
            });
        }


        $$('input[name="payment[method]"]').each(function(el) {
            el.observe('click', function() {
                var sections = FC.Ajax.getSectionsToUpdate('payment-method');
                if (sections.length) {
                    checkout.update(
                        checkout.urls.payment_method,
                        FC.Ajax.arrayToJson(sections)
                    );
                }
                if ('p_method_sagepayserver' != this.id) {
                    $("checkout-sagepay-iframe-load").hide();
                }
            });
        });

        /* MageWorx Multifees */
        $$('.multifees-payment-fee').each(function(el) {
            el.select('input[type="checkbox"]').each(function(el) {
                el.observe('change', function(e) {
                    firecheckoutMultifees(this);
                });
            });
        });
        /* MageWorx Multifees */

        document.body.fire('firecheckout:paymentMethod:addObserversAfter');
    },

    addBeforeInitFunction : function(code, func) {
        this.beforeInitFunc.set(code, func);
    },

    beforeInit : function() {
        this.addObservers();
        (this.beforeInitFunc).each(function(init){
           (init.value)();
        });

        var parentDiv = $(this.cnt).down('#checkout-payment-method-load');
        if ($$('input[name="payment[method]"]').length === 1) {
            parentDiv.addClassName('fc-single-option');
        } else {
            parentDiv.removeClassName('fc-single-option');
        }
    },

    init : function () {
        this.beforeInit();

        var parentDiv = $(this.cnt).down('#checkout-payment-method-load .sp-methods'),
            elements, method = null;

        if (parentDiv) {
            elements = parentDiv.select('input', 'select', 'textarea');
            for (var i=0; i<elements.length; i++) {
                if (elements[i].name=='payment[method]') {
                    if (elements[i].checked/* || i == 0*/) {
                        method = elements[i].value;
                    }
                } else {
                    elements[i].disabled = true;
                }
                elements[i].setAttribute('autocomplete','off');
            }
        }
        if (method) this.switchMethod(method);

        this.afterInit();
    },

    addAfterInitFunction : function(code, func) {
        this.afterInitFunc.set(code, func);
    },

    afterInit : function() {
        this.initWhatIsCvvListeners();

        // update currentMethod, if it's not available in radios (Mymonki_Ship2pay compatibility)
        this.paymentOutdatedFlag = false;
        if (this.currentMethod !== this.getCurrentMethod()) {
            this.currentMethod = this.getCurrentMethod();
            this.paymentOutdatedFlag = true;
        }

        (this.afterInitFunc).each(function(init){
            (init.value)();
        });

        document.body.fire('firecheckout:paymentMethod:afterInitAfter');
    },

    switchMethod: function(method){
        var hideOldForm = true;
        if (method === 'customercredit') {
            hideOldForm = false;
            el = $('p_method_customercredit');
            if (!el || !el.checked) {
                method = '';
            }
        }

        var elementTypes = ['input', 'select', 'textarea'];

        if (hideOldForm && this.currentMethod && $('payment_form_'+this.currentMethod + '_preencrypt')) {
            this.changeVisible(this.currentMethod + '_preencrypt', true);
        }

        if (hideOldForm && this.currentMethod && $('payment_form_'+this.currentMethod)) {
            this.changeVisible(this.currentMethod, true);
            $('payment_form_'+this.currentMethod).fire('payment-method:switched-off', {method_code : this.currentMethod});
        }

        if ($('payment_form_'+method) || $('payment_form_' + method + '_preencrypt')) {
            if ($('payment_form_'+method)) {
                this.changeVisible(method, false);
                $('payment_form_'+method).fire('payment-method:switched', {method_code : method});
            } else {
                this.changeVisible(method + '_preencrypt', false);
            }
        } else {
            //Event fix for payment methods without form like "Check / Money order"
            $(document.body).fire('payment-method:switched', {method_code : method});
        }

        if (method) {
            this.lastUsedMethod = method;
        }
        if (hideOldForm) {
            this.currentMethod = method;
        }

        if (typeof MultiFees !== 'undefined') {
            MultiFees.showPayment();
        }
    },

    getCurrentMethod: function() {
        var input = $$('input[name="payment[method]"]').find(function(el) {
            return el.checked;
        });
        if (input) {
            return input.value;
        }
        return '';
    },

    changeVisible: function(method, mode) {
        var block = 'payment_form_' + method;
        [block + '_before', block, block + '_after'].each(function(el) {
            element = $(el);
            if (element) {
                element.style.display = (mode) ? 'none' : '';
                element.select('input', 'select', 'textarea', 'button').each(function(field) {
                    field.disabled = mode;
                });
            }
        });
    },

    addBeforeValidateFunction : function(code, func) {
        this.beforeValidateFunc.set(code, func);
    },

    beforeValidate : function() {
        var validateResult = true;
        var hasValidation = false;
        (this.beforeValidateFunc).each(function(validate){
            hasValidation = true;
            if ((validate.value)() == false) {
                validateResult = false;
            }
        }.bind(this));
        if (!hasValidation) {
            validateResult = false;
        }
        return validateResult;
    },

    validate: function() {
        FC.Messenger.clear('checkout-payment-method-load');
        var result = this.beforeValidate();
        if (result) {
            return true;
        }
        var methods = document.getElementsByName('payment[method]');
        if (methods.length==0) {
            FC.Messenger.add(
                Translator.translate('Your order cannot be completed at this time as there is no payment methods available for it.'),
                'checkout-payment-method-load',
                'error'
            );
            return false;
        }
        for (var i=0; i<methods.length; i++) {
            if (methods[i].checked) {
                return true;
            }
        }
        result = this.afterValidate();
        if (result) {
            return true;
        }
        FC.Messenger.add(
            Translator.translate('Please specify payment method.'),
            'checkout-payment-method-load',
            'error'
        );
        return false;
    },

    addAfterValidateFunction : function(code, func) {
        this.afterValidateFunc.set(code, func);
    },

    afterValidate : function() {
        var validateResult = true;
        var hasValidation = false;
        (this.afterValidateFunc).each(function(validate){
            hasValidation = true;
            if ((validate.value)() == false) {
                validateResult = false;
            }
        }.bind(this));
        if (!hasValidation) {
            validateResult = false;
        }
        return validateResult;
    },

    initWhatIsCvvListeners: function(){
        $$('.cvv-what-is-this').each(function(element){
            Event.observe(element, 'click', toggleToolTip);
        });
    }
};

var Review = Class.create();
Review.prototype = {
    initialize: function(saveUrl, successUrl, agreementsForm){
        this.saveUrl = saveUrl;
        this.successUrl = successUrl;
        this.agreementsForm = agreementsForm;
        this.onSave = this.nextStep.bindAsEventListener(this);
        this.onComplete = this.resetLoadWaiting.bindAsEventListener(this);
    },

    validate: function() {
        var isValid = true;

        FC.Messenger.clear('agreements-wrapper');
        $$('.checkout-agreements input[type="checkbox"]').each(function(el) {
            if (!el.checked) {
                FC.Messenger.add(
                    checkout.translations.acceptAgreementText,
                    'agreements-wrapper',
                    'error'
                );
                isValid = false;
                throw $break;
            }
        }.bind(this));

        return isValid;
    },

    save: function(){
        checkout.save();
    },

    resetLoadWaiting: function(transport){
        checkout.setLoadWaiting(false);
    },

    nextStep: function(transport) {
        checkout.setResponse(transport);
    },

    isSuccess: false
};

FireCheckout.isIE9 = function() {
    return Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 9;
};

Function.prototype.firecheckoutInterceptor = function(fcn, scope) {
    var method = this;
    return (typeof fcn !== 'function') ?
        this :
        function() {
            var me   = this,
                args = arguments;
            fcn.target = me;
            fcn.method = method;
            return (fcn.apply(scope || me || window, args) !== false) ?
                method.apply(me || window, args) :
                null;
        };
};

// backwards compatibility
FC.fireEvent = FC.Utils.fireEvent;
FireCheckout.AddressVerification = FC.AddressVerification;
FireCheckout.Ajax = FC.Ajax;
FireCheckout.Cart = FC.Cart;
FireCheckout.DeliveryDate = FC.DeliveryDate;
FireCheckout.DependentFields = FC.DependentFields;
FireCheckout.Housenumber = FC.Housenumber;
FireCheckout.Messenger = FC.Messenger;
FireCheckout.OrderReview = FC.OrderReview;
FireCheckout.Taxvat = FC.Taxvat;
FireCheckout.Window = FC.Window;
