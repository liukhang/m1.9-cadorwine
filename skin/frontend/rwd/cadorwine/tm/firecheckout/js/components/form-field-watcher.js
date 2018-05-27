var FC = FC || {};
FC.FormFieldWatcher = Class.create();
FC.FormFieldWatcher.prototype = {
    initialize: function() {
        this.addObservers();

        var self = this;
        $('firecheckout-form').up().select('input,select,textarea').each(function(el) {
            // housenumber and other js scripts compatibility:
            // Those scripts can change fields markup
            self.handle.bind(self).defer(el);
        });
    },

    addObservers: function() {
        var self = this,
            events = [
                'change',
                'keyup',
                'paste',
                'cut'
            ];

        events.each(function(eventName) {
            $(document.body).observe(eventName, function(e) {
                // delay is used to fix paste and cut events
                self.handle.bind(self).delay(0, e.element());
            });
        });
    },

    handle: function(el) {
        if (!el || !el.visible() || !el.getValue) {
            return;
        }

        var inputBox = this.getInputBox(el);
        if (inputBox) {
            if (this.isDirty(el)) {
                inputBox.addClassName('fc-dirty');
            } else {
                inputBox.removeClassName('fc-dirty');
            }
        }
    },

    isDirty: function(el) {
        var value = el.getValue(),
            dirty = value.length > 0;

        if (el.tagName.toLowerCase() === 'select') {
            dirty = el.options[el.selectedIndex].innerHTML.length > 0;
        }
        return dirty;
    },

    getInputBox: function(el) {
        var inputBox = el.up(1);
        if (inputBox &&
            inputBox.hasClassName('input-box') &&
            !inputBox.hasClassName('field') &&
            !inputBox.hasClassName('wide') &&
            !inputBox.hasClassName('captcha-input-container')) {

            inputBox = inputBox.up();
        }

        if (inputBox && (
                inputBox.hasClassName('field') ||
                inputBox.hasClassName('wide') ||
                inputBox.hasClassName('captcha-input-container'))
        ) {
            return inputBox;
        }
        return false;
    }
};

document.observe('dom:loaded', function() {
    formFieldWatcher = new FC.FormFieldWatcher();
});
