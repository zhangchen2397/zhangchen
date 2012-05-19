AE.namespace( 'AE.run.Bargainbuys' );
AE.run.Bargainbuys.lazyLoad = function() {
	this.config = {
		imgTag: 'lazy_src'
	};
	this.temp = {
		imgs: document.getElementsByTagName( 'img' ),
		lazyImg: []
	};
	return this;
};

AE.run.Bargainbuys.lazyLoad.prototype = {
	init: function( customConfig ) {
		this.config = YL.merge( this.config, customConfig || {} );
		var _self = this,
			config = this.config,
			temp = this.temp;

		_self._lazy();
		_self._initEvent();
		return _self;
	},

	_initEvent: function() {
		var _self = this,
			config = this.config,
			temp = this.temp;

		YUE.on( window, 'scroll', function() {
			_self._lazy();
		} );

		YUE.on( window, 'resize', function() {
			_self._lazy();
		} );
	},

	_lazy: function() {
		var _self = this,
			config = this.config,
			temp = this.temp;
		
		_self._getImgs();

		var scrollTop = YUD.getDocumentScrollTop(),
			clientHeight = YUD.getViewportHeight(),
			totalCliengHeight = scrollTop + clientHeight;

		for ( var i = 0, len = temp.lazyImg.length; i < temp.lazyImg.length; i++ ) {
			var lazyItem = temp.lazyImg[ i ],
				imgTop = YUD.getY( lazyItem ),
				imgBottom = imgTop + lazyItem.height;
			if ( ( imgTop > scrollTop && imgTop < totalCliengHeight ) ||  ( imgBottom > scrollTop && imgBottom < totalCliengHeight ) ) {
				var lazySrc = lazyItem.getAttribute( config.imgTag );
				if ( lazyItem.src != lazySrc ) {
					lazyItem.src = lazySrc;
				}
			}
		}
	},

	_getImgs: function() {
		var _self = this,
			config = this.config,
			temp = this.temp;

		for ( var i = 0, len = temp.imgs.length; i < len; i++ ) {
			var item = temp.imgs[ i ];
			if ( item.getAttribute( config.imgTag ) ) {
				temp.lazyImg.push( item );
			}
		}

		return temp.lazyImg;
	}
};