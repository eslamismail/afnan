const express=require('express');
const app=express.Router();
const bodyparser=require('body-parser');
const cm=require('../model/common');
var multer=require('multer')
var routes=require('../routes');
const con=require('../config/database.js')
app.use(bodyparser.json());
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
app.post('/getAllCoupons',function(req,res){
	if(!req.body.user_pub_id){
		          cm.responseMessage(constant.Zero,constant.chkfield,res)

	}else{
	
			con.query('select * from coupon',function(err,result){
				if(err){
					cm.responseMessage(constant.Zero,err,res)

				}else{
					var result=JSON.parse(JSON.stringify(result));
					if(result.length>0){
						res.send({
							"status":1,
							"message":constant.getAllCoupon,
							"data":result
						})
					}else{
						
                        cm.responseMessage(constant.Zero,constant.Nocoupon,res)

					}
				}
			})
	}
})

app.post('/getCouponById',function(req,res){
	if(!req.body.user_pub_id||!req.body.id){
		cm.responseMessage(constant.Zero,constant.chkfield,res)
	}else{
			cm.getCouponById(function(err,result){
				if(err){
		          cm.responseMessage(constant.Zero,err,res)		
				}else{
					if(result.length>0){
					cm.responseMessagedata(constant.One,constant.All_Coupons,result,res)
					}else{
					cm.responseMessagedata(constant.Zero,constant.No_data,result,res)

					}
				}
			})
	}
})

module.exports=app;