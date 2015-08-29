<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>请在菜单中选择：在浏览器中打开</title>
<meta name="apple-touch-fullscreen" content="yes"/>
<meta name="format-detection" content="telephone=no"/>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1, minimum-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black"/>
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="Expires" content="0" />

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
a{
	margin: 10px auto;
}

</style>
</HEAD>
<BODY>


<div id="result">
	<div class="msg">由于微信中不支持下载文件，请按以下步骤下载<p>1.请在右上角微信菜单中选择：在浏览器中打开</p><p>2.在弹出窗口中点以下链接下载</div>
	<p><a href="<?php echo $_GET['url']; ?>" download>下载</a></p>
	<p><a id="backBtn" href="javascript:history.go(-1)">返回</a></p>
</div>

<script type="text/javascript">
var isWeiXin = navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
if(!isWeiXin){
	document.querySelector('#backBtn').href='javascript:window.close()';
	document.querySelector('#backBtn').style.display = 'none';
}
</script>

</body>
</html>