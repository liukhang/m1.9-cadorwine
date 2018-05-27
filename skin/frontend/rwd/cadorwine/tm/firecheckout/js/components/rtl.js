var FC = FC || {};
FC.Rtl = {
    _isRtl: null,

    init: function() {
        if (this.isRtl()) {
            $$('html').first().addClassName('fc-rtl');
            // $$('html').first().setStyle({
            //     direction: 'rtl'
            // });

            $(checkout.form).select('.hint--right').each(function(el) {
                el.removeClassName('hint--right');
                el.addClassName('hint--left');
            });
        }
    },

    isRtl: function() {
        if (null === this._isRtl) {
            this._isRtl = (
                document.dir === 'rtl' ||
                document.body.dir === 'rtl' ||
                $(document.body).hasClassName('rtl') ||
                $(document.body).hasClassName('em-rtl') ||
                $$('html').first().hasClassName('rtl') ||
                $$('html').first().hasClassName('fc-rtl')
            );
        }
        return this._isRtl;
    }
};

document.observe('dom:loaded', function() {
    FC.Rtl.init();
});
