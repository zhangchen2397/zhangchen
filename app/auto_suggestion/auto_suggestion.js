 /**
 * 自动完成控制提供文本输入建议的前端逻辑和完成功能。
 * 直接多键匹配和多键显示。
 *
 * @module AE.app.AutoSuggestion
 * @requires AE,AutoSuggestion
 * @title AutoSuggestion app
 */
AE.namespace('AE.app').AutoSuggestion = (function(){
	var Y = YAHOO,
		YL = Y.lang,
		YU = Y.util,
		YUD = YU.Dom,
		YUE = YU.Event,
		win = window,
		doc = win.document,
		decode = decodeURIComponent,
		Controller = null,
		View = null,
		Model = null,
		// 合法keyCode字符
		inputKeyCode = '$0$8$32$48$49$50$51$52$53$54$55$56$57$59$65$66$67$68$69$70$71$72$73$74$75$76$77$78$79$80$81$82$83$84$85$86$87$88$89$90$96$97$98$99$100$101$102$103$104$105$106$107$109$110$111$188$190$191$192$219$220$221$222$',
		defConfig = {
			/**
			 * 文本框
			 * @config elInput
			 * @type {HTMLElement | String | Object}
			 */
			elInput : '',
			/**
			 * 查询延时(ms)
			 * @config queryDelay
			 * @type {Int}
			 * @default 100
			 */
			queryDelay : 100,
			/**
			 * 显示条数
			 * @config showNumber
			 * @type {Int}
			 * @default 10
			 */
			showNumber : 10,
			/**
			 * JSON数据
			 * @config jsonData
			 * @type {Json}
			 */
			jsonData : null,
			/**
			 * 查询的键集合
			 * @config keys
			 * @type {Array}
			 */
			keys : [],
			/**
			 * 主键
			 * @config primaryKey
			 * @type {String}
			 */
			primaryKey : '',
			/**
			 * 弹出框Y轴偏移.
			 * @config offsetTop
			 * @type {Int}
			 * @default  0
			 */
			offsetTop : 0,
			/**
			 * 弹出框X轴偏移.
			 * @config offsetLeft
			 * @type {Int}
			 * @default  0
			 */
			offsetLeft : 0,
			/**
			 * 弹出框宽度.
			 * @config width
			 * @type {Int}
			 * @default  0 ,值为0时弹出框的宽度等于文本框宽度
			 */
			width : 0,
			/**
			 * 弹出框容器的样式.
			 * @config suggestionContainerClass
			 * @type {String}
			 * @default  'ae-as-container'
			 */
			suggestionContainerClass : 'ae-as-container',
			/**
			 * 当前选中的样式 .
			 * @config currentItemClass
			 * @type {String}
			 * @default  'current'
			 */
			currentItemClass : 'current',
			/**
			 * 当前不可选的样式 .
			 * @config invalidClass
			 * @type {String}
			 * @default  'invalid'
			 */
			invalidClass : 'invalid',
			/**
			 * 是否在匹配区分大小写.
			 * @config queryMatchCase
			 * @type {Bool}
			 * @default  false
			 */
			queryMatchCase : false,
			/**
			 * 是否进行全匹配.
			 * @config queryMatchContains
			 * @type {Bool}
			 * @default  false
			 */
			queryMatchContains : false,
			/**
			 * 是否只进做主键匹配.
			 * @config queryPrimaryKey
			 * @type {Bool}
			 * @default  false
			 */
			queryPrimaryKey : false,
			/**
			 * 最少匹配数量.
			 * @config minQueryLength
			 * @type {Int}
			 * @default  1
			 */
			minQueryLength : 1,
			/**
			 * 是否显示 warning 提醒
			 */
			showWarning: true,
			/**
			 * 无法匹配的警告的Html文本.
			 * @config inputPreHighlightClass
			 * @type {Html}
			 */
			warningHtml : '',
			/**
			 * 警告框的样式 .
			 * @config warningContainerClass
			 * @type {String}
			 * @default  'ae-as-warning'
			 */
			warningContainerClass : 'ae-as-warning'
		};
	
	Model = function(){
	};
	Model.prototype = {
		/**
		 * Model-初始化
		 * @method  Controller.Model._init
		 * @private
		 */
		_init: function(){
			this.arrayList = this.config.jsonData;
			this.lastUserValue = '';
			this.currentIndex = -1;
			this.isSuggestionShow = false;
			this.isWarningShow = false;
			this.timerId = -1;
			this.invalidNumber = this.showNumber = this.config.showNumber;
		},
		/**
		 * Model-是否有弹出框正在显示
		 * @method  Controller.Model.isShow
		 */
		isShow: function(){
			return this.isWarningShow || this.isSuggestionShow;
		},
		/**
		 * Model-通过Key获取value
		 * @method  Controller.Model.getDataByKey
		 *@param key {String} key name
		 */
		getDataByKey: function(key){
			var oItem = null,
				data = this.arrayList,
				sKey = this.config.key,
				i = 0;
			for(; i<data.length; i++){
				oItem = data[i];
				if(oItem[sKey] == key){
					break;
				}
			}
			return oItem;
		},
		/**
		 * Model- 查询的文本
		 * @method  Controller.Model.queryMatch
		 * @param sQuery {String} 查询的文本
		 * @param bQueryPrimaryKey {Bool} 是否仅查询主键
		 * @return {Array} Data
		 */
		queryMatch: function(sQuery, bQueryPrimaryKey){
			var res = [];
			if(sQuery && sQuery !== '') {
				var  self = this,
				data = this.arrayList,
				bMatchCase = this.config.queryMatchCase,
				bMatchContains =  this.config.queryMatchContains,
				conf = this.config;
				
				// Loop through each result object...
				for(var i = data.length-1; i >= 0; i--) {
					var oItem = data[i]; 
					if(!bQueryPrimaryKey){
					 for(var j=0;j<conf.keys.length;j++){
						var sKey = conf.keys[j];
						var sVal = oItem[sKey];
						var sKeyIndex = (bMatchCase) ?
						sVal.indexOf(decode(sQuery)) :
						sVal.toLowerCase().indexOf(decode(sQuery).toLowerCase());
						
						if((bMatchContains && sKeyIndex >-1) || (!bMatchContains && sKeyIndex === 0)) { 
							res.unshift(oItem);
							break;
						}
					 }
					}else{
						var bMatch = bMatchCase?
						(oItem[conf.primaryKey] == sQuery):
						(oItem[conf.primaryKey].toLowerCase() == sQuery.toLowerCase());
						if(bMatch){
							res.unshift(oItem);
						}
					}
				}
			}
			return res;
		},
		/**
		 * Model-数据格式化
		 * @method  Controller.Model.decorateData
		 * @param sQuery {String} 查询的文本
		 * @param queryList {Array} 将要格式化的数据集
		 * @param aKeys {Array} 需要格式化的键集合
		 * @return {Array} Data
		 */
		decorateData: function(sQuery, queryList, aKeys){
			var res = [],
				i = 0, j, o,
				oItem = null,
				keyIndex,
				sKey, sVal,
				bMatchCase = this.config.queryMatchCase,
				nQueryLength = sQuery.length;
				
			for(; i <queryList.length; i++){
				oItem = queryList[i];
				j = 0;
				o = {};
				for(; j<aKeys.length; j++){
					sKey = aKeys[j];
					sVal = oItem[sKey];
					o['_'+sKey] = sVal;
					
					keyIndex = (bMatchCase) ?
						sVal.indexOf(decode(sQuery)) :
							sVal.toLowerCase().indexOf(decode(sQuery).toLowerCase()); 
					
					if(keyIndex == 0){
						o[sKey] = '<strong>' + sVal.substring(0,nQueryLength) + '</strong>' + sVal.substring(nQueryLength);
					}else{
						o[sKey] = sVal;
					}
				}
				res.unshift(o);
			}
			return res;
		}
	};
	
	View = function(){};
	View.prototype = {
		/**
		 * View-初始化
		 * @method  Controller.View._init
		 * @private
		 */
		_init: function(model, controller){
			this.model = model;
			this.controller = controller;
			
			this.elInput = YUD.get( this.config.elInput );
			this.fatherEl = this.elInput.parentNode;
			this.suggestionEl = doc.createElement('div');
			this.warningEl = doc.createElement('div');
			this.elIterms = [];
			
			if(this.config.optionHtmlFormat){
				this._renderItemInner = this.config.optionHtmlFormat;
			}
			
			this._buildElements();
			this._attachEvent();
		},
		/**
		 * View-创建元素
		 * @method  Controller.View._buildElements
		 * @private
		 */
		_buildElements: function(){
			var divEl = this.suggestionEl, 
				wEl = this.warningEl, 
				pEl = null,
				ifr = null,				
				i = 0;
			divEl.style.display = 'none';
			divEl.style.position = 'absolute';
			divEl.style.zIndex = '999';
			this._setTop(divEl);
			divEl.style.left = this.config.offsetLeft + 'px';
			divEl.className = this.config.suggestionContainerClass;
			this.fatherEl.appendChild( divEl );
			
			if(0 < Y.env.ua.ie && Y.env.ua.ie <= 6){
				ifr =  document.createElement('iframe');
				YUD.setStyle(ifr, 'border', 0);
				YUD.setStyle(ifr, 'padding', 0);
				YUD.setStyle(ifr, 'margin', 0);
				YUD.setStyle(ifr, 'opacity', 0);
				YUD.setStyle(ifr, 'position','absolute');
				YUD.setStyle(ifr, 'left','0');
				YUD.setStyle(ifr, 'top','0');
				YUD.setStyle(ifr, 'zIndex','-1');
				this.iframeMask = ifr;
				divEl.appendChild(ifr);
			}
			
			wEl.style.display = 'none';
			wEl.style.position = 'absolute';
			wEl.style.zIndex = '999';
			this._setTop(wEl);
			wEl.style.left = this.config.offsetLeft + 'px';
			wEl.className = this.config.warningContainerClass;
			this.fatherEl.appendChild( wEl );
			wEl.innerHTML = this.config.warningHtml;
			
			for( ; i < this.model.showNumber; i++ ){
				pEl = doc.createElement('p');
				divEl.appendChild( pEl );
				pEl.setAttribute( 'index', i );
				this.elIterms.push( pEl );
			}

			this._setWidth();
		},
		/**
		 * View-绑定事件
		 * @method  Controller.View._attachEvent
		 * @private
		 */
		_attachEvent: function(){
			var ctrl = this.controller;
			
			YUE.on(this.elInput, 'blur', ctrl._onInputBlur, ctrl, true);
			YUE.on(this.elInput, 'focus', ctrl._onInputFocus, ctrl, true);
			//在事件中使用stopEvent需要注意，要避免使用keydown事件，否则不能输入内容
			YUE.on(this.elInput, 'keyup', ctrl._onInputKeyup, ctrl, true);
			YUE.on(doc ,'mousedown', ctrl._onDocumentDown, ctrl, true);
			YUE.on(this.elIterms, 'mousedown', ctrl._onItemMouseDown, ctrl);
			YUE.on(this.elIterms, 'mouseover', ctrl._onItemMouseOver, ctrl);
		},
		/**
		 * View-设置弹框元素的style.top
		 * @method  Controller.View._setTop
		 * @param el {HTMLElement} 弹框元素
		 * @private
		 */
		_setTop: function(el){
			/*var yPlus = 0;
			if( !this.tmpY ){
				this.tmpY = YUD.getY(this.elInput);
				this.offsetTop = this.elInput.offsetTop + this.elInput.offsetHeight + this.config.offsetTop;
			}else{
				if( this.tmpY != YUD.getY(this.elInput) ){
					yPlus = YUD.getY(this.elInput) - this.tmpY;
				}
			}
			el.style.top = yPlus + this.offsetTop + 'px';*/
			el.style.top  =  this.elInput.offsetTop + this.elInput.offsetHeight + this.config.offsetTop+ 'px';
		},
		/**
		 * View-设置弹框的style.width
		 * @method  Controller.View._setWidth
		 * @private
		 */
		_setWidth: function(){
			var sWidth = (this.config.width == 0) ? this.elInput.offsetWidth - 2 + 'px' : this.config.width + 'px';
			this.suggestionEl.style.width = sWidth;
			this.warningEl.style.width = sWidth;
		},
		/**
		 * View-切换警告框
		 * @method  Controller.View._toggleWarning
		 * @private
		 */
		_toggleWarning: function(show){
			if(show){
				this._hideSuggestion();
				this.warningEl.style.display = 'block';
				this._setTop(this.warningEl);
			}else{
				this.warningEl.style.display = 'none';
			}
		},
		/**
		 * View-渲染单元数据
		 * @method  Controller.View._renderItemInner
		 * @param item {Object}  数据项
		 * @private
		 */
		_renderItemInner: function(item){
			return item[this.config.primaryKey];
		},
		/**
		 * View-渲染数据
		 * @method Controller.View._renderItems
		 * @param datas {Array} 数据集
		 * @private
		 */
		_renderItems: function(datas){
			var i = 0,
				l = this.model.showNumber,
				elIterms = this.elIterms,
				data,
				html,
				validCount = 0;

			for(; i < l; i++ ){
				data = datas[i];
				if(!data){
					break;
				}
				html = this._renderItemInner(data);
				
				elIterms[i].innerHTML = '<span data-value="' + data['_'+this.config.keys[0]]+'">' + html + '</span>';
				YUD.removeClass( elIterms[i], this.config.invalidClass );
				
				validCount ++;
			}
			return validCount;
		},
		/**
		 * View-清除弹框数据
		 * @method  Controller.View._clearItems
		 * @private
		 */
		_clearItems: function(){
			var i = 0,
				items = this.elIterms,
				l = items.length;
				
			this._clearItemsCurrent();
			for(; i < l; i++ ){
				items[i].innerHTML = '';
				YUD.addClass(items[i], this.config.invalidClass );
			}
		},
		/**
		 * View-选中样式处理
		 * @method  Controller.View._applyItemCurrent
		 * @private
		 */
		_applyItemCurrent: function( index ){
			this.elIterms[index].className = this.config.currentItemClass;
		},
		/**
		 * View-移除选中样式
		 * @method  Controller.View._clearItemsCurrent
		 * @private
		 */
		_clearItemsCurrent: function(){
			YUD.removeClass( this.elIterms, this.config.currentItemClass );
		},
		/**
		 * View-显示弹框
		 * @method  Controller.View._showSuggestion
		 * @private
		 */
		_showSuggestion: function(){
			this._setTop(this.suggestionEl);
			this._setWidth();
			this.suggestionEl.style.display = 'block';
			if(this.iframeMask){
				this.iframeMask.style.width =  this.suggestionEl.offsetWidth -2 + 'px';
				this.iframeMask.style.height = this.suggestionEl.offsetHeight -2 + 'px';
			}
		},
		/**
		 * View-隐藏弹框
		 * @method  Controller.View._hideSuggestion
		 * @private
		 */
		_hideSuggestion: function(){
			this.elInput.focus();
			this.suggestionEl.style.display = 'none';
		},
		/**
		 * View-设置文本到文本框
		 * @method  Controller.View.setValue
		 * @param value {String} 文本
		 */
		setValue: function(value){
			this.elInput.value = value;
		},
		/**
		 * View-通过索引获取option值
		 * @method  Controller.View._getItemValue
		 * @param index {Index} 索引
		 * @return {String} value
		 * @private
		 */
		_getItemValue: function(index){
			var elOption = this.elIterms[index].childNodes[0],
				value;
			if(elOption){
				value = elOption.attributes['data-value'].value;
			}
			return value;
		}
	};
	
	/**
	* 自动完成组件.<a href="http://style.aliui.com/js/5v/app/auto_suggestion/demo.html" target="_blank">点击查看demo</a>
	* @class AutoSuggestion
	* @constructor
	* @param uConfig {Object} 配置文件
	*/
	Controller = function(uConfig){
		this.config = YL.merge(defConfig, uConfig);
		this._init();
	};

	Controller.prototype = {
		/**
		 * Controller-初始化
		 * @method  _init
		 * @private
		 */
		_init: function(){
			this.model = new Model();
			this.model.config = this.config;
			this.model._init();
			
			this.view = new View();
			this.view.config = this.config;
			this.view._init(this.model, this);
			
			 // Custom events
			this.itemSelectEvent = new YU.CustomEvent('itemSelect', this);
			this.inputBlurEvent = new YU.CustomEvent('inputBlur', this);
			this.inputFocusEvent = new YU.CustomEvent('inputFocus', this);		
		},
		/**
		 * Controller-文本框聚焦事件处理
		 * @method  _onInputFocus
		 * @param e {HTMLEvent}  聚焦事件
		 * @private
		 */
		 _onInputFocus: function(e){
			this.inputFocusEvent.fire(this);
		},
		/**
		 * Controller-文本框失焦事件处理
		 * @method  _onInputBlur
		 * @param e {HTMLEvent}  失焦事件
		 * @private
		 */
		 _onInputBlur: function(e){
			this.inputBlurEvent.fire(this);
		},
		/**
		 * Controller-文本框Keyup事件处理
		 * @method  _onInputKeyup
		 * @param e {HTMLEvent}  Keyup事件
		 * @private
		 */
		 _onInputKeyup: function(e){
			var target = YUE.getTarget(e),
				code = e.keyCode,
				self = this;
			
			//击键时间小于conf.queryDelay时，清除操作
			if(this.model.timerId > -1){
				win.clearTimeout(self.timerId);
				this.model.timerId = -1;
			}
			
			//延时操作
			this.model.timerId = setTimeout(function(){ 
				self._keycodeHandler(code, target.value);
			}, this.config.queryDelay);
			
			//stop event
			YUE.stopEvent(e);	
		},
		/**
		 * Controller-Document MouseDown 事件处理
		 * @method  _onDocumentDown
		 * @param e {HTMLEvent}  MouseDown事件
		 * @private
		 */
		 _onDocumentDown: function(e){
			if(this.model.isShow()){
				this._hideSuggestion();
				this._toggleWarning(false);
			}
		},
		/**
		 * Controller-Option MouseDown 事件处理
		 * @method  _onItemMouseDown
		 * @param e {HTMLEvent}  MouseDown事件
		 * @param ctrl {AE.app.AutoSuggestion}  当前实例
		 * @private
		 */
		 _onItemMouseDown: function(e, ctrl){
			ctrl.currentIndex = parseInt( this.getAttribute( 'index' ), 10 );
			ctrl._applySuggestion( ctrl.currentIndex );
		},
		/**
		 * Controller- Option MouseOver 事件处理
		 * @method  _onItemMouseOver
		 * @param e  {HTMLEvent}  MouseOver事件
		 * @param ctrl {AE.app.AutoSuggestion}  当前实例
		 * @private
		 */
		 _onItemMouseOver: function(e, ctrl){
			var itemIndex = parseInt(this.getAttribute('index'), 10 );
			ctrl.view._clearItemsCurrent();
			ctrl.view._applyItemCurrent( itemIndex );
			ctrl.currentIndex = itemIndex;
		},
		/**
		 * Controller-键盘输入时的判断
		 * @method  _keycodeHandler
		 * @param code {Int}  keycode
		 * @param value{Int}  文本
		 * @private
		 */
		 _keycodeHandler: function(code, value){
			var model = this.model,
				validElNumber = model.showNumber - model.invalidNumber;
			// 如果为合法字符
			if(inputKeyCode.indexOf( '$' + code + '$' ) != -1 ){
				model.lastUserValue = value;
				if( this._buildSuggestion( value ) ){
					this._showSuggestion();
				}else{
					this._hideSuggestion();
				}
			}
			
			switch(code){
				case 27:	// Esc
				case 13:	// Enter
				case 9:	// Tab
					this._hideSuggestion();
					break;
				case 40:	// Down arrow
					if( !model.isSuggestionShow ){
						if( this._buildSuggestion( value ) ){//显示提示
							this._showSuggestion();
						}else{
							this._hideSuggestion();
						}
					}
					if( model.currentIndex == ( validElNumber - 1 ) ){
						this._restoreUserInput();
					}else if( model.currentIndex != validElNumber ){
						model.currentIndex++;
						this._applySuggestion( model.currentIndex );
					}
					break;
				case 38:	// Up arrow
					if( model.currentIndex == 0 ){
						this._restoreUserInput();
					}else if( model.currentIndex != -1 ){
						model.currentIndex--;
						this._applySuggestion( model.currentIndex );
					}
					break;
			}
		},
		/**
		 * Controller-创建弹出框
		 * @method  _buildSuggestion
		 * @param value {String}  文本
		 * @private
		 */
		 _buildSuggestion: function(value){
			var conf = this.config;
			if(value.length < conf.minQueryLength){ //输入的字符大于minQueryLength时，才弹出提示
				this._hideSuggestion();
				return false;
			}
			
			var findFlag = false,
				queryResults = [],
				makeupResults = [],
				validNumber = 0;
			
			//重置当前选择
			this.model.currentIndex = -1;
			this.model.invalidNumber = this.model.showNumber;
			
			this.view._clearItems();
			
			queryResults = this.model.queryMatch(value, conf.queryPrimaryKey);
			makeupResults = this.model.decorateData(value, queryResults, conf.keys);

			this._toggleWarning(makeupResults.length>0 ? false : true);
			
			validNumber = this.view._renderItems(makeupResults);
			if(validNumber){
				this.model.invalidNumber -= validNumber;
				findFlag = true;
			}
			return findFlag;
		},
		/**
		 * Controller-还原用户输入
		 * @method  _restoreUserInput 
		 * @private
		 */
		 _restoreUserInput: function(){
			this.model.currentIndex = -1;
			this.model.value = this.model.lastUserValue;
			this.view._clearItemsCurrent();
			this.view.setValue(this.model.value);
		},
		/**
		 * Controller-验证文本框值的有效性
		 * @method  validate
		 */
		 validate: function(){
			var sVal = this.config.elInput.value,
				tempList = this.model.queryMatch(sVal, true),
				nCount = tempList.length,
				bRes = ( nCount > 0 ) ? true : false;
			return bRes;
		},
		/**
		 * Controller-警告框显示处理
		 * @method  _toggleWarning
		 * @param show {Bool}  是否显示
		 * @private
		 */
		 _toggleWarning: function(show){
			if(!this.config.showWarning) return false;
			this.model.isWarningShow = !!show;
			this.view._toggleWarning(this.model.isWarningShow);
		},
		/**
		 * Controller-选中Option
		 * @method  _applySuggestion
		 * @param index {Int}  索引
		 * @private
		 */
		 _applySuggestion: function(index){
			this.view._clearItemsCurrent();
			this.view._applyItemCurrent( index );
			this.model.value = this.view._getItemValue(index);
			this.view.setValue(this.model.value);
			this.itemSelectEvent.fire(this);
		},
		/**
		 * Controller-显示弹框
		 * @method  _showSuggestion
		 * @private
		 */
		 _showSuggestion: function(){
			this.view._showSuggestion();
			this.model.isSuggestionShow = true;
		},
		/**
		 * Controller-隐藏弹框
		 * @method  _hideSuggestion
		 * @private
		 */
		 _hideSuggestion: function(){
			this.view._hideSuggestion();
			this.model.isSuggestionShow = false;
		}
	};

	return Controller;
})();

//YAHOO.register("auto_suggestion", AE.app.AutoSuggestion, {version: "@VERSION@", build: "@BUILD@"});
