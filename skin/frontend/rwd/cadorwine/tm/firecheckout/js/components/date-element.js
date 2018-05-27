/**
 * Add jscalendar support for the DateElements
 */
Varien.DateElement.prototype.initialize = Varien.DateElement.prototype.initialize.wrap(
    function(o, type, content, required, format) {
        o(type, content, required, format);

        if (!type || -1 === format.indexOf('%')) {
            // 1. DateElement can be created without parameters
            //    @see Varien.DateElement in js/varien/js.js
            // 2. Do not create calendar, if format is invalid (third-party modules bugs)
            return;
        }

        this.full
            .addClassName('input-text')
            .addClassName('validate-custom')
            .writeAttribute('type', 'text');
        this.full.up().show();
        this.full.validate = this.validate.bind(this);

        this.day.up().hide();
        this.month.up().hide();
        this.year.up().hide();

        var self = this;
        FC.Calendar.create(this.full, {
            format: format,
            // listener for flatpickr.js
            onChange: function(selectedDates, dateStr, instance) {
                var date = selectedDates[0];
                self.day.setValue(date.getDate());
                self.month.setValue(date.getMonth() + 1);
                self.year.setValue(date.getFullYear());
            },
            // listener for calendar.js fallback
            onSelect: function(calendar, dateStr) {
                var date = calendar.date;
                self.day.setValue(date.getDate());
                self.month.setValue(date.getMonth() + 1);
                self.year.setValue(date.getFullYear());
                self.full.setValue(dateStr);
                this.hide();
            }
        });
    }
);
