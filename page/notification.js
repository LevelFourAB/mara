'use strict';

import ce from '../ce';
import transitions from '../transitions';

ce.define('mara-notification', function(def) {
	def.attachedCallback = function() {

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
	};

	def.hide = function() {
		this.addOnceEventListener(transitions.eventName, () => {
			this.remove();
		});

		this.classList.remove('active');
	};
});
