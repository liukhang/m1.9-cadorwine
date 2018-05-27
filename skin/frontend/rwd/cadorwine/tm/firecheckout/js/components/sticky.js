var FC = FC || {};
FC.Sticky = Class.create();
FC.Sticky.prototype = {
    config: {
        offset_top: 10,
        recalc_every: 5
    },

    initialize: function(el, options) {
        this.el = el;
        this.options = Object.extend(this.config, options || {});
        this.parent = this.options.parent ? this.options.parent : el.up();

        this.stickyInstance = new StickInParent(this.options);
        this.debouncedReset = FC.Utils.debounce(this.reset.bind(this), 250);

        if (this.options.media) {
            function stick(mql) {
                if (mql.matches) {
                    this.stick();
                } else {
                    this.unstick();
                }
            }

            var mql = matchMedia(this.options.media);
            mql.addListener(stick.bind(this));
            stick.call(this, mql);
        }
    },

    stick: function() {
        var el = this.el;

        if (el.getStyle('position') === 'absolute') {
            this.parent.setStyle('min-height', '');

            var height = el.getHeight()
                + parseInt(el.getStyle('margin-top'), 10)
                + parseInt(el.getStyle('margin-bottom'), 10);
            if (this.parent.getHeight() < height) {
                this.parent.setStyle({
                    minHeight: height + 'px'
                });
            }

            var offsetLeft = el.viewportOffset().left;

            el.observe('sticky_kit:stick', function() {
                this.setStyle({
                    left: offsetLeft + 'px',
                    right: 'auto'
                });
            });
            el.observe('sticky_kit:unstick', function() {
                this.setStyle({
                    left: '',
                    right: ''
                });
            });
            el.observe('sticky_kit:bottom', function() {
                this.setStyle({
                    left: '',
                    right: ''
                });
            });
            el.observe('sticky_kit:unbottom', function() {
                this.setStyle({
                    left: offsetLeft + 'px',
                    right: 'auto'
                });
            });

            // re-stick added to recalculate left, when some element changes
            // it's size dynamically
            this.onBodyClick = this._handleBodyHeightChange.bind(this);
            this.bodyHeightChangeInterval = setInterval(this.onBodyClick, 250);
            $(document.body).observe('click', this.onBodyClick);
        }

        // re-stick added for proper support of the absolutely positioned elements
        Event.observe(window, 'resize', this.debouncedReset);

        this.stickyInstance.stick(el);
    },

    unstick: function() {
        var el = this.el,
            events = [
                'sticky_kit:stick',
                'sticky_kit:unstick',
                'sticky_kit:bottom',
                'sticky_kit:unbottom'
            ];
        events.each(function(eventName) {
            el.stopObserving(eventName);
        });
        el.setStyle({
            left: '',
            right: ''
        });
        Event.stopObserving(window, 'resize', this.debouncedReset);
        if (this.onBodyClick) {
            $(document.body).stopObserving('click', this.onBodyClick);
        }
        if (this.bodyHeightChangeInterval) {
            clearInterval(this.bodyHeightChangeInterval);
        }
        el.fire('sticky_kit:detach');
    },

    reset: function(el, options) {
        if (this.el.readAttribute('sticky_kit')) {
            this.unstick();
            this.stick();
        }
    },

    _handleBodyHeightChange: function() {
        if (!this.lastBodyHeight) {
            this.lastBodyHeight = $(document.body).getHeight();
        }
        var newHeight = $(document.body).getHeight();
        if (this.lastBodyHeight != newHeight) {
            this.debouncedReset();
        }
        this.lastBodyHeight = newHeight;
    }
};
