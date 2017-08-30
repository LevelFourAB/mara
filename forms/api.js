'use strict';

import ce from '../ce';

let empty = function(value) { return value; };

let types = {};
let addType = function(name, toData, fromData) {
	types[name] = {
		toData: toData,
		fromData: fromData || empty
	};
};

let adapterFor = function(type) {
	return types[type];
};

addType('number', parseInt);
addType('range', parseInt);
addType('boolean', function(value) { return "true" == value; });

const FormSection = superclass => class extends superclass {
	init() {
		super.init();

		this.inputs = [];
	}

	addInput(input) {
		const idx = this.inputs.indexOf(input);
		if(idx >= 0) return;
		this.inputs.push(input);
	}

	removeInput(input) {
		const idx = this.inputs.indexOf(input);
		if(idx >= 0) {
			this.inputs.slice(idx, 1);
		}
	}

	toData() {
		const result = {};
		for(const input of this.inputs) {
			result[input.name] = input.toData();
		};
		return result;
	}

	fromData(data) {
		for(const input of this.inputs) {
			input.fromData(data[input.name]);
		}
	}
};

let markAsChanged = function() {
	this.classList.add('mara-changed');
};

const FormInput = superclass => class extends superclass {
	init() {
		super.init();

		this.addEventListener('blur', markAsChanged);
		this.addEventListener('keypress', markAsChanged);
		this.addEventListener('change', markAsChanged);
	}

	connectedCallback() {
		super.connectedCallback();

		let parent = this.parentElement;
		while(parent) {
			if(parent.addInput) break;

			parent = parent.parentElement;
		}

		if(! parent) return;

		this.mlForm = parent;
		parent.addInput(this);
	}

	disconnectedCallback() {
		if(this.mlForm) {
			this.mlForm.removeInput(this);
		}
	}
};

export default {
	FormInput,
	FormSection,
	adapterFor: adapterFor,
	addType: addType
};
