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
var iOSPlatform = "iOS";
var androidPlatform = "Android";
var app = {
    plugins: new Array('ble'/*, 'ant'*/),
    lastPushTime: 0,
    minTimeBetweenPushes: 60000,
    connectedDevices: new Array(),
    connectionInitialized:false,
    subscriptionDataForStatistics:null,
    devices: null,
    paused: false,
    deviceStatuses: new Array(
            {
                name:'Not connected',
                labelClass:'label-danger',
                checked:false
            },
            {
                name:'Connected',
                labelClass:'label-success',
                checked:true
            },
            {
                name:'Unavailable',
                labelClass:'label-warning',
                checked:true
            }
    ),
    // Application Constructor
    initialize: function() {
        if(typeof testMode != 'undefined')
        {
            testMode.initialize();
        }
        
        
        this.bindEvents();
        var i=0;
        for(i=0;app.plugins.length>i;i++)
        {
            logStatus('Plugin loading '+app.plugins[i]);
            loadPlugin(app.plugins[i]);
        }
        
        setInterval(app.scanStart,10000);
        setInterval(app.sendDataToService,300000);
        setInterval(app.storeDevicesToStorage,600000);
    },
    addDeviceToConnectList: function(obj) {
        logStatus('APP: adding device to connected list.');
        var sw=true;
        var i=0;
        for(i=0;app.connectedDevices.length>i;i++)
        {
            if(app.connectedDevices[i].type==obj.type)
                if(app.connectedDevices[i].address==obj.address)
                    sw=false;
        }
        
        if (sw)
        {
             app.connectedDevices.push(obj);
             //logStatus('APP: connectedDevices: '+JSON.stringify(app.connectedDevices));
             window.localStorage.setItem('connectedDevices', compressData(JSON.stringify(app.connectedDevices)));
        }
    },
    removeDeviceFromConnectList: function(obj) {
       logStatus('APP: removing device from connected list.');
       var i=0;
       for(i=0;app.connectedDevices.length>i;i++)
       {
           if(app.connectedDevices[i].type==obj.type)
               if(app.connectedDevices[i].address==obj.address)
               {
                   app.connectedDevices.splice(i,1);
                   window.localStorage.setItem('connectedDevices', compressData(JSON.stringify(app.connectedDevices)));
               }
       }
    },
    getDeviceFromConnectList: function(obj) {
        var i=0;
       for(i=0;app.connectedDevices.length>i;i++)
       {
           if(app.connectedDevices[i].type==obj.type)
               if(app.connectedDevices[i].address==obj.address)
                   return app.connectedDevices[i];
       }
    },
    sendDataToService: function() {
        /*var networkState = reachability.code || reachability;

        var states = {};
        states[NetworkStatus.NOT_REACHABLE]                      = 'None';
        states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'CarrierData';
        states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi';

        if(states[networkState]=='wifi')
        {
            if(app.lastPushTime<=(Math.round(new Date().getTime())-app.minTimeBetweenPushes))
            {
                logStatus(compressData(window.localStorage.getItem("devices")));
            }
        }*/
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
    },
    onPause: function() {
        this.paused=true;
    },
    onResume: function()
    {
        this.paused=false;
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    loadConnecteddevices: function() {
        //logStatus('APP: loadingDevices '+JSON.stringify(JSON.parse(window.localStorage.getItem('connectedDevices'))));
        //logStatus('APP: test: '+deviceList.length);
        
        if(!app.connectionInitialized)
        {
            var deviceList=JSON.parse(decompressData(window.localStorage.getItem('connectedDevices')));
            //logStatus('connecting to: '+deviceList.type+' '+deviceList.address);
                if(deviceList && deviceList.length)
                {
                    
                    
                    logStatus('connecting to: '+deviceList.length);//JSON.parse(window.localStorage.getItem('connectedDevices'))[0].type);
                    var i=0;
                    for(i=0;deviceList.length>i;i++)
                    {
                        for(key in deviceList[i])
                        {
                            for(key2 in deviceList[i][key])
                            logStatus(key2+': '+deviceList[i][key][key2]);
                        }
                        app.connectToDevice(deviceList[i].type, deviceList[i].address);
                    }
                }
            app.connectionInitialized=true;
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //app.scanStart();
        
        //app.loadConnecteddevices();
        logStatus('Received Event: ' + id);
    },
    scanStart: function() {
        var i=0;
        for(i=0;app.plugins.length>i;i++)
        {
            eval(app.plugins[i]+'.scanStart();');
            logStatus(app.plugins[i]+'.scanStart();');
        }
        //eval("ble.construct();");
        logStatus('APP: Scan Started');
    },
    onScanResult: function() {
        onScanResult();
        logStatus('APP: Scan Result received');
    },
    scanResult: function() {
        app.loadConnecteddevices();
        var result=new Array();
        var k=0;
        var i=0;
        
        var j=0;
        var connectResults=app.connectedDevices;
        /*for(j=0;connectResults.length>j;j++)
        {
            result[k]={
                type:app.plugins[i],
                device:connectResults[j],
                status: app.deviceStatuses[1]
            };
            k++;
        }*/
        
        for(i=0;app.plugins.length>i;i++)
        {
            var scanResults=eval(app.plugins[i]+".scanResult");
            for(j=0;scanResults.length>j;j++)
            {
                var l=0;
                var sw=1;
                for(l=0;connectResults.length>l;l++)
                {
                    if(connectResults[l].type==app.plugins[i])
                        if(connectResults[l].address==scanResults[j].address)
                        {
                            if(eval(app.plugins[i]+".isConnected"))
                            {
                                sw=0;

                                result[k]={
                                    type:connectResults[l].type,
                                    device:connectResults[l],
                                    status: app.deviceStatuses[1]
                                };
                                k++;
                            }
                        }
                }
                if(sw)
                {
                    result[k]={
                        type:app.plugins[i],
                        device:scanResults[j],
                        status: app.deviceStatuses[0]
                    };
                    k++;
                }
            }
        }
        return result;
    },
    connectToDevice: function(type,address) {
        logStatus('APP: connecting to '+type+' on address '+address);
        //eval(type+'.connectDevice(\''+address+'\')');
        window[type].connectDevice(address);
    },
    onConnectResult: function(obj) {
        if(obj.status)
        {
            var object=obj;
            delete object['status'];
            app.addDeviceToConnectList(object);
            logStatus('APP: connected to '+ obj.type +' - '+obj.name+' - '+ obj.address);
        }
        else
        {
            var object=obj;
            delete object['status'];
            app.removeDeviceFromConnectList(object);
            logStatus('APP: connection failed to '+ obj.type +' - '+obj.name+' - '+ obj.address);
        }
        onConnectResult(obj);
    },
    connectResult: function() {
        return app.connectedDevices;
    },
    disconnectFromDevice: function(type,address) {
        window[type].disconnectDevice(address);
        app.removeDeviceFromConnectList({"type":type,"address":address});
    },
    onDisconnectResult: function(obj)
    {
        onDisconnectResult(obj);
    },
    onSubscribeResults: function(obj){
        app.storeSubscriptionData(obj);
        app.storeSubscriptionDataForStatistics(obj);
        logStatus('APP: received subscription result.');
        onSubscribeResults(obj);
    }, 
    storeSubscriptionDataForStatistics: function(obj) {
        if(app.subscriptionDataForStatistics!==null)
            var devices=app.subscriptionDataForStatistics;
        else if(window.localStorage.getItem("devices")!=undefined)
            var devices = JSON.parse(decompressData(window.localStorage.getItem("devices")));
        else
            var devices = new Array();
        devices=app.prepareDevicesForStorage(devices, obj);
        var i=0;
        var sw=true;
        while(devices.length>i && sw)
        {
            var deletesw=true;
            var j=0;
            for(j=0;devices[i].services.length>j;j++)
            {
                var k=0;
                for(k=0;devices[i].services[j].charasteristics.length>k;k++)
                {
                    var l=0;
                    while(devices[i].services[j].charasteristics[k].subscriptionData.length>l)
                    {
                        if(devices[i].services[j].charasteristics[k].subscriptionData[l].datetime<(Math.round(new Date().getTime())-4000000))
                        {
                            devices[i].services[j].charasteristics[k].subscriptionData.splice(l,1);
                        }
                        else
                            l++;
                    }
                    if(devices[i].services[j].charasteristics[k].subscriptionData.length)
                    {
                        deletesw=false;
                    }
                }
            }
            
            if(deletesw)
            {
                devices.splice(i,1);
            }
            else
                i++;
        }
        
        app.subscriptionDataForStatistics=devices;
    },
    storeSubscriptionData: function(obj) {
        if(app.devices!==null)
            var devices=app.devices
        else if(window.localStorage.getItem("devices")!=undefined)
            var devices = JSON.parse(decompressData(window.localStorage.getItem("devices")));
        else
            var devices = new Array();
        
        devices=app.prepareDevicesForStorage(devices, obj);
        app.devices=devices;
        //window.localStorage.setItem('devices', JSON.stringify(devices));
    },
    storeDevicesToStorage: function()
    {
        if(app.devices!==null)
            window.localStorage.setItem('devices', compressData(JSON.stringify(app.devices)));
    },
    prepareDevicesForStorage: function(devices, obj) {
        if(!Array.isArray(devices))
        {
            devices=new Array();
        }
        var device = app.getDeviceFromConnectList({'type':obj.type, 'address':obj.deviceAddress});
        if(device!=undefined)
        {
            var foundDevice=undefined;
            var deviceIndex=devices.length;
            var i=0;
            for(i=0;devices.length>i;i++)
            {
                if(devices[i].type==obj.type)
                    if(devices[i].address==obj.deviceAddress)
                    {
                        foundDevice= devices[i];
                        deviceIndex=i;
                    }
            }
            
            if(foundDevice!=undefined)
                device=foundDevice;
            
            device=app.addServicesToDevice(device, obj);
            devices[deviceIndex]=device;
        }
        return devices;
    },
    addServicesToDevice: function(device, obj) {
        if(device.services==undefined)
            device.services=new Array();
        var sw=true;
        var i=0;
        for(i=0;device.services.length>i;i++)
        {
            if(device.services[i].serviceUuid==obj.serviceUuid)
            {
                device.services[i].charasteristics=app.addCharasteristicsToService(device.services[i], obj);
                sw=false;
            }
        }
        if(sw)
        {
            device.services.push({
                serviceUuid:obj.serviceUuid,
                charasteristics: app.addCharasteristicsToService({
                    serviceUuid:obj.serviceUuid
                }, obj)
            });
        }
        return device;
    },
    addCharasteristicsToService: function(service, obj)  {
       
        if(service.charasteristics==undefined)
            service.charasteristics=new Array();
        var sw=true;
        var i=0;
        for(i=0;service.charasteristics.length>i;i++)
        {
            if(service.charasteristics[i].charasteristicUuid==obj.characteristicUuid)
            {
                service.charasteristics[i].subscriptionData=app.addSubscriptionToCharasteristic(service.charasteristics[i], obj);
                sw=false;
            }
        }
        if(sw)
        {
            service.charasteristics.push({
                charasteristicUuid:obj.characteristicUuid,
                subscriptionData: app.addSubscriptionToCharasteristic({
                    charasteristicUuid:obj.characteristicUuid
                }, obj)
            });
        }
        return service.charasteristics;
    },
    addSubscriptionToCharasteristic: function(charasteristic, obj) {
        if(charasteristic.subscriptionData==undefined)
            charasteristic.subscriptionData=new Array();
        
        charasteristic.subscriptionData.push({
            value:obj.value,
            datetime:obj.datetime
        });
        logStatus('APP: subscriptionData Pushed');
        return charasteristic.subscriptionData;
    },
    deviceIsConnected: function(type,address) {
        var i = 0;
        for(i=0;app.connectedDevices.length>i;i++)
        {
            if(app.connectedDevices[i].type===type)
                if(app.connectedDevices[i].address===address)
                {
                    return true;
                }
        }
        return false;
    }
};