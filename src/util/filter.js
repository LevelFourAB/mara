'use strict';
import isFunction from 'lodash/lang/isFunction';

export default function(selectorOrFunction) {
	if(isFunction(selectorOrFunction)) {
		return selectorOrFunction;
	} else {
		return function(item) {
			return item && item.matches(selectorOrFunction);
		};
	}
}
