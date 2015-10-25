var fs = require('fs');
var moment = require('moment');
var gulp = require('gulp');


gulp.task('default', function  () {



	[
		'webpdf/app.manifest',
		'client/client.manifest',
		'client/sharemsg.manifest'
	]
	.forEach(function(manifest){

		var fileName = manifest;
		var folderName = manifest.split('/').slice(0,-1).join('/')+'/';

		var fileText = fs.readFileSync(fileName).toString();
		var clientFiles = fileText.split(/\n\r|\r\n|\n/);
		clientFiles = clientFiles.map(function(v){return v.replace('http://1111hui.com/pdf/'+folderName, '') });
		clientFiles = clientFiles.filter(function(v){ return !/^http:|^#/.test(v) && /\.\w+$/.test(v)  });
		clientFiles = clientFiles.map(function(v){return /^http:/.test(v)?v: folderName +v });

		console.log(moment().format('HH:mm:ss.SSS'),  manifest, 'watched', clientFiles )

		gulp.watch( clientFiles, function(e){

			if( e.type=='changed' ){
				fileText = fileText.replace('#VERSION ', '#VERSION z');
				fs.writeFile(fileName, fileText, function(){
					console.log( moment().format('HH:mm:ss.SSS'), 'updated', fileName);
				});
			}

		});

	});


});



