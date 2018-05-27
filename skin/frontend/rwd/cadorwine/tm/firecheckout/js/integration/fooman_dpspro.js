document.observe('dom:loaded', function() {
    FireCheckout.prototype.setResponse = FireCheckout.prototype.setResponse.wrap(function(o, transport) {
        var responseUrl = transport.transport.responseURL;
        try {
            response = transport.responseText.evalJSON();

            // Fix for IE < EDGE
            if (!responseUrl && response.responseUrl) {
                responseUrl = response.responseUrl;
            }
        } catch (err) {
            return o(transport);
        }

        if (responseUrl !== checkout.urls.save ||
            !response.success ||
            payment.currentMethod != 'foomandpsprofusion') {

            return o(transport);
        }

        checkout.setLoadWaiting(false);
        checkout.setLoadingButton($$('button.btn-checkout')[0], false);

        review.successUrl = checkout.urls.success;
        review.nextStep(transport); // @see app/design/frontend/base/default/template/fooman/dpspro/pxfusion/iframe.phtml
    });
});
