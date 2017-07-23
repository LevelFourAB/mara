'use strict';

import nav from './nav';
import ce from '../ce';
import stack from './stack';

import transitions from '../transitions';

class Dialog extends ce.HTMLCustomElement {
	init() {
		this.delegateEventListener('click', 'button[extended-type=close], [data-type=close]', function(e, t) {
			e.preventDefault();
			e.stopImmediatePropagation();

			t.close();
		});

		this.setAttribute('role', 'dialog');
		this.setAttribute('tabindex', '-1');
		this.style.pointerEvents = 'auto';
		this.isOpen = false;
	}

	connectedCallback() {
		this._previousFocus = document.activeElement;

		setTimeout(() => {
			this.addOnceEventListener(transitions.eventName, () => {
				this.isOpen = true;
				this.triggerEventListener('dialog:open');

				// Find what we should focus
				(this.querySelector('[autofocus]') || this.querySelector('.main') || this).focus();
			});

			stack.show(this);

			this.classList.add('mara-dialog-visible');
		});
	}

	disconnectedCallback() {
		stack.hide(this);
	}

	removeIfVisible() {
		if(! this.classList.contains('mara-dialog-visible')) return;

		this.classList.remove('mara-dialog-visible');

		this.addOnceEventListener(transitions.eventName, () => {
			this.isOpen = false;
			this.remove();

			this.triggerEventListener('dialog:close');

			if(this._previousFocus) {
				this._previousFocus.focus();
				delete this._previousFocus;
			}
		});
	}

	close() {
		this.classList.remove('mara-dialog-visible');

		this.addOnceEventListener(transitions.eventName, () => {
			this.isOpen = false;
			this.remove();

			this.triggerEventListener('dialog:close');

			if(this._previousFocus) {
				this._previousFocus.focus();
				delete this._previousFocus;
			}

			nav.go(nav.lastPage);
		});
	}
}

ce.define('mara-dialog', Dialog);
