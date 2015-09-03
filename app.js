

// require header

var qiniu = require('qiniu');
var moment = require('moment');
var path = require('path');

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fork = require('child_process').fork;

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');
var assert = require('assert');

var fs = require('fs');
var util = require('util');
var url = require('url');

var urllib = require("urllib");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var multer = require("multer");
var session = require('express-session')

var Datauri = require('datauri');
var QREncoder = require('qr').Encoder;
var mime = require('mime');
var handlebars = require('express-handlebars');
var flash = require('connect-flash');


var redis = require("redis"),
redisClient = redis.createClient(6379, '127.0.0.1', {});

qiniu.conf.ACCESS_KEY = '2hF3mJ59eoNP-RyqiKKAheQ3_PoZ_Y3ltFpxXP0K';
qiniu.conf.SECRET_KEY = 'xvZ15BIIgJbKiBySTV3SHrAdPDeGQyGu_qJNbsfB';
QiniuBucket = 'bucket01';

FILE_HOST = 'http://7xkeim.com1.z0.glb.clouddn.com/';
TREE_URL = "http://1111hui.com:88/tree.html";
VIEWER_URL = "http://1111hui.com/pdf/webpdf/viewer.html";
IMAGE_UPFOLDER = 'uploads/' ;

var fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGE_UPFOLDER)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var fileUploader = multer({ storage: fileStorage })


function safeEval (str) {
  try{
    var ret = JSON.parse(str);
  }catch(e){
    ret = str
  }
  return /object/i.test(typeof ret) ? (ret===null?null:str) : ret;
}


function qiniu_getUpToken() {
	var responseBody =
	{
    "srcPath":"$(x:path)",
		"key":"$(key)",
		"hash":"$(hash)",
		"imageWidth":"$(imageInfo.width)",
		"imageHeight":"$(imageInfo.height)",
		type:"$(type)",
		// client:client,
		// title:title,
		fname:"$(fname)",
		fsize:"$(fsize)"
	};

	var putPolicy = new qiniu.rs.PutPolicy(
		QiniuBucket,
		null,
		null,
		null,
		JSON.stringify( responseBody )
	);

	var uptoken = putPolicy.token();
	return uptoken;
}


function qiniu_uploadFile(file, callback ){

	var ext = path.extname(file);
	var saveFile = path.basename(file); //formatDate('yyyymmdd-hhiiss') + Math.random().toString().slice(1,5) + ext;

	var uptoken = qiniu_getUpToken();

	//console.log( uptoken,saveFile, file );

	qiniu.io.putFile(uptoken, saveFile, file, null, function(err, ret) {
	  console.log(err, ret);

	  // ret.person = "yangjiming";
	  // ret.savePath = savePath;
	  //ret.path = "/abc/";
	  if(callback) callback( ret );

	});

}


/********* Net Socket Part ************/
// server
require('net').createServer(function (socket) {
    //console.log("connected");
	socket.on('error', function(err){
        //console.log(err);
    });
    socket.on('data', function (data) {
        console.log(data.toString());
    });
})
//.listen(81, function(){ console.log('socket ready') });



/********* Redis Part ************/
redisClient.on('error', function (err) {
    console.log('Redis Error ' + err);
});

redisClient.on('connect', function(err){
  console.log('Connected to Redis server' + err);
});



/********* WebSocket Part ************/
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3000 });

// each of WSMSG object structure:
// { msgid: { ws, data  }  }, such as below:
//
// { "142342.453":
//     {
//       timeStamp:+new Date(),
//       ws:[ws object],
//       data:[json data from client]
//     }
// }


var JOBS = {};  // store printer jobs same format as WSMSG
var WSMSG = {}; // store client persistent message
var WSCLIENT = {};
wss.on('connection', function connection(ws) {
  ws.on('close', function incoming(code, message) {
    //console.log("WS close: ", code, message);

    // Find clientName from ws
    var clientName = _.findKey(WSCLIENT, function(v){ return v.ws&&v.ws==ws } );
    console.log('client leave:', clientName, code, message);
    delete WSCLIENT[clientName];

    //_.where( WSCLIENT, {ws:ws} ).forEach();
    // _.where( WSCLIENT, {ws:ws} ).forEach(function(v){
    //     var idx = WSCLIENT.indexOf(v);
    //     if(idx>-1) WSCLIENT.splice( idx , 1  );
    //   });
  });
  ws.on('message', function incoming(data) {
    // Client side data format:
    // reqData = {  msgid:14324.34, data:{a:2,b:3}  }

    // Server response data format:
    // resData = { msgid:14324.34, result:{ userid:'yangjiming' } }
    try{
      var msg = JSON.parse(data);
    } catch(e){
      return console.log(data);
    }

    if(msg.type=='clientConnected' && msg.clientName && msg.clientRole){

      // msg format: { clientName:clientName, clientRole:'printer', clientOrder:1 }
      var suffix = (msg.from? ':'+msg.from: '');
      console.log( 'client up', msg.clientName+suffix );
      WSCLIENT[msg.clientName+suffix] = _.extend( msg, {ws:ws, timeStamp:+new Date()} );
      return;
    }

    if(msg.type=='printerMsg' && msg.msgid) {
      var res = JOBS[msg.msgid].res;
      console.log('job:', msg.printerName, msg.data.key, msg.errMsg);
      if(! res.finished) res.send( msg );
      return;
    }

    var msgid = msg.msgid;
    if(msgid){
        delete msg.msgid;
        console.log(msgid, msg);
        WSMSG.msgid = {ws:ws, timeStamp:+new Date(), data:msg.data};
    }


  });
  console.log('new client connected');
  ws.send('connected');
});

function wsSendClient (clientName, msg) {
  console.log('wssend', clientName);
  var lastClient;
  ['',':mobile',':pc'].forEach(function sendToClient (v) {
    var client = WSCLIENT[clientName+v];
    if(!client) return true;
    msg.clientName = clientName;

    client.ws.send( JSON.stringify(msg)  );
    lastClient = client;
  });

  return lastClient;
}

function choosePrinter () {
  var printers = _.sortBy( _.where(WSCLIENT, {clientRole:'printer'}) , 'clientOrder'  );
  return printers.length ? printers[0] : null;
}

function wsSendPrinter (msg, printerName, res) {

  if(!printerName) {

    var printer = choosePrinter();
    if(!printer) return null;

    printerName = printer.clientName;
  }

  var client = wsSendClient(printerName, msg);

  if(!client) return res.send('');

  JOBS[msg.msgid] = { ws:client.ws, res:res, printerName:client.clientName, timeStamp:+new Date(), data:msg};

  return printerName;

}


function wsBroadcast(data) {
  wss.clients.forEach(function each(client) {
    try{
      client.send( JSON.stringify(data)  );
    }catch(e) { console.log('err send ws', data) }
  });
};

function getWsData(msgid){
  if(!msgid || !WSMSG.msgid) return;
  return WSMSG.msgid.data;
}
function sendWsMsg(msgid, resData) {
  if(!msgid || !WSMSG.msgid) return;
  var ws = WSMSG.msgid.ws;

  //the sendback should be JSON stringify, else throw TypeError: Invalid non-string/buffer chunk
  var ret = { msgid:msgid, result: resData };
  try{
	  ws.send( JSON.stringify(ret)  );
	}catch(e){

	}
}

/**** Client Side example :
// Dependency: https://github.com/joewalnes/reconnecting-websocket

var wsQueue={};
var ws;
function connectToWS(){
  if(ws) ws.close();
  ws = new ReconnectingWebSocket('ws://1111hui.com:3000', null, {debug:false, reconnectInterval:300 });
  ws.onopen = function (e) {
    ws.onmessage = function (e) {
      console.log(e.data);

      if(e.data[0]!="{")return;
          var d=JSON.parse(e.data);
          var callObj= wsQueue[d.msgid];
          if(callObj) {
              callObj[1].call(callObj[0], d.result);
              delete wsQueue[d.msgid];
          }
    }
    ws.onclose = function (code, reason, bClean) {
      console.log("ws error: ", code, reason, bClean);
    }
    console.log('client ws ready');
  }
}
connectToWS();


function wsend(data, that, callback){
  if(!ws || ws.readyState!=1) return;
  var json = {data:data};
  if(callback){
      json.msgid = +new Date() + Math.random();
      wsQueue[json.msgid] = [that, callback];
  }


  ws.send(JSON.stringify(json));
  return json.msgid;
}

********/


/********* Express Part ************/

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Range, Content-Disposition, Content-Description, X-Requested-With,X-File-Type,Origin,Accept,*');
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
}
app.use(allowCrossDomain);

