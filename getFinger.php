<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8">
<TITLE>客户端登录</TITLE>
<meta name="apple-touch-fullscreen" content="yes"/>
<meta name="format-detection" content="telephone=no"/>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1, minimum-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black"/>
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="Expires" content="0" />


<script type="text/javascript" src="/js/zepto.js"></script>
<script type="text/javascript" src="/js/cookies.js"></script>
<style type="text/css">
body,html{
	height: 100%;
	width: 100%;
	margin: 0;
	padding: 0;
}
body{
	display: table;
}
#result{
	display: table-cell;
	width: 100%;
	vertical-align: middle;
	text-align: center;
}
#result p{
	color: #666;
}
#result div{
	text-align: center;
}
button{
	margin: 10px auto;
}

</style>
</HEAD>
<BODY>
<?php
	error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);

	header("Access-Control-Allow-Origin: *");
	header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, X-File-Name, Cache-Control');
	header('Access-Control-Allow-Methods: GET,POST,HEAD');
	$code = $_GET['code'];
	$msgid = $_GET['state'];

	//$content=file_get_contents('http://1111hui.com:88/putFingerInfo?code='.$code.'&msgid='.$msgid);
	//echo $content;
?>


<div id="result">
	<div class="msg">正在进行认证...</div>
	<button class="okBtn">确定登录</button>
</div>


<script type="text/javascript">

var code = '<?php echo $code ?>';
var msgid = '<?php echo $msgid ?>';
var host = 'http://1111hui.com:88';
var userData;

//document.querySelector('#result').innerHTML = '客户端登录成功';


$('.okBtn').click(function  () {
	if(!userData) return;

	$.post( host+'/confirmFingerInfo', userData, function  (data) {
		$('button').hide();
		$('.msg').html('<strong>客户端已登录，您的身份信息：</strong><p>'+ data.userid +'</p><p>'+ data.name +'</p><p>'+ data.depart +'</p><strong>(此窗口可随时关闭)</strong>' );
	});
});

$(function init () {
	$('button').hide();
	$.post( host+'/putFingerInfo', { code:code, msgid:msgid }, function  (data) {


		if(!data || data.errcode) {
			$('.msg').html('认证错误');
			$('button').hide();
			$('.closeBtn').show();
			return;
		}

		userData = data;
		//alert( JSON.stringify(data) );

		$('.msg').html('微信认证成功');
		$('button').hide();
		$('.okBtn').show();


	} );
});

</script>


</BODY>
</HTML>