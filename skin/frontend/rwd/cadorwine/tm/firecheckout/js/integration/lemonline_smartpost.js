document.observe('firecheckout:shippingMethod:clickBefore', function(e) {
    var el = e.memo.el;

    var smartpostSelect = $('smartpost_select_point');
    if (smartpostSelect) {
        if (el.id !== 's_method_itellaSmartPost') {
            smartpostSelect.setValue('itellaSmartPost');
        } else {
            var availableOptions = smartpostSelect.select('option');
            if (availableOptions.length >= 2) {
                smartpostSelect.setValue(availableOptions[1].value);
                updatePointValue();
            }
        }
    }
});

document.on('change', '#smartpost_select_point', function(e) {
    updatePointValue();
    var sections = FC.Ajax.getSectionsToUpdate('shipping-method');
    if (sections.length) {
        checkout.update(
            checkout.urls.shipping_method,
            FC.Ajax.arrayToJson(sections)
        );
    }
});
