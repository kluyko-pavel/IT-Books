sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"../model/formatter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/format/DateFormat",
		"sap/ui/model/Filter",
		"sap/ui/core/Messaging",
		"sap/ui/model/Sorter",
	],
	function (
		Controller,
		formatter,
		FilterOperator,
		DateFormat,
		Filter,
		Messaging,
		Sorter
	) {
		"use strict";
		return Controller.extend("pavel.kliuiko.controller.BaseController", {
			formatter: formatter,
			apiUrl: "https://it-books.onrender.com/api/booksCategories/",
			apiOrdersUrl: "https://it-books.onrender.com/api/orders/",

			/**
			 * Get text from resource bundle.
			 *
			 * @param {string} sTextKey key to get text value.
			 * @param {any} args arguments for substitution in the text.
			 * @returns {string} text value.
			 */
			_getI18nText: function (sTextKey, vPlaceholders) {
				return this.getView()
					.getModel("i18n")
					.getResourceBundle()
					.getText(sTextKey, vPlaceholders);
			},

			/**
			 * Input "liveChange" event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onInputLiveChange: function (oEvent) {
				const oInput = oEvent.getSource();
				this._validateInput(oInput);
			},

			/**
			 * Input "Change" event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onInputChange: function (oEvent) {
				const oInput = oEvent.getSource();
				const sMessageTarget = oInput.sId + "/value";
				const aMessages = Messaging.getMessageModel().getData();
				Messaging.removeMessages(
					aMessages.filter(el => el.getTarget() === sMessageTarget)
				);
			},

			/**
			 * Fetch all categories and set it to appModel.
			 *
			 */
			fetchAllCategories: async function () {
				this.stateModel.setProperty("/busyIndicator", true);
				try {
					const resp = await fetch(this.apiUrl, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (resp.ok) {
						const data = await resp.json();
						this.oAppModel.setProperty("/", data);
					}
				} catch (error) {
					console.warn("error");
				} finally {
					this.stateModel.setProperty("/busyIndicator", false);
				}
			},

			/**
			 * Fetch selected category and set it to appModel.
			 *
			 */
			fetchSelectedCategory: async function (sCategoryId) {
				this.stateModel.setProperty("/busyIndicator", true);
				try {
					const resp = await fetch(this.apiUrl + sCategoryId, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});
					if (resp.ok) {
						const data = await resp.json();
						this.oAppModel.setProperty("/selectedCategory", data);
					}
				} catch (error) {
					console.warn("error");
				} finally {
					this.stateModel.setProperty("/busyIndicator", false);
				}
			},

			/**
			 * Validate inputs.
			 *
			 * @param {sap.m.Input} oInput input control.
			 *
			 * @returns {boolean} boolean validation error.
			 */
			_validateInput: function (oInput) {
				let sErrorMessage;
				const oModel = oInput.getBinding("value").oModel;
				const sMessageTarget =
					oInput.getBinding("value").oContext.sPath +
					"/" +
					oInput.getBindingPath("value");
				const aMessages = Messaging.getMessageModel().getData();
				Messaging.removeMessages(
					aMessages.filter(el => el.getTarget() === sMessageTarget)
				);
				let bValidationError = false;
				const oBinding = oInput.getBinding("value");
				try {
					oBinding.getType().validateValue(oInput.getValue());
					if (!oInput.getValue().trim()) {
						throw new Error();
					}
				} catch (oException) {
					sErrorMessage = oException.message;
					bValidationError = true;
				}
				if (bValidationError) {
					const oMessage = new sap.ui.core.message.Message({
						message: sErrorMessage,
						type: sap.ui.core.MessageType.Error,
						target: sMessageTarget,
						processor: oModel,
					});
					Messaging.addMessages(oMessage);
				}
				return bValidationError;
			},

			/**
			 * "UpdateFinished" event handler of books table.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onBooksTableUpdateFinished: function (oEvent) {
				const iTotalItems = oEvent.getParameter("total");
				this.oAppModel.setProperty("/booksCount", iTotalItems);
			},

			/**
			 * Add filters to datePicker.
			 *
			 * @param {sap.m.DatePicker} oControl datePicker control.
			 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem  filterGroupItem  control.
			 * @param {Array} aResult array of filters.
			 *
			 */
			_addDatePickerFilter: function (oControl, sPath, aResult) {
				const oDateValue = oControl.getDateValue();
				if (oDateValue) {
					const oDateFormatter = DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd",
					});
					const oDateFilter = new Filter({
						path: sPath,
						operator: FilterOperator.EQ,
						value1: oDateFormatter.format(oDateValue),
					});
					aResult.push(oDateFilter);
				}
			},

			/**
			 * "Press" event handler of open sorting books dialog button.
			 */
			onSortBooksBtnPress: function () {
				if (!this.oBooksSortDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.BooksSortDialog",
						controller: this,
					}).then(
						function (oDialog) {
							this.oBooksSortDialog = oDialog;
							this.oBooksSortDialog.open();
						}.bind(this)
					);
				} else {
					this.oBooksSortDialog.open();
				}
			},

			/**
			 * "Press" event handler of confirm sorting books button.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onBooksSortDialogConfirm: function (oEvent) {
				const oBooksBinding =
					this.byId("idBooksTable").getBinding("items");
				const mParams = oEvent.getParameters();
				const sPath = mParams.sortItem.getKey();
				const bDescending = mParams.sortDescending;
				oBooksBinding.sort(new Sorter(sPath, bDescending));
			},

			/**
			 * "Press" event handler of open filtering books dialog button.
			 */
			onFilterBooksBtnPress: function () {
				if (!this.oBooksFilterDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.BooksFilterDialog",
						controller: this,
					}).then(
						function (oDialog) {
							this.oBooksFilterDialog = oDialog;
							this.oBooksFilterDialog.open();
						}.bind(this)
					);
				} else {
					this.oBooksFilterDialog.open();
					if (this.stateModel.getProperty("/booksFiltersReset")) {
						this.byId("settingsDialog")
							.getSelectedFilterItems()
							.forEach(oItem => oItem.setSelected(false));
					}
				}
			},

			/**
			 * "Press" event handler of confirm filtering books button.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onBooksFilterDialogConfirm: function (oEvent) {
				const mParams = oEvent.getParameters();
				const oTableBinding =
					this.byId("idBooksTable").getBinding("items");
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
						const aSplit = oItem.getKey().split("_");
						const oFilter = new Filter({
							path: aSplit[0],
							operator: aSplit[1],
							value1: aSplit[2],
							value2: aSplit[3],
						});
						aFilters.push(oFilter);
					}
				});
				this.stateModel.setProperty("/booksFiltersReset", false);
				oTableBinding.filter(aFilters);
				this.stateModel.setProperty(
					"/booksFilterBar",
					aFilters.length > 0
				);
				this.byId("booksFilterLabel").setText(mParams.filterString);
			},

			/**
			 * "Change" event handler of books datePicker input.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onBooksDatePickerChange: function (oEvent) {
				const oDateFilter = this.byId("bookDateFilter");
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
			 * "Cancel" event handler of filter dialog.
			 */
			onFilterCancel: function (sDateFilterId) {
				const oDateFilter = this.byId(sDateFilterId);
				const oDatePicker = oDateFilter.getCustomControl();

				oDatePicker.setValue(this.dateFilterPrevValue);

				if (this.dateFilterPrevValue) {
					oDateFilter.setFilterCount(1);
					oDateFilter.setSelected(true);
				} else {
					oDateFilter.setFilterCount(0);
					oDateFilter.setSelected(false);
				}
			},

			/**
			 * "ResetFilters" event handler of filter dialog.
			 */
			onFiltersReset: function (sDateFilterId) {
				const oDateFilter = this.byId(sDateFilterId);
				const oDatePicker = oDateFilter.getCustomControl();
				oDatePicker.setValue("");
				oDateFilter.setFilterCount(0);
				oDateFilter.setSelected(false);
			},

			/**
			 * Error validation messages button "press" event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onValidationMessagePopoverOpen: function (oEvent) {
				const oSourceControl = oEvent.getSource();
				this._getValidationMessagePopover().then(function (
					oValidationMessagePopover
				) {
					oValidationMessagePopover.openBy(oSourceControl);
				});
			},

			/**
			 * Get validation message popover.
			 *
			 * @returns {Promise | Object} validation message popover.
			 */
			_getValidationMessagePopover: function () {
				const oView = this.getView();
				if (!this.pValidationMessagePopover) {
					this.pValidationMessagePopover = this.loadFragment({
						name: "pavel.kliuiko.view.fragments.ValidationMessagePopover",
					}).then(function (oValidationMessagePopover) {
						oView.addDependent(oValidationMessagePopover);
						return oValidationMessagePopover;
					});
				}
				return this.pValidationMessagePopover;
			},
		});
	}
);
