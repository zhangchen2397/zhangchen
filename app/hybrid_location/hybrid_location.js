 /**
 * 地区混合组件提供用户输入提示（自动完成）和弹出已经分组的区域给用户进行选择
 * <a href="http://style.aliui.com/js/5v/app/hybrid_location/demo.html" target="_blank">点击查看demo</a>
 * @module AE.app.HybridLocation
 * @requires AE,AutoSuggestion,LocationiSelect
 * @title HybridLocation app
 */
AE.namespace('AE.app').HybridLocation = (function(AutoSuggestion, LocationSelect){
	var Y = YAHOO;
	/**
	* @class HybridLocation
	* @constructor
	* @param uConfig {Object} 配置文件
	*/
	function HybridLocation(uConfig){
		/**
		* 默认配置
		*/
		var defConfig = {
				/**
				 * 控件容器
				 * @config elContainer
				 * @type {HTMLElement | String | Object}
				 */
				elContainer : '',
				/**
				 * 文本框
				 * @config elInput
				 * @type {HTMLElement | String | Object}
				 */
				elInput : '',
				/**
				 * 按扭
				 * @config elButton
				 * @type {HTMLElement | String | Object}
				 */
				elButton : '',
				/**
				 * JSON数据
				 * @config jsonData
				 * @type {Json}
				 */
				jsonData : null,
				/**
				 * 控件高亮样式
				 * @config inputPrehighlightClass
				 * @type {String}
				 * @default 'country-c-prehighlight'
				 */
				inputPrehighlightClass : 'country-c-prehighlight',
				/**
				 * 区域选择组件配置
				 * @config locationSelectConfig
				 * @type {Object}
				 */
				locationSelectConfig : {},
				/**
				 * 自动完成组件配置
				 * @config autoSuggestionConfig
				 * @type {Object}
				 */
				autoSuggestionConfig : {}
			},
			defLocationSelectConfig = {
				groupKey :  'region',
				groupValue: '',
				key: 'name',
				value: 'value'
			},
			defAutoSuggestionConfig = {
				showNumber : 10, 
				primaryKey : 'name',
				keys : ['name','value'], 
				optionHtmlFormat : function(oItem){
					if(oItem.value != ''){
						return oItem.name + ' ('+oItem.value+')';
					}else{
						return oItem.name;
					}
				}
			};
		//合并HybridLocation config
		this.config = YL.merge(defConfig, uConfig);
		//合并AutoSuggestion config
		this.asConf =  YL.merge(defAutoSuggestionConfig, uConfig.autoSuggestionConfig);
		//合并LocationSelect config
		this.lsConf =  YL.merge(defLocationSelectConfig, uConfig.locationSelectConfig);
		//初始化
		this._init();
	}
	
	/**
	 * 自动完成组件
	 * @property autoSuggestion
	 * @type AE.app.AutoSuggestion
	 */
	/**
	 * 区域选择组件
	 * @property locationSelect
	 * @type AE.app.LocationSelect
	 */
	
	HybridLocation.prototype = {
		/**
		 * 初始化
		 * @method  _init
		 * @private
		 */
		_init: function(){
			this.elContainer = YUD.get(this.config.elContainer);
			this.elInput = YUD.get(this.config.elInput);
			this.elButton = YUD.get(this.config.elButton);
			if(!this.elContainer || !this.elInput || !this.elButton){
				return;
			}
			
			// 填充AutoSuggestion的config
			this.asConf.elInput = this.elInput;
			this.asConf.jsonData =  this.config.jsonData;
			// 填充LocationSelect的config
			this.lsConf.elInput = this.elInput;
			this.lsConf.elButton = this.elButton;
			this.lsConf.jsonData =  this.config.jsonData;
			
			// 实例化AutoSuggestion
			this._initAutoSuggestion();
			// 实例化LocationSelect
			this._initLocationSelect();
			
			/**
			 * 控件改变事件.
			 * @event itemSelectEvent
			 * @param self {AE.app.HybridLocation} The HybridLocation instance.
			 */
			this.itemSelectEvent = new Y.util.CustomEvent('itemSelectEvent', this);
		},
		/**
		 * 实例化自动完成
		 * @method  _initAutoSuggestion
		 * @private
		 */
		_initAutoSuggestion: function(){
			this.autoSuggestion = new AutoSuggestion(this.asConf);
			this.autoSuggestion.itemSelectEvent.subscribe(this._onChange, this, true);
			this.autoSuggestion.inputBlurEvent.subscribe(this._onInputBlur, this, true);
			this.autoSuggestion.inputFocusEvent.subscribe(this._onInputFocus, this, true);
		},
		/**
		 * 实例化区域选择
		 * @method  _initAutoSuggestion
		 * @private
		 */
		_initLocationSelect: function(){
			var self = this;
			this.locationSelect = new LocationSelect(this.lsConf); 
			this.locationSelect.itemSelectEvent.subscribe(this._onChange, this, true);
			this.locationSelect.closeEvent.subscribe(this._onInputBlur, this, true);
			this.locationSelect.openEvent.subscribe(this._onInputFocus, this, true);
		},
		/**
		 * 控件改变事件处理（不包括文本输入产生的onchange）
		 * @method  _onChange
		 * @private
		 */
		_onChange: function(){
			this.itemSelectEvent.fire(this);
		},
		/**
		 * 文本框聚焦事件处理
		 * @method  _onInputFocus
		 * @private
		 */
		_onInputFocus: function(){
			 this.addHightLight();
		},
		/**
		 * 文本框失焦事件处理
		 * @method _onInputBlur
		 * @private
		 */
		_onInputBlur: function(){
			this.removeHightLight();
		},
		/**
		 * 添加高亮样式
		 * @method addHightLight
		 */
		addHightLight: function(){
			YUD.addClass(this.elContainer, this.config.inputPrehighlightClass);
		},
		/**
		 * 移除高亮样式
		 * @method removeHightLight
		 */
		removeHightLight: function(){
			YUD.removeClass(this.elContainer,this.config.inputPrehighlightClass);
		},
		/**
		 * 验证文本框的值是否有效
		 * @method validate
		 */
		validate : function(){
			return this.autoSuggestion.validate();
		},
		/**
		 * @method toString
		 */
		toString : function(){
			return 'hybridLocation instance';
		}
	};
	
	return HybridLocation;
	
})(AE.app.AutoSuggestion, AE.app.LocationSelect);


//YAHOO.register("hybrid_location", AE.app.HybridLocation, {version: "@VERSION@", build: "@BUILD@"});
