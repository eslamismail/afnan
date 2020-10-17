const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const cm=require('../model/common');
var multer=require('multer')
var routes=require('../routes');
var con=require('../config/database');
var Promise=require('promise');
var fn = require('../firebase/firebase');

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
var base_url = constant.base_url;

// app.post('/addRating',function(req,res){
// 	console.log("ratings")
// 	if(!req.body.user_pub_id||!req.body.user_pub_id||!req.body.invoice_id||!req.body.rating){
// 		res.send({
// 			"status":0,
// 			"message":constant.chkfield
// 		});
// 	}else{
// 		cm.getUserStatus(req.body.user_pub_id,function(err,result){

// 			if(err){
// 				res.send({
// 					"status":0,
// 					"message":err
// 				})
// 			}else{
			
// 						var parData={
// 					artist_pub_id:req.body.artist_pub_id,
// 					invoice_id:req.body.invoice_id,
// 					rating:req.body.rating,
// 					description:req.body.description,
// 					created_at: (new Date()).valueOf().toString(),
// 					updated_at: (new Date()).valueOf().toString(),
// 						}
// 						// console.log(parData)
// 							cm.insert('rating',parData,function(err,result){
// 					if(err){
// 						res.send({
// 							"status":0,
// 							"message":err
// 						})
// 					}else{
// 						res.send({
// 							"status":1,
// 							"message":"rating submit"
// 						})
// 					}
// 				})
// 			}
// 		})
// 	}
// })

app.post("/addRating", function(req, res) {
    if (!req.body.artist_pub_id || !req.body.user_pub_id || !req.body.rating || !req.body.description||!req.body.invoice_id) {
        cm.responseMessage(constant.Zero,constant.chkFields,res)
    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
                cm.responseMessage(constant.Zero,err,res)
            } else {
                var parData = {
                    user_pub_id: req.body.user_pub_id,
                    artist_pub_id: req.body.artist_pub_id,
                    invoice_id:req.body.invoice_id,
                    rating: req.body.rating,
                    description: req.body.description,
                    created_at: (new Date()).valueOf().toString(),
                    updated_at:(new Date()).valueOf().toString()
                }
                con.query('INSERT INTO rating SET ?', parData, function(error, results) {
                    if (error) {
                        cm.responseMessage(constant.Zero,error,res)
                    } else {
                        con.query('select * from user where user_pub_id="'+req.body.artist_pub_id+'"',function(err,result){
                            if(err){
                                res.send({
                                    "status":0,
                                    "message":err
                                })
                            }else{
                                var result=JSON.parse(JSON.stringify(result));
                                var device_token=result[0].device_token;
                                var title=constant.review_title;
                                var type=constant.review_type;
                                  var msg1=constant.review_msg;
                                    var parData={
                                    user_pub_id	:req.body.artist_pub_id,
                                    title:title,
                                    type:type,
                                    msg	:msg1,
                                    created_at:(new Date()).valueOf().toString()
                                    }
                                    cm.insert('notification',parData,function(err,result){
                                      if(err){
                                        cm.responseMessage(constant.Zero,err,res);
                                        }else{
                                            fn.pushnotification(title,msg1,device_token,type);
                                            cm.responseMessage(constant.One,constant.ADD_RATING,res)
                                        }
                                    })
                            }
                        })

                    }
                });
            }
        });
    }
});
app.post('/getrating',function(req,res){
	if(!req.body.user_pub_id){
        cm.responseMessage(constant.Zero,constant.chkField,res)
	}else{
		cm.getRating(req.body.user_pub_id,function(err,result){
			console.log(result)
			if(err){
                cm.responseMessage(constant.Zero,err,res)
			}else{
				if(result.length>0){
					console.log(result)
					res.send({
						"status":1,
						"message":constant.getAllRating,
						"data":result
					})
				}else{
                    cm.responseMessage(constant.Zero,constant.NODATA,res)
				}
			}
		})
	}
})

module.exports=app