document.observe('dom:loaded', function() {
    if (typeof OnecolumnCheckout != 'undefined') {
        OnecolumnCheckout.saveStep = OnecolumnCheckout.saveStep.wrap(function(o, url, button, callback, params) {
            // do not save payment, if gene_braintree is used
            if (payment.currentMethod === 'gene_braintree_creditcard' &&
                url === checkout.urls.payment_method) {

                return callback();
            }

            return o(url, button, callback, params);
        });
    }
});
