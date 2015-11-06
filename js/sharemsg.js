
var isNWJS = false;

var isAndroid = /(android)/i.test(navigator.userAgent);
var isWeiXin = navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
var isiOS = /iPhone/i.test(navigator.userAgent) || /iPod/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent);
var isMobile = isAndroid||isWeiXin||isiOS;

var clickE = isMobile?'ontouchstart':'click';
var downE = isMobile?'ontouchstart':'mousedown';

window.host = "http://1111hui.com:88";
window.FILE_HOST = 'http://7xkeim.com1.z0.glb.clouddn.com/';
window.VIEWER_URL = 'http://1111hui.com/pdf/webpdf/viewer.html';

var windowTitle = '';

var regex_image= /(gif|jpe?g|png|bmp)$/i;
var regex_preview = /(gif|jpe?g|png|bmp|txt)$/i;
var regex_can_be_convert = /(docx?|xlsx?|pptx?|txt)$/i;

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
}

String.prototype.toHTML = function() {
	//.replace(/&/g,'&amp;')
    return this.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function $post (url, data, callback) {
  if (arguments.length == 2) { // if only two arguments were supplied
    if ( typeof(data)=='function' ) {
      callback = data;
      data = {};
    }
  }

  var request = new XMLHttpRequest(), response;
  request.open('POST', url, true);
  request.setRequestHeader( "Content-Type", "application/json" );

  request.onload = function() {

    if (this.status == 200) {
      try {
        //this.response = JSON.parse(this.response);
        callback( this.response );
      } catch(e) {
        // error from url
      }
    }
  };
  request.send( JSON.stringify(data) );
}



function searchToObject(search) {
  return search.substring(1).split("&").reduce(function(result, value) {
    var parts = value.split('=');
    if (parts[0]) result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    return result;
  }, {});
}

var urlQuery = searchToObject( window.location.hash );

var shareID = urlQuery.shareID||277;
var fileKey = urlQuery.fileKey;
var sharePath = urlQuery.sharePath||urlQuery.path||'/共享-277(杨吉明)/';
var picUrl = urlQuery.picurl||'';

windowTitle = sharePath;

var rootPerson = {};


// ************ Check if we are in WX env

var wxUserInfo;
var DEBUG= (urlQuery.debug||0);

if(
window.navigator.userAgent == "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36" || window.navigator.userAgent == "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36" || window.navigator.userAgent == "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36"
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


if(isWeiXin) rootPerson.userid = wxUserInfo.UserId;

onWSReady();


//******* Websocket part **************


ws.addEventListener('open', onWSReady);

ws.addEventListener('message', function(data){
	if( !data || !data.data || !data.data.match(/^\s*{/) ) return;
	try{
		var msg = JSON.parse(data.data);
	}catch(e){ return }

	if(typeof msg!='object') return;

	if(msg.msgID){
		ws.send( JSON.stringify({ type:'msgDone', msgID:msg.msgID, clientName:rootPerson.userid, from:isMobile?'mobile':'pc' }) );
	}

	switch(msg.role) {

		case 'share':

			if(msg.shareID==shareID) appendFiles(msg);
			break;

		case 'shareMsg':

			// Update Message window, when the window is open
			if(msg.shareID==shareID) appendShareMsg(msg);
			break;

		case 'errMsg':
			alert(msg.message);
			break;
	}

});
setInterval(function(){
	if(ws&&ws.readyState==1&&rootPerson.userid) ws.send( JSON.stringify({ type:'clientConnected', timeStamp:WS_TIMESTAMP, clientName: rootPerson.userid , clientRole:'client', from:isMobile?'mobile':'pc', pcName:1 }) );
}, 30000);


// ******************* WX Init Part ******************


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
			if(picUrl){
				previewImage(picUrl);
				picUrl='';
			}
			return;
		});
		wx.error(function(res){
			alert('身份验证失败:'+ JSON.stringify(res));
			//wx.closeWindow();
		});

	});
}
initWX();

// *********************


window.addEventListener('load', initPage);

