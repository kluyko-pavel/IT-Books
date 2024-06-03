sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("pavel.kliuiko.controller.App", {
		/**
		 * Controller's "init" lifecycle method.
		 */
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.getOwnerComponent()
				.getModel("stateModel")
				.setProperty("/busyIndicator", false);
		},

		/**
		 * Route pattern matched event handler.
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onRouteMatched: function (oEvent) {
			this.currentRouteName = oEvent.getParameter("name");
			this.currentCategory = oEvent.getParameter("arguments").category;
		},

		/**
		 * "State change" event handler of flexible column layout.
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onStateChanged: function (oEvent) {
			const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
			const sLayout = oEvent.getParameter("layout");
			if (bIsNavigationArrow) {
				this.oRouter.navTo(
					this.currentRouteName,
					{ layout: sLayout, category: this.currentCategory },
					true
				);
			}
		},

		/**
		 * Controller's "exit" lifecycle method.
		 */
		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		},
	});
});
