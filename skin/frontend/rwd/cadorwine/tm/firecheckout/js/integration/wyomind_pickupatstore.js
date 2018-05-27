$(document).on('change', '#pickupatstore', function() {
    var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
    if (sections.length) {
        checkout.update(
            checkout.urls.shipping_method,
            FC.Ajax.arrayToJson(sections)
        );
    }
});
$(document).observe('firecheckout:setSameAsBillingAfter', function(e) {
    if (!shippingMethod.getCurrentMethod()) {
        return;
    }

    if ((e.memo.previousUseForShippingValue == 2 || e.memo.currentUseForShippingValue == 2)
        && e.memo.previousUseForShippingValue != e.memo.currentUseForShippingValue) {

        // reset previously selected method, if we need to use storepickup now
        shippingMethod.reset();
    }
});
