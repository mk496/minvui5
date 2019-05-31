sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/UIComponent"
], function(BaseController, MessageBox, Utilities, History, JSONModel, UIComponent) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.ProductInfo", {
		onInit: function() {
			var	oViewModel = new JSONModel({});

			UIComponent.getRouterFor(this).getRoute("ProductInfo").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(oViewModel, "productView");
	
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				UIComponent.getRouterFor(this).navTo("Inventory", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").itemId;
			this.getView().getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getView().getModel().createKey("InventorySet", {
					Id :  sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				UIComponent.getRouterFor(this).getTargets().display("objectNotFound");
				return;
			}
		}
	});
}, /* bExport= */ true);
