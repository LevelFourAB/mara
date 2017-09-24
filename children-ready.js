import { Mixin } from './api';

/**
 * Behaviour that adds childrenReadyCallback that is called when the contents of
 * the element is ready.
 *
 * Uses setTimeout right now, but that might not be the best way to do this.
 */
const childrenReadyTimeout = Symbol('childrenReadyTimeout');
export const ChildrenReady = Mixin(superclass => class extends superclass {
	connectedCallback() {
		super.connectedCallback();

		// Schedule the childrenReadyCallback
		this[childrenReadyTimeout] = setTimeout(() => {
			this[childrenReadyTimeout] = null;
			this.childrenReadyCallback()
		}, 0);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this[childrenReadyTimeout]) {
			// Clear and remove the timeout if it exists
			clearTimeout(this[childrenReadyTimeout]);
			this[childrenReadyTimeout] = null;
		}
	}

	childrenReadyCallback() {
	}
});
