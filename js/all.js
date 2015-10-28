

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
BASKETVER = '1.2';

// if( window.localStorage['basket-ver-tree.html'] != BASKETVER ) alert(basket.clear());

// if( !ISNW && typeof basket.get('js/ws.js')!=='object') alert('首次运行，确定后将进行缓存');

basket.require(

{ url: 'js/fingerprint2.min.js' },
{ url: 'js/reconnecting-websocket.js' },
{ url: 'js/ws.js' },
{ url: 'js/jquery.js' }


).then(function() {

	basket.require(

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

	).then(function() {
		window.localStorage['basket-ver-tree.html'] = BASKETVER;

		INIT();

	});


});

function INIT(){
// start the INITPAGE

		window.treeObj = null;
		window.treeObj1 = null;
		window.treeObj2 = null;
		window.treeObj3 = null;
		var treeObjTemplate = null;
		var treeObjPrint = null;

		window.tree1WayPoint =null;
		window.tree2WayPoint =null;
		window.tree3WayPoint =null;


if(isNWJS) nwHookLink();

var isQT = false;
var root=[];
var fileData=[];
var fileKeys=null;
var addCount = 1;
var DragParentNode = null;
var sendRoot = null;
var receiveRoot = null;

window.savedSignData = [];

function eve (el, type){
    el= ('get' in el)? el.get(0) : el ;	//(typeof el['jquery']!='undefined')
    if(typeof type=='undefined') type='click';
    var click = document.createEvent("MouseEvents");
    click.initMouseEvent(type, true, true, window,
                         0, 0, 0, 0, 0, false, false, false, false, 0, null);
    button = el;
    button.dispatchEvent(click);
    button.focus();
}
function simulateKeyPress (character) {
    jQuery.event.trigger({ type : 'keypress', which : character.charCodeAt(0) });
}

// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
function humanFileSize(bytes, si) {
	if(!si) si = true;
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si ? ['KB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}


function sortCompanyNode (data) {
  data = data.sort(function(a,b){

    if(a.pId != b.pId)
      return a.pId-b.pId;
    var apid = a.parentid===undefined? -1 : a.parentid;
    var bpid = b.parentid===undefined? -1 : b.parentid;
    return apid-bpid;

  });


  var depart = data.filter(function(v){ return v.pId>=0 && v.parentid>=0; });
  var opData = [];
  depart.forEach(function(v){
    opData.push(v);
    opData = opData.concat(
      data.filter(function(x){ return x.pId==v.id && x.parentid===undefined; })
      .sort(function(a,b){return a.userid>b.userid } )
     );
  });
  return opData;
}

function viewTemplateImage (imgFile) {
	if(imgFile) {
		previewImage( FILE_HOST+imgFile );
	} else {

	}
}

function applyTemplatePre () {
	var sel = treeObjTemplate.getSelectedNodes().shift();
	if(!sel) return;

	function finishTemplate(){

		var totalSign = $('.steps').length;
		if(!totalSign) return;

		var orders = $('.steps[data-order]').map(function(v){
			return $(this).data('order');
		})
		.sort(function(a,b){ return a-b});

		var signLength = $('.steps[data-person]').length;
		var mainLength = $('.steps[data-person]').filter(function(){
			return $(this).data('order') < orders[orders.length-1];
		}).filter('[data-main-person]').length;

		if(signLength < totalSign || mainLength<totalSign-1  ) {
			$('#confirm .info').html('请指定每步人员，并变红(签署人)，最后一步可不变红');
			return false;
		}

		savedSignData.forEach(function  (v) {
			delete v.realPerson;
			delete v.realMainPerson;
		});


		applyTemplate();

		return false;

	}


	$post( host + '/getSavedSign', { file:sel.key, person:rootPerson.userid }, function(data){
	  	if(!data) return alert('无法获取流程信息');

  	    savedSignData = data.signIDS;

	    if(!data || !companyNode) return;

	    if(!savedSignData.length) return;

	    var str = '<h2 style="text-align:left;">确认流程:';
	    str += '<span class="viewTemplateImage"><a href="javascript:viewTemplateImage(&quot;'+ (sel.templateImage||'') +'&quot;);">'+sel.title+'</a></span>';
	    str += '</h2><div class="stepsCon">';

	    savedSignData.forEach(function  (v, i) {
	    	var person = v&&v.realPerson ? ' data-person="'+ v.realPerson.map(function(x){return x.userid}).join('|') +'" ' : '';
	    	var mainPerson = v&&v.realMainPerson ? 'data-main-person="'+v.realMainPerson.userid+'"' : '';
	    	str+= '<div class="steps" data-idx="'+i+'" data-order="'+v.order+'" '+ person +' '+ mainPerson +'><div class="stepTitle"><i class="fa fa-circle"></i><p>'+v.order+'</p></div><div class="selStep step'+v.order+'"></div></div>'
	    });
	    str += '</div>';
	    str += '<div class="info"></div>';

	    window.confirm(str, function  (ok) {
	    	if(ok) return finishTemplate();
	    });

	    var html = [
	    	{id:'_self', text:'员工本人'},
	    	{id:'_parent', text:'部门主管'},
	    	{id:'_boss', text:'公司总管'}
	    ];
	    html=[];

	    var preObj = html;
	    companyNode.forEach(function(v){
	      if(v.parentid>=0){
	        var obj = {text:v.name, children:[]};
	        html.push(obj);
	        preObj = obj.children;
	      } else {
	        preObj.push({id:v.userid, depart:v.depart, text:v.name });
	      }
	    });


	    function matcher (item, term) {

	          var result = null;
	          if (item.text.indexOf(term) > -1 || item.id&&item.id.indexOf(term)>-1 ) {
	              result = item;
	          } else if (item.children) {
	              var matchingChildren = item.children.map(function(child) {
	                  return matcher(child, term);
	              }).filter(function(child) {
	                  return !!child;
	              });
	              if (matchingChildren.length) {
	                  result = { id: item.id, text: item.text, children: matchingChildren };
	              }
	          }
	          return result;
	      }

    	$('.selStep').selectivity({
	      allowClear: true,
	      language: "zh-CN",
	      multiple:true,
	      items: html,
	      placeholder:'选择流程人..',
	      positionDropdown: function  ($dropEl, $selEl) {
	        $dropEl.css({top:'auto'});
	      },
	      matcher: matcher

	    });

    	savedSignData.forEach(function  (v, i) {
    		var stepEl = $('.step'+v.order);
    		var targetEl = stepEl.parent();
    		v.person = $(targetEl).data('person')||'';
    		v.mainPerson = $(targetEl).data('main-person')||'';
    		var person = (v.person).split('|');
    		var mainPerson = v.mainPerson;

    		if(person.length) stepEl.selectivity('val', [].concat(person) );
    		else stepEl.selectivity('val', '');

    		if(mainPerson){
    			stepEl.selectivity('_highlightItem', mainPerson)
    		}else{
    			stepEl.selectivity('_highlightItem', null)
    		}

    	});

    	$('.selStep').on("selectivity-opening", function (e) {
    		hideSelStuff();
    	});

    	$('.selStep').on('click', '.selectivity-multiple-selected-item', function (e) {

    		var targetEl = $(this).closest('.steps');
    	  	var v = savedSignData[ targetEl.data('idx') ];

    		var itemID = $(this).data('item-id');

    		$(targetEl).attr('data-main-person', itemID );
    	  	v.mainPerson = itemID;

    	  	setTimeout(function  () {
    	  		$('.selStep').selectivity('close');
    	  	},0);


    	});

    	$('#confirm').off('mousedown').on('mousedown', function  (e) {
    		if( !$(e.target).closest('p.button').length ){
    			setTimeout( function(){
    				$('#confirm .info').html('');
    			}, 0);
    		}

    		if( $(e.target).closest('.selectivity-dropdown').length ) return;
    		hideSelStuff();
    	});

    	$('.selStep').on("change", function (e) {

    	  var targetEl = $(this).parent();
    	  e.value = e.value.filter(function(v){ return v!=''});
    	  var val = e.value.join('|');

    	  var idx = targetEl.data('idx');
    	  var v = savedSignData[idx];

    	  if(val){
    	    $(targetEl).attr('data-person', val );
    	    if(v) v.person = val;
    	  }else{
    	    $(targetEl).removeAttr('data-person' );
    	    if(v) delete v.person;
    	  }

    	  if( e.value.indexOf(targetEl.data('main-person'))==-1 ){
    	  	targetEl.removeAttr('data-main-person');
    	    delete v.mainPerson;
    	  }

    	});

    	$('.selStep').on("selectivity-open", function (e) {

    	  var val = $('.selStep').selectivity('val');
    	  $('.selectivity-result-item').removeClass('highlight');
    	  $('.selectivity-result-item[data-item-id="' + val + '"]').addClass('highlight');

    	});


	});

}

function hideSelStuff (order) {
	var orderStr = order? ':eq('+order+')' : '';
  	if( $('.selectivity-dropdown'+orderStr).length ) $('.selStep'+orderStr).selectivity('close');
}

function applyTemplate () {


	var sel = treeObjTemplate.getSelectedNodes().shift();
	if(!sel) return;

	var info = getFileKeys(sel);

	var path = getPath(getSelectFiles().shift());

	if(!path) path='/';

	hideDialog();

	$('.bg_mask').show();

	$post(host+'/applyTemplate2', { info: JSON.stringify(info), userid: rootPerson.userid, path:path, signIDS:savedSignData }, function  (data) {
		$('.bg_mask').hide();
		hideTemplateCon();
	});


	return;

/*
	$post(host+'/applyTemplate', { info: JSON.stringify(info), userid: rootPerson.userid, path:path }, function  (data) {
		$('.bg_mask').hide();
		hideTemplateCon();
		reloadTree1(data);

	});
*/


}


//******* Websocket part **************


	ws.addEventListener('open', function(){
		console.log('ws opened');
		ws.send( JSON.stringify({ type:'clientConnected', clientName: rootPerson.userid , clientRole:'client', from:isMobile?'mobile':'pc', pcName:1 }) );
		updateClientHost();

	});

	ws.addEventListener('message', function(data){
		if( !data || !data.data || !data.data.match(/^\s*{/) ) return;
		var msg = JSON.parse(data.data);

		switch(msg.role){

			case 'shareMsg':

				// Update Message window, when the window is open
				appendShareMsg(msg);


				if (typeof nwNotify!='undefined') {

					var msgObj =  {
							title:'有消息',
							text: msg.text.content,
							onClickFunc: function(event) {
							},
							onCloseFunc: function(event) {
								//event.closeNotification();
								console.log('close', event.id);
								delete global.msgQueue[event.id];
								updateIcon();
							},
						};
					var id = nwNotify.notify(msgObj);
					global.msgQueue[id] = msgObj;
					console.log('open', id);
					updateIcon();
				}


				if( $('.msg_wrap').is(':visible') ) {

				} else {

				}

				break;

			case 'upfile':
				if(msg.person == rootPerson.userid ) init(msg, true, true);
				break;

			case 'share':
				if( msg.data && msg.data.isSign && isNWJS ) {
					var viewerUrl1 = VIEWER_URL + '#file=' + FILE_HOST+msg.key + '&shareID=' + msg.data.shareID + '&isSign=1';
					var viewerUrl2 = VIEWER_URL + '#file=' + FILE_HOST+ encodeURIComponent(msg.key) + '&shareID=' + msg.data.shareID + '&isSign=1';
					var win = global.popupList[viewerUrl1] || global.popupList[viewerUrl2];

					//if(win && win.window) return win.window.location.reload();
				}

				if(msg.key && msg.shareID){

					msg.name = msg.title;

					var t = treeObj2.getNodesByFilter(function  (v) {
						return v.shareID == msg.shareID
					}).shift();
					if(t){
						treeObj2.addNodes(t, -1, msg);
					}

					t = treeObj3.getNodesByFilter(function  (v) {
						return v.shareID == msg.shareID
					}).shift();
					if(t){
						treeObj3.addNodes(t, -1, msg);
					}

					return;
				}

				if(msg.files && msg.shareID){

					var jump = function(){
						var sel = treeObj.getNodesByParam('shareID',msg.shareID);
						treeObj.expandNode( sel[0], true );
						sel = sel.pop();
						treeObj.selectNode(sel);
						updateMenu(sel);
						window.location.hash = 'path=' + getPath(sel)+'&shareID='+getShareID(sel);

						if(msg.isSign && msg.flowSteps[0].person==rootPerson.userid){
							openLink( makeViewURL(sel) );
						}
					}


					if( msg.fromPerson.filter(function(v){return v.userid==rootPerson.userid}).length ){
						initShareFrom( [].concat(msg), false, true,true);
						setTimeout(function(){
							showTab(1);
							jump();
						},100)



					} else {
						initShareTo( [].concat(msg), false, true, true);
						setTimeout(function(){
							showTab(2);
							jump();
						},100)
					}


					return;
				}


				if(typeof msg.isFinish!='undefined') {
					return reloadTree2();
				}

				reloadTree2( msg.files ? msg.files[0].key : msg.key , msg.shareID, msg.showTab||false, msg.openShare, msg.openMessage);
				break;

			case 'addToShare':

				reloadTree2(msg.key, msg.shareID, msg.showTab||false, msg.openShare, msg.openMessage);
				break;

			case 'errMsg':
				alert(msg.message);
				break;
		}

	});
	setInterval(function(){
		if(ws&&ws.readyState==1&&rootPerson.userid) ws.send( JSON.stringify({ type:'clientConnected', clientName: rootPerson.userid , clientRole:'client', from:isMobile?'mobile':'pc', pcName:1 }) );
	}, 30000);



		var zNodes, zNodes2, zNodes3, zNodesTemplate, zNodesPrint;

		var rMenu;

		var log, className = "dark", curDragNodes, autoExpandNode;
		var setting = {

			view: {

				selectedMulti: true,
				dblClickExpand: false,
				expandSpeed: "",
				txtSelectedEnable:true,
				showLine:false,
				nameIsHTML:true,
				fontCss: getFont,
				addDiyDom: 0 ? null : addDiyDom ,
			},
			data: {
				keep:{
					parent:true,
					leaf:true
				},
				key: {
					title:"title"
				},
				simpleData: {
					enable: false
				}
			},
			edit: {
				drag: {
					autoExpandTrigger: true,
					prev: dropPrev,
					inner: dropInner,
					next: dropNext
				},
				enable: true,
				showRemoveBtn: false,
				showRenameBtn: false
			},
			callback: {
				beforeClick: beforeClick,
				onClick: onClick,
				beforeDblClick: beforeDblClick,
				onDblClick: onDblClick,
				onRightClick: OnRightClick,

				beforeDrag: beforeDrag,
				beforeDrop: beforeDrop,
				beforeDragOpen: beforeDragOpen,
				onDrag: onDrag,
				onDrop: onDrop,
				onExpand: onExpand,
				beforeRename: beforeRename,
				onRename:onRename,
			}
		};


function addDiyDom(treeId, treeNode) {
	var $li = $("#" + treeNode.tId);
	var aObj = $("#" + treeNode.tId + "_a");
	if ($("#diyBtn_"+treeNode.id).length>0 || !treeNode.fsize) return;

	var shareID = getShareID(treeNode)||'';

	var date = new Date(treeNode.date);
	dateStr = formatDate( (  (new Date()).getFullYear() - date.getFullYear()  ?'yyyy-':'')+'mm-dd hh:ii', date );

	var info = $('<a href="#" class="glyphicon glyphicon-download-alt downloadIcon" aria-hidden="true"></a><div class="fileInfo" id="info_'+treeNode.tId +'"><p>'+ humanFileSize(treeNode.fsize) +'</p><span class="date">'+ dateStr +'</span></div>');
	$li.append(info).addClass('clearfix withInfo');

	// if( treeNode.key.match(regex_image)  )   treeNode.iconSkin='image' //aObj.find('.ico_docu').addClass('image');
	// if( treeNode.key.match(regex_can_be_convert)  )   treeNode.iconSkin='canBeConverted'; //aObj.find('.ico_docu').addClass('canBeConverted');
	// if( treeNode.key.match( /\.pdf$/i )  )  treeNode.iconSkin='pdf'; //aObj.find('.ico_docu').addClass('pdf');

	setTimeout(function(){
		var downBtn = info.eq(0);
		var ext = treeNode.key.split('.').pop();
		var filename = treeNode.name.match( new RegExp('\\.'+ext+'$', 'i') ) ? treeNode.name : treeNode.name+'.'+ext;

	    var downloadUrl2 = host+'/downloadFile2/'+ treeNode.key.split('/').pop() +'?key='+ treeNode.key +'&shareID='+shareID +'&person='+rootPerson.userid+'&rename='+ encodeURIComponent(filename);
	    var downloadUrl = host+'/downloadFile/'+ encodeURIComponent(filename) +'?key='+ treeNode.key +'&shareID='+shareID +'&person='+rootPerson.userid+'&rename='+ encodeURIComponent(filename);

	    downloadUrl = FILE_HOST + treeNode.key;

		var srcFile = treeNode.key.match('\.pdf$') ? downloadUrl2 : downloadUrl ;

		if(isWeiXin) {
			downBtn.removeAttr('download').attr( 'href', 'http://1111hui.com/pdf/getSrcFile.php?filename='+ filename +'&url='+ encodeURIComponent(srcFile)  );
		}else {
			downBtn.attr( 'href', srcFile );
			downBtn.attr( 'download', filename );
		}

		downBtn.click(function(e){
			if( $(this).hasClass('downloading') ) return e.preventDefault();
			var self = this;
			$(this).addClass('downloading');
			setTimeout(function() {
				$(self).removeClass('downloading');
			},10000);
		});
	},0);
}

//FOR QT, but no use, we changed to NW.js
// setTimeout(function  () {
// 	//document.title = JSON.stringify(zNodes00);
// $('h1').click(function  (i,e) {
// 	document.title = "";
// 	document.title = JSON.stringify({action:"openPDF", url:"http://1111hui.com/pdf/web/viewer.html" });
// });
// }, 1000);


var escapeRe = function(str) {
    var re = (str+'').replace(/[.?*+^$[\]\\/(){}|-]/g, "\\$&");
    return re;

/*
    // replace unicode Then
    var ret = '';
    for(var i=0;i<re.length;i++) {
    	ret += /[\x00-\x7F]/.test(re[i])?re[i]: '\\u'+re[i].charCodeAt(0).toString(16);
    }
    return ret;
*/

};


function getFont(treeId, node) {
	return node.font ? node.font : {};
}

function pathToObj (v, isOnTop, isOpen) {
	var path = v.path;
	var file = v.key;
	var title = v.title;
	var str = path.split('/');
	var p = root;
	//if(!file) str.splice(str.length-2, 2);
	var name;
	loop1:
	for(var i=0; i<str.length; i++){
		name = str[i];
		if(!name) continue;
		for(var j=0; j<p.length; j++){
			if( p[j].name == name ){
				// found exist folder
				if(isOpen) p[j].open = true;
				if( !p[j].children ) p[j].children = [];
				p = p[j].children;
				continue loop1;
			}
		}
		if(i==str.length-2 && !file ){
			//it's folder Leaf node
			var folder = $.extend( { person:rootPerson.userid, name:name, oldName:name, oldPath:v.path, isParent:true}, v);
			p.push(folder);

		}else{
			//it's normal folder
			p.push( {name:getSubStr(str[i], 50), title: str[i], open:!!isOpen, children:[]} );
		}
		p = p[p.length-1].children;
	}
	name = title||file||"";
	//If we have key it's file LEAF
	if(file && p){
		var treeNode = {name:name, oldName:name, oldPath:v.path};
		if( file.match(regex_image)  )   treeNode.iconSkin='image';
		if( file.match(regex_can_be_convert)  )   treeNode.iconSkin='canBeConverted';
		if( file.match( /\.pdf$/i )  )  treeNode.iconSkin='pdf';

		if(!isOnTop) p.push( $.extend( treeNode, v) );
		else p.unshift( $.extend( treeNode, v) );
	}

	//else we are creating empty folder LEAF

}

function all () {
	console.log( treeObj.getNodesByFilter(function(){return true}) )
}


var formatDate = function(format, time) {
	var d = time ? new Date(time): new Date();
	format = format||'';
    var yyyy = d.getFullYear().toString();
    format = format.replace(/yyyy/g, yyyy)
    var mm = (d.getMonth()+1).toString();
    format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
    var dd  = d.getDate().toString();
    format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
    var hh = d.getHours().toString();
    format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
    var ii = d.getMinutes().toString();
    format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
    var ss  = d.getSeconds().toString();
    format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
    return format;
};


function prettyDate(time){
	var date = time ? new Date(time): new Date(),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
	var year_diff = (new Date()).getFullYear() - date.getFullYear();

	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 2 )
		return formatDate( (year_diff?'yyyy-':'')+'mm-dd hh:ii', time );

	return day_diff == 0 && (
			diff < 60 && "刚刚" ||
			diff < 120 && "1分钟前" ||
			diff < 3600 && Math.floor( diff / 60 ) + "分钟前" ||
			diff < 7200 && "1小时前" ||
			diff < 86400 && Math.floor( diff / 3600 ) + "小时前") ||
		day_diff == 1 && "昨天"+formatDate('hh:ii', time) ||
		day_diff < 7 && day_diff + "天前" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + "星期前";
}


function OnRightClick(event, treeId, treeNode) {
	console.log(treeNode);
	if(!treeNode) return;
	if(treeNode.isSend || treeNode.isReceive || treeNode.isTemplate ) return;
	if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
		treeObj.cancelSelectedNode();
		showRMenu("root", event.clientX, event.clientY);
	} else if (treeNode && !treeNode.noR) {
		treeObj.selectNode(treeNode);
		showRMenu("node", event.clientX, event.clientY);
	}
}

function showRMenu(type, x, y) {
	$("#rMenu ul").show();
	if (type=="root") {
		$("#m_del").hide();
		$("#m_check").hide();
		$("#m_unCheck").hide();
	} else {
		$("#m_del").show();
		$("#m_check").show();
		$("#m_unCheck").show();
	}
	rMenu.css({"top":y+"px", "left":x+"px", "visibility":"visible"});

	$("body").bind("mousedown", onBodyMouseDown);
}
function hideRMenu() {
	if (rMenu) rMenu.css({"visibility": "hidden"});
	$("body").unbind("mousedown", onBodyMouseDown);
}
function onBodyMouseDown(event){
	if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
		rMenu.css({"visibility" : "hidden"});
	}
}


function hideTemplateCon() {
	updateTreeObj();
	$('.templateFile_wrap').hide();
	showContentWrap();
	updateMenu( treeObj.getSelectedNodes() );
}
function addTemplateCon() {
	treeObj = treeObjTemplate;
	$('.templateFile_wrap').show();
	hideContentWrap();
	$('.templateFile_wrap .msgTitle').html('请选择模板');
	updateMenu( treeObj.getSelectedNodes() );

	$('[data-click]').off().on('click', function  () {
		//eval($(this).data('click'));
	});

	$(window).scrollTop(0);
}

function sendShareSnd () {
	if(isWeiXin){

	} else {
		alert('语音请求已发送到微信，请点链接微信留言');
	}
}


function addPictureCon() {
	if(isWeiXin) wxUploadImage();
	else pcUploadImage();
	return;
/*
	treeObj = treeObjTemplate;
	$('.templateFile_wrap').show();
	hideContentWrap();
	$('.templateFile_wrap .msgTitle').html('请选择模板');
	updateMenu( treeObj.getSelectedNodes() ); */
}



function initTemplateFileTree (data) {
	root= [];
	data.forEach(function(v){
		pathToObj( v );
		root[root.length-1].isTemplate = v.isTemplate;
	});

	zNodesTemplate.children = root;

	$.fn.zTree.init($("#fileTreeTemplate"), setting, zNodesTemplate);
	treeObjTemplate = $.fn.zTree.getZTreeObj("fileTreeTemplate");

	var rootNode = treeObjTemplate.getNodes()[0];

	treeObjTemplate.expandNode( rootNode, true );
	treeObjTemplate.selectNode( rootNode );
	addAttrToNode( treeObjTemplate, {isTemplate:true} );
}

function initPrintTree (data) {

	data.isPrint = true;

	$.fn.zTree.init( $("#printTree"), $.extend(setting, {data:{key:{title:'name'}} } ) , data);
	treeObjPrint = $.fn.zTree.getZTreeObj("printTree");

	var rootNode = treeObjPrint.getNodes()[0];
	//treeObjPrint.addNodes( rootNode , root );

	treeObjPrint.expandNode( rootNode, true );
	treeObjPrint.selectNode( rootNode );
	addAttrToNode( rootNode, {isPrint:true} );

}

function applyPrint ( onlyDownload ) {

	var p = treeObjPrint.getSelectedNodes()[0];
	var server = p.server;
	var printer = p.path;

	var idx = $('.currTab').data('idx');
	var tree = window['treeObj'+(idx+1)];  //eval('treeObj'+(idx+1) );
	var sel = tree.getSelectedNodes();
	if(!sel.length)return;
	sel=sel[0];

	var shareID = getShareID(sel);
	var info = getFileKeys(sel);
	var fileKey = info.key;

    var downloadUrl = host+'/downloadFile2/'+ fileKey.split('/').pop() +'?key='+ fileKey +'&shareID='+shareID+'&person='+rootPerson.userid;

	$('.bg_mask').show();

		$.ajax({
		  type: 'POST',
		  url: host+'/printPDF',
		  data: { server:server, printer:printer, onlyDownload:onlyDownload, fileKey:fileKey, shareID:shareID, person: rootPerson.userid },
		  // type of data we are expecting in return:
		  dataType: 'json',
		  timeout: CONVERT_TIMEOUT,
		  success: function(data){
		  	showMainWindow();
		    $('.bg_mask').hide();
			if(!data || data.errMsg) alert('打印失败：打印服务故障');
			else alert('打印任务安排成功，请等待打印机打印');
			console.log(data);
			hidePrintCon();
		  },
		  error: function(xhr, type){
		  	showMainWindow();
		    $('.bg_mask').hide();
		    alert('打印超时');

		  }
		});

}

function getSelectFiles () {
	var idx = $('.currTab').data('idx');
	var tree = window['treeObj'+(idx+1)]; //eval('treeObj'+(idx+1) );
	var sel = tree.getSelectedNodes();
	return sel;
}



function openPrintCon (){

	treeObj = treeObjPrint;
	hideContentWrap();
	$('.print_wrap').show();

	$('.print_wrap .msgTitle').html('请选择打印机');
	updateMenu( treeObj.getSelectedNodes() );

	$(window).scrollTop(0);
}

function hidePrintCon() {
	updateTreeObj();
	$('.print_wrap').hide();
	showContentWrap();
	updateMenu( treeObj.getSelectedNodes() );
}


		function addTreeNodeFilter () {

			var newNode = { name:"添加新搜索", title:"添加新搜索", isFilter:true, isParent:false};
			var pNode = treeObj.getNodes()[0];
			treeObj.expandNode(pNode,true);
			node = treeObj.addNodes(pNode, 0, newNode);

		}
		function addTreeNode () {
			hideRMenu();
			var node;
			var name = "新建文件夹 " + (addCount++);
			name = formatDate('yyyy-mm-dd hh-ii-ss');
			var newNode = { name:name, title:name, role:'upfile', hash:+new Date()+Math.random()+'', person:rootPerson.userid, isNew:true, isParent:true};
			var targetNode = treeObj.getSelectedNodes()[0];
			var pNode = targetNode;
			if(!pNode.isParent) pNode = pNode.getParentNode();
			if (pNode) {
				newNode.checked = pNode.checked;
				treeObj.expandNode(pNode,true);
				node = treeObj.addNodes(pNode, 0, newNode);
				// If targetNode is a file, move it into new folder
				if(0&&!targetNode.isParent) {
					if(node.length) node=node[0];
					node = treeObj.moveNode(targetNode, node, 'prev');
					treeObj.moveNode(node, targetNode, 'inner');
					treeObj.editName(node);
					$('input.rename', $('#'+node.tId) ).get(0).select();
					return;
				}
			} else {
				pNode = treeObj.getNodes()[0];
				treeObj.expandNode(pNode,true);
				node = treeObj.addNodes(pNode, 0, newNode);
			}
			if(!node) return;

			var id, nextOrder, nextObj;
			var startOrder;
			targetNode = getPrevNextLeaf( node[0], 'next' );

				startOrder = targetNode.order || getMaxMinOrder( getAllLeafs( targetNode ), 'max' ) ;
				nextObj = getPrevNextLeaf( node[0], 'prev' );
				if(!nextObj) nextOrder = startOrder+1 ;
				else nextOrder = nextObj.order || getAllLeafs( nextObj ).shift().order ;

				//console.log(node[0], targetNode,nextObj, nextOrder, startOrder);
			node[0].order = (nextOrder+startOrder)/2;

			treeObj.editName(node[0]);
			$('input.rename', $('#'+node[0].tId) ).get(0).select();


		}

		function beforeRename(treeId, treeNode, newName, isCancel)
		{
			treeObj = $.fn.zTree.getZTreeObj(treeId);

			var valid = true;
			$('#'+ treeNode.tId ).find('input.rename').width(600);
			if(newName==""){
				alert( "请指定一个名称");
				return false;
			}
			if(newName.match(/[\\\/*?:"<>|]/) ) {
				alert( "名称中不可包含:\\\/*?:\"<>|");
				return false;
			}

			if(!isCancel && ( treeNode.name == newName ) ) {
				treeObj.cancelEditName(newName);
				return false;
			}
			$.each(treeNode.getParentNode().children, function  (i,v) {
				if(v!=treeNode && v.name == newName && v.isParent==treeNode.isParent ) {
					valid = false;
					return false;
				}
			});
			if(!valid) alert( "文件名与现有文件重名");
			return valid;
		}

		function onRename(event, treeId, treeNode, isCancel)
		{
			treeObj = $.fn.zTree.getZTreeObj(treeId);

			treeNode.title = treeNode.name;

			if(treeNode.key){
				var ext = treeNode.key.split('.').pop();
				var filename = treeNode.name.match( new RegExp('\\.'+ext+'$', 'i') ) ? treeNode.name : treeNode.name+'.'+ext;
				var $dl = $('#'+treeNode.tId).find('.downloadIcon')
				var url = $dl.attr( 'href' );

				url = url.split('&rename=').shift()+ '&rename='+ encodeURIComponent( filename );
				$dl.attr('href', url);

			}

			if(!isCancel || treeNode.isNew) serverUpdateNode('rename', treeNode);
			treeNode.isNew = false;
		}

		function removeTreeNode () {

			function whenCnfm(){
				hideRMenu();
				var nodes = treeObj.getSelectedNodes();
				console.log(nodes[0]);
				var shareID = getShareID(nodes[0]);

				if (nodes && nodes.length>0) {
					if (nodes[0].children && nodes[0].children.length > 0) {
						var msg = "要删除的节点是目录，如果删除将连同内部的文件一起删掉。\n\n请确认！";
						window.confirm(msg, function(ok){
							if (ok==true){
								$post(host+'/removeFolder', { path: getPath(nodes[0]), deleteAll: true}, function  () {} );
								treeObj.removeNode(nodes[0]);
							}
						});
					} else {
						$post(host+'/removeFile', { hash:nodes[0].hash, key:nodes[0].key, shareID: shareID }, function  () {} );
						treeObj.removeNode(nodes[0]);
					}
				}
				updateMenu();
			}

			window.confirm('确定要删除吗？此操作不可恢复！', function(ok){
				return ok? whenCnfm() : '';
			});

		}
		function renameTreeNode() {
			var nodes = treeObj.getSelectedNodes();
			if (nodes && nodes.length>0) {
				treeObj.editName(nodes[0]);
			}
			hideRMenu();
		}
		function resetTree() {
			hideRMenu();
			$.fn.zTree.init($("#fileTree"), setting, zNodes);
		}



		function dropPrev(treeId, nodes, targetNode) {

			var pNode = targetNode.getParentNode();
			if(!pNode) return false;
			if(targetNode.isSend || targetNode.isReceive) return false;

			if ( pNode && !pNode.isParent ) {
				return false;
			} else {
				if(checkLeaf(nodes) && pNode.level==0 && !(nodes.length==1 && nodes[0].level==1 ) ) return false;

				for (var i=0,l=curDragNodes.length; i<l; i++) {
					var curPNode = curDragNodes[i].getParentNode();
					if (curPNode && curPNode !== targetNode.getParentNode() && curPNode.childOuter === false) {
						return false;
					}
				}
			}
			return true;
		}
		function dropInner(treeId, nodes, targetNode) {
			if(!targetNode) return false;
			if(targetNode.isSend || targetNode.isReceive) return false;

			if (targetNode && !targetNode.isParent) {
				return false;
			} else {

				if(checkLeaf(nodes) && targetNode.level==0) return false;


				for (var i=0,l=curDragNodes.length; i<l; i++) {
					if (!targetNode && curDragNodes[i].dropRoot === false) {
						return false;
					} else if (curDragNodes[i].parentTId && curDragNodes[i].getParentNode() !== targetNode && curDragNodes[i].getParentNode().childOuter === false) {
						return false;
					}
				}
			}
			return true;
		}
		function dropNext(treeId, nodes, targetNode) {
			if(targetNode.isSend || targetNode.isReceive) return false;

			var pNode = targetNode.getParentNode();
			if(!pNode) return false;
			if (pNode && !pNode.isParent) {
				return false;
			} else {
				if(checkLeaf(nodes) && pNode.level==0  && !(nodes.length==1 && nodes[0].level==1 ) ) return false;

				for (var i=0,l=curDragNodes.length; i<l; i++) {
					var curPNode = curDragNodes[i].getParentNode();
					if (curPNode && curPNode !== targetNode.getParentNode() && curPNode.childOuter === false) {
						return false;
					}
				}
			}
			return true;
		}



		function beforeDrag(treeId, treeNodes) {
			var isRoot = false;
			$.each(treeNodes, function  (i,v) {
				if(v.level==0) isRoot=true;
				if(v.isSend || v.isReceive) isRoot=true;
			});
			if(isRoot) return false;

			className = (className === "dark" ? "":"dark");
			showLog("[ "+getTime()+" beforeDrag ]&nbsp;&nbsp;&nbsp;&nbsp; drag: " + treeNodes.length + " nodes." );
			for (var i=0,l=treeNodes.length; i<l; i++) {
				if (treeNodes[i].drag === false) {
					curDragNodes = null;
					return false;
				} else if (treeNodes[i].parentTId && treeNodes[i].getParentNode().childDrag === false) {
					curDragNodes = null;
					return false;
				}
			}
			curDragNodes = treeNodes;
			return true;
		}

		function beforeDragOpen(treeId, treeNode) {
			autoExpandNode = treeNode;
			return true;
		}



		function getMaxMinOrder (nodes, isMax) {
			nodes = nodes.filter(function  (v) {
				return v.order || v.order==0;
			});
			var orderA = nodes.map(function  (v) {
				return v.order;
			});
			return isMax == 'max' ? Math.max.apply( Math, orderA ) : Math.min.apply( Math, orderA );
		}
		function getPrevNextLeaf (targetNode, isPrev) {
			var prev= isPrev=='prev' ? targetNode.getPreNode() : targetNode.getNextNode();
			if(prev && prev!=targetNode ) return prev;
			else {
				var p = targetNode.getParentNode();
				if(p && p.level) return getPrevNextLeaf( p, isPrev );
				else{
					return null;
				}
			}
		}



		function beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {

			var id, nextOrder, nextObj;
			var startOrder;

			if(moveType=='next'){
				startOrder = targetNode.order || getMaxMinOrder( getAllLeafs( targetNode ), 'min' ) ;
				nextObj = getPrevNextLeaf( targetNode, 'next' );
				if(!nextObj) nextOrder = startOrder-1 ;
				else nextOrder = nextObj.order ||  getAllLeafs( nextObj ).shift().order ;
			}
			if(moveType=='prev'){
				startOrder = targetNode.order || getMaxMinOrder( getAllLeafs( targetNode ), 'max' ) ;
				nextObj = getPrevNextLeaf( targetNode, 'prev' );
				if(!nextObj) nextOrder = startOrder+1 ;
				else nextOrder = nextObj.order || getAllLeafs( nextObj ).shift().order ;
			}

			if(moveType=='inner'){
				startOrder = targetNode.order || getMaxMinOrder( getAllLeafs( targetNode ), 'max' ) ;
				nextObj = getPrevNextLeaf( targetNode, 'prev' );
				if(!nextObj) nextOrder = startOrder+1 ;
				else nextOrder = nextObj.order || getAllLeafs( nextObj ).shift().order ;
			}

			var targetNodes = getAllLeafs(treeNodes);

			var stepOrder = (nextOrder - startOrder)/ (targetNodes.length+1);
			//console.log(id, getMaxMinOrder( getAllLeafs( targetNode ), 'max'), moveType, startOrder,  getAllLeafs(treeObj.getNodeByTId(id)).pop(), stepOrder, nextOrder);

			targetNodes.forEach(function  (v,i) {
				v.order = startOrder+(i+1)*stepOrder;
			});

			DragParentNode = (treeNodes[0].getParentNode() );
			className = (className === "dark" ? "":"dark");
			showLog("[ "+getTime()+" beforeDrop ]&nbsp;&nbsp;&nbsp;&nbsp; moveType:" + moveType);
			showLog("target: " + (targetNode ? targetNode.name : "root") + "  -- is "+ (isCopy==null? "cancel" : isCopy ? "copy" : "move"));
			return true;
		}

		function onDrag(event, treeId, treeNodes) {
			className = (className === "dark" ? "":"dark");
			showLog("[ "+getTime()+" onDrag ]&nbsp;&nbsp;&nbsp;&nbsp; drag: " + treeNodes.length + " nodes." );
		}
		function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
			console.log( treeNodes, targetNode, moveType, isCopy );
			if(isCopy===false) serverUpdateNode('move', treeNodes );

			className = (className === "dark" ? "":"dark");

			showLog("[ "+getTime()+" onDrop ]&nbsp;&nbsp;&nbsp;&nbsp; moveType:" + moveType);
			showLog("target: " + (targetNode ? targetNode.name : "root") + "  -- is "+ (isCopy==null? "cancel" : isCopy ? "copy" : "move"))
		}
		function onExpand(event, treeId, treeNode) {
			if (treeNode === autoExpandNode) {
				className = (className === "dark" ? "":"dark");
				showLog("[ "+getTime()+" onExpand ]&nbsp;&nbsp;&nbsp;&nbsp;" + treeNode.name);
			}
		}


		function beforeDblClick (treeId, treeNode) {
			if( treeNode && treeNode.key) {
				return true;
			}
			return true;
		}

		function makeViewURL (treeNode) {
			var shareStr = treeNode.isSend||treeNode.isReceive ? '&shareID='+getShareID(treeNode) : '';
			shareStr += shareStr && treeNode.isSign ? '&isSign=1' : '';
			shareStr += treeNode.isTemplate ? '&isTemplate=1' : '';
			return treeNode.key + shareStr;
		}
		function onDblClick (event, treeId, treeNode) {

			if(!treeNode ) return;

			if( treeNode.isParent && treeNode.level==1 && treeNode.shareID ){
				return viewDetail();
			}

			if( !treeNode.key ) return;

			if( ! $('.content_wrap').is(':visible') ) return;


			if(  treeNode.key.match(/\.pdf$/) ){
				openLink ( makeViewURL(treeNode) , treeNode.title);
			} else if( treeNode.key.match(regex_preview) ) {
				previewImage();
			} else if( treeNode.key.match(regex_can_be_convert) ) {
				window.confirm('此文件可转为PDF进行预，现在转换为PDF吗?', function(ok){
					if(ok)convertPDF();
				});
			}else {
				eve( $('#'+ treeNode.tId+'').find('.downloadIcon') );
			}
		}


		function beforeClick (treeId, treeNode, clickFlag) {
			treeObj = $.fn.zTree.getZTreeObj(treeId);

			if(treeNode.isCur) return false;
			var nodes = treeObj.getSelectedNodes();
			className = (className === "dark" ? "":"dark");
			if(curSrcNode && treeNode.open) return true;

			var prevScrollPos = $(window).scrollTop();
			if (treeNode.isParent && treeNode.level>0 && treeNode.click!==false) {
				treeObj.expandNode(treeNode);
				window.location.hash = 'path=' + getPath(treeNode)+'&shareID='+getShareID(treeNode);
				$(window).scrollTop( prevScrollPos );
			}
			if( isMobile&& !treeNode.isParent && treeNode.prevTime && (+new Date()- treeNode.prevTime)<3000 ){
				if( $('.content_wrap').is(':visible') ) openLink ( makeViewURL(treeNode) , treeNode.title);
			}
			showLog("[ "+getTime()+" beforeClick ]&nbsp;&nbsp;" + treeNode.name );
			return (treeNode.click != false);
		}
		function onClick (event, treeId, treeNode, clickFlag) {

			//showLog("[ "+getTime()+" onClick ]&nbsp;&nbsp;clickFlag = " + clickFlag + " (" + (clickFlag===1 ? "普通选中": (clickFlag===0 ? "<b>取消选中</b>" : "<b>追加选中</b>")) + ")");
			if(curSrcNode) return;
			treeNode.prevTime = +new Date();
			updateMenu(treeNode, true);

		}
		function showLog(str) {
			return;
			/* if (!log) log = $("#log");
			log.append("<li class='"+className+"'>"+str+"</li>");
			if(log.children("li").length > 8) {
				log.get(0).removeChild(log.children("li")[0]);
			} */
		}
		function getTime() {
			var now= new Date(),
			h=now.getHours(),
			m=now.getMinutes(),
			s=now.getSeconds();
			return (h+":"+m+":"+s);
		}


		function openLink  (url, text) {

			var viewerURL = VIEWER_URL+'#file='+ FILE_HOST +url;

			console.log(url);

			if(isQT){

				document.title = "";
				//document.title = JSON.stringify({action:"openPDF", url:'http://1111hui.com/pdf/dragShape/path.html', text:text });
				document.title = JSON.stringify({action:"openPDF", url:viewerURL, text:text });
			} else{

				if( isNWJS ){
					global._nwMain.showReader(viewerURL);
				}else
					window.location = viewerURL;
			}
		}



function getFilesData () {

	/*****
	* File Data format should be:
	[
	{path:'/', file:"pdf1", title:"asdf"},
	{path:'/abc/a/e/', file:"pdf1"},
	{path:'/abc/a/b/', file:"pdf2"},
	{path:'/a/b/c/', file:"pdf3"},
	{path:'/a/b/c/', file:"pdf4"},
	{path:'/a/b/c/', file:"pdf5"},
	]
	*
	***/


	zNodes = [{userid:rootPerson.userid, name:'['+rootPerson.name+']的文件柜',  title: rootPerson.depart+ "-"+rootPerson.name+'的文件柜', isParent:true, children: []}];
	zNodes2 =  [{userid:rootPerson.userid, name:'发件柜', title:'发件柜', isSend:true, isParent:true, children: []}] ;
    zNodes3 = [{userid:rootPerson.userid, name:'收件柜', title:'收件柜', isReceive:true, isParent:true, children: []}] ;
    zNodesTemplate = {userid:rootPerson.userid, name:'模板文件柜', title:'模板文件柜', isTemplate:true, isParent:true, children: []} ;
    zNodesPrint = {userid:rootPerson.userid, name:'打印机列表', title:'打印机列表', isPrint:true, isParent:true, children: []} ;

	fileKeys = ["person", "date", "client", "title", "path", "key", "fname", "hash", "type", "fsize", "order", "imageWidth", "imageHeight", 'isTemplate', 'drawData', 'inputData', 'server', 'signIDS'];



	$post(host+'/getfile', {person:rootPerson.userid}, function  (data) {
		if(!data){
			setTimeout(getFilesData, 1000);
			return;
		}
		data = JSON.parse(data);
		fileData = data;
		init(data);

		if(!urlQuery.shareID){
			locateNode( treeObj.getNodes()[0], urlQuery.path, null, true );
		}

		$post(host+'/getTemplateFiles', { depart:rootPerson.depart }, function  (data) {
			if(!data) return;
			initTemplateFileTree(data);
		});

		$post(host+'/getPrintList', { company:COMPANY_NAME }, function  (data) {
			if(!data) return;
			initPrintTree(data);
		});


	});

	reloadTree2(null, null, 'auto');

}



function locateNode (rootNode, path, shareID, switchTo){

	if( !rootNode || !path ) return;
	var targetNode;
	var treeObj = rootNode.isSend ? treeObj2 : ( rootNode.isReceive? treeObj3 : treeObj1 );
	treeObj.expandNode( rootNode, true );

	if( path.match(/^\s*\//) ) {
		//path = '/'+rootNode.name+path;
		targetNode = treeObj.getNodesByFilter(function(node){
			var p = getPath(node);
			var comp = path;

			p += (node.key||node.hash||'');

			if(shareID) {
				p = p.replace( /^\/[^/]*/, '' );
				comp = comp.replace( /^\/[^/]*/, '' );
			}

			return  shareID? node.shareID==shareID&& p==comp : p==comp;
		}, true, rootNode);
	}else{
		targetNode = treeObj.getNodesByFilter(function(node){
			return  (node.key==path || node.hash==path) && (!shareID? 1 : shareID==getShareID(node) ) ;
		}, true, rootNode);
	}

	if( targetNode ) {
		if(switchTo){
			if(targetNode.isSend) showTab(1);
			else if(targetNode.isReceive) showTab(2);
			else showTab(0);
		}
		treeObj.selectNode(targetNode);
		updateMenu(targetNode);
		if(targetNode.isParent) treeObj.expandNode(targetNode, true);
		setTimeout(function(){
			var p = targetNode.isParent ? targetNode : targetNode.getParentNode();
			if(!p) p = targetNode;
			var offset = $('#'+p.tId).offset();
			if(switchTo) $(window).scrollTop( offset.top-100 );
		}, 0);

	} else {
		if(switchTo){
			showTab(0);
		}
	}
}

function getSubStr (str, len) {
	len = len || 10;
	return str.length<=len? str : str.substr(0, len)+'...';
}


function init (data, isOnTop, isOpen){

	var isSingleNode = !$.isArray(data);

	data = isSingleNode?[data]:data;

	root = [];
	var sel= null;

	if(treeObj1){
		sel = treeObj1.getSelectedNodes().shift();
		root = treeObj1.getNodes()[0].children;
	}

	data.forEach(function(v){
		pathToObj( v, isOnTop, isOpen );
	});

	if(1 || !treeObj1){
		zNodes[0].children = root;
		$.fn.zTree.init($("#fileTree"), setting, zNodes);
		treeObj1 = $.fn.zTree.getZTreeObj("fileTree");
	} else {
		treeObj1.addNodes( treeObj1.getNodes()[0], 0, root );
	}

	treeObj1.expandNode(treeObj1.getNodes()[0], true);

	if(sel) treeObj1.selectNode(sel);

	rMenu = $("#rMenu");

	if(!tree1WayPoint) setupWayPoint1();

	if( (!treeObj2||!treeObj3) && (urlQuery.shareID || urlQuery.tab>0) ) return $('.tree1>.ztree').hide();

	showTab(0);

	if(sel){
		treeObj1.cancelSelectedNode();
		sel = treeObj1.getNodeByParam('key', sel.key );
	} else {
		$(window).scrollTop(0);
	}
	updateMenu(sel);
	if(sel){
		treeObj1.selectNode(sel);
	}
}

function initShareFrom (data, bForceUpdate, isPrepend, isAddNodes) {

	root= treeObj2? treeObj2.getNodes()[0].children : [];
	if(isAddNodes || bForceUpdate) root = [];

	for(var i=0; i<data.length; i++) {
		var shareID = data[i].shareID;
		var files = data[i].files;
		var isSign = data[i].isSign;
		var isFinish = data[i].isFinish;
		var msg = data[i].msg||'';
		var fromPerson = data[i].fromPerson.map(function(v){return v.name});
		var fromPersonStr =  '('+fromPerson.join(',')+')';
		var toPerson = data[i].toPerson.map(function(v){return v.name});
		var toPersonStr = toPerson.length>2? '('+toPerson.slice(0,2).join(',')+'...)' :  '('+toPerson.join(',')+')' ;
		var flowName = '('+data[i].flowName+'-'+fromPerson.join(',')+ ')';
		if(files.length) {
			files.every(function(v){
				try{
					var folderName = isSign? '流程-'+shareID+flowName+ (msg) : '共享-'+shareID+toPersonStr+ (msg);
					v.path = "/"+ folderName  + v.path;
					v.isSign = isSign;
					v.shareID = shareID;
					pathToObj( v, isPrepend );
					var pos = isPrepend?0:root.length-1;
					root[pos].shareID = shareID;
					root[pos].isSign = isSign;
					root[pos].isFinish = isFinish;
					if(isFinish) root[pos].font = {color:'blue'};

					// folder.children.unshift({name:'task1', isTask:true});

				} catch(e){
					alert('发件柜初始化错误');
					return false;
				}
				return true;
			});
		} else {

			var folderName = isSign? '流程-'+shareID+flowName+ (msg) : '共享-'+shareID+fromPersonStr+ (msg);
			var v = {shareID: shareID};
			v.name = v.title = folderName;
			v.isSign = isSign;
			v.isFinish = isFinish;
			v.isParent = true;
			if(v.isFinish) v.font = {color:'blue'};
			isPrepend ? root.unshift(v) : root.push(v);

		}
	}

	if(!isAddNodes){
	    zNodes2[0].children = root;

		$.fn.zTree.init($("#fileTree2"), setting, zNodes2);
		treeObj2 = $.fn.zTree.getZTreeObj("fileTree2");
		sendRoot = treeObj2.getNodes()[0];
		treeObj2.expandNode(sendRoot);
	} else {
		treeObj2.addNodes(sendRoot, 0, root);
	}
	// if(!sendRoot){
	// 	sendRoot = treeObj2.addNodes( null,  {userid:rootPerson.userid, name:'发件柜', title:'发件柜', isSend:true, isParent:true, children: root} );
	// 	if(sendRoot) sendRoot = sendRoot[0];
	// } else {
	// 	treeObj2.addNodes( sendRoot, root );
	// }
	addAttrToNode( sendRoot, {isSend:true} );
}

function initShareTo (data, bForceUpdate, isPrepend, isAddNodes) {

	root= treeObj3? treeObj3.getNodes()[0].children : [];
	if(isAddNodes || bForceUpdate) root = [];

	$('.bg_mask').hide();

	for(var i=0; i<data.length; i++){

		var shareID = data[i].shareID;
		var files = data[i].files;
		var isSign = data[i].isSign;
		var isFinish = data[i].isFinish;
		var msg = data[i].msg||'';
		var fromPerson = data[i].fromPerson.map(function(v){return v.name});
		var fromPersonStr =  '('+fromPerson.join(',')+')';
		var toPerson = data[i].toPerson.length ? data[i].toPerson.map(function(v){return v.name}) : data[i].toPerson.name;

		var toPersonStr =  data[i].toPerson.length ?
				 (toPerson.length>2? '('+toPerson.slice(0,2).join(',')+'...)' :  '('+toPerson.join(',')+')' ) :
				 toPerson.name;

		var flowName = '('+data[i].flowName+'-'+fromPerson.join(',')+ ')';

		if(files.length) {
			files.every(function(v){
				try{

					var folderName = isSign? '流程-'+shareID+flowName+ (msg) : '共享-'+shareID+fromPersonStr+ (msg);
					v.path = "/"+ folderName  + v.path;
					v.isSign = isSign;
					v.shareID = shareID;
					pathToObj( v, isPrepend );
					var pos = isPrepend?0:root.length-1;
					root[pos].shareID = shareID;
					root[pos].isSign = isSign;
					root[pos].isFinish = isFinish;
					if(isFinish) root[pos].font = {color:'blue'};
				} catch(e){
					alert('发件柜初始化错误');
					return false;
				}
				return true;
			});
		} else{

			var folderName = isSign? '流程-'+shareID+flowName+ (msg) : '共享-'+shareID+fromPersonStr+ (msg);
			var v = {shareID: shareID};
			v.name = v.title = folderName;
			v.isSign = isSign;
			v.isFinish = isFinish;
			v.isParent = true;
			if(v.isFinish) v.font = {color:'blue'};
			isPrepend ? root.unshift(v) : root.push(v);
		}
	}

	if(!isAddNodes){
	    zNodes3[0].children = root;
		$.fn.zTree.init($("#fileTree3"), setting, zNodes3);
		treeObj3 = $.fn.zTree.getZTreeObj("fileTree3");
		receiveRoot = treeObj3.getNodes()[0];
		treeObj3.expandNode(receiveRoot);
	} else {
		treeObj3.addNodes(receiveRoot, 0, root);
	}

	// if(!receiveRoot){
	// 	receiveRoot = treeObj3.addNodes( null,  {userid:rootPerson.userid, name:'收件柜', title:'收件柜', isReceive:true, isParent:true, children: root} );
	// 	if(receiveRoot) receiveRoot = receiveRoot[0];
	// } else {
	// 	treeObj3.addNodes( receiveRoot, root );
	// }

	addAttrToNode( receiveRoot, {isReceive:true} );
}

function updateTreeObj (globalSet){
	var idx = $('.currTab').data('idx');
	var tree = window['treeObj'+(idx+1)]; //eval( 'treeObj'+ (idx+1) );
	if(globalSet!==null) treeObj = tree;
	return tree;
}


function addAttrToNode (node, obj) {
	$.extend(node, obj);
	if( node.isParent && node.children ){
		node.children.forEach(function  (v) {
			addAttrToNode(v, obj);
		});
	}
}

function getNodeByHash(tree, hash, switchTo){
	if(!tree) tree = treeObj;
	return tree.getNodesByFilter(function (node) {
		return node.hash==hash;
	});
}

function reloadTree1 (fileObj, switchTo){
	$post(host+'/getfile', {person:rootPerson.userid}, function  (data) {
		data = JSON.parse(data);
		root = [];
		data.forEach(function(v) {
			pathToObj( v );
		});
		zNodes[0].children = root;

		treeObj1.destroy();
		$.fn.zTree.init($("#fileTree"), setting, zNodes);
		treeObj1 = $.fn.zTree.getZTreeObj("fileTree");

		if(fileObj){
			locateNode( treeObj1.getNodes()[0],  fileObj.returnPath || fileObj.key || fileObj.hash, null, switchTo );
		}

		if(switchTo){
			showTab(0);
		}
	});

}

function reloadTree2 (fileKey, shareID, switchTo, openShare, openMessage){
	shareID = shareID || urlQuery.shareID;
	var highlightTab = 0;

	function openAction () {
		openShare = openShare || urlQuery.openShare;
		openMessage = openMessage || urlQuery.openMessage;
		if(shareID && (openShare || openMessage ) ) {
			//hideContentWrap();
		} else {
			return;
		}
		if(openShare){
			shareFile();
		}else if(openMessage==1){
			viewDetail();
		}else if(openMessage==2){
			openPrintCon();
		}else if(openMessage==3){
			shareFile();

		} else if(urlQuery.tab) {
			showTab( urlQuery.tab );
		}

		window.location.hash = window.location.hash.replace(/&openShare[^&]+/,'');
		window.location.hash = window.location.hash.replace(/&openMessage[^&]+/,'');
		urlQuery.openShare = 0;
		urlQuery.openMessage = 0;
	}


	$post(host+'/getShareFrom', {person:rootPerson.userid}, function  (data) {
		if(!data) window.location.reload();
		data = JSON.parse(data);
		var isSwith = false;

		var curTab = $('.currTab').data('idx');
		if(switchTo=='auto'){
			isSwith = curTab>0?false:true;
			//isSwith = data.filter(function(v){ return v.shareID==shareID }).length>0 ? true : false;
			console.log(isSwith, 1)
		}

		initShareFrom(data, true);
		treeObj = treeObj2;
		treeObj2.expandNode(sendRoot, true);
		if(!tree2WayPoint) setupWayPoint2();

		if(shareID) {
			locateNode(sendRoot, fileKey||urlQuery.path, shareID||urlQuery.shareID, isSwith );
		}
		openAction();
	});

	$post(host+'/getShareTo', {person:rootPerson.userid}, function  (data) {
		if(!data) window.location.reload();
		data = JSON.parse(data);

		var curTab = $('.currTab').data('idx');
		if(switchTo=='auto'){
			isSwith = curTab>0?false:true;
			//isSwith = data.filter(function(v){ return v.shareID==shareID }).length>0 ? true : false;
			console.log(isSwith, 2)
		}

		initShareTo(data, true);
		treeObj3.expandNode(receiveRoot, true);
		treeObj = treeObj3;
		if(!tree3WayPoint) setupWayPoint3();

		if(shareID) {
			locateNode(receiveRoot, fileKey||urlQuery.path, shareID||urlQuery.shareID, isSwith );
		}
		openAction();

	});

}



		function getPath (node, includeSelf) {
			if(!node) return node;
			var pstr = [];
			var pNode = node;
			if(includeSelf || (node && node.isParent) ) pstr.push(pNode.name);
			while (pNode && pNode.level !==0) {
				pNode = pNode.getParentNode();
				pstr.push(pNode.name);
			}
			var path = '/'+(pstr.reverse().join('/'))+'/';
			var rootName = pNode.name;
			return path.replace('/'+rootName, '');
		}


		function checkLeaf (nodes) {
			var isLeaf = true;
			if( !$.isArray(nodes) ) nodes=[nodes];
			$.each(nodes, function  (i,v) {
				if(v.isParent) isLeaf = false;
			});
			return isLeaf;
		}

		function getAllLeafs ( theNodes ) {
			if( !$.isArray(theNodes) ) theNodes=[theNodes];

			function filter (node) {
				if(!node.isParent || ( node.children && node.children.length==0) ) return true;
			}

			var nodes = [];
			$.each(theNodes, function  (i,v) {
				if(!v || nodes.indexOf(v)>-1 ) return true;
				if(v.isParent) {
					if( !v.children || v.children.length==0 ) nodes.push(v);
					else nodes = nodes.concat( treeObj.getNodesByFilter(filter, false, v) );
				} else {
					nodes.push(v);
				}
			});
			return (nodes);
		}

		function getAllFiles ( theNodes ) {
			return getAllLeafs(theNodes).filter(function  (v) {
				return !v.isParent;
			});
		}


function breakIntoPath(path){
  var part = path.split('/');
  var ret = [], dd = [];
  for(var i=0; i<part.length-1;i++){
    dd.push(part[i]);
    ret.push( dd.join('/') + '/' );
  }
  return ret.slice(1);
}


function getFileKeys(node){
	var obj = fileKeys.reduce(function(o, key, idx) {
		//console.log(key, $.type( node[key]), node[key])
		if(!node[key])return o;
		if( $.type( node[key] ).match(/array|object/i) ) {
			// deep copy: o[key] = JSON.parse( JSON.stringify(node[key]) );
			o[key] = node[key];
		} else {
		  	o[key] = node[key];
		}
	  return o;
	}, {});
	return obj;
}

		function serverUpdateNode (type, treeNodes ) {
			var changedNodes = getAllLeafs(treeNodes);

			// merge parentNode if DragParentNode become an empty folder
			// if(DragParentNode && DragParentNode.isParent && DragParentNode.children && DragParentNode.children.length==0 ){
			// 	$.merge(changedNodes, [DragParentNode] );
			// };

			var postArr = [];
			var partPath = [];
			$.each(changedNodes, function  (i,v) {
				v.path = getPath(v);
				if(!v.hash) v.hash = +new Date()+Math.random();
				var obj = fileKeys.reduce(function(o, key, idx) {
				  if(!v[key])return o;
				  o[key] = v[key];
				  return o;
				}, {});
				postArr.push(obj);
				$.merge( partPath, breakIntoPath(v.path) );
			});
			$post( host+'/updatefile', {type:type, data:postArr} );

			//clean up all empty folder with part of the filename
			partPath = $.unique(partPath);
			var delelteNodes = treeObj.getNodesByFilter(function (node) {
				if( changedNodes.indexOf(node)>-1 ) return false;
				if(node.path && partPath.indexOf(node.path)>-1 && !node.key && (!node.children || (node.children&&node.children.length==0) ) ){
					return true;
				}
			});
			delelteNodes.forEach(function  (node) {
				console.log('removeNode', node);
					treeObj.removeNode(node);
			});


		}



		var curSrcNode, curType;

		function fontCss(treeNode) {
			var aObj = $("#" + treeNode.tId + "_a");
			aObj.removeClass("copy").removeClass("cut");
			if (treeNode === curSrcNode) {
				if (curType == "copy") {
					aObj.addClass(curType);
				} else {
					aObj.addClass(curType);
				}
			}
		}
		function setCurSrcNode(treeNode) {
			var zTree = treeObj;
			if (curSrcNode) {
				delete curSrcNode.isCur;
				var tmpNode = curSrcNode;
				curSrcNode = null;
				fontCss(tmpNode);
			}
			curSrcNode = treeNode;
			if (!treeNode){
				$( '#'+sendRoot.tId ).show();
				$( '#'+receiveRoot.tId ).show();
				return;
			}
			curSrcNode.isCur = true;
			zTree.cancelSelectedNode();
			fontCss(curSrcNode);
			$('.botmenu>div').hide();
			$('.moveMenu').show();

			$( '#'+sendRoot.tId ).hide();
			$( '#'+receiveRoot.tId ).hide();

		}
		function copyNode(e) {
			var zTree = treeObj,
			nodes = zTree.getSelectedNodes();
			if (nodes.length == 0) {
				alert("请先选择一个节点");
				return;
			}
			curType = "copy";
			setCurSrcNode(nodes[0]);
		}
		function cutNode(e) {
			var zTree = treeObj,
			nodes = zTree.getSelectedNodes();
			if (nodes.length == 0) {
				alert("请先选择一个节点");
				return;
			}
			curType = "cut";
			setCurSrcNode(nodes[0]);
		}
		function pasteNode(e) {

			if (!curSrcNode) {
				alert("请先选择一个节点进行 复制 / 剪切");
				return;
			}
			var zTree = treeObj,
			nodes = zTree.getSelectedNodes(),
			targetNode = nodes.length>0? nodes[0]:null;
			if(targetNode)
			if (curSrcNode === targetNode) {
				alert("不能移动，源节点 与 目标节点相同");
			} else if (curType === "cut" && ((!!targetNode && curSrcNode.parentTId === targetNode.tId) || (!targetNode && !curSrcNode.parentTId))) {
				alert("不能移动，源节点 已经存在于 目标节点中");
			} else if (curType === "copy") {
				targetNode = zTree.copyNode(targetNode, curSrcNode, "inner");
			} else if (curType === "cut") {

				if(targetNode.isSend || targetNode.isReceive){
					return false;
				}
				beforeDrop(null, [curSrcNode], targetNode, 'inner' );
				targetNode = zTree.moveNode(targetNode, curSrcNode, "inner");
				serverUpdateNode('move',curSrcNode);
				if (!targetNode) {
					alert("剪切失败，源节点是目标节点的目录");
				}
			}
			targetNode = curSrcNode;
			setCurSrcNode();
			delete targetNode.isCur;
			zTree.selectNode(targetNode);
			updateMenu(targetNode);

		}

		function moveTreeNodeCancel(){
			var targetNode =  curSrcNode;
			delete curSrcNode.isCur;
			setCurSrcNode();
			treeObj.selectNode( targetNode );
			updateMenu(targetNode);
		}

		function updateMenu (targetNode, changeURL) {
			if( $.isArray(targetNode) ) targetNode = targetNode[0];
			if( typeof targetNode=='string' ) {
				$('.botmenu>div').hide().parent().show();
				$(targetNode).show();
				return;
			}


			if(targetNode){

				if( !$('#'+targetNode.tId).is(':visible') ) return;

				$('.botmenu>div').hide().parent().show();
				if(targetNode.isSend) {

					$('.sendMenu').show();
					$('.sendMenu>a').hide();
					$('.sendMenu .fCommon').show();

					if(targetNode.isParent ){
						$('.fFolder').show();
						if(!targetNode.isFinish) $('.fFinish').hide(); else $('.fNotFinish').hide();
						if(targetNode.isSign){
							$('.fFinish, .fNotFinish').hide();
						}
					} else {
						$('.fFile').show();
						// if(targetNode.isFinish){
						// 	$('.fShare').show();
						// } else {
						// 	$('.fShare').hide();
						// }
					}

				} else if(targetNode.isReceive) {
					$('.receiveMenu').show();
					$('.receiveMenu>a').hide();
					$('.receiveMenu .fCommon').show();

					if(targetNode.isParent){
						$('.fFolder').show();
						if( !targetNode.isFinish )  $('.fFinish').hide(); else $('.fNotFinish').hide();
						if(targetNode.isSign){
							$('.fFinish, .fNotFinish').hide();
						}
					} else {
						$('.fFile').show();
					}

				} else if(targetNode.isPrint) {
					$('.printMenu').show();
					if(!targetNode.isParent){
						$('.fConfirmPrint').show();
					} else {
						$('.fConfirmPrint').hide();
					}
				} else if( $('.templateFile_wrap').is(':visible') && targetNode.isTemplate) {
					$('.templateMenu').show();
					if( targetNode.isParent ) $('.fConfirmTemplate').hide(); else $('.fConfirmTemplate').show();
				} else {
					if(targetNode.isParent && targetNode.level==0){
						$('.rootMenu1').show();
					} else if(targetNode.isParent) {
						$('.dirMenu').show();
					} else {

						if( targetNode.key.match(/\.pdf$/) ){
							$('.fileMenu').show();
							$('.fFlow').css('display', targetNode.signIDS?'table-cell':'none' );

						} else {
							$('.unknownMenu').show();
							if( targetNode.key.match(regex_can_be_convert)|| targetNode.key.match(regex_image) ) $('.fConvert').show(); else $('.fConvert').hide();


						}


						$('.fAdmin').hide();

						if(rootPerson.isAdmin || rootPerson.userRole&&rootPerson.userRole.indexOf('designer')>-1 )
						if(targetNode.isTemplate){
							$('.fRemoveTemplate').show();
						}else{
							$('.fSetTemplate').show();
						}
					}
				}
				if(targetNode && $('.content_wrap').is(':visible') && targetNode.key ) {

					$('.fView').attr( 'href', getFileUrl(targetNode) );

					var ext = targetNode.key.split('.').pop();
					var filename = targetNode.name.match( new RegExp('\\.'+ext+'$', 'i') ) ? targetNode.name : targetNode.name+'.'+ext;
					var srcFile = FILE_HOST+(targetNode.key);
					if(isWeiXin){
						$('.fDownload').removeAttr('download').attr( 'href', 'http://1111hui.com/pdf/getSrcFile.php?filename='+ filename +'&url='+ encodeURIComponent(srcFile)  );
					}else {
						$('.fDownload').attr( 'href', srcFile );
						$('.fDownload').attr( 'download', filename );
					}

					$('.fDownload').html( '下载(' + humanFileSize(targetNode.fsize) +')' ).hide();

					var shareStr = targetNode.level==0?'':
					 ( targetNode.isSend||targetNode.isReceive||targetNode.isSign ? '&shareID='+ getShareID(targetNode) : '' );

					if(changeURL) window.location = '#path='+ ( getPath(targetNode)+(targetNode.key||'') ) + shareStr;
					// window.location.replace(window.location);
					if( !targetNode.key) return $('.fDownload').hide();
					if( targetNode.key.match(regex_can_be_convert)|| targetNode.key.match(regex_image) ){
						$('.fConvert').show();
						$('.fView, .fPrint').hide();
					} else if( !targetNode.key.match(/\.pdf$/i) ) {
						$('.fConvert, .fView, .fPrint').hide();
					} else{
						$('.fView, .fPrint').show();
						$('.fDownload').hide();
					}

					if( targetNode.key.match(regex_preview) ) $('.fPreView').show(); else $('.fPreView').hide();

					if(rootPerson.userid== targetNode.person ){
						$('.receiveMenu .fRemove, .sendMenu .fRemove').show()
					} else {
						$('.receiveMenu .fRemove, .sendMenu .fRemove').hide()
					}

				}

			} else {
				$('.botmenu').hide();
			}
		}

function getFileUrl(targetNode){
	var treeNode = targetNode;
	var shareStr = treeNode.level==0?'':
		( treeNode.isSend||treeNode.isReceive||treeNode.isSign ? '&shareID='+ getShareID(treeNode) : '' );
	shareStr += shareStr && treeNode.isSign ? '&isSign=1' : '';
	shareStr += treeNode.isTemplate ? '&isTemplate=1' : '';

	return !treeNode.isParent ? VIEWER_URL+'#file='+(FILE_HOST+treeNode.key)+shareStr : '';

}


function setFileTemplate (isSet) {
	var sel = treeObj.getSelectedNodes();
	if(!sel.length) return;
	var hashA = sel.map(function(v){return v.hash});

	$post( host+'/setFileTemplate', {hashA: hashA, isSet: isSet}, function(err){
		if(err) return alert('有错误发生');
		sel.forEach(function(v){
			v.isTemplate = isSet;
		});
		updateMenu(sel);
		alert(isSet? '设置模板成功': '取消模板成功');
	} );
}






window.flowData = null;
window.curFlow = null;

var companyTree = null;
var companyNode = null;
var companySetting = {
	data: {
		simpleData: {
			enable: true,
			idKey: "id",
			pIdKey: "pId",
			rootPId: 0
		}
	},
	view: {
		dblClickExpand: false,
		expandSpeed: "",
		txtSelectedEnable:true,
		showLine:false,
		nameIsHTML:true
	},

	check: {
		enable:true,
		chkboxType:{ "Y": "s", "N": "s" }
	},

	callback: {
		beforeClick: beforeClick2,
		onClick: onClick2,
		onDblClick: onDblClick2,

	}
}

function showTab (idx) {

	if( !$('.content_wrap').is(':visible') ) return;

	curSrcNode = null;

	var prevIdx = $('.currTab').data('idx');
	if(typeof idx=='undefined') idx = prevIdx||0;

	// hide right top menu of msgTitle
	if(idx==0){
		$('.msgTitleMenu').hide();
	}else if(idx==2||idx==1) {
		$('.msgTitleMenu').show();
		if( idx==1 ) $('.exitMember').hide(); else  $('.exitMember').show();
	}
	$('.ztreeFile').hide().eq(idx).show();
	$('.loadMoreIndi').hide();
	$('.loadMore').hide().eq(idx).show();

	$('.header ul li').removeClass('currTab').eq(idx).addClass('currTab');
	treeObj = window['treeObj'+(idx+1)]; //eval('treeObj'+(idx+1) );

	try{
		var sel = treeObj.getSelectedNodes();
		updateMenu( sel );
	} catch(e){}

	if(prevIdx==idx){
		$(window).scrollTop(0);
	}

	if(treeObj) searchByName( $('.searchTxt:visible').val() );

	var waypoint =  window['tree'+ (idx+1) +'WayPoint']; //eval('tree'+ (idx+1) +'WayPoint');
	if(waypoint) waypoint.context.refresh();

	if(typeof prevIdx=='undefined') return;

}

function beforeClick2(treeId, treeNode, clickFlag) {
	className = (className === "dark" ? "":"dark");
	if (treeNode.isParent && treeNode.click!==false) {
		companyTree.expandNode(treeNode);
	}
	$('.fContact').css('display', treeNode.isParent ? 'none' : 'table-cell');
	$('.botmenu').show();

	return (treeNode.click != false);
}


function onClick2(event, treeId, treeNode, clickFlag) {

	var isContact = $('.company_wrap').data('role')=='contact';

	if( !isContact && !treeNode.isParent ) companyTree.checkNode(treeNode, null, true);

}
function onDblClick2(event, treeId, treeNode, clickFlag) {
	var tree = $.fn.zTree.getZTreeObj(treeId);
	if( $('.fContact').is(':visible') ) {
		viewContact();
		var sel = companyTree.getSelectedNodes().shift();
		if(sel&&sel.ip){
			//openClient(sel.ip);
		}
	}
}


function hideShare () {
	var role = $('.company_wrap').data('role');
	var roleFrom = $('.company_wrap').data('role-from');
	$('.company_wrap').removeData('role-from');

	$('.company_wrap').data('role', null);
	$('.clearInput:visible').click();
	$('.company_wrap').hide();
	updateTreeObj();

	if(roleFrom=='file'){
		$('.content_wrap, .header').show();
		setTimeout(function(){ $(window).scrollTop( $('.content_wrap').data('scrollTop') ); }, 100);
	}
	if(role=='member' && roleFrom!='file' ) {

		$('.msg_wrap').show();
		$('.botmenu').hide();
		$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');

	} else {
		var sel = treeObj.getSelectedNodes()[0];
		showContentWrap();
		$('.header').show();
		//$('.treeCompanyCon').css({left: $('.company_wrap').width() });
		updateMenu(sel);
	}

}



var optionsDrag = {
  limit: function (x,y,x0,y0) {
  	return {x:x, y:y};
  },
  setCursor: 'move',
  setPosition:false,
  useGPU:false,
  calcXY: function(me){
  	console.log(me);
    return {
      left: parseInt( getComputedStyle(me.element).left ),
      top: parseInt( getComputedStyle(me.element).top )
    }
  },
  onDrag: function (element, x, y, e) {
    $(element).css('left', x);
    $(element).css('top', y);
    $('.signPadHandler').css('left', x+$(element).width());
    $('.signPadHandler').css('top', y+$(element).height());
  }
};

function shareNodePre (){

	if( !companyTree.getCheckedNodes().length ){
		alert("请先选择分享目标");
		return;
	}

	$('#isSign').prop('checked', false);
	$('.flowCon, .flowPerson').hide();

	var nodes = companyTree.getCheckedNodes();
	var stuffs =  getAllFiles(nodes);

	stuffs = stuffs.map( function(v){
		return {name: v.name, userid: v.userid, depart: v.getParentNode().name }
	} );

	var role = $('.company_wrap').data('role');
	var roleFrom = $('.company_wrap').data('role-from');
	$('.company_wrap').removeData('role-from');

	if(role == 'share'){

		shareNode();

	} else if(role == 'member') {

		$('.company_wrap, .botmenu').hide();

		if(roleFrom!='file'){
			$('.msg_wrap').show();
			$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');
		} else {
			$('.content_wrap, .header').show();
			setTimeout(function(){ $(window).scrollTop( $('.content_wrap').data('scrollTop') ); }, 100);
		}


		nodes = companyTree.getCheckedNodes();
		stuffs =  getAllFiles(nodes);

		stuffs = stuffs.map( function(v) {
			return {name: v.name, userid: v.userid, depart: v.getParentNode().name }
		} );


		stuffs = stuffs.sort(function(a,b){return a.userid>b.userid})
		.filter( function(v){ var pos=stuffs.indexOf(v); return pos==0||stuffs[pos-1].userid!=v.userid } );

		treeObj = updateTreeObj(true);
		var sel = treeObj.getSelectedNodes().shift();
		var shareID = getShareID( sel );
		var shareName = '/'+getShareName(sel)+'/';

		$post(host+'/addMember', {shareID:shareID, shareName:shareName, stuffs:stuffs, personName: rootPerson.name }, function  (ret) {
			if(!ret) return alert('添加成员错误');
			console.log( ret );
			if(roleFrom!='file') $('.memberList').html('<b>'+ ret.map(function(v){return v.name}).join(',') +'</b>');
		}  );

	}

	return false;

}


function shareNode (){

	var treeObj = updateTreeObj(null);

	$( "#mydialog" ).trigger( "dialog-close" );
	var msg = $('#shareMsg').val();

	var isSign = $('#isSign').is(':checked');
	var isExistShare = $('#isExistShare').is(':checked');
	var flowName = isSign? $('.flowSelect').val() : '';
	var existShareID = isExistShare? $('#existShareInput').val() : '';

	if(isSign&&!flowName) {
		alert('请选择流程');
		return;
	}
	if(isExistShare&&!existShareID) {
		alert('请选择需添加到哪个共享');
		return;
	}

	var sel = treeObj.getSelectedNodes().shift();
	var shareID = getShareID(sel);
	var filePathS = {};
	var dialogRole = $( "#mydialog" ).data('role');
	$( "#mydialog" ).data('role', null);
	var isTopic = false;

	var nodes, fileIDS, stuffs, selectRange, json;

	if(dialogRole!='topic') {

		var files = getAllFiles(sel);
		if(sel.isParent) files.forEach(function(v){ v.path = v.path.replace( getPath(sel), '/') });
		else sel.path = '/';

		//files.sort( function(a,b){ return a.key>b.key } );

		var fileArr = [];
		$.each(files, function  (i,v) {
			var obj = fileKeys.reduce(function(o, key, idx) {
			  if(!v[key])return o;
			  o[key] = v[key];
			  return o;
			}, {});
			fileArr.push( obj  );
		});

		fileIDS = files.map(function(v){
			filePathS[ v.key.replace(/\./g, '\uff0e' ) ] = v.path;
			return v.key;
		});

	} else {
		fileIDS = [];
		isTopic = true;
	}



	if(!isSign){

		nodes = companyTree.getCheckedNodes();
		stuffs =  getAllFiles(nodes);

		stuffs = stuffs.map( function(v){
			return {name: v.name, userid: v.userid, depart: v.getParentNode().name }
		} );


		stuffs = stuffs.sort(function(a,b){return a.userid>b.userid})
		.filter( function(v){ var pos=stuffs.indexOf(v); return pos==0||stuffs[pos-1].userid!=v.userid } );

		// get Selected Folder & Files, exclude all redundant file
		var fullCheckedFolder = companyTree.getNodesByFilter(function(node){ return node.check_Child_State==2 && node.checked }  );
		fullCheckedFolder.forEach(function  (v) {
			getAllFiles(v).forEach(function  (n) {
				var idx = nodes.indexOf(n);
				if(idx>-1) nodes.splice(idx,1);
			});
		});

		selectRange=[];
		var stuffKeys = ['userid', 'name'];
		nodes.forEach(function(v){
			var obj = {};
			if(v.isParent){
				obj.name = v.name;
				obj.depart = null;
			} else {
				obj.userid=v.userid;
				obj.name=v.name;
				obj.depart = v.getParentNode().name;
			}
			selectRange.push(obj);
		});



	}

	if(!isSign){
		json = {fromPerson: [ rootPerson ], toPerson: stuffs, selectRange:selectRange, fileIDS: fileIDS, filePathS: filePathS, oldShareID:shareID, msg:msg, existShareID: existShareID };
	} else {
		json = {fromPerson: [ rootPerson ], toPerson: window.curFlow.flowPerson.slice(0,1), flowName: $('.flowSelect').val(),
		selectRange: window.curFlow.flowPerson,
		fileIDS: fileIDS, filePathS: filePathS, msg:msg, isSign:isSign };
	}

	//console.log(json);return;
	$post(host+'/shareFile', {data: JSON.stringify(json) }, function(data) {
		$( "#mydialog" ).trigger( "dialog-close" );
		if(existShareID){
			reloadTree2(files[0].key, data.shareID, true);
			alert('添加共享文件成功，并已通知该组成员');
		} else {
			var alertMsg = isSign? '流程已转交给相关人员，后续更新会消息通知' : '共享成功，已通知此共享相关人员';
			alert( alertMsg);
		}
	});

	hideShare();
}


function hideContentWrap () {
	var top = $(window).scrollTop();
	var left = $(window).scrollLeft();
	$('.content_wrap').data({left:left, top:top}).hide();
}
function showContentWrap () {
	var pos = $('.content_wrap').show().data();
	setTimeout(function  () {
		$(window).scrollTop(~~pos.top);
		$(window).scrollLeft(~~pos.left);
	},0);
}

function beginFlow () {
	$('#isSign').prop('checked', true);
	$('.flowCon, .flowPerson').show();
	$('#isExistShare').parent().hide();

	$('#isExistShare').prop('checked', false);
	$('.existShareCon').hide();
	$('#isExistShare').parent().hide();

	$('#shareMsg').val('');
	$( "#mydialog" ).data('role', 'flow').trigger( "dialog-open" );
}

function shareFileDialog (){
	$('#isSign').prop('checked', false);
	$('.flowCon, .flowPerson').hide();


	$('#isExistShare').parent().show();
	$('#shareMsg').val('');
	$( "#mydialog" ).data('role', 'share').trigger( "dialog-open" );
}
function addTopic (){
	$('#isSign').prop('checked', false);
	$('.flowCon, .flowPerson').hide();

	$('#isExistShare').prop('checked', false);
	$('.existShareCon').hide();
	$('#isExistShare').parent().hide();

	$('#shareMsg').val('');
	$( "#mydialog" ).data('role', 'topic').trigger( "dialog-open" );

}

function shareFile (role){
	if(!treeObj){
		return setTimeout( function (){ shareFile() }, 300 );
	}
	var title = '';
	var sel = treeObj.getSelectedNodes();
	if(role!='topic'){
		if(!sel.length) return;
		sel2 = sel[0];
		title = sel.length>1?  sel2.name+'..' : sel2.name;
	}

	var isExistShare = $('#isExistShare').is(':checked');
	var existShareID = isExistShare? $('#existShareInput').val() : '';
	if(isExistShare&&!existShareID) {
		alert('请选择需添加到哪个共享');
		return;
	}
	if(isExistShare&&existShareID) {
		shareNode();
		return;
	}

	$( "#mydialog" ).trigger( "dialog-close" );
	$('.company_wrap').show().data('role', 'share');

	var isContact = $('.company_wrap').data('role')=='contact';

	hideContentWrap();
	$('.header').hide();
	$('.msgTitle').html( "分享 "+  title +' 给:' );
	$('.treeCompanyCon').css({}, 300, 'linear');
	updateMenu('.shareMenu');
	treeObj = companyTree;

}


function viewDetail () {
	treeObj = updateTreeObj();
	var sel = treeObj.getSelectedNodes();
	if(!sel.length) return;
	sel = sel[0];

	hideContentWrap();
	$('.header').hide();
	$('.ztreeFile').hide();
	$('.msg_wrap').show();

	if(!isWeiXin) moveUploaderButton( $('.upHolder2') );

	var title = getPath(sel);
	title = title.split('/').slice(0,2).join('/')+'/';
	var windowTitle = title;

	$('.msgTitle .titleContent').html( title );
	$('.msgTree').css({bottom: $('.msgText').height()+10 }).css( {}, 300, 'linear' );

	updateMenu('.msgMenu');
	updateMenu();

	var condition = {  };
	var p;

	//in shareID root folder
	if(sel.isParent && sel.level==1 && sel.shareID) {
		condition.shareID = sel.shareID;
	}

	//sub folder that don't have shareID
	if(sel.isParent && sel.level>1) {
		p = sel;
		while( p && !p.shareID){
			p = p.getParentNode();
		}
		condition.shareID = p.shareID;

		p = getAllFiles(sel);
		var hashA = p.map(function  (v) {
			return v.hash;
		});
		condition.hash = hashA;

	}
	if(sel.isParent && sel.level==0 && sel.userid && sel.isSend ) {
		condition.fromPerson = sel.userid;
	}
	if(sel.isParent && sel.level==0 && sel.userid && sel.isReceive ) {
		condition.toPerson = sel.userid;
	}
	if(!sel.isParent){
		p = sel.getParentNode();
		while( p && !p.shareID){
			p = p.getParentNode();
		}
		condition.shareID = p.shareID;
		condition.hash = [sel.hash];
	}

	$('.msgTree ul').empty();
	$post(host+'/getShareMsg', condition , function(data){
		if(!data)return;
		data = JSON.parse(data);
		var lastData = data[data.length-1];

		if(lastData.touser){

			var touserName = lastData.touserName.split('|');

			var userList = lastData.touser.split('|')
						.map(function(v,i){return  !v?'': '<a href="javascript:;" class="userChat" data-person="'+ v +'"><b>'+touserName[i]+'</b></a>' })
						.filter(function(v,i){return  !!v })
						.getUnique()
						.join(',');

			document.querySelector('.msgTitle .titleContent').innerHTML=( '群成员:<span class="memberList">' + userList + '</span> 标题:'+ windowTitle );

		}

		data.forEach(function  (v) {

			appendShareMsg(v);
		});
	});
}


function sendUserMsg (userid, groupName) {
	if(isWeiXin && wx.openEnterpriseChat){
		wx.openEnterpriseChat({
			userIds: userid,
			groupName: groupName||'',
			success: function(res){
				//alert( JSON.stringify(res) );
			},
		    fail: function(res){
				//alert( JSON.stringify(res));
				if(res.errMsg.indexOf('function not exist') > 0){
	                //alert('微信版本过低请升级')
	            }
			}
		});
	}
}

function appendShareMsg (v){
	if( !v || !$('.msg_wrap').is(':visible') ) return;
	if( v._id && $('.msgTree li[data-id="'+v._id+'"]').length ) return;
	treeObj = updateTreeObj();
	var sel = treeObj.getSelectedNodes();
	if(!sel.length) return;
	sel = sel[0];
	//if(!(sel.isSend||sel.isReceive)) return;

	var title = getPath(sel);
	title = title.split('/').slice(0,2).join('/')+'/';

	var titleReg = title.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	var content, $div;

	// Text Message
	if(v.text ){
		content = v.text.content.replace(new RegExp(titleReg,'ig'), '');

		$div = $('<div></div>');
		$div.html(content);
		$div.find('a').each(function  () {
			if( $(this).html()=='' ) $(this).remove();
			if( $(this).attr('href').match(new RegExp( '/tree.html' ,'i') ) ){
				$(this).attr('href', 'javascript: closeViewDetail() ');
			}
		});
		content = $div.html().replace(/对\s+/, '');


	}

	// Text Message
	if(v.news ){

		var item = v.news.articles.shift();
		content = item.title.replace(new RegExp(titleReg,'ig'), '');

		$div = $('<div></div>');
		$div.html(content+'<br>');
		$div.append( '<img class="msgImage" src="'+ item.picurl +'">' );

		$div.find('a').each(function  () {
			if( $(this).html()=='' ) $(this).remove();
		});

		content = $div.html().replace(/[在|对]\s+/, '');

	}

	var dataAttr = v._id? ' data-id="'+ v._id +'"' : '';
	dataAttr = v.fromUser? ' data-fromuser="'+ v.fromUser +'"' : '';
	var li = $('<li'+ dataAttr +'><span class="msgDate"></span> '+ content +'</li>');
	li.find('.msgDate').data( 'date', v.date );
	li.on('click', function  () {
		return;
		//var user = $(this).data('fromuser');
		//user = v.touser.split('|').getUnique().filter(function(v){return !!v}).join(';');
		//if(user) sendUserMsg(user, windowTitle);
	});
	$('.msgTree ul').append(li);
	$('.msgTree').scrollTop( 99999999999 );

	updateMsgTime();

}

function updateMsgTime () {

	if( !$('.msg_wrap').is(":visible") ){
		// return;
	}

	$('.msg_wrap .msgDate').each(function(i, msgDate){

		var date = $(msgDate).data('date');
		if(!date) return true;

		var dtime = prettyDate(date);
		$(msgDate).html(dtime);

	});
}


function closeViewDetail () {
	var sel = treeObj.getSelectedNodes()[0];
	$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');
	$('.msg_wrap').hide();
	showContentWrap();
	$('.header').show();
	showTab();

	moveUploaderButton( $('.upHolder1') );

	updateMenu(sel);
}

function addShareFiles () {
	var sel = treeObj.getSelectedNodes()[0];
	$( '#'+sendRoot.tId ).hide();
	$( '#'+receiveRoot.tId ).hide();

}

function getShareID (p){
	if(!p) return '';
	while( p && !p.shareID){
		p = p.getParentNode();
	}
	return p && p.shareID;
}

function getShareName (p){
	if(!p) return '';
	while( p && p.level && p.level!=1 ) {
		p = p.getParentNode();
	}
	return p && p.name;
}

function sendShareMsg ( state ) {
	var sel = treeObj.getSelectedNodes();
	if(!sel.length) return;
	sel = sel[0];

	var val = $('.inputMsg').val();
	val = $.trim(val);
	if(!val) return;

	var p = sel;
	while( p && !p.shareID){
		p = p.getParentNode();
	}

	var hash;
	if( sel.isParent && sel.level>1 ) {
		hash = getAllFiles(sel).map(function(v){return v.hash});
	}
	if( !sel.isParent ) {
		hash = sel.hash;
	}

	var fileName, path = getPath(sel);
	if(!sel.isParent) {
		fileName = sel.name;
		path += sel.hash;
	}

	var data = { person: rootPerson.userid, shareID:p.shareID, text:val, hash:hash, fileKey:sel.key, path:path.split('/'), fileName: fileName };

	$post(host+'/sendShareMsg', data , function(ret){
		if(!ret){
			return alert('消息发送错误，请重试');
		}
		$('.msg_wrap .inputMsg').val('');

		ret = JSON.parse(ret);
		//appendShareMsg(ret);

	});

}

function downloadFile () {
	var sel = getSelectFiles().shift();
	if(!sel) return;
	$.get( host+'/downloadFile', {key:getFileKeys(sel).key}, function  (path) {
		$('.downloadIFrame').attr('src', path);
	} );

}


window.wxReady = false;

var wxInitTryCount = 0;
function initWX() {
	$post(host+'/getJSConfig', { url:window.location.href.split('#')[0] }, function(data){
		if(!data){
			if(wxInitTryCount++<3){
				initWX();
			}else{
				alert('获取微信接口错误');
				wx.closeWindow();
			}
			return;
		}

		data = JSON.parse(data);

		wx.config(data);

		wx.ready(function(){
			window.wxReady = true;
			//wxConfigMenu();
			return;
		});
		wx.error(function(res){
			alert('身份验证失败:'+ JSON.stringify(res));
			//wx.closeWindow();
		});

	});
}

function previewImage ( imgArray, curIndex ){
	if(!imgArray) {

		var sel = treeObj.getSelectedNodes().shift();
		if(!sel) return;

		var pNode = sel.getParentNode();
		if(!pNode) return;

		imgArray = pNode.children.filter(function(v){ return v.key && v.key.match(regex_image) }).map( function(v){ return FILE_HOST+ encodeURIComponent(v.key) } );

		curIndex = imgArray.indexOf( FILE_HOST+ encodeURIComponent(sel.key) );
	} else {

		if( !$.isArray(imgArray) ) imgArray = [imgArray];
		curIndex = curIndex || 0;
	}

	if(isWeiXin) {
		wx.previewImage({
		    current: imgArray[curIndex], // 当前显示图片的http链接
		    urls: imgArray // 需要预览的图片http链接列表
		});
	} else {

		if(isNWJS)
			global._nwMain.showReader( imgArray[curIndex] );
		else
			window.open( imgArray[curIndex] );

	}
}

function wxConfigMenu(){
wx.hideAllNonBaseMenuItem();
wx.hideMenuItems({
    menuList: ["menuItem:exposeArticle", "menuItem:setFont",  "menuItem:dayMode", "menuItem:nightMode", "menuItem:share:timeline", "menuItem:share:appMessage", "menuItem:share:qq", "menuItem:share:QZone", "menuItem:share:weiboApp", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", ]
});

wx.showMenuItems({
	menuList: [ "menuItem:refresh", "menuItem:favorite" ]
});

}

function pcUploadImage(){

}


function wxUploadImage() {

	// if(!window.wxReady) return;
	window.confirm('压缩图片吗？(上传较快)', function(ok){

		var sourceType = ok ? 'compressed' : 'original';

		//选择微信照片
		wx.chooseImage({
		    count: 1, // 默认9
		    sizeType: [sourceType], // 可以指定是原图还是压缩图，默认二者都有 ['original', 'compressed']
		    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		    success: function (res) {
		        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
		        localIds.forEach(function(v){

		        	//开始上传图片
		        	wx.uploadImage({
		        	    localId: v, // 需要上传的图片的本地ID，由chooseImage接口获得
		        	    isShowProgressTips: 1, // 默认为1，显示进度提示
		        	    success: function (res) {
		        	        var serverId = res.serverId; // 返回图片的服务器端ID

		        	        var sel = treeObj.getSelectedNodes().shift();

		        	        var shareName = '/'+getShareName(sel)+'/';
		        	        var path = getPath( sel );
		        	        var shareID = getShareID(  sel );

		        	        if(shareID) path = path.replace( /^\/[^/]+/, '' );
		        	        var isInMsg = $('.msg_wrap').is(':visible');


		        	        $.get(host+'/uploadWXImage', {mediaID:serverId, person:rootPerson.userid, path: path, shareID:shareID, isInMsg:isInMsg, shareName:shareName }, function(data){

		        	        	if(!data) return alert('上传图片错误');
		        	        	//appendTree1(data);

		        	        });
		        	    }
		        	});
		        });

		    },
		    fail:function(res){

		    },
		    cancel:function(res){

		    }
		});

	});

}

function addNodes2 (zTree, parent, newNode, isLast) {
    // var zTree = $.fn.zTree.getZTreeObj(tree);
    if(!zTree) return;
    var n = zTree.addNodes(parent, 0, newNode);
    if (!isLast && parent.children[0] != n[0]) {
        while(n.length) zTree.moveNode(parent.children[0], n.pop(), 'prev');
    }
}
// TEST:
// r = treeObj1.getNodes()[0]
// addNodes2(treeObj1, r, [{name:'oisdjfo1'}, {name:'oisdjfo2'}, {name:'oisdjfo3'}])

function markFinish (isFinish) {
	var sel = getSelectFiles().shift();
	var shareID = getShareID(sel);
	$post(host+'/markFinish', { personName:rootPerson.name, person:rootPerson.userid, path:getPath(sel), shareID:shareID, isFinish: isFinish }, function  (data) {
		//console.log(data);
	});
}

function appendTree1(node) {
	node.name = node.name||node.title;
	var rootNode = treeObj1.getNodes()[0];
	treeObj1.addNodes( rootNode ,0, node );
	treeObj1.expandNode( rootNode, true );
	var sel =rootNode.children[0];
	treeObj1.selectNode( sel );
	updateMenu(sel);
}

function initOAth() {
	$.get('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=ACCESS_TOKEN&code=CODE');
}
if(isWeiXin) initWX();



function setupWayPoint1 () {

	if( $('input.searchTxt').val() ) return;

	var el = $('.tree1 .loadMore');
	if(!el.length) return;

	tree1WayPoint = new Waypoint({
	  element: el.get(0),
	  continuous:false,
	  handler: function(direction) {
	  	if( !el.is(':visible') ) return;
		$('.tree1 .ztree').show();
	    if(direction=='down'){
	    	var lastItem = fileData.pop();
	    	if(!lastItem || $(el).data('order')==lastItem.order ) return;
			$(el).data('order', lastItem.order);
			el.next('.loadMoreIndi').show();
			$post(host+'/getfile', {person:rootPerson.userid, startOrder: lastItem.order  }, function  (data) {
				el.next('.loadMoreIndi').hide();
				try{
					data=JSON.parse(data);
				}catch(e){
					return alert('获取文件错误')
				}
				tree1WayPoint.count++;

				if(!data.length){
					tree1WayPoint.disable();
					$(el).css('visibility', 'hidden');
				} else {
					fileData = data;
					var pos = $(window).scrollTop();
					init(data);
					$(window).scrollTop(pos);
					tree1WayPoint.context.refresh();
				}

			}).fail(function(res) { $(el).removeData('order'); alert('服务器连接错误,稍候重试'); });
	    }
	  },
	  offset: function() {
	  	var off = this.context.innerHeight() - this.adapter.outerHeight();
	      return off;
	    }
	});
	tree1WayPoint.count = 0;
}

function setupWayPoint2 () {
	if( $('input.searchTxt').val() ) return;

	var el = $('.tree2 .loadMore');
	if(!el.length) return;

	tree2WayPoint = new Waypoint({
	  element: el.get(0),
	  continuous:false,
	  handler: function(direction) {
	  	if( !el.is(':visible') ) return;
		$('.tree2 .ztree').show();
	    if(direction=='down'){
	    	var lastItem = futurist.array_last_item(treeObj2.getNodes()[0].children) ;
	    	if(!lastItem || $(el).data('shareID')==lastItem.shareID ) return;
			$(el).data('shareID', lastItem.shareID);
			el.next('.loadMoreIndi').show();
			$post(host+'/getShareFrom', {person:rootPerson.userid, startShareID: lastItem.shareID}, function  (data) {
				el.next('.loadMoreIndi').hide();
				try{
					data=JSON.parse(data);
				}catch(e){
					return alert('获取文件错误')
				}
				tree2WayPoint.count++;

				if(!data.length){
					tree2WayPoint.disable();
					$(el).css('visibility', 'hidden');
				} else {
					var sel = treeObj2.getSelectedNodes().shift();
					var pos = $(window).scrollTop();
					initShareFrom(data);
					tree2WayPoint.context.refresh();

					if(sel){
						treeObj2.selectNode(sel);
					}
					$(window).scrollTop(pos);

				}
			}).fail(function(res) { $(el).removeData('shareID'); alert('服务器连接错误,稍候重试'); });

	    }
	  },
	  offset: function() {
	  	var off = this.context.innerHeight() - this.adapter.outerHeight();
	      return off;
	    }
	});
	tree2WayPoint.count = 0;
}

function setupWayPoint3 () {
	if( $('input.searchTxt').val() ) return;

	var el = $('.tree3 .loadMore');
	if(!el.length) return;

	tree3WayPoint = new Waypoint({
	  element: el.get(0),
	  continuous:false,
	  handler: function(direction) {
	  	if( !el.is(':visible') ) return;
		$('.tree3 .ztree').show();
	    if(direction=='down'){
	    	var lastItem = futurist.array_last_item(treeObj3.getNodes()[0].children) ;
	    	if(!lastItem || $(el).data('shareID')==lastItem.shareID ) return;
			$(el).data('shareID', lastItem.shareID);

			el.next('.loadMoreIndi').show();
			$post(host+'/getShareTo', {person:rootPerson.userid, startShareID: lastItem.shareID}, function  (data) {
				el.next('.loadMoreIndi').hide();
				try{
					data=JSON.parse(data);
				}catch(e){
					return alert('获取文件错误')
				}
				tree3WayPoint.count++;

				if(!data.length){
					tree3WayPoint.disable();
					$(el).css('visibility', 'hidden');
				} else {
					var sel = treeObj3.getSelectedNodes().shift();
					var pos = $(window).scrollTop();
					initShareTo(data);
					tree3WayPoint.context.refresh();

					if(sel){
						treeObj3.selectNode(sel);
					}
					$(window).scrollTop(pos);
				}
			}).fail(function(res) { $(el).removeData('shareID'); alert('服务器连接错误,稍候重试'); });

	    }
	  },
	  offset: function() {
	  	var off = this.context.innerHeight() - this.adapter.outerHeight();
	      return off;
	    }
	});
	tree3WayPoint.count = 0;
}


$(function  () {

	var inputWidth = Math.min( $(window).width()-240, 200 );
	$('.searchDIV input.searchTxt').width( inputWidth );
	$('.searchDIV .clearInput').css( 'left', inputWidth+58+'px' );

	var el = $('.clearInput');
	el.css( 'top', el.height()/2 +'px' );

	$('.clearInput').on('click', function  () {
		delete treeObj.prevKeyword;
		$(this).hide().prev().val('');
		searchByName('');
	});

	$post(host+ (wxUserInfo? '/getUserInfo' : '/getLoginUserInfo') , { userid: wxUserInfo? wxUserInfo.UserId:'' }, function  (userinfo) {

		if(!DEBUG) {
			if( !userinfo) {
				alert('非法用户');
				return;
			}

			rootPerson = userinfo;
			updateClientHost();
			if(ws.readyState==1) ws.send( JSON.stringify({ type:'clientConnected', clientName: rootPerson.userid , clientRole:'client', from:isMobile?'mobile':'pc', pcName:1 }) );
		}

		$('.bg_mask').show();
		getFilesData();

		$post(host+'/getCompanyTree', { company:COMPANY_NAME }, function  (data) {
			data = JSON.parse( data );
			companyNode = sortCompanyNode(data);
			companyTree = $.fn.zTree.init($("#companyTree"), companySetting, companyNode);
			companyTree.expandNode( companyTree.getNodes()[0] );
		});

		$post(host+'/getFlowList', { }, function  (data) {
			if(!data)return;
			window.flowData = data;
			var sel = $('.flowSelect');
			data.forEach(function  (v) {
				var option = $('<option value="'+v.name+'">'+v.name+'</option>');
				sel.append(option);
			});
			sel.change(function  (e) {
				var id=this.selectedIndex-1;
				if(id<0){
					$('.flowPerson').empty();
					return;
				}
				window.curFlow = window.flowData[id];
				var persons = window.curFlow.flowPerson;
				var list = persons.map(function  (v) {
					return '<a href="http://www.baidu.com/">['+v.depart+ ']' +v.name+'</a>';
				});

				$('.flowPerson').empty().append( list.join('->') );
			});
		});


	});


	$('#isSign').change(function  () {
		if( $(this).prop('checked') ){
			$('.flowCon, .flowPerson').show();
		} else {
			$('.flowCon, .flowPerson').hide();
		}
	});



	$('.dialog-confirm').bind('click', function  (e) {
		e.preventDefault();
		var role = $( "#mydialog" ).data('role');

		if(role=='flow') shareNode();
		else shareFile(role);
	});


	$('.header ul li').click(function(){
		var idx = $(this).data('idx');
		showTab(idx);
	});


});



// helpers
var futurist = {};

futurist.array_unique = function(array) {
  var a = [], i, j, l, o = {};
  for(i = 0, l = array.length; i < l; i++) {
    if(o[JSON.stringify(array[i])] === undefined) {
      a.push(array[i]);
      o[JSON.stringify(array[i])] = true;
    }
  }
  return a;
};
// remove item from array
futurist.array_remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  array.push.apply(array, rest);
  return array;
};
// remove item from array
futurist.array_remove_item = function(array, item) {
  var tmp = array.indexOf(item)>-1;
  return tmp !== -1 ? futurist.array_remove(array, tmp) : array;
};
// last array element
futurist.array_last_item = function(array) {
  return array.length ? array[array.length-1] : null;
};




var regex_image= /(gif|jpe?g|png|bmp)$/i;
var regex_preview = /(gif|jpe?g|png|bmp|txt)$/i;
var regex_can_be_convert = /(docx?|xlsx?|pptx?|txt)$/i;
var UploadNonImage = false;
var CONVERT_TIMEOUT = 2*60*1000 ; 	//5 mins

function convertPDF () {
	var sel = getSelectFiles().shift();
	if(!sel || sel.isParent) return;
	var shareID = getShareID(sel);
		var data = getFileKeys(sel);
		if(shareID){
			data.shareID = parseInt(shareID);
			var pathA = data.path.split('/').slice(2);
			data.path = '/'+pathA.join('/');
		}


	$('.fConvert').hide();

	if( sel.key.match( regex_image ) ){
		$('.bg_mask').show();
		$post(host+'/uploadPCImage', {person:rootPerson.userid, data: data }, function(ret){
			//console.log(ret);
			showMainWindow();
			$('.bg_mask').hide();
			if(!ret) alert('转换文件发生错误');
		}  );
	}

	if( sel.key.match( regex_can_be_convert ) ){

		$('.bg_mask').show();
		$.ajax({
		  type: 'POST',
		  url: host+'/generatePDFAtPrinter',
		  data: data,
		  // type of data we are expecting in return:
		  dataType: 'json',
		  timeout: CONVERT_TIMEOUT,
		  success: function(ret){
		  	showMainWindow();
		  	$('.bg_mask').hide();
		    if(!ret) return alert('转换超时');
			console.log(ret);
			alert(ret.errMsg!='ok' ? ret.errMsg : '转换成功,已自动加入文件柜并高亮' );
		  },
		  error: function(xhr, type){
		  	showMainWindow();
		  	$('.bg_mask').hide();
		    alert('连接超时或转换服务发生故障，请告知管理员');
		  }
		});
	}
}

$(function () {
    $('#fileupload1').fileupload({
        dataType: 'json',
        add: function (e, data) {
			var isImage = false;
			var isPDF = false;
        	var filename = data.files[0].name;
        	var baseName = filename.split('.');
        	var ext = baseName.pop();
        	baseName = baseName.join('.');
        	if( ext.match(regex_image) ){
        		isImage = true;
        	}

        	if( ext.match(/(pdf)$/i) ){
        		isPDF = true;
        	}

        	if( ! (isImage || isPDF || ext.match(regex_can_be_convert) ) ) {
        		//return alert('文件格式不支持，请选择图片、OFFICE文档、TXT文本文件');
        	}

        	//if(isImage ||UploadNonImage ) {
        	if( UploadNonImage ) {
        		UploadNonImage = false;
        		// if it's  images, upload to our server to generate right PDF.
	        	if (data.autoUpload || (data.autoUpload !== false &&
	    	            $(this).fileupload('option', 'autoUpload') ) ) {
	    	        data.process().done(function () {
	    	            data.submit();
	    	        });
	    	    }
	    	} else {

    			var relativePath =  data.files[0].relativePath||'';

				var sel = getSelectFiles().shift();
				var files = getAllFiles(sel);

				var fileExists = false;
				files.forEach(function(v,i){
    				if( getPath(v)+v.name == getPath(sel) + relativePath + data.files[0].name ){
    					fileExists = true;
    				}
				});

    			if(fileExists) {
    				console.log( 'exist file, skip', getPath(sel) + relativePath + data.files[0].name );
    				return;
    			}
        		// if it's not images, then we upload using Cloud
	    		$post(host+'/getUpToken', function(token){
	    			if(!token) return alert('上传错误');


	    			// $(this).fileupload('option', 'url', 'http://up.qiniu.com');
	    			// data.formData = {key: moment().format('YYYYMMDDHHmmss')+Math.random().toString().slice(2,5)+'.'+ext, token:token };
	    			var key =formatDate('yyyymmddhhiiss')+Math.random().toString().slice(2,5)+'/' + data.files[0].name;
	    			UploadNonImage = true;

	    			var shareID = getShareID( treeObj.getSelectedNodes().shift() );
	    			$('#fileupload1').fileupload('add', {files: data.files, formData:{key:key, token:token, 'x:path':relativePath, 'x:shareID':shareID||'' }, url: 'http://up.qiniu.com'} );
	    			// This will trigger ADD event again, with UploadNonImage = true

	    		});

	    	}
    	    $('.bg_mask').show();

        },

        done: function (e, data) {
        	//console.log(e,data);

        	$('.bg_mask').hide();

        	if( data.result.file ) {
	            $.each(data.result.file, function (index, file) {
	            	if(file.error) return alert(file.error);
	            	$post(host+'/uploadPCImage', {person:rootPerson.userid, filename: encodeURIComponent(file.name) }, function(ret){
	            		//console.log(ret);
	            	}  );
	            });
	        }

	        if( data.result.key ) {
	        	var result = data.result;
				result.person = rootPerson.userid;
				result.client = '';
				result.title = result.fname;

				var sel = getSelectFiles().shift();
				var oldPath = sel? getPath(sel) : '/';


				if( result.shareID ){

					var folder = oldPath.replace(/^\/[^/]+/,'');
					result.path = folder +'/'+ result.srcPath;
					result.path = result.path.replace(/\/\//g, '/');
					result.shareName = '/'+getShareName(sel)+'/';

				} else {
					result.path = oldPath.replace(/[^/]+$/,'') + result.srcPath ;
				}


				result.returnPath = oldPath;

				var isInMsg = $('#fileupload1').parent().is('.upHolder2');
				result.isInMsg = isInMsg;

        		$post(host+'/upfile', result, function(ret){  });

	        	if( data.result.key.match(/(pdf)$/i) ) {

	        	}
	        	return;

	        	/* $post(host+'/generatePDFAtPrinter', data.result, function(ret){
	        		//console.log(ret);
	        	}  ); */

	        }
        }
    });




});


$(document).bind('dragover', function (e) {
    var dropZone = $('#dropzone'),
        timeout = window.dropZoneTimeout;
    if (!timeout) {
        dropZone.addClass('in');
    } else {
        clearTimeout(timeout);
    }
    var found = false,
        node = e.target;
    do {
        if (node === dropZone[0]) {
            found = true;
            break;
        }
        node = node.parentNode;
    } while (node != null);
    if (found) {
        dropZone.addClass('hover');
    } else {
        dropZone.removeClass('hover');
    }
    window.dropZoneTimeout = setTimeout(function () {
        window.dropZoneTimeout = null;
        dropZone.removeClass('in hover');
    }, 100);
});

$(document).bind('drop dragover', function (e) {
    e.preventDefault();
});






window.addEventListener('keydown', handleShortKey);

function handleShortKey (evt) {

      var handled = false;
      var cmd = (evt.ctrlKey ? 1 : 0) |
            (evt.altKey ? 2 : 0) |
            (evt.shiftKey ? 4 : 0) |
            (evt.metaKey ? 8 : 0);

		//console.log(evt.keyCode)

      if (cmd === 0) { // no control key pressed at all.
        //console.log(evt, evt.keyCode);
        switch (evt.keyCode) {
          case 46:  //Delete key
          	if( $('.content_wrap').is(':visible') ) removeTreeNode();
          	handled = true;
          	break;
          case 116:  //F5 key
          	window.location.reload();
            handled = true;
            break;
          case 115: //F4 Key
          	showContact();
          	handled = true;
          	break;
          case 123: //F12 Key
          	toggleDevTools();
          	handled = true;
          	break;
        }

        if( 0&& $('.company_wrap').is(':visible') ) {
        	var key = evt.keyCode-48;
    		var v = $('.searchTxt').last().val();
        	if(key>=0 && key<=42){
        		var c = String.fromCharCode( key );
        		$('.searchTxt').last().val( v+c );
        	}
        	if(evt.keyCode==46){
        		$('.searchTxt').last().val( v.slice(0,-1) );
        	}

        }
      }

    if (cmd === 1 || cmd === 8) {
      switch (evt.keyCode) {
        case 82:  //Ctrl+R
          window.location.reload();
          break;
      }
    }

    if (cmd === 5 || cmd === 12) {
      switch (evt.keyCode) {
        case 90:

          break;
      }
    }



    if(handled){
      evt.preventDefault();
      return;
    }

}




$(function initPage () {

	if(isNWJS) $('.commonFunc').show();

	$('.addFileBtn').click(function  () {

		$(this).next('div').toggleClass('hidden');

		//$('#fileupload1').width( $('#fileupload1').parent().get(0).offsetWidth );
		var menuHeight = $('.addImageBtn').get(0).offsetHeight;
		menuHeight = 42;

		var pop = $('.addFilePopup');
		pop.find( '>a' ).css({padding: '0 '+ ( Math.min( $(pop).width()*0.23, 10) ) +'px'});

		if(isWeiXin) {
			$('.addImageBtn').show();
			//$('#fileupload1').css({ height:menuHeight+'px', top:'0px' });  $('.upHolder1').css({top: 0+'px', height:42 });
		} else {
			$('.addImageBtn').hide();
			//$('#fileupload1').css({ height:menuHeight*2+'px' });  $('.upHolder1').css({top: 0+'px', height:84 });
		}

	});

	$(document).on('click', '.msgImage', function  () {
		previewImage( $(this).attr('src') );
	});
	$(document).on('click', '.userChat', function  () {
		sendUserMsg($(this).data('person'), '');
	});

	$('.msgTitle').click(function(){
		if( $(this).find('.titleContent').height()<20 ) return;
		$(this).toggleClass('expend');
	});

	$('.combineShare').click(function(e){

	});
	$('.addMember').click(function(e){
		addShareMember();

		if( $(e.target).closest('.fFolder').length ){
			$('.company_wrap').data('role-from', 'file');
			$('.content_wrap').data('scrollTop', $(window).scrollTop() );
			$('.content_wrap, .header').hide();
		}
		$(window).scrollTop(0);
	});

	$('#isExistShare').click(function(){
		if( $(this).prop('checked') ) {
			$('.existShareCon').show();
			$('#existShareInput option:first').html('等待加载...');
			$('#existShareInput option:gt(0)').remove();
			$post(host+'/getAllShareID', {person:rootPerson.userid}, function(data){
				if(!data) return alert('获取共享列表失败');
				$('#existShareInput option:first').html('请选择共享ID');
				data.forEach(function(v){
					var toPerson = v.toPerson.map(function(v){return v.name});
					var toStr = toPerson.slice(0,3).join(',');
					toStr += toPerson.length>3?'...' : '';
					$('#existShareInput').append('<option value="'+ v.shareID +'">'+ v.shareID + '('+ v.msg + ') [' + v.fromPerson.map(function(v){return v.name}).join(',') + '->' +  toStr +']</option>');
				});

			}  );

		}else{
			$('.existShareCon').hide();
		}
	});

	$('.exitMember').click(function(){
		$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');

		window.confirm('确定要退出吗？(以后可以由其它成员邀请加入)', function(ok){

			if(!ok)return;

			var sel = treeObj.getSelectedNodes().shift();
			var shareID = getShareID( sel );
			var shareName = '/'+getShareName(sel)+'/';
			$post(host+'/exitMember', { shareID:shareID, shareName:shareName, person:rootPerson.userid, personName:rootPerson.name }, function(ret){

				if(!ret) return alert('退出成员错误');
				var delNode = treeObj.getNodesByFilter( function(node){ return node.shareID==shareID && node.level==1 } ).shift();

				if(delNode) treeObj.removeNode(delNode);

				return closeViewDetail();

			} );

		});

	});



	function addShareMember(){
		$('.company_wrap').show().data('role', 'member');
		treeObj = companyTree;
		$('.msg_wrap').hide();
		$('.company_wrap .msgTitle').html( '选择成员' );
		$('.treeCompanyCon').css({}, 300, 'linear');
		updateMenu('.shareMenu');
	}


	$('.msgTitleMenu').click(function(){
		$(this).toggleClass('active');
		$(this).next().toggleClass('active');

	});


	$('.topMenu').click(function(){
		$('.msgTitleMenuPop').addClass('active');
	});

	var msgDateInterval = setInterval(updateMsgTime, 10000);
	updateContentTop();

	$('[data-click]').off().on(clickE, function  () {
		//eval($(this).data('click'));
	});

	$(document).click(function(e){

		var el = $(e.target);

		if( el.hasClass('popBtn') || el.hasClass('msgTitleMenu') || el.hasClass('topMenu') ) return;

		$('.menuPopup').addClass('hidden');

		$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');
	});

	$('.searchTxt').on('blur keydown change search', debounce(function(){
		var el = $('.searchTxt:visible').last();
		var val = el.val();
		searchByName( val );
		$(el).closest('.searchDIV').find('.clearInput').css('display', val!=''?'block':'none' );

		var idx = $('.currTab').data('idx')+1;
		var loadMore = $('.tree'+idx).find('.loadMore');
		if(val!=''){
			loadMore.hide();
		} else {
			loadMore.show();
		}
	}, 500) );

	$(window).resize(function(){
		$('.msgTitle').width( $(this).width() );
	});
	$(window).resize();
});

function setCompanyTreeCheck (isCheck) {
	isCheck = !isCheck;
	var allNodes = companyTree.getNodesByFilter( function(v){
		v.nocheck = isCheck;
		companyTree.updateNode(v);
	} );
}


function showContact () {

	$('.company_wrap').show().data('role', 'contact');

	var prevPos = $(window).scrollTop();
	$(window).scrollTop(0);

	var isContact = $('.company_wrap').data('role')=='contact';
	setCompanyTreeCheck(isContact ? false : true );

	$('.content_wrap').data('prevPos', prevPos  ).hide();
	$('.msg_wrap').hide();
	$('.header').hide();
	$('.company_wrap .msgTitle').html( '查看联系人' );
	updateMenu('.contactMenu');
	if(!isNWJS){
		$('.fClient').hide();
	}

	treeObj = companyTree;
}

function refreshPage () {
	window.location.reload();
}

function commonFunc () {
	$post(host+'/getCommonFunc', {company: COMPANY_NAME }, function(data){
		if(!data) return alert('获取命令错误');
		var str = '';
		data.commandList.forEach(function(v){
			if(!v.param) v.param=[];
			if( !$.isArray(v.param) ) v.param = [v.param];
			if(v.role=='JS') {
				str += '<p><a href="javascript:'+ v.function +'.apply(this, '+ JSON.stringify(v.param).replace(/"/g,'&quot;') +'); hideDialog(); ">'+ v.name +'</a></p>';
			}
			if(v.role=='EXE') {
				str += '<p><a href="javascript:runCommand.apply(this, '+ JSON.stringify( [v.function].concat(v.param) ).replace(/"/g,'&quot;') +'); hideDialog(); ">'+ v.name +'</a></p>';
			}

		});
		alert(str);
	});
}


function runCommand (cmd) {
	if(!isNWJS) return;
	var exec = require('child_process').exec;
	exec(cmd, function(err,stdout,stderr){

	});
}

function openClient (address) {

	if(!isNWJS) return;
	if(!address){
		var sel = companyTree.getSelectedNodes().shift();
		address = sel.ip || sel.client;
	}
	if(!address) return;
	//var address='192.168.8.116';

	var exec = require('child_process').exec;
	var cmd = '';
	switch (process.platform) {
		case 'darwin':
			cmd='open smb://'+address;
			break;
		case 'win32':
			cmd='explorer \\\\'+address;
			break;
		default:
			return;
			//break;
	}

	exec(cmd, function(err,stdout,stderr){

	});

}

function hideCompanyTree (){
	$('.clearInput:visible').click();
	$('.company_wrap').hide().data('role', '');
	setCompanyTreeCheck(true);

	var prevPos = $('.content_wrap').data('prevPos');
	$('.content_wrap').show();
	$('.header').show();
	updateMenu();
	updateTreeObj();

	$(window).scrollTop(prevPos);
}

function viewContact () {
	var sel = companyTree.getSelectedNodes().shift();
	if(!sel) return;
	var str = '';
	str += '<p>'+ sel.name + '('+sel.userid  +')</p>';
	if(sel.client) str += '<p><a href="javascript:openClient(\''+ sel.client +'\')">'+ sel.client +'</a></p>';
	if(sel.ip) str += '<p><a href="javascript:openClient(\''+ sel.ip +'\')">'+ sel.ip +'</a></p>';
	str += '<p><a href="tel:'+sel.mobile+'">'+ sel.mobile +'</a></p>';
	str += '<p><a href="tel:'+ sel.shortPhone +'">'+ sel.shortPhone +'</a></p>';
	alert(str);
}


function isVisible(el){
	el = $(el);
	while( el.is(':visible') && !el.is(document) ){
		el = el.parent();
	}
	return el.is(document);
}

function debounce(fun, mil){
    var timer;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
            fun();
        }, mil);
    };
}


function searchByName (keyword) {

	if(treeObj.prevKeyword == keyword) return;

	var allNodes = treeObj.getNodesByFilter( function(v){return true} );

	// keyword = $.trim(keyword);
	if(!keyword){
		return treeObj.showNodes(allNodes);
	} else{
		treeObj.hideNodes(allNodes);
	}

	treeObj.prevKeyword = keyword;
	keyword = escapeRe(keyword);

	var nodes2 = [];
	var nodes = treeObj.getNodesByFilter( function(p){
		if(p.level==0) return false;

		if( ( (p.title||p.name)+' '+(p.userid||'')+' '+(p.mobile||'') ).match( new RegExp(keyword, 'i')) ){

			nodes2 = nodes2.concat( treeObj.transformToArray(p) );

			while( p ) {
				nodes2.push(p);
				p = p.getParentNode();
				if(p&&!p.open) treeObj.expandNode(p, true);
			}
		}

	} );

	treeObj.showNodes(nodes2);

	// var nodes2 = $.grep(nodes, function(v, i){
	// 	return nodes.indexOf( v.getParentNode() )==-1;
	// });


	// var nodes = treeObj.getNodesByFilter( function  (node) {
	// 	return true;
	// 	var condition = (node.level&&node.level>0) && !node.isParent && !node.name.match( new RegExp(keyword, 'i') );
	// 	return condition;
	// } );

	// treeObj.hideNodes(nodes);




	// var nodes = treeObj.getNodesByFilter( function  (node1) {
	// 	if( node1.level===0 ) return true;
	// 	if( node1.title.match( new RegExp(keyword, 'i') ) ) return true;
	// 	var nodes2 = treeObj.getNodesByFilter( function(v){
	// 		return v.title.match( new RegExp(keyword, 'i') )
	// 	}, true, node1);
	// 	if(nodes2!=null) return true;
	// } );
	// treeObj.showNodes(nodes);






	// var nodes = treeObj.getNodesByFilter( function  (node1) {
	// 	if( !!$('#'+ node1.tId +'_a').text().match( new RegExp(keyword, 'i')) ) return true;
	// });
	// console.log(nodes)
	// treeObj.showNodes(nodes);
}

function updateContentTop () {
	$('.content_wrap').css('margin-top', $('.header').height() );
}

function moveUploaderButton (el) {

	$('#fileupload1').appendTo( $(el) );

}


function alert (msg) {
  var args =Array.prototype.slice.call(arguments);
  args.splice(1,0,null);
  confirm.apply( this, args );
}

function confirm (msg) {

  var arglen = arguments.length;
  var arg1 = arguments[1];
  var arg2 = arguments[2];
  var lastArg = arguments[arglen-1];
  var callback = typeof lastArg=='function' ? lastArg : function(){};
  var text1 = typeof arg1=='string' ? arg1 : '取消';
  var text2 = typeof arg2=='string' ? arg2 : '确定';

  $("#confirm p.button a:first").css('display', arg1===null?'none':'inline');
  $("#confirm p.button a:last").css('display', arg2===null?'none':'inline');
  $("#confirm p.button span").css('display', arg1===null||arg2===null ?'none':'inline');

  if(text1) $("#confirm p.button a").first().html(text1);
  if(text2) $("#confirm p.button a").last().html(text2);

  $("#confirm .shareMsg").html(msg);
  $("#confirm").trigger("dialog-open");

  $("#confirm p.button a").off().on('click', function(){
    var ret = callback( $(this).data('confirm')==1 );
    if(ret!==false) $("#confirm").trigger("dialog-close");
  });

}

function hideDialog () {
	$("#confirm").trigger("dialog-close");
}



window.shareNodePre = shareNodePre;
window.removeTreeNode = removeTreeNode;
window.renameTreeNode = renameTreeNode;
window.addPictureCon = addPictureCon;
window.addTreeNode = addTreeNode;
window.addTemplateCon = addTemplateCon;
window.addTopic = addTopic;
window.showContact = showContact;
window.commonFunc = commonFunc;
window.refreshPage = refreshPage;
window.sendShareMsg = sendShareMsg;
window.closeViewDetail = closeViewDetail;
window.cutNode = cutNode;
window.shareFileDialog = shareFileDialog;
window.beginFlow = beginFlow;
window.setFileTemplate = setFileTemplate;
window.openPrintCon = openPrintCon;
window.convertPDF = convertPDF;
window.previewImage = previewImage;
window.moveTreeNodeCancel = moveTreeNodeCancel;
window.pasteNode = pasteNode;
window.hideShare = hideShare;
window.hideCompanyTree = hideCompanyTree;
window.viewContact = viewContact;
window.openClient = openClient;
window.previewImage = previewImage;
window.markFinish = markFinish;
window.hideTemplateCon = hideTemplateCon;
window.applyTemplatePre = applyTemplatePre;
window.hidePrintCon = hidePrintCon;
window.applyPrint = applyPrint;
window.viewDetail = viewDetail;
window.viewTemplateImage = viewTemplateImage;


window.alert = alert;
window.confirm = confirm;



// end of INITPAGE
}

// INIT();