app.set('views', path.join(__dirname, 'client'));
app.engine('hbs', handlebars({
  extname: '.hbs'
}));
app.set('view engine', 'hbs');


app.use(cookieParser(
	"theunsecuritykey837",
	{
		path:'/',
		expires:moment().add(1, 'days')
	}
));
app.use(session({
  secret: 'theunsecuritykey837',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', secure: false, maxAge: 600 }
}));

app.use(bodyParser.urlencoded({limit: '2mb', extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '2mb'}));
app.use(flash());


//app.use(multer()); // for parsing multipart/form-data

var DOWNLOAD_DIR = './downloads/';




app.get("/main.html", function (req, res) {
  res.render('main',{
    abc:1
  });
});

app.post("/pdfCanvasDataLatex", function (req, res) {
  res.send("You sent ok" );
  //wsBroadcast(req.body);
  var data = req.body;
  var src = data.src.replace(/^data:image\/png+;base64,/, "").replace(/ /g, '+');

  fs.writeFile('aaa.png', src, 'base64', function(err) {
      assert.equal(null, err);
      var px = 72.27/72;
      data.pdfWidth *= px;
      data.pdfHeight *= px;
      var scale = data.pdfWidth/data.pageWidth;
      var X=data.offLeft*scale;
      var Y=data.offTop*scale;
      var W=data.imgWidth*scale;
      var cmd = 'xelatex "\\def\\WIDTH{'+data.pdfWidth+'pt} \\def\\HEIGHT{'+data.pdfHeight+'pt} \\def\\X{'+X+'pt} \\def\\Y{'+Y+'pt} \\def\\W{'+W+'pt} \\def\\IMG{'+'aaa.png'+'} \\input{imagela.tex}"';
      console.log(cmd);
      exec(cmd, function(err,stdout,stderr){
        console.log(stderr);
        genPDF("font", 'imagela', data.page, "out");
      });
  });
});





app.post("/getUpToken", function (req, res) {
	res.send( qiniu_getUpToken() );
});

app.post("/getFinger", function (req, res) {
  var msgid = req.body.msgid;
  var reqData = getWsData(msgid);
  if(!reqData) return res.send('');
  var finger = reqData.finger;
  var condition = {finger:finger, role:'finger', date:{$gt: new Date(moment().subtract(1, 'days')) } };

  res.cookie('finger', finger);

  col.findOne( condition , function(err, item){
    if(!item || !item.userid) {

      console.log('not found',msgid, finger);

      var qrStr = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx59d46493c123d365&redirect_uri=http%3A%2F%2F1111hui.com%2F/pdf/getFinger.php&response_type=code&scope=snsapi_base&state='+ msgid +'#wechat_redirect';
      var encoder = new QREncoder;
      dUri = new Datauri();
      encoder.on('end', function(png_data){
          var udata = dUri.format('.png', png_data);
          res.send( { userid:'', qrcode: udata.content } );
      });

      encoder.encode(qrStr, null, {dot_size:5, margin:4} );

    } else {
    	res.send( item );
    }

  } );
});


app.post("/getLoginUserInfo", function (req, res) {

	var finger = req.cookies.finger;
  console.log(finger, 'login');
  if(!finger) return res.send('');

  col.findOne( { finger:finger, role:'finger' } , function(err, item){

    if(!item || !item.userid) {
	     return res.send('');
     }else{
        res.cookie('userid', item.userid);
    	 getUserInfo(item.userid, res);
       //col.updateOne({ msgid:msgid, role:'finger' }, { $set:{msgid:null} } );
     }

  });
});

app.post("/confirmFingerInfo", function (req, res) {
  	var data = req.body;
  	var msgid = data.msgid;

  	// the DATA: data format:
  	// {"UserId":"yangjiming","DeviceId":"d2d4b44c51f855c4e96a9ab0f169a2e5","finger":"727b08525269ddd8fee24a1eac276a76","msgid":"1441194684860.234"}


	col.insertOne(
		{ finger:data.finger, role:'finger', userid:data.UserId, deviceID: data.DeviceId, date:new Date(), msgid:msgid },
		{w:1},
		function(err, result) {

			sendWsMsg( msgid, JSON.stringify(data) );
			getUserInfo(data.UserId, res);

		}
	);


});



app.post("/putFingerInfo", function (req, res) {
  var code = req.body.code;
  var msgid = req.body.msgid;
  var reqData = getWsData(msgid);
  if(!code || !reqData) return res.send('');

  var finger = reqData.finger;
  console.log(finger, msgid, code);

  var tryCount = 0;
  function doit(){

    api.getLatestToken(function  (err, token) {
        if( !token && tryCount++<5 ) {
          doit();return;
        }

        urllib.request("https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token="+ token.accessToken +"&code="+code, function(err, data, meta) {
          if(!data && tryCount++<5 ){
            return doit();
          }
          console.log("wx client auth: ", finger, data.toString() );
          try{
            var ret = JSON.parse( data.toString() );
          }catch(e){ return res.send(''); }
          ret.finger = finger;
          //ret.state = state;
          ret.msgid = msgid;
          res.send( ret );

        });
    });

  }
  doit();

});

app.get("/getUserID", function (req, res) {

  var code = req.query.code;
  var state = req.query.state;
  if(!code){
    return res.send('');
  }

  var tryCount = 0;
  function doit(){

    api.getLatestToken(function  (err, token) {
        if( !token && tryCount++<5 ) {
          doit();return;
        }
        console.log(code, state, token);

        urllib.request("https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token="+ token.accessToken +"&code="+code, function(err, data, meta) {
          if(!data && tryCount++<5 ){
            return doit();
          }
          console.log("new wx client: ", data.toString() );
          try{
          var ret = JSON.parse( data.toString() );
          }catch(e){ return res.send(''); }
          //ret.state = state;
          res.send( JSON.stringify(ret) );
        });
    });

  }
  doit();

});

app.post("/getJSTicket", function (req, res) {
  var tryCount = 0;
  function getTicket(){
    api.getTicket(function(err, result){
      if(err && tryCount++<3){
        getTicket();
      }else{
        res.send( result );
      }
    });
  }
  getTicket();

});


function imageToPDF(person, fileName, res, oldData ){
	var ext = path.extname(fileName);
	var baseName = path.basename(fileName, ext);
  var cmd = ' rm -f '+IMAGE_UPFOLDER+'/*.pdf; cd '+IMAGE_UPFOLDER+'; /bin/cp -rf ../make.tex '+ baseName +'.tex; xelatex "\\def\\IMG{'+ baseName +'} \\input{'+ baseName +'.tex}"';
  exec(cmd, function(err,stdout,stderr){
    //console.log(stdout);
    console.log('pdf file info: ' + baseName,  err, stderr);
    if (err||stderr) return res.send( '' );

    exec('cd '+IMAGE_UPFOLDER+'; rm -f '+baseName+'.tex *.log *.aux; ');

    qiniu_uploadFile(IMAGE_UPFOLDER+ baseName+ '.pdf', function(ret){


      if(ret.error) return res.send('');

      if(oldData){

        ret.person = oldData.person;
        ret.client = oldData.client;
        ret.title = oldData.title+'.pdf';
        ret.path = oldData.path;
        ret.srcFile = oldData.key;


      } else {
        ret.person = person;
        ret.client = '';
        ret.title = '图片上传-'+baseName;
        ret.path = '/';
        ret.srcFile = fileName;
        qiniu_uploadFile(fileName);

      }

      console.log(ret);

      upfileFunc(ret, function(ret2){
        res.send(ret2);
        wsBroadcast(ret2);

      });

    } );
  });
}

app.post("/generatePDFAtPrinter", function (req, res) {

  var CONVERT_TIMEOUT = 2*60*1000 ;
  var data = req.body;
  data.task = 'generatePDF';
  data.msgid = +new Date()+Math.random();
  wsSendPrinter(data, null, res);
  // will wait for job done WS Message from printer client app. check ws message: type=printerMsg

  setTimeout(function printTimeout () {
    if(res.finished) return;
    var job = JOBS[data.msgid];
    if(!job ) return res.send('');
    console.log('job timeout:' , job.printerName, job.data.key);
    return res.send('');
  }, CONVERT_TIMEOUT );

  return;

  var count =0;
  var inter1=setInterval(function  () {
    if( count++ > 120 ){
      clearInterval(inter1);
      res.send('');
    }
    if( JOBS[data.msgid].done ){
      clearInterval(inter1);
      res.send(data);
    }
  }, 1000);


});

app.post("/printPDF", function (req, res) {
	// req data: {server, printer, fileKey, shareID, person }
  var data = req.body;
  data.task = 'printPDF';
  res.send( wsSendPrinter(data, data.server) );
});


