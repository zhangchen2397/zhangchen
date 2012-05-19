// #import app/localstorage/localstorage.js

/** 
 * 用于bargain buys活动detail页面运行时相关功能
 * 适用场景：bargain buys活动detail页面
 * @class AE.run.initBagainBuyDetail
 */
AE.namespace( 'AE.run.initBagainBuyDetail' );
AE.run.initBagainBuyDetail = {
	/** 
	 * 页面默认配置
	 * @property defaultConfig
	 * @private
	 */
	defaultConfig: {
		requestRelatedUrl: '',			//相关产品请求地址
		requestRelatedNum: 6,		//相关产品请求个数
		bargainBuyProId: '',			//bargainBuy 产品ID
		proCateId: '1',					//bargainBuy 产品类目Id
		certifiedLogo: '',				//supplier认证信息
		startDate: '',					//产品开始时间
		endDate: '',						//产品结束时间
		productInfo: {					//用于发送到crosstrade页面中所需的产品配置信息
			svId:'',						//sellerID
			productId: '',				//产品实际ID
			pName: '',					//产品名称
			moqUnit: '',					//产品单位
			price: '',						//产品价格
			moq: '',						//最小订购量
			sellerId: ''					//memberID
		},
		requestUrlInfo: {				//请求订单数量相关配置信息
			safepayOrderUrl: 'http://transaction.alibaba.com/safepay/getTotalNumByProductIdAndType.htm?',	//大单请求地址
			shipOrderUrl: 'http://crosstrade.alibaba.com/order/getOrderTargetNumByTargetIdAndType.htm?',	//小单请求地址
			surveyUrl: 'http://test.research.alibaba.com/index.php?sid=91482&lang=en&91482X811X6623=',		//调研问卷的url
			crosstradeUrl: 'http://crosstrade.alibaba.com/order/promotion/ctPromotionOrderPost.htm?'			//crosstrade订单页面url
		}
	},

	/** 
	 * DOM缓存配置
	 * 如果有两次及两次以上引用到相同的dom，这里都会缓存起来
	 * @property cache
	 * @private
	 */
	cache: {
		relatedPro: YUD.get( 'J-related-pro' ),
		auth: YUD.get( 'J-auth' ),
		proMainImg: YUD.get( 'J-main-img' ),
		shareCloseBtn: YUD.get( 'J-close-fb' ),
		shareTop: YUD.get( 'share-fb' )
	},

	/** 
	 * 初始化方法
	 * @method init
	 * @param {object} 自定义配置参数
	 * @public
	 */
	init: function( customConfig ) {
		this.config = YL.merge( this.defaultConfig, customConfig || {} );
		this.renderRelatedPro();
		this.assembleOrderUrl();
		this.controlAuthDisplay();
		this.adjustAuthIcon();
		this.initEvent();
		this.getOrderCount();
		this.lazyImg();
		this.initScrollTop();
		this.actionSurvey();
		this.addCateNameHash();
	},

	/** 
	 * bargain buys产品类目索引
	 * 利用类目ID对应到类目的名称，用于hash用
	 * @property cateNameMap
	 * @private
	 */
	cateNameMap: {
		1: 'apparel',
		2: 'beauty',
		3: 'electronic',
		4: 'fashion',
		5: 'gift',
		6: 'home',
		7: 'light',
		8: 'sport',
		9: 'toy',
		10: 'office'
	},

	/** 
	 * 返回到bargain buys list页面时，自动定位到该产品所在的类目
	 * @method addCateNameHash
	 * @public
	 */
	addCateNameHash: function() {
		var config = this.config,
			listPageLink = YUD.getElementsByClassName( "J-list-url", "a", "container" );
		
		for ( var i = 0, len = listPageLink.length; i < len; i++ ) {
			var item = listPageLink[ i ],
				oriLink = item.getAttribute( "href" ),
				newLink = oriLink + "#cateName=" + this.cateNameMap[ config.proCateId ];

			item.setAttribute( "href", newLink );
		}
	},

	/** 
	 * 获取订单数量，分大订单和小订单
	 * @method getOrderCount
	 * @public
	 */
	getOrderCount: function() {
		var config = this.config,
			requestUrlInfo = config.requestUrlInfo,
			productInfo = config.productInfo,
			dateTime = ( new Date() ).getTime(),
			postData = [
				'targetId=' + encodeURIComponent( productInfo.productId ),
				'startDate=' + encodeURIComponent( config.startDate ),
				'endDate=' + encodeURIComponent( config.endDate ),
				'rnd=' + dateTime
			].join( '&' ),
			safepayOrderUrl = requestUrlInfo.safepayOrderUrl + postData,
			shipOrderUrl = requestUrlInfo.shipOrderUrl + postData;
		
		if ( YUD.get( 'J-buy-count' ) ) {
			YAHOO.util.Get.script( [ safepayOrderUrl, shipOrderUrl ] , {
				onSuccess: function( obj ) {
					try {
						var buyCount = shipOrderCount.totalNum + safepayOrderCount.totalNum;
						if ( buyCount > 0 ) {
							YUD.get( 'J-buy-count' ).innerHTML = '<p class="buy-count"><span>' + buyCount + '</span> ' + productInfo.moqUnit +  ' bought</p>';
						} 
					} catch( e ) {}
				},
				timeout: 10000
			} );
		}
	},

	/** 
	 * 异步请求相关产品
	 * @method renderRelatedPro
	 * @public
	 */
	renderRelatedPro: function() {
		var config = this.config,
			_self = this,
			postData = '?id=' + encodeURIComponent( config.bargainBuyProId ) + '&num=' + encodeURIComponent (config.requestRelatedNum ),
			requestRelatedUrl = config.requestRelatedUrl + postData;

		YAHOO.util.Connect.asyncRequest( "GET", requestRelatedUrl, {
			success: function( obj ) {
				var response = YAHOO.lang.JSON.parse( obj.responseText );
				if ( response.result == 200 ) {
					_self._renderRelatedTpl( response );
				} else if ( response.result == 300 ) {
					_self._renderRelatedEmpty();
				} else {
					_self._renderRelatedFailure();
				}
			},
			failure: function() {
				_self._renderRelatedFailure();
			},
			cache:true,
			timeout: 8000
		} );
	},

	/** 
	 * 请求成功时渲染模板，这里用了Mustache模板引擎
	 * @method _renderRelatedTpl
	 * @private
	 */
	_renderRelatedTpl: function( response ) {
		var config = this.config,
			cache = this.cache,
			tpl = YUD.get( 'related-product-tpl' ).value;

		cache.relatedPro.innerHTML =  Mustache.to_html( tpl, response );
		this._subRelatedPro();
	},

	/** 
	 * 请求成功但返回的结果为空时的模板渲染
	 * @method _renderRelatedEmpty
	 * @private
	 */
	_renderRelatedEmpty: function() {
		var config = this.config,
			cache = this.cache;

		cache.relatedPro.innerHTML = '<p class="exception">Sorry, no find related products! </p>';
	},

	/** 
	 * 请求失败时的模板渲染
	 * @method _renderRelatedFailure
	 * @private
	 */
	_renderRelatedFailure: function() {
		var config = this.config,
			cache = this.cache,
			_self = this;

		cache.relatedPro.innerHTML = 
			'<p class="exception">' +
				'Sorry, network connection overtime! You can <a id="J-try-again" href="javascript:void(0);">try it again</a>' +
			'</p>';
		YUE.on( 'J-try-again', 'click', function() {
			_self.renderRelatedPro();
		} );
	},

	/** 
	 * 截取相关产品标题长度
	 * @method _subRelatedPro
	 * @private
	 */
	_subRelatedPro: function() {
		var config = this.config,
			cache = this.cache,
			relatedProTitleList = cache.relatedPro.getElementsByTagName( 'h4' );
		
		for ( var i = 0, len = relatedProTitleList.length; i < len; i++ ) {
			var item = relatedProTitleList[ i ],
				itemText = item.getElementsByTagName( 'a' )[ 0 ],
				itemCon = itemText.innerHTML;

			itemText.innerHTML = this._subStrOmit( itemCon, 28 );
		}
	},

	/** 
	 * 拼装发送到crosstrade的url
	 * @method assembleOrderUrl
	 * @public
	 */
	assembleOrderUrl: function() {
		var config = this.config,
			productInfo = config.productInfo,
			postData = [
				'svId=' + encodeURIComponent( productInfo.svId ),
				'productId=' + encodeURIComponent( productInfo.productId ),
				'pName=' + encodeURIComponent( productInfo.pName ),
				'pUnit=' + encodeURIComponent( productInfo.moqUnit ),
				'pUprice=' + encodeURIComponent( productInfo.price ),
				'pQuan=' + encodeURIComponent( productInfo.moq ),
				'sellerId=' + encodeURIComponent( productInfo.sellerId )
			].join( "&" );

		YUD.get( 'post-url' ).innerHTML =  config.requestUrlInfo.crosstradeUrl + postData;
	},

	/** 
	 * 公司认证图标同时出现四个时位置小调整
	 * @method adjustAuthIcon
	 * @public
	 */
	adjustAuthIcon: function() {
		var config = this.config,
			cache = this.cache,
			authLi = cache.auth.getElementsByTagName( 'li' );

		if ( authLi.length == 4 ) {
			if ( YAHOO.env.ua.ie === 8 ) {
				YUD.setStyle( authLi, 'paddingRight', '3px' );
			} else {
				YUD.setStyle( authLi, 'paddingRight', '4px' );
			}
		}
	},

	/** 
	 * 图片延时加载
	 * @method lazyImg
	 * @public
	 */
	lazyImg: function() {
		var lazyLoadImg = new AE.app.imagesLazyload().init( {
			mod: "manual"
		} );
	},

	/** 
	 * 初始化事件
	 * @method initEvent
	 * @public
	 */
	initEvent: function() {
		//订单按钮添加事件
		var config = this.config,
			cache = this.cache,
			_self = this;
		YUE.on( 'J-btn-order', 'click', function( e ) {
			YUE.preventDefault( e );
			_self._dmOrder();
			if ( fn.isLogin() ) {
				xman_callback( null, null, true );
			} else {
				fn.popUpXman();
			}
		} );

		//显示关闭分享按钮
		var proMainImg = cache.proMainImg,
			shareTop = cache.shareTop,
			shareCloseBtn = cache.shareCloseBtn;

		YUE.on( proMainImg, 'mouseover', function() {
			YUD.addClass( shareTop, 'over-fb' );
			YUD.setStyle( shareCloseBtn, 'display', 'inline-block' );
		} );
		YUE.on( proMainImg, 'mouseout', function() {
			YUD.removeClass( shareTop, 'over-fb' );
			YUD.setStyle( shareCloseBtn, 'display', 'none' );
		} );
		YUE.on( shareCloseBtn, 'click', function() {
			YUD.setStyle( shareTop, 'display', 'none' );
		} );
	},

	/** 
	 * 初始化返回顶部组件
	 * @method initScrollTop
	 * @public
	 */
	initScrollTop: function() {
		var gotoTop = document.createElement( 'div' );
		gotoTop.id = 'goto-top';
		gotoTop.innerHTML = '<a href="javascript:void(0);" title="go to top">go to top</a>';
		document.body.appendChild( gotoTop );

		var scrollToTop = new AE.run.Bargainbuys.scrollToTop();
		scrollToTop.init( {
			bottom: '170'
		} );
	},

	/** 
	 * 调查问卷布点
	 * @method actionSurvey
	 * @public
	 */
	actionSurvey: function() {
		var config = this.config,
			survey = YUD.get( 'J-survey' ),
			surveyA = survey.getElementsByTagName( 'a' )[ 0 ],	
			memberId = this._getMemberId();

		if ( memberId ) {
			surveyA.setAttribute( 'href', config.requestUrlInfo.surveyUrl + memberId );
		}
		YUE.on( 'J-close-btn', 'click', function() {
			YUD.setStyle( survey, 'display', 'none' );
		} );

		if ( YAHOO.env.ua.ie == 6 ) {
			fixIE6();
			YUE.on( window, 'scroll', function() {
				fixIE6();
			} );
			YUE.on( window, 'resize', function() {
				fixIE6();
			} );
			function fixIE6() {
				var surveyStyle = survey.style;
				surveyStyle.position = 'absolute';
				surveyStyle.top = YUD.getViewportHeight() + YUD.getDocumentScrollTop() - 58 + 'px';
			}
		}
	},

	_getMemberId: function() {
		var userCookie = AE.bom.getCookie('ali_apache_track'),
			userReg = /mid=[^|]+/;

		if ( userCookie && userReg.test( userCookie ) ) {
			return userCookie.match( userReg )[ 0 ].split( '=' )[ 1 ];
		}
	},

	/** 
	 * 控制公司认证图标的显示与隐藏
	 * @method controlAuthDisplay
	 * @public
	 */
	controlAuthDisplay: function() {
		var config = this.config,
			cache = this.cache,
			authValue = config.certifiedLogo.split( ',' ),
			tempHTML = '';
		
		tempHTML += '<li class="gs"><span class="gold_supplier_year_sprite gold_' + authValue[ 0 ] + '"></span>Gold Supplier</li>';
		if ( authValue[ 1 ] > 0 ) {
			tempHTML += '<li class="oc">Onsite Checked</li>';
		}
		if ( authValue[ 2 ] > 0 ) {
			tempHTML += '<li class="as">Audited Supplier</li>';
		}
		tempHTML += '<li title="Escrow service: Offers a safe way to make payments online." class="escrow"></li>';
		cache.auth.innerHTML = tempHTML;
	},

	/** 
	 * 字符串截图函数
	 * @method _subStrOmit
	 * @private
	 */
	_subStrOmit: function( str, length ) {
		if ( str.length > length ) {
			return str.substring( 0, length ) + "...";
		} else {
			return str;
		}
	},

	/** 
	 * order按钮打点
	 * @method _subStrOmit
	 * @private
	 */
	_dmOrder: function() {
		var url = "http://stat.alibaba.com";
			param = { "tracelog": "sourcing_assistant_bb" };
		dmtrack.clickstat( url, param );
	}
};