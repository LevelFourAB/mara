'use strict';

import onThis from './util/onThis';
import delegate from './events/delegate';
import trigger from './events/trigger';
import once from './events/once';

export let delegateEventListener = delegate;
export let triggerEvent = trigger;
export let listenOnce = once;
