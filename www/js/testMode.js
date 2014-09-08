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
            return getRandomArrayElements(testMode.devices,getRandomInt(1, testMode.devices.length));
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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