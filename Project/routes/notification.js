var express=require("express");
var bodyparser=require('body-parser');
var con=require('../config/database');
var uniqid=require('uniqid');
var app=express.Router();
var app=express();
var routes = express();
var routes = require('../routes')
var randomstring = require("randomstring");
var cm=require('../model/common')
// var bcrypt=require('bcrypt');
var multer = require('multer');
var validator = require("email-validator");
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
var base_url_image = constant.base_url_image;

app.post("/getNotifications", function(req, res) {
    if (!req.body.user_pub_id) {
        cm.responseMessage(constant.Zero,constant.CHKAllFIELD,res)
        return;
    } else {
        cm.getNotifications(req.body.user_pub_id, function(err, result) {
            if (result.length > 0) {
                console.log(req.body.user_pub_id);
                con.query('UPDATE notification SET is_read=? WHERE user_pub_id=?', [1, req.body.user_pub_id], function(err, result, fields) {});
                res.send({
                    "status": 1,
                    "message": constant.ALL_NOTIFICATION,
                    "my_notifications": result
                });
            } else {
                cm.responseMessage(constant.Zero,constant.NODATA,res)
            }
        });
    }
});

module.exports=app;