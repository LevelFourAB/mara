'use strict';

import { HTMLCustomElement, define } from '../ce';
import { listenOnce } from '../events';
import transitions from '../transitions';

class Notification extends HTMLCustomElement {
	connectedCallback() {
		super.connectedCallback();

		let show = () => {
			this.classList.add('active');

			setTimeout(() => this.hide(), 4000);

			delete this.dialog;
		};

		if(this.dialogs && this.dialogs.length > 0) {
			this.count = 0;
			for(const dialog of this.dialogs) {
				if(dialog.isOpen) {
					this.count++;
					listenOnce(dialog, 'dialog:close', () => {
						if(--this.count <= 0) show()
					});
				}
			}

			if(this.count == 0) {
				show();
			}
		} else {
			show();
		}
	}

	hide() {
		listenOnce(this, transitions.eventName, () => {
			this.remove();
		});

		this.classList.remove('active');
	}
};

define('mara-notification', Notification);
