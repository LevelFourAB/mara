import { Mixin } from './api';

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
