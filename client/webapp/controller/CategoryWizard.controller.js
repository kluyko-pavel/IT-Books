sap.ui.define(
	[
		"pavel/kliuiko/controller/BaseController",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/core/Messaging",
		"sap/ui/core/format/DateFormat",
		"sap/base/util/deepClone",
		"sap/base/util/deepEqual",
		"sap/ui/core/ValueState",
		"sap/f/LayoutType",
	],
	function (
		Controller,
		MessageToast,
		MessageBox,
		Messaging,
		DateFormat,
		deepClone,
		deepEqual,
		ValueState,
		LayoutType
	) {
		"use strict";

		return Controller.extend("pavel.kliuiko.controller.CategoryWizard", {
			dateFilterPrevValue: "",

			/**
			 * Controller's "init" lifecycle method.
			 */
			onInit: function () {
				this.oRouter = this.getOwnerComponent().getRouter();

				this._wizard = this.byId("CreateCategoryWizard");
				this._oNavContainer = this.byId("wizardNavContainer");
				this._oWizardContentPage = this.byId("wizardContentPage");

				const oRouter = this.getOwnerComponent().getRouter();
				oRouter
					.getRoute("categoryWizard")
					.attachPatternMatched(this.onPatternMatched, this);
				this.oAppModel = this.getOwnerComponent().getModel("appModel");
				this.stateModel =
					this.getOwnerComponent().getModel("stateModel");
				this.stateModel.setProperty("/booksDeleteBtn", false);
				Messaging.registerObject(this.getView(), true);
				this.getView().setModel(
					Messaging.getMessageModel(),
					"messages"
				);
			},

			/**
			 * "CategoryWizard" route pattern matched event handler.
			 *
			 * @param {sap.ui.base.Event} oEvent event object.
			 */
			onPatternMatched: async function (oEvent) {
				this._wizard.discardProgress(this.byId("GeneralInfoStep"));
				this._handleNavigationToStep(0);
				this.byId("GeneralInfoStep").setValidated(false);
				this.stateModel.setProperty("/booksFilterBar", false);
				this.byId("idBooksTable").getBinding("items").filter("");
				if (this.oProductsFilterDialog) {
					this.stateModel.setProperty("/booksFiltersReset", true);
				}
				const sMode = oEvent.getParameter("arguments").mode;
				Messaging.removeAllMessages();
				this.sCategoryId = oEvent.getParameter("arguments").category;
				let sCategoryPath;
				if (sMode === "create") {
					sCategoryPath = this._activateCreateMode();
				} else {
					sCategoryPath = await this._activateEditMode();
				}
				this.getView().bindObject({
					path: sCategoryPath,
					model: "appModel",
				});
				this._addBookStatusesToAppModel();
			},

			/**
			 * Create and add book statuses to appModel.
			 *
			 */
			_addBookStatusesToAppModel: function () {
				const sBookOutOfStockStatusText = this._getI18nText(
					"BookOutOfStockStatusText"
				);
				const sBookInStockStatusText = this._getI18nText(
					"BookInStockStatusText"
				);
				const sBookOkStatusText = this._getI18nText("BookOkStatusText");
				const aBookStatuses = [
					{ statusKey: "Ok", statusText: sBookOkStatusText },
					{
						statusKey: "In stock",
						statusText: sBookInStockStatusText,
					},
					{
						statusKey: "Out of stock",
						statusText: sBookOutOfStockStatusText,
					},
				];
				this.oAppModel.setProperty("/bookStatuses", aBookStatuses);
			},

			/**
			 * Activate create mode for creating category.
			 *
			 * @returns {string} path for category wizard page binding.
			 */
			_activateCreateMode: function () {
				this.stateModel.setProperty("/editMode", false);
				this.stateModel.setProperty("/createMode", true);
				const oDateFormatter = DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd",
				});
				const newCategory = {
					title: "",
					subtitle: "",
					description: "",
					image: "",
					country: "",
					createdDate: oDateFormatter.format(new Date()),
					books: [],
					sales: [],
				};
				this.oAppModel.setProperty(
					"/emptyCategory",
					deepClone(newCategory)
				);
				this.oAppModel.setProperty("/newCategory", newCategory);
				return "/newCategory";
			},

			/**
			 * Activate edit mode for editing category.
			 *
			 * @returns {string} path for category wizard page binding.
			 */
			_activateEditMode: async function () {
				this.stateModel.setProperty("/editMode", true);
				this.stateModel.setProperty("/createMode", false);
				await this.fetchSelectedCategory(this.sCategoryId);
				const editCategory = deepClone(
					this.oAppModel.getProperty("/selectedCategory")
				);
				this.oAppModel.setProperty("/editCategory", editCategory);
				return "/editCategory";
			},

			/**
			 * Check selected books & set enabled property to books delete button.
			 */
			onCheckSelectedBooks: function () {
				const oBooksTable = this.getView().byId("idBooksTable");
				const aSelectedItems = oBooksTable.getSelectedItems();
				this.stateModel.setProperty(
					"/booksDeleteBtn",
					!!aSelectedItems.length
				);
			},

			/**
			 * "Create" book button press event handler.
			 */
			onOpenNewBookDialogPress: function () {
				this._saveWizardErrMsgs();
				const oDateFormatter = DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd",
				});
				const oNewBook = {
					title: "",
					subtitle: "",
					authors: "",
					publisher: "",
					isbn13: "",
					pages: "",
					year: oDateFormatter.format(new Date()),
					rating: 0,
					description: "",
					price: 0,
					image: "",
					status: "Ok",
				};
				this.oAppModel.setProperty("/newBook", deepClone(oNewBook));
				this._openNewBookDialog();
			},

			/**
			 * "Edit" book button press event handler.
			 */
			onOpenEditBookDialogPress: function (oEvent) {
				this._saveWizardErrMsgs();
				const oBook = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getObject();
				const sInitialBookPath = oEvent
					.getSource()
					.getBindingContext("appModel")
					.getPath();
				this.oAppModel.setProperty(
					"/initialBookPath",
					sInitialBookPath
				);
				this.oAppModel.setProperty("/editedBook", deepClone(oBook));
				this._openEditBookDialog();
			},

			/**
			 * Open new book create dialog.
			 */
			_openNewBookDialog: function () {
				if (!this.oNewBookDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.NewBookDialog",
					}).then(
						function (oDialog) {
							this.oNewBookDialog = oDialog;
							this.oNewBookDialog.bindObject({
								path: "/newBook",
								model: "appModel",
							});
							this.oNewBookDialog.open();
						}.bind(this)
					);
				} else {
					this.oAppModel.updateBindings(true);
					this.oNewBookDialog.open();
				}
			},

			/**
			 * Open book edit dialog.
			 */
			_openEditBookDialog: function () {
				if (!this.oEditBookDialog) {
					this.loadFragment({
						name: "pavel.kliuiko.view.fragments.EditBookDialog",
					}).then(
						function (oDialog) {
							this.oEditBookDialog = oDialog;
							this.oEditBookDialog.bindObject({
								path: "/editedBook",
								model: "appModel",
							});
							this.oEditBookDialog.open();
						}.bind(this)
					);
				} else {
					this.oAppModel.updateBindings(true);
					this.oEditBookDialog.open();
				}
			},

			/**
			 * "change" and "liveChange" event handler of date input for checking validation.
			 *
			 * @param {sap.ui.base.Event} oEvent event object
			 */
			onDateInputValidate: function (oEvent) {
				this.onInputChange(oEvent);
				const sErrorMessage = this._getI18nText(
					"DateInputErrorMessage"
				);
				const sDateValue = oEvent.getParameter("value");
				const oDateInput = oEvent.getSource();
				const sMessageTarget =
					oDateInput.getBinding("value").oContext.sPath +
					"/" +
					oDateInput.getBindingPath("value");
				const oMessage = new sap.ui.core.message.Message({
					message: sErrorMessage,
					type: sap.ui.core.MessageType.Error,
					target: sMessageTarget,
					processor: this.oAppModel,
				});
				const aMessages = Messaging.getMessageModel().getData();
				Messaging.removeMessages(
					aMessages.filter(
						el => el.getTarget() === oMessage.getTargets()[0]
					)
				);
				let bInputValid = true;
				const datePattern = /^\d{4}-\d{2}-\d{2}$/;
				if (sDateValue) {
					bInputValid = datePattern.test(sDateValue);
				}
				if (!bInputValid) {
					Messaging.addMessages(oMessage);
				}
			},

			/**
			 * "Create" book button press event handler.
			 *
			 * @param {string} sInputsFieldGroupId id of inputs field group
			 *
			 */
			onCreateBookPress: function () {
				const sInputValidationErrorText = this._getI18nText(
					"InputValidationErrorText"
				);
				const bCreateMode = this.stateModel.getProperty("/createMode");
				const sBookPath = bCreateMode
					? "/newCategory/books"
					: "/editCategory/books";
				const aBooks = this.oAppModel.getProperty(sBookPath);
				const oNewBook = this.oAppModel.getProperty("/newBook");
				let bValidationError = false;
				const aBookInputs = this.getView()
					.getControlsByFieldGroupId("newBookInputs")
					.filter(
						el => el.isA("sap.m.Input") || el.isA("sap.m.TextArea")
					)
					.filter(el => !el.getId().endsWith("-popup-input"));

				aBookInputs.forEach(oInput => {
					bValidationError =
						this._validateInput(oInput) || bValidationError;
				});
				bValidationError =
					this.byId("newBookDateInput").getValueState() ===
						ValueState.Error || bValidationError;
				if (!bValidationError) {
					aBooks.push(oNewBook);
					this.oAppModel.setProperty(sBookPath, aBooks);
					this.onNewBookDialogCancelPress();
				} else {
					MessageBox.alert(sInputValidationErrorText);
				}
			},

			/**
			 * "Save" edited book button press event handler.
			 *
			 */
			onSaveBookPress: function () {
				const sInputValidationErrorText = this._getI18nText(
					"InputValidationErrorText"
				);
				const oEditedBook = this.oAppModel.getProperty("/editedBook");
				const sInitialBookPath =
					this.oAppModel.getProperty("/initialBookPath");
				let bValidationError = false;
				const aBookInputs = this.getView()
					.getControlsByFieldGroupId("editBookInputs")
					.filter(
						el => el.isA("sap.m.Input") || el.isA("sap.m.TextArea")
					)
					.filter(el => !el.getId().endsWith("-popup-input"));

				aBookInputs.forEach(oInput => {
					bValidationError =
						this._validateInput(oInput) || bValidationError;
				});
				bValidationError =
					this.byId("editBookDateInput").getValueState() ===
						ValueState.Error || bValidationError;
				if (!bValidationError) {
					this.oAppModel.setProperty(sInitialBookPath, oEditedBook);
					this.onEditBookDialogCancelPress();
				} else {
					MessageBox.alert(sInputValidationErrorText);
				}
			},

			/**
			 * "Cancel" event handler of create new book dialog .
			 */
			onNewBookDialogCancelPress: function () {
				this.oNewBookDialog.close();
			},

			/**
			 * "Cancel" event handler of edit book dialog .
			 */
			onEditBookDialogCancelPress: function () {
				this.oEditBookDialog.close();
			},

			/**
			 * After edit/new book dialog close event handler.
			 */
			onAfterBookDialogClose: function () {
				this._removeBookErrMsgs();
			},

			/**
			 * Save wizard error messages before book dialog open.
			 */
			_saveWizardErrMsgs: function () {
				this.stateModel.setProperty("/wizardErrValidateBtn", false);
				const aMessages = Messaging.getMessageModel().getData();
				this.oAppModel.setProperty("/wizardErrMsgs", aMessages);
				Messaging.removeAllMessages();
			},

			/**
			 * Remove book error messages.
			 */
			_removeBookErrMsgs: function () {
				this.stateModel.setProperty("/wizardErrValidateBtn", true);
				const aMessages = this.oAppModel.getProperty("/wizardErrMsgs");
				Messaging.removeAllMessages();
				Messaging.addMessages(aMessages);
			},

			/**
			 * "Delete" books button press event handler.
			 */
			onDeleteSelectedBooks: function () {
				const sConfirmTitle = this._getI18nText("ConfirmTitle");
				const oBooksTable = this.getView().byId("idBooksTable");
				const aSelectedItems = oBooksTable.getSelectedItems();
				const sBooksSuccessDeletingMsg = this._getI18nText(
					aSelectedItems.length > 1
						? "BooksSuccessDeletingMsg"
						: "BookSuccessDeletingMsg"
				);
				let sSelectedBookName;
				aSelectedItems.forEach(
					el =>
						(sSelectedBookName = el
							.getBindingContext("appModel")
							.getObject("title"))
				);

				const sConfirmText =
					aSelectedItems.length > 1
						? this._getI18nText(
								"BooksDeletingConfirmText",
								aSelectedItems.length.toString()
						  )
						: this._getI18nText(
								"BookDeletingConfirmText",
								sSelectedBookName
						  );

				MessageBox.confirm(sConfirmText, {
					title: sConfirmTitle,
					onClose: function (sAction) {
						if (sAction === "OK") {
							this._deleteSelectedBooks();
							MessageToast.show(sBooksSuccessDeletingMsg);
						} else {
							oBooksTable.removeSelections();
							this.onCheckSelectedBooks();
						}
					}.bind(this),
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
				});
			},

			/**
			 * Delete selected books in Model.
			 */
			_deleteSelectedBooks: function () {
				const oBooksTable = this.getView().byId("idBooksTable");
				const aSelectedItems = oBooksTable.getSelectedItems();
				const oAppModel = this.oAppModel;
				const bCreateMode = this.stateModel.getProperty("/createMode");
				const sBooksPath = bCreateMode
					? "/newCategory/books"
					: "/editCategory/books";
				const aBooks = deepClone(oAppModel.getProperty(sBooksPath));
				aSelectedItems.forEach(oItem => {
					const sBookIsbn = oItem
						.getBindingContext("appModel")
						.getObject("isbn13");
					const nIndexToDelete = aBooks.findIndex(
						el => el.isbn13 === sBookIsbn
					);
					aBooks.splice(nIndexToDelete, 1);
				});
				oBooksTable.removeSelections();
				oAppModel.setProperty(sBooksPath, aBooks);
				this.onCheckSelectedBooks();
			},

			/**
			 * "activate" wizard step event handler.
			 *
			 * @param {string} sInputsFieldGroupId id of inputs field group
			 *
			 * @param {string} sStepId id of wizard step
			 *
			 */
			onStepValidationCheck: function (sInputsFieldGroupId, sStepId) {
				let bValidationError = false;
				const aInputs = this.getView()
					.getControlsByFieldGroupId(sInputsFieldGroupId)
					.filter(
						el => el.isA("sap.m.Input") || el.isA("sap.m.TextArea")
					)
					.filter(el => !el.getId().endsWith("-popup-input"));

				aInputs.forEach(oInput => {
					bValidationError =
						this._validateInput(oInput) || bValidationError;
				});
				if (!bValidationError) {
					this._wizard.validateStep(this.byId(sStepId));
				} else {
					this._wizard.invalidateStep(this.byId(sStepId));
				}
			},

			/**
			 * "complete" wizard event handler.
			 */
			wizardCompletedHandler: function () {
				const sInputValidationErrorText = this._getI18nText(
					"InputValidationErrorText"
				);
				if (Messaging.getMessageModel().getData().length) {
					MessageBox.alert(sInputValidationErrorText);
				} else {
					this._oNavContainer.to(this.byId("wizardReviewPage"));
				}
			},

			/**
			 * Return back to wizard content page.
			 */
			backToWizardContent: function () {
				this._oNavContainer.backToPage(
					this._oWizardContentPage.getId()
				);
			},

			/**
			 * Edit first step press event handler.
			 */
			editStepOne: function () {
				this._handleNavigationToStep(0);
			},

			/**
			 * Edit second step press event handler.
			 */
			editStepTwo: function () {
				this._handleNavigationToStep(1);
			},

			/**
			 * Edit third step press event handler.
			 */
			editStepThree: function () {
				this._handleNavigationToStep(2);
			},

			/**
			 * Navigate to necessary step in wizard.
			 *
			 * @param {number} iStepNumber wizard step number
			 */
			_handleNavigationToStep: function (iStepNumber) {
				const fnAfterNavigate = function () {
					this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
					this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
				}.bind(this);

				this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
				this.backToWizardContent();
			},

			/**
			 * Cancel wizard press event handler.
			 *
			 */
			onWizardCancel: function () {
				const sWarningTitle = this._getI18nText("WarningTitle");
				const sWarningText = this._getI18nText(
					"WizardDiscardingWarningText"
				);
				const bCreateMode = this.stateModel.getProperty("/createMode");
				const sChangedCategoryPath = bCreateMode
					? "/newCategory"
					: "/editCategory";
				const sInitialCategoryPath = bCreateMode
					? "/emptyCategory"
					: "/selectedCategory";
				const oCategory =
					this.oAppModel.getProperty(sChangedCategoryPath);
				const oInitialCategory =
					this.oAppModel.getProperty(sInitialCategoryPath);
				if (deepEqual(oInitialCategory, oCategory)) {
					this._cancelWizard();
				} else {
					MessageBox.warning(sWarningText, {
						title: sWarningTitle,
						onClose: function (sAction) {
							if (sAction === "YES") {
								this._cancelWizard();
							}
						}.bind(this),
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					});
				}
			},

			/**
			 * Cancel wizard.
			 *
			 */
			_cancelWizard: function () {
				if (this.stateModel.getProperty("/createMode")) {
					this.oRouter.navTo("categoriesList");
				} else {
					this.oRouter.navTo("categoryDetails", {
						layout: LayoutType.TwoColumnsMidExpanded,
						category: this.sCategoryId,
					});
				}
			},

			/**
			 * Save wizard press event handler.
			 *
			 */
			onWizardSave: async function () {
				if (this.stateModel.getProperty("/createMode")) {
					const oNewCategory = deepClone(
						this.oAppModel.getProperty("/newCategory")
					);
					this.fetchCreateCategory(oNewCategory);
				} else {
					const oEditCategory = deepClone(
						this.oAppModel.getProperty("/editCategory")
					);
					this.fetchEditCategory(oEditCategory);
				}
				await this.fetchAllCategories();
				this._cancelWizard();
			},

			/**
			 * Create new category in dataBase.
			 *
			 */
			fetchCreateCategory: async function (oNewCategory) {
				this.stateModel.setProperty("/busyIndicator", true);
				try {
					const resp = await fetch(this.apiUrl, {
						method: "POST",
						body: JSON.stringify(oNewCategory),
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
					this.stateModel.setProperty("/busyIndicator", false);
				}
			},

			/**
			 * Update category in dataBase.
			 *
			 */
			fetchEditCategory: async function (oEditedCategory) {
				this.stateModel.setProperty("/busyIndicator", true);
				try {
					const resp = await fetch(this.apiUrl, {
						method: "PUT",
						body: JSON.stringify(oEditedCategory),
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
					this.stateModel.setProperty("/busyIndicator", false);
				}
			},
		});
	}
);