app.post("/uploadPCImage", function (req, res) {
  var data = req.body.data;
  var filename = req.body.filename;
  var person = req.body.person;

  // we convert from QINIU cloud
  if(data){

    filename = data.key;
     var ext = filename.split(/\./).pop();

    var baseName = moment().format('YYYYMMDDHHmmss') ;
    var destPath = IMAGE_UPFOLDER+ baseName + '.'+ ext;

    var wget = 'wget -P ' + IMAGE_UPFOLDER + ' -N "' + FILE_HOST+filename +'"';
    var child = exec(wget, function(err, stdout, stderr) {
      console.log( err, stdout, stderr );
      if(err) return res.send('');

      exec( util.format( 'convert "%s" -density 72 "%s"', IMAGE_UPFOLDER+ filename, destPath), function(err, stdout, stderr) {
      	console.log(err,stdout,stderr);
      	if(err) return res.send('');

        imageToPDF(person, destPath, res, data);

      });

    });

  } else{
    // we convert from our server uploaded already from client


      var ext = filename.split(/\./).pop();

     var baseName = moment().format('YYYYMMDDHHmmss') ;
     var destPath = IMAGE_UPFOLDER+ baseName + '.'+ ext;
     exec( util.format( 'convert "%s" -density 72 "%s"', IMAGE_UPFOLDER+ filename, destPath), function(err, stdout, stderr) {
     	if(err) return res.send('');

       imageToPDF(person, destPath, res);

     });

  }


});

app.get("/uploadWXImage", function (req, res) {
  var mediaID = req.query.mediaID;
  var person = req.query.person;
  api.getMedia(mediaID, function(err, buffer, httpRes){
    if(err) {console.log(err); return res.send('');}

    var filename = httpRes.headers['content-disposition'].match(/filename="(.*)"/i).pop();
    var ext = filename.split(/\./).pop();

    var baseName = moment().format('YYYYMMDDHHmmss') ;
    var fileName = IMAGE_UPFOLDER+ baseName + '.'+ ext;

    fs.writeFile(fileName, buffer, function(err){
      console.log(err, 'image file written', fileName);
      if (err) return res.send( '' );
      imageToPDF(person, fileName, res);

    });


    return;
    fs.open(path, 'w', function(err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }

        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('file written');
                res.send('file:'+path);
            })
        });
    });

  });
});

app.post("/getJSConfig", function (req, res) {

  var url = req.body.url;
  var rkey = 'wx:js:ticket:'+ encodeURIComponent(url);
  var param = {
    debug:false,
    jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo","onMenuShareQZone","startRecord","stopRecord","onVoiceRecordEnd","playVoice","pauseVoice","stopVoice","onVoicePlayEnd","uploadVoice","downloadVoice","chooseImage","previewImage","uploadImage","downloadImage","translateVoice","getNetworkType","openLocation","getLocation","hideOptionMenu","showOptionMenu","hideMenuItems","showMenuItems","hideAllNonBaseMenuItem","showAllNonBaseMenuItem","closeWindow","scanQRCode"],
    url: url
  };

  var tryCount = 0;
  function getJsConfig(){
  	api.getLatestToken(function () {
  		api.getJsConfig(param, function(err, result){
  		  if(err && tryCount++<3){
  		    getJsConfig();
  		  }else{
  		    // console.log('wx:', result);
  		    redisClient.set( rkey, JSON.stringify(result), 'ex', 30);
  		    res.send( JSON.stringify(result) );
  		  }
  		});
  	});

  }

  //redisClient.set('aaa', 100, 'ex', 10);
  redisClient.get( rkey , function(err, result){
    if(!result){
      getJsConfig();
    } else {
      // console.log('redis:', result );
      res.send( result );
    }
  } );

});


function upfileFunc (data, callback) {
  var person = data.person;
  var savePath = data.path || data.savePath || '/';   //first upload to root path
  var fname = data.fname;
  var maxOrder = 0;


  col.find( { person: person, role:'upfile', status:{$ne:-1} } , {limit:2000} ).sort({order:-1}).limit(1).nextObject(function(err, item) {
    if(err) {
      return res.send('error');
    }
    maxOrder = item? item.order+1 : 1;
    console.log( 'maxOrder:', maxOrder );

    var newData = _.extend( data, { person: person, role:'upfile', date: new Date(), path:savePath, order:maxOrder } );

    col.update({ hash:data.hash }, newData , {upsert:true, w: 1}, function(err, result) {
        console.log('upfile: ', newData.hash, newData.key, result.result.nModified);
        callback( newData );
     });

  });
}

app.post("/upfile", function (req, res) {

	upfileFunc(req.body, function(ret){
		res.send( JSON.stringify(ret) );
		wsBroadcast(ret);
	});

} );

app.post("/rotateFile", function (req, res) {
	var data = req.body;
	var oldFile, newFile;
	var file_url = data.url;
	var jsonp = data.callback;
	var dir = data.dir;
	if( "LRD".indexOf(dir)==-1 || !file_url.match(/\.pdf$/) ) {
		return res.send("非法参数");
	}

    // extract the file name
    var file_name = url.parse(file_url).pathname.split('/').pop();
    //var newName = file_name.replace(/(\(.*\))?\.pdf$/, '('+ 90 +').pdf' );
    var oldRotate = file_name.match(/(\(.*\))?\.pdf$/)[1];
    oldRotate = oldRotate ? parseInt(oldRotate.replace('(','')) : 0;

    var newRotate = dir=="L"?oldRotate-90 : (dir=="R"?oldRotate+90: oldRotate+180 );
    newRotate = (newRotate+3600)%360;

    var dirName= dir=="L"?"左旋" : (dir=="R"?"右旋":"颠倒");
    var newName = file_name.replace(/(\(.*\))?\.pdf$/, newRotate==0 ? '.pdf' : '('+ newRotate +').pdf' );

    col.findOne({role:'upfile', key: file_name }, function(err, item){
    	if(item){
    		oldFile = item;
    		col.findOne({role:'upfile', key: newName }, function(err2, item2){
    			if(item2){
	    			newFile = item2;
	    			console.log('exist rotate,', newName);
	    			return res.send( JSON.stringify(newFile) );
	    		} else {
					var child = exec('rm -rf '+DOWNLOAD_DIR+'; mkdir -p ' + DOWNLOAD_DIR, function(err, stdout, stderr) {
					    if (err) throw err;
					    else download_file_wget(file_url);
					});
	    		}
    		});
    	} else {
    		return res.send("非法参数");
    	}
    });

	// Function to download file using wget
	var download_file_wget = function(file_url) {


	    function upToQiniu(){

		    // compose the wget command
		    var wget = 'wget -P ' + DOWNLOAD_DIR + ' -N "' + file_url+'"';
		    // excute wget using child_process' exec function

		    var child = exec(wget, function(err, stdout, stderr) {
		        if (err){ throw err; return; }
		        else console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);

		        var pdftk = exec('pdftk "'+ DOWNLOAD_DIR+file_name +'" cat 1-end'+dir+' output "'+DOWNLOAD_DIR+newName+'"' , function(err, stdout, stderr) {
		        	if (err){ throw err; return; }
		        	else console.log('rotate ok '+newName);
		        	//res.send('ok');
		        	qiniu_uploadFile(DOWNLOAD_DIR+newName, function(ret){


		        		if(!ret.error){
			        		ret.person = oldFile.person;
			        		ret.client = oldFile.client;
			        		ret.title = oldFile.title+'('+dirName+')';
			        		ret.path = oldFile.path;
			        	} else if ( ret.error.match(/file exists/) ) {
			        		// file exists or other error
    							delete oldFile._id;
    							oldFile.date = new Date();
    							oldFile.key = newName;
    							oldFile.fname = newName;
    							oldFile.title += '('+dirName+')';
				        	oldFile.hash = ret.hash? ret.hash : +new Date()+Math.random();
				        	ret = oldFile;
				        	console.log('ret:', ret)
			        	}


	        			upfileFunc(ret, function(ret2){
	        				res.send( JSON.stringify(ret2)  );
	        				wsBroadcast(ret);
	        			});

		        		return;

		        	} );
		        });
		    });
		}
		upToQiniu();
	};


});



app.post("/getUserInfo", function (req, res) {

  var data = req.body;
  var userid = data.userid;
  getUserInfo(userid, res);
});

function getUserInfo (userid, res) {
	col.findOne( { company:CompanyName, role:"companyTree", 'stuffList.userid': userid, 'stuffList.status': 1 } , {limit:1, fields:{'stuffList.$':1} }, function(err, item){
    if(err ||  !item.stuffList || !item.stuffList.length) {
      return res.send('');
    }
      res.send( item.stuffList[0] );
  	});
}



