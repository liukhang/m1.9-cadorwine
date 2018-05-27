var FC = FC || {};
FC.FormfillWatcher = Class.create();
FC.FormfillWatcher.prototype = {

    className: 'filled',

    /**
     * @param  {DomElement} section DOM Element
     * @param  {Object}     options Config Objects
     */
    initialize: function(section, options) {
        section.addClassName('formfill-section');
        this.section = section;
        this.config = Object.extend({
            fields: {
                all: '.required-entry',
                one: ''
            },
            triggers: 'input[type="checkbox"],input[type="radio"]'
        }, options || {});

        this.addObservers();
        this.handleCompleteness();

        section.formfillWatcher = this;
    },

    addObservers: function() {
        var self = this,
            selector = [self.config.fields.all, self.config.fields.one]
                .filter(function(s) { return s ? true : false; })
                .join(', ');

        // need to check it periodically because of ajax updates
        setInterval(this.handleCompleteness.bind(this), 300);

        // No need to use event delegation because we use periodical check above

        // self.section.observe('change', function(e) {
        //     if (e.target && e.target.matches && e.target.matches(selector)) {
        //         self.handleCompleteness.bind(self).delay(0.2);
        //     }
        // });

        // self.section.observe('click', function(e) {
        //     if (e.target && e.target.matches && e.target.matches(self.config.triggers)) {
        //         self.handleCompleteness.bind(self).delay(0.2);
        //     }
        // });
    },

    handleCompleteness: function() {
        if (this.isCompleted()) {
            this.section.addClassName(this.className);
        } else {
            this.section.removeClassName(this.className);
        }
    },

    isCompleted: function() {
        var self = this,
            result = true,
            elements;

        // check required elements
        // if none found - section is filled
        if (self.config.fields.all &&
            (elements = self.section.select(self.config.fields.all)) &&
            elements.length) {

            elements
                .filter(function(el) { return el.offsetParent !== null; })
                .each(function(el) {
                    if (el.type === 'radio' && !el.checked) {
                        result = false;
                        throw $break;
                    }

                    if (!el.value || el.hasClassName('validation-failed')) {
                        result = false;
                        throw $break;
                    }
                });

            if (!result) {
                return false;
            }
        }

        // check at least one required element
        // if none found - section is not filled
        if (self.config.fields.one) {
            elements = self.section.select(self.config.fields.one);

            if (!elements.length) {
                result = false; // no required elements found on the page
            } else {
                // if elements are invisible - user can't interact with them,
                // thus we don't need to validate them
                elements = elements.filter(function(el) {
                    return el.offsetParent !== null;
                });

                if (elements.length) {
                    result = false;
                    elements.each(function(el) {
                        if (el.type === 'radio' || el.type === 'checkbox') {
                            if (el.checked) {
                                result = true;
                                throw $break;
                            }
                        } else if (el.value && !el.hasClassName('validation-failed')) {
                            result = true;
                            throw $break;
                        }
                    });
                }
            }

            if (!result) {
                return false;
            }
        }

        // check depends
        if (self.config.depends) {
            $$(self.config.depends).each(function(section) {
                if (!section.hasClassName(self.className)) {
                    result = false;
                    throw $break;
                }
            })
        }

        return result;
    }
};

document.observe('dom:loaded', function() {
    var sections = {
        '#email-section': {},
        '#billing-address': {},
        '#shipping-address': {},
        '#shipping-method': {
            fields: {
                all: '.required-entry',
                one: 'input[name="shipping_method"]'
            },
            triggers: '#shipping-method-reset'
        },
        '#payment-method': {
            fields: {
                all: '.required-entry, #ccsave_cc_number',
                one: 'input[name="payment[method]"]'
            },
            triggers: '#payment-method-reset'
        },
        '#checkout-review': {
            depends: '#email-section, #billing-address, #shipping-address, #shipping-method, #payment-method'
        }
    };

    setTimeout(function() {
        for (var selector in sections) {
            var section = $$(selector)[0];
            if (!section) {
                continue;
            }
            new FC.FormfillWatcher(section, sections[selector]);
        }
    }, 200);
});
