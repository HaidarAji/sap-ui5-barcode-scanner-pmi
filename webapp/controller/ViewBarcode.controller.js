sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],

/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @returns 
 */
function (Controller, JSONModel) {
    "use strict";
    
    async function fetchData(uri) {
       const response = await fetch(uri);
       const data = await response.json();
       return data;
    }

    const oModel = new JSONModel();
    let prefixId;

    return Controller.extend("zbarcodescan.controller.ViewBarcode", {
        onInit: function () {
            this.getView().setModel(oModel, "barcode");
            prefixId = this.createId();
            console.log(prefixId);
            if (prefixId){
                prefixId = 
                    `${prefixId.split("ViewBarcode--")[0]}ViewBarcode--`;
            } else {
                prefixId = "";
            }
            console.log(prefixId);

        },

        onScanSuccess: function (oEvent) {
            if (oEvent.getParameter("cancelled")) {
                MessageToast.show("Scan cancelled", { duration:1000 });
            } else {
                if (oEvent.getParameter("text")) {
                    const barcodeNum = oEvent.getParameter("text");
                    fetch('/model/data.json')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            const item = data.Barcode.find(barcode => barcode.Number === barcodeNum);
                            oModel.setData(item);
                        })
                    // console.log(oData);
                    // const item = oData.Barcode.find(barcode => barcode.Number === barcodeNum);
                    // oModel.setData(item);

                }
            }
        },

        onScanError: function(oEvent) {
            MessageToast.show("Scan failed: " + oEvent, { duration:1000 });
        }
    });
});
