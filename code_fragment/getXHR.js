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

function getXHR() {
	var xhr = null;
	if ( window.XMLHttpRequest ) {
		xhr = new XMLHttpRequest();
	} else {
		try {
			xhr = new ActiveXObject( 'MSXML2.XMLHTTP' );
		} catch( e ) {
			try {
				xhr = new ActiveXObject( 'Microsoft.XMLHTTP' )
			} catch( e ) {
			
			}
		}
	}
}

xhr.onreadystatechange = function( o ) {
	if ( xhr.readyState = 4 && xhr.status == 200 ) {
		var responseObj = o.responseText;
	}
}

xhr.open( 'get', 'http://www.alibaba.com', true );
xhr.send( null );