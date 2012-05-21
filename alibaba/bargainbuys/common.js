( function( AE ) {
	AE.namespace( 'AE.bargainBuys.fn' )
	AE.bargainBuys.fn = {
		//控制xman弹出
		popUpXman: function( id ) {
			var xmanjsUrl = "https://login.alibaba.com/xman/xman.js?display=p&pd=alibaba&style=b&modal=n&join=a&login=a&tab=l&back=g&delay=true&title=a&link=a&lbutton=a&jbutton=a";
			if ( !AE.xman_join_login ) {
				YAHOO.util.Get.script( xmanjsUrl, {
					onSuccess: function() {
						AE.xman_join_login.boxPopup( id );
					}
				} );
			} else {
				AE.xman_join_login.boxPopup( id );
			}
		},
		
		//取得用户类型
		getCookieUserType: function() {
			var userCookie = AE.util.getCookie( 'xman_us_f' ), userType;
			var userReg = /x_user=([^&]+)/;
			if ( userCookie && userReg.test( userCookie ) ) {
				userCookie.match( userReg );
				userCookie = RegExp.$1;
				userCookie = userCookie.split( '|' );
				userType = userCookie[ 3 ];
			}
			return userType || '';
		},

		//xman登录后回调
		xman_callback: function( obj, id, isClosed ) {
			var _self = AE.bargainBuys.fn;
			if ( !isClosed ) {
				try {
					AE.xman_join_login.boxClose();
				} catch ( e ) {
					//console.log( e.message )
				}
			}
			var userType = _self.getCookieUserType();
			if ( userType == 'ifm' || userType == 'ggs' || userType == 'tp' ) {
				location.href = YUD.get( 'post-url' ).value;
			} else {
				YAHOO.util.Get.script( 'http://style.alibaba.com/js/myalibaba/msg_box.js', {
					onSuccess: function() {
						var html = 'Sorry, this event is currently not available for your membership type.',
							size = [ 350, 245 ];
						try {
							msgBox.xWindow( html, size );
						} catch ( e ) {
							//console.log( e.message )
						}
					}
				} );
			}
		},
		
		//下单前判断是否登录
		isLogin: function() {
			var loginFlag = AE.util.getCookie( 'xman_us_t' );
			if ( loginFlag.indexOf( 'sign=y' ) != -1 ) {
				return true;
			}
			return false;
		}
	};

	if ( !window.fn ) {
		window.fn = AE.bargainBuys.fn;
	}
	//xman_callback方法暴露到全局方法中去
	window.xman_callback = fn.xman_callback;
} )( AE );