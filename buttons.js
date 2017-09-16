
import { Mixin, InitialRender } from './ce';
import { triggerEvent } from './events';
import { DisableBehavior } from './disabled';
import { FocusableBehavior } from './focus';

/**
 * Mixin that provides the behavior of a button. This set the role of the
 * element to `button`, add support for disabling it and normalize the
 * keyboard behavior.
 */
export let ButtonBehavior = Mixin(ParentClass => class extends ParentClass.with(DisableBehavior, FocusableBehavior, InitialRender) {
	initialRenderCallback() {
		super.initialRenderCallback();

		// Mark this element as a button
		this.setAttribute('role', 'button');

		/*
		 * Listener that listens for a key press of Enter or Space and
		 * emits a press event.
		 */
		this.addEventListener('keypress', e => {
			switch(e.key) {
				case 'Enter':
				case 'Space':
					e.preventDefault();
					if(! this.disabled) {
						triggerEvent(this, 'click');
					}
			}
		});
	}
});
