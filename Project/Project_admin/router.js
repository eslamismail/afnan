// https://vikas2221@bitbucket.org/amit_ujj/kevin_backend.git // cZNwpwFCfSZwJUnKPw7w
var express = require('express');
var app = express();
var router = express.Router();
var db = require('../config/database');
var constant = require('../constant/constant');
var firebase = require('../firebase/firebase');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var flash = require('express-flash');
var session = require('express-session');
var multer = require('multer');
var dateFormat = require('dateformat');
var moment = require('moment');

var uniqid=require('uniqid');
// var uniqid
router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
router.use(flash());
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());
var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, '../../../../../../var/www/html/artBeatz/images')
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
  }
});

var upload = multer({ storage: storage });
// Dashboard
// router.get('/', function (req, res) {
//    res.render('Dashboard/dashboard');
// })
router.get('/index', function (req, res) {
  if (req.session.email) {
    var myDate = new Date();
    myDate = (myDate).valueOf().toString();
    var SQL = "SELECT count(user_id) as id FROM user WHERE status='1';"+
    "SELECT count(id) as id FROM categories WHERE status='1';"+
    "SELECT count(id) as id FROM post_job WHERE status='2';"+
    "SELECT sum(amount) as earn FROM subscription_transactions WHERE payment_status='1';"+
    "SELECT currency_symbol FROM currency_setting WHERE status='1';"+
    "SELECT count(user_id) as id FROM user WHERE status='1' AND (sub_end_date IS NOT NULL AND sub_end_date >= '"+myDate+"');"+
    "SELECT count(user_id) as id FROM user WHERE status='1' AND (sub_end_date IS NULL OR sub_end_date < '"+myDate+"') ";
    // "Select t.*,u.* ,concat('" + constant.base_url + "',u.image) as image from transaction_history as t "+
    // "join user u on u.user_pub_id = t.user_id order by t.created_at limit 6 ;"+
    // "select t.*,u.* ,t.description as support_description from ticket t "+
    // "join user u on u.user_pub_id=t.user_pub_id order by t.created_at limit 6";
    db.query(SQL, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        var result_user = JSON.parse(JSON.stringify(result[0]));
        var result_cat = JSON.parse(JSON.stringify(result[1]));
        var result_job = JSON.parse(JSON.stringify(result[2]));
        var result_earn = JSON.parse(JSON.stringify(result[3]));
        var result_currency = JSON.parse(JSON.stringify(result[4]));
        var result_subscribed = JSON.parse(JSON.stringify(result[5]));
        var result_unsubscribed = JSON.parse(JSON.stringify(result[6]));
        // var result_trans = JSON.parse(JSON.stringify(result[4]));
        // var result_ticket = JSON.parse(JSON.stringify(result[5]));
        // console.log(result_trans);
        if(result_earn[0].earn == null || result_earn[0].earn == undefined)result_earn[0].earn = 0;
        res.render('Dashboard/dashboard', { 
          result: result_user, 
          cat: result_cat, 
          job: result_job, 
          earn: result_earn,
          currency: result_currency,
          subscribed: result_subscribed[0].id,
          unsubscribed: result_unsubscribed[0].id
        });
      }
    })
  } else {
    res.redirect('/login')
  }
})

router.post("/adminLogin", function (req, res) {
  var email = req.body.email;
  db.query("SELECT * FROM admin WHERE email=?", [email], function (error, result, fields) {
    if (result.length == 0) {
      req.flash("msg1", "Email is incorrect");
      res.redirect("/login");
    }
    else {
      var result = JSON.parse(JSON.stringify(result[0]));
      if (result.password == req.body.password) {
        req.session.email = result.email;
        req.session.is_user_logged_in = true;
        res.redirect("/index");
      }
      else {
        req.flash("msg2", "Password is incorrect");
        res.redirect("/login");
      }
    }
  });
});

//logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login');
  });
});

// Calendar
router.get('/calendar', function (req, res) {
  res.render('Calendar/calendar');
})

// Email
router.get('/email-inbox', function (req, res) {
  res.render('Email/email_inbox');
})
router.get('/email-compose', function (req, res) {
  res.render('Email/email_compose');
})
router.get('/email-read', function (req, res) {
  res.render('Email/email_read');
})
router.get('/email-template-Alert', function (req, res) {
  res.render('Email/email_template_Alert');
})
router.get('/email-template-basic', function (req, res) {
  res.render('Email/email_template_basic');
})
router.get('/email-template-Billing', function (req, res) {
  res.render('Email/email_template_Billing');
})

