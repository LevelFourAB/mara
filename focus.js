
import { Mixin, InitialRender } from './ce';
import maintainTabFocus from 'ally.js/maintain/tab-focus';
import firstTabbable from 'ally.js/query/first-tabbable';

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

/**
 * Mixin that provides support for locking the tab focus so that Tab and
 * Shift-Tab only moves within the element.
 */
const focusLock = Symbol('focusLock');
export let FocusLocking = Mixin(ParentClass => class extends ParentClass {

	get focusLocked() {
		return !! this[focusLock];
	}

	set focusLocked(v) {
		if(v) {
			// Engage the focus lock
			if(! this[focusLock]) {
				this[focusLock] = maintainTabFocus({
					context: this
				});
			}
		} else {
			// Disengage the focus lock
			if(this[focusLock]) {
				this[focusLock].disengage();
				this[focusLock] = null;
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		// Disconnect focus lock when disconnected from DOM
		if(this[focusLock]) {
			this[focusLock].disengage();
			this[focusLock] = null;
		}
	}
});

/**
 * Mixin to automatically apply a tab focus lock when the element is connected
 * to the DOM.
 */
export let AutoFocusLockBehavior = Mixin(ParentClass => class extends ParentClass.with(FocusLocking) {

	connectedCallback() {
		super.connectedCallback();

		this.focusLocked = true;
	}
});


const previousFocus = Symbol('previousFocus');
export let SubtreeFocus = Mixin(ParentClass => class extends ParentClass {

	get firstTabbableChild() {
		return firstTabbable({
			context: this
		});
	}

	createdCallback() {
		super.createdCallback();

		this.addEventListener('blur', e => {
			if(! this.contains(e.target)) {
				this[previousFocus] = null;
			}
		});
	}

	focusSubtree() {
		this[previousFocus] = document.activeElement;

		if(FocusLocking.isInstance(this)) {
			// Activate the focus lock if supported
			this.focusLocked = true;
		}

		let target = this.firstTabbableChild;
		if(target) {
			target.focus();
		}
	}

	releaseFocus() {
		const previous = this[previousFocus];
		this[previousFocus] = null;

		if(FocusLocking.isInstance(this)) {
			// Deactivate the focus lock if previously activated
			this.focusLocked = false;
		}

		if(previous) {
			previous.focus();
		}
	}
});
