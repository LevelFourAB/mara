'use strict';

export default function(el, eventName, data) {
	let event = new CustomEvent(eventName, {
		bubbles: true,
		cancelable: true,
		detail: data
	});

	return el.dispatchEvent(event);
}
