const express = require('express');
const app = express.Router();
const bodyparser = require('body-parser');
const cm = require('../model/common');
var multer = require('multer')
var constant = require('../constant/constant')
var constantAR = require('../constant/constantAr');
var routes = require('../routes');
var con = require('../config/database');
var Promise = require('promise');
var fn = require('../firebase/firebase');
app.use(bodyparser.json());
app.use(routes);
const lang_head = require('./check_lang');
app.use(async function (req, res, next) {
	res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
	res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	await lang_head.checkLang(req, function (result, err) {
		constant = result;
		return next();
	});
});
var base_url="http://159.65.241.51/";

app.post('/dashboard', function (req, res) {
	if (!req.body.user_pub_id || !req.body.latitude || !req.body.longitude) {
		res.send({
			"status": 0,
			"message": constant.chkfield
		})
	} else {
		cm.getUserStatus(req.body.user_pub_id, function (err, _result) {
			if (err) {
				cm.responseMessage(constant.Zero, err, res)
			} else {
				if (_result.length > 0) {
					var data = {};
					//start Home_Slider
					con.query('select * ,concat("'+base_url+'",image) as image from home_slider where status ="1"', function (err, homeResult) {
						if (err) {
							cm.responseMessage(constant.Zero, constant.NOT_FOUND_DATA, res)
						}
						homeResult = JSON.parse(JSON.stringify(homeResult));
						if (homeResult.length != 0) {
							data.homeResult = homeResult;
						} else {
							data.homeResult = [];
						}
						//Active    
						cm.getCurrentAppointmentArtist(req.body.user_pub_id, function (err, Activeresult) {
							if (err) {
								cm.responseMessage(constant.Zero, constant.ERR, res)
							}
							Activeresult = JSON.parse(JSON.stringify(Activeresult));
							if (Activeresult.length != 0) {
								var startTime = Activeresult[0].start_time;
								var endTime = (new Date()).valueOf().toString();
								var difference = endTime - startTime; // This will give difference in milliseconds
								var resultInMinutes = Math.round(difference / 60000);
								Activeresult[0].total_time = resultInMinutes
								data.Activeresult = Activeresult;
							} else {
								data.Activeresult = [];
							}
							//Near By Me
							cm.getNearbyArtist(req.body.user_pub_id, req.body.latitude, req.body.longitude, function (err, NearArtistresult) {
								if (err) {
									console.log(err);
									cm.responseMessage(constant.Zero, constant.ERR, res)
								}
								NearArtistresult = JSON.parse(JSON.stringify(NearArtistresult));
								if (NearArtistresult.length != 0) {
									data.NearArtistresult = NearArtistresult;
								} else {
									data.NearArtistresult = [];
								}
								//getAll Categories
								cm.getallcat(function (err, Categoriesresult) {
									if (err) {
										cm.responseMessage(constant.Zero, err, res)
									}
									Categoriesresult = JSON.parse(JSON.stringify(Categoriesresult));
									if (Categoriesresult.length != 0) {
										data.Categoriesresult = Categoriesresult;
									} else {
										data.Categoriesresult = [];
									}
									//Recent Invoice
									cm.GetInvoice12(req.body.user_pub_id, function (err, RecentInvoiceresult) {
										if (err) {
											cm.responseMessage(constant.Zero, constant.ERR, res)
										}
										RecentInvoiceresult = JSON.parse(JSON.stringify(RecentInvoiceresult));
										if (RecentInvoiceresult.length != 0) {
											data.RecentInvoiceresult = RecentInvoiceresult;
										} else {
											data.RecentInvoiceresult = [];
										}
										//Get Booking History
										cm.getRating(req.body.user_pub_id, function (err, Bookingresult) {
											if (err) {
												cm.responseMessage(constant.Zero, constant.ERR, res);
											}
											Bookingresult = JSON.parse(JSON.stringify(Bookingresult));
											if (Bookingresult.length != 0) {
												data.Bookingresult = Bookingresult;
											} else {
												data.Bookingresult = []
											}
											cm.getAcceptedJob(req.body.user_pub_id, function (err, AcceptedResult) {
												if (err) {
													cm.responseMessage(constant.Zero, constant.ERR, res);

												}
												AcceptedResult = JSON.parse(JSON.stringify(AcceptedResult));
												if (AcceptedResult.length != 0) {
													data.AcceptedResult = AcceptedResult;
												} else {
													data.AcceptedResult = [];
												}
												cm.getPostedJobs1(req.body.user_pub_id, function (err, result) {
													if (err) {
														cm.responseMessage(constant.Zero, err, res)

													}
													var counter = 0;
													var result_array = [];
													var result = JSON.parse(JSON.stringify(result));
													if (result.length != 0) {
														var resultLength = result.length;
														cm.getMyjodsData(result, function (datas) {
															data.MyJobs = datas;
															res.send({
																"status": 1,
																"message": "display data",
																"data": data

															});
														});
													} else {
														data.MyJobs = [];
														res.send({
															"status": 1,
															"message": "display data",
															"data": data

														});
													}
												})

											})
										});//end Booking 
									});//end invoice
								});//end get All Cat
							});//end Near Artist
						});//end Active
					});//ende home_slider
				} else {
					cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
				}
			}
		});	


	}
})
module.exports = app;