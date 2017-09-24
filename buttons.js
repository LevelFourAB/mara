
import { Class } from './api';
import { InitialRender } from './initial-render';
import { triggerEvent } from './events';
import { DisableBehavior } from './disabled';
import { FocusableBehavior } from './focus';

/**
 * Mixin that provides the behavior of a button. This set the role of the
 * element to `button`, add support for disabling it and normalize the
 * keyboard behavior.
 */
export const ButtonBehavior = Class(ParentClass => class extends ParentClass.with(FocusableBehavior, DisableBehavior, InitialRender) {
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
				case ' ':
					e.preventDefault();
					if(! this.disabled) {
						triggerEvent(this, 'click');
					}
			}
		});
	}
});

export const Button = ButtonBehavior;

/**
 * Button that acts as a submit button by creating a hidden button that
 * performs the actual form submission.
 */
export const SubmitButton = Class(ParentClass => class extends ParentClass.with(ButtonBehavior) {
	initialRenderCallback() {
		super.initialRenderCallback();

		this.button = document.createElement('button');
		this.button.setAttribute('hidden', '');
		this.appendChild(this.button);

		this.addEventListener('click', function(e) {
			if(e.target != this.button) {
				this.submitCallback();
			}
		});
	}

	submitCallback() {
		this.button.click();
	}
});
