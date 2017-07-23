'use strict';

import createFilter from '../util/filter';

/**
 * Locate the closest matching parent of the given element that matches the
 * given filter.
 */
export default function(el, filter) {
	filter = createFilter(filter);

	let current = el.parentNode;
	while(current && current.nodeType == Node.ELEMENT_NODE) {
		if(filter(current)) {
			return current;
		}

		current = current.parentNode;
	}

	return null;
}
