/* track-slide
 * version: 1.1.0
 * https://bitbucket.org/c2group/track-slide
 * @preserve
 */

/*exported TrackSlide */

var TrackSlide = (function ($, Dragger) {

    'use strict';

    var moveTo = function (index) {
        index = Math.min(index, this.len - 1);
        index = Math.max(0, index);

        // How far from the left is the item
        var distance = index * this.m.item + index * this.m.gap;

        // If the track is longer than the bounds
        // And the distance to the item is greater than the difference between the bounds and the length of the track
        // Set the distance to the difference
        if (this.m.track > this.m.bounds && distance > this.m.track - this.m.bounds) {
            distance = this.m.track - this.m.bounds;
        }

        this.$track.stop(true).animate({'left': -distance}, 400, 'swing');

        this.dragger.setPosition({
            x: -distance,
            y: 0
        });
        this.current = index;

        //this.events.trigger('done', index, this.len - this.m.fit);
    };

    var onDrag = function (handle) {
        this.$track.css('left', handle.x);
    };

    var onStop = function (handle, hasDragged) {
        if (!hasDragged) return;

        // hard to know what to set the offset value to
        var offset = 0; //(this.m.item / 3);
        var closest = Math.round((handle.x - offset) / (this.m.item + this.m.gap));
        closest = Math.min(0, closest);
        closest = Math.max(closest, -this.len + this.m.fit);
        moveTo.call(this, -closest);
    };

    var getMeasurement = function () {
        var bounds = this.$el.width();
        var track = this.$track.outerWidth();
        var trackPadding = track - this.$track.width();
        var item = this.$items.eq(0).outerWidth();
        var gap = 0;
        if (this.len > 1) {
            gap = this.$items.get(1).getBoundingClientRect().left - this.$items.get(0).getBoundingClientRect().left - item;
        }
        var fit = (bounds - trackPadding + gap) / (item + gap);
        fit = Math.min(Math.floor(fit), this.len);

        return {
            'bounds': bounds,
            'track': track,
            'item': item,
            'gap': gap,
            'fit': fit
        };
    }

    var resize = function () {
        this.m = getMeasurement.call(this);
        moveTo.call(this, this.current);
    };

    var setFocus = function (e) {
        if (this.dragger.isDragging) return;
        var $item = $(e.target).closest('li');
        var index = this.$items.index($item);
        moveTo.call(this, index);
    };

    var bindEvents = function () {
        $(window).on('resize', debounce(resize.bind(this)));
        this.$el.on('focus', 'ul *', setFocus.bind(this));
    };

    var getDraggerOptions = function () {
        return {
            'drag': onDrag.bind(this),
            'stop': onStop.bind(this),
            'allowVerticalScrolling': true
        };
    };

    var init = function () {
        if (!this.$el.length) return false;
        this.$track = this.$el.find('ul');
        if (!this.$track.length) return false;

        // Add an event emitter
        // this.events = new main.EventHandler();

        this.$items = this.$track.find('li');
        this.len = this.$items.length;
        this.m = getMeasurement.call(this);
        this.current = 0;

        this.dragger = new Dragger(this.$el, getDraggerOptions.call(this));

        bindEvents.call(this);
        return true;
    };

    TrackSlide = function (el) {
        this.$el = $(el);
        this.result = init.call(this);
    };

    TrackSlide.prototype.moveTo = moveTo;
    TrackSlide.prototype.resize = resize;

    function debounce(fn) {
        var id;
        return function () {
            var args = arguments;
            if (id !== null) {
                cancelAnimationFrame(id);
            }
            id = requestAnimationFrame(function () {
                fn.apply(null, args);
                id = null;
            });
        };
    }

    return TrackSlide;

}(jQuery || Zepto || $, Dragger));