// UI Elements
router.get('/ui-alerts', function (req, res) {
  res.render('UiElements/ui_alerts');
})
router.get('/ui-buttons', function (req, res) {
  res.render('UiElements/ui_buttons');
})
router.get('/ui-cards', function (req, res) {
  res.render('UiElements/ui_cards');
})
router.get('/ui-carousel', function (req, res) {
  res.render('UiElements/ui_carousel');
})
router.get('/ui-dropdowns', function (req, res) {
  res.locals = { title: 'UI Dropdowns' };
  res.render('UiElements/ui_dropdowns');
})
router.get('/ui-grid', function (req, res) {
  res.render('UiElements/ui_grid');
})
router.get('/ui-images', function (req, res) {
  res.render('UiElements/ui_images');
})
router.get('/ui-lightbox', function (req, res) {
  res.render('UiElements/ui_lightbox');
})
router.get('/ui-modals', function (req, res) {

  res.render('UiElements/ui_modals');
})
router.get('/ui-pagination', function (req, res) {
  res.render('UiElements/ui_pagination');
})
router.get('/ui-popover-tooltips', function (req, res) {
  res.render('UiElements/ui_popover_tooltips');
})
router.get('/ui-rangeslider', function (req, res) {
  res.render('UiElements/ui_rangeslider');
})
router.get('/ui-session-timeout', function (req, res) {
  res.locals = { title: 'UI Session Timeout' };
  res.render('UiElements/ui_session_timeout');
})
router.get('/ui-progressbars', function (req, res) {
  res.render('UiElements/ui_progressbars');
})
router.get('/ui-sweet-alert', function (req, res) {
  res.render('UiElements/ui_sweet_alert');
})
router.get('/ui-tabs-accordions', function (req, res) {
  res.render('UiElements/ui_tabs_accordions');
})
router.get('/ui-typography', function (req, res) {
  res.render('UiElements/ui_typography');
})
router.get('/ui-video', function (req, res) {
  res.render('UiElements/ui_video');
})
router.get('/ui-colors', function (req, res) {
  res.render('UiElements/ui_colors');
})
router.get('/ui-general', function (req, res) {
  res.render('UiElements/ui_general');
})
router.get('/ui-rating', function (req, res) {
  res.render('UiElements/ui_rating');
})

// Form Elements

router.get("/edit_user", function (req, res) {
  if (req.session.email) {
    // var id = req.params.user_pub_id;

    db.query("SELECT * FROM user ", function (err, result) {
      if (err) {
        console.log("Finding error", err);
        return;
      }
      result = JSON.parse(JSON.stringify(result[0]));
      res.render("Forms/form_elements", { result: result });
    });
  } else {
    res.redirect("/login");
  }
});

router.get('/form-validation', function (req, res) {
  res.render('Forms/form_validation');
})
router.get('/form-advanced', function (req, res) {
  res.render('Forms/form_advanced');
})
router.get('/form-editors', function (req, res) {
  res.render('Forms/form_editors');
})
router.get('/form-uploads', function (req, res) {
  res.render('Forms/form_uploads');
})
router.get('/form-xeditable', function (req, res) {
  res.render('Forms/form_xeditable');
})
router.get('/form-mask', function (req, res) {
  res.render('Forms/form_mask');
})
router.get('/form-repeater', function (req, res) {
  res.render('Forms/form_repeater');
})
router.get('/form-wizard', function (req, res) {
  res.render('Forms/form_wizard');
})

// Charts
router.get('/charts-morris', function (req, res) {
  res.render('Charts/charts_morris');
})
router.get('/charts-chartist', function (req, res) {
  res.render('Charts/charts_chartist');
})
router.get('/charts-chartjs', function (req, res) {
  res.render('Charts/charts_chartjs');
})
router.get('/charts-flot', function (req, res) {
  res.render('Charts/charts_flot');
})
router.get('/charts-echart', function (req, res) {
  res.render('Charts/charts_echart');
})
router.get('/charts-sparkline', function (req, res) {
  res.render('Charts/charts_sparkline');
})
router.get('/charts-knob', function (req, res) {
  res.render('Charts/charts_knob');
})
router.get('/charts-echart', function (req, res) {
  res.render('Charts/charts_echart');
})

//Home Banner

