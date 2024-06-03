sap.ui.define(
	["sap/ui/core/UIComponent", "sap/f/library"],
	function (UIComponent, fioriLibrary) {
		"use strict";

		return UIComponent.extend("pavel.kliuiko.Component", {
			metadata: {
				manifest: "json",
			},

			init: function () {
				UIComponent.prototype.init.apply(this, arguments);
				const oRouter = this.getRouter();
				oRouter.attachBeforeRouteMatched(
					this._onBeforeRouteMatched,
					this
				);
				oRouter.initialize();
			},

			_onBeforeRouteMatched: function (oEvent) {
				const oStateModel = this.getModel("stateModel");
				const sLayout =
					oEvent.getParameters().arguments.layout ||
					fioriLibrary.LayoutType.OneColumn;
				oStateModel.setProperty("/layout", sLayout);
			},
		});
	}
);
