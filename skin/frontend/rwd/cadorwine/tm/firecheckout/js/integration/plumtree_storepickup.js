document.observe('firecheckout:saveBefore', function(e) {
    if (e.memo.forceSave) {
        return;
    }

    e.memo.stopFurtherProcessing = true;

    var url = checkout.urls.shipping_method
        .replace(
            'firecheckout/index/saveShippingMethod',
            'storepickup/onepage/saveDeliveryInfo'
        );
    checkout.update(url, {}, function (response) {
        try {
            response = response.responseText.evalJSON();
        } catch (e) {
            return;
        }

        // prevent onecolumn mode logic with goto sections
        response.stopFurtherProcessing = true;

        // save order
        checkout.setLoadWaiting(false);
        checkout.save('', true);
    });
});
