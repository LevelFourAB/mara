'use strict';

import camelCase from 'lodash/string/camelCase';
import chain from './util/chain';

function Builder(name) {
	this._builder_name = name;
	this._builder_proto = HTMLElement.prototype;
	this._builder_attributes = {};
	this._builder_properties = {};
}

Builder.prototype.extends = function(el, proto) {
	this._builder_extends = el;
	this._builder_proto = proto;
	return this;
};

Builder.prototype.defineAttribute = function(attribute, opts) {
	if(typeof opts === 'function') {
		opts = {
			callback: opts
		};
	}

	this._builder_attributes[attribute] = opts;
	return this;
};

Builder.prototype.withAttribute = Builder.prototype.defineAttribute;

Builder.prototype.onCreated = function(cb) {
	this.createdCallback = cb;
	return this;
};

Builder.prototype.onAttached = function(cb) {
	this.attachCallback = cb;
	return this;
};

Builder.prototype.onDetached = function(cb) {
	this.detachedCallback = cb;
	return this;
};

Builder.prototype.withTemplate = function(template) {
	this._builder_template = template;
	return this;
};

Builder.prototype.withAttributes = function() {
	for(var i=0; i<arguments.length; i++) {
		this._builder_attributes[arguments[i]] = {};
	}
	return this;
};

Builder.prototype.defineProperty = function(name, def) {
	this._builder_properties[name] = def;
};

Builder.prototype.withProperty = Builder.prototype.defineProperty;

Builder.prototype.register = function() {
	let element = Object.create(this._builder_proto);

	// Copy all of the properties from this builder onto the prototype
	for(let key in this) {
		if(this.hasOwnProperty(key) && ! key.match(/^_builder_/)) {
			element[key] = this[key];
		}
	}

	for(let key in this._builder_properties) {
		if(this._builder_properties.hasOwnProperty(key)) {
			Object.defineProperty(element, key, this._builder_properties[key]);
		}
	}

	// If withTemplate has been used replace the created callback
	if(this._builder_template) {
		var oldCreated = element.createdCallback;
		var template = this._builder_template;
		element.createdCallback = function() {
			this.template = template.createInstance(this);
			this.textContent = '';
			this.appendChild(this.template);

			if(oldCreated) oldCreated.apply(this, arguments);
		};
	}

	element.attachedCallback = chain(element.attachedCallback, function() {
		if(! this.hasBeenAttached) {
			this.hasBeenAttached = true;
			if(this.domReadyCallback) {
				setTimeout(this.domReadyCallback.bind(this), 0);
			}
		}
	});

	var attrs = this._builder_attributes;

	// Setup attributes <-> properties
	let makeProperty = function(key, opts) {
		Object.defineProperty(element, camelCase(key), {
			get: opts.get || function() { return this.getAttribute(key); },
			set: opts.set || function(value) { return this.setAttribute(key, value); }
		});
	};

	for(var attr in attrs) {
		if(attrs.hasOwnProperty(attr) && ! this._builder_properties.hasOwnProperty(attr)) {
			makeProperty(attr, attrs[attr]);
		}
	}

	// Setup the optional updaters
	element.attributeChangedCallback = function(attr, oldVal, newVal) {
		var opts = attrs[attr];
		if(opts && opts.callback) {
			opts.callback.call(this, oldVal, newVal);
		}
	};

	var data = {
		prototype: element
	};
	if(this._builder_extends) {
		data.extends = this._builder_extends;
	}
	document.registerElement(this._builder_name, data);
};

export default {
	define: function(name, cb) {
		var b = new Builder(name);
		cb(b);
		b.register();
	}
};
