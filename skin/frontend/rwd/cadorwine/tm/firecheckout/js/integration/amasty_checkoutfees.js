/**
 * Make a requests to the standard onepage controller when needed,
 * because Amasty_Checkoutfees listens to the onepage controller actions.
 */

function updateAmCheckoutFees(url) {
    $$('#checkoutfees_shipping, #checkoutfees_payment').each(function (el) {
        el.addClassName('fc-no-pointer-events');
    });
    checkout.update(url, {}, function (response) {
        response.stopFurtherProcessing = true;
        checkout.setLoadWaiting(false);

        checkout.updateSections('review');

        $$('#checkoutfees_shipping, #checkoutfees_payment').each(function (el) {
            el.removeClassName('fc-no-pointer-events');
        });
    });
}

document.observe('dom:loaded', function () {
    if (typeof clickCheckoutFeesInput === 'function') {
        clickCheckoutFeesInput = clickCheckoutFeesInput.wrap(function (o) {
            updateAmCheckoutFees(checkout.urls.shipping_method.replace('firecheckout/index', 'checkout/onepage'));
        });
    }

    if (typeof payment.clickCheckoutFeesInput === 'function') {
        payment.clickCheckoutFeesInput = payment.clickCheckoutFeesInput.wrap(function (o) {
            updateAmCheckoutFees(checkout.urls.payment_method.replace('firecheckout/index', 'checkout/onepage'));
        });
    }
});

document.observe('firecheckout:updateAfter', function(e) {
    switch (e.memo.url) {
        // case checkout.urls.payment_method:
        //     updateAmCheckoutFees(checkout.urls.payment_method.replace('firecheckout/index', 'checkout/onepage'));
        //     break;
        // case checkout.urls.shipping_method:
        //     updateAmCheckoutFees(checkout.urls.shipping_method.replace('firecheckout/index', 'checkout/onepage'));
        //     break;
        case checkout.urls.shopping_cart:
            updateAmCheckoutFees(checkout.urls.payment_method.replace('firecheckout/index', 'checkout/onepage'));
            break;
    }
});
