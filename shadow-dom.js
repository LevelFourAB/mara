import { Mixin } from './api';

/**
 * Mixin that attaches a shadow root to the element.
 */
export const ShadowDOM = Mixin(SuperClass => class extends SuperClass {
	createdCallback() {
		super.createdCallback();

		// Always attach an open shadow root
		this.attachShadow({
			mode: 'open'
		});
	}
});
