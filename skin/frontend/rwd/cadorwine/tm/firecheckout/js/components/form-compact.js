var FC = FC || {};
FC.FormCompact = {
    init: function() {
        var config = {},
            selector = [
                '.fc-form-compact .field',
                '.fc-form-compact .wide',
                '.fc-form-compact .captcha-input-container'
            ].join(',');

        $$(selector).each(function(el) {
            var label = el.down('label'),
                cleanLabelText = '',
                inputs = el.select('input, select, textarea');

            if (label) {
                cleanLabelText = label.innerHTML.replace(/<em.+?>*<\/em>/, '').stripTags();
            }

            if (inputs.length) {
                inputs.each(function(input) {
                    if (!input.id) {
                        return;
                    }

                    var json = {
                        placeholder: input.title ? input.title : cleanLabelText
                    };

                    if (!label) {
                        json.label = input.title ? input.title : cleanLabelText
                    }

                    if (input.hasClassName('required-entry')) {
                        var asterisk = ' *';
                        json.placeholder += asterisk;
                        if (json.label) {
                            json.label += asterisk;
                        }
                    }

                    config['#' + input.id.replace(':', '\\:')] = json;

                    if (input.tagName.toLowerCase() === 'select') {
                        // fill empty option with label text,
                        // otherwise input will be empty and without label
                        var emptyOption = input.select('option[value=""]').first();
                        if (emptyOption && !emptyOption.innerHTML) {
                            emptyOption.innerHTML = cleanLabelText;
                        }
                    }
                });
            }
        });
        new FC.FormFieldManager(config);
    }
};

document.observe('dom:loaded', function() {
    // housenumber and other js scripts compatibility:
    // Those scripts can change field label or title
    FC.FormCompact.init.defer();
});
