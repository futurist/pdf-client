var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var jslint = require('gulp-jslint');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var strip = require('gulp-strip-comments');
var replace = require('gulp-replace');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var htmlreplace = require('gulp-html-replace');


gulp.task('html', function() {
  var opts = {
    conditionals: true,
    spare:true,
    comments:false,
    quotes:true
  };

  return gulp.src('./treeSrc.html')
    .pipe(concat('tree.html'))
    .pipe(htmlreplace({
    	css:{ src:'css/build1.css', tpl:'<link rel="stylesheet" href="%s" type="text/css">'},
    	s1:{ src:'build/s1.js', tpl:'<script type="text/javascript" src="%s"></script>'},
    	s2s3:{
    		src:[['build/s2.js','build/s3.js']],
    		tpl:'<script type="text/javascript" src="%s"></script><script type="text/javascript" src="%s"></script>'
    	}
     }) )
    .pipe(replace(/manifest=""/, 'manifest="client2.manifest"'))
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('./'));
});


// replace all.js file basket content with s2.js,s3.js block
gulp.task('appCache', function(){
  gulp.src(['client.manifest'])
  	.pipe(concat('client2.manifest'))
    .pipe(replace(/#VERSION /, '#VERSION b'))
    .pipe(gulp.dest('./'));
});


gulp.task('css', function  () {
	gulp.src([
		'./css/font-awesome.min.css',
		'./css/zTreeStyle.css',
		'./js/dialog.css',
		'./js/selectivity-full.css',
		'./css/tree.css',
		])
	.pipe(concat('build1.css'))
	.pipe(minifyCss())
	.pipe(gulp.dest('css'))
});

gulp.task('s1', function  () {
	gulp.src([
		'./js/jweixin-1.1.0.js',
		'./js/glyphicon.js',
		'./js/basket.full.min.js',
		'./js/cookies.js',
		])
	.pipe(concat('s1.js'))
	//.pipe(strip())
	.pipe(uglify())
	.pipe(gulp.dest('build'))
});



gulp.task('s2', function  () {
	gulp.src([
		'js/fingerprint2.min.js',
		'js/reconnecting-websocket.js',
		'js/ws.js',
		'js/moment.js',
		'js/jquery.js'
	])
	.pipe(concat('s2.js'))
	//.pipe(strip())
	.pipe(uglify())
	.pipe(gulp.dest('build'))
});

// replace all.js file basket content with s2.js,s3.js block
gulp.task('basket-script', function(){
  gulp.src(['js/all.js'])
  	.pipe(concat('all-build.js'))
    .pipe(replace(/\/\/<<--(.+)--[\s\S]+?\/\/-->>/g, '$1'))
    .pipe(replace(/\%random\%/g, +new Date()+Math.random() ))
    .pipe(gulp.dest('js'));
});

gulp.task('s3', function  () {
	gulp.src([
	'js/jquery.ztree.all-3.5.js',
	'js/jquery.ztree.exhide-3.5.js',
	'js/dialog.build.js',
	'js/draggable.js',
	'js/noframework.waypoints.min.js',
	'js/selectivity-full.js',
	'js/vendor/jquery.ui.widget.js',
	'js/jquery.iframe-transport.js',
	'js/jquery.fileupload.js',
	'js/jquery.ba-throttle-debounce.min.js',
	'js/all.js'
		])
	.pipe(concat('s3.js'))
	//.pipe(strip())
	.pipe(uglify())
	.pipe(gulp.dest('build'))
});


gulp.task('script-jshint', function  () {
	gulp.src([
	'js/all.js'
		])
	.pipe(jshint())
  .pipe(jshint.reporter('default'))
});

gulp.task('script-lint', function  () {
	gulp.src([
	'js/all.js'
		])
	.pipe(jslint({
                reporter: function (evt) {
                    var msg = ' ' + evt.file;

                    if (evt.pass) {
                        msg = '[PASS]' + msg;
                    } else {
                        msg = '[FAIL]' + msg;
                    }

                    console.log(msg);
                }
            }))
});

gulp.task('script', function  () {
	gulp.src([
	'js/all.js'
		])
	.pipe(concat('script.js'))
	//.pipe(strip())
	.pipe(uglify())
	.pipe(gulp.dest('build'))
});



gulp.task('watch', function  () {

	var clientFiles = fs.readFileSync('client/client.manifest').toString().split(/\n\r|\r\n|\n/);
	clientFiles = clientFiles.map(function(v){return v.replace('http://1111hui.com/pdf/', '') });
	clientFiles = clientFiles.filter(function(v){ return !/^http:/.test(v) && /\.\w+$/.test(v)  });

	console.log(clientFiles);

	gulp.watch( clientFiles, function(e){

		console.log(e)

	}  );

});


// default gulp task
gulp.task('default', ['s1', 's2', 's3', 'css', 'html', 'appCache'], function() {
});

