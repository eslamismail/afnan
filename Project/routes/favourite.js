var express=require("express");
var bodyparser=require('body-parser');
var con=require('../config/database');
var uniqid=require('uniqid');
var app=express.Router();
var app=express();
var routes = express();
var routes = require('../routes')
var cm=require('../model/common')
var multer = require('multer');
var validator = require("email-validator");
app.use(routes)
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

app.post('/addFavourite',function(req,res) {
if(!req.body.user_pub_id||!req.body.target_id||!req.body.fav_type){
    cm.responseMessage(constant.Zero,constant.chkfield,res)

}else{
	con.query('select * from favourite where user_pub_id="'+req.body.user_pub_id+'" and target_id="'+req.body.target_id+'"',function(err,resultFav){
		if(err){
    cm.responseMessage(constant.Zero,err,res)
		}else{
				if(resultFav.length>0){
					var resultFav=JSON.parse(JSON.stringify(resultFav));
					var status=resultFav[0].status;
					// if(status=="1"){
                    // var status="0"
					// }else{
                    // var status="1"
					// }
					var status="1";
						con.query('update favourite set status="'+status+'" where user_pub_id="'+req.body.user_pub_id+'" and target_id="'+req.body.target_id+'"',function(err,resultUpdateFav){
							if(err){
    cm.responseMessage(constant.Zero,err,res)								
							}else{
								cm.responseMessage(constant.One,constant.addFav,res)								

							}
						})
				}else{
					req.body.status=1,
					req.body.created_at=(new Date()).valueOf().toString();
					req.body.updated_at=(new Date()).valueOf().toString();
					con.query('insert into favourite set ?',req.body,function(err,resultFav){
						if(err){
							    cm.responseMessage(constant.Zero,err,res)
						}else{
						    cm.responseMessage(constant.One,constant.addFav,res)
						}
					})	

				}
		}
	})
}

})

app.post('/unFavourite',function(req,res) {
if(!req.body.user_pub_id||!req.body.target_id){
    cm.responseMessage(constant.Zero,constant.chkfield,res)

}else{
	con.query('select * from favourite where user_pub_id="'+req.body.user_pub_id+'" and target_id="'+req.body.target_id+'"',function(err,resultFav){
		if(err){
    cm.responseMessage(constant.Zero,err,res)
		}else{
				if(resultFav.length>0){
						var status=0;
						con.query('update  favourite set status="'+status+'" where user_pub_id="'+req.body.user_pub_id+'" and target_id="'+req.body.target_id+'"',function(err,resultUpdateFav){
							if(err){
    cm.responseMessage(constant.Zero,err,res)								
							}else{
								cm.responseMessage(constant.One,constant.unFav,res)
							}
						})
				}else{
					
				}
		}
	})
}

})
module.exports=app;