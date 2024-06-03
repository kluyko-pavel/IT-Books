sap.ui.define(
	[
		"pavel/kliuiko/controller/BaseController",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Messaging",
		"sap/f/LayoutType",
	],
	function (
		Controller,
		Filter,
		Sorter,
		FilterOperator,
		Messaging,
		LayoutType
	) {
		"use strict";

		return Controller.extend("pavel.kliuiko.controller.CategoriesList", {
			/**
			 * Controller's "init" lifecycle method.
			 */
			onInit: function () {
				this.oAppModel = this.getOwnerComponent().getModel("appModel");
				this.stateModel =
					this.getOwnerComponent().getModel("stateModel");
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter
					.getRoute("categoriesList")
					.attachPatternMatched(this.onPatternMatched, this);

				Messaging.registerObject(this.getView(), true);
				this.getView().setModel(
					Messaging.getMessageModel(),
					"messages"
				);
			},

			/**
			 * "CategoriesList" route pattern matched event handler.
			 */
			onPatternMatched: function () {
				this.fetchAllCategories();
			},

			/**
			 * Open category details page press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onListItemPress: function (oEvent) {
				const sCategoryId = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getObject("_id");
				this.oRouter.navTo("categoryDetails", {
					layout: LayoutType.TwoColumnsMidExpanded,
					category: sCategoryId,
				});
			},

			/**
			 * Open book orders page press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onBookOrdersBtnPress: function () {
				this.oRouter.navTo("bookOrders", {
					layout: LayoutType.TwoColumnsMidExpanded,
				});
			},

			/**
			 * Open create category wizard page press event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onOpenCreateCategoryWizardPress: function () {
				this.oRouter.navTo("categoryWizard", {
					category: "newCategory",
					mode: "create",
					layout: LayoutType.TwoColumnsMidExpanded,
				});
			},

			/**
			 * "Search" event handler of the categories.
			 */
			onCategoriesSearch: function () {
				const oCategoriesList = this.getView().byId("idCategoriesList");
				const aListFilters = this.getView()
					.byId("filterBar")
					.getFilterGroupItems()
					.reduce(
						function (aResult, oFilterGroupItem) {
							const oControl = oFilterGroupItem.getControl();
							if (oControl.isA("sap.m.DatePicker")) {
								this._addDatePickerFilter(
									oControl,
									oFilterGroupItem.getName(),
									aResult
								);
							} else {
								this._addSearchFieldFilter(
									oControl,
									oFilterGroupItem,
									aResult
								);
							}
							return aResult;
						}.bind(this),
						[]
					);
				oCategoriesList.getBinding("items").filter(aListFilters);
			},

			/**
			 * Add filters to searchField.
			 *
			 * @param {sap.m.SearchField} oControl searchField control.
			 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem  filterGroupItem  control.
			 * @param {Array} aResult array of filters.
			 *
			 */
			_addSearchFieldFilter: function (
				oControl,
				oFilterGroupItem,
				aResult
			) {
				const sSearchValue = oControl.getValue();
				if (sSearchValue) {
					const oTitleFilter = new Filter({
						path: oFilterGroupItem.getName(),
						operator: FilterOperator.Contains,
						value1: sSearchValue,
					});

					const oSubtitleFilter = new Filter({
						path: "books",
						operator: FilterOperator.Contains,
						value1: sSearchValue,
						test: aBooks => {
							const aBook = aBooks.find(
								oBook =>
									oBook.isbn13 === sSearchValue ||
									oBook.title === sSearchValue
							);
							return !!aBook;
						},
					});

					aResult.push(
						new Filter({
							filters: [oTitleFilter, oSubtitleFilter],
							and: false,
						})
					);
				}
			},

			/**
			 * "Press" event handler of open sorting categories dialog button.
			 */
			onSortCategoriesBtnPress: function () {
				if (!this.oCategoriesSortDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.CategoriesSortDialog",
						controller: this,
					}).then(
						function (oDialog) {
							this.oCategoriesSortDialog = oDialog;
							this.oCategoriesSortDialog.open();
						}.bind(this)
					);
				} else {
					this.oCategoriesSortDialog.open();
				}
			},

			/**
			 * "Press" event handler of confirm sorting categories button.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 *
			 */
			onCategoriesSortDialogConfirm: function (oEvent) {
				const oCategoriesBinding =
					this.byId("idCategoriesList").getBinding("items");
				const mParams = oEvent.getParameters();
				const sPath = mParams.sortItem.getKey();
				const bDescending = mParams.sortDescending;
				oCategoriesBinding.sort(new Sorter(sPath, bDescending));
			},

			/**
			 * "UpdateFinished" event handler of categories list.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onCategoriesListUpdateFinished: function (oEvent) {
				const iTotalItems = oEvent.getParameter("total");
				this.oAppModel.setProperty("/categoriesCount", iTotalItems);
			},

			/**
			 * "Clear" event handler of the categories filters.
			 */
			onFiltersClear: function () {
				const oFilterBar = this.getView().byId("filterBar");
				const aFilterGroupItems = oFilterBar.getFilterGroupItems();
				aFilterGroupItems.forEach(oFilterGroupItem => {
					const oControl = oFilterGroupItem.getControl();
					oControl.setValue("");
				});
				this.onCategoriesSearch();
			},
		});
	}
);
