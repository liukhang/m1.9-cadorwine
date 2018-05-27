var FC = FC || {};
FC.Validator = Class.create();
FC.Validator.prototype = {
    options: {
        focusOnError: false // we will smoothly scroll to invalid element and then focus it
    },

    initialize: function(form, options) {
        this.validator = new Validation(
            form,
            Object.extend(this.options, options || {})
        );
        this.afterValidate = [];
    },

    validate: function() {
        var isValid = this.validator.validate();

        this.afterValidate.each(function(afterValidateFunc) {
            if (!afterValidateFunc()) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.scrollToError.bind(this).delay(0.1);
        }

        return isValid;
    },

    scrollToError: function() {
        var messages = $$('.validation-advice, .messages').findAll(function(el) {
            return el.innerHTML && el.visible();
        });
        if (!messages.length) {
            return;
        }

        var visibleMessage = messages.find(this.isElementVisibleInViewport);

        if (!visibleMessage) {
            var visibleMessage = messages[0];
            FC.Utils.scrollTo(visibleMessage, {
                duration: 0.3,
                offset: -80,
                afterFinish: function() {
                    FC.Utils.shake(visibleMessage);
                }
            }, true);
        } else {
            FC.Utils.shake(visibleMessage);
        }
    },

    isElementVisibleInViewport: function(el) {
        return FC.Utils.isInViewport(el);
    }
};
