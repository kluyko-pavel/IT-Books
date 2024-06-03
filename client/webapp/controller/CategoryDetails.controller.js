sap.ui.define(
	[
		"pavel/kliuiko/controller/BaseController",
		"sap/ui/core/Messaging",
		"sap/m/MessageBox",
		"sap/f/LayoutType",
	],
	function (Controller, Messaging, MessageBox, LayoutType) {
		"use strict";

		return Controller.extend("pavel.kliuiko.controller.CategoryDetails", {
			dateFilterPrevValue: "",
			/**
			 * Controller's "init" lifecycle method.
			 */
			onInit: function () {
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter
					.getRoute("categoryDetails")
					.attachPatternMatched(this.onPatternMatched, this);
				this.oRouter
					.getRoute("bookDetails")
					.attachPatternMatched(this.onPatternMatched, this);
				this.oAppModel = this.getOwnerComponent().getModel("appModel");
				this.stateModel =
					this.getOwnerComponent().getModel("stateModel");

				Messaging.registerObject(this.getView(), true);
				this.getView().setModel(
					Messaging.getMessageModel(),
					"messages"
				);
			},

			/**
			 * "CategoryDetails" route pattern matched event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onPatternMatched: function (oEvent) {
				this.sCategoryId = oEvent.getParameter("arguments").category;
				this.sLayout = oEvent.getParameter("arguments").layout;
				if (this.sLayout === LayoutType.ThreeColumnsEndExpanded) {
					this.sBook = oEvent.getParameter("arguments").book;
				}
				this.fetchSelectedCategory(this.sCategoryId);
				this.getView().bindObject({
					path: "/selectedCategory",
					model: "appModel",
				});
				this.byId("idBooksTable").getBinding("items").filter("");

				if (this.oProductsFilterDialog) {
					this.stateModel.setProperty("/booksFiltersReset", true);
				}
				this.stateModel.setProperty("/booksFilterBar", false);
				this.stateModel.setProperty("/editMode", false);
				this.stateModel.setProperty("/createMode", false);
				this.sLayout === LayoutType.MidColumnFullScreen
					? this.stateModel.setProperty(
							"/categoryDetailsFullScreenBtn",
							false
					  )
					: this.stateModel.setProperty(
							"/categoryDetailsFullScreenBtn",
							true
					  );
			},

			/**
			 * "onFullScreen" press event handler of categoryDetails page.
			 *
			 */
			onFullScreen: function () {
				this.stateModel.setProperty(
					"/categoryDetailsFullScreenBtn",
					false
				);
				this.oRouter.navTo("categoryDetails", {
					layout: LayoutType.MidColumnFullScreen,
					category: this.sCategoryId,
				});
				this.oAppModel.setProperty("/prevLayout", this.sLayout);
			},

			/**
			 * "onExitFullScreen" press event handler of categoryDetails page.
			 *
			 */
			onExitFullScreen: function () {
				this.stateModel.setProperty(
					"/categoryDetailsFullScreenBtn",
					true
				);
				const sPrevLayout = this.oAppModel.getProperty("/prevLayout");
				if (
					sPrevLayout &&
					sPrevLayout === LayoutType.ThreeColumnsEndExpanded
				) {
					this.oRouter.navTo("bookDetails", {
						layout: LayoutType.ThreeColumnsEndExpanded,
						category: this.sCategoryId,
						book: this.sBook,
					});
				} else {
					this.oRouter.navTo("categoryDetails", {
						layout: LayoutType.TwoColumnsMidExpanded,
						category: this.sCategoryId,
					});
				}
			},

			/**
			 * "onPageClose" press event handler of categoryDetails page.
			 *
			 */
			onPageClose: function () {
				this.oRouter.navTo("categoriesList");
			},

			/**
			 * Open book details page press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onBookTableItemPress: function (oEvent) {
				const sBookPath = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getPath();
				const sBook = sBookPath.split("/").slice(-1).pop();
				this.oRouter.navTo("bookDetails", {
					layout: LayoutType.ThreeColumnsEndExpanded,
					category: this.sCategoryId,
					book: sBook,
				});
			},

			/**
			 * Open edit category wizard page press event handler.
			 *
			 */
			onOpenEditCategoryWizardPress: function () {
				this.oRouter.navTo("categoryWizard", {
					category: this.sCategoryId,
					mode: "edit",
					layout: LayoutType.TwoColumnsMidExpanded,
				});
			},

			/**
			 * "Delete" current category button press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onDeleteCurrentCategory: function (oEvent) {
				const sWarningTitle = this._getI18nText("WarningTitle");
				const sCategoryName = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getObject("title");
				const sWarningText = this._getI18nText(
					"CategoryDeletingWarningText",
					sCategoryName
				);
				MessageBox.warning(sWarningText, {
					title: sWarningTitle,
					onClose: function (sAction) {
						if (sAction === "YES") {
							this._deleteCurrentCategory();
						}
					}.bind(this),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				});
			},

			/**
			 * Delete selected category in dataBase.
			 *
			 */
			fetchDeleteCategory: async function () {
				this.stateModel.setProperty("/busyIndicator", true);
				try {
					const resp = await fetch(this.apiUrl + this.sCategoryId, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (!resp.ok) {
						console.warn();
					}
				} catch (error) {
					console.warn(error);
				} finally {
					this.stateModel.setProperty("/busyIndicator", false);
				}
			},

			/**
			 * Delete current category.
			 */
			_deleteCurrentCategory: function () {
				this.fetchDeleteCategory();
				this.getOwnerComponent().getRouter().navTo("categoriesList");
			},
		});
	}
);
