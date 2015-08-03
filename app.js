
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');
var assert = require('assert');

var fs = require('fs');

var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var app = express();

app.use(bodyParser.urlencoded({limit: '2mb', extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '2mb'}));

app.use(multer()); // for parsing multipart/form-data



var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}
app.use(allowCrossDomain);

app.post("/pdf", function (req, res) {
  res.send("You sent ok" );
  //broadcast(req.body);
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


app.post("/upfile", function (req, res) {
  var data = req.body;
  var person = data.person;
  var path = '/';   //first upload to root path
  var fname = data.fname;
  var maxOrder = 0;

  col.find( { person: person } , {limit:2000} ).sort({order:-1}).limit(1).nextObject(function(err, item) {
    if(err) {
      res.send('error');
      return;
    }
    maxOrder = item? item.order+1 : 1;
    console.log( 'maxOrder:', maxOrder );


    col.update({ hash:data.hash }, { person: person, date: new Date(), client:data.client, title:data.title, path:path, key:data.key, fname:fname, hash:data.hash, type:data.type, fsize:data.fsize, imageWidth:data.imageWidth, imageHeight:data.imageHeight, order:maxOrder } , {upsert:true, w: 1}, function(err, result) {
        console.log('upfile: ', data, result.result.nModified);
     });

    res.send(path+fname);

  });


});


app.post("/getfile", function (req, res) {
  var data = req.body;
  var person = data.person;

  col.find( { person: person } , {limit:2000} ).sort({order:-1, title:1}).toArray(function(err, docs){
    if(err) {
      res.send('error');
      return;
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

app.post("/updatefile", function (req, res) {
  var data = req.body.data;
  var type = req.body.type;
  var hashArr = data.map(function  (v) {
    return v.hash;
  });
  data.forEach(function  (v,i) {
    var newV = _.extend(v, {date:new Date() } );
    newV.order = parseFloat(newV.order);
    console.log('updatefile:', v.hash, hashArr);
    col.update({hash: v.hash}, newV, {upsert:true, w:1}, function  (err, result) {
      var pathPart = breakIntoPath(v.path);
      if(err==null && pathPart.length && hashArr.length ) {
        col.remove({path:{ $in: pathPart }, key:{$in:[null,'']}, hash:{$not:{$in:hashArr}} });
      }
    } );
  });

  res.send("update file ok");
});

app.post("/removeFile", function (req, res) {
  var hash = req.body.hash;
  col.remove({hash: hash});
  res.send("delete file ok");
});

app.post("/removeFolder", function (req, res) {
  var data = req.body;
  if(data.deleteAll) col.remove({path: new RegExp('^'+ data.path) });
  res.send("delete folder ok");
});


app.post("/getShareFrom", function (req, res) {
  var person = req.body.person;
  col.find( { fromPerson: person } , {limit:500} ).sort({shareID:-1}).toArray(function(err, docs){
      if(err) return "error";
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/getShareTo", function (req, res) {
  var person = req.body.person;
  col.find( { 'toPerson.userid': person } , {limit:500} ).sort({shareID:-1}).toArray(function(err, docs){
      if(err) return "error";
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/shareFile", function (req, res) {
  var data = req.body.data;
  data.date = new Date();

  col.findOneAndUpdate({role:'config'}, {$inc:{ shareID:1 } }, function  (err, result) {
    console.log(err, result);

    var shareID = result.value.shareID+1;
    data.shareID = shareID;
    data.role = 'share';
    col.insert(data, {w:1}, function(err, r){
      res.send( {err:err, insertedCount: r.insertedCount } );
    });

  } );


});


app.listen(88);
console.log("Listening");


/******** DB part ***********/
// Connection URL
var authUrl = 'mongodb://1111hui.com:27017/admin';
var db = null;
var col = null;
MongoClient.connect(authUrl, function(err, _db) {
  assert.equal(null, err);
  _db.authenticate('root', '820125', function(err, res){
  	assert.equal(null, err);
  	console.log("Connected correctly to server");
	db = _db.db("test");
  col = db.collection('qiniu_bucket01');
	// db.collection('test').find().toArray(function(err, items){ console.log(items); });
	//runCmd("phantomjs main.js");
  });
});


var insertDoc = function(data, callback) {
  assert.notEqual(null, db, "Mongodb not connected. ");
  var col = db.collection('test31');
  console.log(data);
}

/********* WebSocket Part ************/
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 888 });

wss.on('connection', function connection(ws) {
  ws.on('close', function incoming(code, message) {
    console.log("WS close: ", code, message);
    console.log("now close all process");
    if(db) db.close();
    process.exit(1);
  });
  ws.on('message', function incoming(data) {
    //console.log('received: %s', data);
    var msg = JSON.parse(data);
    var msgid = msg.msgid;
    delete msg.msgid;

    //if(msg.type!='search_result') console.log(msgid, msg);

    var cb = msgid? function  (retJson) {
      ws.send(JSON.stringify( {msgid:msgid, result:retJson} ) );
    } : null;

    insertDoc( msg, cb );
  });

  ws.send('connected to ws');
});
function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send( JSON.stringify(data) );
  });
};



var _DBSIGN = "_MONGODATA";

function _log () {
  for(var i=0; i<arguments.length; i++)
    if(arguments[i]) process.stdout.write(arguments[i].toString());
}
function _logErr () {
  for(var i=0; i<arguments.length; i++)
    if(arguments[i]) process.stderr.write(arguments[i]);
}

function genPDF ( infile, imagefile, page, outfile ) {

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
.text(function (message, req, res, next) {
  console.log(message);


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

function updateCompanyTree () {
  var companyTree = [];
  var stuffList = [];
  api.getDepartments(function  (err, result) {
    var i=0;
    var departs = result.department;
    departs.forEach(function  (v) {
      api.getDepartmentUsersDetail(1, 1, 0, function  (err, users) {
        i++;
        v.children = users.userlist;
        companyTree.push(v);
        users.userlist.forEach(function(s){
          if( ! _.where(stuffList, {userid:s.userid }).length ) stuffList.push(s);
        });
        if(i==departs.length){

            col.findOneAndDelete({ company:CompanyName }, function  (err, result) {
                col.update(
                { company:CompanyName }, { company:CompanyName, date: new Date(), companyTree:companyTree, stuffList:stuffList  } ,
                {upsert:true, w: 1},
                function(err, result) {

                  console.log('update companyTree: ', result.result.nModified);
                  col.update( { company:CompanyName, 'companyTree.id':1 }, { '$addToSet': {  'companyTree.$.children': {"userid":"yangjiming","name":"董月霞","department":[1],"mobile":"18072266386","gender":"1","email":"hxsdyjm@qq.com","weixinid":"futurist6","avatar":"http://shp.qpic.cn/bizmp/guTsUowz0NPtOuBoHUiaw3lPyys0DWwTwdUsibvlmwyzdrmYdxwRU4ag/","status":1} } } );

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
      var count = docs.length;
      if(count)
      res.send( JSON.stringify( docs[0].companyTree ) );
  });
});










