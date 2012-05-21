AE.namespace( 'AE.run.Bargainbuys' );
AE.run.Bargainbuys.showTip = function() {
	this.config = {
		targetId: "J-quotation-help",  //目标ID
		showConId: "tip-box",          //显示内容ID
		offsetX: -170,					   //浮出窗口相对于目标元素的X偏移量
		offsetY: 23,					   //浮出窗口相对于目标元素的y偏移量
		delayHide: 300,				   //消失延时时间(ms)
		tipContent: "tip info"           //提示信息内容
	}
};

AE.run.Bargainbuys.showTip.prototype = {
	init: function( customConfig ) {
		this.config = YL.merge( this.config, customConfig || {} );
		this._createDom();
		this._initEvent();
	},

	_createDom: function() {
		var _self = this,
			config = this.config;

		//创建HTML
		var tipHTML = 
			'<div class="tip-main-con">' + 
			'	<span class="arrow"></span>' + 
			'	<div class="tip-con"></div>' + 
			'</div>' + 
			'<div class="right-border"></div>' + 
			'<div class="bottom-border"></div>' ;
		var tipContainer = document.createElement( "div" );
		tipContainer.id = config.showConId;
		YUD.addClass( tipContainer, "tip-box" );
		tipContainer.innerHTML = tipHTML;
		document.body.appendChild( tipContainer );

		//定义DOM
		var tipContent = YUD.getElementsByClassName( "tip-con", "div", tipContainer )[ 0 ],
			tipMainCon = YUD.getElementsByClassName( "tip-main-con", "div", tipContainer )[ 0 ], 
			rightBorder = YUD.getElementsByClassName( "right-border", "div", tipContainer )[ 0 ],   
			bottomBorder = YUD.getElementsByClassName( "bottom-border", "div", tipContainer)[ 0 ];  
		tipContent.innerHTML = config.tipContent;

		//调整阴影部分位置
		rightBorder.style.height = tipContainer.offsetHeight - 4 + "px";
		bottomBorder.style.width = tipMainCon.offsetWidth + "px";
	},

	_initEvent: function() {
		var _self = this,
			config = this.config,
			tipContainer = YUD.get( config.showConId );

		//添加事件
		YUE.on( config.targetId, "mouseover", function() {
			tipContainer.style.visibility = "visible";
			tipContainer.style.left = YUD.getX( this ) + config.offsetX + "px";
			tipContainer.style.top = YUD.getY( this ) + config.offsetY + "px";
		} );
		YUE.on( config.targetId, "mouseout", function() {
			setTimeout( function() {
				tipContainer.style.visibility = "hidden";
			}, config.delayHide );
		} );
	}
};