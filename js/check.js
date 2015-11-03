
//{BUILD_VER}

//******* Common Function & Variable part **************

// to make postJSON request, not use $post since it's become all string!
// http://stackoverflow.com/questions/22236555/accessing-json-string-parsed-by-nodes-express-bodyparser
function $post (url, data, callback) {
  if (arguments.length == 2) { // if only two arguments were supplied
    if ( $.type(data)=='function' ) {
      callback = data;
      data = {};
    }
  }

  return $.ajax({
    url: url,
    type: "POST",
    crossDomain: true,
    data: JSON.stringify(data),
    contentType : 'application/json',
    // dataType: "json", // response type
    success:callback
  });
}
function safeEval (str) {
  var ret;
  try{
    ret = JSON.parse(str);
  }catch(e){
    ret = str;
  }
  return /object/i.test(typeof ret) ? (ret===null?null:str) : ret;
}



Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};


function searchToObject(search) {
  return search.substring(1).split("&").reduce(function(result, value) {
    var parts = value.split('=');
    if (parts[0]) result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    return result;
  }, {});
}

var urlQuery = searchToObject( window.location.hash );

var isAndroid = /(android)/i.test(navigator.userAgent);
var isWeiXin = navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
var isiOS = /iPhone/i.test(navigator.userAgent) || /iPod/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent);
var isMobile = isAndroid||isWeiXin||isiOS;

var clickE = isMobile?'ontouchstart':'click';
var downE = isMobile?'ontouchstart':'mousedown';

window.host = "http://1111hui.com:88";
window.FILE_HOST = 'http://7xkeim.com1.z0.glb.clouddn.com/';
window.VIEWER_URL = 'http://1111hui.com/pdf/webpdf/viewer.html';

var rootPerson = {};


// ************ Check if we are in WX env

var wxUserInfo;
var DEBUG= safeEval(urlQuery.debug||0);

if(
window.navigator.userAgent == "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36" || window.navigator.userAgent == "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36" || window.navigator.userAgent == "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36"
	) DEBUG=1;

if(DEBUG) rootPerson = {userid: 'yangjiming', name:"杨吉明", depart:"行政", isAdmin:true };
if(isWeiXin)
if(!DEBUG)
{
	wxUserInfo = Cookies.get( 'wxUserInfo' );

	var WX_JUMP_URL =  window.location.href.replace('http://1111hui.com/pdf/','') ;
	localStorage.setItem( 'WX_JUMP_URL', WX_JUMP_URL );

	if( !wxUserInfo ){
		window.location.replace( 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx59d46493c123d365&redirect_uri=http%3A%2F%2F1111hui.com%2F/pdf/getUserID.php&response_type=code&scope=snsapi_base&state=#wechat_redirect');
	} else {
		wxUserInfo = JSON.parse(wxUserInfo);
	}
}else {
	wxUserInfo={};
	wxUserInfo.UserId = 'yangjiming';
}


// ************** Check if we are in NW.JS env

var isNWJS = typeof global !='undefined';
var iconInter=-1;
var nwMainWin = null;
function updateIcon () {
	if( Object.keys(global.msgQueue).length ) {
		if(iconInter!==-1) return;
		var i =0;
		iconInter = setInterval(function  () {
			global._nwMain.tray.icon = i++%2 ? 'res/tray-new.png' : 'res/tray-empty.png';
		}, 500);

	} else {
		clearInterval(iconInter);
		iconInter = -1;
		global._nwMain.tray.icon =  'res/tray.png';
	}

}

function toggleDevTools (){
	if(!nwMainWin) return;
	if( !nwMainWin.isDevToolsOpen() ){
		nwMainWin.showDevTools();
	} else {
		nwMainWin.closeDevTools();
	}
}

function showMainWindow (){
	if(!nwMainWin) return;
	nwMainWin.show();
	nwMainWin.focus();
}


var updateInterval;
function updateClientHost(){

	if(isNWJS) {
		console.log(global, rootPerson.userid );
		clearInterval(updateInterval);
		updateInterval = setInterval(function(){
			if(global.updateHostName && rootPerson.userid) {
				global.updateHostName();
				clearInterval(updateInterval);
			}
		}, 300);
	}

}


if(isNWJS) {
	// require('nw.gui').Window.get().showDevTools();

	var el = document.createElement('script');
	el.async = false;
	el.src = './js/nwMain.js?'+Math.random();
	el.type = 'text/javascript';

	(document.getElementsByTagName('HEAD')[0]||document.body).appendChild(el);

	el.onload =function  () {
		global.msgQueue = global.msgQueue || {};
		updateIcon();
		nwMainWin = global._nwMain.mainWin;
		updateClientHost();
	};

	var nwHookLink = function () {
		$(document).on('click','a', function  (e) {
			var link = e.target.href;
			if(!link) return e.preventDefault();

			if( link.match(/viewer\.html/) ){
				e.preventDefault();
				global._nwMain.showReader(link);
			}
		});
	};

}




ISNW = /nw$/.test(window.navigator.userAgent);
COMPANY_NAME = 'lianrun';



PATHNAME = window.location.href.split('?').shift().split('#').shift();


// if( window.localStorage['basket-ver-tree.html'] != BASKETVER ) alert(basket.clear());

// if( !ISNW && typeof basket.get('js/ws.js')!=='object') alert('首次运行，确定后将进行缓存');


/*
*/

if(typeof BUILD_VER!='undefined'){

basket.require(
//<<--{ url: 'build/s2.js', unique:'%random%' }--
{ url: 'js/fingerprint2.min.js' },
{ url: 'js/reconnecting-websocket.js' },
{ url: 'js/ws.js' },
{ url: 'js/jquery.js' }
//-->>

).then(function() {

	basket.require(

	//<<--{ url: 'build/s3.js', unique:'%random%' }--
	{ url: 'js/jquery.ztree.all-3.5.js', unique:'122' },
	{ url: 'js/jquery.ztree.exhide-3.5.js' },

	{ url: 'js/dialog.build.js' },
	{ url: 'js/draggable.js' },
	{ url: 'js/noframework.waypoints.min.js' },
	{ url: 'js/selectivity-full.js' },
	{ url: 'js/vendor/jquery.ui.widget.js' },
	{ url: 'js/jquery.iframe-transport.js' },
	{ url: 'js/jquery.fileupload.js' },
	{ url: 'js/jquery.ba-throttle-debounce.min.js' }
	//-->>

	).then(function() {

		INIT();

	});


});

} else {

	window.addEventListener("load", function(){ INIT() });

}


function onWSReady(){
	console.log('ws opened');
	if( typeof ws=='object' && ws.readyState==1 && rootPerson.userid) ws.send( JSON.stringify({ type:'clientConnected', clientName: rootPerson.userid , clientRole:'client', from:isMobile?'mobile':'pc', pcName:1 }) );
	if(typeof updateClientHost=='function') updateClientHost();
}


