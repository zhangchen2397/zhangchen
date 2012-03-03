(function() {
	var clickShow = function() {
		this.config = {
			targetId: "targetId",            //Ŀ��Ԫ�ص�ID
			contentId: "contentId",       //Ҫ��ʾ���ݵ�ID
			closeId: "closeId"               //�رհ�ť
		};
	};

	clickShow.prototype = {
		show: function() {
			var config = this.config;
			var isShow = false;
			if (YUD.getStyle(config.contentId, "display") == "none") {
				YUD.setStyle(config.contentId, "display", "block");
				isShow = true;
			}
			return isShow;
		},

		hide: function() {
			var config = this.config;
			if (YUD.getStyle(config.contentId, "display") == "block") {
				YUD.setStyle(config.contentId, "display", "none");
			}
		},

		defineEvent: function() {
			var config = this.config;
			var _self = this;
			YUE.on(document, "click", function(event) {
				var event = YUE.getTarget(event);
				if (YUD.isAncestor(config.targetId, event)) {
					if (!_self.show()) {
						_self.hide();
					}
				} else if (YUD.isAncestor(config.contentId, event)) {
					return "";
				} else {
					_self.hide();
				}
			});
			YUE.on(config.closeId, "click", function() {
				_self.hide();
			});
		},

		init: function(customConfig) {
			this.config = YL.merge(this.config, customConfig || {});
			this.defineEvent();
		}
	};

	var customSourcing = new clickShow().init({
		targetId: "spanNew",
		contentId: "company-tip",
		closeId: "closeBtn"
	});
})();
