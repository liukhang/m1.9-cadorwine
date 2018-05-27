var FC = FC || {};
FC.Window = Class.create();
FC.Window.prototype = {
    initialize: function(config) {
        this.config = Object.extend({
            triggers: {},
            markup: '<div class="fc-window-content"></div><a href="javascript:void(0)" class="close">×</a>'
        }, config || {});
        this.config.size = Object.extend({
            width    : 'auto',
            height   : 'auto',
            maxWidth : 700,
            maxHeight: 600
        }, this.config.size || {});

        this._prepareMarkup();
        this._attachEventListeners();
    },

    show: function() {
        if (!this.centered) {
            this.center();
        }

        if (!this.mask.hasClassName('mask-visible')) {
            this.mask.addClassName('mask-visible');
            document.fire('firecheckout:window:mask:show');
        }

        if (!window.firecheckoutMaskCounter) {
            window.firecheckoutMaskCounter = 0;
        }
        if (!this.maskCounted) {
            this.maskCounted = 1;
            window.firecheckoutMaskCounter++;
        }

        // set highest z-index
        var zIndex = 999;
        $$('.firecheckout-window').each(function(el) {
            maxIndex = parseInt(el.getStyle('zIndex'));
            if (zIndex < maxIndex) {
                zIndex = maxIndex;
            }
        });
        this.window.setStyle({
            'zIndex': zIndex + 1
        });

        this._onKeyPressBind = this._onKeyPress.bind(this);
        document.observe('keyup', this._onKeyPressBind);
        this.window.addClassName('shown');
    },

    hide: function() {
        if (this.modal || !this.window.visible()) {
            return;
        }

        if (this._onKeyPressBind) {
            document.stopObserving('keyup', this._onKeyPressBind);
        }

        this.window.removeClassName('shown');

        if (this.config.listeners && this.config.listeners.hide) {
            this.config.listeners.hide.call(this);
        }

        if (this.config.destroy) {
            this.window.remove();
        }

        this.maskCounted = 0;
        if (!--window.firecheckoutMaskCounter) {
            this.mask.removeClassName('mask-visible');
            document.fire('firecheckout:window:mask:hide');
        }
    },

    setModal: function(flag) {
        this.modal = flag;

        if (flag) {
            this.window.select('.close').invoke('hide');
        } else {
            this.window.select('.close').invoke('show');
        }
        return this;
    },

    setErrorMessages: function(messages) {
        var ul = '<ul class="messages"><li class="error-msg"><ul>';
        for (var i in messages) {
            if (!messages.hasOwnProperty(i)) {
                continue;
            }
            ul += '<li>' + messages[i] + '</li>';
        }
        ul += '</ul></li></ul>';
        this.content.insert({
            top: ul
        });
        return this;
    },

    update: function(content, size) {
        var oldContent = this.content.down();
        if (oldContent) {
            $(document.body).insert(oldContent.hide());
        }

        this.content.update(content);
        content.show();
        this.addActionBar();
        this.updateSize(size);
        this.center();
        return this;
    },

    addActionBar: function() {
        this.removeActionBar();

        var agreementId = this.content.down().id.replace('-window', ''),
            trigger     = this.config.triggers[agreementId];

        if (trigger && trigger.actionbar && !trigger.actionbar.hidden) {
            actionbar = trigger.actionbar;
        } else if (this.config.actionbar && !this.config.actionbar.hidden) {
            actionbar = this.config.actionbar;
        } else {
            return;
        }

        this.content.insert({
            after: '<div class="actionbar">' + actionbar.html + '</div>'
        });
        $(actionbar.el).observe(
            actionbar.event,
            actionbar.callback.bindAsEventListener(this, agreementId.replace('firecheckout-', ''))
        );
    },

    removeActionBar: function() {
        var agreementId = this.content.down().id.replace('-window', ''),
            trigger     = this.config.triggers[agreementId];

        if (trigger && trigger.actionbar) {
            var actionbar = $(trigger.actionbar.el);
            if (actionbar) {
                actionbar.stopObserving(trigger.actionbar.event);
            }
        }

        this.window.select('.actionbar').invoke('remove');
    },

    getActionBar: function() {
        return this.window.down('.actionbar');
    },

    center: function() {
        var viewportSize   = document.viewport.getDimensions(),
            viewportOffset = document.viewport.getScrollOffsets(),
            windowSize     = this.window.getDimensions(),
            left, top;

        if ('undefined' === typeof viewportSize.width) { // mobile fix. not sure is this check is good enough.
            top  = viewportOffset.top + 20;
            left = viewportOffset.left;
        } else {
            top = viewportSize.height / 2 - (windowSize.height / 2 + 50) + viewportOffset.top;
            left = viewportSize.width / 2 - windowSize.width / 2 + viewportOffset.left;

            if (left < viewportOffset.left || windowSize.width > viewportSize.width) {
                left = viewportOffset.left;
            }
            top = (top < viewportOffset.top  ? (20 + viewportOffset.top) : top);
        }

        this.setPosition(left, top);
        this.centered = true;

        return this;
    },

    setPosition: function(x, y) {
        this.window.setStyle({
            left: x + 'px',
            top : y + 'px'
        });

        return this;
    },

    activate: function(trigger) {
        trigger = this.config.triggers[trigger];
        this.update(trigger.window.show(), trigger.size).show();
    },

    updateSize: function(sizeConfig) {
        sizeConfig = sizeConfig || this.config.size;
        // reset previous size
        this.window.setStyle({
            width : 'auto',
            height: 'auto',
            left  : 0, /* thin content box fix while page is scrolled to the right */
            top   : 0
        });
        this.content.setStyle({
            width : isNaN(sizeConfig.width)  ? sizeConfig.width  : sizeConfig.width + 'px',
            height: isNaN(sizeConfig.height) ? sizeConfig.height : sizeConfig.height + 'px'
        });

        var state = this.window.hasClassName('shown');
        this.window.setStyle({
            visibility: 'hidden'
        }).addClassName('shown');

        var width        = this.window.getWidth(),// + 30, /* close btn */
            viewportSize = document.viewport.getDimensions();

        sizeConfig = Object.extend(this.config.size, sizeConfig || {});
        if (width > sizeConfig.maxWidth || width >= viewportSize.width) {

            if (width >= viewportSize.width && viewportSize.width < (sizeConfig.maxWidth + 30)) {
                width = viewportSize.width - 30; /* right shadow and borders */
            } else {
                width = sizeConfig.maxWidth;
            }
            var paddingHorizontal =
                    parseInt(this.window.getStyle('padding-left')) +
                    parseInt(this.window.getStyle('padding-right'));

            this.content.setStyle({
                width: width - paddingHorizontal + 'px'
            });
        }

        var actionbar       = this.getActionBar(),
            actionbarHeight = actionbar ? actionbar.getHeight() : 0,
            height          = this.content.getHeight() + actionbarHeight + 20;
        if ('auto' === sizeConfig.height &&
            (height > sizeConfig.maxHeight || height >= viewportSize.height)) {

            if (height >= viewportSize.height && viewportSize.height < (sizeConfig.maxHeight + actionbarHeight + 20)) {
                height = viewportSize.height - 90; /* bottom shadow */
            } else {
                height = sizeConfig.maxHeight;
            }
            height -= actionbarHeight;
            this.content.setStyle({
                height: height + 'px'
            });
        }

        if (this.content.getHeight() < this.content.scrollHeight) {
            this.window.addClassName('has-scrollbar');
        } else {
            this.window.removeClassName('has-scrollbar');
        }

        if (!state) {
            this.window.removeClassName('shown')
        }

        // update window size. Fix for all IE browsers
        this.window.setStyle({
            width: width + 'px',
            visibility: ''
        });

        return this;
    },

    _prepareMarkup: function() {
        if (!(this.mask = $('firecheckout-mask'))) {
            this.mask = new Element('div');
            this.mask.writeAttribute('id', 'firecheckout-mask');
            $(document.body).insert(this.mask);
        }

        this.window = new Element('div');
        this.window.addClassName('firecheckout-window');
        this.window.update(this.config.markup);
        this.content = this.window.select('.fc-window-content')[0];
        this.close   = this.window.select('.close')[0];
        $(document.body).insert(this.window);
    },

    _onWindowResize: function() {
        this.updateSize();
        this.center();
    },

    _attachEventListeners: function() {
        // close window
        this.close.observe('click', this.hide.bind(this));

        // resize
        if ('addEventListener' in window) {
            window.addEventListener('resize', this._onWindowResize.bind(this));
        } else {
            window.attachEvent('onresize', this._onWindowResize.bind(this));
        }

        // show window
        if (this.config.triggers) {
            for (var i in this.config.triggers) {
                var trigger = this.config.triggers[i];
                if (typeof trigger === 'function') {
                    continue;
                }
                trigger.size = trigger.size || {};
                for (var j in this.config.size) {
                    if (trigger.size[j]) {
                        continue;
                    }
                    trigger.size[j] = this.config.size[j];
                }

                this._observeTriggerEvents(trigger);
            }
        }
    },

    _observeTriggerEvents: function(trigger) {
        trigger.el.each(function(el) {
            var t = trigger;
            el.observe(t.event, function(e) {
                if (typeof event != 'undefined') { // ie9 fix
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
                Event.stop(e);

                if (!t.window) {
                    return;
                }
                this.update(t.window, t.size).show();
            }.bind(this));
        }.bind(this));
    },

    _onKeyPress: function(e) {
        if (e.keyCode == 27) {
            this.hide();
        }
    }
};