function initPage () {
	$post(host+'/getShareMsg', {shareID: shareID} , function(data){
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

			document.querySelector('.msgTitle .titleContent').innerHTML=( '<div class="titleh1">群成员:<span class="memberList">'
						+ userList
						+ '</span> 标题:'+ windowTitle + '</div>' );

		}
		data.forEach(function  (v) {
			if(v.role== "files"){
				appendFiles(v);
			}
			if(v.role== "shareMsg") appendShareMsg(v);
		});

		setTimeout(function  () {
			var pos = 99999999999;
			if(urlQuery.msgID){
				pos = $('.msgTree li[data-msgid="'+ urlQuery.msgID +'"]').position().top;
			}
			$('.msgTree').scrollTop( pos );
		}, 100);

	});

	$(document).on('click', '.msgImage', function  () {
		previewImage( $(this).attr('src') );
	});

	$(document).on('click', '.userChat', function  () {
		sendUserMsg($(this).data('person'), windowTitle);
	});

	$(document).on('click', function  (e) {
		if( !$(e.target).is('.msgTitleMenu') ){
			$('.msgTitleMenuPop,.msgTitleMenu').removeClass('active');
		}
	});

	$('.msgTitle').click(function(){
		if( $(this).find('.titleContent').height()<20 ) return;
		$(this).toggleClass('expend').width( $(window).width()-20 );
		$('.msgTitle').scrollTop(0);
	});

	$('.msgTitleMenu').click(function(){
		$(this).toggleClass('active');
		$(this).next().toggleClass('active');

	});
	$('.addMember').hide();

	$('.exitMember').click(function(){

		$('.msgTitleMenu, .msgTitleMenuPop').removeClass('active');

		var ok;
		if(ok=window.confirm('确定要退出吗？(以后可以由其它成员邀请加入)') ) {

			if(!rootPerson.name || !ok)return;

			$post(host+'/exitMember', { shareID:shareID, shareName:sharePath, person:rootPerson.userid, personName:rootPerson.name }, function(ret){

				if(!ret) return alert('退出成员错误');

				closeWin();

			} );

		};

	});

	$('.addShareFile').click(function(){
		alert('消息窗口不支持此功能，请进入文件柜添加文件。');
	});

	if(!isWeiXin && picUrl){
		previewImage(picUrl);
		picUrl='';
	}
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



function openLink  (url, text) {

	var viewerURL = VIEWER_URL+'#file='+ FILE_HOST +url;


	if( isNWJS ){
		global._nwMain.showReader(viewerURL);
	}else
		window.location = viewerURL;

}



