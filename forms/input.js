'use strict';

import ce from '../ce';
import api from './api';

class Input extends ce.HTMLCustomInputElement.with(api.FormInput) {

	get maraType() {
		return this.getAttribute('mara-type');
	}

	toData() {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		var value = this.value;
		switch(this.type) {
			case 'checkbox':
				if(! this.checked) {
					value = null;
				}
				break;
			case 'file':
				let files = [];
				for(let i=0; i<this.files.length; i++) {
					let file = this.files[i];
					files.push({
						id: 'file-' + (fileId++),
						name: file.name,
						size: file.size,
						type: file.type,
						data: file
					});
				}

				if(this.multiple) {
					value = files;
				} else {
					value = files[0];
				}
				break;
		}

		if(adapter) {
			return adapter.toData(value);
		}

		return value;
	}

	fromData(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		var value = adapter ? adapter.fromData(data) : data;
		switch(this.type) {
			case 'checkbox':
				if(value) {
					this.checked = true;
				}
				break;
			default:
				this.value = value;
		}
	}
}

ce.define('mara-input', Input, { extends: 'input' });
