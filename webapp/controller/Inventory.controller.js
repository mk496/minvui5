sap.ui.define([
		"./BaseController",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		 "sap/ui/core/syncStyleClass",
		 "sap/m/MessageBox"
	], function (BaseController, Utilities, History, MessageToast, JSONModel, Device, Filter, FilterOperator, syncStyleClass, MessageBox) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.smartStore.controller.Inventory", {

			onInit: function () {
				this.oRouter = this.getRouter();
				this.oRouter.getTarget("Inventory").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.mAggregationBindingOptions = {};
			/*	this.createFiltersAndSorters();
				this.applyFiltersAndSorters("filteredTabNonPerishable", "items");
				this.applyFiltersAndSorters("filteredTabPerishable", "items");
				this.applyFiltersAndSorters("filteredTabAlerts", "items");*/
				
				/* Initialize User Info for displaying User Name, Last Name and ID */
				this.initUserInfo();

				// Model used to manipulate control states
				var oViewModel = new JSONModel({
					allItemsCount: 0,
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

			onSave: function () {
				this.getModel().submitChanges();
				this.getModel().refresh();
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));
			},

			onReject: function () {
				this.getModel().resetChanges();
				this.getModel().deleteCreatedEntry();
				this.getModel().refresh();
				this.byId("tableAllItems").removeSelections(true);
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			},

			onOrder: function () {
				var oView = this.getView(),
					oModel = oView.getModel();

				oModel.callFunction(
					"/newRequisition", { 
						method: "GET",
						success: function (oData, response) {
							MessageToast.show("Order with ID "+oData.Id+" has been placed!")
						},
						error: function (oError) {
							MessageToast.show("Order has NOT been placed!")
						}
					}
				);
				this.byId("allOrders").getBinding("items").refresh();
			},
			
			onEdit: function () {
				if ((this._checkHasSelected()) === true ) {
					
				}
			},
			
			onAdd: function () {
				const dialog = this.byId("dialog");
    			syncStyleClass("sapUiSizeCompact", this.getView(), dialog);
    			dialog.open();
				/*var oItem = this._createItemRow();
				var oTable = this.byId("tableAllItems");
				oTable.insertItem(oItem, 0);
				this.aCreatedItems.push(oItem);
				
				var oData = this._createItemEntry(oItem);
				this.getModel().createEntry("/InventorySet", oData, 
					{
						success : this._handleAddProduct(true),
						error : this._handleAddProduct(false)
					});*/
					
				this.getModel().refresh();
			},
	
			onDelete: function() {
				var aSelectedProducts, i, sPath, oProduct, oProductId,
					oTable = this.byId("tableAllItems"),
					oModel = this.getModel(),
					that = this;
	
				aSelectedProducts = oTable.getSelectedItems();
				if (aSelectedProducts.length) {
					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
					MessageBox.warning(
						that.getModel("i18n").getResourceBundle().getText("dialogDeleteWarning"),
						{
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function(sAction) {
								if (sAction === "OK") {
									for (i = 0; i < aSelectedProducts.length; i++) {
										oProduct = aSelectedProducts[i];
										oProductId = oProduct.getBindingContext().getProperty("Id");
										sPath = oProduct.getBindingContext().getPath();
										oModel.remove(sPath, {
											success : that._handleDeleteProduct.bind(that, oProductId, true, i+1, aSelectedProducts.length),
											error : that._handleDeleteProduct.bind(that, oProductId, false, i+1, aSelectedProducts.length)
										});
									}
									that.getModel().refresh();
								} else {
									that.byId("tableAllItems").removeSelections(); 
								}
							}
						}
					);
				} else {
					MessageToast.show(this.getModel("i18n").getResourceBundle().getText("TableSelectAtLEastOneProductMsg"));
				}
			},
	
			onItemSearch: function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = new Filter([
							new Filter("tolower(ProductDescription)", FilterOperator.Contains,"'" + sQuery.toLowerCase().replace("'","''") + "'")
						], false);
					}
					this._applySearchItem(aTableSearchState);
				}
			},
			
			_applySearchItem: function (aTableSearchState) {
				this.byId("tableAllItems").getBinding("items").filter(aTableSearchState, "Application");
			},

			onItemPress: function (oEvent) {
				this.getRouter().navTo("ProductInfo", {
					itemId: oEvent.getSource().getBindingContext().getProperty("Id")
				});
			},
			
			onRequisitionPress: function (oEvent) {
				this.getRouter().navTo("Requisition", {
					requisitionId: oEvent.getSource().getBindingContext().getProperty("Id")
				});
			},

			_enableButton: function (sButton, bParam) {
				if (sButton !== undefined && sButton !== null) {
					this.byId(sButton).setEnabled(bParam);
				} else {
					var aEditButtons = sap.ui.getCore().byFieldGroupId("edit");
					aEditButtons.forEach(function(button) {
						var sId = button.getId();
						if ((sId.includes("-img")) !== true) {
							button.setEnabled(bParam);
						}
					});
				}
			},
			
			_checkHasSelected: function () {
				var oTable = this.byId("tableAllItems"),
					oSelectedItems = oTable.getSelectedItems();
					
				if	(oSelectedItems.length === 1) {
					return true;
				} else {
					MessageToast.show(this.getModel("i18n").getResourceBundle().getText("TableSelectProductMsg"));
					return false;
				}
			},
			
			_setButtonVisible: function(sButton) {
				if (this.byId(sButton).getVisible() !== true) {
					this.byId(sButton).setVisible(true);
				} else {
					this.byId(sButton).setVisible(false);
				}
			},
			
			_handleDeleteProduct : function (sProductId, bSuccess, iRequestNumber, iTotalRequests){
				if (iRequestNumber === iTotalRequests) {
					if (iRequestNumber > 1) {
						MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductsDeleteSuccessMsg", [iTotalRequests]));
					} else {
						MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductDeleteSuccessMsg", [iTotalRequests]));
					}
					
				}
			},
			
			_handleAddProduct : function (bSuccess){
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductSuccessAddMessage"));	
			},
			
			_createItemEntry: function (oItem) {
				return {
    				Id: null,
					ProductDescription: 'X',
					Price: '0,00',
					Currency: 'PLN',
					ShelfStock: '50',
					Location: 'Location',
					Image: '',
					Status: 'Success',
					StatusColor: 'Success',
					InStock: '100',
					Unit: 'Unit',
					LifeRemaining: '1 Month',
					LifeRemainingTreshold: 'Success',
					ItemType: 'Perishable',
					OrderingTreshold: 'Success'
				};
			},
			// DIALOG ------------------------------------------------------------

		    onBeforeDialogOpen: function(event) {
		    	var oModel = this.getModel();
		      //const context = this.getView().getBindingContext("odata");
		    	this.setDeferred("addingItem", oModel);
		    	var newContext = this.getModel().createEntry("/InventorySet", {
		        	groupId: "addingItem",
		        	properties: {
    					Id: oModel.getProperty("Id"),
						ProductDescription: null,
						Price: null,
						Currency: null,
						ShelfStock: null,
						Location: null,
						Status: null,
						InStock: null,
						Unit: 'null',
						LifeRemaining: 'null',
						ItemType: 'null'
					}
		    	});
		    	event.getSource().setBindingContext(newContext, "odata");
		    },
		
		    setDeferred: function(groupId, model) {
		      var groupsIds = model.getDeferredGroups();
		      if (!groupsIds.find(id => id === groupId)) {
		        model.setDeferredGroups(model.getDeferredGroups().concat(groupId));
		      }
		    },
		
		    // =====================================================
		});
	}, /* bExport= */
	true);