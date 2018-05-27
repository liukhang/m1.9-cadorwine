FC.WebshopappsPremiumrate = {};

document.observe('firecheckout:setResponseBefore', function(e) {
    if (e.memo.url === checkout.urls.shopping_cart) {
        FC.WebshopappsPremiumrate.oldMethod = shippingMethod.getCurrentMethod();
    }
});
document.observe('firecheckout:setResponseAfter', function(e) {
    // apply shipping method, when previous is gone
    if (e.memo.url === checkout.urls.shopping_cart &&
        FC.WebshopappsPremiumrate.oldMethod !== shippingMethod.getCurrentMethod()) {

        checkout.update(checkout.urls.shipping_method);
    }
});
