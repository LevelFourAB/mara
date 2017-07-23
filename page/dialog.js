'use strict';

import nav from './nav';
import ce from '../ce';
import stack from './stack';

import transitions from '../transitions';

ce.define('mara-dialog', function(def) {
	def.createdCallback = function() {
		this.delegateEventListener('click', 'button[extended-type=close], [data-type=close]', function(e, t) {
			e.preventDefault();
			e.stopImmediatePropagation();

			t.close();
		});

		this.setAttribute('role', 'dialog');
		this.setAttribute('tabindex', '-1');
		this.style.pointerEvents = 'auto';
		this.isOpen = false;
	};

	def.attachedCallback = function() {
		this._previousFocus = document.activeElement;

		setTimeout(() => {
			this.addOnceEventListener(transitions.eventName, () => {
				this.isOpen = true;
				this.triggerEventListener('dialog:open');

				// Find what we should focus
				(this.query('[autofocus]') || this.query('.main') || this).focus();
			});

			stack.show(this);

			this.classList.add('mara-dialog-visible');
		});
	};

	def.detachedCallback = function() {
		stack.hide(this);
	};

	def.removeIfVisible = function() {
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
	};

	def.close = function() {
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
	};
});
