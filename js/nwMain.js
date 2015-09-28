

var gui = require('nw.gui');
var nwNotify = require('nw-notify');
// Change nw-notify: index.js file as below:
// 153: config.lowerRightCorner.y = cur_screen.bounds.y + cur_screen.work_area.y + cur_screen.work_area.height - 10;
// 272: if(config.displayTime>0)...
var popupList = global.popupList||{};

var nwMain = (function(gui) {


	// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
	var os = require('os');
	var HOSTNAME = os.hostname();
	var ifaces = os.networkInterfaces();

	var IPS = [];

	Object.keys(ifaces).forEach(function (ifname) {
	  var alias = 0;

	  ifaces[ifname].forEach(function (iface) {
	    if ('IPv4' !== iface.family || iface.internal !== false) {
	      return;
	    }

	    if (alias >= 1) {
	      IPS.push({ifname:ifname, address:iface.address});
	    } else {
	      IPS.push({ifname:ifname, address:iface.address});
	    }
	  });
	});
	// remain only LAN IPS
	IPS = IPS.filter(function(v){ return v.address.indexOf('192.')>-1||v.address.indexOf('172.')>-1||v.address.indexOf('10.')>-1 });

	global.IPS = IPS.shift();
	global.HOSTNAME = HOSTNAME;

	if( Object.keys(popupList).length || !window.location.href.match(/tree\.html/) ) return;

	// some init data & number
	var TaskBarHeight = 30;
	var POP_WIDTH=300, POP_HEIGHT=300;

	// global var
	var isShow = true;
	var _tray;	//system _tray var
	var win;	//main window var

	// show/hide main window
	function showWin(toShow){
		if(typeof toShow=='undefined'){
			toShow = !isShow;
		}
		if(toShow){
			win.show();
			win.focus();
			isShow = true;
		} else{
			win.hide();
			isShow = false;
		}

	}


	function initNW(){

		// init main window
		win = gui.Window.get();
		//win.setPosition('center');
		win.on('close', function() {
		  this.hide(); // Pretend to be closed already
		  isShow = false;
		});

		win.on('new-win-policy', function(frame, url, policy) {
		  window.console.log(frame, url, policy);
		});



		if(!document.referrer){
			win.moveTo( Math.round(screen.width-window.outerWidth-40), Math.round(screen.height/2-window.outerHeight/2-TaskBarHeight-10) );
		}
		showWin(true);

		// init system _Tray
		_tray = new gui.Tray({ title: 'Tray', icon: 'res/tray.png' });
		// Give it a menu
		var menu = new gui.Menu();

		var menuItem1 = new gui.MenuItem({ label: '显示' });
		menuItem1.on('click',function(e){
			showWin(1);
		});

		var menuItem2 = new gui.MenuItem({ label: '退出' });
		menuItem2.on('click',function(e){
			gui.App.quit();
		});

		var menuItem3 = new gui.MenuItem({ label: '退出并注销' });
		menuItem3.on('click',function(e){
			Cookies.expire('userid');
			Cookies.expire('finger');
			$.post( host+'/exitApp', function(){
				gui.App.quit();
			});
		});

		menu.append(menuItem1);
		menu.append(menuItem3);
		menu.append(menuItem2);

		_tray.menu = menu;

		_tray.on('click', function(e){
			window.updateIcon();
			showWin();
		});



		nwNotify.setConfig({
		    //appIcon: nwNotify.getAppPath() + 'images/icon.png',
		    displayTime: 90000000,

			width: 300,
			height: 65,
			padding: 10,
			borderRadius: 5,
			defaultStyleContainer: {
				backgroundColor: '#f0f0f0',
				overflow: 'hidden',
				padding: '8px',
				border: '1px solid #CCC',
				fontFamily: 'Arial',
				fontSize: '12px',
				position: 'relative',
				lineHeight: '15px',
				padding: '10px 4px 10px 10px'
			},
			defaultStyleAppIcon: {
				overflow: 'hidden',
				float: 'left',
				height: '40px',
				width: '40px',
				marginRight: '10px',
			},
			defaultStyleImage: {
				overflow: 'hidden',
				float: 'right',
				height: '40px',
				width: '40px',
				marginLeft: '10px',
			},
			defaultStyleClose: {
				position: 'absolute',
				top: '1px',
				right: '3px',
				fontSize: '11px',
				color: '#111',
				cursor:'pointer'
			},
			defaultStyleText: {
				margin: 0,
				overflow: 'hidden',
				cursor: 'default'
			},
			defaultWindow: {
				'always-on-top': true,
				'visible-on-all-workspaces': true,
				'show_in_taskbar': process.platform == "darwin",
				show: false,
				frame: false,
				transparent: true,
				toolbar: false
			}


		});

		if(!gui.Screen.screens) gui.Screen.Init();
		var screens = gui.Screen.screens;
		// Use first screen only
		var cur_screen = screens[0];
		lowerRightCorner = {};
		lowerRightCorner.x = cur_screen.bounds.x + cur_screen.work_area.x + cur_screen.work_area.width;
		lowerRightCorner.y = cur_screen.bounds.y + cur_screen.work_area.y + cur_screen.work_area.height;

		nwNotify.setConfig( {lowerRightCorner: lowerRightCorner } );

		// If you want to use your own notification.html you use this method. Use it like this:
		//nwNotify.setTemplatePath(nwNotify.getAppPath() + 'notification.html');
		nwNotify.setTemplatePath( host + '/notification.html');


	}



	function showPop(url){
		var pop = gui.Window.open(url, {toolbar:false,frame:false,width:POP_WIDTH, height:POP_HEIGHT});
		pop.setShowInTaskbar(false);
		pop.resizeTo(POP_WIDTH,POP_HEIGHT);
		pop.moveTo( screen.width-POP_WIDTH-20, screen.height-POP_HEIGHT-TaskBarHeight-10 );
		pop.setAlwaysOnTop(true);
		pop.setResizable(false);
		return pop;
	}

	function _showReader(url){
		var pop = gui.Window.open(url, {position:'center', toolbar:false, frame:true,width:Math.max(screen.width*.8, 790), height:Math.max(screen.height*.8, 790)});
		pop.setShowInTaskbar(true);
		pop.setAlwaysOnTop(false);
		pop.setResizable(true);
		return pop;
	}


	// Reopen previous window when it's the same link
	function showReader(link, reload){

		var pop = popupList[link];

		if(pop){

			pop.show();
			pop.focus();
			if(reload) pop.window.location.reload();

		} else {

			pop = _showReader(link);

			popupList[link] = pop;

			pop.on('closed', function() {
				var link = findKey(popupList, pop);
				delete popupList[link];
			});
		}

	}


	function findKey (obj, val) {
		for(var i in obj){
			if(obj[i]==val) return i;
		}
	}


	function _nwOpenLink (link) {
		var pop = findWindowByUrl(link);

		if(pop){
			pop.show();
			pop.focus();
			return;
		} else {
			pop = nwMain.showReader(link);
		}

	}

	// findWindow by url, NOT WORK WHEN WINDOW CLOSE IT"S NOT CLEAR !!!!
	function findWindowByUrl (url) {
		var win;
		var list = global.__nwWindowsStore;
		for(var i in list) {
			var v = list[i];
			if(v.window.location.href == url){
				win = v;
			}
		};
		return win;
	}

	initNW();

	var exports = {};
	exports.mainWin = win;
	exports.tray = _tray;
	exports.initNW = initNW;
	exports.showPop = showPop;
	exports.showWin = showWin;
	exports.showReader = showReader;
	exports.findWindowByUrl = findWindowByUrl;
	global._nwMain = exports;
	global.popupList = popupList;

	return exports;
})(gui);