app.post("/markFinish", function (req, res) {

    var data = req.body;
    var personName = data.personName;
    var shareID = safeEval(data.shareID) ;
    var path = safeEval(data.path) ;
    var isFinish = safeEval(data.isFinish) ;

    col.findOneAndUpdate({role:'share', shareID:shareID }, { $set: { 'isFinish':!!isFinish }  },
        function(err, result){

          var colShare = result.value;

          res.send(result);
          wsBroadcast( {role:'share', isFinish:isFinish, data:colShare } );

          var overAllPath = util.format('%s#path=%s&shareID=%d', TREE_URL, encodeURIComponent(path), shareID ) ;

          var wxmsg = {
           "touser": colShare.toPerson.map(function(v){return v.userid}).join('|'),
           "touserName": colShare.toPerson.map(function(v){return v.name}).join('|'),
           "msgtype": "text",
           "text": {
             "content":
             util.format('<a href="%s">%s</a>已由%s标记为：%s',
                overAllPath,  // if we need segmented path:   pathName.join('-'),
                path.replace(/^\/|\/$/g,''),
                personName,
                isFinish?'已完成' : '未完成'
              )
           },
           "safe":"0",
            date : new Date(),
            role : 'shareMsg',
            shareID:shareID
          };

          sendWXMessage(wxmsg);

    });

});



app.post("/applyTemplate", function (req, res) {

	var data = req.body;
  var info = data.info;
	var path = data.path;
  	var userid = data.userid;
  	var key = info.key;
  	var newKey = moment().format('YYYYMMDDHHmmss') + '-'+ key.split('-').pop();

  	var client = new qiniu.rs.Client();
	client.copy(QiniuBucket, key, QiniuBucket, newKey, function(err, ret) {
	  if (err) return res.send('error');


    col.findOne( { person: userid, status:{$ne:-1} } , {limit:1, sort:{order:-1}  }, function(err, item) {

    	var maxOrder = item? item.order+1 : 1;

		var fileInfo={
			role:'upfile',
			person:userid,
			client:'',
			title: info.title+'_'+moment().format('YYYYMMDD'),
			path: path,
			date: new Date(),
			key: newKey,
			fname:newKey,
			fsize:info.fsize,
			type:info.type,
			drawData:info.drawData,
			hash: +new Date()+Math.random()+'',
			order:maxOrder
		};

		col.insertOne(fileInfo, {w:1}, function(err,result){
			var id = result.insertedId;
			fileInfo._id = id;
			res.send(fileInfo);
		});

    });


	});

});




app.post("/getTemplateFiles", function (req, res) {

  col.find( { role:'upfile', isTemplate:true } , {limit:2000} ).sort({title:1,date:-1}).toArray(function(err, docs){
    if(err) {
      return res.send('error');
    }
      var count = docs.length;
      res.send( docs );
  });

});


app.post("/setFileTemplate", function (req, res) {
  var data = req.body;
  var hashA = data.hashA;
  var isSet = safeEval(data.isSet);
  col.update({role:'upfile', hash:{$in:hashA} }, { $set:{ isTemplate:isSet } }, {multi:1, w:1}, function(err, result){
  	return res.send(err);
  } );
});

