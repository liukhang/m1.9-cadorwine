// Old integration
document.observe('firecheckout:setResponseAfter', function(e) {
    if (payment.toggleOpsCcInputs) {
        try {
            // display form if needed
            payment.toggleOpsCcInputs();
        } catch (e) {
            //
        }
    }
});
// do not use payment.save with latest integration!
// document.observe('firecheckout:saveBefore', function(e) {
//     if (!e.memo.forceSave &&
//         payment.currentMethod &&
//         payment.currentMethod.indexOf("ops_") === 0) {

//         payment.save();
//         e.memo.stopFurtherProcessing = true;
//     }
// });

// Latest Netreserach version with save buttons inside iframe:
document.observe('firecheckout:setResponseAfter', function(e) {
    if (e.memo.response.update_section &&
        e.memo.response.update_section['payment-method']) {

        if (payment.registerAliasEventListeners) {
            payment.registerAliasEventListeners();
        }
        if (payment.handleBrandChange) {
            payment.handleBrandChange();
        }
    }
});

// window load is used, because of original code. See js/netresearch/tokenization.js
Event.observe(window, 'load', function () {
    payment.opcToggleContinue = function(isActive) {
        var container = $('review-buttons-container');
        checkout.setDisableButtonSet(container, !isActive);

        if (typeof OnecolumnCheckout !== 'undefined') {
            var buttons = OnecolumnCheckout.currentStep.down('.step-buttons-set');
            if (buttons) {
                OnecolumnCheckout.setDisableButtonSet(buttons, !isActive);
            }
        }
    }

    payment.save = payment.save.wrap(function (originalSaveMethod) {
        if (payment.currentMethod &&
            payment.currentMethod.indexOf("ops_") === 0) {

            return;
            // do nothing, because it's called too early by OPS module
            // inside all form.phtml templates
        }
    });
});
