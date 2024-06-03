sap.ui.define(
	["pavel/kliuiko/controller/BaseController", "sap/f/LayoutType"],
	function (Controller, LayoutType) {
		"use strict";

		return Controller.extend("pavel.kliuiko.controller.BookDetails", {
			/**
			 * Controller's "init" lifecycle method.
			 */
			onInit: function () {
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter
					.getRoute("bookDetails")
					.attachPatternMatched(this.onPatternMatched, this);
				this.oAppModel = this.getOwnerComponent().getModel("appModel");
				this.stateModel =
					this.getOwnerComponent().getModel("stateModel");
			},

			/**
			 * "BookDetails" route pattern matched event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onPatternMatched: function (oEvent) {
				this.sCategoryId = oEvent.getParameter("arguments").category;
				this.sBookIndex = oEvent.getParameter("arguments").book;
				this.sLayout = oEvent.getParameter("arguments").layout;
				this.sCategoryId = oEvent.getParameter("arguments").category;
				this.getView().bindObject({
					path: `/selectedCategory/books/${this.sBookIndex}`,
					model: "appModel",
				});
				this.sLayout === LayoutType.EndColumnFullScreen
					? this.stateModel.setProperty(
							"/bookDetailsFullScreenBtn",
							false
					  )
					: this.stateModel.setProperty(
							"/bookDetailsFullScreenBtn",
							true
					  );
			},

			/**
			 * "onFullScreen" press event handler of bookDetails page.
			 *
			 */
			onFullScreen: function () {
				this.stateModel.setProperty("/bookDetailsFullScreenBtn", false);
				this.oRouter.navTo("bookDetails", {
					layout: LayoutType.EndColumnFullScreen,
					category: this.sCategoryId,
					book: this.sBookIndex,
				});
			},

			/**
			 * "onExitFullScreen" press event handler of bookDetails page.
			 *
			 */
			onExitFullScreen: function () {
				this.stateModel.setProperty("/bookDetailsFullScreenBtn", true);
				this.oRouter.navTo("bookDetails", {
					layout: LayoutType.ThreeColumnsEndExpanded,
					category: this.sCategoryId,
					book: this.sBookIndex,
				});
			},

			/**
			 * "onPageClose" press event handler of bookDetails page.
			 *
			 */
			onPageClose: function () {
				this.oRouter.navTo("categoryDetails", {
					layout: LayoutType.TwoColumnsMidExpanded,
					category: this.sCategoryId,
					book: this.sBookIndex,
				});
			},
		});
	}
);
