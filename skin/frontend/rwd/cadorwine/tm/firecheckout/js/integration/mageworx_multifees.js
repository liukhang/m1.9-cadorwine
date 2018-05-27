FC.MultiFees = {
    init: function() {
        var selectors = [
            '.multifees-shipping-fee select',
            '.multifees-shipping-fee input[type="checkbox"]'
        ];
        $(document).on('change', selectors.join(','), function(e, el) {
            FC.MultiFees.update(el);
        });
    },

    update: function(el) {
        var params = {},
            url;
        if ($(el).up('#shipping-method')) {
            params['is_payment_fee'] = 0;
            params['is_shipping_fee'] = 1;
            url = checkout.urls.shipping_method;
        } else {
            params['is_payment_fee'] = 1;
            params['is_shipping_fee'] = 0;
            url = checkout.urls.payment_method;
        }
        checkout.update(url, params);
    }
};
FC.MultiFees.init();

document.observe('dom:loaded', function() {
    if (typeof MultiFees === 'undefined') {
        return;
    }

    MultiFees.labelClick = MultiFees.labelClick.wrap(function(original, el) {
        if (false === original(el)) {
            return;
        }
        FC.MultiFees.update(el);
    });
});