app.post("/getfile", function (req, res) {
  var data = req.body;
  var person = data.person;


  var timeout = false;
  var connInter = setTimeout(function(){
    timeout = true;
    return res.send('');
  }, 5000);

  col.find( { person: person, role:'upfile', status:{$ne:-1} } , {limit:2000, timeout:true} ).sort({order:-1, title:1}).toArray(function(err, docs){
      clearTimeout(connInter); if(timeout)return;
    if(err) {
      return res.send('');
    }
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});


function breakIntoPath(path){
  var part = path.split('/');
  var ret = [], dd = [];
  for(var i=0; i<part.length-1;i++){
    dd.push(part[i]);
    ret.push( dd.join('/') + '/' );
  }
  return ret.slice(1);
}

app.get("/downloadFile2/:name", function (req, res) {

	var file = FILE_HOST+req.query.key;
	var realname = req.params.name;
	var shareID = req.query.shareID||'';
	var userid = req.query.userid||'';
	var person = req.query.person||'';

	var filename = path.basename(file);
  	var mimetype = mime.lookup(file);

  	genPDF(filename, shareID, realname, function  (err) {

  		if(err){
  			res.send('');
  			wsSendClient(person, {role:'errMsg', message:err } );
  			return;
  		}

  		console.log('gen pdf ok, now download', IMAGE_UPFOLDER+realname, mimetype);
  		res.download(IMAGE_UPFOLDER+realname);

  		return;

  		res.setHeader('Content-disposition', 'attachment; filename=' + realname);
		res.setHeader('Content-type', mimetype);

		var filestream = fs.createReadStream( IMAGE_UPFOLDER+realname );
		filestream.pipe(res);
  	});
});


app.get("/downloadFile", function (req, res) {

	var file = FILE_HOST+req.query.key;
	return res.send(file);


	var filename = path.basename(file);
  	var mimetype = mime.lookup(file);

	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimetype);

	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
});

app.post("/updatefile", function (req, res) {
  var data = req.body.data;
  var type = req.body.type;
  var hashArr = data.map(function  (v) {
    return v.hash;
  });

  var isErr = false;
  data.forEach(function  (v,i) {
    var newV = _.extend(v, {date:new Date() } );
    newV.order = parseFloat(newV.order);
    newV.role = 'upfile';
    console.log('updatefile:', v.hash,  newV.order);
    col.update({hash: v.hash}, newV, {upsert:true, w:1}, function  (err, result) {
      if(err) {
      	console.log(err);
        return isErr=true;
      }
      var pathPart = breakIntoPath(v.path);
      if(err==null && pathPart.length && hashArr.length ) {
        col.remove({path:{ $in: pathPart }, key:{$in:[null,'']}, hash:{$not:{$in:hashArr}} });
      }
    } );
  });

  // can also check res.finished is true
  res.send(isErr ? "error update file" : "update file ok");
});

app.post("/removeFile", function (req, res) {
  var hash = req.body.hash;
  col.update({hash: hash}, {$set:{status:-1}}, {multi:true});
  res.send("delete file ok");
});


var escapeRe = function(str) {
    var re = (str+'').replace(/[.?*+^$[\]\\/(){}|-]/g, "\\$&");
    return re;

    // replace unicode Then
    var ret = '';
    for(var i=0;i<re.length;i++) {
    	ret += /[\x00-\x7F]/.test(re[i])?re[i]: '\\u'+re[i].charCodeAt(0).toString(16);
    }
    return ret;
};

app.post("/removeFolder", function (req, res) {
  var data = req.body;

  if(data.deleteAll) col.update({path: new RegExp('^'+ escapeRe(data.path) ) }, {$set:{status:-1}}, {multi:true});
  res.send("delete folder ok");
});

app.post("/saveCanvas", function (req, res) {
  var data = req.body.data;
  var file = req.body.file;
  var personName = req.body.personName;
  var shareID = parseInt( req.body.shareID );

  var filename = url.parse(file).pathname.split('/').pop();
  if(!shareID){
    col.update({role:'upfile', key:filename }, { $set: { drawData:data }  }, function(err, result){
      res.send(err);
    } );
  } else{
    col.findOneAndUpdate({role:'share', shareID:shareID, 'files.key':filename }, { $set: { 'files.$.drawData':data }  },
                        { projection:{'files':1, msg:1, fromPerson:1, toPerson:1, flowName:1, isSign:1  } },
                        function(err, result){
      res.send(err);

            var colShare = result.value;
            var file = colShare.files.filter(function(v){ return v.key==filename; })[0];
            var fileKey = file.key;
            var flowName = colShare.flowName;
            var msg = colShare.msg;
            var isSign = colShare.isSign;
            var overAllPath = util.format('%s#file=%s&shareID=%d&isSign=%d', VIEWER_URL, FILE_HOST+ encodeURIComponent(fileKey), shareID, isSign?1:0 ) ;
            var content =
            colShare.isSign?
            util.format('<a href="%s">流程%d %s (%s-%s)标注已由%s更新，点此查看</a>',
                    overAllPath,  // if we need segmented path:   pathName.join('-'),
                    shareID,
                    msg,
                    colShare.flowName,
                    colShare.fromPerson[0].name,
                    personName
                  ) :
            util.format('<a href="%s">共享%d %s (%s)标注已由%s更新，点此查看</a>',
                    overAllPath,  // if we need segmented path:   pathName.join('-'),
                    shareID,
                    msg,
                    colShare.fromPerson[0].name,
                    personName
                  )


             var wxmsg = {
               "touser": colShare.toPerson.map(function(v){return v.userid}).join('|'),
               "touserName": colShare.toPerson.map(function(v){return v.name}).join('|'),
               "msgtype": "text",
               "text": {
                 "content":content
               },
               "safe":"0",
                date : new Date(),
                role : 'shareMsg',
                shareID:shareID
              };

              sendWXMessage(wxmsg);

    } );
  }

});


app.post("/saveInputData", function (req, res) {
  var textID = req.body.textID;
  var value = req.body.value;
  var file = req.body.file;
  var shareID = parseInt( req.body.shareID );
  try{
    var filename = url.parse(file).pathname.split('/').pop();
  }catch(e){
    return res.send("");
  }
  if(!shareID){
    var obj = {};
    obj['inputData.'+textID.replace('.', '\uff0e')] = value;
    col.update({role:'upfile', 'key':filename }, { $set: obj  }, function(err, result){
    	return res.send("OK");
    });
  } else {
  	// have to replace keys that contains dot(.) in keyname,
  	// http://stackoverflow.com/questions/12397118/mongodb-dot-in-key-name
    var obj = {};
    obj['files.$.inputData.'+textID.replace('.', '\uff0e')] = value;
    col.update({ role:'share', shareID:shareID, 'files.key':filename }, { $set: obj  }, function(err, result){
    	return res.send("OK");
    });
  }

});


app.post("/getInputData", function (req, res) {
  var file = req.body.file;
  var shareID = parseInt( req.body.shareID );
  try{
    var filename = url.parse(file).pathname.split('/').pop();
  }catch(e){
    return res.send("");
  }
  if(!shareID){
    col.findOne({ role:'upfile', 'key':filename },  {fields: {'inputData':1} }, function(err, result){
      if(!result) return res.send("");
    	//convert unicode Dot into [dot]
    	var data = {};
    	_.each(result.inputData, function(v,k){
    		data[k.replace('\uff0e', '.')] = v;
    	});
    	return res.json( data );
    });
  } else {
    col.findOne({ role:'share', shareID:shareID, 'files.key':filename },  {fields: {'files.key.$':1} }, function(err, result){
      if(!result) return res.send("");
    	//convert unicode Dot into [dot]
    	var data = {};
    	_.each( result.files[0].inputData , function(v,k){
    		data[k.replace('\uff0e', '.')] = v;
    	});
    	return res.json( data );
    });
  }

});

app.post("/getSavedSign", function (req, res) {
  var file = req.body.file;
  var shareID = parseInt( req.body.shareID );
  try{
    var filename = url.parse(file).pathname.split('/').pop();
  }catch(e){
    return res.send("");
  }
  if( 0 && !shareID){
    return res.send("");
  } else {
    // col.find({role:'sign', shareID:shareID, file:file, signData:{$ne:null} }, {sort:{signData:1}}).toArray(function(err, docs){
    // col.find({role:'sign', shareID:shareID, file:file }, { }).toArray(function(err, docs){

    function getSignData(err, docs){
      if(err){ return res.send(""); }
      var ids = docs.map(function  (v) {
        return new ObjectID( v.signData );
      });

      col.find({_id:{$in:ids}}, {sort:{_id:1}}).toArray(function (err, items) {
        docs.forEach(function  (v,i) {
          var t = items.filter(function(x){
            return x&&x._id&& v && v.signData && x._id.toHexString() == v.signData.toHexString()
          });
          v.sign = t.shift();
        });
        res.send(docs);
      });
    }

    // For role:'sign', if it's no shareID, then it's template, else it's RealSignData

    if(shareID){

        col.find({role:'sign', shareID:shareID, file:file, signData:{$ne:null} }, {sort:{signData:1}}).toArray(function(err, docs){
            getSignData(err, docs);
          } );

    } else {

      col.findOne({ role:'upfile', key:filename } , {} , function(err, result) {

        if(err || !result ) return res.send('');

        var signIDS = result.signIDS;
        if(!signIDS ) return res.send('');

        col.find({role:'sign',  _id:{ $in:  signIDS.map( function(v){ return new ObjectID(v) } )  } }, { }).toArray(function(err, docs){

          getSignData(err, docs);

        } );

      });


    }






  }

});


app.post("/getCanvas", function (req, res) {
  var file = req.body.file;
  var shareID = parseInt( req.body.shareID );
  try{
    var filename = url.parse(file).pathname.split('/').pop();
  }catch(e){
    return res.send("[]");
  }
  if(!shareID){
    col.findOne({role:'upfile', key:filename }, function(err, result){
      if(!result){ return res.send("[]"); }
      res.send(result.drawData || "[]");
    } );
  } else{
    // below we want project result in array that only one element, like $elemMatch, see:
    //  http://stackoverflow.com/questions/29092265/elemmatch-search-on-array-of-subdocument
    col.findOne({role:'share', shareID:shareID, 'files.key':filename }, {fields: {'files.key.$':1} }, function(err, result){
      if(!result){ return res.send("[]"); }
      // var files = result.files.filter(function(v){
      //   return v.key == filename;
      // });
      res.send(result.files[0].drawData || "[]");
    } );
  }

});


app.post("/getFlowList", function (req, res) {

  col.find( { role:'flow' } , {sort:{name:1}, limit:500}).toArray( function(err, docs){
      if(err) {
        return res.send('');
      }
      res.send( docs );
  });
});




app.post("/getShareData", function (req, res) {
  var shareID = safeEval(req.body.shareID);
  col.findOne( { 'shareID': shareID, role:'share' } , {limit:500} , function(err, item){
      if(err) {
        return res.send('');
      }
      res.send( item );
  });
});


app.post("/getShareFrom", function (req, res) {
  var person = req.body.person;
  var timeout = false;
  var connInter = setTimeout(function(){
    timeout = true;
    return res.send('');
  }, 15000);
  col.find( { 'fromPerson.userid': person, role:'share' } , {limit:500, timeout:true} ).sort({shareID:-1}).toArray(function(err, docs){
      clearTimeout(connInter); if(timeout)return;
      if(err) {
        return res.send('error');
      }
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/getShareTo", function (req, res) {
  var person = req.body.person;
  var timeout = false;
  var connInter = setTimeout(function(){
    timeout = true;
    return res.send('');
  }, 15000);
  col.find( { 'toPerson.userid': person, role:'share' } , {limit:500, timeout:true} ).sort({shareID:-1}).toArray(function(err, docs){
      clearTimeout(connInter); if(timeout)return;
      if(err) {
        return res.send('error');
      }
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/getShareMsg", function (req, res) {
  var fromPerson = req.body.fromPerson;
  var toPerson = req.body.toPerson;
  var shareID = parseInt(req.body.shareID);
  var hash = req.body.hash;
  var keyword = req.body.keyword;

  var condition = {  role:'shareMsg', msgtype:'text' };
  if(shareID) condition.shareID = parseInt(shareID,10);
  if(fromPerson) condition.fromPerson = fromPerson;

  function getMsg (shareA, hash) {
      if(!_.isArray(shareA) ) shareA = [shareA];


      shareA = shareA.map( function(v){ return parseInt(v) } );

      var condition = {  role:'shareMsg', shareID:{$in:shareA} };

      var hashA = [null];
      if(hash) hashA = hashA.concat(hash);
      //if(hashA.length>1) condition.hash = {$in:hashA};

      col.find( condition , {'text.content':1,touser:1, touserName:1} , {limit:500} ).sort({shareID:1, date:1}).toArray(function(err, docs){
          if(err) {
            return res.send('error');
          }
          var count = docs.length;
          res.send( JSON.stringify(docs) );
      });
  }

  if(fromPerson){
    col.find( { 'fromPerson.userid': fromPerson, role:'share' }, {shareID:1, _id:0} , {limit:500} ).sort({shareID:1}).toArray(function(err, docs){
        if(err) {
          return res.send('error');
        }
        var count = docs.length;
        if(!count){
          return res.send('还没有消息');
        }
        getMsg( docs.map(function(v){return v.shareID}) );
    });
    return;
  }

  if(toPerson){
    col.find( { 'toPerson.userid': toPerson, role:'share' }, {shareID:1, _id:0} , {limit:500} ).sort({shareID:1}).toArray(function(err, docs){
        if(err) {
          return res.send('error');
        }
        var count = docs.length;
        if(!count){
          return res.send('还没有消息');
        }
        getMsg( docs.map(function(v){return v.shareID}) );
    });
    return;
  }

  if(shareID) {
    getMsg(shareID, hash);
    return;
  }


  res.send('error');

});

// Save sign info into upfile, signIDS array, with no ShareID
app.post("/drawSign", function (req, res) {

  var data =  req.body.data;
  var signPerson = data.signPerson;
  var file = data.file.split('/').pop() ;
  var page = data.page;
  var pos = data.pos;
  var isMobile = data.isMobile;

  data.isMobile = safeEval(data.isMobile);
  data.page = safeEval(data.page);
  data.scale = safeEval(data.scale);
  data.role = 'sign';
  data.date = new Date();

  col.insertOne(data, {w:1}, function(err,result){
    var id = result.insertedId;

    col.update( { role:'upfile', person:signPerson, key:file }, { $addToSet: { signIDS: id } } );

    res.send(id);
  });

});

app.post("/beginSign", function (req, res) {
  var data =  req.body.data;
  var signPerson = data.signPerson;
  var shareID = parseInt(data.shareID);
  var file = data.file;
  var page = data.page;
  var pos = data.pos;
  var isMobile = data.isMobile;

  data.isMobile = safeEval(data.isMobile);
  data.shareID = safeEval(data.shareID);
  data.page = safeEval(data.page);
  data.scale = safeEval(data.scale);
  data.role = 'sign';
  data.date = new Date();

  col.insertOne(data, {w:1}, function(err,result){
    var id = result.insertedId;
    res.send(id);
  });

});

app.post("/deleteSign", function (req, res) {
  var id =  req.body.id;
  var person =  req.body.person;
  var file =  req.body.file;

  var key = file.split('/').pop();

  if(!id.length){
    return res.send('');
  }
  col.deleteOne({_id:new ObjectID(id) });
  col.update({ role:'upfile', key:key, person:person }, { $pull: { signIDS: new ObjectID(id) } }  );
  res.send('OK');
});

app.post("/deleteSignOnly", function (req, res) {
  var id =  req.body.id;
  if(!id.length){
    return res.send('');
  }

  col.update( {_id:new ObjectID(id) }, { $unset: { 'signData':'' }  } );
  res.send('OK');
});


function getSubStr (str, len) {
  len = len || 10;
  return str.length<=len? str : str.substr(0, len)+'...';
}


app.post("/finishSign", function (req, res) {
  var shareID =  safeEval(req.body.shareID);
  var person =  req.body.person;

  col.findOne({shareID:shareID, role:'share'}, function(err, colShare){
    var flowName = colShare.flowName;
    var curFlowPos = colShare.toPerson.length;
    var file = colShare.files[0];

    var fileKey = file.key;
    var flowName = colShare.flowName;
    var msg = colShare.msg;
    var title = getSubStr( '流程-'+shareID+flowName+ (msg), 50);
    var overAllPath = util.format('%s#path=%s&shareID=%d', TREE_URL, encodeURIComponent(fileKey), shareID ) ;

    if(curFlowPos >= colShare.selectRange.length){

    	col.findOneAndUpdate({role:'share', shareID:shareID }, { $set: { 'isFinish':true }  });

        res.send( util.format( '流程%d %s (%s-%s)已结束，系统将通知相关人员知悉',
                    colShare.shareID,
                    msg,
                    colShare.flowName,
                    colShare.fromPerson[0].name ) );


              var wxmsg = {
               "touser": colShare.toPerson.map(function(v){return v.userid}).join('|'),
               "touserName": colShare.toPerson.map(function(v){return v.name}).join('|'),
               "msgtype": "text",
               "text": {
                 "content":
                 util.format('<a href="%s">流程%d %s (%s-%s)</a>已由%s签署,此流程已结束',
                    overAllPath,  // if we need segmented path:   pathName.join('-'),
                    colShare.shareID,
                    msg,
                    colShare.flowName,
                    colShare.fromPerson[0].name,
                    colShare.toPerson.pop().name
                  )
               },
               "safe":"0",
                date : new Date(),
                role : 'shareMsg',
                shareID:shareID
              };

              sendWXMessage(wxmsg);


      }else{
        var nextPerson = colShare.selectRange[curFlowPos];
        var toPerson = colShare.toPerson;

        //info to all person about the status
        var wxmsg = {
         "touser": colShare.toPerson.map(function(v){return v.userid}).join('|'),
         "touserName": colShare.toPerson.map(function(v){return v.name}).join('|'),
         "msgtype": "text",
         "text": {
           "content":
           util.format('<a href="%s">流程%d %s (%s-%s)</a>已由 %s 签署,此流程已转交给下一经办人：%s',
              overAllPath,  // if we need segmented path:   pathName.join('-'),
              colShare.shareID,
              msg,
              colShare.flowName,
              colShare.fromPerson[0].name,
              toPerson[toPerson.length-1].name,
              nextPerson.name
            )
         },
         "safe":"0",
          date : new Date(),
          role : 'shareMsg',
          shareID:shareID
        };
        sendWXMessage(wxmsg);

        //info to next Person via WX
        var wxmsg = {
         "touser": nextPerson.userid,
         "msgtype": "text",
         "text": {
           "content":
           util.format('您有一个新流程需要签署：<a href="%s">流程%d %s (%s-%s)</a>, %s此前已完成签署。',
              overAllPath,  // if we need segmented path:   pathName.join('-'),
              colShare.shareID,
              msg,
              colShare.flowName,
              colShare.fromPerson[0].name,
              toPerson.map(function(v){return v.name}).join(',')
            )
         },
         "safe":"0",
          date : new Date(),
          role : 'shareMsg',
          privateShareID:shareID
        };
        sendWXMessage(wxmsg);


        col.update( {_id: colShare._id }, {$push: { toPerson: nextPerson }}, {w:1}, function(){
          res.send( util.format( '流程%d(%s-%s)已转交给下一经办人：\n%s',
                  colShare.shareID,
                  colShare.flowName,
                  colShare.fromPerson[0].name,
                  nextPerson.depart+'-'+nextPerson.name ) );
        });
      }

    // col.findOne({role:'flow', name:flowName }, function(err, colFlow){});

  } );

  col.update({role:'share', shareID:shareID, 'toPerson.userid':person }, {$set: {  'toPerson.$.isSigned':true  } } ) ;

});



app.post("/saveSign", function (req, res) {
  var data =  req.body.data;
  var signID =  req.body.signID;
  var hisID =  req.body.hisID;
  var width =  safeEval(req.body.width);
  var height =  safeEval(req.body.height);
  var person;


    col.findOne({role:'sign', _id:new ObjectID(signID)}, function(err, item){
      if(err || !item){
        return res.send("");
      }
      person = item.signPerson;

      function insertHis(id){
        col.update({ _id:new ObjectID(signID) }, {$set:{signData: new ObjectID(id) } }, {w:1}, function(err, result){
          res.send( item );
        });
      }

      if(hisID){
        insertHis(hisID);
      }else{

        col.insertOne( {role:'signBase', person:person, signData: data, width:width, height:height, date:new Date() }, {w:1}, function(err, result){
          // WHEN upserted, Will get insertID like this:
          // var id = result.upsertedCount ? result.upsertedId._id : 0;
          var id = result.insertedId;
          insertHis(id);

        });
      }

    });


});


app.post("/getSignHistory", function (req, res) {
  var signID =  req.body.signID;
  var person;

  col.findOne({role:'sign', _id:new ObjectID(signID)}, function(err, item){
    if(err || !item){
      return res.send("");
    }
    person = item.signPerson;
    col.find({role:'signBase', person:person}, {limit:5, sort:{date:-1} }).toArray(function(err, docs){
      if(err || !docs.length){
        return res.send("");
      }
      //col.deleteMany({role:'signBase', person:person, date:{$lt: docs[docs.length-1].date } });
      res.send( docs );
    });
  });
});


app.post("/sendShareMsg", function (req, res) {
  var person = req.body.person;
  var text = req.body.text;
  var shareID = parseInt(req.body.shareID);
  var hash = req.body.hash;
  var path = req.body.path;
  var fileName = req.body.fileName;
  var fileKey = req.body.fileKey;

  if(path) path = path.slice(1);
  var fileHash = path.pop();

  col.findOne( { role:'share', shareID:shareID }, {}, function(err, data) {
      if(err) {
        return res.send('');	//error
      }

      if(!data){
          return res.send('');	//此共享已删除
        }

      var users = data.fromPerson.concat(data.toPerson).filter(function(v){return v.userid==person});
      if(!users.length){
        return res.send('');	//没有此组权限
      }

      //get segmented path, Target Path segment and A link
      var pathName = [];
      path.forEach(function(v,i){
        var a = '/'+path.slice(0,i+1).join('/')+'/';
        pathName.push( util.format('<a href="%s#path=%s&shareID=%d">%s</a>', TREE_URL, encodeURIComponent(a), shareID, v) );
      });
      if(fileHash) {
        var a =  '/'+path.join('/')+'/' + fileHash;
        pathName.push( util.format('<a href="%s#path=%s&shareID=%d">%s</a>', TREE_URL, encodeURIComponent(fileKey), shareID, fileName) );
     }

     // get OverAllink
      var a = '/'+path.join('/')+'/';
      var link = a;
      if(fileName && fileKey ){
      	link = a+fileKey;
      	a = a +fileName;
      }
     var overAllPath = util.format('<a href="%s#path=%s&shareID=%d&openMessage=1">%s</a>', TREE_URL, encodeURIComponent(link), shareID, a ) ;

      var msg = {
       "touser": data.toPerson.map(function(v){return v.userid}).join('|'),
       "touserName": data.toPerson.map(function(v){return v.name}).join('|'),
       "msgtype": "text",
       "text": {
         "content":
         util.format('%s 对%s 留言：%s',
            users[0].name,
            overAllPath,  // if we need segmented path:   pathName.join('-'),
            text
          )
       },
       "safe":"0",
        date : new Date(),
        role : 'shareMsg',
        shareID:shareID
      };
      if(hash) msg.hash = hash;
      sendWXMessage(msg);

      res.send( msg );

      //wsBroadcast(msg);

  });



});


app.post("/shareFile", function (req, res) {
  var data = req.body.data;
  try{
  data = JSON.parse(data);
  }catch(e){ return res.send(''); }
  data.date = new Date();

  col.findOneAndUpdate({role:'config'}, {$inc:{ shareID:1 } }, function  (err, result) {
    console.log(err, result);

    var shareID = result.value.shareID+1;
    data.shareID = shareID;
    data.role = 'share';
    col.insert(data, {w:1}, function(err, r){
      //res.send( {err:err, insertedCount: r.insertedCount } );
      if(!err){
        console.log(data.toPerson.map(function(v){return v.userid}).join('|') );

        if(!data.isSign){
          var treeUrl = VIEWER_URL + '#file=' + FILE_HOST+ data.files[0].key +'&shareID='+ shareID;
          var content = util.format('共享ID：%d %s%s分享了 %d 个文档：%s，收件人：%s%s\n%s',
              shareID,
              data.isSign ? "【请求签名】" : "",
              data.fromPerson.map(function(v){return '<a href="'+ treeUrl + '&fromPerson='+ v.userid + '">【'+v.depart + '-' + v.name+'】</a>'}).join('|'),
              data.files.length,
              data.files.map(function(v){return '<a href="'+ treeUrl +'">'+v.title+'</a>'}).join('，'),
              data.selectRange.map(function(v){
                return v.depart? '<a href="'+treeUrl + '&toPerson='+ v.userid +'">'+v.depart+'-'+v.name+'</a>' : '<a href="'+treeUrl + '&toDepart='+ v.name +'">【'+v.name+'】</a>' }).join('；'),
              data.msg ? '，附言：\n'+data.msg : '',
              '<a href="'+ treeUrl +'">点此查看</a>'
            );
        } else {
          var treeUrl = VIEWER_URL + '#file=' + FILE_HOST+ data.files[0].key +'&isSign=1&shareID='+ shareID;
          var content = util.format('流程ID：%d %s发起了流程：%s，文档：%s，经办人：%s%s\n%s',
              shareID,
              data.fromPerson.map(function(v){return '<a href="'+treeUrl+ '&fromPerson='+ v.userid + '">【'+v.depart + '-' + v.name+'】</a>'}).join('|'),
              data.flowName,
              data.files.map(function(v){return '<a href="'+ treeUrl +'">'+v.title+'</a>'}).join('，'),
              data.selectRange.map(function(v){
                return v.depart? '<a href="'+treeUrl + '&toPerson='+ v.userid +'">'+v.depart+'-'+v.name+'</a>' : '<a href="'+treeUrl + '&toDepart='+ v.name +'">【'+v.name+'】</a>' }).join('；'),
              data.msg ? '，附言：\n'+data.msg : '',
              '<a href="'+ treeUrl +'">点此查看</a>'
            );
        }
        var msg = {
         "touser": data.toPerson.map(function(v){return v.userid}).join('|'),
         "touserName": data.toPerson.map(function(v){return v.name}).join('|'),
         "msgtype": "text",
         "text": {
           "content": content
         },
         "safe":"0",
          date : new Date(),
          role : 'shareMsg',
          shareID:shareID
        };
        sendWXMessage(msg);
        res.send( data );

        data.openShare = false;
        data.openMessage = false;
        wsBroadcast(data);

      }
    });

  } );


});


function sendWXMessage (msg) {

  if(!msg.tryCount){
    col.insert(msg);
    msg.tryCount = 1;

    // send client message vai ws
    var touser = _.uniq( msg.touser.split('|') );
    touser.forEach(function sendToUserWS (v) {
      wsSendClient(v, msg);
    });

  }

  var msgTo = {};
  if(msg.touser) msgTo.touser = msg.touser;
  if(msg.toparty) msgTo.toparty = msg.toparty;
  if(msg.totag) msgTo.totag = msg.totag;
  // delete msg.touser;
  // delete msg.toparty;
  // delete msg.totag;

  api.send(msgTo, msg, function  (err, result) {
    console.log('sendWXMessage', msg.tryCount, err, result);
    if(err){
      if(msg.tryCount++ <=5)
        setTimeout( function(){
          sendWXMessage(msg);
        },1000);
      return ('error');
    }
    return "OK";
  });
}

app.listen(88);
console.log("Listening");


/******** DB part ***********/
// Connection URL
var authUrl = 'mongodb://1111hui.com:27017/admin';
var db = null;
var col = null;
var MONGO_AUTH = false;

if(MONGO_AUTH) {
	MongoClient.connect(authUrl, function(err, _db) {
	  assert.equal(null, err);
	  _db.authenticate('root', '820125', function(err, res){
	  	assert.equal(null, err);
	  	console.log("Connected to mongodb server");
		db = _db.db("test");
	  col = db.collection('qiniu_bucket01');
		// db.collection('test').find().toArray(function(err, items){ console.log(items); });
		//runCmd("phantomjs main.js");
	  });
	});
} else {
	MongoClient.connect('mongodb://localhost:27017/admin', function(err, _db) {
	  	assert.equal(null, err);

	  	console.log("Connected to mongodb server");
		db = _db.db("test");
	  	col = db.collection('qiniu_bucket01');

	});
}

var insertDoc = function(data, callback) {
  assert.notEqual(null, db, "Mongodb not connected. ");
  var col = db.collection('test31');
  console.log(data);
}



var _DBSIGN = "_MONGODATA";

function _log () {
  for(var i=0; i<arguments.length; i++)
    if(arguments[i]) process.stdout.write(arguments[i].toString());
}
function _logErr () {
  for(var i=0; i<arguments.length; i++)
    if(arguments[i]) process.stderr.write(arguments[i]);
}


function genPDF ( filename, shareID,  realname, cb ) {

	var tempFile = IMAGE_UPFOLDER + (+new Date()+Math.random()) +'.pdf';

	var wget = 'rm -r '+ IMAGE_UPFOLDER+realname+ '; wget -P ' + IMAGE_UPFOLDER + ' -O '+ tempFile +' -N "' + FILE_HOST+filename +'" ';
	var child = exec(wget, function(err, stdout, stderr) {

		console.log( err, stdout, stderr );
		if(err || (stdout+stderr).indexOf('200 OK')<0 ) return cb?cb('无法获取原始文件'):'';

		var tempPDF = IMAGE_UPFOLDER + (+new Date()+Math.random()) +'.pdf';
		var cmd = 'phantomjs --config=client/config client/render.js "file='+ FILE_HOST+filename +'&shareID='+ shareID +'" '+ tempPDF;
		console.log(cmd);

		var child = exec(cmd, function(err, stdout, stderr) {

		if(err || stdout.toString().indexOf('render page:')<0 ) return cb?cb('生成绘图数据错误'):'';
		exec('./mergepdf.py -i '+ tempFile +' -m '+tempPDF+' -o '+ IMAGE_UPFOLDER+realname +' ', function (error, stdout, stderr) {
			console.log(error,stdout, stderr);
			if(error){
				cb('合并PDF文件错误');
			}
			if(cb) cb(null);
		});
		});
	});
}

function genPDF2 ( infile, imagefile, page, outfile ) {

  exec('./mergepdf.py -i '+ infile +'.pdf -m '+imagefile+'.pdf -p '+page+' -o '+ outfile +'.pdf ', function (error, stdout, stderr) {
    console.log(error,stdout, stderr);
  });

  return;

  // pdftoppm -rx 150 -ry 150 -png file.pdf prefix
  // convert image.pdf -verbose -density 177.636  -quality 100 -sharpen 0x1.0 -background "rgba(0,0,0,0)" -transparent white image1x04.pdf
  exec('convert '+imagefile+'.pdf -density '+ scale +' -quality 100 -sharpen 0x1.0 -background "rgba(0,0,0,0)" -transparent white '+ imagefile +'1x.pdf', function (error, stdout, stderr) {
      console.log(stdout);
      exec('./mergepdf.py -i '+ infile +'.pdf -m '+imagefile+'1x.pdf -o '+ outfile +'.pdf ', function (error, stdout, stderr) {
        console.log(stdout);
      });
  });

}


function runCmd (cmd, dir, callback) {

  var args = cmd.split(" ");
  var command = args[0];

  args.shift();

  var proc = spawn(command,   ["--config", "config"].concat(args), {
    cwd: (dir?dir:__dirname),
    stdio: "pipe",
  });

  proc.stdout.setEncoding('utf8');
  proc.stdout.on('data', function (data) {

      console.log(data);
      if( data && ( new RegExp ("^"+_DBSIGN) ).test(data) ) {
        var d = JSON.parse(data.split(_DBSIGN)[1]);
        if(d.type=="genPDF"){
          genPDF("font", d.image, d.scale, "out");
        }
      }else{
        //_log(data);
      }
  });

  proc.stderr.on('data', function (data) {
    _logErr(data);
  });

  proc.on('close', function (code) {
    if(db) db.close();
    console.log('app exited with code ' + code);
  });

  proc.on("error", function (e) {
    console.log(e);
    process.exit(1);
  });

}




////////
// wx part
/******/

var config = {
  token: 'IEAT2qEzDCkT7Dj6JH',
  appid: 'lianrunent',
  encodingAESKey: 'olHrsEf4MaTpiFM1fpjbyvBJnmJNW3yFZBcSbnwYzrJ',
  corpId: 'wx59d46493c123d365'
};

var wechat = require('wechat-enterprise');
app.use('/wx',
wechat(config, wechat
.link(function (message, req, res, next) {
  console.log(message);
  return res.reply(message);
})
.location(function (message, req, res, next) {
//**** message format:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439364875',
//   MsgType: 'event',
//   Event: 'LOCATION',
//   Latitude: '30.069601',
//   Longitude: '120.488655',
//   Precision: '120.000000',
//   AgentID: '1' }

  console.log(message);
  return res.reply(message);
})
.video(function (message, req, res, next) {
  console.log(message);
  return res.reply(message);
})
.voice(function (message, req, res, next) {
//**** message format:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439363658',
//   MsgType: 'voice',
//   MediaId: '1TirVJnXpbd93ddYfVMop_9cYy538dCsnz4N07pgxdYLj5GPWtSHzthH40mF_7quJ1Jyrf22Lj9uWXsVZ64h01Q',
//   Format: 'amr',
//   MsgId: '4561277396023509015',
//   AgentID: '1',
//   Recognition: '' }

  console.log(message);
  return res.reply(message);
})
.event(function (message, req, res, next) {

//****when click MENU LINK, will receive message:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'ceshi1',
//   CreateTime: '1439428547',
//   MsgType: 'event',
//   AgentID: '1',
//   Event: 'view',
//   EventKey: 'http://hostname/tree.html' }

//****when enter Agent, will receive message:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439364874',
//   MsgType: 'event',
//   AgentID: '1',
//   Event: 'enter_agent',
//   EventKey: '' }


//**** when click event menu, message format:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439363611',
//   MsgType: 'event',
//   AgentID: '1',
//   Event: 'click',
//   EventKey: 'file_msg' }

  console.log(message);
  return res.reply(message);
})
.image(function (message, req, res, next) {
//**** message format:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439363357',
//   MsgType: 'image',
//   PicUrl: 'http://mmbiz.qpic.cn/mmbiz/UF3WGRScRh8uhCJcIYcfsH5c5wV6H41lbvkIDzibLMBABZpHBChgfaFbwf2GxTyyUSmd2hy1icqzahicjybtWexoQ/0',
//   MsgId: '4561277396023509014',
//   MediaId: '1x5uMWjTL9tEjewN8IuJCJDPyQCQitHmwnhEzG6dw5q18q_AidkVivdVeNJ0C_eM7s_FWnVBFzYdvo10FOllFQQ',
//   AgentID: '1' }

  console.log(message);
  return res.reply(message);
})
.text(function (message, req, res, next) {
//**** message format:
// { ToUserName: 'wx59d46493c123d365',
//   FromUserName: 'yangjiming',
//   CreateTime: '1439363336',
//   MsgType: 'text',
//   Content: '好的',
//   MsgId: '4561277396023509013',
//   AgentID: '1' }

  console.log(message);
  return res.reply(message);

  res.reply([
  {
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,
{
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,
{
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,
{
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,
{
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,
{
      title: '你来我家接我吧',
      description: '这是女神与高富帅之间的对话',
      picurl: 'http://1111hui.com:88/images/logo.png',
      url: 'http://nodeapi.cloudfoundry.com/'
    } ,

    ]);
})
.location(function (message, req, res, next) {
  console.log(message);
  res.reply("location");
})
));



// Enterprise Push Message part

var CompanyName = 'lianrun';
var API = require('wechat-enterprise-api');
var api = new API("wx59d46493c123d365", "5dyRsI3Wa5gS2PIOTIhJ6jISHwkN68cryFJdW_c9jWDiOn2D7XkDRYUgHUy1w3Hd", 1);
api.setOpts({timeout: 15000});

// get accessToken for first time to cache it.
api.getLatestToken(function () {});



function updateCompanyTree () {
  var companyTree = [];
  var stuffList = [];
  api.getDepartments(function  (err, result) {
    var i=0;
    var departs = result.department;

    departs.forEach(function  (v) {
      api.getDepartmentUsersDetail(1, 1, 0, function  (err, users) {
        i++;
        //v.children = users.userlist;
        v.pId = v.parentid;
        companyTree.push(v);

        users.userlist.forEach(function(s){
          if( s.department.indexOf(v.id)==-1) return true;
          var namedDep = s.department.map(function  (depID) {
            return _.where(departs, { id: depID} )[0].name;
          });

          s.pId = s.department[0];
          s.departmentNames = namedDep;
          s.depart = namedDep?namedDep[0]:'';
          companyTree.push(s);
          if( ! _.where(stuffList, {userid:s.userid }).length ) stuffList.push(s);

        });
        if(i==departs.length){

            col.findOneAndDelete({ company:CompanyName, role:"companyTree" }, function  (err, result) {
                col.update(
                { company:CompanyName, role:"companyTree" }, { company:CompanyName, role:"companyTree", date: new Date(), companyTree:companyTree, stuffList:stuffList  } ,
                {upsert:true, w: 1},
                function(err, result) {

                  console.log('update companyTree: ', result.result.nModified);
                  col.update( { company:CompanyName, role:"companyTree", 'companyTree.id':1 }, { '$addToSet': {  'companyTree.$.children': {"userid":"yangjiming","name":"董月霞","department":[1],"mobile":"18072266386","gender":"1","email":"hxsdyjm@qq.com","weixinid":"futurist6","avatar":"http://shp.qpic.cn/bizmp/guTsUowz0NPtOuBoHUiaw3lPyys0DWwTwdUsibvlmwyzdrmYdxwRU4ag/","status":1} } } );

              });
            });



        }
      });
    });
  });
}

app.get("/updateCompanyTree", function (req, res) {
  updateCompanyTree();
  res.send('OK');
});

app.post("/getCompanyTree", function (req, res) {
  var data = req.body;
  var company = data.company;
  col.find( { company: company } , {limit:2000} ).toArray(function(err, docs){
      if(err|| !docs || !docs.length) return res.send('');
      var count = docs.length;
      if(count)
      res.send( JSON.stringify( docs[0].companyTree ) );
  });
});

app.get("/createDepartment", function (req, res) {
  var name=req.query.name;
  var pid=req.query.pid;
  api.createDepartment(name, {parentid:pid}, function(err, result){
    console.log(err, result);
    return res.send('OK');
  } );
});





app.post("/getPrintList", function (req, res) {
  var data = req.body;
  var company = data.company;
  col.findOne( { company: company, role:'printer' } , {limit:1}, function(err, doc){
      if(err|| !doc) return res.send('');
      res.send( doc );
  });
});












app.use( express.static(path.join(__dirname, 'client'), { index:false, }) );
