var FC = FC || {};
FC.Loader = {
    counter: 0,

    markup: '<div class="fc-spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',

    init: function() {
        this.el = new Element('div');
        this.el.addClassName('firecheckout-loader');
        this.el.insert(this.markup);
        $(document.body).insert({
            bottom: this.el
        });
    },

    isActive: function() {
        return this.counter > 0;
    },

    toggle: function(flag, parentEl) {
        if (!parentEl) {
            if (flag) {
                this.counter++;
            } else if (this.counter > 0) {
                this.counter--;
                if (this.counter > 0) {
                    flag = true;
                }
            }
        }

        if (flag) {
            this.show(parentEl);
        } else {
            this.hide(parentEl);
        }
    },

    show: function(parentEl) {
        if (parentEl) {
            var buttons = ['a', 'button'];
            if (buttons.indexOf(parentEl.tagName.toLowerCase()) > -1) {
                if (parentEl.hasClassName('loading')) {
                    return;
                }

                parentEl.addClassName('loading').disable();
                parentEl.insert({
                    bottom: this.markup
                });
            } else {
                document.fire('firecheckout:setLoadingFieldBefore', {
                    field: parentEl,
                    flag: true
                });

                var inputBox = parentEl.up('.input-box');
                if (!inputBox || inputBox.hasClassName('loading')) {
                    return;
                }

                var fieldOuterHeight = parentEl.getHeight(),
                    offset = parentEl.positionedOffset();

                inputBox.addClassName('loading');
                parentEl.insert({
                    after: this.markup
                });
                var left = 'auto',
                    right = fieldOuterHeight / 5;
                if (parentEl.tagName === 'SELECT') {
                    right += 17; /* gap for trigger */
                }
                right = Math.round(right) + 'px';

                if (checkout.isRtl()) {
                    left = right;
                    right = 'auto';
                }
                inputBox.down('.fc-spinner').setStyle({
                    top: Math.round(offset.top + fieldOuterHeight / 2) + 'px',
                    right: right,
                    left: left
                });
            }
        } else {
            document.fire('firecheckout:setLoadWaitingBefore', {
                flag: true
            });
            this.el.addClassName('shown');
        }
    },

    hide: function(parentEl) {
        if (parentEl) {
            var buttons = ['a', 'button'],
                el;
            if (buttons.indexOf(parentEl.tagName.toLowerCase()) > -1) {
                parentEl.removeClassName('loading').enable();
                el = parentEl.down('.fc-spinner');
            } else {
                document.fire('firecheckout:setLoadingFieldBefore', {
                    field: parentEl,
                    flag: false
                });

                var inputBox = parentEl.up('.input-box');
                if (inputBox) {
                    inputBox.removeClassName('loading');
                    el = inputBox.down('.fc-spinner');
                }
            }

            if (el) {
                el.remove();
            }
        } else {
            document.fire('firecheckout:setLoadWaitingBefore', {
                flag: false
            });
            this.el.removeClassName('shown');
        }
    }
};

document.observe('dom:loaded', function() {
    FC.Loader.init();
});
