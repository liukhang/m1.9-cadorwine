// make request to standard onepage checkout url to trigger laposte server-side validation
document.observe('firecheckout:saveBefore', function(e) {
    if (e.memo.forceSave || typeof shippingMethod === 'undefined') {
        return;
    }

    if (shippingMethod.getCurrentMethod().indexOf('_colissimo') === -1) {
        return;
    }

    e.memo.stopFurtherProcessing = true;

    var onepageUrl = checkout.urls.shipping_method.replace('firecheckout/index', 'checkout/onepage');
    checkout.update(onepageUrl, {}, {
        beforeSetResponse: function (response) {
            try {
                response = response.responseText.evalJSON();
            } catch (e) {
                return;
            }

            if (response.goto_section) {
                // validation successfull - place order now
                response.stopFurtherProcessing = true; // prevent onecolumn mode logic

                checkout.setLoadWaiting(false);
                checkout.save('', true);
            } else {
                // validation failed
                $$('[name="shipping_method"]').invoke('writeAttribute', 'checked', false);

                if (typeof OnecolumnCheckout !== 'undefined'
                    && !$$('.onecolumn').first().hasClassName('expanded')) {

                    OnecolumnCheckout.stepTo($$('.step-shipping-payment-method').first());
                }
            }
        }
    });
});

document.observe('firecheckout:shippingMethod:clickBefore', function(e) {
    if (shippingMethod.getCurrentMethod().indexOf('_colissimo') > 0) {
        // trigger la poste logic
        shippingMethod.save();
    }
});
document.observe('firecheckout:shippingMethod:addObserversAfter', function() {
    $$('[name="shipping_method"]').invoke('writeAttribute', 'checked', false);
});
