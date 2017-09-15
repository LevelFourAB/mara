
import maintainDisabled from 'ally.js/maintain/disabled';
import { Mixin, InitialRender } from './ce';

const disabledHandle = Symbol('disabledHandle');

/**
 * Behavior that enhances an element with support for being disabled.
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
					this[disabledHandle] = maintainDisabled({
						context: this
					});
				} else {
					if(this[disabledHandle]) {
						this[disabledHandle].disengage();
					}
				}
				break;
		}
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		if(this.disabled) {
			// If the attribute is set trigger the setter to update all other attributes
			this.disabled = true;
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this[disabledHandle]) {
			this[disabledHandle].disengage();
		}
	}
});
