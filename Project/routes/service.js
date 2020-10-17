var express=require('express');
var bodyparser=require('body-parser');
var con=require('../config/database.js');
var uniqid=require('uniqid');
var app=express.Router();
var app=express();
var routes=require('../routes');
var cm=require('../model/common');
var multer=require('multer');
var constant=require('../constant/constant');
var constantAR=require('../constant/constantAr');
var base_url = constant.base_url;
app.use(routes);
var storage=multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'../../../../../../../var/www/html/artBeatz/images')
	},
	filename:function(req,file,cb){
		var datetimestamp=Date.now();
		cb(null,file.fieldname +'-'+datetimestamp +'.'+file.originalname.split('.')[file.originalname.split('.').length-1]);
	}
});
var upload=multer({
	storage:storage
});
const lang_head=require('./check_lang');

// app.use(function(req, res, next) { //allow cross origin requests
//     res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
//     res.header("Access-Control-Allow-Origin", "http://localhost");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	   console.log("Balram "+req.headers.language);   
// 	   if (req.headers.language == 'ar' || req.headers.language == 'AR') {
//         constant = constantAR;
//         } else {	
//             constant = constant;
//         }
//         next();
// });

app.use( async function(req, res, next) {
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	await lang_head.checkLang(req, function(result,err){
		constant = result;
		return next();
	});
});

app.post('/addService',upload.array('service_image',5),function(req,res){
	if(!req.body.user_pub_id||!req.body.service_name||!req.body.service_price||!req.files){
	cm.responseMessage(constant.Zero,constant.chkfield,res)
	return;
	}else{
		cm.getallDataWhere('user',{user_pub_id:req.body.user_pub_id},function(err,result){
		if(err){
			
			cm.responseMessage(constant.Zero,constant.ERR,res)
		}else{
			if(result.length == 0){
				
				cm.responseMessage(constant.Zero,constant.USER_NOT_FOUND,res)
			}else{
				var data={
					"service_price":req.body.service_price,
					"service_name":req.body.service_name,
					"user_pub_id":req.body.user_pub_id,
				    "created_at":(new Date()).valueOf().toString(),
				    "updated_at":(new Date()).valueOf().toString()
				}
					
				// cm.insert('service',[data],function(err,result){
					con.query('insert Into service set ?',[data],function(err,result){
					if(err){
						console.log(err);
						cm.responseMessage(constant.Zero,err,res)
					}else{
						var insertId = result.insertId;
						// console.log(insertId);
						var imageLength=req.files.length;
						for(var i=0;i<imageLength;i++){
							var data1={
								"service_image":"artBeatz/images/"+req.files[i].filename,
								"service_id":insertId
							}
							con.query('insert Into service_images set ?',[data1],function(err,result){
								if(err){
									console.log(err);
								}else{
									// console.log(result);
								}
							})
						}	
						cm.responseMessage(constant.One,constant.ADD_SERVICE,res)
					}
				});
			}
		}
	})
	}
})

app.post('/getService',function(req,res){
	console.log(req.body.user_pub_id)
	if(!req.body.user_pub_id){
		cm.responseMessage(constant.One,constant.chkfield,res);
	}else{
		var dataappend=[];
		con.query('select s.*,c.* from service s join currency_setting c where s.user_pub_id="'+req.body.user_pub_id+'" and c.status="1"',function(err,results){
			if(err){
				console.log('service',err)
				cm.responseMessage(constant.Zero,err,res);
			}else{
				var counter=0;
				var result=JSON.parse(JSON.stringify(results));
				console.log('result',result)
				if(result.length>0){
					var resultLength=result.length;
					// for(var i=0;i<result.length;i++){
						result.forEach(function(row){
							con.query('select concat("'+base_url+'",service_image) as service_image from service_images where service_id="'+row.service_id+'"',function(err,resultImage){
								if(err){
									console.log('service_image',err)
									console.log(err);
								}else{
									var resultImage=JSON.parse(JSON.stringify(resultImage));
									console.log(resultImage);
									row.service_image=resultImage[0];
									dataappend.push(row);
									counter++;
									console.log('resultLength',counter,resultLength)
									if(counter==resultLength){
										res.send({
											"status":1,
											"message":constant.getAllService,
											"data":dataappend
										})
									}
								}
							})
						})
				}else{
					console.log('nodata')
					cm.responseMessage(constant.Zero,constant.NODATA,res);
				}
			}
		})
	}
})

app.post('/deleteService',function(req,res){
	var service_id=req.body.service_id;
	var user_pub_id=req.body.user_pub_id;
	if(!service_id || !user_pub_id){
		console.log('bbb')
		cm.responseMessage(constant.Zero,constant.chkfield,res)
	}else{
		con.query("DELETE from service where user_pub_id='"+user_pub_id+"' and service_id='"+service_id+"'",function(err,result){
			if(err){
				cm.responseMessage(constant.Zero,err,res);

			}else{
				con.query("DELETE From service_images where service_id='"+service_id+"'",function(err,results){
					if(err){
						cm.responseMessage(constant.Zero,err,res);

					}else{
						console.log('sss')
						cm.responseMessage(constant.One,constant.deleteService,res);

					}
				})
			}
		})
	}
})

module.exports=app;