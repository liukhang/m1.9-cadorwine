document.observe('dom:loaded', function() {
    var wrapper = $$('.col3-fire-set, .col2-fire-set').first();
    if (!wrapper) {
        return;
    }

    new FC.Sticky($('checkout-review'), {
        parent: $('firecheckout-form').down('.firecheckout-set'),
        spacer: false,
        media: '(max-width: 800px) and (min-width: 640px)'
    });
});
