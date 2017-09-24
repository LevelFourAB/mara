
import { Class } from './api';
import { InitialRender } from './initial-render';
import { FocusLocking, SubtreeFocus } from './focus';
import stack from './page-stack';

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
						this.dialogOpenCallback();
					}
				} else {
					this.dialogCloseCallback();
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
				this.close({ default: true });
			}
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if(this.open) {
			this.dialogCloseCallback();
		}
	}

	close(options = {}) {
		if(options.default) {
			this.dialogDefaultCloseCallback();
			return;
		}

		this.open = false;
	}

	show() {
		this.open = true;
	}

	dialogOpenCallback() {
		this.grabFocus();
	}

	dialogCloseCallback() {
		this.releaseFocus();
	}

	dialogDefaultCloseCallback() {
		this.close();
	}
});

export const ModalDialog = Class(ParentClass => class extends ParentClass.with(Dialog) {
	initialRenderCallback() {
		super.initialRenderCallback();

		this.setAttribute('aria-modal', 'true');
	}

	dialogOpenCallback() {
		super.dialogOpenCallback();

		stack.show(this, () => {
			this.close({ default: true });
		});
	}

	dialogCloseCallback() {
		stack.hide(this);

		super.dialogCloseCallback();
	}
});
