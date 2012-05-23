 /**
 * 区域选择组件是以弹出框的形式，并对区域进行分组分便于用户进行选择<br />
 * <a href="http://style.aliui.com/js/5v/app/location_select/demo.html" target="_blank">点击查看demo</a>
 * @module AE.app.LocationSelect
 * @requires AE,LocationSelect
 * @title LocationSelect app
 */
AE.namespace('AE.app').LocationSelect = (function(){
	var Y =  YAHOO,
		YU = Y.util,
		YUD = YU.Dom,
		YUE = YU.Event,
		doc = window.document,
		dialogInstance = [];
	/**
	 * 通过单例名称获得Dialog实例
	 * @method getDialogInstance
	 * @param singletonObjectName {String}单例名称
	 * @return {LocationSelectDialog} 返回LocationSelectDialog实例
	 * @protected
	 */
	function getDialogInstance(singletonObjectName){
		var count = dialogInstance.length,
			i = 0,
			oItem = null;
		if(singletonObjectName == '' ||	dialogInstance.length == 0){
			return null;
		}
		for(;i < count;i++){
			oItem = dialogInstance[i];
			if(oItem[0] == singletonObjectName){
				return oItem[1];
			}
		}
		return null;
	}
	
	/**
	 * 保存Dialog实例
	 * @method setDialogInstance
	 * @param singletonObjectName {String}单例名称
	 * @param instance {LocationSelectDialog} LocationSelectDialog实例
	 * @protected
	 */
	function setDialogInstance(singletonObjectName,instance){
		dialogInstance.push([singletonObjectName,instance]);
	}
	
	/**
	 * 生成长度为6的随机字符串
	 * @method random
	 * @return {String}随机字符串
	 * @protected
	 */
	function random(){
		return (((1+Math.random())*0x1000000)|0).toString(16).substring(1);   
	}
	/**
	* @class LocationSelect
	* @constructor
	* @param uConfig {Object} 配置文件
	*/
	function LocationSelect(uConf){
		var defConfig = {
				/**
				 * 控件容器
				 * @config elInput
				 * @type {HTMLElement | String | Object}
				 */
				elInput: '',
				/**
				 * 按扭
				 * @config elButton
				 * @type {HTMLElement | String | Object}
				 */
				elButton: '', 
				/**
				 * tabs内容被选中的样式.
				 * @config preHighlightClassName
				 * @type {String}
				 * @default  'ae-sl-prehighlight'
				 */
				preHighlightClassName : 'ae-sl-prehighlight',
				/**
				 * 弹出框容器的样式.
				 * @config containerClassName
				 * @type {String}
				 * @default  'ae-sl-container'
				 */
				containerClassName : 'ae-sl-container',
				/**
				 * 弹出框内容的样式.
				 * @config contentClassName
				 * @type {String}
				 * @default  'ae-sl-content'
				 */
				contentClassName : 'ae-sl-content',
				/**
				 * 弹出框内容页眉的样式.
				 * @config headerClassName
				 * @type {String}
				 * @default  'ae-sl-header'
				 */
				headerClassName : 'ae-sl-header',
				/**
				 * 弹出框内容正文的样式.
				 * @config bodyClassName
				 * @type {String}
				 * @default  'ae-sl-body'
				 */
				bodyClassName : 'ae-sl-body',
				/**
				 * 弹出框内容页脚的样式.
				 * @config footerClassName
				 * @type {String}
				 * @default  'ae-sl-footer'
				 */
				footerClassName : 'ae-sl-footer',
				/**
				 * 弹出框关闭按扭的样式.
				 * @config closeClassName
				 * @type {String}
				 * @default  'ae-sl-close'
				 */
				closeClassName : 'ae-sl-close', 
				/**
				 * 鼠标移到tabs栏上的样式.
				 * @config tabsHighlightClassName
				 * @type {String}
				 * @default  'ae-sl-tabsbar-highlight'
				 */
				tabsHighlightClassName : 'ae-sl-tabsbar-highlight',
				/**
				 * tabs栏选中的样式.
				 * @config tabsPrehighlightClassName
				 * @type {String}
				 * @default  'ae-sl-tabsbar-prehighlight'
				 */
				tabsPrehighlightClassName : 'ae-sl-tabsbar-prehighlight',
				
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
				 * JSON数据.
				 * @config jsonData
				 * @type {Json} 
				 * @example {[{key:'key',value:1,groupKey:'group key',groupValue:11},...]}
				 */
				jsonData: null,
				/**
				 * 弹出框页眉的html.
				 * @config headerHtml
				 * @type {Html}
				 */
				headerHtml : '',
				/**
				 * 弹出框页脚的html.
				 * @config footerHtml
				 * @type {Html}
				 */
				footerHtml : '',
				/**
				 * 弹出框是否显示关闭按扭.
				 * @config hasCloseButton
				 * @type {Bool}
				 * @default  true
				 */
				hasCloseButton : true,
				/**
				 * 值不为空时弹出框将共享.
				 * @config singletonObjectName
				 * @type {String}
				 */
				singletonObjectName : '',
				/**
				 * Json 数据项key对应的键名称.
				 * @config key
				 * @type {String}
				 * @default  'key'
				 */
				key:'key',
				/**
				 * Json 数据项value对应的键名称.
				 * @config value
				 * @type {String}
				 * @default  'value'
				 */
				value:'value',
				/**
				 * Json 数据项组键对应的键名称.
				 * @config groupKey
				 * @type {String}
				 * @default  'groupKey'
				 */
				groupKey:'groupKey',
				/**
				 * Json 数据项组值对应的键名称.
				 * @config groupValue
				 * @type {String}
				 * @default  groupValue'
				 */
				groupValue:'groupValue'
			};
		//合并config
		this.config = Y.lang.merge(defConfig, uConf);
		this.name = random();
		if(this.config.singletonObjectName == ''){
			this.config.singletonObjectName = random();
		}
		this._init();
	}	
	LocationSelect.prototype = {
		/**
		 * 初始化LocationSelect
		 * @method _init
		 * @private
		 */
		_init: function(){
			//validate textbox element
			this.elInput = YUD.get(this.config.elInput);
			//validate button element
			this.elButton = YUD.get(this.config.elButton);
			
			
			if(!this.elInput || !this.elButton){
				return;
			}
			
			//debugger; 
			this.dialog = getDialogInstance(this.config.singletonObjectName);
			if(this.dialog == null){
				this.dialog = new LocationSelectDialog(this.config);
				setDialogInstance(this.config.singletonObjectName,this.dialog);
			}
			
			this._attachEvent();
		},
		
		/**
		 * 绑定事件
		 * @method _attachEvent
		 * @private
		 */
		_attachEvent: function(){
			var self = this;
			 
			// Custom events
			this.buttonClickEvent = new YU.CustomEvent('buttonClick', this);
			this.itemSelectEvent = new YU.CustomEvent('itemSelect', this);
			this.openEvent = new YU.CustomEvent('open', this);
			this.closeEvent = new YU.CustomEvent('close', this); 
			
			// Dom events
			YUE.on(this.elButton,'mousedown',this._onButtonClick, this,true);
			
			// Dialog events
			this.dialog.hideEvent.subscribe(this._onHide,this,true);
		},
		/**
		 * 弹出框隐藏的事件处理
		 * @method _onHide
		 * @param e {CustomEvent} 弹出框隐藏事件
		 * @param ages {Array} 参数集
		 * @private
		 */
		_onHide : function(e,ages){
			var self = ages[1];
			if(self.isShow){
				self.closeContainer(self);
			}
		},
		/**
		 * 按扭事件
		 * @method _onButtonClick
		 * @param e {HtmlEvent} 按扭点击事件
		 * @private
		 */
		_onButtonClick: function(e) {
			var self = this;
			if(this.isShow){
				YUE.stopEvent(e);
				return;
			}
			//按扭点击事件
			this.buttonClickEvent.fire(this);
			//保持先关闭再打开
			//使用setTimeout可以延时显示容器
			window.setTimeout(function(){
				//显示容器
				self.openContainer(self);
			},10);
		},
		
		/**
		 * 显示容器
		 * @method openContainer
		 * @param self {AE.app.SelectLocation} SelectLocation的实例
		 */
		openContainer: function(self){
			self.isShow = true;
			self.elInput.blur();
			self.openEvent.fire(self);
			self.dialog.show(self);
		},
		
		/**
		 * 隐藏容器
		 * @method closeContainer
		 * @param self {AE.app.SelectLocation} SelectLocation的实例
		 */
		closeContainer: function(self){
			self.isShow = false;
			self.closeEvent.fire(self);
		},
		
		/**
		 * 通过value选中标签内容项
		 * @method selectedTab
		 * @param data {Data} Object数据
		 * @param self {AE.app.SelectLocation} SelectLocation的实例
		 */
		setTextBoxValue: function(data,self){
			self.elInput.value = data.key;
		},
		/**
		 * @method toString
		 */
		toString : function(){
			return 'LocationSelect instance-'+this.config.singletonObjectName+'-'+this.name;
		}
	};
	/**
	* 区域选择组件弹出框.
	* @constructor
	* @param uConfig {Object} 配置文件
	* @private
	*/
	function LocationSelectDialog(uConfig){
		this.config = uConfig;
		this._init();
	}
	LocationSelectDialog.prototype = {
		/**
		 * 初始化LocationSelectDialog
		 * @method _init
		 * @private
		 */
		_init : function(){
			//数据交换
			this._switchData();
			//创建弹出容器
			this._createContainer();
			//初始化弹出框内容
			this._initContent();
			//选中默认的tab项(选中group的第一项)
			//this.selectedTab(this.groupData[0].groupValue);
			this._attachEvent();
		},
		/**
		 * 定位
		 * @method _setPosition
		 * @private
		 */
		_setPosition : function(){
			var  tarObj = this.targetObject,
				pos = YUD.getXY(tarObj.elInput);
			this.elContainer.style.left = tarObj.config.offsetLeft + pos[0] + 'px';
			this.elContainer.style.top = tarObj.config.offsetTop + pos[1] + tarObj.elInput.offsetHeight + 'px'; 
			
		},
		/**
		 * 创建弹出容器
		 * @method _createContainer
		 * @private
		 */
		_createContainer : function(){
			var elContainer,
			elContent,
			elHeader,
			elBody,
			elFooter,
			elClose,
			ifr;
			 
			elContainer = doc.createElement('div');
			elContainer.style.display = 'none';
			elContainer.style.position = 'absolute';
			elContainer.style.zIndex = '999';
			//elContainer.style.left = this.config.offsetLeft + 'px';
			//elContainer.style.top = this.elInput.offsetTop + this.elInput.offsetHeight + this.config.offsetTop+ 'px';
			elContainer.className = this.config.containerClassName;
			this.elContainer = elContainer;
			//debugger;
			YUD.addClass( this.elContainer,  this.config.singletonObjectName );
			doc.body.appendChild( elContainer );
			
			if(0 < Y.env.ua.ie && Y.env.ua.ie <= 6){
				ifr =  document.createElement('iframe');
				YUD.setStyle(ifr, 'border', 0);
				YUD.setStyle(ifr, 'padding', 0);
				YUD.setStyle(ifr, 'margin', 0);
				YUD.setStyle(ifr, 'opacity', 0);
				YUD.setStyle(ifr, 'position','absolute');
				YUD.setStyle(ifr, 'left','0');
				YUD.setStyle(ifr, 'top','0');
				this.iframeMask = ifr;
				elContainer.appendChild(ifr);
			}
			
			elContent = doc.createElement('div');
			elContent.className = this.config.contentClassName;
			this.elContent = elContent;
			elContainer.appendChild(elContent);
			
			if(this.config.hasCloseButton){
				elClose = doc.createElement('a');
				elClose.className = this.config.closeClassName;
				this.elCloseButton = elClose;
				elContent.appendChild(elClose);
				elClose.innerHTML ='<span>X</span>';
			}
			
			elHeader = doc.createElement('div');
			elHeader.className = this.config.headerClassName;
			this.elHeader = elHeader;
			elContent.appendChild(elHeader);
			elHeader.innerHTML = this.config.headerHtml;
			
			elBody = doc.createElement('div');
			elBody.className = this.config.bodyClassName;
			this.elBody= elBody;
			elContent.appendChild(elBody);
			
			elFooter = doc.createElement('div');
			elFooter.className = this.config.footerClassName;
			this.elFooter = elFooter;
			elContent.appendChild(elFooter);
			elFooter.innerHTML = this.config.footerHtml;
			 
		},
		/**
		 * 绑定标签栏的事件
		 * @method _attachTabEvent
		 * @private
		 */
		_attachEvent: function(){
			//debugger;
			var self = this;
			
			//custom events
			this.hideEvent = new YU.CustomEvent('hide', this); 
			//dom events
			YUE.addListener(this.elContainer,'mousedown',function(e){
				YUE.stopEvent(e);													   
			}, this);
			
			if(this.config.hasCloseButton){
				YUE.addListener(self.elCloseButton, 'mousedown', self._onCloseButtonDown,self, true);
			} 
			this.elTabsBar = this.elBody.getElementsByTagName('dl')[0];
			this.elTabsMain = this.elBody.getElementsByTagName('ul')[0];
			
			if(self.elTabsBar){
				var elDl = self.elTabsBar;
				YUE.addListener(elDl,'mouseover',function(e,self){
					var tar = e.target || e.srcElement;
					if(tar.nodeName === 'A'){
						var elA = YUD.get(tar); 
						self.selectedTab(elA.attributes['data-value'].value);
					}
				},self, true);
			}
			if(self.elTabsMain){
				var elUl = self.elTabsMain;
				YUE.addListener(elUl,'click',function(e,self){
					var tar = e.target || e.srcElement;
					
					if(tar.nodeName === 'A'){
						var elA = YUD.get(tar);
						var val = elA.attributes['data-value'].value;
						//self.selectedTabItem(val);
						self.targetObject.setTextBoxValue(self.getDataByValue(val),self.targetObject);
						self.targetObject.itemSelectEvent.fire(self.targetObject);
						self.hide();
						YUE.stopEvent(e);
					}
					
				},self, true);
			}
		},
		/**
		 * 关闭按扭的点击事件处理
		 * @method _onCloseButtonDown
		 * @private
		 */
		_onCloseButtonDown : function(){
			this.hide();
		},
		/**
		 * 初始化弹出框的内容
		 * @method _initContent
		 * @private
		 */
		_initContent: function(){
			var aTab = [],
			aTabContent = [],
			oItem = null; 
			if(this.groupData.length>0){
				for(var i = 0;i<this.groupData.length;i++){
					oItem =this.groupData[i]; 
					aTab.push('<dd>');
					aTab.push('<a href="javascript:void(0);" data-value="'+oItem.groupValue+'">'+oItem.groupKey+'</a>');
					aTab.push('</dd>');
					
					var aTemp = this._initSubContent(this.getDataByGroupValue(oItem.groupValue));
					aTemp.unshift('<li style="display:none;" data-group-value="'+oItem.groupValue+'">');
					aTemp.push('</li>');
					aTabContent = aTabContent.concat(aTemp);
				}
				aTab.unshift('<dl>');
				aTab.push('</dl>');
			}else{
				var aTemp = this._initSubContent(this.data);
				aTemp.unshift('<li style="display:none;">');
				aTemp.push('</li>');
			}
			
			aTabContent.unshift('<ul>');
			aTabContent.push('</ul>');
			aTab = aTab.concat(aTabContent);
			this.elBody.innerHTML = aTab.join('');
		},
		/**
		 * 标签内容的html拼接
		 * @method _initSubContent
		 * @return {String}子项html拼接
		 * @private
		 */
		_initSubContent: function(data){
			var aSubContent = [],
			oItem = null;
			for(var i = 0;i<data.length;i++){
				var oItem =data[i];
				aSubContent.push('<span>');
				aSubContent.push('<a href="javascript:void(0);"  title="'+oItem.key+'" data-value="'+oItem.value+'">'+oItem.key+'</a>');
				aSubContent.push('</span>');
			}
			return aSubContent;
		},
		/**
		 * 数据转换
		 * @method _switchData
		 * @private
		 */
		_switchData: function(){
			var aGroupData = [],
			aGroupKeys = [],
			aData = [],
			sK = this.config.key,
			sV = this.config.value,
			sGK = this.config.groupKey,
			sGV = this.config.groupValue,
			oItem = null,
			jsonData = this.config.jsonData;
			for(var i = 0; i<jsonData.length;i++){
				oItem = jsonData[i];
				var sTempGK = oItem[sGK];
				var sTempGV = oItem[sGV];
				var oGroupData = {
					groupKey : sTempGK,
					groupValue : (sTempGV===undefined) ? sTempGK : sTempGV
				};
				if(sTempGK === undefined &&  sTempGV === undefined){
					oGroupData = null;
				}
				
				if(oGroupData!=null && aGroupKeys.indexOf(oGroupData.groupKey)==-1){
					aGroupData.push(oGroupData);
					aGroupKeys.push(oGroupData.groupKey);
				}
				
				var oData = {
					key : oItem[sK],
					value : oItem[sV],
					groupKey : oGroupData==null?'':oGroupData.groupKey,
					groupValue : oGroupData==null?'':oGroupData.groupValue
				};
				aData.push(oData);
			}
			this.groupData = aGroupData;
			this.data = aData;
		},
		
		/**
		 * 通group value获取组数据 
		 * @method getDataByGroupValue
		 * @param {String} groupValue
		 * @return {Object} Result data.
		 */
		getDataByGroupValue: function(groupValue){
			var aData = [],
			oItem = null;
			for(var i = 0;i<this.data.length;i++){
				oItem = this.data[i];
				if(oItem.groupValue == groupValue){
					aData.push(oItem);
				}
			}
			return aData;
		},
		/**
		 * 通value获取数据 
		 *
		 * @method getDataByValue
		 * @param {String} groupValue
		 * @return {Object} Result data.
		 */
		getDataByValue: function(value){
			oItem = null;
			for(var i = 0;i<this.data.length;i++){
				oItem = this.data[i];
				if(oItem.value == value){
					return oItem;
				}
			}
			return null;
		},
		/**
		 * 通key获取数据 
		 *
		 * @method getDataByKey
		 * @param {String} groupValue
		 * @return {Object} Result data.
		 */
		getDataByKey: function(key){
			oItem = null;
			for(var i = 0;i<this.data.length;i++){
				oItem = this.data[i];
				if(oItem.key == key){
					return oItem;
				}
			}
			return null;
		},
		
		show : function(targetObject){
			var tarObj = this.targetObject = targetObject;
			YUE.addListener(doc, 'mousedown', this.hide, this, true);
			// 选中文本框中的内容
			var oItem =  this.getDataByKey(tarObj.elInput.value);
			if(oItem){
				 this.selectedTab(oItem.groupValue);
				 this.selectedTabItem(oItem.value);
			}else{
				this.selectedTab(this.groupData[0].groupValue);
			}
			this._setPosition();
			this.elContainer.style.display = 'block'; 
			if(this.iframeMask){
				this.iframeMask.style.width =  this.elContainer.offsetWidth + 'px';
				this.iframeMask.style.height = this.elContainer.offsetHeight + 'px';
			}
		},
		hide : function(){
			YUE.removeListener(doc,'mousedown', this.hide);
			this.hideEvent.fire(this,this.targetObject);
			this.elContainer.style.display = 'none';
		},
		/**
		 * 通过group value选中标签项
		 *
		 * @method selectedTab
		 * @param sGroupValue {String} group value 
		 */
		selectedTab: function(sGroupValue){
			var self = this,
			aLi = self.elTabsMain.getElementsByTagName('li'),
			
			oItem = null,
			aTab = self.elTabsBar.getElementsByTagName('a');
			for(var i = 0;i<aLi.length;i++){
				oItem = aLi[i];
				oItem.style.display = 'none';
				if(oItem.attributes['data-group-value'].value == sGroupValue){
					oItem.style.display = 'block';
				}
			}  
			for(var i = 0;i<aTab.length;i++){
				oItem = aTab[i];
				YUD.removeClass(oItem,self.config.tabsPrehighlightClassName); 
				if(oItem.attributes['data-value'].value == sGroupValue){
					YUD.addClass(oItem,self.config.tabsPrehighlightClassName); 
				}
			}
		},
		/**
		 * 通过value选中标签内容项
		 * @method selectedTab
		 * @param sValue {String} item value 
		 */
		selectedTabItem: function(sValue){
			var self = this,
			aItem = self.elTabsMain.getElementsByTagName('a'); 
			
			for(var i = 0;i<aItem.length;i++){
				oItem = aItem[i];
				YUD.removeClass(oItem,self.config.preHighlightClassName); 
				if(oItem.attributes['data-value'].value == sValue){
					YUD.addClass(oItem,self.config.preHighlightClassName); 
				} 
			}  
		},
		/**
		 * @method toString
		 */
		toString : function(){
			return 'LocationSelectDialog instance-'+this.config.singletonObjectName;
		}
	};
	return LocationSelect;
})();

//YAHOO.register("location_select", AE.app.LocationSelect, {version: "@VERSION@", build: "@BUILD@"});
