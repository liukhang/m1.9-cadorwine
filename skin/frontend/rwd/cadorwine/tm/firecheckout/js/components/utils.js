var FC = FC || {};
FC.Utils = {
    fireEvent: function(el, eventName) {
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName, true, true);
            el.dispatchEvent(evt);
        } else {
            el.fireEvent('on' + eventName);
        }
    },

    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments,
                callNow = (immediate && !timeout);

            clearTimeout(timeout);

            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            }, wait);

            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    shake: function(el) {
        if (!el) {
            return;
        }

        el.addClassName('fc-shake');

        'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'
            .split(' ')
            .each(function(eventName) {
                el.observe(eventName, function() {
                    $(this).removeClassName('fc-shake');
                });
            });
    },

    /**
     * Scroll to element, is it's not visible in the viewport
     * @param  {Element|Enumerable} el
     * @param  {Object} scrollParams
     * @param  {Boolean} force          Scroll despite of the visibility inside the viewport
     * @return {void}
     */
    scrollTo: function(el, scrollParams, force) {
        if (scrollParams === true) {
            force = true;
            scrollParams = {};
        }

        if (!el || (el.first && !el.first())
            || (force !== true && this.isInViewport(el))) {

            if (scrollParams && scrollParams.afterFinish) {
                scrollParams.afterFinish();
            }
            return false;
        }

        scrollParams = Object.extend({
            duration: 0.3,
            offset  : -20
        }, scrollParams || {});

        // make sure that sticky header will not cover scrolled element
        scrollParams.offset -= FC.Sticky.prototype.config.offset_top;

        var firstEl = el.first ? el.first() : el;
        Effect.ScrollTo(firstEl, scrollParams);
    },

    /**
     * Check if element inside the viewport
     * @param  {Element|Enumerable}  el
     * @return {Boolean}
     */
    isInViewport: function(el) {
        var viewportSize = document.viewport.getDimensions(),
            minTopOffset = FC.Sticky.prototype.config.offset_top;

        function check(element) {
            var offset = element.viewportOffset();
            return (
                (offset.top > minTopOffset || (offset.top + element.getHeight() > (30 + minTopOffset))) &&
                offset.left > 0 &&
                offset.top  < viewportSize.height &&
                offset.left < viewportSize.width
            );
        }

        if (el.any) {
            return el.any(check);
        } else {
            return check(el);
        }
    }
};
