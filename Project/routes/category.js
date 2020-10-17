const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const cm=require('../model/common');
var multer=require('multer')
var constant=require('../constant/constant');
//var constantAR=require('../constant/constantAr');
var routes=require('../routes');
app.use(bodyparser.json());
app.use(routes);
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

app.post('/getCategory',function(req,res){
	if(!req.body.user_pub_id){
		  cm.responseMessage(constant.Zero,constant.chkfield,res)
	}else{
		cm.getUserStatus(req.body.user_pub_id,function(err,result){
          if(err){
               cm.responseMessage(constant.Zero,err,res)
          }else{
          	if(Object.keys(result).length>0){
          		cm.getallcat(function(err,result){
          			if(err){
                         cm.responseMessage(constant.Zero,err,res)
          		}
          			result=JSON.parse(JSON.stringify(result));
          			if(result.lenght != 0){
                              cm.responseMessagedata(constant.One,constant.GET_CAT,result,res)
          			}else{
          				
                              cm.responseMessage(constant.Zero,constant.NO_CAT,res)
          			}
          		})
          	}else{
          		
                    cm.responseMessage(constant.TWo,constant.ACCOUNT_STATUS,res)
          	}
          }
		});
	}

});
app.get('/getLink',function(req,res){
	res.send({
		"status":1,
		"message":"Get Link.",
		"Ios_link":"www.google.com",
		"Android_link":"www.google.com"
	})
});
module.exports=app