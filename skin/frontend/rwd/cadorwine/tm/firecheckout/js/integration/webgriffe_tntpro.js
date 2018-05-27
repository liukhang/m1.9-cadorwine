document.observe('dom:loaded', function() {
    $('billing:use_tnt_delivery_point').observe('click', function() {
        $('shipping-address').show();
        checkout.update(checkout.urls.billing_address);
    });

    if (typeof fillShippingAddressWithTntPoint === 'function') {
        fillShippingAddressWithTntPoint = fillShippingAddressWithTntPoint.wrap(function(o, tntPoint) {
            o(tntPoint);
            checkout.update(checkout.urls.shipping_address);
        });
    }
});

document.observe('firecheckout:setResponseAfter', function(e) {
    if (e.memo.url === checkout.urls.billing_address) {
        document.body.fire('billing-request:completed');
    }
});
