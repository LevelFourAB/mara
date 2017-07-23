'use strict';

import onThis from './util/onThis';
import delegate from './events/delegate';
import trigger from './events/trigger';
import once from './events/once';

HTMLElement.prototype.delegateEventListener = onThis(delegate);
HTMLElement.prototype.triggerEventListener = onThis(trigger);
HTMLElement.prototype.addOnceEventListener = onThis(once);

export default {
	delegate: delegate,
	trigger: trigger,
	once: once
};
