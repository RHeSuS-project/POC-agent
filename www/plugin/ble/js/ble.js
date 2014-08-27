/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/**
 * This is the main object for the BLE functionality. This object 
 * will contain all specific functions for reading and writing data 
 * from and to BLE (Bluetooth Smart or Bluetooth Low Energy) devices
 * 
 * @author Philip Verbist <philip@xsonline.eu>
 * @type object
 */

var ble = {
    initialized:null,
    scanStartErrorMessage:null,
    scanStartRunning:false,
    scanResult:new Array(),
    connectedDevices:null,
    connectTimer:null,
    scanTimer:null,
    // plugin Constructor
    construct: function() {
        logStatus('BLE: constructed');
        ble.connectedDevices=window.localStorage.getItem(ble.ConnectedDevices);
        if(ble.connectedDevices===null)
            ble.connectedDevices=new Array();
        
    },
    initialize: function(initCallbackSucces,initCallbackError){
        logStatus('BLE: Initializing');
        
        //logStatus(initCallbackSucces);
        if(initCallbackSucces===undefined)
            initCallbackSucces=ble.initializeSuccess;
        if(initCallbackError===undefined)
            initCallbackError=ble.initializeError;
        if(!ble.initialized)
            bluetoothle.initialize(initCallbackSucces, initCallbackError);
    },
    initializeSuccess: function(obj) {
        ble.initialized=true;
        logStatus('BLE: initialization success');
    },
    initializeError: function(obj) {
        ble.initialized=false;
        logStatus('BLE: initialization failed');
    },
    isInitialized: function(isInitCallbackSucces, isInitCallbackError)
    {
        if(isInitCallbackSucces===undefined)
            isInitCallbackSucces=ble.initCallbackSucces;
        if(isInitCallbackError===undefined)
            isInitCallbackError=ble.initCallbackError;
        bluetoothle.isInitialized(isInitCallbackSucces, isInitCallbackError);
    },
    isInitCallbackSucces: function() {
        
    },
    isInitCallbackError: function() {
        
    },
    scanStart: function(obj) {
        if(!ble.scanStartRunning)
        {
            logStatus('BLE: trying to start scan');
            var sw=false;
            if(ble.initialized && ble.scanStartErrorMessage===null)
                sw=true;
            else
            {
                ble.initialize(ble.initializeSuccessScanStart);
            }
            if(sw)
            {
                var paramsObj = new Object();
                bluetoothle.startScan(ble.scanStartSuccess, ble.scanStartError, paramsObj);
                ble.scanStartRunning=true;
                logStatus('BLE: Scan stared');
            }
        }
    },
    initializeSuccessScanStart: function(obj) {
        ble.initializeSuccess(obj);
        ble.scanStart();
    },
    scanStartSuccess: function(obj) {
        if (obj.status == "scanResult")
        {
            console.log(obj.toLocaleString());
            logStatus("BLE: Result found: "+obj.name+' - '+obj.address);
            //scanClearTimeout();
            ble.scanResult[ble.scanResult.length]=obj;
            logStatus('size:'+ble.scanResult.length);
            app.onScanResult();
            //window.localStorage.setItem(addressKey, obj.address);
            //connectDevice(obj.address);
        }
        else if (obj.status == "scanStarted")
        {
            ble.scanResult=new Array();
            logStatus("BLE: Scan was started successfully, stopping in 10");
            ble.scanTimer = setTimeout(ble.scanTimeout, 10000);
            ble.scanStartRunning=true;
        }
        else
        {
            logStatus("BLE: Unexpected start scan status: " + obj.status);
            ble.scanStartRunning=false;
        }
    },
    scanStartError: function(obj) {
        ble.scanStartErrorMessage="Start scan error: " + obj.error + " - " + obj.message;
        logStatus(ble.scanStartErrorMessage);
        ble.scanStartRunning=false;
    },
    scanTimeout: function() {
        logStatus("BLE: Scanning time out, stopping");
        ble.scanStop();
    },
    scanStop: function() {
        if(ble.scanStartRunning)
        {    
            bluetoothle.stopScan(ble.scanStopSuccess, ble.scanStopError);
            ble.scanClearTimeout();
        }
        ble.scanStartRunning=false;
        
    },
    scanStopSuccess: function(obj) {
        if (obj.status == "scanStopped")
        {
          logStatus("BLE: Scan was stopped successfully");
        }
        else
        {
          logStatus("BLE: Unexpected stop scan status: " + obj.status);
        }
    },
    scanStopError: function(obj) {
        logStatus("BLE: Stop scan error: " + obj.error + " - " + obj.message);
    },
    scanClearTimeout: function()
    { 
        logStatus("BLE: Clearing scanning timeout");
        if (ble.scanTimer != null)
            clearTimeout(ble.scanTimer);
    },
    connectDevice: function(address) {
        logStatus("BLE: Begining connection to: " + address + " with 5 second timeout");
        var paramsObj = {"address":address};
        bluetoothle.connect(ble.connectDeviceSucces, ble.connectDeviceError, paramsObj);
        connectTimer = setTimeout(ble.connectTimeout, 5000);
    },
    connectDeviceSucces: function(obj) {
        if (obj.status == "connected")
        {
          logStatus("BLE: Connected to : " + obj.name + " - " + obj.address);

          ble.clearConnectTimeout();


          //tempDisconnectDevice();
        }
        else if (obj.status == "connecting")
        {
          logStatus("BLE: Connecting to : " + obj.name + " - " + obj.address);
        }
        else
        {
          logStatus("BLE: Unexpected connect status: " + obj.status);
          ble.clearConnectTimeout();
        }
    },
    connectDeviceError: function(obj) {
        logStatus("BLE: connect error: " + obj.error + " - " + obj.message);
        ble.clearConnectTimeout();
    },
    connectTimeout: function() {
        logStatus("BLE: Connection timed out");
    },
    clearConnectTimeout: function() {
         logStatus("BLE: Clearing connect timeout");
         if (ble.connectTimer != null)
         {
              clearTimeout(ble.connectTimer);
        }
    },
    discover: function() {
        if (window.device.platform == iOSPlatform)
        {
          logStatus("BLE: Discovering heart rate service");
          var paramsObj = {"serviceUuids":[heartRateServiceUuid]};
          bluetoothle.services(ble.servicesHeartSuccess, ble.servicesHeartError, paramsObj);
        }
        else if (window.device.platform == androidPlatform)
        {
          logStatus("BLE: Beginning discovery");
          bluetoothle.discover(ble.discoverSuccess, ble.discoverError);
        }
    },
    servicesHeartSuccess: function() {
        
    },
    servicesHeartError: function() {
        
    },
    discoverSuccess: function() {
        
    },
    discoverError: function() {
        
    }
};