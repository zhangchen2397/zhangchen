( function( doc, export ) {
	var YUD = YAHOO.util.Dom,
		YUE = YAHOO.util.Event,
		YL = YAHOO.lang;

	function Model() {
		//code here
	}
	Model.prototype = {
		_init: function() {
			//code here
		}
	}

	function View() {
		//code here
	}
	View.prototype = {
		_init: function( Model, Control ) {
			this.model = Model;
			this.control = control;
		}
	};

	function Control( config ) {
		this.config = YL.merge( defConfig, config || {} );
		this._init.call( this );
	}
	Control.prototype = {
		_init: function() {
			this.model = new Model();
			this.model.config = this.config;
			this.model._init();

			this.view = new View();
			this.view.config = this.config;
			this.view._init( this.model, this );
		}
	};

	export.auto_suggestion = control;

} )( document, window );