router.get('/banner', function (req, res) {
  if (req.session.email) {
    db.query("select *,CONCAT('" + constant.base_url + "',image) as image from home_slider  ", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('banner/banner', { result: ''});
      } else {
        var result_user = JSON.parse(JSON.stringify(result));
        res.render('banner/banner', { result: result_user });
      }

    })
  }
  else {
    res.redirect("/login");
  }
})
router.post('/changeBannerStatus', function (req, res) {
  if (req.session.email) {

    db.query("select * from home_slider WHERE id='" + req.body.id + "'", function (err, Cat) {
      if (err) {
        console.log(err);
      } else {
        var Cat = JSON.parse(JSON.stringify(Cat));
        var status = Cat[0].status;
        if (status == '1') {
          db.query('update home_slider set status="2" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        } else {
          db.query('update  home_slider set status="1" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        }
      }
    })
  } else {
    res.redirect("/login");
  }
})
router.post("/addbanner", upload.single('image'), function (req, res) {
  if (req.session.email) {

    var today = new Date();
    req.body.image = "artBeatz/images/" + req.file.filename;
    var data = {
      "title": req.body.title,
      "heading": req.body.heading,
      "description": req.body.description,
      "web_url": req.body.web_url,
      "image": req.body.image,
    }
    db.query("INSERT INTO home_slider SET ?", data, function (err, results, fields) {
      if (!err) {
        res.redirect("/banner")
      }
      else {

        res.redirect("/banner");
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Edit Banner
router.post("/updatebanner", upload.single('image'), function (req, res) {
  var sql = "UPDATE home_slider SET title =?,heading =?,description =?,web_url =? WHERE id = ?";
  var data = [req.body.title,req.body.heading,req.body.description,req.body.web_url, req.body.id];
  if(req.file != undefined){
    sql = "UPDATE home_slider SET title =?,heading =?,description =?,web_url =?,image=? WHERE id = ?";
    req.body.image = "artBeatz/images/" + req.file.filename;
    data = [req.body.title,req.body.heading,req.body.description,req.body.web_url, req.body.image, req.body.id];
  }
  var query = db.query(sql, data, function (err, result) {
    if (err) {
      console.log(err);
      res.redirect("/banner");
    }
    else {
      res.redirect("/banner");
    }
  });
})

router.get("/edit_banner/:id", function (req, res) {
  if (req.session.email) {
    var banner_id = req.params.id;
    db.query("SELECT *,concat('" + constant.base_url + "',image) as image FROM home_slider WHERE id=?", [banner_id], function (err, result) {
      if (err) {
        console.log(err);
      }
      result = JSON.parse(JSON.stringify(result[0]));
      res.render("banner/edit_banner_test", { result: result });
    });
  }
  else {
    res.redirect('/login');
  }
});

router.get("/editbanner", function (req, res) {
  var banner_id = req.body.banner_id;
  db.query("SELECT *,CONCAT('" + constant.base_url + "',image) as image FROM home_slider WHERE id=?", [banner_id], function (err, result) {
    if (err) {
      console.log(err);
    }
    result = JSON.parse(JSON.stringify(result[0]));
    res.render("banner/edit_banner", { result: result });
  });
});


//tables
router.get('/Customer', function (req, res) {
  if (req.session.email) {
    db.query("select u.*,u1.point from user as u join user_point  as u1 on u.user_pub_id = u1.user_id", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('User/customer', { result: '' });
      } else {
        var result_user = JSON.parse(JSON.stringify(result));
        res.render('User/customer', { result: result_user });
      }
    })
  }
  else {
    res.redirect("/login");
  }
});
router.get('/getCustomerList', function (req, res) {
  if (req.session.email) {
    var skip = req.query.start;
    var limit = req.query.length;
    var val = req.query.search.value;
    console.log('skip',skip, 'limit',limit);
    // where first_name like
    var search = '';
    if(val){
      search = "WHERE (name LIKE CONCAT('%"+val+"%')) OR (email_id LIKE CONCAT('%"+val+"%')) OR (mobile_no LIKE CONCAT('%"+val+"%'))"
    }
    var qry = '';
    if(val){
      qry = "SELECT * FROM user as u join user_point as u1 on u.user_pub_id = u1.user_id "+search+" LIMIT "+limit+" OFFSET "+skip+""
    }else{
      qry = "SELECT * FROM user as u join user_point  as u1 on u.user_pub_id = u1.user_id LIMIT "+limit+" OFFSET "+skip+""
    }
    db.query(qry, function (err, result) {
        if (result.length == 0) {
          console.log(err)
        } else {
          var data = JSON.stringify({
            "draw": req.query.draw,
            "recordsFiltered": result.length,
            "recordsTotal": result.length,
            "data": result
          });
          res.send(data);
        }
    })
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_view/:id', function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query("select c.cat_name as cat_name,u.*,u1.point from user as u "+
    "join user_point  as u1 on u.user_pub_id = u1.user_id "+
    "left join categories  as c on u.cat_id = c.id "+
    "WHERE u.user_pub_id='"+id+"' ", function (err, result) {
      if (result.length == 0) {
        res.redirect("/Customer");
      } else {
        var result_user = JSON.parse(JSON.stringify(result));
        res.render('User/customer_view', { result: result_user[0], tab:'view', user : id  });
      }
    });
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_job/:id', function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query('SELECT p.*,u.name FROM post_job p '+
    'join user u on p.user_pub_id=u.user_pub_id '+
    'join apply_job a on p.user_pub_id=a.artist_pub_id where p.user_pub_id="'+id+'" ', function (err, postJob) {
      if (err) {
        res.redirect("/Customer");
      } else {
        var postJob = JSON.parse(JSON.stringify(postJob));
        res.render('User/customer_job', { result: postJob, tab:'job', user : id });
      }
    });
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_invoice_received/:id', function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query('SELECT i.*,u.name,p.job_title FROM booking_invoice1 i '+
    'LEFT JOIN user u on i.user_pub_id=u.user_pub_id '+
    'LEFT JOIN post_job p on i.job_id=p.job_id '+
    'where i.artist_pub_id="'+id+'" ', function (err, invoices) {
      if (err) {
        res.redirect("/Customer");
      } else {
        var invoices = JSON.parse(JSON.stringify(invoices));
        res.render('User/customer_invoice_received', { result: invoices, tab:'inv_received', user : id });
      }
    });
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_invoice_send/:id', function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query('SELECT i.*,u.name,p.job_title FROM booking_invoice1 i '+
    'LEFT JOIN user u on i.artist_pub_id=u.user_pub_id '+
    'LEFT JOIN post_job p on i.job_id=p.job_id '+
    'where i.user_pub_id="'+id+'" ', function (err, invoices) {
      if (err) {
        res.redirect("/Customer");
      } else {
        var invoices = JSON.parse(JSON.stringify(invoices));
        res.render('User/customer_invoice_send', { result: invoices, tab:'inv_send', user : id });
      }
    });
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_edit/:id', function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query("select u.*,u1.point from user as u join user_point  as u1 on u.user_pub_id = u1.user_id WHERE u.user_pub_id='"+id+"' ", function (err, result) {
      if (result.length == 0) {
        res.redirect("/Customer");
      } else {
        var result_user = JSON.parse(JSON.stringify(result));
        res.render('User/customer_edit', { result: result_user[0] });
      }
    });
  }
  else {
    res.redirect("/login");
  }
});

router.post('/Customer_update', function (req, res) {
  if (req.session.email) {
    var id = req.body.id;
    var mobile_no = req.body.mobile_no;
    var gender = req.body.gender;
    var name = req.body.name;
    var description = req.body.description;
    var address = req.body.address;
    var qualification = req.body.qualification;
    var country = req.body.country;
    var city = req.body.city;
    var bio = req.body.bio;
    var sql = "UPDATE user SET mobile_no =?, gender =?, name =?, description =?, address =?, qualification =?, country =?, city =?, bio =? WHERE user_pub_id = ?";
    var data = [mobile_no, gender, name, description, address, qualification, country, city, bio, id];
    var query = db.query(sql, data, function (err, result) {
      res.redirect("/Customer");
    });
  }
  else {
    res.redirect("/login");
  }
});

router.get('/Customer_add', function (req, res) {
  if (req.session.email) {
        res.render('User/customer_add', { result: [] });
  }
  else {
    res.redirect("/login");
  }
});
router.post('/Customer_store',async function (req, res) {
  if (!req.body.email_id || !req.body.mobile_no || !req.body.gender || !req.body.name || !req.body.description || 
      !req.body.address || !req.body.qualification || !req.body.country || !req.body.city || !req.body.bio ||
      !req.body.password || !req.body.confirm_password) {
        return res.send({"status":"false","message":"All Fields Required"});
	} else {
    db.query("SELECT * FROM `user` WHERE `email_id`='"+req.body.email_id+"'", function (err, result) {
      if (result.length > 0) {
        return res.send({"status":"false","message":"Email Already Exist"});
      } else {
        if(req.body.password != req.body.confirm_password){
          return res.send({"status":"false","message":"Password and confirm password does not match"});
        } else {
          bcrypt.hash(req.body.password, 5, function (err, bcryptedPassword) {
            if (bcryptedPassword.length > 0) {
							var password = bcryptedPassword
						}
            var user_pub_id = uniqid();
            db.query('SELECT * FROM package WHERE is_default="1" ', function (err, packageData) {
							if (err) {
								return res.send({"status":"false","message":"Server error 1"});
							} else {
                var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                var referral_code='';
                for(var i=6; i>0;--i){
                  referral_code +=chars[Math.floor(Math.random()*chars.length)];
                }
              
                var sql = 'insert into user set user_pub_id="'+user_pub_id.toUpperCase()+'", referral_code="'+referral_code+'", '+
                'email_id="'+req.body.email_id+'", mobile_no="'+req.body.mobile_no+'", gender="'+req.body.gender+'", '+
                'name="'+req.body.name+'", description="'+req.body.description+'", address="'+req.body.address+'", '+
                'qualification="'+req.body.qualification+'", country="'+req.body.country+'", city="'+req.body.city+'", '+
                'bio="'+req.body.bio+'", password="'+password+'", email_verified="1", status="1", '+
                'created_at="'+(new Date()).valueOf().toString()+'", updated_at="'+(new Date()).valueOf().toString()+'" ';

                if(packageData.length > 0){
									var packageData = JSON.parse(JSON.stringify(packageData));
									packageData = packageData[0];
									var myDate = new Date();
									myDate.setDate(myDate.getDate() + packageData.days);
									var subs_end_date = (myDate).valueOf().toString();
                  sql = sql + ' , sub_end_date="'+subs_end_date+'" ';
                }
                db.query(sql,function(err,result){
                  if(err){
                    console.log(err)
                    return res.send({"status":"false","message":"Server error 2"});
                  }else{
                    db.query('select * from user where email_id="' + req.body.email_id + '"', function (err, re) {
											if (err) {
												console.log(err);
											} else {
												var re = JSON.parse(JSON.stringify(re));
												var user_pub_id = re[0].user_pub_id;
												var point = "0"
												var created_at = (new Date()).valueOf().toString()
												var updated_at = (new Date()).valueOf().toString()
												db.query('insert into user_point set user_id="' + user_pub_id + '",point="' + point + '",created_at="' + created_at + '" and updated_at="' + updated_at + '"', function (err, result) {
													if (err) {
														console.log(err);
													} else {
                            return res.send({"status":"true","message":"Added user successfully"});
													}
												})
											}
										})
                  }
                })                              
              }
            });
          });
        }
      }
    });
  }
});

router.get('/Payout', function (req, res) {
  if (req.session.email) {
    db.query("select u.name as name,t1.* from user as u join transaction  as t1 on u.user_pub_id = t1.user_pub_id where trans_type='0'", function (err, resultTrans) {
      if (err) {
        console.log(err)
      } else {
        var resultTrans = JSON.parse(JSON.stringify(resultTrans));
        res.render('Payout/payout', { resultTrans: resultTrans });
      }
    })
  }
  else {
    res.redirect("/login");
  }
})

router.get('/transHistory', function (req, res) {
  if (req.session.email) {
    db.query("select u.name as name,t1.* from user as u join transaction_history  as t1 on u.user_pub_id = t1.user_id ", function (err, resultTrans) {
      if (err) {
        console.log(err)
      } else {
        var resultTrans = JSON.parse(JSON.stringify(resultTrans));
        res.render('Payout/trans_history', { resultTrans: resultTrans });
      }
    })
  }
  else {
    res.redirect("/login");
  }

});


router.post('/changePayoutRequest', function (req, res) {
  if (req.session.email) {
    var user_id = req.body.user_pub_id;
    db.query("update transaction set trans_status='1' where user_pub_id='" + user_id + "'", function (err, resultTrans) {
      if (err) {
        console.log(err)
      } else {
        res.redirect('/Payout');
      }

    })
  }
  else {
    res.redirect("/login");
  }

})


router.get('/Purchase', function (req, res) {
  if (req.session.email) {
    db.query("select u.name as name,t1.* ,t.* from user as u left join transaction  as t1 on u.user_pub_id = t1.user_pub_id left join transaction_history t on t1.trans_id=t.invoice_id where t1.trans_type='1'", function (err, resultTrans) {
      console.log(resultTrans);
      if (resultTrans.length == 0) {
        console.log(err)
        res.render('Payout/purchase', { resultTrans: '' });
      } else {
        var resultTrans = JSON.parse(JSON.stringify(resultTrans));
        res.render('Payout/purchase', { resultTrans: resultTrans });
      }

    })
  }
  else {
    res.redirect("/login");
  }
})
//View Profile
router.get('/ViewProfile', function (req, res) {
  res.render('User/userProfile');
})


router.post('/changeUserStatus', function (req, res) {
  if (req.session.email) {
    console.log("changesttus")
    db.query("select * from user WHERE user_pub_id='" + req.body.user_pub_id + "'", function (err, resultUser) {
      if (err) {
        console.log(err);
      } else {
        var resultUser = JSON.parse(JSON.stringify(resultUser));
        var status = resultUser[0].status;
        console.log()
        if (status == '1') {
          db.query('update user set status="2" WHERE user_pub_id="' + req.body.user_pub_id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        } else {
          db.query('update  user set status="1" WHERE user_pub_id="' + req.body.user_pub_id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        }
      }
    })
  } else {
    res.redirect("/login");
  }
})

//category

router.get('/category', function (req, res) {
  if (req.session.email) {
    db.query("select *,concat('" + constant.base_url + "',image) as image from categories  ", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('category/category', { result: '' });
      } else {
        var result_user = JSON.parse(JSON.stringify(result));
        res.render('category/category', { result: result_user });
      }

    })
  }
  else {
    res.redirect("/login");
  }

})
router.post('/changeCatStatus', function (req, res) {
  if (req.session.email) {

    db.query("select * from categories WHERE id='" + req.body.id + "'", function (err, Cat) {
      if (err) {
        console.log(err);
      } else {
        var Cat = JSON.parse(JSON.stringify(Cat));
        var status = Cat[0].status;
        console.log()
        if (status == '1') {
          db.query('update categories set status="2" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        } else {
          db.query('update  categories set status="1" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('updated ');
            }
          })
        }
      }
    })
  } else {
    res.redirect("/login");
  }
})
router.post("/addcat", upload.single('image'), function (req, res) {
  if (req.session.email) {
    console.log(req.file);
    var today = new Date();
    req.body.image = "artBeatz/images/" + req.file.filename;
    var data = {
      "cat_name": req.body.cat_name,
      "image": req.body.image,
    }
    db.query("INSERT INTO categories SET ?", data, function (err, results, fields) {
      if (!err) {
        //res.flash("msg","Error in adding auction");
        console.log(req.body);
        res.redirect("/category")
      }
      else {
        //res.flash("msg","Error in adding auction");
        console.log(err);
        res.redirect("/category");
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Edit Category 
router.get("/editcat", function (req, res) {
  console.log(req.body.catId);
  var cat_id = req.body.catId;
  db.query("SELECT *,CONCAT('" + constant.base_url + "',image) as image FROM categories WHERE id=?", [cat_id], function (err, result) {
    if (err) {
      console.log(err);
    }
    result = JSON.parse(JSON.stringify(result[0]));
    res.render("category/edit_cat", { result: result });
  });
});

//Jobs
router.get('/pending', function (req, res) {
  if (req.session.email) {
    db.query('SELECT p.*,u.name FROM post_job p join user u on p.user_pub_id=u.user_pub_id where p.status="0" || p.status="1"', function (err, postJob) {
      console.log(postJob)
      if (err) {
        console.log(err)
      } else {
        var postJob = JSON.parse(JSON.stringify(postJob));
        res.render('Jobs/pending_jobs', { result: postJob });

      }
    })
  }
  else {
    res.redirect("/login");
  }

})


router.get('/running', function (req, res) {
  if (req.session.email) {
    db.query('SELECT p.*,u.name FROM post_job p join user u on p.user_pub_id=u.user_pub_id  join apply_job a on p.user_pub_id=a.artist_pub_id where p.status=5', function (err, postJob) {
      console.log(postJob)
      if (err) {
        console.log(err)
      } else {
        var postJob = JSON.parse(JSON.stringify(postJob));
        res.render('Jobs/Running_jobs', { result: postJob });

      }
    })
  }
  else {
    res.redirect("/login");
  }
})
router.get('/cancle', function (req, res) {
  if (req.session.email) {
    db.query('SELECT p.*,u.name FROM post_job p join user u on p.user_pub_id=u.user_pub_id  join apply_job a on p.user_pub_id=a.artist_pub_id where p.status=3', function (err, postJob) {
      console.log(postJob)
      if (err) {
        console.log(err)
      } else {
        var postJob = JSON.parse(JSON.stringify(postJob));
        res.render('Jobs/cancled_job', { result: postJob });

      }
    })
  }
  else {
    res.redirect("/login");
  }
})

router.get('/complete', function (req, res) {
  if (req.session.email) {
    db.query('SELECT p.*,u.name FROM post_job p join user u on p.user_pub_id=u.user_pub_id  join apply_job a on p.user_pub_id=a.artist_pub_id where p.status=2', function (err, postJob) {
      console.log(postJob)
      if (err) {
        console.log(err)
      } else {
        var postJob = JSON.parse(JSON.stringify(postJob));
        res.render('Jobs/completed_job', { result: postJob });
      }
    })
  }
  else {
    res.redirect("/login");
  }
})

//Notification
router.get('/notification', function (req, res) {
  if (req.session.email) {
    db.query("select *,concat('" + constant.base_url + "',image) as image from user WHERE status='1' ", function (err, result) {
      if (err) {
        console.log(err)
        res.render('Notification/notification', { result: '' });
      } else {
        result = JSON.parse(JSON.stringify(result));
        res.render('Notification/notification', { result: result });
      }
    })
  } else {
    res.redirect("/login");
  }
})

router.get('/point', function (req, res) {
  if (req.session.email) {
    db.query('select * from setting where def_key="fannan_point"', function (err, result) {
        if (err) {
          res.redirect('/login')
        } else {
        if(result[0] == null || result[0] == undefined){
          res.render('Payout/point', { result1: {'point':'','price':'','currency_symbol':'',} });
        }else{
          var resutlt = result[0].def_value;
          var result = JSON.parse(resutlt);
          res.render('Payout/point', { result1: result });
        }
      }
    })
  } else {
    res.redirect('/login')
  }
})

router.post("/updatePoint", function (req, res) {
  if (req.session.email) {
    var data = { point: "", price: "", currency_symbol: "" };
    // console.log(req.body);
    data.price = req.body.price;
    data.point = req.body.point;
    data.currency_symbol = req.body.currency_symbol;
    var result = JSON.stringify(data);
    var query = db.query("update setting set def_value='" + result + "' where def_key='fannan_point'", function (err, result) {
      if (err) {
        //req.flash("msg", "Error In User update");
        res.redirect("/point");
      }
      else {
        //req.flash("msg", "Successfully User UPDATE");
        res.redirect("/point");
      }

    });
  } else {
    res.redirect('/login');
  }
});

router.get("/edit_cat/:id", function (req, res) {
  // if (req.session.email) {
    var cat_id = req.params.id;
    db.query("SELECT *,concat('" + constant.base_url + "',image) as image FROM categories WHERE id=?", [cat_id], function (err, result) {
      if (err) {
        console.log(err);
      }
      result = JSON.parse(JSON.stringify(result[0]));
    res.render("category/edit_cat_test", { result: result });
    });
  // }
  // else {
  //   res.redirect('/login');
  // }
});

router.post("/updatecat", upload.single('image'), function (req, res) {
  var sql = "UPDATE categories SET cat_name =? WHERE id = ?";
  var data = [req.body.cat_name, req.body.id];
  if(req.file != undefined){
    sql = "UPDATE categories SET cat_name =?,image=? WHERE id = ?";
    req.body.image = "artBeatz/images/" + req.file.filename;
    data = [req.body.cat_name, req.body.image, req.body.id];
  }
  var query = db.query(sql, data, function (err, result) {
    if (err) {
      //req.flash("msg", "Error In User update");
      console.log(err);
      res.redirect("/category");
    }
    else {
      //req.flash("msg", "Successfully User UPDATE");
      res.redirect("/category");
    }

  });
})
//send-notification

router.post('/send-notification', function (req, res) {
  if (req.session.email) {
    var uid = req.body.uid;
    console.log(uid.toString());
    var idArray = uid.split(",");
    counter = 0;
    console.log(idArray);
    console.log(idArray.length);
    for (var i = 0; i < idArray.length - 1; i++) {
      var user_pub_id = idArray[i];
      console.log(idArray[i]);
      db.query('select * from user WHERE user_pub_id="' + idArray[i] + '"', function (err, result) {
        if (!err) {
          var result = JSON.parse(JSON.stringify(result));
          console.log(result)
          var device_token = result[0].device_token;

          firebase.pushnotification(req.body.title, req.body.msg, device_token, constant.Notification_type);
          var data = {
            // id:uniqid(),
            user_pub_id: user_pub_id,
            title: req.body.title,
            msg: req.body.msg,
            type: constant.Notification_type,
            created_at: (new Date()).valueOf().toString()

          }
          db.query('insert into notification set ?', [data], function (err, result) {
            if (err) {
              console.log(err);
            } else {
              counter++;

            }
          })
        }
      })

    }
    res.redirect('/notification')
  }
  else {
    res.redirect('/login');
  }
});

//Ticket
router.get('/ticket', function (req, res) {
  if (req.session.email) {
    db.query('select t.*,u.name,u.email_id,u.mobile_no from ticket t join user u on u.user_pub_id=t.user_pub_id where u.status="1"', function (err, result) {
      if (err) {
        console.log(err)
      } else {
        var result = JSON.parse(JSON.stringify(result))
        for (var i = 0; i < result.length; i++) {
          var date1 = result[i].created_at;
          let ts = Date.now(date1);
          console.log(ts)
          let date_ob = new Date(ts);
          let date = date_ob.getDate();
          let month = date_ob.getMonth() + 1;
          let year = date_ob.getFullYear();
          let hours = date_ob.getHours();

          // current minutes
          let minutes = date_ob.getMinutes();

          // current seconds
          let seconds = date_ob.getSeconds();
          let time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
          // prints date & time in YYYY-MM-DD format
          console.log(year + "-" + month + "-" + date);

          result[i].created_at = time;
        }

        res.render('Ticket/ticket', { result: result });

      }
    })
  } else {
    res.redirect('/login');
  }
})

router.post('/updatedSupport', function (req, res) {
  if (req.session.email) {
    var id = req.body.id;
    var status = req.body.status;
    console.log(req.body);
    db.query('update ticket set status="' + req.body.status + '" WHERE id="' + id + '"', function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('updated ');
      }
    })
  } else {
    res.redirect('/login')
  }
})
//Coupon

router.post('/addcoupon', function (req, res) {
  if (req.session.email) {
    var today = new Date();
    // req.body.image="fannan2/images/"+req.file.filename;
    var data = {
      coupon_code: req.body.coupon_code,
      description: req.body.description,
      discount_type: req.body.discount_type,
      discount: req.body.discount,
      created_at: (new Date().valueOf().toString()),
      updated_at: (new Date().valueOf().toString())
    }
    db.query("INSERT INTO coupon SET ?", data, function (err, results) {
      if (!err) {
        //res.flash("msg","Error in adding auction");
        res.redirect("/coupon")
      }
      else {
        //res.flash("msg","Error in adding auction");
        res.redirect("/coupon");
      }
    });
    // res.render('Coupon/coupon')
  } else {
    res.redirect('/login')
  }
});

router.get('/coupon', function (req, res) {
  if (req.session.email) {
    db.query('SELECT * from coupon', function (err, result) {
      if (err) {
        console.log(err)
      }
      else {
        var result = JSON.parse(JSON.stringify(result));
        res.render('Coupon/coupon', { result: result })
      }
    })
  } else {
    res.redirect('/login');
  }
})

router.get("/edit_coupon/:id", function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query("SELECT * FROM coupon WHERE id=?", [id], function (err, result) {
      if (err) {
        console.log(err);
      }
      result = JSON.parse(JSON.stringify(result[0]));
      res.render('Coupon/coupon_edit', { result: result });
    });
  }
  else {
    res.redirect('/login');
  }
});

//Edit Banner
router.post("/update_coupon", function (req, res) {
  if (req.session.email) {
    var sql = "UPDATE coupon SET coupon_code =?,description =?,discount_type =?,discount =? WHERE id = ?";
    var query = db.query(sql, [req.body.coupon_code,req.body.description,req.body.discount_type,req.body.discount,req.body.id], function (err, result) {
      res.send({
        "status":"success",
          "message":"Coupon update successfully"  
      })
    });
  } else {
    res.send({
      "status":"false"
    })
  }
});

router.post("/update_coupon_status", function (req, res) {
  if (req.session.email) {
    var sql = "UPDATE coupon SET status =? WHERE id = ?";
    var query = db.query(sql, [req.body.status,req.body.id], function (err, result) {
      res.send({
        "status":"success",
          "message":"Coupon update successfully"  
      })
    });
  } else {
    res.send({
      "status":"false"
    })
  }
})

router.post("/delete_coupon", function (req, res) {
  if (req.session.email) {
    var coupon = req.body.coupon;
    db.query("DELETE FROM coupon WHERE id='"+ coupon +"'", function (err, rseult) {
      res.send({
        "status":"success",
          "message":"Coupon deleted successfully"  
      })
    });
  }
  else {
    res.send({
      "status":"false"
    })
  }
});



//Icons  
router.get('/icons-material', function (req, res) {
  res.render('Icons/icons_material');
})
router.get('/icons-ion', function (req, res) {
  res.render('Icons/icons_ion');
})
router.get('/icons-fontawesome', function (req, res) {
  res.render('Icons/icons_fontawesome');
})
router.get('/icons-themify', function (req, res) {
  res.render('Icons/icons_themify');
})
router.get('/icons-dripicons', function (req, res) {
  res.render('Icons/icons_dripicons');
})
router.get('/icons-typicons', function (req, res) {
  res.render('Icons/icons_typicons');
})


//Google Maps
router.get('/maps-google', function (req, res) {
  res.render('Maps/maps_google');
})
router.get('/maps-vector', function (req, res) {
  res.render('Maps/maps_vector');
})

//Extra pages
router.get('/pages-directory', function (req, res) {
  res.render('Pages/pages_directory');
})
router.get('/pages-faq', function (req, res) {
  res.render('Pages/pages_faq');
})
router.get('/pages-gallery', function (req, res) {
  res.render('Pages/pages_gallery');
})
router.get('/pages-invoice', function (req, res) {
  res.render('Pages/pages_invoice');
})
router.get('/pages-blank', function (req, res) {
  res.render('Pages/pages_blank');
})
router.get('/pages-timeline', function (req, res) {
  res.render('Pages/pages_timeline');
})
router.get('/pages-pricing', function (req, res) {
  res.render('Pages/pages_pricing');
})

// Currency Setting Module ##########################
router.get('/currency_setting', function (req, res) {
  if (req.session.email) {
    db.query("SELECT * FROM currency_setting", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('CurrencySetting/currency_setting', { result: '' });
      } else {
        var result = JSON.parse(JSON.stringify(result));
        res.render('CurrencySetting/currency_setting', { result: result });
      }
    })
  }
  else {
    res.redirect("/login");
  }
});
router.post("/addCurrencySetting", function (req, res) {
  if (req.session.email) {
    var today = new Date();
    var package_data = {
      // "id":uniqid(),
      "currency_symbol": req.body.currency_symbol,
      "currency_name": req.body.currency_name,
      "code": req.body.code,
      "country_code": req.body.country_code,
      "status":1
    }
    db.query("INSERT INTO currency_setting SET ?", package_data, function (err, results, fields) {
      if (!err) {
        res.redirect("/currency_setting")
      }
      else {
        console.log(err);
        res.redirect("/currency_setting");
      }
    });
  } else {
    res.redirect("/login");
  }
});
router.post('/changecurrencyStatus', function (req, res) {
  if (req.session.email) {
    db.query("select * from currency_setting WHERE id='" + req.body.id + "'", function (err, packageObjData) {
      if (err) {
        console.log(err);
      } else {
        var packageObjData = JSON.parse(JSON.stringify(packageObjData));
        var status = packageObjData[0].status;
        if (status == '1') {
          db.query('update currency_setting set status="0" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({"status":1,"message":"success"});
            }
          })
        } else {
          db.query('update currency_setting set status="1" WHERE id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({"status":1,"message":"success"});
            }
          })
        }
      }
    })
  } else {
    res.redirect("/login");
  }
});
router.get("/currency/edit/:id", function (req, res) {
  if (req.session.email) {
    var id = req.params.id;
    db.query("SELECT * FROM currency_setting WHERE id=?", [id], function (err, result) {
      if (err) {
        console.log(err);
      }
      result = JSON.parse(JSON.stringify(result[0]));
      res.render("CurrencySetting/edit_currency_setting", { result: result });
    });
  }
  else {
    res.redirect('/login');
  }
});
router.post("/updateCurrency", function (req, res) {
  var sql = "UPDATE currency_setting SET currency_symbol=?,currency_name=?,code=?,country_code=? WHERE id=?";
  var query = db.query(sql, [req.body.currency_symbol, req.body.currency_name, req.body.code, req.body.country_code, req.body.id], function (err, result) {
    if (err) {
      res.redirect("/currency_setting");
    }
    else {
      res.redirect("/currency_setting");
    }
  });
})


