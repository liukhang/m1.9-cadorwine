OptionsModel.prototype.bindShippingMethods = OptionsModel.prototype.bindShippingMethods.wrap(function(o) {
    this.shippingMethodFormId = 'firecheckout-form';
    o();

    var tableToShow = $('options-umosaco');
    if (tableToShow) {
        $(tableToShow).select('input', 'select', 'textarea').each(function(el) {
            $(el).observe('change', function(e) {
                checkout.update(checkout.urls.shipping_method);
            });
        });
    }
});
