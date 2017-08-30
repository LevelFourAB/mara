'use strict';

import { mix } from 'mixwith';

/**
 * Create a class that extends the given superclass that fulfills the
 * constructor requirements of the Custom Elements polyfill and calls a
 * init() method during creation.
 *
 */
function create(superclass) {
	const type = class extends superclass {
		constructor(self) {
			self = super(self);
			self.init();
			return self;
		}

		connectedCallback() {
		}

		disconnectedCallback() {
		}

		init() {
		}
	};

	/*
	 * Mix in some behaviour with this class.
	 */
	type.with = function(...args) {
		return mix(type).with(...args);
	};

	return type;
}

/**
 * Behaviour that adds domReadyCallback that is called when the contents of
 * the element is ready.
 *
 * Uses setTimeout right now, but that might not be the best way to do this.
 */
const DOMReady = superclass => class extends superclass {
	connectedCallback() {
		super.connectedCallback();
		setTimeout(() => this.domReadyCallback(), 0);
	}

	domReadyCallback() {
	}
};

const define = window.customElements.define.bind(window.customElements);
export default {
	HTMLCustomElement: create(HTMLElement),
	HTMLCustomSelectElement: create(HTMLSelectElement),
	HTMLCustomInputElement: create(HTMLInputElement),
	HTMLCustomTextAreaElement: create(HTMLTextAreaElement),
	DOMReady,
	define
};
