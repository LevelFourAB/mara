'use strict';

export default function(el, event, listener, capture=false) {
	let actualListener = function(e) {
		listener.apply(this, arguments);
		el.removeEventListener(event, actualListener);
	};

	el.addEventListener(event, actualListener, capture);
}
