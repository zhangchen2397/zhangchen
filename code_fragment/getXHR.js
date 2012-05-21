var getXHR = function() {
	var xhr = null;
	try {
		xhr = new XMLHttpRequest();
	} catch( e ) {
		var msxml = [ 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP' ]; 
		for ( var i = 0; i < msxml.length; i++ ) {
			try {
				xhr = new ActiveXObject( msxml[ i ] );
				break;
			} catch( e ) {}
		}
	}

	return xhr;
};