var FC = FC || {};
FC.AddressUpdate = {
    response: null,
    url: null,
    fields: {},

    getAddressType: function() {
        if (this.response.address_update.type) {
            return this.response.address_update.type;
        }

        var addressType = 'billing';
        if (this.url.indexOf(checkout.urls.shipping_address) > -1) {
            addressType = 'shipping';
        }
        return addressType;
    },

    getAddressForm: function() {
        return $(this.getAddressType() + '-new-address-form');
    },

    getFieldsByAttributeCode: function(code, resetCache) {
        if (!resetCache && typeof this.fields[code] !== 'undefined') {
            return this.fields[code];
        }

        var addressType = this.getAddressType(),
            addressForm = this.getAddressForm(),
            mapping = {
                default: [
                    '#' + addressType + '\\:' + code
                ],
                street: [
                    '[name="' + addressType + '[street][]"]'
                ],
                region: [
                    '[name="' + addressType + '[region]"]'
                ],
                region_id: [
                    '[name="' + addressType + '[region_id]"]'
                ]
            };

        var self = this,
            selectors = mapping[code] ? mapping[code] : mapping.default;
        this.fields[code] = [];
        selectors.each(function(selector) {
            $$(selector).each(function(field) {
                if (field && field.visible()) { // visible check to fix region and region_id visibility
                    self.fields[code].push(field);
                }
            });
        });
        return self.fields[code];
    },

    getInvalidFields: function() {
        return this.response.address_update.invalid_fields;
    },

    prepareForm: function() {
        // Fill address form and hide all valid fields
        var formData = this.response.address_update.form_data,
            invalidFields = this.getInvalidFields();
        for (var key in formData) {
            if (!formData.hasOwnProperty(key)) {
                continue;
            }

            this.getFieldsByAttributeCode(key, true).each(function(field) {
                field.setValue(formData[key]);
                if (invalidFields[key]) {
                    field.up(1).addClassName('inline-form-visible');
                } else {
                    // hide valid field
                    field.addClassName('inline-form-field-hidden').hide();
                }
            });
        }
    },

    getTextForSaveButton: function() {
        if (this.url.indexOf(checkout.urls.save) > -1) {
            return $('checkout-review-submit').down('.btn-checkout').innerHTML;
        } else {
            return OnecolumnCheckout.currentStep.down('.next').innerHTML;
        }
    },

    getPopupTitle: function() {
        switch (this.getAddressType()) {
            case 'billing':
                return checkout.translations.updateBillingAddress;
            case 'shipping':
                return checkout.translations.updateShippingAddress;
        }
    },

    activate: function() {
        this.prepareForm();

        var addressForm = this.getAddressForm();
        var inlineAddressForm = new FC.Window({
            destroy: 1,
            markup: $('inline-address-form').innerHTML // @see scripts.phtml
                .replace(
                    '{{update_address_title}}',
                    this.getPopupTitle()
                ),
            size: {
                width: 450
            },
            listeners: {
                // put address back to the new-address-form
                hide: function() {
                    this.content
                        .select('.inline-form-visible')
                        .invoke('removeClassName', 'inline-form-visible');

                    this.content
                        .select('.inline-form-field-hidden')
                        .invoke('removeClassName', 'inline-form-field-hidden')
                        .invoke('show');

                    addressForm.insert(this.content.down('fieldset'));
                }
            },
            actionbar: {
                html:
                    '<div class="step-buttons-set">' +
                        '<button type="button" class="button btn-checkout btn-inline-form" id="inline-form-button">' +
                            this.getTextForSaveButton() +
                        '</button>' +
                    '</div>',
                el: 'inline-form-button',
                event: 'click',
                callback: function(e, id) {
                    e.stop();

                    // validate address popup
                    var validator = new FC.Validator(this.content);
                    if (!validator.validate()) {
                        return;
                    }

                    // put the address fields back to firecheckout form
                    this.hide();

                    checkout.update(checkout.urls.update_address, {
                        addressType: FC.AddressUpdate.getAddressType()
                    }, {
                        afterSetResponse: function(response) {
                            // Call the same method that triggers address update popup
                            if (FC.AddressUpdate.url.indexOf(checkout.urls.save) > -1) {
                                checkout.save('', true);
                            } else if (typeof OnecolumnCheckout !== 'undefined') {
                                FC.Utils.fireEvent(OnecolumnCheckout.currentStep.down('.next'), 'click');
                            }
                        }
                    });
                }
            }
        });
        inlineAddressForm
            .update(addressForm.down('fieldset'))
            .show();

        inlineAddressForm.content.select('input,select,textarea').each(function(el) {
            formFieldWatcher.handle(el);
        });
    }
};

document.observe('firecheckout:setResponseBefore', function(e) {
    var response = e.memo.response;
    if (!response.address_update) {
        return;
    }

    // supress all alerts
    delete e.memo.response.goto_section;
    delete e.memo.response.onecolumn_step;
    delete e.memo.response.error_messages;
    delete e.memo.response.message;
});

document.observe('firecheckout:setResponseAfter', function(e) {
    var response = e.memo.response,
        url = e.memo.url;
    if (!response.address_update) {
        return;
    }

    FC.AddressUpdate.response = response;
    FC.AddressUpdate.url = url;
    FC.AddressUpdate.activate();
});
