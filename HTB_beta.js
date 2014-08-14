/**
 * huitaoba.com JavaScript v1.0
 * By: Sam
 * QQ: 693575612
 * Mail: zhangchen2397@gmail.com
 * Date: 2011-10-14
 */

/**
 * The HTB global namespace object. 
 * @class HTB
 * @static
 */
if ( typeof HTB == "undefined" || !HTB ) {
	var HTB = {};
}

/**
 * defined the frequently-used operate of the dom
 * @class Dom
 * @static
 */
HTB.Dom = {
	/**
	 * return the HTMLElement by id
	 * @method $ 
	 * @para {string} id the id name to match against
	 * @return {HTMLElement} A DOM reference to an HTML element
	 */
	$: function( id ) {
		if ( typeof id == "string" ) {
			return document.getElementById( id );
		} else {
			return id;
		}
	},

	/**
	 * return the array of the HTMLElements by tag name
	 * @method getByTagName
	 * @para {string} tag The tag name of the elements being collected
	 * @para {HTMLElement} parent (optional)
	 * @return {array} array of the HTMLElements
	 */
	getByTagName: function( tag, parent ) {
		return ( parent || document ).getElementsByTagName( tag );
	},

	/**
	 * return the array of the HTMLElements by class name
	 * @method getByClassName
	 * @para {string} className The class name to match against
	 * @para {string} tag The tag name of the elements being collected
	 * @para {HTMLElement} parent (optional)
	 * @return {array} array of the HTMLElements
	 */
	getByClassName: function( className, tag, parent ) {
		var parent =  parent || document;

		var allTags = ( tag == "*" && parent.all ) ? parent.all : parent.getElementsByTagName( tag );
		var matchingElements = new Array();
		
		var className = className.replace( /\-/g, "\\-" );
		var regex = new RegExp( "(^|\\s)" + className + "(\\s|$)" );
		
		var element;
		for ( var i = 0; i < allTags.length; i++ ) {
			element = allTags[ i ];
			if( regex.test( element.className ) ) {
				matchingElements.push( element );
			}
		}
		
		return matchingElements;
	},

	/**
	 * detect whether an HTMLElement has the given className.
	 * @method hasClass
	 * @para {HTMLElement} the HTMLElement
	 * @para {string} className The class name to match against
	 * @return {boolean}
	 */
	hasClass: function( element, className ) {
		if ( !element ) return false;

		var elementClassName = element.className;
		return ( elementClassName.length > 0 && ( elementClassName == className ||
			new RegExp( "(^|\\s)" + className + "(\\s|$)" ).test( elementClassName ) ) );
	},

	/**
	 * Adds a class name to a given element
	 * @method addClass
	 * @para {HTMLElement} the HTMLElement
	 * @para {string} className The class name whicth to add
	 * @return {boolean}
	 */
	addClass: function( element, className ) {
		var ret = false;
		if ( !element ) return ret;

		if ( !HTB.Dom.hasClass( element, className ) ) {
			element.className += ( element.className ? ' ' : '' ) + className;
			var ret = true;
		}
		
		return ret;
	},

	/**
	 * remove a class name to a given element
	 * @method removeClass
	 * @para {HTMLElement} the HTMLElement
	 * @para {string} className The class name whicth to add
	 * @return {boolean}
	 */
	removeClass: function( element, className ) {
		var ret = false;
		if ( !element ) return ret;

		element.className = element.className.replace( 
			new RegExp( "(^|\\s+)" + className + "(\\s+|$)" ), " ").replace(/^\s+/, "").replace(/\s+$/, "");
		ret = true;

		return ret;
	},

	/**
	 * Returns the current height of the viewport.
	 * @method getClientHeight
	 * @return {Int} The height of the viewable area of the page.
	 */
	getClientHeight: function() {
		var document = window.document,
			documentElement = document.documentElement;
		return document.compatMode == "CSS1Compat" ? documentElement.clientHeight : document.body.clientHeight;
	},

	/**
	 * Returns the current width of the viewport.
	 * @method getClientWidth
	 * @return {Int} The width of the viewable area of the page.
	 */
	getClientWidth: function() {
		var document = window.document,
			documentElement = document.documentElement;
		return document.compatMode == "CSS1Compat" ? documentElement.clientWidth : document.body.clientWidth;
	},

	/**
	 * Returns the height of the scroll's top part
	 * @method getScrollTop
	 * @return {Int} the height of the scroll's top part
	 */
	getScrollTop: function() {
		return document.documentElement.scrollTop || document.body.scrollTop;
	},

	/**
	 * Returns the width of the scroll's left part
	 * @method getScrollLeft
	 * @return {Int} the width of the scroll's left part
	 */
	getScrollLeft: function() {
		return document.documentElement.scrollLeft || document.body.scrollLeft; 
	}, 

	/**
	 * Returns the x coordinate of the element to the page
	 * @method getX
	 * @para {HTMLElement}
	 * @return {Int} the x coordinate of the element
	 */
	getX: function( element ) {
		return element.offsetLeft + ( element.offsetParent ? arguments.callee( element.offsetParent ) : 0 );
	},

	/**
	 * Returns the y coordinate of the element to the page
	 * @method getY
	 * @para {HTMLElement}
	 * @return {Int} the y coordinate of the element
	 */
	getY: function( element ) {
		return element.offsetTop + ( element.offsetParent ? arguments.callee( element.offsetParent ) : 0 );
	},

    /**
     * Set the opacity value cross browers
     * @method setOpacity
     * @para {HTMLElement}
     * @para {int} the opacity value referrence of the ie
     * @return valid
     */
	 setOpacity: function( element, value ) {
		element.style.filter = "alpha( opacity = " + value + " )";
		element.style.opacity = value / 100;
	},

    /**
     * return the property of the css
     * @method getCssAttr
     * @para {HTMLElement}
     * @para {string} the property of the css
     * @return value of the attr
     */
	getCssAttr: function( element, attr ) {
		if ( element.currentStyle ) {
			return parseFloat( element.currentStyle[ attr ] );
		} else {
			return parseFloat( getComputedStyle( element, null )[ attr ] );
		}
	},

    /**
     * set the property of the css(just useful opacity, width, height, left, top)
	 * use for the animate
     * @method setCssAttr
     * @para {HTMLElement}
     * @para {string} the property of the css
	 * @para {int} the value of the property
     * @return valid
     */
	setCssAttr: function( element, attr, value ) {
		if ( attr == "opacity" ) {
			HTB.Dom.setOpacity( element, value );
		} else {
			element.style[ attr ] = value + "px";
		}
	}
};

