'use strict';

import { Mixin, toExtendable } from 'foibles';

/**
 * Export customElements.define as simply define.
 */
export const define = window.customElements.define.bind(window.customElements);

/**
 * Create a class that extends the given superclass that fulfills the
 * constructor requirements of the Custom Elements polyfill and calls a
 * init() method during creation.
 *
 */
function create(superclass) {
	return toExtendable(class extends superclass {
		static get observedAttributes() {
			return [];
		}

		constructor(self) {
			self = super(self);
			self.createdCallback();
			return self;
		}

		connectedCallback() {
		}

		disconnectedCallback() {
		}

		createdCallback() {
		}

		attributeChangedCallback() {
		}
	});
}

/**
 * Export HTMLCustomElement.
 */
export let HTMLCustomElement = create(HTMLElement);

/**
 * Behaviour that adds domReadyCallback that is called when the contents of
 * the element is ready.
 *
 * Uses setTimeout right now, but that might not be the best way to do this.
 */
export const DOMReady = Mixin(superclass => class extends superclass {
	connectedCallback() {
		super.connectedCallback();
		setTimeout(() => this.domReadyCallback(), 0);
	}

	domReadyCallback() {
	}
});

/**
 * Behaviour that adds a hook for performing initial rendering when the
 * element is first connected to the DOM.
 */
const hasBeenRendered = Symbol('hasBeenRendered');
export const InitialRender = Mixin(superclass => class extends superclass {
	connectedCallback() {
		super.connectedCallback();
		if(! this[hasBeenRendered]) {
			this[hasBeenRendered] = true;
			this.initialRenderCallback();
		}
	}

	initialRenderCallback() {
	}
});

/**
 * Export Mixin for easily creating new behaviours without knowledge about mixwith.js
 */
export { Mixin };
