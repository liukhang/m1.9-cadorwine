document.observe('dom:loaded', function() {
    var wrapper = $$('.firecheckout-col2-set-sticky .col3-fire-set, .firecheckout-col2-set-sticky .col2-fire-set').first();
    if (!wrapper) {
        return;
    }

    new FC.Sticky($('checkout-review'), {
        parent: $('firecheckout-form').down('.firecheckout-set'),
        spacer: false,
        media: '(min-width: 640px)'
    });
});
