var firecheckoutCcFieldmanager = new FC.FormFieldManager({
    '#checkout-payment-method-load input[name="payment[cc_number]"': {
        type: 'tel',
        inputmode: 'numeric',
        autocomplete: 'cc-number'
    },
    '#checkout-payment-method-load input[name="payment[cc_cid]"': {
        type: 'tel',
        inputmode: 'numeric',
        autocomplete: 'cc-csc'
    }
});
document.observe('firecheckout:paymentMethod:afterInitAfter', function() {
    firecheckoutCcFieldmanager.processRules();
});
