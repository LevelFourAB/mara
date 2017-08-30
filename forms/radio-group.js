'use strict';

import ce from '../ce';
import api from './api';

class RadioGroup extends ce.HTMLCustomElement.with(api.FormInput) {

	get maraType() {
		return this.getAttribute('mara-type');
	}

	get name() {
		return this.getAttribute('name');
	}

	get value() {
		var input = this.querySelector('input[type=radio]:checked');
		return input ? input.value : null;
	}

	set value(v) {
		this.querySelectorAll('input[type=radio]').forEach(function(input) {
			input.checked = input.value === v;
		});
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
	}
}

ce.define('mara-radio-group', RadioGroup);
