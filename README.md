# Mara

Mara is a MIT licensed, pick-n-mix style base for [Custom Elements](http://www.w3.org/TR/custom-elements/)
built around providing mixins with extensions and common behaviors for web components.

## Creating elements

The base of Mara is a set of extensions for Custom Elements to make it easier
to build both simple and advanced elements.

Mara provides `HTMLCustomElement` which can be used as a base for elements:

```javascript
import { HTMLCustomElement, define } from 'mara';

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

### Attributes

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

## Core mixins

### Initial rendering

The Custom Elements specification enforces things such as not changing attributes
during element construction and most of the initialization of an element should
be done in `connectedCallback`. But `connectedCallback` can be called several
times and in many cases you only want to do something the first time an element
is connected to the DOM.

The mixin `InitialRender` provides a callback that will only be called once:

```javascript
import { HTMLCustomElement, InitialRender, define } from 'mara';

define('test-element', class extends HTMLCustomElement.with(InitialRender) {
  initialRenderCallback() {
    // This is called when we are first connected to the DOM

    // Make sure to always call the super-method of callbacks
    super.initialRenderCallback();

    ...
  }
});
```

### Children Ready

If an element needs access to its children you can use the `ChildrenReady` mixin
to get a callback when the children are available.

```javascript
import { HTMLCustomElement, ChildrenReady, define } from 'mara';

define('test-element', class extends HTMLCustomElement.with(ChildrenReady) {
  childrenReadyCallback() {
    // This is called when the children of the element are available

    // Make sure to always call the super-method of callbacks
    super.childrenReadyCallback();

    ...
  }
});
```

**Help wanted**: This implementation of this mixin could use an overhaul. If
you have ideas or fixes, feel free to open an issue or a pull request.

### Templates via Shadow DOM

A component can be enhanced with a shadow root initalized from a template via
the `Template` mixin:

```javascript
import { HTMLCustomElement, Template, define } from 'mara';

define('test-element', class extends HTMLCustomElement.with(Template) {
  static get templateHTML() {
    return `<h1>Template HTML goes here</h1>

    <div><slot></slot></div>
    `;
  }

  createdCallback() {
    super.createdCallback();
    
    // this.shadowRoot is initialized from the static template
  }
});
```

### Shadow DOM

If a component just needs access to a shadow root but no special template
handling the `ShadowDOM` mixin will create a shadow root that can be used:

```javascript
import { HTMLCustomElement, ShadowDOM, define } from 'mara';

define('test-element', class extends HTMLCustomElement.with(ShadowDOM) {
  createdCallback() {
    super.createdCallback();
    
    // this.shadowRoot is available here
  }
});
```

## Polyfills

Polyfills are provided for the web site or web app that is consuming the elements,
in the case your target environment needs it.

To import the standard polyfills, such as for DOM4 you can use:

```javascript
import 'mara/polyfill/standard';
```

Imported polyfill: [DOM4](https://github.com/WebReflection/dom4).

To include a polyfill just for Custom Elements use:

```javascript
import 'mara/polyfill/ce';
```

Imported polyfill: [Custom Elements (v1)](https://github.com/webcomponents/custom-elements)

For Custom Elements with support for Shadow DOM use:

```javascript
import 'mara/polyfill/webcomponents';
```

Imported polyfill: [Custom Elements (v1)](https://github.com/webcomponents/custom-elements), [ShadyDOM](https://github.com/webcomponents/shadydom), [ShadyCSS](https://github.com/webcomponents/shadycss)

## Creating mixins

Mixins contain limited functionality that can be composed together to help
with implementation of a new custom element.

```javascript
import { Mixin } from 'mara';

export let CustomMixin = Mixin(superclass => class extends superclass {
  // Callbacks and functions go here
});
```

Mixins themselves can be composed with other mixins:

```javascript
import { Mixin, ChildrenReady } from 'mara';

export let CustomMixin = Mixin(superclass => class extends superclass.with(ChildrenReady) {
  childrenReadyCallback() {
    super.childrenReadyCallback();

    // Some nifty code for the mixin
  }
});
```

## Basic behaviors

Mara contains a set of behaviors for creating certain components that need
special attention to keyboard navigation, focus management and accessibility.
These behaviors are provided as mixins and base classes.

### Managing disabled state

These behaviors manage the disabled state of a component and optionally its
children. When a component is disabled it is made inert both from pointer
use and from keyboard use.

```javascript
import { DisableBehavior /* or DisableSubtreeBehavior */ } from 'mara/disabled';

define('test-element', class extends HTMLCustomElement.with(DisableBehavior) {
  ...
});
```

The attribute `disabled` on the HTML element will reflect the disabled state,
so `<element-name disabled>` will disable an element. An element can also
be controlled via the `disabled` property:

```javascript
element.disabled = true;
```

Use `DisableBehavior` if the element does not contain anything focusable or
clickable. `DisableSubtreeBehavior` can be used to disable and maintain the
disabled state of both the element and its children.

### Focusable element

`FocusableBehavior` in `mara/focus` can be used to make an element focusable
via keyboard and clicks:

```javascript
import { FocusableBehavior } from 'mara/focus';

define('test-element', class extends HTMLCustomElement.with(FocusableBehavior) {
  ...
})
```

### Focus locking

When implementing certain components, such as dialogs, it can be useful to
lock the focus to a certain component. A locked focus means that keyboard
navigation via Tab and Shift-Tab will cycle through focusable children of
the element.

```javascript
import { FocusLocking } from 'mara/focus';

define('test-element', class extends HTMLCustomElement.with(FocusLocking) {
  ...
})
```

The property `focusLocked` is made available on the element and can be used to
control the focus lock:

```javascript
element.focusLocked = true;
```

A special version of this behavior is `SubtreeFocus` which adds extensions
for also focusing the first focusable child in the element.

```javascript
import { SubtreeFocus } from 'mara/focus';

define('test-element', class extends HTMLCustomElement.with(SubtreeFocus) {
  ...
})
```

Two functions are available to control the focus:

* `element.grabFocus()` will lock the focus and move focus within the element
* `element.releaseFocus()` will unlock the focus and move focus the element that
  was focused when `grabFocus` was called.

## Component behaviors

Component behaviors are a step up from the basic behaviors and provide mixins
that make elements behave as common components.

### Button

The button behavior provides a button with correct keyboard control, ARIA roles
and support for disabling it. The button will emit a `click` event when it is
invoked both via pointer and keyboard.

```javascript
// Using as a mixin
import { ButtonBehavior } from 'mara/buttons';

class extends HTMLCustomElement.with(ButtonBehavior) {}

// Using as a class
import { Button } from 'mara/buttons';

class extends Button {}
```

### Submit Button

`SubmitButton` is a class/mixin that can be used to create a custom submit
button. This behavior creates a button that submits the form it is a child of.
To integrate properly with forms this behavior manages a hidden button, this
is needed to make forms submittable via keyboard as with a regular `<button>`.

```javascript
import { SubmitButton } from 'mara/buttons';

define('custom-submit', class extends SubmitButton {
  ...

  submitCallback() {
    // Called when button is invoked, can be used to set custom input values

    // Call super to actually submit form
    super.submitCallback();
  }
});
```

### Modal Dialog

A modal dialog is a dialog that is displayed over other content and only allows
interaction with its children.

```javascript
import { ModalDialog } from 'mara/dialogs';

define('custom-dialog', class extends ModalDialog {

  dialogOpenCallback() {
    // Call super to allow dialog to open
    super.dialogOpenCallback();
    
    // Do some extra stuff for dialog here
  }

  dialogCloseCallback() {
    // Do some extra close stuff here

    // Continue to close dialog
    super.dialogCloseCallback();
  }

  dialogDefaultCloseCallback() {

    // Call super to allow the dialog to be closed via default action
    super.dialogDefaultCloseCallback();
  }
});
```

The attribute `open` on the HTML element will reflect if the dialog is open
or not, so `<custom-dialog open>` indicates a dialog that is open. Setting
the property `open` will also open the dialog: `element.open = true`.

The functions `show` and `close` can also be used to show and close the dialog.
