/**
 * @module AE.run.Bargainbuys
 */
AE.namespace( 'AE.run.Bargainbuys' );

/** 
 * 用于解析JSON格式的数据
 * 适用场景：用户bargain buys活动detail页面
 * @class AE.run.Bargainbuys.jsonRender
 */
AE.run.Bargainbuys.jsonRender = function() {
	this.config = {
		oData: [],										//数据源
		queryKey: 'pid',								//url中查询关键字pid
		renderCase: [],								//渲染模板对象数组
		relatedLimieLen: 6,							//相关产品最多显示的条数
		relatedProId: 'J-related-pro',				//相关产品
		relatedProTplId: 'related-product-tpl',	//相关产品模板id
		imgBaseUrl: '',									//图片引用的地址路径
		crosstradeUrl: '',								//crosstrade路径地址
		imgTypeName: {
			main: 'm1',			//产品主图名
			related: 'rl1',		//产品描述中的运送图
			freight: 'fr1'			//相关产品缩略图
		}
	};
};

AE.run.Bargainbuys.jsonRender.prototype = {
	/** 
	 * 初始化方法
	 * @method init
	 * @param {object} 当前类所需的配置参数
	 * @public
	*/
	init: function( customConfig ) {
		this.config = YL.merge( this.config, customConfig || {} );
		var _self = this,
			config = this.config;

		this._render( config.oData );
		this._renderRelatedTpl();
	},

	/** 
	 * 用于渲染当前产品的信息
	 * @method renderData
	 * @param {array} 数据源(对象数组)
	 * @public
	*/
	renderData: function( oData ) {
		var _self = this, 
			config = this.config,
			queryKey = config.queryKey,
			queryValue = this.getQueryValue( 'pid' ),
			resultData;

		//如果通过pid来查询
		if ( queryValue ) {
			for ( var i=0, len = oData.length;  i < len; i++ ) {
				var item = oData[ i ];
				if ( item[ queryKey ] === queryValue ) {
					resultData = item;
					resultData = this._dataHandle( resultData );
					return resultData;
				}
			}
		//根据当前日期显示对应的产品
		} else if ( typeof date != 'undefined' ) {
			for ( var i = 0, len = oData.length; i < len; i++ ) {
				var item = oData[ i ];
				if ( item[ 'showDate' ] == date ) {
					resultData = item;
					resultData = this._dataHandle( resultData );
					return resultData;
				}
			}
		}
		//保证有数据输出，默认显示第一个产品
		resultData = oData[ 0 ];
		resultData = this._dataHandle( resultData );
		return resultData;
	},

	/** 
	 * 根据当前pid获取分类Id
	 * @method _getCurCateId
	 * @param {string} 当前url中查询的pid
	 * @private
	*/
	_getCurCateId: function( pid ) {
		var config = this.config,
			Products = config.oData;

		//如果url中有pid，则根据pid去匹配相关产品
		if ( pid ) {
			for ( var i = 0, len = Products.length; i < len; i++ ) {
				var item = Products[ i ];
				if ( item.pid == pid ) {
					return item.cateId;
				}
			}
		//如果url中没有pid，则根据当前日期去匹配相关产品
		} else if ( typeof date != 'undefined' ) {
			for ( var i = 0, len = Products.length; i < len; i++ ) {
				var item = Products[ i ];
				if ( item.showDate == date ) {
					return item.cateId;
				}
			}
		}
		//以上条件都不满足时显示输出与第一个产品相同的cateId
		return Products[ 0 ].cateId;
	},

	/** 
	 * 根据分类id, 返回相关产品
	 * @method _getRelatedPro
	 * @param {num} 产品分类id
	 * @param {string} 产品pid
	 * @private
	*/
	_getRelatedPro: function( cateId, pid ) {
		var config = this.config,
			relatedProducts = [],
			totalRelatedProducts = [],
			Products = config.oData;

		for ( var i = 0, len = Products.length; i < len; i++ ) {
			var item = Products[ i ],
				showDate = item.showDate;
			//通过url中的pid来显示相应的产品信息
			if ( pid ) {
				if ( item.cateId == cateId && item.pid != pid  ) {
					totalRelatedProducts.push( item );
				}
			//通过日期来显示页面默认产品
			} else if ( typeof date != 'undefined' ) {
				if ( item.cateId == cateId && item.showDate != date && item.pid != '0001'  ) {
					totalRelatedProducts.push( item );
				}
			//默认情况下是第一个产品，所以相关产品中去除此产品
			} else {
				if ( item.cateId == cateId && item.pid != '0001' ) {
					totalRelatedProducts.push( item );
				}
			}
		}
		relatedProducts = this._limitRelatedPro( totalRelatedProducts );
		return relatedProducts;
	},

	/** 
	 * 限制相关产品的数量逻辑
	 * @method _limitRelatedPro
	 * @param {array} 所有相同类目的产品
	 * @private
	*/
	_limitRelatedPro: function( totalRelatedProducts ) {
		var config = this.config;

		//相关产品中去除过期产品
		if ( typeof date != 'undefined' ) {
			totalRelatedProducts = this._delExpiredPro( totalRelatedProducts );
		}
		
		var totalLen = totalRelatedProducts.length,
			relatedProducts = [],
			limitLen = config.relatedLimieLen;
		if ( totalLen > limitLen ) {
			for ( var i = 0; i < limitLen; i++ ) {
				relatedProducts.push( totalRelatedProducts[ i ] );
			}
		} else {
			relatedProducts = totalRelatedProducts;
		}
		return relatedProducts;
	},

	/** 
	 * 删除数组中指定的值
	 * @method _delExpiredPro
	 * @param {array} 原数组
	 * @private
	*/
	_delExpiredPro: function( totalRelatedProducts ) {		
		var config = this.config,
			expiredRelatedPro = [];

		for ( var i = 0, len = totalRelatedProducts.length; i < len; i++ ) {
			var item = totalRelatedProducts[ i ],
				nowDate = ( new Date( date ) ).getTime(),
				showDate = ( new Date( item.showDate ) ).getTime();
			if ( !isNaN( showDate ) && nowDate >= showDate ) {
				expiredRelatedPro.push( item );
			}
		}

		for ( var j = 0, expiredLen = expiredRelatedPro.length; j < expiredLen; j++ ) {
			this.removeByValue( totalRelatedProducts, expiredRelatedPro[ j ] );
		}
		return totalRelatedProducts;
	},

	/** 
	 * 删除数组中指定的值
	 * @method removeByValue
	 * @param {array} 原数组
	 * @param {string} 要删除数组的值
	 * @public
	*/
	removeByValue: function( array, value ) {
		for( var i = 0, n = 0; i < array.length; i++ ) {
			if ( array[ i ] != value ) {
				array[ n++ ] = array[ i ];
			}  
		}
		array.length -= 1;
	},

	/** 
	 * 获取url查询字符串的指定的key值
	 * @method getQueryValue
	 * @public
	*/
	getQueryValue: function( queryKey ) {
		var searchArg = location.search.substring( 1 ).split( '&' );
		for ( var i = 0, len = searchArg.length; i < len; i++ ) {
			var item = searchArg[ i ];
			if ( item.indexOf( queryKey ) !=  -1 ) {
				var queryValue = item.split( '=' )[ 1 ];
			}
		}
		return queryValue;
	},

	/** 
	 * 将相关产品数据渲染成html模板
	 * @method _renderRelatedTpl
	 * @private
	*/
	_renderRelatedTpl: function() {
		var config = this.config,
			imgTypeName = config.imgTypeName,
			pid = this.getQueryValue( 'pid' ),
			cateId = this._getCurCateId( pid ),
			relatedProducts = {},
			tpl = YUD.get( config.relatedProTplId ).value;

		relatedProducts.item = this._getRelatedPro( cateId, pid );
		var relatedProItem = relatedProducts.item;
		for ( var i = 0, len = relatedProItem.length; i < len; i++ ) {
			var item = relatedProItem[ i ];
			item.rlImg = config.imgBaseUrl + item.pid + imgTypeName.related + '.jpg';
		}
		YUD.get( config.relatedProId ).innerHTML =  Mustache.to_html( tpl, relatedProducts );
	},

	/** 
	 * 渲染detail页面中产品为html模板
	 * @method _renderRelatedTpl
	 * @param {array} 所有产品数据源
	 * @private
	*/
	_render: function( oData ) {
		var _self = this,
			config = _self.config,
			view = _self.renderData( oData ),
			renderCase = config.renderCase;

		for ( var i = 0, len = renderCase.length; i < len; i++ ) {
			var tmp = renderCase[ i ],
				showCase = YUD.get( tmp.showCase );

			showCase.innerHTML = Mustache.to_html( tmp.template, view );
		}
	},

	/** 
	 * 数据处理，增加相关字段信息
	 * @method _dataHandle
	 * @param {object} 产品详细信息
	 * @private
	*/
	_dataHandle: function( resultData ) {
		var config = this.config,
			imgTypeName = config.imgTypeName,
			imgBaseUrl = config.imgBaseUrl,
			pid = resultData.pid;

		resultData.location = encodeURIComponent( location.href );
		resultData.pImg = imgBaseUrl + pid + imgTypeName.main + '.jpg';
		resultData.frImg = imgBaseUrl + pid + imgTypeName.freight + '.jpg';

		var postData = [
			'svId=' + encodeURIComponent(resultData.svId),
			'productId=' + encodeURIComponent(resultData.productId),
			'pName=' + encodeURIComponent(resultData.pName),
			'pUnit=' + encodeURIComponent(resultData.moqUnit),
			'pUprice=' + encodeURIComponent(resultData.price),
			'pQuan=' + encodeURIComponent(resultData.moq),
			'sellerId=' + encodeURIComponent(resultData.sellerId)
		].join( "&" );
		resultData.postUrl = config.crosstradeUrl + postData;

		//控制显示及隐藏的字段
		resultData.blankDiv = ( parseInt( resultData.bought ) > 0 ) ? false : true;
		resultData.hasBought = ( parseInt( resultData.bought ) > 0 ) ? true : false;
		resultData.isGS = ( parseInt( resultData.GS ) == 1 ) ? true : false;
		resultData.isOC = ( parseInt( resultData.OC ) == 1 ) ? true : false;
		resultData.isAS = ( parseInt( resultData.AS ) == 1 ) ? true : false;
		
		//多图片输出src的拼装
		var imgBase = resultData.imgBase,
			imgType = imgBase.imgType;
		for ( var i = 0, len = imgType.length; i < len; i++ ) {
			var tmpImgType = imgType[ i ],
				type = tmpImgType.type,
				key = tmpImgType.key,
				count = tmpImgType.count;

			if ( count > 0 ) {
				resultData[ type ] = [];
				for( var j = 1; j <= count; j++ ) {
					resultData[ type ].push( { 'imgUrl': config.imgBaseUrl + pid + key + j + '.jpg' } );
				}
			}
		}
		return resultData;
	}
};