
import maintainDisabled from 'ally.js/maintain/disabled';
import disabled from 'ally.js/element/disabled';

import { Mixin } from './api';
import { InitialRender } from './initial-render';

const disabledHandle = Symbol('disabledHandle');

/**
 * Behavior that disables just the current element, ignoring any focusable
 * children.
 */
export let DisableBehavior = Mixin(ParentClass => class extends ParentClass.with(InitialRender) {
	static get observedAttributes() {
		return [ 'disabled', ...super.observedAttributes ];
	}

	/**
	 * Get if this element can be considered disabled.
	 */
	get disabled() {
		return this.hasAttribute('disabled');
	}

	/**
	 * Set if this element is disabled.
	 */
	set disabled(b) {
		if(b) {
			// Set our custom attribute
			this.setAttribute('disabled', '');
		} else {
			// Remove our custom attribute
			this.removeAttribute('disabled');
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback();

		switch(name) {
			case 'disabled':
				if(newValue !== null) {
					disabled(this, true);
				} else {
					disabled(this, false);
				}
				break;
		}
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		if(this.disabled) {
			// If the attribute is set trigger disabling
			disabled(this, true);
		}
	}
});


/**
 * Behavior that enhances an element with support for disabling itself and
 * any focusable elements within it.
 */
export let DisableSubtreeBehavior = Mixin(ParentClass => class extends ParentClass.with(InitialRender) {
	static get observedAttributes() {
		return [ 'disabled', ...super.observedAttributes ];
	}

	/**
	 * Get if this element can be considered disabled.
	 */
	get disabled() {
		return this.hasAttribute('disabled');
	}

	/**
	 * Set if this element is disabled.
	 */
	set disabled(b) {
		if(b) {
			// Set our custom attribute
			this.setAttribute('disabled', '');
		} else {
			// Remove our custom attribute
			this.removeAttribute('disabled');
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback();

		switch(name) {
			case 'disabled':
				if(newValue !== null) {
					if(! this[disabledHandle]) {
						this[disabledHandle] = maintainDisabled({
							context: this
						});
					}
				} else {
					if(this[disabledHandle]) {
						this[disabledHandle].disengage();
						this[disabledHandle] = null;
					}
				}
				break;
		}
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		if(this.disabled) {
			// Apply the same code as in attributeChangedCallback
			this[disabledHandle] = maintainDisabled({
				context: this
			});
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this[disabledHandle]) {
			this[disabledHandle].disengage();
			this[disabledHandle] = null;
		}
	}
});
