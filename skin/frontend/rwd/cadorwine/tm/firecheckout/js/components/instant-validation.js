var FC = FC || {};
FC.InstantValidation = Class.create();
FC.InstantValidation.prototype = {
    options: {
        container: '#firecheckout-form',
        fields   : 'input,select,radio,checkbox,textarea'
    },

    initialize: function(options) {
        this.options = Object.extend(this.options, options || {});
        this.addObservers();
    },

    addObservers: function() {
        $$(this.options.container)
            .first()
            .select(this.options.fields)
            .each(function(el) {
                var tagName   = el.tagName.toLowerCase(),
                    eventName = 'change';

                if ('checkbox' === tagName || 'radio' === tagName) {
                    eventName = 'click';
                }

                el.observe(eventName, function() {
                    if (!this.canValidate(el)) {
                        return;
                    }
                    this.validate(el);
                }.bind(this));
            }.bind(this));
    },

    validate: function(el) {
        if (Validation.validate(el)) {
            this.getAdditionalFieldsToValidateOnSuccess(el).each(this.validateFirst.bind(this));
        }
        this.getAdditionalFieldsToValidate(el).each(this.validateFirst.bind(this));
    },

    validateFirst: function(selector) {
        var field = $$(selector).first();
        if (field && this.canValidate(field)) {
            Validation.validate(field);
        }
    },

    /**
     * Defines field validators requirements.
     *
     * Example:
     *     There is no need to validate credit card type, if cc_number is
     *     not available yet and so on..
     *
     * @param  {DOMElement} field
     * @return {boolean}
     */
    canValidate: function(field) {
        var rules = {
            'payment[cc_type]': ['[name=payment[cc_number]]'],
            'payment[cc_cid]' : ['[name=payment[cc_type]]'],
            'billing[day]'  : ['[name=billing[month]]', '[name=billing[year]]'],
            'billing[month]': ['[name=billing[day]]', '[name=billing[year]]'],
            'billing[year]' : ['[name=billing[day]]', '[name=billing[month]]'],
            'payment[payolution_dob_day]'  : ['[name=payment[payolution_dob_month]]', '[name=payment[payolution_dob_year]]'],
            'payment[payolution_dob_month]': ['[name=payment[payolution_dob_day]]', '[name=payment[payolution_dob_year]]'],
            'payment[payolution_dob_year]' : ['[name=payment[payolution_dob_day]]', '[name=payment[payolution_dob_month]]']
        };
        if (!rules[field.name]) {
            return true;
        }

        var form = $$(this.options.container).first(),
            result = true;
        if (field.name.indexOf('payment') !== -1) {
            form = $('payment_form_' + payment.getCurrentMethod());
            if (!form) {
                return result;
            }
        }

        rules[field.name].each(function(selector) {
            var field = form.down(selector);
            if (field && !field.getValue()) {
                result = false;
                throw $break;
            }
        });
        return result;
    },

    /**
     * Defines dependencies between fields validators.
     *
     *  Example:
     *      When cc number is changed we should validate cc_type as well.
     *
     * @param  {DOMElement} field
     * @return {array}      Array of dependent field selectors
     */
    getAdditionalFieldsToValidateOnSuccess: function(field) {
        var linkedFields = {
            'payment[cc_number]': ['[name=payment[cc_type]]']
        };
        if (!linkedFields[field.name]) {
            return [];
        }
        return linkedFields[field.name];
    },

    /**
     * Sometimes another fields should be validated each time after some field
     * was updated. This function defines those relations.
     *
     * @param  {DOMElement} field [description]
     * @return array
     */
    getAdditionalFieldsToValidate: function(field) {
        var linkedFields = {
            'billing[day]'  : ['[name=billing[month]]', '[name=billing[year]]'],
            'billing[month]': ['[name=billing[day]]', '[name=billing[year]]'],
            'billing[year]' : ['[name=billing[day]]', '[name=billing[month]]'],
            'payment[payolution_dob_day]'  : ['[name=payment[payolution_dob_month]]', '[name=payment[payolution_dob_year]]'],
            'payment[payolution_dob_month]': ['[name=payment[payolution_dob_day]]', '[name=payment[payolution_dob_year]]'],
            'payment[payolution_dob_year]' : ['[name=payment[payolution_dob_day]]', '[name=payment[payolution_dob_month]]']
        };
        if (!linkedFields[field.name]) {
            return [];
        }
        return linkedFields[field.name];
    }
};

document.observe('dom:loaded', function() {
    new FC.InstantValidation();
});
document.observe('firecheckout:setResponseAfter', function(e) {
    var response = e.memo.response;
    if (response.update_section) {
        for (var i in response.update_section) {
            if (!response.update_section.hasOwnProperty(i)) {
                continue;
            }

            var container = '#checkout-' + i + '-load',
                el = $('checkout-' + i + '-load');

            if (!el) {
                container = '.checkout-' + i + '-load';
                el = $$(container).first();
            }

            if (!el) {
                continue;
            }

            new FC.InstantValidation({
                container: container
            });
        }
    }
});
