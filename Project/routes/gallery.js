var express=require("express");
var bodyparser=require('body-parser');
var con=require('../config/database');
var uniqid=require('uniqid');
var app=express.Router();
var app=express();
var routes = express();
var routes = require('../routes')
var constant=require('../constant/constant')
var cm=require('../model/common')
var multer = require('multer');
var validator = require("email-validator");
// var base_url=constant.base_url;
app.use(routes)
app.use(express.static('Image'))
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, '../../../../../../../var/www/html/artBeatz/images')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

var upload = multer({
    storage: storage
});

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

app.post('/addGallery',upload.single('image'),function(req,res){
if(!req.body.user_pub_id){

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
				console.log(req.file)
				if(req.file){
					req.body.image="artBeatz/images/"+req.file.filename;
				    req.body.created_at=(new Date()).valueOf().toString();
				    req.body.updated_at=(new Date()).valueOf().toString();
				}
				cm.insert('gallery',req.body,function(err,result){
					if(err){
						console.log(err);
						
						cm.responseMessage(constant.Zero,err,res)
					}else{
						
						cm.responseMessage(constant.One,constant.ADD_GALLERY,res)
					}
				});
			}
		}
	})
}
})

app.post('/getAllGallery',function(req,res){
if(!req.body.user_pub_id){
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
				
				// cm.getAllData(function(err,result){
					con.query('select *,concat("'+base_url+'",image) as image from gallery where user_pub_id="'+req.body.user_pub_id+'"',function(err,result){
					if(err){
						console.log(err);
						
						cm.responseMessage(constant.Zero,err,res)
					}else{
						var result=JSON.parse(JSON.stringify(result));
						// cm.responseMessageData(constant.One,constant.GetAllGallery,result,res)
						res.send({
							"status":1,
							"message":constant.getAllGallery,
							"data":result
						})
					}
				});
			}
		}
	})
}
})

app.post('/deleteGallery',function(req,res){
	if(!req.body.id||!req.body.user_pub_id){
		cm.responseMessage(constant.Zero,constant.chkfield,res)
		return;
	}else{
		con.query('Delete from gallery where id="'+req.body.id+'" and user_pub_id="'+req.body.user_pub_id+'"',function(err,result){
			if(err){
				cm.responseMessage(constant.Zero,err,res)
			}else{
				cm.responseMessage(constant.One,constant.deleteGallery,res)
			}
		})
	}
})
module.exports=app;