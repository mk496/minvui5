sap.ui.define([
		"./BaseController",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, Utilities, History, MessageToast, JSONModel, Device, Filter, FilterOperator) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.smartStore.controller.Inventory", {

			onInit: function () {
				this.oRouter = this.getRouter();
				this.oRouter.getTarget("Inventory").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.mAggregationBindingOptions = {};
				this.createFiltersAndSorters();
				this.applyFiltersAndSorters("filteredTabNonPerishable", "items");
				this.applyFiltersAndSorters("filteredTabPerishable", "items");
				this.applyFiltersAndSorters("filteredTabAlerts", "items");

				var oUserModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
				this.getView().setModel(oUserModel, "userapi");

				// Model used to manipulate control states
				var oViewModel = new JSONModel({
					allItemsCount: 0,
					nonPerishableCount: 0,
					perishableCount: 0,
					alertsCount: 0,
					ordersCount: 0
				});

				this.getView().setModel(oViewModel, "inventoryView");
			},

			handleRouteMatched: function (oEvent) {
				var oParams = {};
				if (oEvent.mParameters.data.context) {
					this.sContext = oEvent.mParameters.data.context;
				} else {
					if (this.getOwnerComponent().getComponentData()) {
						var patternConvert = function (oParam) {
							if (Object.keys(oParam).length !== 0) {
								for (var prop in oParam) {
									if (prop !== "sourcePrototype") {
										return prop + "(" + oParam[prop][0] + ")";
									}
								}
							}
						};
						this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
					}
				}
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			},

			updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
				this.mBindingOptions = this.mBindingOptions || {};
				this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};
				var aSorters = this.mBindingOptions[sCollectionId].sorters;
				var aGroupby = this.mBindingOptions[sCollectionId].groupby;
				// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
				if (oBindingData) {
					if (oBindingData.sorters) {
						aSorters = oBindingData.sorters;
					}
					if (oBindingData.groupby || oBindingData.groupby === null) {
						aGroupby = oBindingData.groupby;
					}
					// 1) Update the filters map for the given collection and source
					this.mBindingOptions[sCollectionId].sorters = aSorters;
					this.mBindingOptions[sCollectionId].groupby = aGroupby;
					this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
					this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
				}
				// 2) Reapply all the filters and sorters
				var aFilters = [];
				for (var key in this.mBindingOptions[sCollectionId].filters) {
					aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
				}
				// Add the groupby first in the sorters array
				if (aGroupby) {
					aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
				}
				var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
				return {
					filters: aFinalFilters,
					sorters: aSorters
				};
			},

			createFiltersAndSorters: function () {
				this.mBindingOptions = {};
				var oBindingData, aPropertyFilters;
				oBindingData = {};
				oBindingData.filters = [];
				aPropertyFilters = [];
				aPropertyFilters.push(new Filter("ItemType", "EQ", "Non-Perishable"));
				oBindingData.filters.push(new Filter(aPropertyFilters, false));
				this.updateBindingOptions("filteredTabNonPerishable", oBindingData);
				oBindingData = {};
				oBindingData.filters = [];
				aPropertyFilters = [];
				aPropertyFilters.push(new Filter("ItemType", "EQ", "Perishable"));
				oBindingData.filters.push(new Filter(aPropertyFilters, false));
				this.updateBindingOptions("filteredTabPerishable", oBindingData);
				oBindingData = {};
				oBindingData.filters = [];
				aPropertyFilters = [];
				aPropertyFilters.push(new Filter("Status", "EQ", "Re-Stock"));
				aPropertyFilters.push(new Filter("Status", "EQ", "Deteriorating"));
				oBindingData.filters.push(new sap.ui.model.Filter(aPropertyFilters, false));
				this.updateBindingOptions("filteredTabAlerts", oBindingData);
			},

			applyFiltersAndSorters: function (sControlId, sAggregationName, chartBindingInfo) {
				var oBindingInfo = {};
				if (chartBindingInfo) {
					oBindingInfo = chartBindingInfo;
				} else {
					oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
				}
				var oBindingOptions = this.updateBindingOptions(sControlId);
				this.getView().byId(sControlId).bindAggregation(sAggregationName, {
					model: oBindingInfo.model,
					path: oBindingInfo.path,
					parameters: oBindingInfo.parameters,
					template: oBindingInfo.template,
					templateShareable: true,
					sorter: oBindingOptions.sorters,
					filters: oBindingOptions.filters
				});
			},

			onUpdateFinished: function (oEvent) {
				var iTotalItems = oEvent.getParameter("total"),
					oModel = this.getView().getModel("inventoryView");

				if (oEvent.getSource().getId() === "container-SmartStore---Inventory--tableAllItems") {
					oModel.setProperty("/allItemsCount", iTotalItems);
				} else if (oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabNonPerishable") {
					oModel.setProperty("/nonPerishableCount", iTotalItems);
				} else if (oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabPerishable") {
					oModel.setProperty("/perishableCount", iTotalItems);
				} else if (oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabAlerts") {
					oModel.setProperty("/alertsCount", iTotalItems);
				} else if (oEvent.getSource().getId() === "container-SmartStore---Inventory--allOrders") {
					oModel.setProperty("/ordersCount", iTotalItems);
				}
			},

			onExit: function () {
				// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
				var aControls = [{
					"controlId": "filteredTabNonPerishable",
					"groups": ["items"]
				}, {
					"controlId": "fileredTabPerishable",
					"groups": ["items"]
				}, {
					"controlId": "fileredTabAlerts",
					"groups": ["items"]
				}, {
					"controlId": "tabOrders",
					"groups": ["items"]
				}];

				for (var i = 0; i < aControls.length; i++) {
					var oControl = this.getView().byId(aControls[i].controlId);
					if (oControl) {
						for (var j = 0; j < aControls[i].groups.length; j++) {
							var sAggregationName = aControls[i].groups[j];
							var oBindingInfo = oControl.getBindingInfo(sAggregationName);
							if (oBindingInfo) {
								var oTemplate = oBindingInfo.template;
								oTemplate.destroy();
							}
						}
					}
				}
			},

			onStockChange: function (oEvent) {
				var value = oEvent.getParameter("value");

				this._enableButtons(null, true);
				this._enableButtons("order", false);

				var sParent = oEvent.getSource().getParent();
				var sPath = sParent.getBindingContext().getPath();
				var model = this.getView().getModel();
				model.setProperty(sPath + "/ShelfStock", "" + value + "");
			},

			onSave: function () {
				var oModel = this.getView().getModel();
				oModel.submitChanges();

				this._enableButtons(null, false);
				this._enableButtons("order", true);

				this._setTableEdit(false);

				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));
			},

			onReject: function () {
				var oModel = this.getView().getModel();
				oModel.resetChanges();
				this._enableButtons(null, false);
				this._enableButtons("order", true);

				this._setTableEdit(false);

				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			},

			onOrder: function () {
				this._enableButtons(null, false);

				var oView = this.getView(),
					oModel = oView.getModel();

				oModel.callFunction(
					"/newRequisition", {
						method: "GET",
						success: this._orderSuccess,
						error: this._orderError
					}
				);

				this.getView().byId("allOrders").getBinding("items").refresh();
			},

			onEdit: function () {
				this._setTableEdit();
			},

			onItemSearch: function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("ProductDescription", FilterOperator.Contains, sQuery)];
					}
					var btableName = oEvent.getSource().getParent().getParent().getProperty("text");
					this._applySearchItem(aTableSearchState, btableName);
				}
			},

			onItemSelect: function (oEvent) {
				this.getRouter().navTo("ProductInfo", {
					itemId: oEvent.getSource().getBindingContext().getProperty("Id")
				});
			},

			onRequisitionSelect: function (oEvent) {
				this.getRouter().navTo("Requisition", {
					requisitionId: oEvent.getSource().getBindingContext().getProperty("Id")
				});
			},

			_orderSuccess: function (oData, response) {
				MessageToast.show("Order with ID " + oData.Id + " has been placed!");
			},

			_orderError: function (oError) {
				MessageToast.show("Order has NOT been placed!");
			},

			_enableButtons: function (oButton, bParam) {
				if (oButton === "save") {
					this.getView().byId("btnSave").setEnabled(bParam);
				} else if (oButton === "reject") {
					this.getView().byId("btnReject").setEnabled(bParam);
				} else if (oButton === "order") {
					this.getView().byId("btnOrder").setEnabled(bParam);
				} else {
					this.getView().byId("btnSave").setEnabled(bParam);
					this.getView().byId("btnReject").setEnabled(bParam);
				}
			},

			_applySearchItem: function (aTableSearchState, btableName) {
				var oTable;
				if (btableName === "All Items") {
					oTable = this.getView().byId("tableAllItems");
				} else if (btableName === "Non-Perishable") {
					oTable = this.getView().byId("filteredTabNonPerishable");
				} else if (btableName === "Perishable") {
					oTable = this.getView().byId("filteredTabPerishable");
				} else {
					oTable = this.getView().byId("filteredTabAlerts");
				}
				
				oTable.getBinding("items").filter(aTableSearchState, "Application");
			},

			_setTableEdit: function (bParam) {
				var oItems = this.byId("tableAllItems").getItems();
				oItems.forEach(function (item) {
					if (bParam !== undefined) {
						item.getCells()[2].setEditable(bParam);
					} else {
						if (item.getCells()[2].getEditable() === true) {
							item.getCells()[2].setEditable(false);
						} else {
							item.getCells()[2].setEditable(true);
						}
					}
				}, this.bParam);
			}
		});
	}, /* bExport= */
	true);