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
app.use(routes)
app.post('/getMyWork',function(req,res){
	var user_pub_id=req.body.user_pub_id;
con.query('select * from apply_job where artist_pub_id="'+user_pub_id+'" and status="2"',function(err,result){
	if(err){
		cm.responseMessage(constant.Zero,err,res)

	}else{
		var result_array=[];
		var c=0;
		var result=JSON.parse(JSON.stringify(result));
		console.log(result);
		if(result.length>0){
		var resultLength=result.length;
		result.forEach(function(row){
			con.query('select p.*,p.cat_id as post_cat_id,u.*,COALESCE(c1.cat_name,"") as post_cat_name ,concat("'+base_url+'",u.image) as image,c.currency_symbol ,r.* from post_job p JOIN user u on u.user_pub_id=p.user_pub_id JOIN currency_setting c Left JOIN categories c1 on p.cat_id=c1.id JOIN booking_invoice1 b  JOIN rating r on b.invoice_id=r.invoice_id  where p.job_id="'+row.job_id+'" and b.job_id="'+row.job_id+'" and c.status="1"',function(err,results){
				if(err){
					cm.responseMessage(constant.Zero,err,res)

				}else{

					var rows=JSON.parse(JSON.stringify(results));
					if(rows.length>0){
					result_array.push(rows[0]);						
					}
					c++;
					if(c==resultLength){
						if(result_array.length>0){
							res.send({
								"status":1,
								"message":constant.getAllWork,
								"data":result_array
							})
						}else{
			cm.responseMessage(constant.Zero,constant.NODATA,res)

						}
						
					}
				}
			})
		})		
		}else{

			cm.responseMessage(constant.Zero,constant.NODATA,res)

		}
		
	}
})	
})

module.exports=app;