document.observe('firecheckout:setResponseAfter', function(e) {
    // save payment response
    var url = e.memo.url;
    if (url === checkout.urls.payment_method) {
        $('checkout-review-submit').show();
        if ($('sagepaysuite-server-incheckout-iframe')) {
            $('sagepaysuite-server-incheckout-iframe').remove();
        }
        return;
    }

    // update review reponse
    var response = e.memo.response;
    if (response.update_section && response.update_section.review) {
        $('checkout-review-submit').show();
        if ($('sagepaysuite-server-incheckout-iframe')) {
            $('sagepaysuite-server-incheckout-iframe').remove();
        }
    }

    // saveOrder response
    if (!response.method) {
        return;
    }

    var methods = [
        'sagepayserver',
        'sagepayform',
        'sagepaydirectpro',
        'sagepaypaypal'
    ];
    if (methods.indexOf(response.method) >= 0) {
        window._sagepayonepageTriggerId = $('.button.btn-checkout');
        window._sagepayonepageFormId = 'firecheckout-form';

        checkout.setLoadWaiting(true);
        checkout.setLoadingButton($$('.btn-checkout')[0]);
        new Ajax.Request(SuiteConfig.getConfig('global', 'sgps_saveorder_url'), {
            parameters: Form.serialize($('firecheckout-form')),
            onSuccess:function(f){
                checkout.setLoadWaiting(false);
                checkout.setLoadingButton($$('.btn-checkout')[0], false);

                var SageServer = new EbizmartsSagePaySuite.Checkout({});
                SageServer.code = response.method;
                SageServer.setPaymentMethod();
                SageServer.config.osc = true; // @see sagePaySuite_Checkout.js:579 if (this.getConfig('osc') .. { setLocation(
                SageServer.config.oscFrm = $('firecheckout-form'); // @see sagePaySuite_Checkout.js:197 form = this.getConfig('oscFrm');
                SageServer.config.review = review; // @see sagePaySuite_Checkout.js:907 this.getConfig('review').nextStep(transport);
                SageServer.reviewSave(f);
            }
        });
    }
});

setOscLoad = function() {
    checkout.setLoadWaiting(true);
    $('review-please-wait').show();
};

restoreOscLoad = function () {
    window._sagepayprocessingorder = false;
    checkout.setLoadWaiting(false);
    $('review-please-wait').hide();
};