function appendFiles (v){
	var addFile = function(file, shareID, isSign){
			var action = '';
			if( /\.pdf$/i.test( file.key )  ) action =  'openLink(&quot;'+ file.key+'&shareID='+(shareID||file.shareID||'')+'&isSign='+(isSign||file.isSign?1:'') +'&quot;)';
			if( isWeiXin&& regex_image.test(file.key) || !isWeiXin&&regex_preview.test(file.key) ){
				action = 'previewImage(&quot;'+ FILE_HOST+file.key +'&quot;)';
			}

			return '<li class="msgFile" data-info="'+ JSON.stringify(file).replace(/\"/g,'&quot;') +'"><a class="'+ (action?'preview':'noPreview') +'" href="javascript:'+ (action||'alert(&quot;此文件不提供预览，可到文件柜下载&quot;);') +'">'+file.path+file.title+'</a></li>';
	}

	if( !v ) return;
	if(v.docs&&v.docs.length){

		$('.msgTitle .titleContent').append('<div class="msgFile"><ul></ul></div>');
		$('.msgFile ul').empty();

		v.docs.forEach(function(f){
			if(!f.files) return;

			var str = f.files.map(function  (file) {
				return addFile(file, f.shareID, f.isSign);
			});

			$('.msgFile ul').append( str.join('') );

		});

	} else if(v.key) {

		var str = addFile(v, v.shareID, v.isSign);
		$('.msgFile ul').append( str );

	}

}

function appendShareMsg (v) {

	if( !v ) return;
	if( v._id && $('.msgTree li[data-id="'+v._id+'"]').length ) return;

	var titleReg = windowTitle.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	var content, $div;

	// Text Message
	if(v.text ){
		//var content = v.text.content.replace(/[在|对].*留言/, '');
		content = v.text.content.replace( /[了|在|对]*\s*\/(共享|流程)[^/]+\/\s*/, '' );
		// if(content.match(/(留言|状态)：/) ){

		// 	var c = content.split('：');
		// 	if(c.length>1){
		// 		var t = c.pop().toHTML();
		// 		content = c.concat(t).join('：');
		// 	}

		// }

		$div = $('<div></div>');
		$div.html(content);
		$div.find('a').each(function  () {
			if( $(this).html()=='' ) $(this).remove();
			if( $(this).attr('href').match(new RegExp( '/tree.html' ,'i') ) ){
				//$(this).attr('href', 'javascript: closeViewDetail() ');
			}
		});
		content = $div.html().replace(/\s+[在|对]\s+/, ' ');
	}

	// Text Message
	if(v.news ){

		var item = v.news.articles.shift();
		content = item.title.replace( /[在|对]*\s*\/(共享|流程)[^/]+\/\s*/, '' );
		$div = $('<div></div>');
		$div.html(content+'<br>');
		var desc = item.description.replace(/^查看消息记录$/,'');
		desc = desc? '<p class="imgDesc">'+ desc.toHTML() +'</p>' : '';
		$div.append( desc+'<img class="msgImage" src="'+ item.picurl +'">' );

		$div.find('a').each(function  () {
			if( $(this).html().match(/^\s*$/) ) $(this).remove();
		});

		content = $div.html().replace(/\s+[在|对]\s+/, ' ');

	}

	var dataAttr = v._id? ' data-id="'+ v._id +'"' : '';
	dataAttr += v.msgID? ' data-msgid="'+ v.msgID +'"' : '';
	dataAttr += v.fromUser? ' data-fromuser="'+ v.fromUser +'"' : '';
	dataAttr += v.status? ' data-status="'+ v.status +'"' : '';

	var li = $('<li'+ dataAttr +'><span class="msgDate" data-date="'+ v.date +'"></span> '+ content +'</li>');
	li.on('click', function  () {
		return;
		var user = $(this).data('fromuser');
		//user = v.touser.split('|').getUnique().filter(function(v){return !!v}).join(';');
		if(user) sendUserMsg(user, windowTitle);
	});
	$('.msgTree ul').append(li);

	updateMsgTime();

	$('.msgTree').scrollTop( 9999999999 );

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


function updateMsgTime () {

	$('.msgDate').each(function(i, msgDate){
		var date = $(msgDate).data('date');
		if(!date) return true;

		var dtime = prettyDate(date);
		$(msgDate).html(dtime);

	});
}


function closeWin () {
	isWeiXin? wx.closeWindow() : window.close();
}


function pcUploadImage() {

}

function addPictureCon() {
	if(isWeiXin) wxUploadImage();
	else pcUploadImage();
};


function previewImage ( imgArray, curIndex ){
	if(!imgArray) {
		return;

	} else {

		if( !$.isArray(imgArray) ) imgArray = [imgArray];
		curIndex = curIndex || 0;
	}

	if( isWeiXin && !regex_image.test(imgArray[curIndex])  || !regex_preview.test(imgArray[curIndex])  ){
		return alert('此文件不提供预览，可到文件柜下载');
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


function wxUploadImage() {

	if(!window.wxReady) return;
	_relay( window.confirm( '压缩图片吗？(上传较快)' ) );

	function _relay(ok) {

		var sourceType = ok ? 'compressed' : 'original';

		//选择微信照片
		wx.chooseImage( {
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


		        	        var folder = sharePath.replace( /^\/[^/]*/, '' );
		        	        var isInMsg = true;


		        	        $.get(host+'/uploadWXImage', {mediaID:serverId, person:rootPerson.userid, path: folder, shareID:shareID, isInMsg:isInMsg, shareName:sharePath, text:$('.inputMsg').val() }, function(data){
		        	        	$('.inputMsg').val('');

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
		} );

	}

}

function sendShareMsg ( status ) {

	var val = $('.inputMsg').val();
	val = $.trim(val);
	if(!val) return;
	$('.msg_wrap .inputMsg').val('');


	var data = { person: rootPerson.userid, shareID:shareID, text:val, fileKey:fileKey, path:sharePath?sharePath.split('/'):[], status:status };

	$post(host+'/sendShareMsg', data , function(ret) {

		if(!ret){
			$('.msg_wrap .inputMsg').val(val);
			return alert('消息发送错误，请重试');
		}

		if(status){
			if($('p[data-shareid="'+ shareID +'"]').length==0){
				$('.curSelectedNode').closest('li.level1').find('a.level1').after( $('<p class="status" data-shareid="'+ shareID +'"></p>') );
			}
			$('p[data-shareid="'+ shareID +'"]').html(val);
		}
		//ret = JSON.parse(ret);
		//appendShareMsg(ret);
		// closeViewDetail();
	});
}

function closeViewDetail () {
	if(isWeiXin){

	}
	setInterval(function  () {closeWin(); }, 300);
	closeWin();
	$('body').removeClass('openMsg');
}

