'use strict';

import { HTMLCustomElement, define } from '../ce';
import { adapterFor, FormInput } from './api';

export class RadioGroup extends HTMLCustomElement.with(FormInput) {

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
		var adapter = adapterFor(type);
		if(adapter) {
			return adapter.toData(this.value);
		}

		return this.value;
	}

	fromData(data) {
		var type = this.maraType || this.type;
		var adapter = adapterFor(type);
		this.value = adapter ? adapter.fromData(data) : data;
	}
}

define('mara-radio-group', RadioGroup);
