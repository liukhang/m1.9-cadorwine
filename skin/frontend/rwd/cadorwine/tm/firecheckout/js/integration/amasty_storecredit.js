document.observe('dom:loaded', function() {
    if ($('amstcred_use_customer_balance')) {
        $('amstcred_use_customer_balance').observe('click', function() {
            checkout.update(checkout.urls.payment_method);
        });
    }
});
