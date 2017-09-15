
import { Mixin, InitialRender } from './ce';

/**
 * Behavior that enhances an element with focus.
 */
export let FocusableBehavior = Mixin(ParentClass => class extends ParentClass.with(InitialRender) {
	initialRenderCallback() {
		super.initialRenderCallback();

		// Set a tabindex attribute if none is set
		if(! this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0');
		}
	}
});
