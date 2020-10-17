var express = require('express');
var bodyparser = require('body-parser');
var con = require('../config/database');
var uniqid = require('uniqid');
var app = express.Router();
var app = express();
var routes = express();
var routes = require('../routes')
var cm = require('../model/common')
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

app.get('/getAllPackages', function (req, res) {
    con.query('select p.*,c.currency_symbol from package as p JOIN currency_setting as c where p.is_default="0" AND c.status="1" AND p.status="1"', function (err, result) {
        if (err) {
            cm.responseMessage(constant.Zero, err, res);
        } else {
            var result = JSON.parse(JSON.stringify(result));
            cm.responseMessagedata(constant.One, constant.GET_ALL_PACKAGES, result, res);
        }
    })
})


app.post('/getMySubscription', function (req, res) {
	if (!req.body.user_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		con.query('select sh.*,c.currency_symbol from subscription_history as sh JOIN currency_setting as c where sh.user_pub_id="'+req.body.user_pub_id+'" AND c.status="1"', function (err, result) {
			if (err) {
				cm.responseMessage(constant.Zero, err, res);
			} else {
				var result = JSON.parse(JSON.stringify(result));
				cm.responseMessagedata(constant.One, constant.GET_ALL_MY_SUBSCRIPTION, result, res);
			}
		})
	}
})

app.post('/addSubscription', function (req, res) {
	if (!req.body.user_pub_id || !req.body.amount || !req.body.payment_trans_id || !req.body.package_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
        con.query('select * from package where package_pub_id="'+req.body.package_pub_id+'" ', function (err, packageData) {
            if (err) {
				cm.responseMessage(constant.Zero, err, res);
            } else {
				var packageData = JSON.parse(JSON.stringify(packageData));
				packageData = packageData[0];
				var transaction_data = {
					user_pub_id : req.body.user_pub_id,
					package_pub_id : req.body.package_pub_id,
					trans_id : req.body.payment_trans_id,
					amount : req.body.amount,
					payment_status : 1,
					created_at : (new Date()).valueOf().toString(),
					updated_at : (new Date()).valueOf().toString()
				};
				con.query('insert into subscription_transactions set ?', transaction_data, function (err, subscriptionTransData) {
					if (err) {
						cm.responseMessage(constant.Zero, err, res);
					} else {
						subscriptionTransData = JSON.parse(JSON.stringify(subscriptionTransData));
						var trans_id = subscriptionTransData.insertId;
						var myDate = new Date();
						myDate.setDate(myDate.getDate() + packageData.days);
						var subscription_data = {
							user_pub_id : req.body.user_pub_id,
							package_pub_id : req.body.package_pub_id,
							transaction_id : trans_id,
							order_id : req.body.payment_trans_id,
							subs_start_date : (new Date()).valueOf().toString(),
							subs_end_date : (myDate).valueOf().toString(),
							subs_amount : req.body.amount,
							subs_title : packageData.title,
							subs_days : packageData.days,
							subs_created_at : (new Date()).valueOf().toString(),
							subs_status : 1
						}
						con.query('insert into subscription_history set ?', subscription_data, function (err, subscriptionData) {
							if (err) {
								cm.responseMessage(constant.Zero, err, res);
							} else {
								con.query('select * from user where user_pub_id="'+req.body.user_pub_id+'" ', function (err, userData) {
									if(err){
										cm.responseMessage(constant.Zero, err, res);
									}else{
										userData = JSON.parse(JSON.stringify(userData));
										userData = userData[0];
										var sub_end_date = userData.sub_end_date;
										var new_sub_end_date = (myDate).valueOf().toString();
										if(sub_end_date != '' && (new Date()).valueOf().toString() < sub_end_date){
											new_sub_end_date = parseInt((myDate).valueOf().toString())-parseInt((new Date()).valueOf().toString());
											new_sub_end_date = parseInt(new_sub_end_date)+parseInt(sub_end_date);
										}
										con.query('update user set sub_end_date="'+new_sub_end_date+'" where user_pub_id="'+req.body.user_pub_id+'"',function(err,result){
											if(err){
												console.log(err);
											}else{
												cm.responseMessage(constant.One, constant.SUBSCRIPTION_SUCCESS, res);
											}
										});
									}
								});
							}
						});
					}
				});
            }
        });
	}
});

app.post('/isSubscribed', function (req, res) {
	if (!req.body.user_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		con.query('SELECT * FROM user WHERE user_pub_id="'+req.body.user_pub_id+'" ', function (err, userObjData) {
			if (err) {
				cm.responseMessage(constant.Zero, err, res);
			} else {
				userObjData = userObjData[0];
				var result = {is_subscribed:0,end_date:''};
				if(!userObjData.sub_end_date){
					cm.responseMessagedata(constant.One, constant.GET_IS_NOT_SUBSCRIBED, result, res);
				} else if((new Date()).valueOf().toString() > userObjData.sub_end_date){
					result.end_date = userObjData.sub_end_date;
					cm.responseMessagedata(constant.One, constant.GET_IS_NOT_SUBSCRIBED, result, res);
				} else {
					result.is_subscribed = 1;
					result.end_date = userObjData.sub_end_date;
					cm.responseMessagedata(constant.One, constant.GET_IS_SUBSCRIBED, result, res);
				}
			}
		})
	}
})

module.exports = app;