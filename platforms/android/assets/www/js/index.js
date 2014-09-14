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
    //console.log(status);
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
    /*console.log('subscriptionObject:\n\
{\n\
type:'+obj.type+',\n\
deviceAddress:'+obj.deviceAddress+',\n\
serviceUuid:'+ obj.serviceUuid+',\n\
characteristicUuid:'+obj.characteristicUuid+',\n\
value:'+obj.value+',\n\
datetime:'+obj.datetime+'}');*/
}
    

                
function getSubscriptionDataForStatistics(obj,datapoints,timespan) {
    if(!timespan)
        timespan=3600000;
    if(!datapoints)
        datapoints=60;
    if(!obj)
        obj={};
    var value=0;
    var data=new Array();
    if(app.subscriptionDataForStatistics!==null)
        
    if(app.subscriptionDataForStatistics.length)
    {
        var device=app.subscriptionDataForStatistics[0];
        //logStatus('test4value='+value);
        var i=0;
        if(obj.deviceAddress)
        {
            for(i=0;app.subscriptionDataForStatistics.length>i;i++)
            {
                if(app.subscriptionDataForStatistics[i].address==obj.deviceAddress)
                {
                    device=app.subscriptionDataForStatistics[i];
                }
            }
        }
        
        if(device.services && device.services.length)
        {
            var service=device.services[0];
            
            //logStatus('test3value='+value);
            var i=0;
            if(obj.serviceUuid)
            {
                for(i=0;device.services.length>i;i++)
                {
                    if(device.services[i].serviceUuid==obj.serviceUuid)
                    {
                        service=device.services[i];
                    }
                }
            }
            
            if(service.charasteristics && service.charasteristics.length)
            {
                var charasteristic=service.charasteristics[0];
            
                console.log('charasteristicUuid='+obj.charasteristicUuid);
                var i=0;
                if(obj.charasteristicUuid)
                {
                    for(i=0;service.charasteristics.length>i;i++)
                    {
                        if(service.charasteristics[i].charasteristicUuid==obj.charasteristicUuid)
                        {
                            charasteristic=service.charasteristics[i];
                        }
                    }
                }
                
                if(charasteristic.subscriptionData && charasteristic.subscriptionData.length)
                {
                    logStatus('testlength='+charasteristic.subscriptionData.length);
                    var currentDatetime=(Math.round(new Date().getTime())-timespan);
                    
                    //value=charasteristic.subscriptionData[0].value;
                    var datetime=charasteristic.subscriptionData[0].datetime;
                    
                    while(datetime>=currentDatetime)
                    {
                        data[data.length]=value;
                        currentDatetime=currentDatetime+(timespan/datapoints);
                    }
                    
                    var d=0;
                    for(d=0;charasteristic.subscriptionData.length>d;d++)
                    {
                        if(charasteristic.subscriptionData[d].datetime>=currentDatetime)
                        {
                            value=charasteristic.subscriptionData[d].value;
                            datetime=charasteristic.subscriptionData[d].datetime;
                        }
                        while(datetime>=currentDatetime)
                        {
                            data[data.length]=value;
                            currentDatetime=currentDatetime+(timespan/datapoints);
                        }
                    }
                }
            }
        }
    }
    while(data.length<datapoints)
    {
        data[data.length]=value;
    }
    return data;
}

function getLastsubscriptionValue(obj)
{
    if(!obj)
        obj={};
    var value=0;
    if(app.subscriptionDataForStatistics!==null)
    if(app.subscriptionDataForStatistics.length)
    {
        var device=app.subscriptionDataForStatistics[0];
        //logStatus('test4value='+value);
        var i=0;
        if(obj.deviceAddress)
        {
            for(i=0;app.subscriptionDataForStatistics.length>i;i++)
            {
                if(app.subscriptionDataForStatistics[i].address==obj.deviceAddress)
                {
                    device=app.subscriptionDataForStatistics[i];
                }
            }
        }
        
        if(device.services && device.services.length)
        {
            var service=device.services[0];
            
            //logStatus('test3value='+value);
            var i=0;
            if(obj.serviceUuid)
            {
                for(i=0;device.services.length>i;i++)
                {
                    if(device.services[i].serviceUuid==obj.serviceUuid)
                    {
                        service=device.services[i];
                    }
                }
            }
            
            if(service.charasteristics && service.charasteristics.length)
            {
                var charasteristic=service.charasteristics[0];
            
                //logStatus('test2value='+value);
                var i=0;
                if(obj.charasteristicUuid)
                {
                    for(i=0;service.charasteristics.length>i;i++)
                    {
                        if(service.charasteristics[i].charasteristicUuid==obj.charasteristicUuid)
                        {
                            charasteristic=service.charasteristics[i];
                        }
                    }
                }
                
                if(charasteristic.subscriptionData && charasteristic.subscriptionData.length)
                {
                    return charasteristic.subscriptionData[charasteristic.subscriptionData.length-1].value;
                }
            }
        }
    }
    
    return value;
}

function connectToAllDevices() {
    var results=app.scanResult();
    for(var i=0;results.length>i;i++)
    {
        connect(results[i].type,results[i].device.address);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}