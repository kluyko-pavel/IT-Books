sap.ui.define([], () => {
	"use strict";

	return {
		/**
		 * Format categories list view title.
		 *
		 * @param {number} iCategoriesCount categories count.
		 * @returns {string} formatted title.
		 *
		 */
		formatCategoriesListViewTitle: function (iCategoriesCount) {
			const oBundle = this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();
			return iCategoriesCount
				? oBundle.getText(
						"CategoriesListViewTitle",
						`(${iCategoriesCount})`
				  )
				: oBundle.getText("CategoriesListViewTitle", " ");
		},

		/**
		 * Format categories sales chart title.
		 *
		 * @param {Array} aCategories categories array.
		 * @returns {string} categories sales chart title.
		 *
		 */
		formatAllCategoriesChartTitle: function (aCategories) {
			const oBundle = this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();

			if (aCategories.length) {
				const iTotalSales = aCategories
					.filter(iEl => iEl.sales.length)
					.reduce(
						(iAcc, iEl) => iAcc + iEl.sales[5].count,

						0
					);
				return oBundle.getText(
					"AllCategoriesSalesChartTitle",
					iTotalSales
				);
			} else {
				return oBundle.getText("AllCategoriesEmptySalesChartTitle");
			}
		},

		/**
		 * Format book status state.
		 *
		 * @param {string} sStatus status value.
		 * @returns {string} formatted status state.
		 *
		 */
		formatStatusState: function (sStatus) {
			switch (sStatus) {
				case "Out of stock":
					return "Error";
				case "Ok":
					return "Warning";
				case "In stock":
					return "Success";
			}
		},

		/**
		 * Format book status text.
		 *
		 * @param {string} sStatus status value.
		 * @returns {string} formatted status text.
		 *
		 */
		formatStatusText: function (sStatus) {
			const oBundle = this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();
			switch (sStatus) {
				case "Out of stock":
					return oBundle.getText("BookOutOfStockStatusText");
				case "Ok":
					return oBundle.getText("BookOkStatusText");
				case "In stock":
					return oBundle.getText("BookInStockStatusText");
			}
		},
		/**
		 * Format books table title.
		 *
		 * @param {number} iBooksCount books count.
		 * @returns {string} formatted title.
		 *
		 */
		formatBooksTableTitle: function (iBooksCount) {
			const oBundle = this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();
			return iBooksCount
				? oBundle.getText("BooksTableTitle", `(${iBooksCount})`)
				: oBundle.getText("BooksTableTitle", " ");
		},

		/**
		 * Format book orders table title.
		 *
		 * @param {number} iOrdersCount books count.
		 * @returns {string} formatted title.
		 *
		 */
		formatBookOrdersTableTitle: function (iOrdersCount) {
			const oBundle = this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();
			return iOrdersCount
				? oBundle.getText("BookOrdersTableTitle", `(${iOrdersCount})`)
				: oBundle.getText("BookOrdersTableTitle", " ");
		},
	};
});
