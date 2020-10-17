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
// var bcrypt=require('bcrypt');
var multer = require('multer');
var validator = require("email-validator");
app.use(routes);

app.post("/generateTicket", function(req, res) {
    if (!req.body.title || !req.body.user_pub_id || !req.body.description) {
        
		cm.responseMessage(constant.Zero,constant.chkfield,res)
    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
        		cm.responseMessage(constant.Zero,err,res)

            } else {
                var parData = {
                    user_pub_id: req.body.user_pub_id,
                    title: req.body.title,
                    description: req.body.description,
                    created_at: (new Date()).valueOf().toString(),
                }
                con.query('INSERT INTO ticket SET ?', parData, function(error, results) {
                    if (error) {
                        console.log("error ocurred", error)
                        cm.responseMessage(constant.Zero,error,res)

                    } else {

		cm.responseMessage(constant.One,constant.TIECKET_GENERATED,res)

                    }
                });
            }
        });
    }
});
app.post('/getMyticket', function(req, res) {
    if (!req.body.user_pub_id) {
        
		cm.responseMessage(constant.Zero,constant.chkFields,res)
        
    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
                cm.responseMessage(constant.Zero,err,res)

            } else {
                if (result.length > 0) {
                    cm.getMyticket(req.body.user_pub_id, function(err, result) {
                        if (err) {
                            cm.responseMessage(constant.One,constant.TIECKET_GENERATED,res)

                        }
                        result = JSON.parse(JSON.stringify(result));
                        if (result.length != 0) {
                            res.send({
                                "status": 1,
                                "message": constant.MY_TIECKET,
                                "data": result
                            });

                        } else {

		cm.responseMessage(constant.Zero,constant.NODATA,res)

                        }
                    });
                } else {

		cm.responseMessage(constant.TWo,constant.ACCOUNT_STATUS,res)

                }
            }
        });
    }
});

app.post("/addTicketComment", function(req, res) {
    if (!req.body.ticket_id || !req.body.user_pub_id || !req.body.comment) {
        cm.responseMessage(constant.Zero,constant.chkFields,res)

    } else {
        cm.getUserStatus(req.body.user_pub_id, function(err, result) {
            if (err) {
                cm.responseMessage(constant.Zero,err,res)

            } else {
                var parData = {
                    user_pub_id: req.body.user_pub_id,
                    ticket_id: req.body.ticket_id,
                    role: 1,
                    comment: req.body.comment,
                     // created_at:new Date(2);
                      created_at: (new Daste()).valueOf().toString(),
                }
                con.query('INSERT INTO ticket_comments SET ?', parData, function(error, results) {
                    if (error) {
                        console.log("error ocurred", error)
                        cm.responseMessage(constant.Zero,error,res)

                    } else {
		cm.responseMessage(constant.One,constant.ADD_COMMENT,res)
                    }
                });
            }
        });
    }
});


module.exports=app;