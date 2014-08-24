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
    startScanErrorMessage:null,
    startscanRunning:false,
    scanResult:array(),
    connectedDevices:array(),
    scanTimer:null,
    
    // plugin Constructor
    construct: function() {
        ble.connectedDevices=window.localStorage.getItem(bleConnectedDevices);
        if(ble.connectedDevices===null)
            ble.connectedDevices=array();
    },
    initialize: function(callbackSucces,callbackError ){
        if(callbackSucces===undefined)
            callbackSucces=ble.initializeSuccess;
        if(callbackError===undefined)
            callbackError=ble.initializeError;
        if(ble.initialized===null)
            bluetoothle.initialize(callbackSucces, callbackError);
        return ble.initialized;
    },
    initializeSuccess: function(obj) {
        ble.initialized=true;
    },
    initializeError: function(obj) {
        ble.initialized=false;
        logStatus('BLE: initialization failed');
    },
    startScan: function(obj) {
        if(!ble.startscanRunning)
        {
            var sw=false;
            if(ble.initialized && ble.startScanErrorMessage===null)
                sw=true;
            else
                ble.initialize(ble.startScan);
            if(sw)
            {
                var paramsObj = {};
                bluetoothle.startScan(ble.startScanSuccess, ble.startScanError, paramsObj);
                ble.startscanRunning=true;
            }
        }
    },
    startScanSuccess: function(obj) {
        if (obj.status == "scanResult")
        {
            logStatus("BLE: Result found: "+obj.name+' - '+obj.address);
            //clearScanTimeout();
            ble.scanResult[ble.scanresult.length]={name:obj.name,address:obj.address};
            
            //window.localStorage.setItem(addressKey, obj.address);
            //connectDevice(obj.address);
        }
        else if (obj.status == "scanStarted")
        {
            ble.scanResult=array();
            logStatus("BLE: Scan was started successfully, stopping in 10");
            ble.scanTimer = setTimeout(ble.scanTimeout, 10000);
            ble.startscanRunning=true;
        }
        else
        {
            logStatus("BLE: Unexpected start scan status: " + obj.status);
            ble.startscanRunning=false;
        }
    },
    startScanError: function(obj) {
        ble.startScanErrorMessage="Start scan error: " + obj.error + " - " + obj.message;
        logStatus(ble.startScanErrorMessage);
        ble.startscanRunning=false;
    },
    scanTimeout: function() {
        logStatus("BLE: Scanning time out, stopping");
        ble.stopScan();
    },
    stopScan: function() {
        bluetoothle.stopScan(stopScanSuccess, stopScanError);
        ble.clearScanTimeout();
        ble.startscanRunning=false;
        
    },
    stopScanSuccess: function() {
        if (obj.status == "scanStopped")
        {
          logStatus("BLE: Scan was stopped successfully");
        }
        else
        {
          logStatus("BLE: Unexpected stop scan status: " + obj.status);
        }
    },
    stopScanError: function() {
        logStatus("BLE: Stop scan error: " + obj.error + " - " + obj.message);
    },
    clearScanTimeout: function()
    { 
        logStatus("BLE: Clearing scanning timeout");
        if (ble.scanTimer != null)
            clearTimeout(ble.scanTimer);
    }
};