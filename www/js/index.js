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
    var script = document.createElement("script");
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

function compressData(data) {
    return Base64.toBase64(RawDeflate.deflate(Base64.utob(data)));
}

function decompressData(data) {
    return  Base64.btou(RawDeflate.inflate(Base64.fromBase64(data)));
}
/**
 * This function is called when scan results are received.
 * You can use it to, perhaps display something, or call another function
 */
function onScanResult(){
    //temporarily, we set the innerHTML of the element with id scanResult
    var i=0;
    var results=app.scanResult();
    var html='';
    for(i=0;results.length>i;i++)
    {
        html+='<li onclick="if($(\'#connectToDevice_'+results[i].type+'_'+results[i].device.address+'\').attr(\'checked\')==true){$(\'#connectToDevice_'+results[i].type+'_'+results[i].device.address+'\').attr(\'checked\',false);}else{$(\'#connectToDevice_'+results[i].type+'_'+results[i].device.address+'\').attr(\'checked\',true);}'+
                '/*alert($(\'#connectToDevice_'+results[i].type+'_'+results[i].device.address+'\').attr(\'checked\'));*/">'+
                /*'<!-- drag handle -->'+
                '<span class="handle">'+
                    '<i class="fa fa-ellipsis-v"></i>'+
                    '<i class="fa fa-ellipsis-v"></i>'+
                '</span>'+*/
                '<input type="checkbox" '+(results[i].status.checked?'checked="checked"':'')+' id="connectToDevice_'+results[i].type+'_'+results[i].device.address+'" value="'+results[i].device.address+'" name="connectToDevice[]" onChange="connectChange(this, \''+results[i].type+'\',\''+results[i].device.address+'\')"/>'+
                '<span class="text">'+results[i].device.name+' - '+results[i].device.address+'</span>'+
                '<small class="label '+results[i].status.labelClass+'"><i class="fa fa-clock-o"></i> '+results[i].status.name+'</small>'+
                /*'<div class="tools">'+
                    '<i class="fa fa-connect"></i>'+
                    '<i class="fa fa-trash-o"></i>'+
                '</div>'+*/
            '</li>';
    }
    $('.deviceList').html(html);
}

function connectChange(element,type,address) {
    if(element.checked)
        connect(type, address);
    else
        disconnect(type, address);
}

function connect(type, address) {
    app.connectToDevice(type,address);
}

function onConnectResult(obj) {
    onScanResult();
}

function disconnect(type, address) {
    app.disconnectFromDevice(type,address);
}

function onDisconnectResult(type,address){
    onScanResult();
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
    
function flotChart() {
    var data = [], totalPoints = 100;
     if (data.length > 0)
                        data = data.slice(1);

                    // Do a random walk
                    while (data.length < totalPoints) {

                        var prev = data.length > 0 ? data[data.length - 1] : 50,
                                y = prev + Math.random() * 10 - 5;

                        if (y < 0) {
                            y = 0;
                        } else if (y > 100) {
                            y = 100;
                        }

                        data.push(y);
                    }

                    // Zip the generated y values with the x values
                    var res = [];
                    for (var i = 0; i < data.length; ++i) {
                        res.push([i, data[i]]);
                    }

                    return res;
}

var updateInterval = 500; //Fetch data ever x milliseconds
                var realtime = "on"; //If == to on then fetch data every x seconds. else stop fetching
                function update() {

                    interactive_plot.setData([getRandomData()]);

                    // Since the axes don't change, we don't need to call plot.setupGrid()
                    interactive_plot.draw();
                    if (realtime === "on")
                        setTimeout(update, updateInterval);
                }