// Package Module #################################
router.get('/package', function (req, res) {
  if (req.session.email) {
    db.query("SELECT * FROM package", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('Package/package', { result: '' });
      } else {
        var result = JSON.parse(JSON.stringify(result));
        res.render('Package/package', { result: result });
      }
    })
  }
  else {
    res.redirect("/login");
  }
});

router.get("/package/edit/:id", function (req, res) {
  if (req.session.email) {
    var package_pub_id = req.params.id;
    db.query("SELECT * FROM package WHERE package_pub_id=?", [package_pub_id], function (err, result) {
      if (err) {
        console.log(err);
      }
      result = JSON.parse(JSON.stringify(result[0]));
      res.render("Package/edit_package", { result: result });
    });
  }
  else {
    res.redirect('/login');
  }
});

router.post("/updatePackage", function (req, res) {
  var sql = "UPDATE package SET title=?,description=?,days=?,amount=? WHERE package_pub_id=?";
  var query = db.query(sql, [req.body.title, req.body.description, req.body.days, req.body.amount, req.body.package], function (err, result) {
    if (err) {
      res.redirect("/package");
    }
    else {
      res.redirect("/package");
    }
  });
})

router.post("/addPackage", function (req, res) {
  if (req.session.email) {
    var today = new Date();
    var package_data = {
      "package_pub_id":uniqid(),
      "title": req.body.title,
      "description": req.body.description,
      "days": req.body.days,
      "amount": req.body.amount,
      "status":1
    }
    db.query("INSERT INTO package SET ?", package_data, function (err, results, fields) {
      if (!err) {
        //res.flash("msg","Error in adding auction");
        res.redirect("/package")
      }
      else {
        //res.flash("msg","Error in adding auction");
        console.log(err);
        res.redirect("/package");
      }
    });
  } else {
    res.redirect("/login");
  }
});

