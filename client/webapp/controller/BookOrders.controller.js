sap.ui.define(
	[
		"pavel/kliuiko/controller/BaseController",
		"sap/ui/core/Messaging",
		"sap/m/MessageBox",
		"sap/f/LayoutType",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/core/format/DateFormat",
		"sap/base/util/deepClone",
	],
	function (
		Controller,
		Messaging,
		MessageBox,
		LayoutType,
		Sorter,
		Filter,
		DateFormat,
		deepClone
	) {
		"use strict";

		return Controller.extend("pavel.kliuiko.controller.BookOrders", {
			dateFilterPrevValue: "",

			/**
			 * Controller's "init" lifecycle method.
			 */
			onInit: function () {
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter
					.getRoute("bookOrders")
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
			 * "BookOrders" route pattern matched event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onPatternMatched: function (oEvent) {
				this.fetchOrders();
				this.sLayout = oEvent.getParameter("arguments").layout;
				this.byId("idBookOrdersTable").getBinding("items").filter("");

				if (this.oOrdersFilterDialog) {
					this.stateModel.setProperty("/ordersFiltersReset", true);
				}
				this.stateModel.setProperty("/ordersFilterBar", false);
				this.sLayout === LayoutType.MidColumnFullScreen
					? this.stateModel.setProperty(
							"/bookOrdersFullScreenBtn",
							false
					  )
					: this.stateModel.setProperty(
							"/bookOrdersFullScreenBtn",
							true
					  );
				this._addOrderStatusesToAppModel();
			},

			/**
			 * Create and add order statuses to appModel.
			 *
			 */
			_addOrderStatusesToAppModel: function () {
				const sOrderInProgressStatusText = this._getI18nText(
					"OrderInProgressStatusText"
				);
				const sOrderReadyStatusText = this._getI18nText(
					"OrderReadyStatusText"
				);
				const sOrderCancelledStatusText = this._getI18nText(
					"OrderCancelledStatusText"
				);
				const sOrderIssuedStatusText = this._getI18nText(
					"OrderIssuedStatusText"
				);
				const aOrderStatuses = [
					{
						statusKey: "in progress",
						statusText: sOrderInProgressStatusText,
					},
					{
						statusKey: "ready",
						statusText: sOrderReadyStatusText,
					},
					{
						statusKey: "cancelled",
						statusText: sOrderCancelledStatusText,
					},
					{
						statusKey: "issued",
						statusText: sOrderIssuedStatusText,
					},
				];
				this.oAppModel.setProperty("/orderStatuses", aOrderStatuses);
			},

			/**
			 * Fetch all orders and set it to appModel.
			 *
			 */
			fetchOrders: async function () {
				this.stateModel.setProperty("/ordersBusyIndicator", true);
				try {
					const resp = await fetch(this.apiOrdersUrl, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (resp.ok) {
						const data = await resp.json();
						this.oAppModel.setProperty("/orders", data);
					}
				} catch (error) {
					console.warn("error");
				} finally {
					this.stateModel.setProperty("/ordersBusyIndicator", false);
				}
			},

			/**
			 * "onFullScreen" press event handler of bookOrders page.
			 *
			 */
			onFullScreen: function () {
				this.stateModel.setProperty("/bookOrdersFullScreenBtn", false);
				this.oRouter.navTo("bookOrders", {
					layout: LayoutType.MidColumnFullScreen,
				});
				this.oAppModel.setProperty("/prevLayout", this.sLayout);
			},

			/**
			 * "onExitFullScreen" press event handler of bookOrders page.
			 *
			 */
			onExitFullScreen: function () {
				this.stateModel.setProperty("/bookOrdersFullScreenBtn", true);
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
					this.oRouter.navTo("bookOrders", {
						layout: LayoutType.TwoColumnsMidExpanded,
					});
				}
			},

			/**
			 * "onPageClose" press event handler of bookOrders page.
			 *
			 */
			onPageClose: function () {
				this.oRouter.navTo("categoriesList");
			},

			/**
			 * "UpdateFinished" event handler of orders table.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onBookOrdersTableUpdateFinished: function (oEvent) {
				const iTotalItems = oEvent.getParameter("total");
				this.oAppModel.setProperty("/ordersCount", iTotalItems);
			},

			/**
			 * "Change" event handler of order status input.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onOrderStatusChange: function (oEvent) {
				const oUpdatedOrder = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getObject();
				this.fetchUpdateOrder(oUpdatedOrder);
			},

			/**
			 * Update order in dataBase.
			 *
			 */
			fetchUpdateOrder: async function (oUpdatedOrder) {
				this.stateModel.setProperty("/ordersBusyIndicator", true);
				try {
					const resp = await fetch(this.apiOrdersUrl, {
						method: "PUT",
						body: JSON.stringify(oUpdatedOrder),
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (!resp.ok) {
						console.warn("error");
					}
				} catch (error) {
					console.warn("error");
				} finally {
					this.stateModel.setProperty("/ordersBusyIndicator", false);
				}
			},

			/**
			 * "Press" event handler of open sorting orders dialog button.
			 */
			onSortOrdersBtnPress: function () {
				if (!this.oOrdersSortDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.OrdersSortDialog",
						controller: this,
					}).then(
						function (oDialog) {
							this.oOrdersSortDialog = oDialog;
							this.oOrdersSortDialog.open();
						}.bind(this)
					);
				} else {
					this.oOrdersSortDialog.open();
				}
			},

			/**
			 * "Press" event handler of confirm sorting orders button.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onOrdersSortDialogConfirm: function (oEvent) {
				const oOrdersBinding =
					this.byId("idBookOrdersTable").getBinding("items");
				const mParams = oEvent.getParameters();
				const sPath = mParams.sortItem.getKey();
				const bDescending = mParams.sortDescending;
				oOrdersBinding.sort(new Sorter(sPath, bDescending));
			},

			/**
			 * "Press" event handler of open filtering orders dialog button.
			 */
			onFilterOrdersBtnPress: function () {
				if (!this.oOrdersFilterDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.OrdersFilterDialog",
						controller: this,
					}).then(
						function (oDialog) {
							this.oOrdersFilterDialog = oDialog;
							this.oOrdersFilterDialog.open();
						}.bind(this)
					);
				} else {
					this.oOrdersFilterDialog.open();
					if (this.stateModel.getProperty("/ordersFiltersReset")) {
						this.byId("settingsDialog")
							.getSelectedFilterItems()
							.forEach(oItem => oItem.setSelected(false));
					}
				}
			},

			/**
			 * "Press" event handler of confirm filtering orders button.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onOrdersFilterDialogConfirm: function (oEvent) {
				const mParams = oEvent.getParameters();
				const oTableBinding =
					this.byId("idBookOrdersTable").getBinding("items");
				const aFilters = [];
				mParams.filterItems.forEach(oItem => {
					if (oItem.isA("ViewSettingsCustomItem")) {
						const oDatePicker = oItem.getCustomControl();
						this._addDatePickerFilter(
							oDatePicker,
							"date",
							aFilters
						);
						this.dateFilterPrevValue = oDatePicker.getValue();
					} else {
						const aSplit = oItem.getKey().split("-");
						const oFilter = new Filter({
							path: aSplit[0],
							operator: aSplit[1],
							value1: aSplit[2],
							value2: aSplit[3],
						});
						aFilters.push(oFilter);
					}
				});
				this.stateModel.setProperty("/ordersFiltersReset", false);
				oTableBinding.filter(aFilters);
				this.stateModel.setProperty(
					"/ordersFilterBar",
					aFilters.length > 0
				);
				this.byId("ordersFilterLabel").setText(mParams.filterString);
			},

			/**
			 * "Change" event handler of orders datePicker input.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onOrdersDatePickerChange: function (oEvent) {
				const oDateFilter = this.byId("orderDateFilter");
				const oDateValue = oEvent.getSource().getDateValue();
				if (oDateValue) {
					oDateFilter.setFilterCount(1);
					oDateFilter.setSelected(true);
				} else {
					oDateFilter.setFilterCount(0);
					oDateFilter.setSelected(false);
				}
			},

			/**
			 * "Create" order button press event handler.
			 */
			onOpenNewOrderDialogPress: function () {
				const oDateFormatter = DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd",
				});
				const oNewOrder = {
					isbn13: "",
					client: "",
					price: 0,
					date: oDateFormatter.format(new Date()),
					status: "in progress",
				};
				this.oAppModel.setProperty("/newOrder", deepClone(oNewOrder));
				this._openNewOrderDialog();
			},
			/**
			 * Open new order create dialog.
			 */
			_openNewOrderDialog: function () {
				if (!this.oNewOrderDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.NewOrderDialog",
					}).then(
						function (oDialog) {
							this.oNewOrderDialog = oDialog;
							this.oNewOrderDialog.bindObject({
								path: "/newOrder",
								model: "appModel",
							});
							this.oNewOrderDialog.open();
						}.bind(this)
					);
				} else {
					this.oAppModel.updateBindings(true);
					this.oNewOrderDialog.open();
				}
			},

			/**
			 * Open book details page press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onBookIsbnPress: function (oEvent) {
				const oCtx = oEvent.getSource().getBindingContext("appModel");
				const sBookPath = oCtx.getPath();
				const sBookIsbn = oCtx.getObject("isbn13");
				const aCategories = this.oAppModel.getProperty("/");
				const sBook = sBookPath.split("/").slice(-1).pop();
				const oFoundCategory = aCategories.find(
					oCategory => oCategory.books[sBook].isbn13 === sBookIsbn
				);
				this.oRouter.navTo("bookDetails", {
					layout: LayoutType.ThreeColumnsEndExpanded,
					category: oFoundCategory._id,
					book: sBook,
				});
			},

			/**
			 * "Create" order button press event handler.
			 *
			 */
			onCreateOrderPress: async function () {
				const sInputValidationErrorText = this._getI18nText(
					"InputValidationErrorText"
				);
				const sIsbnExistErrorText =
					this._getI18nText("IsbnExistErrorText");
				const oNewOrder = this.oAppModel.getProperty("/newOrder");
				const iOrderPrice = this._getOrderPrice(oNewOrder.isbn13);
				oNewOrder.price = iOrderPrice;
				let bValidationError = false;
				const aOrderInputs = this.getView()
					.getControlsByFieldGroupId("newOrderInputs")
					.filter(el => el.isA("sap.m.Input"))
					.filter(el => !el.getId().endsWith("-popup-input"));

				aOrderInputs.forEach(oInput => {
					bValidationError =
						this._validateInput(oInput) || bValidationError;
				});
				if (!bValidationError) {
					if (iOrderPrice) {
						await this.fetchCreateOrder(oNewOrder);
						this.fetchOrders();
						this.onNewOrderDialogCancelPress();
					} else {
						MessageBox.alert(sIsbnExistErrorText);
					}
				} else {
					MessageBox.alert(sInputValidationErrorText);
				}
			},

			/**
			 * Get and return book price.
			 *
			 * @param {string} sBookIsbn isbn of the book.
			 *
			 * @return {number} book price.
			 */
			_getOrderPrice: function (sBookIsbn) {
				const aCategories = this.oAppModel.getProperty("/");
				const oFoundBook = aCategories
					.flatMap(oCategory => oCategory.books)
					.find(oBook => oBook.isbn13 === sBookIsbn);
				if (oFoundBook) {
					return oFoundBook.price;
				}
			},

			/**
			 * Create new order in dataBase.
			 *
			 */
			fetchCreateOrder: async function (oNewOrder) {
				this.stateModel.setProperty("/ordersBusyIndicator", true);
				try {
					const resp = await fetch(this.apiOrdersUrl, {
						method: "POST",
						body: JSON.stringify(oNewOrder),
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (!resp.ok) {
						console.warn("error");
					}
				} catch (error) {
					console.warn(error);
				} finally {
					this.stateModel.setProperty("/ordersBusyIndicator", false);
				}
			},
			/**
			 * "Cancel" event handler of create new order dialog .
			 */
			onNewOrderDialogCancelPress: function () {
				this.oNewOrderDialog.close();
			},

			/**
			 * After new order dialog close event handler.
			 */
			onAfterOrderDialogClose: function () {
				Messaging.removeAllMessages();
			},
		});
	}
);
