var FC = FC || {};
FC.Calendar = {
    create: function(el, options) {
        var flatpickrFormat = this.toFlatpickrFormat(options.format);

        if (flatpickrFormat) {
            var self = this;

            if (Calendar && !isNaN(Calendar._FD)) {
                Flatpickr.l10ns.default.firstDayOfWeek = Calendar._FD;
            }

            delete options['onSelect'];
            options = Object.extend({
                // altInput: true,
                disableMobile: true, // disable to keep dateFormat
                dateFormat: flatpickrFormat,
                allowInput: false,
                formatDate: function(dateObj, frmt) {
                    var _this = Flatpickr.prototype,
                        arr = frmt.split(""); // this line actually fixes the bug with prototype.js
                    return arr.map(function (c, i) {
                        return _this.formats[c] && arr[i - 1] !== "\\" ?
                            _this.formats[c](dateObj) : c !== "\\" ? c : "";
                    }).join("");
                }
            }, options || {});

            return new Flatpickr(el, options);
        } else {
            console.log('Flatpickr could not be instantiated. Unknown date format: ' + options.format);
            delete options['onChange'];
            options = Object.extend({
                inputField: el,
                ifFormat: options.format,
                weekNumbers: false,
                showOthers: true
            }, options || {});

            Calendar.setup(options);
        }
    },

    toFlatpickrFormat: function(ifFormat) {
        var flatpickrFormat = ifFormat,
            formatMapping = {
                '%a': 'D',
                '%A': 'l',
                '%b': 'M',
                '%B': 'F',
                '%C': 'unsupported', // century number
                '%d': 'd',
                '%e': 'j',
                '%H': 'H',
                '%I': 'h', // add pad here 01-12
                '%j': 'unsupported',  // day of the year
                '%k': 'H', // remove pad here 0-23
                '%l': 'h',
                '%m': 'm',
                '%M': 'i',
                '%n': 'unsupported', // newline charachter
                '%p': 'K',
                '%P': 'unsupported', // K to lowercase
                '%s': 'unsupported', // ??? U
                '%S': 'S',
                '%t': 'unsupported', // tab character
                '%U': 'unsupported', // week number
                '%W': 'unsupported', // week number
                '%V': 'unsupported', // week number
                '%u': 'unsupported', // day of the week (1-7). same as w+1
                '%w': 'w',
                '%y': 'y',
                '%Y': 'Y',
                '%%': 'unsupported' // a literal '%' character
            };
        for (var i in formatMapping) {
            flatpickrFormat = flatpickrFormat.replace(i, formatMapping[i]);
        }

        if (flatpickrFormat.indexOf('unsupported') !== -1) {
            return false;
        }
        return flatpickrFormat;
    }
};
