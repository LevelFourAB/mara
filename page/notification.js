'use strict';

import ce from '../ce';
import transitions from '../transitions';

class Notification extends ce.HTMLCustomElement {
	connectedCallback() {
		let show = () => {
			this.classList.add('active');

			setTimeout(() => this.hide(), 4000);

			delete this.dialog;
		};

		if(this.dialog) {
			if(this.dialog.isOpen) {
				this.dialog.addOnceEventListener('dialog:close', show);
			} else {
				show();
			}
		} else {
			show();
		}
	}

	hide() {
		this.addOnceEventListener(transitions.eventName, () => {
			this.remove();
		});

		this.classList.remove('active');
	}
};

ce.define('mara-notification', Notification);
