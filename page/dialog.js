'use strict';

import nav from './nav';
import { HTMLCustomElement, InitialRender, define } from '../ce';
import { delegateEventListener, triggerEvent, listenOnce } from '../events';
import stack from './stack';

import transitions from '../transitions';

class Dialog extends HTMLCustomElement.with(InitialRender) {
	initialRenderCallback() {
		super.initialRenderCallback();

		delegateEventListener(this, 'click', 'button[extended-type=close], [data-type=close]', function(e, t) {
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
		super.connectedCallback();

		this._previousFocus = document.activeElement;

		setTimeout(() => {
			listenOnce(this, transitions.eventName, () => {
				this.isOpen = true;
				triggerEvent(this, 'dialog:open');

				// Find what we should focus
				(this.querySelector('[autofocus]') || this.querySelector('.main') || this).focus();
			});

			stack.show(this);

			this.classList.add('mara-dialog-visible');
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		stack.hide(this);
	}

	removeIfVisible() {
		if(! this.classList.contains('mara-dialog-visible')) return;

		this.classList.remove('mara-dialog-visible');

		listenOnce(this, transitions.eventName, () => {
			this.isOpen = false;
			this.remove();

			triggerEvent(this, 'dialog:close');

			if(this._previousFocus) {
				this._previousFocus.focus();
				delete this._previousFocus;
			}
		});
	}

	close() {
		this.classList.remove('mara-dialog-visible');

		listenOnce(this, transitions.eventName, () => {
			this.isOpen = false;
			this.remove();

			triggerEvent(this, 'dialog:close');

			if(this._previousFocus) {
				this._previousFocus.focus();
				delete this._previousFocus;
			}

			nav.go(nav.lastPage);
		});
	}
}

define('mara-dialog', Dialog);
