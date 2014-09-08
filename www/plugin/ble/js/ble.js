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
    initialized: null,
    scanStartErrorMessage: null,
    scanStartRunning: false,
    scanResult: new Array(),
    connectedDevices: null,
    currentConnectedDevice: null,
    connectTimer: null,
    scanTimer: null,
    connectToNextDeviceTimer: 5000,
    connectingToDevice: null,
    
    //activeSubscriptions: new Array(),
    // plugin Constructor
    construct: function() {
        logStatus('BLE: constructed');
        ble.connectedDevices = new Array();
        if (ble.connectedDevices === null)
            ble.connectedDevices = new Array();
    },
    addConnectedDevice: function(address) {
        if (ble.connectedDevices.indexOf(address) === -1)
            ble.connectedDevices.push(address);
    },
    removeConnectedDevice: function(address) {
        if (ble.connectedDevices.indexOf(address) > -1)
            ble.connectedDevices.splice(address);
    },
    /*addActiveSubscription: function(object) {
        if (ble.activeSubscriptions.indexOf(object) === -1)
            ble.activeSubscriptions.push(object);
    },
    removeActiveSubscription: function(object) {
        if (ble.activeSubscriptions.indexOf(object) > -1)
            ble.activeSubscriptions.splice(object);
    },*/
    connectToNextDevice: function() {
        if(ble.connectedDevices.length>1)
        {
            var sw=true;
            if(ble.currentConnectedDevice)
            {
                if(ble.connectedDevices.indexOf(ble.currentConnectedDevice)>-1)
                    if(ble.connectedDevices.indexOf(ble.currentConnectedDevice)<ble.connectedDevices.length-1)
                    {
                        ble.connectDevice(ble.connectedDevices.indexOf(ble.currentConnectedDevice)+1);
                        sw=false;
                    }
            }
            if(sw)
                ble.connectDevice(ble.connectedDevices[0]);
        }
    },
    initConnectToNextDeviceTimer: function() {
        clearTimeout(ble.connectTimer);
        ble.connectTimer=setTimeout(ble.connectToNextDevice,ble.connectToNextDeviceTimer);
    },
    initialize: function(initCallbackSucces, initCallbackError) {
        logStatus('BLE: Initializing');
        if (initCallbackSucces === undefined)
            initCallbackSucces = ble.initializeSuccess;
        if (initCallbackError === undefined)
            initCallbackError = ble.initializeError;
        if (!ble.initialized)
            bluetoothle.initialize(initCallbackSucces, initCallbackError);
    },
    initializeSuccess: function(obj) {
        ble.initialized = true;
        logStatus('BLE: initialization success');
    },
    initializeError: function(obj) {
        ble.initialized = false;
        logStatus('BLE: initialization failed');
    },
    isInitialized: function(isInitCallbackSucces, isInitCallbackError)
    {
        if (isInitCallbackSucces === undefined)
            isInitCallbackSucces = ble.isInitCallbackSucces;
        if (isInitCallbackError === undefined)
            isInitCallbackError = ble.initCallbackError;
        bluetoothle.isInitialized(isInitCallbackError, isInitCallbackError);
    },
    isInitCallbackSucces: function() {

    },
    isInitCallbackError: function() {

    },
    scanStart: function(obj) {
        if (!ble.scanStartRunning)
        {
            logStatus('BLE: trying to start scan');
            var sw = false;
            if (ble.initialized && ble.scanStartErrorMessage === null)
                sw = true;
            else
            {
                ble.initialize(ble.initializeSuccessScanStart);
            }
            if (sw)
            {
                var paramsObj = new Object();
                bluetoothle.startScan(ble.scanStartSuccess, ble.scanStartError, paramsObj);
                ble.scanStartRunning = true;
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
            logStatus("BLE: Result found: " + obj.name + ' - ' + obj.address);
            //scanClearTimeout();
            ble.scanResult[ble.scanResult.length] = obj;
            logStatus('size:' + ble.scanResult.length);
            app.onScanResult();
            //window.localStorage.setItem(addressKey, obj.address);
            //connectDevice(obj.address);
        }
        else if (obj.status == "scanStarted")
        {
            ble.scanResult = new Array();
            logStatus("BLE: Scan was started successfully, stopping in 10");
            ble.scanTimer = setTimeout(ble.scanTimeout, 10000);
            ble.scanStartRunning = true;
        }
        else
        {
            logStatus("BLE: Unexpected start scan status: " + obj.status);
            ble.scanStartRunning = false;
        }
    },
    scanStartError: function(obj) {
        ble.scanStartErrorMessage = "Start scan error: " + obj.error + " - " + obj.message;
        logStatus(ble.scanStartErrorMessage);
        ble.scanStartRunning = false;
    },
    scanTimeout: function() {
        logStatus("BLE: Scanning time out, stopping");
        ble.scanStop();
    },
    scanStop: function() {
        if (ble.scanStartRunning)
        {
            bluetoothle.stopScan(ble.scanStopSuccess, ble.scanStopError);
            ble.scanClearTimeout();
        }
        ble.scanStartRunning = false;
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
    connectDevice: function(address, callbackSucces, connectDeviceError) {
        ble.connectingToDevice = address;
        ble.addConnectedDevice(address);
        if (callbackSucces === undefined)
            callbackSucces = ble.connectDeviceSucces;
        if (connectDeviceError === undefined)
            connectDeviceError = ble.connectDeviceError;
        logStatus("BLE: Begining connection to: " + address + " with 5 second timeout");
        var paramsObj = {"address": address};
        bluetoothle.connect(callbackSucces, connectDeviceError, paramsObj);
        ble.connectTimer = setTimeout(ble.connectTimeout, 5000);
    },
    connectDeviceSucces: function(obj) {
        if (obj.status == "connected")
        {
            logStatus("BLE: Connected to : " + obj.name + " - " + obj.address);
            ble.currentConnectedDevice = obj.address;
            ble.clearConnectTimeout();
            obj.status = true;
            obj.type = 'ble';
            app.onConnectResult(obj);

            ble.discover();
        }
        else if (obj.status == "connecting")
        {
            logStatus("BLE: Connecting to : " + obj.name + " - " + obj.address);
        }
        else
        {
            logStatus("BLE: Unexpected connect status: " + obj.status);
            ble.clearConnectTimeout();
            obj.status = false;
            app.onConnectResult(obj);
        }
    },
    connectDeviceError: function(obj) {
        logStatus("BLE: connect error: " + obj.error + " - " + obj.message);
        logStatus('BLE: connect address: ' + obj.address);
        for (key in obj)
            logStatus('' + key + ' : ' + obj[key]);
        ble.disconnectDevice(ble.tempCloseDevice);
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
    disconnectDevice: function(callbackSuccess, callbackError)
    {
        if (callbackSuccess === undefined)
            callbackSuccess = ble.disconnectSuccess;
        if (callbackError === undefined)
            callbackError = ble.disconnectError;
        bluetoothle.disconnect(callbackSuccess, callbackError);
    },
    disconnectSuccess: function(obj) {
        if (obj.status == "disconnected")
        {
            logStatus("BLE: Disconnect device");
            ble.closeDevice();
        }
        else if (obj.status == "disconnecting")
        {
            logStatus("BLE: Disconnecting device");
        }
        else
        {
            logStatus("BLE: Unexpected disconnect status: " + obj.status);
            ble.closeDevice();
        }
        obj.type = 'ble';
        app.disconnectSuccess(obj);
    },
    disconnectError: function() {
        logStatus("BLE: Disconnect error: " + obj.error + " - " + obj.message);
    },
    tempCloseDevice: function(obj) {
        ble.closeDevice(ble.reAttemptConnect, ble.reAttemptConnect);
    },
    reAttemptConnect: function(obj) {
        ble.connectDevice(ble.connectingToDevice, ble.connectDeviceSucces, ble.reAttemptConnectError);
    },
    reAttemptConnectError: function(obj) {
        obj.status = false;
        obj.type = 'ble';
        app.onConnectResult(obj);
        ble.removeConnectedDevice(ble.connectingToDevice);
        ble.connectingToDevice=null;
    },
    closeDevice: function(callbackSuccess, callbackError) {
        if (callbackSuccess === undefined)
            callbackSuccess = ble.closeSuccess;
        if (callbackError === undefined)
            callbackError = ble.closeError;
        bluetoothle.close(callbackSuccess, callbackError);
    },
    closeSuccess: function(obj) {
        if (obj.status == "closed")
        {
            logStatus("Closed device");
            obj.status = true;
        }
        else
        {
            obj.status = false;
            logStatus("Unexpected close status: " + obj.status);
        }
        obj.type = 'ble';

        app.disconnectResult(obj);
    },
    closeError: function(obj) {
        logStatus("Close error: " + obj.error + " - " + obj.message);

        obj.type = 'ble';
        app.disconnectResult(obj);
    },
    discover: function() {
        if (window.device.platform == iOSPlatform)
        {
            logStatus("BLE: Discovering heart rate service");
            var paramsObj = {"serviceUuids": [heartRateServiceUuid]};
            bluetoothle.services(ble.servicesHeartSuccess, ble.servicesHeartError, paramsObj);
        }
        else if (window.device.platform == androidPlatform)
        {
            logStatus("BLE: Beginning discovery");
            bluetoothle.discover(ble.discoverSuccess, ble.discoverError);
        }
    },
    servicesHeartSuccess: function(obj) {

    },
    servicesHeartError: function(obj) {

    },
    discoverSuccess: function(obj) {
        if (obj.status == "discovered")
        {
            logStatus("BLE: Discovery completed");
            var i = 0;
            for (i = 0; obj.services.length > i; i++)
            {
                /*for(key in obj.services[i].characteristics[0].descriptors)
                 logStatus("BLE: chasteristics: 0: descriptors: "+key+": "+obj.services[i].characteristics.descriptors[0][key]);*/
                var serviceUuid = obj.services[i].serviceUuid;
                var charasteristicsUuids = new Array();
                var u = 0;
                var v = 0;
                for (u = 0; obj.services[i].characteristics.length > u; u++)
                {
                    if (obj.services[i].characteristics[u].characteristicUuid !== undefined)
                    {
                        logStatus(obj.services[i].characteristics[u].characteristicUuid);
                        charasteristicsUuids[v] = obj.services[i].characteristics[u].characteristicUuid;
                        //ble.charasteristics({serviceUuid:serviceUuid,charasteristicsUuids:[obj.services[i].characteristics[u].characteristicUuid]});
                        var object = {"serviceUuid": serviceUuid, "characteristicUuid": obj.services[i].characteristics[u].characteristicUuid};
                        //ble.addActiveSubscription(object);
                        bluetoothle.subscribe(ble.subscribeSuccess, ble.subscribeError, object);
                        v++;
                    }
                }
                //ble.charasteristics({"serviceUuid":serviceUuid,"characteristicUuids":charasteristicsUuids});
                logStatus('BLE: serviceUuid: ' + obj.services[i].serviceUuid);
                
            }
            //bluetoothle.descriptors(ble.descriptorsSuccess, ble.descriptorsError);
        }
        else
        {
            logStatus("BLE: Unexpected discover status: " + obj.status);
            
            ble.discoverError(obj);
        }
    },
    discoverError: function(obj) {
        ble.disconnectDevice(ble.discoveryErrorDisconnect(),ble.discoveryErrorDisconnect());
    },
    discoveryErrorDisconnect: function(obj) {
        ble.closeDevice(ble.removeConnectedDevice(ble.currentConnectedDevice,ble.currentConnectedDevice));
    },
    descriptorsError: function(obj) {
        logStatus('BLE: descriptors failed');
    },
    charasteristics: function(obj, callBackSuccess, callBackError) {
        bluetoothle.characteristics(ble.characteristicsSuccess, ble.characteristicsError, obj);
    },
    characteristicsSuccess: function(obj) {
        if (obj.status == "discoveredCharacteristics")
        {
            var characteristicUuids = obj.characteristicUuids;
            for (var i = 0; i < characteristicUuids.length; i++)
            {
                logStatus("Characteristics found, now discovering descriptor");
                var characteristicUuid = characteristicUuids[i];

                //if (characteristicUuid == heartRateMeasurementCharacteristicUuid)
                //{
                var paramsObj = {"serviceUuid": obj.serviceUuid, "characteristicUuid": characteristicUuid};
                ble.descriptors(paramsObj);
                return;
                //}
            }
            logStatus("Error: Heart rate measurement characteristic not found.");
        }
        else
        {
            logStatus("Unexpected characteristics status: " + obj.status);
        }
        //disconnectDevice();
    },
    characteristicsError: function() {
        logStatus('BLE: failed chasteristics status');
    },
    descriptors: function(obj) {
        bluetoothle.descriptors(ble.descriptorsSuccess, ble.descriptorsHeartError, obj);
    },
    descriptorsSuccess: function(obj) {
        if (obj.status == "discoveredDescriptors")
        {
            logStatus("Discovered heart descriptors, now discovering service");
            //var paramsObj = {"serviceUuids": [batteryServiceUuid]};
            //bluetoothle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
        }
        else
        {
            logStatus("BLE: Unexpected descriptors status: " + obj.status);
            //disconnectDevice();
        }
    },
    descriptorsHeartError: function() {
        logStatus("BLE: Descriptors error");
    },
    subscribeSuccess: function(obj) {
        if (obj.status == "subscribedResult")
        {
            logStatus("BLE: Subscription data received ");
            //Parse array of int32 into uint8
            var bytes = bluetoothle.encodedStringToBytes(obj.value);
            //Check for data
            if (bytes.length == 0)
            {
                logStatus("BLE: Subscription result had zero length data");
                return;
            }

            //Get the first byte that contains flags
            var flag = bytes[0];
            //Check if u8 or u16 and get heart rate
            var hr;
            if ((flag & 0x01) == 1)
            {
                var u16bytes = bytes.buffer.slice(1, 3);
                var u16 = new Uint16Array(u16bytes)[0];
                hr = u16;
            }
            else
            {
                var u8bytes = bytes.buffer.slice(1, 2);
                var u8 = new Uint8Array(u8bytes)[0];
                hr = u8;
            }

            app.onSubscribeResults({
                type: 'ble',
                deviceAddress:ble.currentConnectedDevice,
                serviceUuid: obj.serviceUuid,
                characteristicUuid: obj.characteristicUuid,
                value: hr,
                datetime: Math.round(new Date().getTime())
            });
            logStatus(obj.serviceUuid + " - " + obj.characteristicUuid + " " + hr);
            logStatus('connectedDevices: ' + ble.connectedDevices.length);
            
        }
        else if (obj.status == "subscribed")
        {
            logStatus("BLE: Subscription started");
        }
        else
        {
            logStatus("BLE: Unexpected subscribe status: " + obj.status);
            var paramsObj = {"serviceUuid": obj.serviceUuid, "characteristicUuid": obj.characteristicUuid};
            bluetoothle.read(ble.readSuccess, ble.readError, paramsObj);
        }
    },
    subscribeError: function(obj) {
        logStatus('BLE subscribe Error trying read');
        var paramsObj = {"serviceUuid": obj.serviceUuid, "characteristicUuid": obj.characteristicUuid};
        bluetoothle.read(ble.readSuccess, ble.readError, paramsObj);
    },
    readSuccess: function(obj) {
        var object = {"serviceUuid": obj.serviceUuid, "characteristicUuid": obj.characteristicUuid};
        if (obj.status == "read")
        {
            var bytes = bluetoothle.encodedStringToBytes(obj.value);
            logStatus("read: " + bytes[0]);
            setTimeout(ble.read(ble.readSuccess, ble.readError,object),5000);
            app.onSubscribeResults({
                type: 'ble',
                deviceAddress:ble.currentConnectedDevice,
                serviceUuid: obj.serviceUuid,
                characteristicUuid: obj.characteristicUuid,
                value: bytes[0],
                datetime: Math.round(new Date().getTime())
            });
        }
        else
        {
            logStatus("Unexpected read status: " + obj.status);
            //ble.removeActiveSubscription(object);
        }
    },
    readError: function(obj) {
        logStatus("Read error: " + obj.error + " - " + obj.message);
        //var object = {"serviceUuid": obj.serviceUuid, "characteristicUuid": obj.characteristicUuid};
        //ble.removeActiveSubscription(object);
    }
};