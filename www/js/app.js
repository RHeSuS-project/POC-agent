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
    connectedDevices: new Array(),
    // Application Constructor
    initialize: function() {
        //app.plugins=new Array('ble', 'ant');
        if(testMode)
        {
            testMode.initialize();
        }
        this.bindEvents();
    },
    addDeviceToConnectList: function(obj) {
        if (app.connectedDevices.indexOf(obj) === -1)
            app.connectedDevices.push(obj);
    },
    removeDeviceToConnectList: function(obj) {
        if (app.connectedDevices.indexOf(obj) > -1)
            app.connectedDevices.splice(obj);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        var i=0;
        for(i=0;app.plugins.length>i;i++)
        {
            logStatus('Plugin loading');
            loadPlugin(app.plugins[i]);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //app.scanStart();
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

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
        var result=new Array();
        var k=0;
        var i=0;
        for(var i=0;app.plugins.length>i;i++)
        {
            var j=0;
            var scanResults=eval(app.plugins[i]+".scanResult");
            for(j=0;scanResults.length>j;j++)
            {
                result[k]={
                        type:app.plugins[i],
                        device:scanResults[j]
                };
                k++;
            }
        }
        return result;
    },
    connectToDevice: function(type,address) {
        logStatus('APP: connecting to '+type+' on address '+address);
        //eval(type+'.connect('+address+')');
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
            app.removeDeviceToConnectList(object);
            logStatus('APP: connection failed to '+ obj.type +' - '+obj.name+' - '+ obj.address);
        }
    },
    connectResult: function() {
        return app.connectedDevices;
    },
    disconnectFromDevice: function(type,address) {
        
    },
    disconnectResult: function(obj) {
        
    },
    onSubscribeResults: function(obj){
        //var db = window.openDatabase("hrm", "1.0", "HRM DB", 100000000);
        var keys=new Array();
        var values=new Array();
        var i =0;
        for(key in obj)
        {
            keys[i]=key;
            values[i]=obj[key];
        }
        window.localStorage.setItem("key", "value");
        var keyname = window.localStorage.key(i);
        // keyname is now equal to "key"
        var value = window.localStorage.getItem("key");
        // value is now equal to "value"
        window.localStorage.removeItem("key");
        window.localStorage.setItem("key2", "value2");
        window.localStorage.clear();
        // localStorage is now empty
        logStatus('APP: received subscription result.');
        onSubscribeResults(obj);
        //db.executeSql('CREATE TABLE IF NOT EXISTS HRM_'+obj.type+' (id unique, '+keys.join()+')');
        //db.executeSql('INSERT INTO HRM_'+obj.type+' ('+keys.join()+') VALUES ("'+values.join('","')+'")');

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