
var wsQueue={};
var ws;
function connectToWS(){
	if(ws) ws.close();
	ws = new ReconnectingWebSocket('ws://1111hui.com:3000', null, {debug:false, reconnectInterval:300 });
	ws.onopen = function (e) {
		ws.onmessage = function (e) {		
			if(e.data[0]!="{")return;
	        var d=JSON.parse(e.data);
	        var callObj= wsQueue[d.msgid];
	        if(callObj) {
	            callObj[1].call(callObj[0], d.result);
	            delete wsQueue[d.msgid];
	        }
		}
		ws.onclose = function (code, reason, bClean) {
			console.log("ws error: ", code, reason, bClean);
		}
		console.log('client ws ready');
	}
}
connectToWS();


function wsend(data, that, callback){
	if(!ws || ws.readyState!=1) return;
	var json = {data:data};
	if(callback){
	    json.msgid = +new Date() + Math.random();
	    wsQueue[json.msgid] = [that, callback];
	}


	ws.send(JSON.stringify(json));
	return json.msgid;
}



