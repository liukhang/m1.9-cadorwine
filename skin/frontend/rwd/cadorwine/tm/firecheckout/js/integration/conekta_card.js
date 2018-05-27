document.observe('firecheckout:saveBefore', function(e) {
    if (!e.memo.forceSave && payment.currentMethod === 'card') {
        e.memo.stopFurtherProcessing = true;
        payment.save();
    }
});
