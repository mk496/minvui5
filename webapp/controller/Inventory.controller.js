sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/UIComponent",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
		
	], function (BaseController, UIComponent, Utilities, History, MessageToast, JSONModel, Device, Filter, FilterOperator) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.smartStore.controller.Inventory", {
			
			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("Inventory").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.mAggregationBindingOptions = {};
				this.createFiltersAndSorters();
				this.applyFiltersAndSorters("filteredTabNonPerishable", "items");
				this.applyFiltersAndSorters("filteredTabPerishable", "items");
				this.applyFiltersAndSorters("filteredTabAlerts", "items");
	
				// Model used to manipulate control states
				var oViewModel = new JSONModel({
					allItemsCount: 0,
					nonPerishableCount: 0,
					perishableCount: 0,
					alertsCount: 0
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
			
			onUpdateFinished : function (oEvent) {
				var iTotalItems = oEvent.getParameter("total"),
					oModel = this.getView().getModel("inventoryView");
				
				if ( oEvent.getSource().getId() === "container-SmartStore---Inventory--tableAllItems") {
					oModel.setProperty("/allItemsCount", iTotalItems);
				}
				else if ( oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabNonPerishable") {
					oModel.setProperty("/nonPerishableCount", iTotalItems);
				}
				else if ( oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabPerishable") {
					oModel.setProperty("/perishableCount", iTotalItems);
				}
				else if ( oEvent.getSource().getId() === "container-SmartStore---Inventory--filteredTabAlerts") {
					oModel.setProperty("/alertsCount", iTotalItems);
				}
			},

			onExit: function () {
				// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
				var aControls = [{"controlId": "filteredTabNonPerishable", "groups": ["items"]},
								 {"controlId": "fileredTabPerishable", "groups": ["items"]},
								 {"controlId": "fileredTabAlerts", "groups": ["items"]}];
								 
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
				
				//console.log("Stock value changed to '" + value + "'");
				
				this._enableButtons("save");
				this._enableButtons("reject");
				
				var sParent = oEvent.getSource().getParent();
				var sPath = sParent.getBindingContext().getPath();
				var model = this.getView().getModel(); 
				model.setProperty(sPath+"/ShelfStock","" + value + "");
			},
			
			onSave: function() {
				var oModel = this.getView().getModel(); 
				oModel.submitChanges();
				
				this._resetButtons("save");
				this._resetButtons("reject");
				this._enableButtons("order");
				
				MessageToast.show("Stock changes were saved!");
			},
			
			onReject: function() {
				var oModel = this.getView().getModel(); 
				oModel.resetChanges();
				this._resetButtons();
				
				MessageToast.show("Stock changes were rejected!");
			},
			
			onOrder: function() {
				this._resetButtons();
				
				MessageToast.show("Order has been placed!");
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
					this._applySearchItem(aTableSearchState);
				}
			},

			onItemSelect: function (oEvent) {
				this._showInfo(oEvent.getSource());
			},
			
			_showInfo : function (oItem) {
				UIComponent.getRouterFor(this).navTo("ProductInfo", {
					itemId: oItem.getBindingContext().getProperty("Id")
				});
			},
			
			_resetButtons: function (oButton) {
				if (oButton === "save") {
					this.getView().byId("btnSave").setEnabled(false);
				}
				else if (oButton === "reject") {
					this.getView().byId("btnReject").setEnabled(false);
				}
				else if (oButton === "order") {
					this.getView().byId("btnOrder").setEnabled(false);
				} 
				else {
					this.getView().byId("btnSave").setEnabled(false);
					this.getView().byId("btnReject").setEnabled(false);
					this.getView().byId("btnOrder").setEnabled(false);
				}
			},
			
			_enableButtons: function (oButton) {
				if (oButton === "save") {
					this.getView().byId("btnSave").setEnabled(true);
				}
				else if (oButton === "reject") {
					this.getView().byId("btnReject").setEnabled(true);
				}
				else if (oButton === "order") {
					this.getView().byId("btnOrder").setEnabled(true);
				} 
				else {
					this.getView().byId("btnSave").setEnabled(true);
					this.getView().byId("btnReject").setEnabled(true);
					this.getView().byId("btnOrder").setEnabled(true);
				}
			},
			
			_applySearchItem: function(aTableSearchState) {
				var oTable = this.getView().byId("tableAllItems");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
			}
		});
	}, /* bExport= */
	true);