var FC = FC || {};
FC.FormFieldManager = Class.create();
FC.FormFieldManager.prototype = {
    /**
     * Config example:
     * {
     *     'field-selector': {
     *         placeholder: string|boolean,
     *         label: string|boolean,
     *         type: string,
     *         inputmode: string|boolean,
     *         autocomplete: string|boolean,
     *         // Formatters. USE ONE PER FIELD ONLY!
     *         formatter: {
     *             pattern: '({{999}}) {{999}}.{{9999}}'
     *         },
     *         cleave: {
     *             numericOnly: true,
     *             blocks: [3, 3, 4],
     *             delimiters: ['-']
     *         }
     *     }
     * }
     *
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    initialize: function(rules) {
        this.rules = rules;
        this.processRules();
    },

    processRules: function(keys) {
        var keys = keys || [];
        for (selector in this.rules) {
            if (keys.length && keys.indexOf(selector) === -1) {
                continue;
            }

            var fields = $$(selector);
            if (!fields.length) {
                continue;
            }
            for (ruleName in this.rules[selector]) {
                var method = 'set' +
                    ruleName.substr(0, 1).toUpperCase() +
                    ruleName.substr(1);

                if (typeof this[method] === 'function') {
                    fields.each(function(field) {
                        this[method](field, this.rules[selector][ruleName]);
                    }.bind(this));
                }
            }
        }
    },

    setPlaceholder: function(field, placeholder) {
        if (placeholder) {
            field.writeAttribute('placeholder', placeholder);
        } else if (false === placeholder) {
            field.removeAttribute('placeholder');
        }
    },

    setType: function(field, type) {
        if (type) {
            field.writeAttribute('type', type);
        } else if (false === type) {
            field.removeAttribute('type');
        }
    },

    setInputmode: function(field, inputmode) {
        if (inputmode) {
            field.writeAttribute('inputmode', inputmode);
        } else if (false === inputmode) {
            field.removeAttribute('inputmode');
        }
    },

    setAutocomplete: function(field, autocomplete) {
        if (autocomplete) {
            field.writeAttribute('autocomplete', autocomplete);
        } else if (false === autocomplete) {
            field.removeAttribute('autocomplete');
        }
    },

    setLabel: function(field, text) {
        var wrapper = field.up(1),
            el = wrapper.down('label');

        if (text) {
            if (!el) {
                el = new Element('label');
                el.writeAttribute('for', field.id);
                if (field.hasClassName('required-entry')) {
                    el.addClassName('required');
                }
                wrapper.insert({
                    top: el
                });
            }
            el.update(text);
            if (el.hasClassName('required')) {
                el.insert({
                    top: '<em>*</em>'
                });
            }
        } else if (el && false === text) {
            el.hide();
        }
    },

    setFormatter: function(field, config) {
        new Formatter(field, config);
    },

    setCleave: function(field, config) {
        new Cleave(field, config);
    }
};
