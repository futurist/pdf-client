
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');
var assert = require('assert');

var fs = require('fs');
var util = require('util');

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


    col.update({ hash:data.hash }, { person: person, role:'upfile', date: new Date(), client:data.client, title:data.title, path:path, key:data.key, fname:fname, hash:data.hash, type:data.type, fsize:data.fsize, imageWidth:data.imageWidth, imageHeight:data.imageHeight, order:maxOrder } , {upsert:true, w: 1}, function(err, result) {
        console.log('upfile: ', data, result.result.nModified);
     });

    res.send(path+fname);

  });


});


app.post("/getfile", function (req, res) {
  var data = req.body;
  var person = data.person;

  col.find( { person: person, role:'upfile', status:{$ne:-1} } , {limit:2000} ).sort({order:-1, title:1}).toArray(function(err, docs){
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
    newV.role = 'upfile';
    console.log('updatefile:', v.hash,  newV.order);
    col.update({hash: v.hash}, newV, {upsert:true, w:1}, function  (err, result) {
      if(err) {
        res.send('error');return;
      } 
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
  col.update({hash: hash}, {$set:{status:-1}}, {multi:true});
  res.send("delete file ok");
});

app.post("/removeFolder", function (req, res) {
  var data = req.body;
  if(data.deleteAll) col.update({path: new RegExp('^'+ data.path) }, {$set:{status:-1}}, {multi:true});
  res.send("delete folder ok");
});


app.post("/getShareFrom", function (req, res) {
  var person = req.body.person;
  col.find( { 'fromPerson.userid': person, role:'share' } , {limit:500} ).sort({shareID:-1}).toArray(function(err, docs){
      if(err) {
        res.send('error');return;
      }
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/getShareTo", function (req, res) {
  var person = req.body.person;
  col.find( { 'toPerson.userid': person, role:'share' } , {limit:500} ).sort({shareID:-1}).toArray(function(err, docs){
      if(err) {
        res.send('error');return;
      } 
      var count = docs.length;
      res.send( JSON.stringify(docs) );
  });
});

app.post("/getShareMsg", function (req, res) {
  var fromPerson = req.body.fromPerson;
  var toPerson = req.body.toPerson;
  var shareID = req.body.shareID;
  var hash = req.body.hash;
  var keyword = req.body.keyword;
  
  var condition = {  role:'shareMsg', msgtype:'text' };
  if(shareID) condition.shareID = parseInt(shareID,10);
  if(fromPerson) condition.fromPerson = fromPerson;

  function getMsg (shareA, hash) {
      if(!_.isArray(shareA) ) shareA = [shareA];
      
      var hashA = [null];
      if(hash) hashA = hashA.concat(hash);
      shareA = shareA.map( function(v){ return parseInt(v) } );
      var condition = {  role:'shareMsg', shareID:{$in:shareA}, hash:{$in:hashA} };

      console.log(hash, condition);

      col.find( condition , {'text.content':1} , {limit:500} ).sort({shareID:1, date:1}).toArray(function(err, docs){
          if(err) {
            res.send('error');return;
          }
          var count = docs.length;
          res.send( JSON.stringify(docs) );
      });
  }

  if(fromPerson){
    col.find( { 'fromPerson.userid': fromPerson, role:'share' }, {shareID:1, _id:0} , {limit:500} ).sort({shareID:1}).toArray(function(err, docs){
        if(err) {
          res.send('error');return;
        }
        var count = docs.length;
        if(!count){
          res.send('还没有消息');return;
        }
        getMsg( docs.map(function(v){return v.shareID}) );
    });
    return;
  } 

  if(toPerson){
    col.find( { 'toPerson.userid': toPerson, role:'share' }, {shareID:1, _id:0} , {limit:500} ).sort({shareID:1}).toArray(function(err, docs){
        if(err) {
          res.send('error');return;
        }
        var count = docs.length;
        if(!count){
          res.send('还没有消息');return;
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


app.post("/sendShareMsg", function (req, res) {
  var person = req.body.person;
  var text = req.body.text;
  var shareID = parseInt(req.body.shareID);
  var hash = req.body.hash;
  var path = req.body.path;
  var fileName = req.body.fileName;

  if(path) path = path.slice(2);
  var fileHash = path.pop();

  col.findOne( { role:'share', shareID:shareID }, {}, function(err, data) {
      if(err) {
        res.send('error');return;
      }

      if(!data){
          res.send('此共享已删除');return;
        }

      var users = data.fromPerson.concat(data.toPerson).filter(function(v){return v.userid==person});
      if(!users.length){
        res.send('没有此组权限');return;
      }

      //get segmented path, Target Path segment and A link
      var host = "http://1111hui.com/pdf/client/tree.html";
      var pathName = [];
      path.forEach(function(v,i){
        var a = '/'+path.slice(0,i+1).join('/')+'/';
        pathName.push( util.format('<a href="%s?path=%s&dest=share">%s</a>', host, encodeURIComponent(a), v) );
      });
      if(fileHash) {
        var a =  '/'+path.join('/')+'/' + fileHash;
        pathName.push( util.format('<a href="%s?path=%s&dest=share">%s</a>', host, encodeURIComponent(a), fileName) );
     }

     // get OverAllink 
      var a = '/'+path.join('/')+'/';
      var link = '';
      if(fileName && hash ) link = a+hash;
     var overAllPath = util.format('<a href="%s?path=%s&dest=share">%s</a>', host, encodeURIComponent(link), a+fileName ) ;

      var msg = {
       "touser": data.toPerson.map(function(v){return v.userid}).join('|'),
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

      res.send( sendWXMessage(msg) );
  });

  

});


app.post("/shareFile", function (req, res) {
  var data = req.body.data;
  data = JSON.parse(data);
  data.date = new Date();

  col.findOneAndUpdate({role:'config'}, {$inc:{ shareID:1 } }, function  (err, result) {
    console.log(err, result);

    var shareID = result.value.shareID+1;
    data.shareID = shareID;
    data.role = 'share';
    col.insert(data, {w:1}, function(err, r){
      res.send( {err:err, insertedCount: r.insertedCount } );
      if(!err){
        console.log(data.toPerson.map(function(v){return v.userid}).join('|') );

        var msg = {
         "touser": data.toPerson.map(function(v){return v.userid}).join('|'),
         "msgtype": "text",
         "text": {
           "content":
           util.format('%s%s分享了 %d 个文档：%s，收件人：%s%s\n共享ID：%d',
              data.isSign ? "【请求签名】" : "",
              data.fromPerson.map(function(v){return '<a href="http://www.baidu.com/">【'+v.depart + '-' + v.name+'】</a>'}).join('|'),
              data.files.length,
              data.files.map(function(v){return '<a href="http://www.baidu.com/">'+v.title+'</a>'}).join('，'),
              data.selectRange.map(function(v){
                return v.depart? '<a href="http://www.baidu.com/">'+v.depart+'-'+v.name+'</a>' : '<a href="http://www.baidu.com/">【'+v.name+'】</a>' }).join('；'),
              data.msg ? '，附言：\n'+data.msg : '',
              shareID
            )
         },
         "safe":"0",
          date : new Date(),
          role : 'shareMsg',
          shareID:shareID
        };

        res.send( sendWXMessage(msg) );

      }
    });

  } );


});


function sendWXMessage (msg) {
  
  col.insert(msg);

  var msgTo = {};
  if(msg.touser) msgTo.touser = msg.touser;
  if(msg.toparty) msgTo.toparty = msg.toparty;
  if(msg.totag) msgTo.totag = msg.totag;
  delete msg.touser;
  delete msg.toparty;
  delete msg.totag;

  api.send(msgTo, msg, function  (err, result) {
    if(err){
      return ('error');
    }
    console.log(result);
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










