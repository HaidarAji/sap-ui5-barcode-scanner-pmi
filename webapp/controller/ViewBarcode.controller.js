sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
],
   /**
    * 
    * @param {typeof sap.ui.core.mvc.Controller} Controller 
    * @param {*} MessageToast     
    * @returns 
    */ 
function (Controller, MessageToast, JSONModel) {
    "use strict";
        var prefixId;
        var oScanResultText; 

        let oDataGlobal = {};
        let oPayLoadData = {};

        /**
        * @param {Object} obj
        * @param {Map<String, String} asset
        */ 
        /*const boxVal = (obj, asset) => {
            if (asset !== undefined){
               obj.getView().byId("barcodeID").setText(asset.get("text")); 
            }
        }*/

      return Controller.extend("zbarcodescan.controller.ViewBarcode", {
       
        onInit: function () {
           console.log(document);

           //fetch Plant data on initialization
           this.fetchPlant();
           //fetch Location data on initialization
           this.fetchLocation();

           // Initialize filtered Location model
           this.getView().setModel(new JSONModel([]), "filteredLocations");

           //Initialiaze view model for selected keys
           var oViewModel = new JSONModel({
                selectedPlant: "",
                selectedLocation: ""
            });
            this.getView().setModel(oViewModel, "view");

           prefixId = this.createId();
           if (prefixId){
               prefixId = 
                   `${prefixId.split("ViewBarcode--")[0]}ViewBarcode--`;
           } else {
               prefixId = "";
           }
           oScanResultText = 
           sap.ui.getCore().byId(`${prefixId}barcodeID`);
            if (oScanResultText === undefined) 
                {
                oScanResultText = 
                    this.getView().byId("barcodeID");
                } 
        },       

        fetchPlant: function() {
            var oModel = this.getOwnerComponent().getModel("plantModel");
            var oView = this.getView();

            // Perform OData read Request
            oModel.read("/PlantSet", {
                success: function (oData) {
                    //Create JSONModel for the Plant Data
                    var oPlantModel = new JSONModel(oData.results);

                    //Bind the plant data to the combobox
                    oView.setModel(oPlantModel, "plant");
                   
                    MessageToast.show("Plant load successfully");
                },
                error: function (oError) {
                    var sMessage;

                    //check if responseText exists
                    if (oError.responseText) {
                        try {
                            // Parse the responseText to extract the message
                            var oResponse = JSON.parse(oError.responseText);
                            sMessage = oResponse.error.message.value;
                        } catch(e) {
                            //Fallback to plain text if parsing fails
                            sMessage = oError.responseText;
                        }
                    }else {
                        //Fallback if no responseText is present
                        sMessage = oError.message || "Unknown error Occured.";
                    }
                    //Display the error message
                    MessageToast.show(sMessage);
                    console.error("Error fetching Location Set:", oError);
                }
            });
        },

        fetchLocation: function() {
            var oModel = this.getOwnerComponent().getModel("locationModel");
            var oView = this.getView();

            // Perform OData read request
            oModel.read("/LOCATIONSet", {
                success: function (oData) {
                    // Create JSONModel for the Location data
                    var oLocationModel = new JSONModel(oData.results);

                    // Bind the location data to the ComboBox
                    oView.setModel(oLocationModel, "locations");
                    MessageToast.show("Location load successfully");

                },
                error: function (oError) {
                    var sMessage;

                    //check if responseText exists
                    if (oError.responseText) {
                        try {
                            // Parse the responseText to extract the message
                            var oResponse = JSON.parse(oError.responseText);
                            sMessage = oResponse.error.message.value;
                        } catch(e) {
                            //Fallback to plain text if parsing fails
                            sMessage = oError.responseText;
                        }
                    }else {
                        //Fallback if no responseText is present
                        sMessage = oError.message || "Unknown error Occured.";
                    }
                    //Display the error message
                    MessageToast.show(sMessage);
                    console.error("Error fetching Location Set:", oError);
                }
            });
        },

        onPlantChange: function(oEvent) {
            //Get the selected Plant ID
            var sSelectedPlant = oEvent.getSource().getSelectedKey();

            //Get all locations from the "Locations" model
            var aLocations = this.getView().getModel("locations").getData();

            //Filter Locations by the selected plant
            var aFilteredLocations = aLocations.filter(function (location) {
                return location.Werks === sSelectedPlant;
            });

            //Update the filtered Location model
            this.getView().getModel("filteredLocations").setData(aFilteredLocations);

            //Clear the selected location in the view model
            this.getView().getModel("view").setProperty("/selectedLocation", "");

        },

        onLocationChange: function(oEvent){
            //Validate new selected value
            this.onCompare(oDataGlobal);
        },

        onRoomChange: function(oEvent) {
            //validate new input value
            this.onCompare(oDataGlobal);
        },

        onScanSuccess: function(oEvent){
            console.log(oEvent);
            console.log(this);
            
            if (oEvent.getParameter("text")){
                oScanResultText.setValue(oEvent.getParameter("text"));  
                if ((oEvent.getParameter("text")).length == 23){
                    //this.getView().setBusy(true);
                    var idBarcode = this.getView().byId("barcodeID").getValue();

                    var oView = this.getView();
                    var oModel = this.getOwnerComponent().getModel("headerModel");                     
                    var sPath = "/HeaderSet('" + idBarcode + "')";

                    oModel.read(sPath, {
                        success: function (oData) {
                            // Create a JSONModel for header data
                            var oHeader = new JSONModel(oData);
                            
                            // Bind the header data to the view
                            oView.setModel(oHeader, "header");                                                                      
                            
                            if (oData.Anln1 === "") {
                                this.getView().byId("assetText").setText(oData.Message);

                                MessageToast.show("Asset Number not Valid");
                            }else {
                                //set oData to oDataGlobal
                                oDataGlobal = oData;
                                
                                this.onCompare(oData);

                                MessageToast.show("Asset Fetched Successfully");
                            };        

                        //this.getView().setBusy(false);
                    }.bind(this),

                    Error: function(oError) {                       
                        var sMessage;

                        //check if responseText exists
                        if (oError.responseText) {
                            try {
                                // Parse the responseText to extract the message
                                var oResponse = JSON.parse(oError.responseText);
                                sMessage = oResponse.error.message.value;
                            } catch(e) {
                                //Fallback to plain text if parsing fails
                                sMessage = oError.responseText;
                            }
                        }else {
                            //Fallback if no responseText is present
                            sMessage = oError.message || "Unknown error Occured.";
                        }
                            //Display the error message
                            MessageToast.show(sMessage);
                            this.getView().byId("assetText").setText(sMessage);
                            console.error("Error:", oError);
                            //this.getView().setBusy(false);
                        }
                    });             
                    
                }else {
                    var oView = this.getView();
                    var oHeader = new JSONModel();
                    oView.setModel(oHeader, "header");
                    this.getView().byId("assetText").setText("");
                    MessageToast.show("Invalid BarcodeID Length");                                 
                }              
            }else {
                oScanResultText.setValue('');                                
            }
             
          },
        
        onClosePress: function(oEvent) {
            window.close();
        },

        onScanError: function(oEvent) {
            MessageToast.show("Scan failed: " + oEvent, { duration:1000 });
        },

        onCompare: function(aResults) {
            var aDefLoc = this.getView().getModel("view").getProperty("/selectedLocation");
            var aDefRoom = this.getView().byId("defRoom").getValue();
            
            var aCurrLocData = aResults.Stort;
            var aCurrRoomData = aResults.Raumn;
          
            if ( aCurrLocData !== aDefLoc ) {
                if ( aCurrRoomData !== aDefRoom ) {
                    this.getView().byId("assetText").setText("Default Location and Room Different from Current location");
                } else {
                    this.getView().byId("assetText").setText("Default Location Different from Current location");
                };               
            } else {
                if ( aCurrRoomData !== aDefRoom ) {
                    this.getView().byId("assetText").setText("Default Room Different from Current location");
                } else {
                    this.getView().byId("assetText").setText("");
                };                
            };
        },

        onUpdatePress: function() {
            console.log(oDataGlobal);

            // post to sap
            this.onPayload();
        },

        onPayload: function() {
            var aDefLoc = this.getView().getModel("view").getProperty("/selectedLocation");
            var aRoom = this.getView().byId("defRoom").getValue();
            var aNote = this.getView().byId("invNote").getValue();
            oPayLoadData = {
                BarcodeId: oDataGlobal.BarcodeId,  
                Bukrs: oDataGlobal.Bukrs,              
                Anln1: oDataGlobal.Anln1,
                Anln2: oDataGlobal.Anln2,
                Werks: oDataGlobal.Werks,
                Stort: aDefLoc,                
                Raumn: aRoom,                               
                Invzu: aNote
            };

            console.log(oPayLoadData);

            // Get oData model instance
            var oModelUpdate = this.getOwnerComponent().getModel("headerModel");
            if  (!oModelUpdate) {
                console.log("oModelUpdate model is not available");
                return;
            }

            let key1 = `BarcodeId='${oPayLoadData.BarcodeId}'`;

            //Define the path to the entity to be updated
            var sPathUpdate = `/HeaderSet(${key1})`;
            
            //Send the update request
            oModelUpdate.update(sPathUpdate, oPayLoadData, {
                success: function () {
                    MessageToast.show("Asset updated successfully");
                },
                error: function (oError) {
                    var sMessage;

                    //check if responseText exists
                    if (oError.responseText) {
                        try {
                            // Parse the responseText to extract the message
                            var oResponse = JSON.parse(oError.responseText);
                            sMessage = oResponse.error.message.value;
                        } catch(e) {
                            //Fallback to plain text if parsing fails
                            sMessage = oError.responseText;
                        }
                    }else {
                        //Fallback if no responseText is present
                        sMessage = oError.message || "Unknown error Occured.";
                    }
                    //Display the error message
                    MessageToast.show(sMessage);                    
                    console.log("Update error:", oError);
                }
            });
        },

        onAfterRendering: function() {
            // Reset the scan result
            var oScanButton = 
                sap.ui.getCore().byId(`${prefixId}barcodeID`);
            if (oScanButton) {
                $(oScanButton.getDomRef()).on("click", function(){
                    oScanResultText.setText('');
                });
            }
        }                   
    });
})
