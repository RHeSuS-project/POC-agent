var testMode = {
    minTimeForScan:10,
    maxtimeForScan:5000,
    minTimeForConnect:10,
    maxtimeForConnect:5000,
    minTimeForSubscriptionSend: 1000,
    maxTimeForSubscriptionSend: 3000,
    minSubscriptionResultValue: 20,
    maxSubscriptionResultValue: 500,
    subscriptionTimeOut:null,
    devices:new Array(
        {
            type: 'ble',
            device:{
                name: 'MIO GLOBAL',
                address: 'D5:46:C2:59:20:45'
            }
        },
        {
            type: 'ble',
            device:{
                name: 'TICR',
                address: 'A5:56:C4:B9:21:32'
            }
        }
    ),
    serviceUuids: new Array(
            '180d',
            '180a'
    ),
    charasteristicUuids: new Array(
            '2a37',
            '2a38'
    ),
    initialize: function() {
        app.scanStart=function(){
            if(getRandomInt(0, 4)>0)
            {
                setTimeout(app.onScanResult(),getRandomInt(testMode.minTimeForScan,testMode.maxtimeForScan));
            }
            logStatus('APP: Scan Started');
        };
        app.scanResult=function() {
            var result=new Array();
            var k=0;
            var i=0;

            var j=0;
            var connectResults=app.connectedDevices;
            for(j=0;connectResults.length>j;j++)
            {
                result[k]={
                    type:app.plugins[i],
                    device:connectResults[j],
                    status: app.deviceStatuses[1]
                };
                k++;
            }
            
            
            var scanResults= getRandomArrayElements(testMode.devices,getRandomInt(1, testMode.devices.length));
            var i=0;
            for(j=0;scanResults.length>j;j++)
            {
                var l=0;
                var sw=1;
                for(l=0;result.length>l;l++)
                {
                    if(result[l].type==scanResults[j].type)
                        if(result[l].device.address=scanResults[j].device.address)
                        {
                            sw=0;
                        }
                }
                if(sw)
                {
                    scanResults[j].status=app.deviceStatuses[0];
                    result[k]=scanResults[j];
                    k++;
                }
            }
            return result;
        };
        app.connectToDevice=function(type,address) {
            logStatus('APP: connecting to '+type+' on address '+address);
            if(getRandomInt(0, 4)>0)
            {
                var object = {
                    status:true,
                    type:type,
                    name:'MIO GLOBAL',
                    address:address
                };
                var timer = getRandomInt(testMode.minTimeForConnect,testMode.maxtimeForConnect);
                setTimeout(app.onConnectResult(object),timer);
                setTimeout(testMode.startSubscription(type,address),timer);
            }
            else
            {
                setTimeout(app.onConnectResult({status:false}),getRandomInt(testMode.minTimeForConnect,testMode.maxtimeForConnect));
            }
        };
    },
    startSubscription: function(type,address) {
        window.setTimeout('var type="'+type+'";var address="'+address+'";testMode.sendSubscriptionResult(type,address);',getRandomInt(testMode.minTimeForSubscriptionSend,testMode.maxTimeForSubscriptionSend));
    },
    sendSubscriptionResult: function(type,address) {
        if(app.deviceIsConnected(type,address))
        {
            logStatus('testMode: '+getRandomInt(testMode.minTimeForSubscriptionSend,testMode.maxTimeForSubscriptionSend));
            app.onSubscribeResults({
                'type':type, 
                'deviceAddress':address,
                serviceUuid:getRandomArrayElements(testMode.serviceUuids,1),
                characteristicUuid:getRandomArrayElements(testMode.charasteristicUuids,1),
                value:  getRandomInt(testMode.minSubscriptionResultValue, testMode.maxSubscriptionResultValue),
                datetime: Math.round(new Date().getTime())
            });
            //clearTimeout(testMode.subscriptionTimeOut);
            window.setTimeout('var type="'+type+'";var address="'+address+'";testMode.sendSubscriptionResult(type,address);',getRandomInt(testMode.minTimeForSubscriptionSend,testMode.maxTimeForSubscriptionSend));
        }
    }
};



function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}