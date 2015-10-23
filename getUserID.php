<!DOCTYPE html>
<HTML>
<HEAD>
<meta charset="utf-8">
<TITLE>获取用户信息中</TITLE>
<script type="text/javascript" src="/js/cookies.js"></script>
</HEAD>
<BODY>
<?php
	error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);

	header("Access-Control-Allow-Origin: *");
	header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, X-File-Name, Cache-Control');
	header('Access-Control-Allow-Methods: GET,POST,HEAD');
	$code = $_GET['code'];
	$state = $_GET['state'];

	$content=file_get_contents('http://1111hui.com:88/getUserID?code='.$code.'&state=0');
?>
<script type="text/javascript">

var data = '<?php echo $content ?>';
var state = '<?php echo $state ?>';
state = state.replace(/^\s+|\s+$/g,'');

if(!state) Cookies.expire('wxUserInfo');
else Cookies.set('wxUserInfo', data, {expires:6000000});

var WX_JUMP_URL = localStorage.getItem('WX_JUMP_URL');

var url = (state||WX_JUMP_URL).replace('{@@@}', '#');

if(data && url) window.location = url;

</script>
</BODY>
</HTML>