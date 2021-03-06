/**
 * fixed the positon if the brower is the ie6.
 * @method ie6Fixed
 * @para {HTMLElement}
 * @return valid
 */
function ie6Fixed( element ) {
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
 * merge two object like a = {name: "", age: ""}, b = {}.
 * @method merge
 * @para {obj} the destination obj
 * @para {obj} the other obj
 * @return object
 */
function merge( sourceObj, customObj ) {
	for ( var property in customObj ) {
		sourceObj[ property ] = customObj[ property ];
	}
	return sourceObj;
}

/**
 * merge two object like a={person: {}, work: ""}; b={}.
 * @method merge
 * @para {obj} the destination obj
 * @para {obj} the other obj
 * @return object
 */
function mergeObj( defaultObj, customObj ) {
	for ( var attr in customObj ) {
		if ( typeof customObj[ attr ] == "object" ) {
			defaultObj[ attr ] = arguments.callee( defaultObj[ attr ], customObj[ attr ] );
		} else {
			defaultObj[ attr ] = customObj[ attr ];
		}
	}
	return defaultObj;
}

/**
 * get the value of the input type
 * @method getInputValue
 * @para {HTMLElement} the input element
 * @return string
 */
function getInputValue( elem ) {
	switch (elem.type.toLowerCase()) {
		case 'checkbox':
			return elem.checked ? elem.value : null;
		case 'radio':
			if (elem.name) {
				var elems = this._form[elem.name];
				for (var i = 0; i < elems.length; ++i) {
					if (elems[i].checked) {
						return elems[i].value;
					}
				}
				return null;
			} else {
				return elem.checked ? elem.value : null;
			}
		default:
			return elem.value;
	}
}

/**
 * get the value of the select type
 * @method getSelectValue
 * @para {HTMLElement} the select element
 * @return string
 */
function getSelectValue(elem) {
	return elem.options[elem.selectedIndex].value;
}

/**
 * get the value of the textarea type
 * @method getTextareaValue
 * @para {HTMLElement} the textarea element
 * @return string
 */
function getTextareaValue(elem) {
	return elem.value;
}

/**
 * set the select option's value specify value
 * @method changeSelection
 * @para {string} the select's id
 * @para {string} the value which want to specify
 * @return boolean
 */
function changeSelection( select, value ) {
	select = HTB.Dom.$( select );
	
	for( var i = 0, len = select.options.length; i < len; i++ ) {
		if ( value == select.options[i].value ) {
			select.selectedIndex = i;
			return true;
		}
	}
	
	return false;
}

/**
 * ajust the images's width and height
 * if the images's width or height beyond the size we give that show this
 * img src="image" onload="setImgSizeWH(this.src,this,sizew,sizeh)"
 * @param theURL  - img url
 * @param sImage  - img object
 * @param imgW  - limit width
 * @param imgH  - limit height
 */
function setImgSizeWH( theURL,sImage,imgW,imgH ) {
	var imgObj;
	imgObj = new Image();
	imgObj.src = theURL;
	if ( ( imgObj.width != 0 ) && ( imgObj.height != 0 ) ) {	
		if ( imgObj.width > imgW || imgObj.height > imgH ) {			
			var iHeight = imgObj.height * imgW / imgObj.width;			
			if ( iHeight <= imgH ) {
				sImage.width = imgW;
				sImage.height = iHeight;
			} else {
				var iWidth = imgObj.width * imgH / imgObj.height;
				sImage.width = iWidth;
				sImage.height = imgH;
			}
		} else {
			sImage.width = imgObj.width;
			sImage.height = imgObj.height;
		}
	} else {
		sImage.width = imgW;
		sImage.height = imgH;
	}
}

Function.prototype.method = function( name, fn ) {
	this.prototype[ name ] = fn;
	return this;
};

if ( !Array.prototype.forEach ) {
	Array.method( 'forEach', function(fn, thisObj ) {
		var scope = thisObj || window;
		for ( var i = 0, len = this.length; i < len; ++i ) {
			fn.call( scope, this[i], i, this );
		}
	} );
}

if ( !Array.prototype.filter ) {
	Array.method( 'filter', function(fn, thisObj) {
		var scope = thisObj || window;
		var a = [];
		for ( var i = 0, len = this.length; i < len; ++i ) {
			if ( !fn.call( scope, this[ i ], i, this ) ) {
				continue;
			}
			a.push( this[ i ] );
		}
		return a;
	} );
}

if ( !Array.prototype.indexOf ) {
	Array.prototype.indexOf = function( str ) {
		for ( var i = 0, len = this.length; i < len; i++ ) {
			var item = this[ i ];
			if ( item == str ) {
				return i;
				break;
			}
		}
		return -1;
	}
}

if ( !String.prototype.tirm ) {
	String.prototype.tirm = function() {
		return this.replace( /^\s*|\s*$/gi, '' );
	}
}

function setStyle( elements, prop, value ) {
	for ( var i = 0, len = elements.length; i < len; i++ ) {
		document.getElementById( elements[ i ] ).style[ prop ] = value;
	}
}
//setStyle(['foo', 'bar', 'baz'], 'color', 'red');
//setStyle(['foo'], 'position', 'absolute');

function setCss( element, styles ) {
	for ( var prop in styles ) {
		if ( styles.hasOwnProperty( prop ) ) {
			setStyle( element, prop, styles[ prop ] );
		}
	}
}
/*
setCSS( [ 'foo' ], {
	position: 'absolute',
	top: '50px',
	left: '300px'
} );
*/

//判断对象是否为空
function isEmptyObject( object ) {
	var i = 0;
	for ( var k in object ) {
		if ( object.hasOwnProperty( k ) ) {
			i++;
		}
	}
	if ( !i ) {
		return true;
	} else {
		return false;
	}
}
//var b = { a: '1', c: '2' };
//console.log( isEmptyObject( b ) ); //false
//console.log( isEmptyObject( {} ) ); //true

//生成一个n位数的随机数
function createRandom( n ) {
	var result = '';
	for ( var i = 0; i < n; i++ ) {
		result += Math.floor( Math.random() * 10 );
	}
	return result;
}

//生成一个从lowerValue 到upperValue之间的随机，包括lowerValue及upperValue
function selectFrom( lowerValue, upperValue ) {
	var choices = upperValue - lowerValue + 1;
	return Math.floor( Math.random() * choices + lowerValue );
}

function extend( subClass, superClass ) {
	var F = function() {};
	F.prototype = superClass.prototype;
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;
}