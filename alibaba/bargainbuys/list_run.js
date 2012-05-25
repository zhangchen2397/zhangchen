// #import app/localstorage/localstorage.js

/** 
 * 用于bargain buys活动list页面运行时相关功能
 * 适用场景：bargain buys活动list页面
 * @class AE.run.initBagainBuyList
 */
AE.namespace( 'AE.run.initBagainBuyList' );
AE.run.initBagainBuyList = {
	/** 
	 * 页面默认配置
	 * @property config
	 * @private
	 */
	config: {
		productUrl: '',
		requestCateListUrl: '',
		isTest: false,
		defaultCate: 'apparel'
	},

	/** 
	 * DOM缓存配置
	 * 如果有两次及两次以上引用到相同的dom，这里都会缓存起来
	 * @property cache
	 * @private
	 */
	cache: {
		productList: YUD.get( 'J-product-list' ),
		cateList: YUD.get( 'J-cate-list' ),
		currentTab: YUD.get( 'J-cate-list' ).getElementsByTagName( 'li' )[ 0 ]
	},

	/** 
	 * 初始化方法
	 * @method init
	 * @param {object} 自定义配置参数
	 * @public
	 */
	init: function( customConfig ) {
		this.config = YL.merge( this.config, customConfig || {} );
		this.initEvent();
		this.historyControl();
		this.initScrollTop();
	},

	/** 
	 * Ajax请求数据成功后的初始化功能
	 * @method _initAjaxSuccessAfter
	 * @private
	 */
	_initAjaxSuccessAfter: function() {
		this.lazyLoadImg();
		this.adjustProfitPadding();
		this.fixCateList();
		this.initHash();
	},

	/** 
	 * bargain buys产品类目索引
	 * 利用类目名称对应到类目的ID，用于发送ajax请求
	 * @property cateNameMap
	 * @private
	 */
	cateNameMap: {
		'apparel': 1,
		'beauty': 2,
		'electronic': 3,
		'fashion': 4,
		'gift': 5,
		'home': 6,
		'light': 7,
		'sport': 8,
		'toy': 9,
		'office': 10,
		'automobiles': 11,
		'chemicals': 12,
		'shoes': 13
	},

	/** 
	 * 根据类目名称请求相应的产品
	 * @method ajaxCateList
	 * @param {string} 类目名称
	 * @public
	 */
	ajaxCateList: function( cateName ) {
		var config = this.config,
			_self = this,
			cateId = this.cateNameMap[ cateName ],
			requestUrl = config.requestCateListUrl + '?cid=' + decodeURIComponent( cateId );

		this._switchLoading();
		YAHOO.util.Connect.asyncRequest( "GET", requestUrl,  {
			success: function( obj ) {
				var response = YAHOO.lang.JSON.parse( obj.responseText );
				if ( response.result == 200 ) {
					_self._renderCateListTpl( response );
					_self._initAjaxSuccessAfter();
				} else if ( response.result == 300 ) {
					_self._renderCateListEmpty();
				} else {
					_self._renderCateListFailure();
				}
			},
			failure: function() {
				_self._renderCateListFailure();
			},
			cache:true,
			timeout: 10000
		} );
	},

	/** 
	 * 请求成功后，渲染模板
	 * @method _renderCateListTpl
	 * @param {object} 服务器端返回的json数据
	 * @private
	 */
	_renderCateListTpl: function( response ) {
		var config = this.config,
			cache = this.cache,
			tempHTML = '',
			productData = response.data,
			cateId;

		for ( var key in productData ) {
			var cateItem = productData[ key ];
			if ( key.indexOf( ' ' ) != -1 ) {
				cateId = key.replace(/[&' ]/g, "");
			} else {
				cateId = key;
			}
			tempHTML += '<div class="sub-cate-pro">';
			tempHTML +=		'<h2 id="' + cateId + '">' + key + '</h2>';
			tempHTML +=		'<ul class="clearfix">';
			
			for ( var j = 0, len = cateItem.length; j < len; j++ ) {
				var item = cateItem[ j ],
					productUrl = config.productUrl + '?id=' + item.id + '&pid=' + item.productId,
					profit = '';

				if ( config.isTest ) {
					productUrl += '&tracelog=new_profit_' + item.id;
					profit = '<p class="new_profit">Profits: <span>' + item.estimatedProfits + '%</span></p>';
				} else {
					productUrl += '&tracelog=old_profit_' + item.id;
					profit = '<p class="profit">' + item.estimatedProfits + '%</p>';
				}
				
				if ( item.isNew == 'true' ) {
					item.summary += '<img class="new-icon" src="http://img.alibaba.com/images/eng/style/icon/new01_en.gif" />';
				}

				tempHTML +=		'<li>';
				tempHTML +=			'<a href="'+ productUrl +'" target="_blank"><img image-src="'+ item.imageUrl +'" width="215px" height="215px" /></a>';
				tempHTML +=			'<p class="p-name">' + item.summary + '</p>';
				tempHTML +=			profit;
				tempHTML +=			'<p>AliHot Bargains Price: <span>US$' + item.bargainPrice + '</span></p>';
				tempHTML +=			'<p>Current Retail Price: US$' + item.currentRetailPrice + '</p>';
				tempHTML +=			'<p>' + item.monthSaleNumber + ' ' + item.orderUnit + ' ordered/month</p>';
				tempHTML +=			'<p class="order-btn"><a target="_blank" href="' + productUrl + '">Get it now!</a></p>';
				tempHTML +=		'</li>';
			}
			
			tempHTML +=		'</ul>';
			tempHTML += '</div>'
		}
		cache.productList.innerHTML = tempHTML;
	},

	/** 
	 * 请求成功后但数据为空时的模板渲染
	 * @method _renderCateListEmpty
	 * @private
	 */
	_renderCateListEmpty: function() {
		var cache = this.cache;
		cache.productList.innerHTML = '<p class="dpl-board-notice exception">Sorry, no products find in this category!</p>';
		this.lazyLoadImg();
	},

	/** 
	 * 请求失败或请求超时的模板渲染
	 * @method _renderCateListFailure
	 * @private
	 */
	_renderCateListFailure: function() {
		var config = this.config,
			_self = this,
			cache = this.cache,
			cateName = this._getCateName();

		cache.productList.innerHTML =
			'<p class="dpl-board-notice exception">' +
				'Sorry, network connection overtime! You can <a id="J-try-again" href="javascript:void(0);">try it again</a>' +
			'</p>';
		YUE.on( 'J-try-again', 'click', function() {
			_self.ajaxCateList( cateName );
		} );
		this.lazyLoadImg();
	},

	/** 
	 * 固定类目导航
	 * @method fixCateList
	 * @public
	 */
	fixCateList: function() {
		var cache = this.cache,
			cateList = cache.cateList;

		YUE.on( window, 'scroll', function() {
			var scrollTop = YUD.getDocumentScrollTop();
			if ( YAHOO.env.ua.ie == 6 ) {
				var cateListStyle = cateList.style;
				if ( scrollTop > 170  ) {
					cateListStyle.position = 'absolute';
					cateListStyle.top = YUD.getDocumentScrollTop() - YUD.getY( cache.productList ) + 'px';
					cateListStyle.left = '0';
				} else {
					cateListStyle.top = '0';
					cateListStyle.left = '0';
				}
			} else {
				if ( scrollTop > 170  ) {
					YUD.addClass( cateList, 'cate-list-fix' );
				} else {
					YUD.removeClass( cateList, 'cate-list-fix' );
				}
			}
		} );
	},

	/** 
	 * 导航history管理，前进后退及刷新
	 * @method historyControl
	 * @public
	 */
	historyControl: function() {
		var config = this.config,
			cache = this.cache,
			_self = this,
			YUH = YAHOO.util.History;

		function initNavBar() {
			var cateLists = cache.cateList.getElementsByTagName( 'li' );

			for ( var i = 0, len = cateLists.length; i < len; i++ ) {
				var item = cateLists[ i ];
				YUE.on( item, 'click', function() {
					var cateName = this.getAttribute( 'rel' ) || config.defaultCate;
					try {
						YUH.navigate( "cateName", cateName );
					} catch ( e ) {
						_self.ajaxCateList( cateName );
					}
				} );
			}
			var currentCate = _self._getCateName();
			_self.ajaxCateList( currentCate );
			_self._addCurForCate( currentCate );
		}

		var bookmarked = YUH.getBookmarkedState( "cateName" ),
			initCateName = bookmarked || config.defaultCate;

		YUH.register( "cateName", initCateName, function ( state ) {
			_self.ajaxCateList( state );
			_self._addCurForCate( state );
		} );

		YUH.onReady( function () {
			initNavBar();
		} );

		try {
			YUH.initialize( "yui-history-field", "yui-history-iframe" );
		} catch (e) {
			_self.ajaxCateList( initCateName );
		}
	},

	/** 
	 * 调整profit文字的大小，分三位和四位的情况
	 * @method adjustProfitPadding
	 * @public
	 */
	adjustProfitPadding: function() {
		var config = this.config,
			profitList = YUD.getElementsByClassName( 'profit', 'p', 'J-product-list' );

		for ( var i = 0, len = profitList.length; i < len; i++ ) {
			var item = profitList[ i ],
				itemValue = parseInt( item.innerHTML );

			if ( itemValue > 999 ) {
				YUD.setStyle( item, 'fontSize', '14px' );
			}
		}
	},

	/** 
	 * 初始化事件，增加当前显示时的样式
	 * @method initEvent
	 * @public
	 */
	initEvent: function() {
		var config = this.config,
			cache = this.cache,
			cateLists = cache.cateList.getElementsByTagName( 'li' );

		YUE.on( cateLists, 'click', function() {
			for ( var i = 0; i < cateLists.length; i++ ) {
				var item = cateLists[ i ];
				YUD.removeClass( item, 'cur' );
			}
			YUD.addClass( this, 'cur' );
			window.scrollTo( 0, YUD.getY( cache.productList ) );
		} );
	},

	/** 
	 * 锚点定位，根据页面中的指定的ID自动定位
	 * @method initHash
	 * @public
	 */
	initHash: function() {
		var curHash = decodeURIComponent( this._getUrlParaValue( "subCate" ) );
		if ( curHash != 'undefined' ) {
			var hashId = YUD.get( curHash );
			//定位到锚点上一点的位置
			window.scrollTo( 0, YUD.getY( hashId ) - 100 );
			//hashId.scrollIntoView();
		}
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
			bottom: '158'
		} );
	},

	/** 
	 * 图片延时加载
	 * @method lazyLoadImg
	 * @public
	 */
	lazyLoadImg: function() {
		var lazyLoadImg = new AE.app.imagesLazyload().init( {
			mod: "manual"
		} );
	},

	/** 
	 * 根据锚点增加类目当前状态
	 * @method lazyLoadImg
	 * @private
	 */
	_addCurForCate: function( curCateName ) {
		var config = this.config,
			cache = this.cache,
			cateLists = cache.cateList.getElementsByTagName( 'li' );
		
		YUD.removeClass( cache.currentTab, 'cur' );
		for ( var i = 0; i < cateLists.length; i++ ) {
			var cateLi = cateLists[ i ],
				cateName = cateLi.getAttribute( 'rel' );

			if ( cateName == curCateName ) {
				YUD.addClass( cateLi, 'cur' );
				cache.currentTab = cateLists[ i ];
			}
		}
	},

	/** 
	 * 获取类目值
	 * @method _getCateName
	 * @private
	 */
	_getCateName: function() {
		var config = this.config,
			cache = this.cache,
			isExistCate = false,
			curCateName = this._getUrlParaValue( "cateName" ),
			cateLists = cache.cateList.getElementsByTagName( 'li' );
		
		for ( var i = 0, len = cateLists.length; i < len; i++ ) {
			var cateLi = cateLists[ i ],
				cateName = cateLi.getAttribute( 'rel' );

			if ( curCateName === cateName ) {
				isExistCate = true;
			}
		}

		if ( !isExistCate ) {
			curCateName = config.defaultCate;
		}
		return curCateName;
	},

	/** 
	 * 从url中获取指定的参数值
	 * @method _getUrlParaValue
	 * @para {string} 要获取的字符串的值
	 * @private
	 */
	_getUrlParaValue: function( para ) {
		var curUrl = location.href;
		if ( curUrl.indexOf( "#" ) != -1 ) {
			var queryArray = curUrl.split( "#" )[ 1 ].split( "&" );
			for ( var i = 0, len = queryArray.length; i < len; i++ ) {
				var item = queryArray[ i ].split( "=" );
				if ( item[ 0 ] == para ) {
					return item[ 1 ];
				}
			}
		}
	},

	/** 
	 * 切换交互状态
	 * @method _switchLoading
	 * @private
	 */
	_switchLoading: function() {
		var cache = this.cache;
		cache.productList.innerHTML = '<img class="loading" src="http://i03.i.aliimg.com/images/cms/upload/others/bargain_buy_2/images/loading.gif" />';
	}
};