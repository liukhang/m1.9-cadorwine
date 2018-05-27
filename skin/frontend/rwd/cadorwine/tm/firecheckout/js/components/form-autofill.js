document.observe('dom:loaded', function() {
    // Slow autofill fix: Chrome on iOS
    // Without this code `fc-dirty` classes are not added to email and password
    // fields
    // Password fields are not actually filled-in without user interaction:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=669724
    var fields = [
            $('billing:email'),
            $('billing:customer_password'),
            $('email'),
            $('pass')
        ],
        iterator = 0,
        timeout = 500,
        limit = 5000 / timeout; // do the check up to 5 seconds only
    function fixSlowAutofill() {
        iterator++;
        fields.each(function(el, i) {
            if (!el) {
                fields.splice(i, 1);
            } else if (el.defaultValue !== el.getValue()) {
                FC.Utils.fireEvent(el, 'change');
                fields.splice(i, 1);
            }
        });
        if (fields.length && iterator < limit) {
            setTimeout(fixSlowAutofill, timeout);
        }
    }
    fixSlowAutofill();
});

// remove password parameted from request if fields are hidden to prevent
// conflicts with third-party modules
document.observe('firecheckout:formSerializeAfter', function(e) {
    if ($$('.fc-pw-hidden').length) {
        delete e.memo.params['billing[customer_password]'];
        delete e.memo.params['billing[confirm_password]'];
    }
});
