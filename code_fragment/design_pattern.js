//单例模式
( function( doc, export ) {
	var defConfig = {
		age: 25,
		name: 'zhangchen'
	};
	function privateMethod() {
		//code here
	}

	var singleton = {
		init: function() {
			//code here
		},

		getAge: function() {
			return this.age || defConfig.age;
		},

		setAge: function( age ) {
			this.age = age;
		}

		....
	}

	export.singleton = singleton;
} )( document, window );


//构造函数及原型模式
( function( doc, export ) {
	var defConfig = {
		name: 'zhangchen',
		age: 25
	};
	function privateMethod() {
		//code here
	}

	function Person( name, age ) {
		this.name = name || defConfig.name;
		this.age = age || defConfig.age;
		this.init.call( this );
	}

	Person.prototype = {
		constructor: Person,

		init: function() {
			//code here
		},

		getName: function() {
			return this.name;
		}

		...
	}

	export.Person = Person;
} )( document, window );


//桥接模式 ( 事件监听器回调函数 )
//原始的事件监听
addEventListener( domElement, "click", function( e ){
    var btnValue = this.value.split( "x" );
    var size = {
        width : btnValue[ 0 ],
        height : btnValue[ 1 ]
    };
    var oImg = document.getElementById( "img" );
    oImg.style.width = size.width + "px";
    oImg.style.height = size.height + "px";
} );

//通过桥接模式改造后
var changeSize = function( buttonValue ){
    var btnValue = buttonValue.split( "x" );
    var size = {
        width : btnValue[0],
        height : btnValue[1]
    };
    var oImg = document.getElementById( "img" );
    oImg.style.width = size.width + "px";
    oImg.style.height = size.height + "px";
};

var changeSizeBridge = function( e ){
    changeSize( this.value );
};

addEventListener( domElement, "click", changeSizeBridge );

//将多个桥接模式连接起来
var Class1 = function( a, b, c ) {
	this.a = a;
	this.b = b;
	this.c = c;
}

var Class2 = function( d ) {
	this.d = d;
};

var BridgeClass = function( a, b, c, d ) {
	this.one = new Class1( a, b, c );
	this.two = new Class2( d );
};


//观察者模式( 广播订阅的方式，相当于自定义事件 )
function Dialog( config ) {
	this.config = {};
	this.init.call( this, config );
}

Dialog.prototype = {
	init: function( config ) {
		this.config = YL.merge( this.config, config || {} );
		this.createDialog();
		this.bindEvent();
		this.onShow = new YAHOO.util.CustomEVent( 'onShow', this, true );
		this.onHide = new YAHOO.util.CustomEvent( 'onHide', this, true );
	},

	show: function() {
		//code here;
		this.onShow.fire( this );
	},

	hide: function() {
		//code here;
		this.onHide.fire( this );
	}
};

//aplly dialog instance
var myDialog = new Dialog();
myDialog.onShow.subscribe( function() {
	alert( 'dialog showing now' );
} );

//门面模式( 相当于把方法的集合放在一个命名空间下 )
HTB.util.Event = {
	addEvent: function( elem, type. hander ) {
		//code here;
	},
	
	removeEvent: function( elem, type, hander ) {
		//code here;
	},

	getEvent: function( event ) {
		//code here;
	}

	getTarget: function( event ) {
		//code here;
	},

	stopPropagation: function( event ) {
		//code here;
	},

	preventDefault: function( event ) {
		//code here;
	}
}