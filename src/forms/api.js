'use strict';

import chain from '../util/chain';
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

let defineAsSection = function(el) {
	el.createdCallback = chain(el.createdCallback, function() {
		this.inputs = [];
	});

	el.addInput = function(input) {
		if(! this.inputs) this.inputs = [];
		this.inputs.push(input);
	};

	el.removeInput = function(input) {
		let idx = this.inputs.indexOf(input);
		if(idx > 0) {
			this.inputs.slice(idx, 1);
		}
	};

	el.toData = function() {
		if(! this.inputs) return {};

		var result = {};
		this.inputs.forEach(function(input) {
			result[input.name] = input.toData();
		});

		return result;
	};

	el.fromData = function(data) {
		this.inputs.forEach(function(input) {
			input.fromData(data[input.name]);
		});
	};
};

let markAsChanged = function() {
	this.classList.add('ml-changed');
};

let inputFocusOp = function() {
	this.addEventListener('blur', markAsChanged);
	this.addEventListener('keypress', markAsChanged);
	this.addEventListener('change', markAsChanged);
};

let inputAttachOp = function() {
	let parent = this.parentElement;
	while(parent) {
		if(parent.addInput) break;

		parent = parent.parentElement;
	}

	if(! parent) return;

	this.mlForm = parent;
	parent.addInput(this);
};

let inputDetachOp = function() {
	if(this.mlForm) {
		this.mlForm.removeInput(this);
	}
};

let defineAsInput = function(el) {
	el.attachedCallback = chain(el.attachedCallback, inputAttachOp);
	el.detachedCallback = chain(el.detachedCallback, inputDetachOp);
	el.createdCallback = chain(el.createdCallback, inputFocusOp);
};

export default {
	input: defineAsInput,
	section: defineAsSection,
	adapterFor: adapterFor,
	addType: addType
};
