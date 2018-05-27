document.on('click', '[name="mico[rushpackage-time]"]', function() {
    var onepageLink = checkout.urls.shipping_method
        .replace(
            '/firecheckout/index/saveShippingMethod',
            '/checkout/onepage/saveShippingMethod'
        );

    // Make request to the standard checkout action.
    // Module overrides it and has some ionCube code inside.
    checkout.setLoadWaiting(true);
    new Ajax.Request(onepageLink, {
        parameters: $(checkout.form).serialize(true),
        onComplete: function() {
            // Refresh order review section
            checkout.setLoadWaiting(false);
            // need to refresh review section only
            checkout.update(checkout.urls.shopping_cart.replace('saveCart', 'buyerprotect'));
        }
    });
});
