document.observe('firecheckout:setResponseBefore', function (e) {
    if (e.memo.url !== checkout.urls.save) {
        return;
    }

    // @see easynolo_bancasellapro/observer::addDataToResultSaveOrderIframe
    if (e.memo.response.success && e.memo.response.encrypt_string) {
        delete e.memo.response.redirect;
        delete e.memo.response.success;

        // @see app/design/frontend/base/default/template/easynolo/bancasellapro/gestpay/redirect.phtml
        review.nextStep(e.memo.serverResponse);
    }
});
