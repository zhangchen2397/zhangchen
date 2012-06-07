/**
 * Custom Event
 * 
 * @example
 * <pre>
 * 	function Foo() {}
 * 	Foo.prototype.render = function() {
 *  	this.fire('rendered');
 *  };
 *  EventTarget.mixin(Foo);
 *  var foo = new Foo();
 *  foo.on('rendered', function(){
 *  	alert('rendered fired!');
 * 	});
 * 	foo.render();
 * </pre>
 * @module EventTarget
 * @author wiky
 * @verson 0.01
 */

function EventTarget() {}

EventTarget.prototype = {
	/**
	 * create and bind an event to this Object.
	 * 
	 * @param  {String} name    Event name
	 * @param  {Function} handler Event handler
	 * @param  {Object} [params]
	 * @param  {Object} [scope]
	 * @return {Boolean}		Is bind success
	 */
	on: function(name, handler, params, scope) {
		var ret = false;

		this._events = this._events || {};
		this._events[name] = this._events[name] || [];
		if (typeof name === 'string' && typeof handler === 'function') {
			this._events[name].push({
				fn: handler,
				params: params || {},
				scope: scope || this
			});
			ret = true;
		}

		return ret;
	},
	/**
	 * detach an event from this Object.
	 * 
	 * @param  {String} name    Event name
	 * @param  {Function} [handler] [description]
	 * @return {Boolean}         Is detach success
	 */
	detach: function(name, handler) {
		var arr, ret = false, new_arr = [];

		this._events = this._events || {};
		arr = this._events[name];
		if (arr instanceof Array) {
			if (typeof handler === 'function') {
				for (var i = 0, len = arr.length; i < len; i++) {
					if (arr[i] && arr[i].fn !== handler) {
						new_arr.push(arr[i]);
					}
				}
				this._events[name] = new_arr;
			} else {
				delete this._events[name];
			}
			ret = true;
		}

		return ret;
	},
	/**
	 * Fire the custom event.
	 * 
	 * @param  {String} name Event name
	 * @param  {Object} [args] Event arguments
	 * @return {Boolean}	Break out or not
	 */
	fire: function(name, args) {
		var arr, ret = true, result;

		this._events = this._events || {};
		arr = this._events[name];
		if (arr instanceof Array) {
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] && arr[i].fn) {
					result = arr[i].fn.call(arr[i].scope || this, name, args, arr[i].params);
					ret = ret && !result;
				}
			}
		}

		return !ret;
	}
};
/**
 * Mix the prototype method('on', 'detach', 'fire') to the destination object.
 * eg. EventTarget.mixin(Foo) will make Foo able to use EventTarget.
 * 
 * @static
 * @param {Object} target The destination object
 */
EventTarget.mixin = function(target) {
	var props = ['on', 'detach', 'fire'];
	for (var i = 0, len = props.length; i < len; i++) {
		if (target.prototype) {
			target.prototype[props[i]] = EventTarget.prototype[props[i]];
		} else if (typeof target === 'object' && !(target instanceof Array)) {
			target[props[i]] = EventTarget.prototype[props[i]];
		}
	}
};