
//phantomjs module
var proc = require("child_process");
var sys = require("system");
var fs = require('fs');
var server = require('webserver').create();
var page = require("webpage").create();

var args = sys.args;
args.forEach(function(arg, i) {
	// console.log(i + ': ' + arg);
});

if(args.length<3) phantom.exit();

function paramToJson(str) {
    return str.split('&').reduce(function (params, param) {
        var paramSplit = param.split('=').map(function (value) {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        });
        params[paramSplit[0]] = paramSplit[1];
        return params;
    }, {});
}

var url, pageWidth, pageHeight;
var _MSGSIGN = "_PHANTOMDATA";
var RES_TIMEOUT = 10000;


url = args[1] || '';
pageWidth = ~~args[2] || 1050;
pageHeight = ~~args[3] || 1800;

pageWidth+=40;
pageHeight+=60;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36';
page.settings.resourceTimeout = RES_TIMEOUT;

page.viewportSize = { width: pageWidth, height: pageHeight };


page.onResourceError = function(resErr) {
	if( /Operation canceled/i.test(resErr.errorString) ) return;
	console.error('Unable to load resource (#' + resErr.id + 'URL:' + resErr.url + ')');
	console.error('Error code: ' + resErr.errorCode + '. Description: ' + resErr.errorString);
	//Error code: 99. Description: Connection timed out

	if(resErr.url==url){	//The main url, when timeout or error

	}
};
page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};


page.onConsoleMessage=function(data){

	if( ( new RegExp ("_PageRenderFinished") ).test(data) ){

		page.evaluate(function() {
			$('.botmenu').hide();
		});

		var filename = url.split('/').pop();

		setTimeout(function () {
		  	page.render('uploads/'+ filename +'.jpg', {format: 'jpeg', quality: '70'} );
		  	phantom.exit();
		}, 1000);
	}
}


page.open('http://1111hui.com/pdf/webpdf/viewer.html#file='+ url +'&isTemplate=1&debug=1', function() {
	page.evaluate(function() {
		$("head").append('<link rel="stylesheet" type="text/css" href="css/font-awesome.css" />'); 
		var scrolltop = $('#viewerContainer').scrollTop(); 
		$('#viewer .page').each(function(i){ 
			var T = $(this).position().top+ scrolltop; 
			setTimeout(function  () {
				$('#viewerContainer').scrollTop( T );
			}, 100*i );
			
		} );

	});
});

