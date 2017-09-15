# Mara

Mara is a MIT licensed, pick-n-mix style library for web sites, built around
polyfilling future web standards such as [DOM4](http://www.w3.org/TR/2015/WD-dom-20150428/)
and [Custom Elements](http://www.w3.org/TR/custom-elements/) and enhancing them
with a few extra utilities.

## Custom Elements

The base of Mara is a set of extensions for Custom Elements to make it easier
to build both simple and advanced elements.

Mara provides `HTMLCustomElement` which can be used as a base for elements:

```javascript
import { HTMLCustomElement, define } from 'mara/ce';

define('test-element', class extends HTMLCustomElement {
	createdCallback() {
		// This callback is invoked when the element is constructed

		// Make sure to always call the super-method of callbacks
		super.createdCallback();

		...
	}
});
```

Note: To maximize compatibility with different polyfills, use `createdCallback`
instead of `constructor` during element creation.

`HTMLCustomElement` also provides support for mixins via the static method
`HTMLCustomElement.with(mixin1, mixin2, ...)`.

### Initial rendering

The Custom Elements specification enforces things such as not changing attributes
during element construction and most of the initialization of an element should
be done in `connectedCallback`. But `connectedCallback` can be called several
times and in many cases you only want to do something the first time an element
is connected to the DOM.

The mixin `InitialRender` provides a callback that will only be called once:

```javascript
import { HTMLCustomElement, InitialRender, define } from 'mara/ce';

define('test-element', class extends HTMLCustomElement.with(InitialRender) {
	initialRenderCallback() {
		// This is called when we are first connected to the DOM

		// Make sure to always call the super-method of callbacks
		super.initialRenderCallback();

		...
	}
});
```

### DOM Ready

If an element needs access to its children you can use the `DOMReady` mixin
to get a callback when the children are available.

```javascript
import { HTMLCustomElement, DOMReady, define } from 'mara/ce';

define('test-element', class extends HTMLCustomElement.with(DOMReady) {
	domReadyCallback() {
		// This is called when the children of the element are available

		// Make sure to always call the super-method of callbacks
		super.domReadyCallback();

		...
	}
});
```

## Attributes

A bit of extra care is needed to support `attributeChangedCallback`. When
specifying attributes to observe either in an element or a mixin care
is needed to fetch the attributes of the super class and to call the callback
of the super class:

```javascript
class extends HTMLCustomElement.with(Mixin1, Mixin2) {
	static get observedAttributes() {
		// Be sure to combine own observed attributes with those of the super
		return [ 'attribute1', ...super.observedAttributes ];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// Call super to make sure super class can handle its attributes
		super.attributeChangedCallback();

		switch(name) {
			case 'attribute1':
				// Handle own attribute
				break;
		}
	}
}
```

## Polyfills

Dependening on your environment you might want to polyfill DOM4 support or
Custom Element support.

To import the standard polyfills, such as for DOM4 you can use:

```javascript
import 'mara/polyfill/standard';
```

To include both standard and Custom Elements polyfills use:

```javascript
import 'mara/polyfill/ce';
```

## Mixins

Mixins contain limited functionality that can be composed together to help
with implementation of a new custom element.

```javascript
import { Mixin } from 'mara/ce';

export let CustomMixin = Mixin(superclass => class extends superclass {
	// Callbacks and functions go here
});
```

Mixins themselves can be composed with other mixins:

```javascript
import { Mixin, DOMReady } from 'mara/ce';

export let CustomMixin = Mixin(superclass => class extends superclass.with(DOMReady) {
	domReadyCallback() {
		super.domReadyCallback();

		// Some nifty code for the mixin
	}
});
```
