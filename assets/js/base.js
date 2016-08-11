/* ========================================================================
 * base.js v1.0
 * ======================================================================== */

/*****   popup   ******/
+ function($) {
	'use strict';
	var Popup = function(element, options) {
		this.options = options;
		this.$element = $(element);
		this.$dialog = this.$element.find('.popup-dialog');
		this.$backdrop = null;
		this.isShown = null;
		this.show();
	}

	Popup.TRANSITION_DURATION = 300

	Popup.DEFAULTS = {
		backdrop: true
	}
	Popup.prototype.backdrop = function(callback) {
		var that = this;
		var animate = this.$element.hasClass('fade') ? 'fade' : '';
		
		if(this.isShown && this.options.backdrop) {
			var doAnimate = $.support.transition && animate;
			this.$backdrop = $(document.createElement('div'))
				.addClass('popup-backdrop ' + animate)
				.appendTo($(document.body));
				
			this.$element.on('click.dismiss.popup', $.proxy(function (e) {
		        if (e.target !== e.currentTarget) return
		        this.options.backdrop !== 'static' && this.hide()
	      	}, this));
	      
			this.$backdrop.addClass('in');
			if(!callback) return;
			callback();

		} else if(!this.isShown && this.$backdrop) {
			this.$backdrop.removeClass('in');
			var callbackRemove = function() {
				that.removeBackdrop();
				callback && callback();
			}();

		} else if(callback) {
			callback()
		}
	}
	Popup.prototype.show = function() {
		var that = this;
		if(this.isShown) return;
		this.isShown = true;
		
		this.$element.on('click.dismiss.popup', '[data-dismiss="popup"]', $.proxy(this.hide, this));
		this.backdrop(function() {
			!that.$element.parent().length && that.$element.appendTo($(document.body));
			that.$element.show().scrollTop(0);
			that.$element.addClass('in');
		});
	}
	Popup.prototype.hide = function (e) {
    	if (e) e.preventDefault();
		var that = this;
		if(!this.isShown) return;
		this.isShown = false;
		
		this.$element.removeClass('in').off('click.dismiss.popup');
      	this.hidePopup();
  	}
  	Popup.prototype.hidePopup = function () {
	    var that = this;
	    this.$element.hide();
	    this.backdrop();
  	}
  	Popup.prototype.removeBackdrop = function () {
    	this.$backdrop && this.$backdrop.remove();
    	this.$backdrop = null
  	}

	function Plugin(option) {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data('data.popup');
			var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);
			
			if(!data) $this.data('data.popup', (data = new Popup(this, options)))
			else return new Popup(this, options)
		})
	}

	var old = $.fn.popup;
	$.fn.popup = Plugin;
	$.fn.popup.Constructor = Popup;
	$.fn.popup.noConflict = function() {
		$.fn.popup = old;
		return this;
	}
}(jQuery);

/*****   Carousel   ******/
+function ($) {
  'use strict';

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null
	
    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.5'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 3000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)
    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this
    
    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this);
      Plugin.call($carousel, $carousel.data());
      if($(this).find('.pic-cloud').length>0){
      	$(this).append("<div class='pic_bg'></div>");
      	var _cloud1 = $(this).find('.cloud-1').length > 0 ? $(this).find('.cloud-1') : '';
      	var _cloud2 = $(this).find('.cloud-2').length > 0 ? $(this).find('.cloud-2') : '';
      	var _cloud3 = $(this).find('.cloud-3').length > 0 ? $(this).find('.cloud-3') : '';
      	var _cloud4 = $(this).find('.cloud-4').length > 0 ? $(this).find('.cloud-4') : '';
      	var _meadow = $(this).find('.pic-meadow').length > 0 ? $(this).find('.pic-meadow') : '';
      	var _sliderpic = $(this).find('.sliderpic').length > 0 ? $(this).find('.sliderpic') : '';
      	var _rainbow = $(this).find('.pic-rainbow').length > 0 ? $(this).find('.pic-rainbow') : '';
      	setTimeout(function(){_meadow.addClass('fadeIn')},1100);
      	setTimeout(function(){_cloud1.addClass('fadeIn')},1850);
      	setTimeout(function(){_cloud2.addClass('fadeIn')},2600);
      	setTimeout(function(){_sliderpic.addClass('fadeIn')},2700);
      	setTimeout(function(){_rainbow.addClass('fadeIn')},3050);      	
      	setTimeout(function(){_cloud4.toggleClass('fadeInLeft');setInterval(_togglec,8500);},1500);
      	_cloud3.toggleClass('fadeInRight');
      	var _togglec = function(){
      		_cloud4.toggleClass('fadeInLeft').toggleClass('fadeInLeft2');
      	}
      	var _toggled = function(){
      		_cloud3.toggleClass('fadeInRight').toggleClass('fadeInRight2');
      	}
      	
      	setInterval(_toggled,8500);
      }
    })
  })

}(jQuery);

/*****   toggle   ******/
+ function($) {
	'use strict';
	$(document)
		.on('click.data.toggle', '[data-toggle]', function(e) {
			var $this = $(this);
			var option = $this.data();
			var toggleClass = option.toggle ? option.toggle : '';
			$this.toggleClass(toggleClass);
		})
		.on('click.data.togglep', '[data-toggleparent]', function(e) {
			var $this = $(this);
			var option = $this.data();
			var toggleClass = option.toggleparent ? option.toggleparent : '';
			$this.parent().toggleClass(toggleClass);
		})
}(jQuery);
