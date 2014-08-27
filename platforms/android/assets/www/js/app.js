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
var app = {
    plugins: new Array('ble'/*, 'ant'*/),
    // Application Constructor
    initialize: function() {
        //app.plugins=new Array('ble', 'ant');
        this.bindEvents();
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
    }
};