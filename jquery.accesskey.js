/*
	Known issues
		- accesskey on label adds accesskey char to the input
*/
(function($){
	// I would use jQuery.sub() to have our own jQuery, but
	// it did not work with .extend($.expr[':']) for whatever reason.
	var $$ = {
		// Tells if the given element is focused now
		'focused': function(el){
			// Works both with jQuery and DOM elements
			if (el.jquery && el.length) el = el[0];
			return el == document.activeElement;
		},
		// Tells if you can enter characters in the field
		// Absolutely incomplete.
		// Just thinking about input[type="range"] and similar makes me shiver
		// Anyway, I stay on the safe side
		'writable': function(el){
			el = $(el);
			var tag = el.get(0).tagName.toLowerCase();
			if (tag == 'textarea') return true;
			if (tag == 'input' && el.attr('type') != 'submit')
				return true;
			return false;
		},
	}

	
	// Init adds labels to the elements
	// We do not need to do this hard work if the user does not use keyboard
	// Thus we only init on first click of tab
	var init = function(){
		// Init only once
		init = null;
		
		$('[accesskey]').each(function(){
			var me = $(this);
			me.after('<kbd class="accesskey">' + me.attr('accesskey') + '</kbd>');
		});
		
		// Trigger redraw to enable transitions
		// Do not understand? Just comment this line and see the result, it's hard to explain
		$('body').width();
	}


	// Main internal controller
	var hints = (function(){
		var body = $('body');
		var shown = false;
		var api = {
			'show': function() { body.addClass('accesskey-shown'); shown = true },
			'hide': function() { body.removeClass('accesskey-shown'); shown = false },
			'shown': function() { return shown }
		}
		api['preview'] = function() {
			if (shown) return true;
			api.show();
			setTimeout(function(){
				api.hide();
			}, 6000);
		}
		return api
	})();


	$(window).bind('keydown.jquery-accesskey', function(e){
		if (e.which == 27 && $$.writable(document.activeElement))
		{
			// Esc to friendly blur
			if (init) init();
			$(document.activeElement).blur();
			hints.preview();
		}
		if (e.which == 9)
		{
			// Tab button trigger
			// We show hints for 6 seconds when somebody presses the Tab key
			if (init) init();
			hints.preview();
		}
	});

	// Working with DOM
	var elements = {
		'getByKey': function(sym){
			var sym = sym.toLowerCase();
			try { var els = $('[accesskey="'+sym+'"]'); }
			catch (err) { return false; }
			if (els.length == 0)
				return false;
			return els;
		},
		'getNextTarget': function(els){
			// If only one element, choose itself
			if (els.length == 1)
				return els.eq(0)

			// Find a focused element
			f = els.filter(function(){ return $$.focused(this) });
			if (f.length == 0 || $$.focused(els.eq(-1)))
				// Focus could be somewhere else, then just focus the first one
				return els.eq(0)
			else
				// Move on to the next element after the focused
				return els.eq(els.index(f)+1);
		},
	}

	// Shortcut keys
	$(window).bind('keypress.jquery-accesskey', function(e){
		// If we are in the field, just let the user type. :)
		if ($$.writable(e.target)) return true;

		// Find elements with this accesskey
		els = elements.getByKey(String.fromCharCode(e.which));
		if (!els) return true;

		target = elements.getNextTarget(els).focus();
		// Prevent the letter from being put into the field
		if ($$.writable(target)) return false;
	});
})(jQuery);