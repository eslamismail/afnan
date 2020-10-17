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
app.post('/getFannanPoint', function (req, res) {
	if (!req.body.user_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		con.query('select * from setting where def_key="fannan_point"', function (err, result) {
			if (err) {
				cm.responseMessage(constant.Zero, err, res);
			} else {

				var result = JSON.parse(JSON.stringify(result));
				var resultData = JSON.parse(result[0].def_value);
				cm.responseMessagedata(constant.One, constant.getFannanPoint, resultData, res);
			}
		})
	}
})

app.post('/getMyPoint', function (req, res) {
	if (!req.body.user_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		cm.getMyPoints(req.body.user_pub_id).then(function (data) {
			cm.responseMessagedata(constant.One, constant.getFannanPoint, data, res);
		}).then(function (err) {
			console.log('err');
		});

	}
})

app.post('/addFannanPoint', function (req, res) {
	if (!req.body.user_pub_id || !req.body.amount||!req.body.payment_trans_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		var point = cm.fannanConverter(req.body.amount, "amount").then(function (point) {
			req.body.point = point;
			req.body.trans_type = "1";
			req.body.trans_status = "1";
			req.body.created_at = (new Date()).valueOf().toString();
			con.query('insert into transaction set ?', req.body, function (err, result) {
				if (err) {
					cm.responseMessage(constant.Zero, err, res);
				} else {
					var result = JSON.parse(JSON.stringify(result));
					var trans_id = result.insertId;

					cm.addTransactionHistory(req.body.user_pub_id, point, "1", trans_id, "0", req.body.created_at).then(function (data) {
						if (data) {
							console.log(data);
							cm.getMyPoints(req.body.user_pub_id).then(function (data) {
								if (data) {
									var user_point = data.point;
									var type = "add";
									console.log(user_point);
									cm.manageUserPoint(req.body.user_pub_id, user_point, req.body.point, type).then(function (data1) {
										if (data1) {
											cm.responseMessage(constant.One, constant.AddedFannan, res);
										}
									}).then(function (err) {
										console.log('erwwwr');
									})
								}
							}).then(function (err) {
								console.log('err');
							});
						} else {
							res.send({
								"status": 0,
								"message": err
							})
						}
					}).then(function (err) {
						console.log('err');
					});

				}
			})
		}).then(function (err) {
			console.log('err');
		})

	}
})




app.post('/payoutRequest', function (req, res) {
	if (!req.body.user_pub_id || !req.body.point) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		cm.getMyPoints(req.body.user_pub_id).then(function (data) {
			if (data) {
				var user_point = data.point;
				var type = "minus";
				if (user_point >= req.body.point) {
					cm.manageUserPoint(req.body.user_pub_id, user_point, req.body.point, type).then(function (data1) {
						if (data1) {
							cm.fannanConverter(req.body.point, "point").then(function (amount) {
								req.body.amount = amount;
								req.body.created_at = (new Date()).valueOf().toString();
								req.body.trans_status = "0";
								req.body.trans_type = "0";
								con.query('insert into transaction set ?', req.body, function (err, result) {
									if (err) {
										cm.responseMessage(constant.Zero, err, res);
									} else {
										var result = JSON.parse(JSON.stringify(result));
										var trans_id = result.insertId;

										cm.addTransactionHistory(req.body.user_pub_id, req.body.point, "0", trans_id, "0", req.body.created_at).then(function (data) {
											if (data) {
												cm.responseMessage(constant.One, constant.PayoutRequest, res);
											}
										}).then(function (err) {
											console.log('addTransactionHistory err')
										})
									}
								}).then(function (err) {
									console.log('transaction err')
								})
							}).then(function (err) {
								console.log('fannanConverter err')
							})
						}
					}).then(function (err) {
						console.log('manageUserPoint err');
					})
				} else {
					cm.responseMessage(constant.Zero, constant.sufficient, res);
				}
			}
		})
	}
})


app.post('/getWalletHistory', function (req, res) {
	if (!req.body.user_pub_id) {
		cm.responseMessage(constant.Zero, constant.chkfield, res);
	} else {
		resultArray = { credit: {}, debit: {}, payout: {} };
		con.query('select *, IF(target_id=0, "Point Purchased", "Paid To Invoice") as title from transaction_history where trans_type="1" and user_id="' + req.body.user_pub_id + '"', function (err, resultCredit) {
			if (err) {
				cm.responseMessage(constant.Zero, err, res);
			} else {
				var resultCredit = JSON.parse(JSON.stringify(resultCredit));
				resultArray.credit = resultCredit
				// resultArray.push(resultC);
				con.query('select *, IF(target_id=0, "Point Withdraw", "Paid To Invoice") as title from transaction_history where trans_type="0" and user_id="' + req.body.user_pub_id + '"', function (err, resultDebit) {
					if (err) {
						cm.responseMessage(constant.Zero, err, res);
					} else {
						var resultDebit = JSON.parse(JSON.stringify(resultDebit));
						resultArray.debit = resultDebit;
						// resultArray.push(resultDebit);

						con.query('select t1.*, "Point Withdraw" as title,t.trans_status from transaction_history t1 join transaction t on t1.invoice_id=t.trans_id where t1.trans_type="0" and t1.target_id="0" and t1.user_id="' + req.body.user_pub_id + '"', function (err, resultPayout) {
							if (err) {
								cm.responseMessage(constant.Zero, err, res);
							} else {
								var resultPayout = JSON.parse(JSON.stringify(resultPayout));
								resultArray.payout = resultPayout;
								// resultArray.push(resultPayout);
								cm.responseMessagedata(constant.One, constant.GetAllTrans, resultArray, res);
							}
						})
					}
				})
			}
		})
	}
})
module.exports = app;