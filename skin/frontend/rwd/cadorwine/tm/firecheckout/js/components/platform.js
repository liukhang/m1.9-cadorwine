document.observe('dom:loaded', function() {
    var userAgent = navigator.userAgent.toLowerCase(),
        html = $$('html').first();

    if (userAgent.indexOf('safari') !== -1) {
        if (userAgent.indexOf('chrome') === -1) {
            html.addClassName('safari');
        }
    }

    if (navigator.platform.toLowerCase().indexOf('mac') !== -1) {
        html.addClassName('mac');
    }
});
