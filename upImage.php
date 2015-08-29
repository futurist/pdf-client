<?php
$data = $_POST['data'];
$fileName = $_POST['fileName'];
$serverFile = time().$fileName;
$fp = fopen('uploads/'.$serverFile,'w'); //Prepends timestamp to prevent overwriting
fwrite($fp, $data);
fclose($fp);
$returnData = array( "serverFile" => $serverFile );
echo json_encode($returnData);

