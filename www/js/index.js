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
function logStatus(status)
{
    /*var parentElement = document.getElementById('hrm');
        var listeningElement = parentElement.querySelector('.listening');

        listeningElement.innerHTML+=status+'<br/>';*/
    console.log(status);
}

function dump(obj) {
    logStatus(JSON.parse(JSON.stringify(obj)));
}

function loadPlugin(name){
    var script = document.createElement("script")
    script.type = "text/javascript";
    script.src = 'plugin/'+name+'/js/'+name+'.js';
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                logStatus('plugin '+name+' loaded');
                eval(name+'.construct()');
            }
        };
    } else {  //Others
        script.onload = function(){
            logStatus('plugin '+name+' loaded');
            eval(name+'.construct()');
        };
    }
    document.getElementsByTagName("head")[0].appendChild(script);
}

/**
 * This function is called when scan results are received.
 * You can use it to, perhaps display something, or call another function
 */
function onScanResult(){
    //temporarily, we set the innerHTML of the element with id scanResult
    document.getElementById('ScanResults').innerHTML='<ul>';
    var i=0;
    var results=app.scanResult();
    //logStatus("size:"+results.length);
    for(i=0;results.length>i;i++)
    {
        document.getElementById('ScanResults').innerHTML+='<li><a onclick="app.connectToDevice(\''+results[i].type+'\',\''+results[i].device.address+'\')">'+results[i].device.name+" - "+results[i].device.address+"</a></li>";
    }
    document.getElementById('ScanResults').innerHTML+='</ul>';
}

function connect(type, address) {
    app.connectToDevice(type,address);
}

function disconnect(type, address) {
    app.disconnectFromDevice(type,address);
}

function onSubscribeResults(obj) {
    console.log('subscriptionObject:\n\
{\n\
type:'+obj.type+',\n\
deviceAddress:'+obj.deviceAddress+',\n\
serviceUuid:'+ obj.serviceUuid+',\n\
characteristicUuid:'+obj.characteristicUuid+',\n\
value:'+obj.value+',\n\
datetime:'+obj.datetime+'}');
}