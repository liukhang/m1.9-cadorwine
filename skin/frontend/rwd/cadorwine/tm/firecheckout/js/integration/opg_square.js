document.observe('firecheckout:saveBefore', function(e) {
    if (!e.memo.forceSave && payment.currentMethod == 'square') {
        e.memo.stopFurtherProcessing = true;
        OPG.Square.formId = '#' + checkout.form;
        payment.save();
    }
});
