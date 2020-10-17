const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const cm=require('../model/common');
var multer=require('multer')

var routes=require('../routes');
var con=require('../config/database');
var Promise=require('promise');
var fn = require('../firebase/firebase');
var _ = require('lodash');
app.use(bodyparser.json());
app.use(routes);
var constant=require('../constant/constant');
var constantAR=require('../constant/constantAr');
const lang_head=require('./check_lang');
app.use( async function(req, res, next) { 
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	await lang_head.checkLang(req, function(result,err){
		constant = result;
		return next();
	});
});
var base_url=constant.base_url;

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, '../../../../../var/www/html/artBeatz/images')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

var Chat = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, '../../../../../var/www/html/artBeatz/chat_media');
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});


var upload_chat = multer({
    storage: Chat
});

var upload = multer({
    storage: storage
});



app.post("/sendMsg",upload_chat.array('image',5),function(req,res){
    if(!req.body.user_pub_id||!req.body.artist_pub_id||!req.body.chat_type){
        cm.responseMessage(constant.Zero,constant.chkfield,res)
    }else{
    var parData={
        user_pub_id:req.body.user_pub_id,
        artist_pub_id:req.body.artist_pub_id,
        chat_type:req.body.chat_type,
        message:req.body.message,
        send_at:(new Date()).valueOf().toString()
    }
 
    if(req.body.chat_type==1){
        console.log(req.body.chat_type)
        cm.insert('chat',parData,function(err,result){
        console.log(result)
        if(err){
        cm.responseMessage(constant.Zero,err,res)
    }
    else{
        cm.responseMessage(constant.One,constant.MSGSENDSUCCESS,res)
        con.query('select * from user where user_pub_id="'+req.body.artist_pub_id+'"',function(err,result){
        if(err){
            console.log(err)
        }else{

            var result=JSON.parse(JSON.stringify(result[0]));
            console.log(result)
            con.query('select * from user where user_pub_id="'+req.body.user_pub_id+'"',function(err,resultUser){
            if(err){
                cm.responseMessage(constant.Zero,err,res)
            }else{
                var resultUser=JSON.parse(JSON.stringify(resultUser[0]));     
                var device_token=result.device_token;
                var artist_pub_id=result.user_pub_id;
                var user_name=result.name
                var user_image= result.image;
                var user_name1=resultUser.name
                var title="Chat";
                var msg = req.body.message;
                var type=constant.chat_type1;
                var image_url=constant.base_url+resultUser.image

                // fn.pushNotificationChat(title, msg, device_token,type,req.body.user_pub_id,user_name1);
                fn.pushNotificationChat11(title, msg, device_token,type,req.body.user_pub_id,user_name1,image_url);
            }
        })
        
        }
    })
   
  }
  })
}
else if(req.body.chat_type==2){
   var parData={
  user_pub_id:req.body.user_pub_id,
  artist_pub_id:req.body.artist_pub_id,
  chat_type:req.body.chat_type,
  message:req.body.message,
   send_at:(new Date()).valueOf().toString(),
    image:base_url+"artBeatz/chat_media/"+req.files[0].filename,
 }
 console.log(req.files)
 console.log(req.body)
if(!req.files){
    cm.responseMessage(constant.Zero,constant.chkfield,res)
}
  cm.insert('chat',parData,function(err,result){
    console.log(result);
  if(err){
    cm.responseMessage(constant.Zero,err,res)
  }
  else{

    cm.responseMessage(constant.One,constant.MSGSENDSUCCESS,res)

  con.query('select *from user where user_pub_id="'+req.body.artist_pub_id+'"',function(err,result){
        if(err){
            console.log(err)
        }else{
            var result=JSON.parse(JSON.stringify(result[0]));
            con.query('select * from user where user_pub_id="'+req.body.user_pub_id+'"',function(err,resultUser){
                if(err){
                    cm.responseMessage(constant.Zero,err,res)
                }else{
               var resultUser=JSON.parse(JSON.stringify(resultUser[0]));     
var device_token=result.device_token;
var artist_pub_id=result.user_pub_id;
var user_name=result.name
var user_name1=resultUser.name
var title="Chat";
var msg = req.body.message;
var type=constant.chat_type1;
var image_url=constant.base_url+resultUser.image;
fn.pushNotificationChat11(title, msg, device_token,type,req.body.user_pub_id,user_name1,image_url);

}
            })
           
        }
    })
  }
  })

}

}
})

app.post("/getMyChat", function(req, res) {
    if (!req.body.user_pub_id || !req.body.artist_pub_id) {
        res.send({
            "status": 0,
            "message": constant.chkfield
        });
    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
                cm.responseMessage(constant.Zero,err,res)
            } else {
                cm.getMyChat(req.body.user_pub_id, req.body.artist_pub_id, function(err, chat_result) {
                    if (err) {
                        cm.responseMessage(constant.Zero,err,res)
                    } else {
                        if (chat_result.length > 0) {
                            
                            res.send({
                                "status": 1,
                                "message": constant.CHAT_HISTORY,
                                "data": chat_result
                            });
        
                        } else {
                            cm.responseMessage(constant.Zero,constant.NODATA,res)
                        }
                    }
                });
            }
        });
    }
});


app.post("/getChatHistory", function(req, res) {
    if (!req.body.user_pub_id ) {
        cm.responseMessage(constant.Zero,constant.chkFields,res)

    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
                
                cm.responseMessage(constant.Zero,err,res)

            } else {
                         cm.getChatHistory(req.body.user_pub_id, function(err, chat_result) {
                        if (err) {
                            cm.responseMessage(constant.Zero,err,res)

                        } else {
                           if(chat_result.length>0){
                            final_result = _.uniqBy(chat_result, 'artist_pub_id');
                            res.send({
                                "status": 1,
                                "message": constant.CHAT_HISTORY,
                                "data": final_result
                            });
                               
                        }else{
                            res.send({
                                "status": 0,
                                "message": constant.NODATA,
                               
                            });
                           }
                    }
                  })
            }
        });
    }
});


module.exports=app