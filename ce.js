'use strict';

import { Class as ClassMixin, Mixin, toExtendable } from 'foibles';

/**
 * Export customElements.define as simply define.
 */
export const define = window.customElements.define.bind(window.customElements);

// Symbol used to mark the prototype
const customElementMarker = Symbol('customElementMarker');

/**
 * Create a class that extends the given superclass that fulfills the
 * constructor requirements of the Custom Elements polyfill and calls a
 * init() method during creation.
 *
 */
function create(SuperClass) {
	const customElement = class extends SuperClass {
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
	};
	customElement[customElementMarker] = true;
	return toExtendable(customElement);
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

export function Class(func) {
	if(func[customElementMarker]) {
		return toExtendable(func);
	}

	return ClassMixin(HTMLCustomElement, func);
}

/**
 * Export Mixin and Class for easily creating new mixins.
 */
export { Mixin };
