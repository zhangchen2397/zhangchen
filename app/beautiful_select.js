AE.namespace("AE.run.intlAisn.clickShow");
AE.run.intlAisn.clickShow = function() {
	this.config = {
		clickTargetEle: "",
		clickTitleContent: "",
		showContentEle: ""
	};
};

AE.run.intlAisn.clickShow.prototype = {
	showContent: function() {
		var config = this.config;
		YUE.on(document, "click", function(event) {
			var event = YUE.getTarget(event);
			if (YUD.isAncestor(config.clickTargetEle, event) || YUD.get(config.clickTargetEle).id === event.id) {
				YUD.setStyle(config.showContentEle, "display", "block");
			} else {
				YUD.setStyle(config.showContentEle, "display", "none");
			}
		});
	},

	highLightChoice: function() {
		var config = this.config;
		var items = YUD.get(config.showContentEle).getElementsByTagName("a");
		for (var i=0, len=items.length; i<len; i++) {
			if (items[i].innerHTML == "ALL" && config.clickTitleContent == "") {
				YUD.addClass(items[i], "current");
			} else if (items[i].innerHTML == config.clickTitleContent) {
				YUD.addClass(items[i], "current");
			}
		}
	},

	init: function(customConfig) {
		this.config = YL.merge(this.config, customConfig || {});
		this.highLightChoice();
		this.showContent();
	}
}