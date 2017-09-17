
import { Class, InitialRender } from './ce';
import { FocusLocking, SubtreeFocus } from './focus';
import stack from './page-stack';

/**
 * Symbol used for function called when a dialog is opened.
 */
export const open = Symbol('open');

/**
 * Symbol used for a function called when a dialog is closed.
 */
export const close = Symbol('close');

/**
 * Symbol used for when the default close action for a dialog is invoked.
 */
export const defaultClose = Symbol('defaultClose');

/**
 * Dialog class and mixin. Provides an API similiar to the `<dialog>` element
 * with an `open` and `close` method.
 *
 * The attribute `open` reflects if the dialog is open or not.
 */
export const Dialog = Class(ParentClass => class extends ParentClass
	.with(SubtreeFocus, FocusLocking, InitialRender) {

	static get observedAttributes() {
		return [ 'open', ...super.observedAttributes ];
	}

	get open() {
		return this.hasAttribute('open');
	}

	set open(v) {
		if(v) {
			this.setAttribute('open', '');
		} else {
			this.removeAttribute('open');
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback();

		switch(name) {
			case 'open':
				if(newValue !== null) {
					if(oldValue === null) {
						this[open]();
					}
				} else {
					this[close]();
				}
				break;
		}
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		// Make sure the dialog has the correct tole
		this.setAttribute('role', 'dialog');

		// Add listener to handle closing on escape
		this.addEventListener('keyup', e => {
			if(e.key === 'Escape') {
				this[defaultClose]();
			}
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this.open) {
			this[close]();
		}
	}

	close() {
		this.open = false;
	}

	show() {
		this.open = true;
	}

	[open]() {
		this.focusSubtree();
	}

	[close]() {
		this.releaseFocus();
	}

	[defaultClose]() {
		this.close();
	}
});

export const ModalDialog = Class(ParentClass => class extends ParentClass.with(Dialog) {
	initialRenderCallback() {
		super.initialRenderCallback();

		this.setAttribute('aria-modal', 'true');
	}

	[open]() {
		super[open]();

		stack.show(this, this[defaultClose].bind(this));
	}

	[close]() {
		stack.hide(this);

		super[close]();
	}
});
