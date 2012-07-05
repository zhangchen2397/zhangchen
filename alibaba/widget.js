/**
 * 组件模块提供了编写组件时需要的基类和接口。
 * @module widget
 * @requires core
 * @requires dom
 */
AE.define('widget', [ 'core', 'dom' ], function (core, dom) {
	var exports = this.exports,

		slice = Array.prototype.slice;
	/**
	 * 组件基类
	 * <p>
	 *
	 * </p>
	 * @class widget.Base
	 * @extends core.Base
	 * @constructor
	 */
	exports.Base = (function () {
		var ctor = core.extend(core.Base, {
			/*
			 * 构造函数。
			 * @protected
			 * @method _ctor
			 * @param config {Object} 配置。
			 * @param [config.wrapper] {Object} 作为组件容器的DOM节点包装对象。
			 */
			_ctor: function (config) {
				this._wrapper = config.wrapper;
				this._name = config.NAME;
			},

			/*
			 * 初始化函数。
			 * @protected
			 * @method _dtor
			 */
			_izer: function (config) {
				this.hijack('render')

					.hijack('get')

					.hijack('set');

				this.on('before:get', function (e, ex) {
					return this._fire('before:get:' + ex.args[0]);
				});

				this.on('after:get', function (e, ex) {
					return this._fire('after:get:' + ex.args[0]);
				});

				this.on('before:set', function (e, ex) {
					return this._fire('before:set:' + ex.args[0], ex.args[1]);
				});

				this.on('after:set', function (e, ex) {
					return this._fire('after:set:' + ex.args[0], ex.args[1]);
				});

				this.defineProperties({
					disabled: {
						get: function (key, config) {
							return config.value;
						},
						set: function (key, value, config) {
							var wrapper = this._wrapper,
								className = 'ui-' + this._name + '-disabled';

							if (config.value !== value) {
								if (config.value = value) {
									wrapper.addClass(className);
								} else {
									wrapper.removeClass(className);
								}
							}
						},
						configurable: false,
						value: false
					},

					focused: {
						get: function (key, config) {
							return config.value;
						},
						set: function (key, value, config) {
							var wrapper = this._wrapper,
								className = 'ui-' + this._name + '-focused';

							if (config.value !== value) {
								if (config.value = value) {
									wrapper.addClass(className);
								} else {
									wrapper.removeClass(className);
								}
							}
						},
						configurable: false,
						value: false
					},

					visible: {
						get: function (key, config) {
							return config.value;
						},
						set: function (key, value, config) {
							var wrapper = this._wrapper,
								className = 'ui-' + this._name + '-hidden';

							if (config.value !== value) {
								if (config.value = value) {
									wrapper.removeClass(className);
								} else {
									wrapper.addClass(className);
								}
							}
						},
						configurable: false,
						value: true
					}
				});

				if (!config.DELAY_RENDER) {
					this.render();
				}
			},

			_renderer: function () {
				this._renderUI();
				this._bindUI();
				this._syncUI();
			},

			_renderUI: function () {},

			_bindUI: function () {},

			_syncUI: function () {},

			render: function () {
				this._wrapper.addClass('ui-' + this._name);
				this._renderer();
				this.render = function () {};
			}
		}, {
			NAME: 'base',
			DELAY_RENDER: false
		});

		return ctor;
	}());
});