router.post('/changePackageStatus', function (req, res) {
  if (req.session.email) {
    db.query("select * from package WHERE package_pub_id='" + req.body.id + "'", function (err, packageObjData) {
      if (err) {
        console.log(err);
      } else {
        var packageObjData = JSON.parse(JSON.stringify(packageObjData));
        var status = packageObjData[0].status;
        if (status == '1') {
          db.query('update package set status="0" WHERE package_pub_id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({"status":1,"message":"success"});
            }
          })
        } else {
          db.query('update package set status="1" WHERE package_pub_id="' + req.body.id + '"', function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send({"status":1,"message":"success"});
            }
          })
        }
      }
    })
  } else {
    res.redirect("/login");
  }
});

router.get('/subscription', function (req, res) {
  if (req.session.email) {
    db.query("SELECT sh.*,u.name as user_name,p.title as package FROM subscription_history as sh join user u on u.user_pub_id=sh.user_pub_id join package p on p.package_pub_id=sh.package_pub_id", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('Subscription/subscription', { result: '' });
      } else {
        var result = JSON.parse(JSON.stringify(result));
        res.render('Subscription/subscription', { result: result });
      }
    })
  }
  else {
    res.redirect("/login");
  }
});

router.get('/subscriptionTransHistory', function (req, res) {
  if (req.session.email) {
    db.query("SELECT st.*,u.name as user_name,p.title as package FROM subscription_transactions as st join user u on u.user_pub_id=st.user_pub_id join package p on p.package_pub_id=st.package_pub_id", function (err, result) {
      if (result.length == 0) {
        console.log(err)
        res.render('Subscription/transaction', { result: '' });
      } else {
        var result = JSON.parse(JSON.stringify(result));
        res.render('Subscription/transaction', { result: result });
      }
    })
  }
  else {
    res.redirect("/login");
  }
});

module.exports = router;