/**
 * defined the frequently-used operate of the event
 * @class HTB.Event
 * @static
 */
HTB.Event = {	
	addEvent: function( element, type, hander ) {
		if ( element.addEventListener ) {
			// W3C method
			element.addEventListener( type, hander, false );
			return true;
		} else if( element.attachEvent ) {
			// MSIE method
			element[ 'e' + type + hander ] = hander;
			element[ type + hander ] = function() {
				element[ 'e' + type + hander ]( window.event );
			}
			element.attachEvent( 'on' + type, element[ type + hander ] );
			return true;
		}
		
		return false;
	},
	
	removeEvent: function( element, type, hander ) {
		if ( element.removeEventListener ) {
			element.removeEventListener( type, hander, false );
		} else if ( element.deattachEvent ) {
			element.detachEvent( type, hander );
		} else {
			element[ 'on' + type ] = null;
		}
	},

	getEvent: function( event ) {
		return event || window.event;
	},
	
	getTarget: function( event ) {
		return event.target || event.srcElement;
	},
	
	preventDefault: function( event ) {
		if ( event.preventDefault ) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},

	stopPropagation: function( event ) {
		if ( event.stopPropagation ) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	}
};

/**
 * detect the browser's type and version
 * @class HTB.env
 * @static
 */
HTB.env = {
	ua: navigator.userAgent,
	isIE: function() {
		if ( /msie (\d+\.\d+)/i.test( HTB.env.ua ) ) {
			return parseInt( RegExp.$1 );
		} else { 
			return undefined;
		}
	}
};

HTB.ajax = {
	createXHR: function() {
		if ( typeof XMLHttpRequest != 'underfined' ) {
			return new XMLHttpRequest();
		} else if ( window.ActiveXObject ) {
			var verxml = [ 'MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0' ];
			for ( var i = 0; i < verxml.length; i++ ) {
				try {
					return new ActiveXObject( verxml[ i ] );
				} catch( e ) {
					return false;
				}
			}
		} else {
			return false;
		}
	}
};

/**
 * defined the common used function object.
 * @class HTB.Fun
 * @static
 */
HTB.Fun = {
	/**
	 * fixed the positon if the brower is the ie6.
	 * @method ie6Fixed
	 * @para {HTMLElement}
	 * @return valid
	 */
	ie6Fixed: function( element ) {
		if( HTB.env.isIE() == 6 ) {
			var top = HTB.Dom.getCssAttr( element, "top" ) || 0,
			dd = "(document.documentElement)";
			document.documentElement.style.textOverflow = "ellipsis";
			element.style.position = "absolute";
			element.style.setExpression( "top", "eval(" + dd + ".scrollTop + " + ( top - HTB.Dom.getScrollTop() ) + ') + "px"' );
		} else {
			element.style.position = "fixed";
		}
	},

	/**
	 * merge two object.
	 * @method merge
	 * @para {obj} the destination obj
	 * @para {obj} the other obj
	 * @return object
	 */
	merge: function( sourceObj, customObj ) {
		for ( var property in customObj ) {
			sourceObj[ property ] = customObj[ property ];
		}
		return sourceObj;
	}
	
};

/**
 * defined the widget object for some tools.
 * @class HTB.widget
 * @static
 */
HTB.widget = {};
