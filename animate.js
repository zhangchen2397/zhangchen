HTB.widget.animate = function( oConfig ) {
	this.config = {
		targetId: oConfig.targetId,
		options: oConfig.options,
		speed: oConfig.speed,
		callback: oConfig.callback
	};
};

HTB.widget.animate.prototype = {
	init: function() {
		var _self = this,
			config = this.config;

		clearInterval( HTB.Dom.$( config.targetId ).timer );
		HTB.Dom.$( config.targetId ).timer = setInterval( function () {
			_self._anim();
		}, 30);
	},

	_anim: function() {
		var _self = this,
			config = this.config,
			opt = config.options,
			isComplete = true,
			iCur = 0,
			iSpeed = 0,
			oElement = HTB.Dom.$( config.targetId ); 

		for ( var attr in opt ) {
			if ( attr == "opacity" ) {
				iCur = parseInt( HTB.Dom.getCssAttr( oElement, attr ).toFixed( 2 ) * 100);
			} else {
				iCur = HTB.Dom.getCssAttr( oElement, attr );
			}
			iSpeed = ( opt[ attr ] - iCur ) / config.speed;
			iSpeed = iSpeed > 0 ? Math.ceil( iSpeed ) : Math.floor( iSpeed );

			if ( opt[ attr ] != iCur ) {
				isComplete = false;
				HTB.Dom.setCssAttr ( oElement, attr, iCur + iSpeed );
			}
		}

		if ( isComplete ) {
			clearInterval( HTB.Dom.$( config.targetId ).timer );
			if ( config.callback ) {
				config.callback();
			}
		}
	}
};