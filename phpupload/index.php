<?php
/*
 * jQuery File Upload Plugin PHP Example 5.14
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
$upload_handler = new UploadHandler( array(
		'upload_dir' => '../../uploads/',
		'accept_file_types' => '/\.(gif|jpe?g|png|bmp)$/i',
		'param_name' => 'file',
		'max_file_size' => 10 * 1024 * 1024,
	) );
