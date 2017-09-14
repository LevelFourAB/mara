'use strict';

import createFilter from '../util/filter';

export default function(el, event, filter, listener) {
	filter = createFilter(filter);
	const actualListener = function(e) {
		let current = e.target;
		while(current && current != document && ! filter(current)) {
			current = current.parentNode;
		}

		if(current === document || ! current) return;

		listener.call(current, e, el);
	};

	el.addEventListener(event, actualListener);

	return {
		remove() {
			el.removeEventListener(event, actualListener);
		}
	};
}
