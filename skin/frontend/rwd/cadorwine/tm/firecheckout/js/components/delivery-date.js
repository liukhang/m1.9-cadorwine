var FC = FC || {};
FC.DeliveryDate = Class.create();
FC.DeliveryDate.prototype = {

    config: {
        excludedDates     : [],
        periodicalDates   : [],
        nonPeriodicalDates: [],
        excludeWeekend    : 0,
        useCalendar       : 1,
        weekendDays       : '0,6',
        ifFormat          : '%m/%e/%Y',
        shippingMethods   : [],
        todayOffset       : 0,
        useDefaultValue   : 0,
        period            : 365
    },

    initialize: function(options) {
        Object.extend(this.config, options);
        var today = new Date();

        // if delivery processing day is over add one more day
        var serverDate = new Date(this.config.serverDate),
            endOfDay   = new Date(this.config.endOfDeliveryDayDate),
            configOffset = this.config.todayOffset;
        if (serverDate > endOfDay) {
            configOffset++;
        }

        // offset first available date considering weekends and holidays
        var offset = 0,
            i = 0; // count iterations
        while (offset < configOffset) {
            if (i++ >= 365) {
                // possible continious loop fix
                console.error('There are no avaialable dates for the possible delivery within ' + i + ' days!');
                break;
            }
            today.setDate(today.getDate() + 1);
            if (this.config.excludeWeekend && this.config.weekendDays.indexOf(today.getDay()) >= 0) {
                continue;
            }
            if (this.config.nonPeriodicalDates.indexOf(this.dateToString(today)) >= 0) {
                continue;
            }
            if (this.config.periodicalDates.indexOf(this.dateToString(today).substr(0,7)) >= 0) {
                continue;
            }
            offset += 1;
        }

        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        this.today = today;

        if (this.config.useDefaultValue) {
            $('delivery_date').setValue(today.print(this.config.ifFormat));
        }

        this.maxDate = new Date(today);
        this.maxDate.setHours(23);
        this.maxDate.setMinutes(59);
        this.maxDate.setSeconds(59);
        this.maxDate.setMilliseconds(59);
        this.maxDate.setDate(this.maxDate.getDate() + this.config.period);

        if (this.config.useCalendar) {
            this.initCalendar();
        }

        this.toggleDisplay();
    },

    toggleDisplay: function(shippingMethod) {
        if (!this.config.shippingMethods.length) {
            return;
        }

        if (!shippingMethod) {
            $$('input[name="shipping_method"]').each(function(el) {
                if (el.checked || el.readAttribute('checked') === 'checked') {
                    shippingMethod = el.value;
                    return;
                }
            });
        }

        if (-1 === this.config.shippingMethods.indexOf(shippingMethod)) {
            $('shipping_form_delivery_date').hide();
        } else {
            $('shipping_form_delivery_date').show();
        }
    },

    initCalendar: function() {
        var self = this;

        FC.Calendar.create($('delivery_date'), {
            format: self.config.ifFormat,
            minDate: self.today,
            maxDate: self.maxDate,
            disable: [
                function(date) {
                    if (self.config.excludeWeekend && self.config.weekendDays.indexOf(date.getDay()) >= 0) {
                        return true;
                    }

                    var i = 0,
                        sDate = self.dateToString(date);
                    while (self.config.excludedDates[i]) {
                        if (0 === sDate.indexOf(self.config.excludedDates[i])) {
                            return true;
                        }
                        i++;
                    }
                    return false;
                }
            ]
        });
    },

    dateToString: function(date) {
        var year  = date.getFullYear(),
            month = date.getMonth() + 1,
            day   = date.getDate();

        month = month < 10 ? '0' + month : month;
        day   = day   < 10 ? '0' + day   : day;

        return month + '/' + day + '/' + year;
    }
};
