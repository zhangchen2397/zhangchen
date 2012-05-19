AE.namespace( 'AE.run.Bargainbuys' );
AE.run.Bargainbuys.highLightPic = function() {
	this.config = {
		containerId: 'container'
	};
	return this;
};

AE.run.Bargainbuys.highLightPic.prototype = {
	init: function( customConfig ) {
		this.config = YL.merge( this.config, customConfig || {} );		
		this._createMask();
		this._initEvent();
	},

	_createMask: function() {
		var _self = this,
			config = this.config,
			container = YUD.get( config.containerId ),
			itemList = container.getElementsByTagName( 'a' );
		
		for ( var i = 0, len = itemList.length; i < len; i++ ) {
			var item = itemList[ i ],
				itemImg = YUD.getFirstChild( item ),
				width = itemImg.width + 'px',
				height = itemImg.height + 'px',
				maskDiv = document.createElement( "div" );
				
			YUD.setStyle( maskDiv, 'position', 'absolute' );
			YUD.setStyle( maskDiv, 'top', 0 );
			YUD.setStyle( maskDiv, 'left', 0 );
			YUD.setStyle( maskDiv, 'width', width );
			YUD.setStyle( maskDiv, 'height', height );
			YUD.setStyle( maskDiv, 'backgroundColor', '#000000' );
			YUD.setStyle( maskDiv, 'opacity', 0 );
			YUD.setStyle( maskDiv, 'cursor', 'pointer' );
			item.appendChild( maskDiv );
		}
	},

	_initEvent: function() {
		var _self = this,
			config = this.config,
			container = YUD.get( config.containerId ),
			itemList = container.getElementsByTagName( 'a' );

		YUE.on( container, 'mouseover', function( e ) {
			var target = YUE.getTarget( e );

			for ( var i = 0, len = itemList.length; i < len; i++ ) {
				var item = itemList[ i ],
					maskDiv = YUD.getLastChild( item );

				if ( maskDiv !== target ) {
					//ie9下动画渐变有问题，简单处理为ie9下无动画效果
					if ( YAHOO.env.ua.ie === 9 ) {
						YUD.setStyle( maskDiv, 'opacity', 0.3 );
					} else {
						var anim = new YAHOO.util.Anim( maskDiv, {
							opacity: { to: 0.3 }
						}, 0.5, YAHOO.util.Easing.easeOut );
						anim.animate();
					}
				}
			}
		} );

		YUE.on( container, 'mouseout', function( e ) {
			for ( var i = 0, len = itemList.length; i < len; i++ ) {
				var item = itemList[ i ],
					maskDiv = YUD.getLastChild( item );

				//ie9下动画渐变有问题，简单处理为ie9下无动画效果
				if ( YAHOO.env.ua.ie === 9 ) {
					YUD.setStyle( maskDiv, 'opacity', 0 );
				} else {
					var anim = new YAHOO.util.Anim( maskDiv, {
						opacity: { to: 0 }
					}, 0.5, YAHOO.util.Easing.easeOut );
					anim.animate();
				}
			}
		} );
	}
};