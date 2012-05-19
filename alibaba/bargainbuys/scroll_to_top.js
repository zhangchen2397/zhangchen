AE.namespace( 'AE.run.Bargainbuys' );
AE.run.Bargainbuys.scrollToTop = function() {
	this.config = {
		btnId: 'goto-top',
		bottom: '100'
	};
	this.button = null;
}

AE.run.Bargainbuys.scrollToTop.prototype = {
	init: function( oConfig ) {
		this.config = YL.merge( this.config, oConfig || {} );
		var _self = this,
			config = this.config;

		_self.button = get( config.btnId );
		_self.button.style.display = 'none';
		_self._setBtnLeft();
		_self._initEvent();
		return _self;
	},
	
	_initEvent: function(){
		var _self = this,
			config = this.config;
		
		YUE.on( window, 'resize', function() {
			_self._setBtnLeft();
			_self._setBtnTop();
		}, this, true );
		
		YUE.on( window, 'scroll', function() {
			_self._setShowOrNot();
			_self._setBtnTop();
		}, this, true );
		
		YUE.on( this.button, 'click', function() {
			window.scrollTo( 0, 0 );
		} );
	},

	_setShowOrNot: function() {
		var _self = this,
			config = this.config,
			scrollTop = YUD.getDocumentScrollTop();

		if ( scrollTop > 100 ) {
			this.button.style.display = 'block';
		} else {
			this.button.style.display = 'none';
		}
	},

	_setBtnLeft: function() {
		var _self = this,
			config = this.config,
			viewportWidth = YUD.getViewportWidth(),
			leftP = (viewportWidth - 960) / 2 + 960 + 12;

		if ( viewportWidth < 1022 ) {
			leftP = viewportWidth - 62;
		}
		_self.button.style.left = leftP + 'px';
	},

	_setBtnTop: function() {
		var _self = this,
			config = this.config,
			button = _self.button,
			viewportHeight = YUD.getViewportHeight();

		if( YAHOO.env.ua.ie == 6 ) {
			button.style.position = 'absolute';
			button.style.top = viewportHeight + YUD.getDocumentScrollTop() - config.bottom + 'px';
		} else {
			button.style.position = 'fixed';
			_self.button.style.top = viewportHeight - config.bottom + 'px';
		}
	}
}