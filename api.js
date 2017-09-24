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
 * HTMLCustomElement that is used for custom elements.
 */
export let HTMLCustomElement = create(HTMLElement);


/**
 * Create a class on top of HTMLCustomElement that can also be used as a
 * mixin.
 *
 * @param {function} func
 *   mixin function
 */
export function Class(func) {
	if(func[customElementMarker]) {
		return toExtendable(func);
	}

	return ClassMixin(HTMLCustomElement, func);
}

/**
 * Mixin for creating mixins that can applied to HTMLCustomElement.
 */
export { Mixin };
