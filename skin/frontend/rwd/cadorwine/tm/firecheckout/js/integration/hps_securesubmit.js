document.observe('firecheckout:saveBefore', function(e) {
    if (!e.memo.forceSave &&
        payment.currentMethod &&
        payment.currentMethod === 'hps_securesubmit') {

        e.memo.stopFurtherProcessing = true;
        payment.save();
    }
});
