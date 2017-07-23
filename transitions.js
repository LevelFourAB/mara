'use strict';

import './events';

var transitionTypes = {
	'WebkitTransition': [ 'webkitTransitionEnd', '-webkit-' ],
	'MozTransition': [ 'transitionend', '-moz-' ],
	'transition': [ 'transitionend' ]
};

let browserPrefix;
let endEvent;
for(var transitionType in transitionTypes) {
	if(document.documentElement.style[transitionType] !== undefined) {
		browserPrefix = transitionTypes[transitionType][1];
		endEvent = transitionTypes[transitionType][0];
		break;
	}
}

var isIE = window.navigator.userAgent.indexOf('MSIE ');

let easings = {};

/**
 * Define a new easing that can be used.
 *
 * @param {string} name The name of the easing function.
 * @param {Function} js An easing function that takes a single parameter t in the range 0 to 1.
 * @param {string} css The CSS equivalent of the JS-function.
 */
function defineEasing(name, js, css) {
	easings[name] = {
		js: js,
		css: css
	};
}

function easingCurveX(x1, y1, x2, y2, t) {
	var v = 1 - t;
	return 3 * v * v * t * x1 +
		3 * v * t * t * x2 +
		t * t * t;
}

function easingCurveY(x1, y1, x2, y2, t) {
	var v = 1 - t;
	return 3 * v * v * t * y1 +
		3 * v * t * t * y2 +
		t * t * t;
}

function createCubicEasing(x1, y1, x2, y2) {
	return function(t, epsilon) {
		var t0 = 0, t1 = 1, t2 = t;
		while(t0 < t1) {
			var x2d = easingCurveX(x1, y1, x2, y2, t2);
			if(Math.abs(x2d - t) < epsilon) {
				return easingCurveY(x1, y1, x2, y2, t2);
			}

			if(t < x2d) {
				t0 = t2;
			} else {
				t1 = t2;
			}

			t2 = (t1 - t0) * 0.5 + t0;
		}

		return easingCurveY(x1, y1, x2, y2, t2);
	};
}

function defineCubicEasing(name, x1, y1, x2, y2) {
	var css = 'cubic-bezier(' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + ')';
	var js = createCubicEasing(x1, y1, x2, y2);

	return defineEasing(name, js, css);
}

defineEasing('linear', function(t) { return t; }, 'linear');
defineEasing('ease', function(t) { return t; }, 'ease');
defineCubicEasing('ease-in-quad', 0.55, 0.085, 0.68, 0.53);
defineCubicEasing('ease-in-cubic', 0.55, 0.055, 0.675, 0.19);
defineCubicEasing('ease-in-quart', 0.895, 0.030, 0.685, 0.220);
defineEasing('ease-out', null, 'ease-out');

class TransitionBuilder {
	constructor(elements) {
		this._elements = elements;
		this._properties = {};
		this._transitionedProperties = [];

		this.setDuration(500);
		this.withEasing('linear');
	}

	_transitionProperty(property) {
		if(! this._transitionedProperties.indexOf(property)) {
			return;
		}

		this._transitionedProperties.push(property);
	}

	_vendorProperty(property, value) {
		if(browserPrefix) {
			this._properties[browserPrefix + property] = value;
		}

		this._properties[property] = value;
	}

	_setVendorStyle(el, property, value) {
		if(browserPrefix) {
			el.style.setProperty(browserPrefix + property, value);
		}

		el.style.setProperty(property, value);
	}

	withEasing(easing) {
		this._easing = easings[easing];

		return this;
	}

	setStyle(property, value) {
		this._transitionProperty(property);
		this._properties[property] = value;

		return this;
	}

	setDuration(duration) {
		if(typeof duration === 'number') {
			duration = duration + 'ms';
		}

		this._duration = duration;
		return this;
	}

	after(func) {
		this._after = func;
		return this;
	}

	_needsManualAnimation(func) {
		// HACK: IE doesn't support CSS transitions on SVG-attributes
		return isIE && (this._properties['stroke-dashoffset']);
	}

	/**
	 * End this transition returning to the previous context.
	 */
	build() {
		var transitioned = this._transitionedProperties.join(',');

		let c = this._transitionedProperties.length;
		function repeat(l) {
			let result = [];
			for(let i=0; i<c; i++) result.push(l);

			return result.join(',');
		}
		//this._vendorProperty('transition-property', transitioned);

		var props = this._properties;
		var after = this._after;

		let self = this;
		var listener = function() {
			// Reset the duration to avoid transitions for regular CSS updates
			self._setVendorStyle(this, 'transition-duration', repeat('0s'));

			if(after) {
				after(this);
			}
		};

		return function(el) {
			if(self._easing) {
				self._setVendorStyle(el, 'transition-timing-function', repeat(self._easing.css));
			}

			if(self._duration) {
				self._setVendorStyle(el, 'transition-duration', repeat(self._duration));
			}

			self._setVendorStyle(el, 'transition-property', transitioned);

			requestAnimationFrame(() => {
				el.addOnceEventListener(endEvent, listener);

				for(var prop in props) {
					el.style.setProperty(prop, props[prop]);
				}
			});
		};
	}

	run(elements) {
		let func = this.build();
		let els = (elements || this._elements);
		if(Array.isArray(els)) {
			els.forEach(func);
		} else {
			func(els);
		}
	}
}

export default {
	eventName: endEvent,

	afterTransition: function(el, callback) {
		el.addOnceEventListener(endEvent, callback);
	},

	transitionViaClass: function(el, cssClass, callback) {
		el.classList.add(cssClass);
		this.afterTransition(el, callback);
	},

	transition(elements) {
		return new TransitionBuilder(elements);
	}
};
