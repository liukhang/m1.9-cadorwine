document.observe('dom:loaded', function() {
    $$('.onecolumn')[0].addClassName('expanded');
});

OnecolumnCheckout.toggleLogin = OnecolumnCheckout.toggleLogin.wrap(function(o, flag) {
    o(flag);

    var section = $$('.onecolumn').first();
    if (flag) {
        section.removeClassName('expanded');
    } else {
        section.addClassName('expanded');
    }
});
