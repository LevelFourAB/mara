'use strict';

import ce from '../ce';
import api from './api';

class Select extends ce.HTMLCustomSelectElement.with(api.FormInput) {

	get maraType() {
		return this.getAttribute('mara-type');
	}

	toData() {
		var type = this.maraType || 'text';
		var adapter = api.adapterFor(type);
		if(adapter) {
			return adapter.toData(this.value);
		}

		return this.value;
	}

	fromData(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		this.value = adapter ? adapter.fromData(data) : data;
		// TODO: Does this actually work?
	}
}

ce.define('mara-select', Select, { extends: 'select' });
