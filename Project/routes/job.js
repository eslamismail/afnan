const express = require('express');
const app = express.Router();
const bodyparser = require('body-parser');
const cm = require('../model/common');
var multer = require('multer')
var routes = require('../routes');
var con = require('../config/database');
var Promise = require('promise');
var fn = require('../firebase/firebase');
// var base_url=constant.base_url;
app.use(bodyparser.json());
app.use(routes);

var constant = require('../constant/constant');
var constantAR = require('../constant/constantAr');
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
var base_url = constant.base_url;



app.post(constant.PostJob, function (req, res) {
  // console.log(req.body.user_pub_id,req.body.description)
  if (!req.body.cat_id || !req.body.user_pub_id || !req.body.job_title || !req.body.description || !req.body.address || !req.body.latitude || !req.body.longitude || !req.body.time || !req.body.date || !req.body.duration) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        // console.log('getuserstatus',err,res);
        cm.responseMessage(constant.Zero, err, res)
      }
      else {
        // console.log('insert job');
        var job_id = cm.randomString(8, '0123456789abcdefghijklmnopqrstuvwxyz');
        var parData = {
          job_id: job_id,
          cat_id: req.body.cat_id,
          time: req.body.time,
          date: req.body.date,
          user_pub_id: req.body.user_pub_id,
          job_title: req.body.job_title,
          description: req.body.description,
          duration: req.body.duration,
          address: req.body.address,
          price: req.body.price,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          job_start_time: req.body.job_start_time,
          created_at: (new Date()).valueOf().toString(),
          updated_at: (new Date()).valueOf().toString()
        }
        cm.insert('post_job', parData, function (err, result) {
          if (err) {
            cm.responseMessage(constant.Zero, err, res)
          } else {
            // console.log('job success')
            cm.getNearbyArtistCat(req.body.user_pub_id, req.body.latitude, req.body.longitude, req.body.cat_id, function (err, photograhpar) {
              //photograhpar = JSON.parse(JSON.stringify(photograhpar));
              if (photograhpar.length != 0) {
                photograhpar
                  .reduce(function (promiesRes, photograhpardata, index) {
                    return promiesRes
                      .then(function (data) {
                        return new Promise(function (resolve, reject) {
                          // console.log(photograhpardata);
                          con.query('select * from user where user_pub_id="' + photograhpardata.user_pub_id + '"', function (err, result) {
                            if (err) {
                              console.log(err)
                            } else {
                              var result = JSON.parse(JSON.stringify(result));
                              var email = result[0].email_id;
                              var name = result[0].name;
                              var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.POST_JOB + constant.SIGNATURE;
                              cm.sendmail(email, constant.POST_JOB, msg)
                              var device_token = photograhpardata.device_token;
                              var title = constant.newJob;
                              var msg = constant.jobMsg;
                              var type = constant.post_job_type;
                              var parData = {
                                user_pub_id: photograhpardata.user_pub_id,
                                title: title,
                                type: type,
                                msg: msg,
                                created_at: (new Date()).valueOf().toString()
                              }
                              cm.insert('notification', parData, function (err, result) {
                                if (err) {
                                  cm.responseMessage(constant.Zero, err, res);
                                } else {
                                  fn.pushnotification(title, msg, device_token, type);
                                  resolve(photograhpardata);
                                }
                              })
                            }
                          })
                        });
                      })
                      .catch(function (error) {
                        return error.message;
                      })
                  }, Promise.resolve(null)).then(arrayOfResults => {
                  });
              }
            });
            cm.responseMessage(constant.One, constant.POST_JOB, res)
          }
        })
      }
    })
  }

})

app.post('/directBooking', function (req, res) {
  if (!req.body.cat_id || !req.body.user_pub_id || !req.body.job_title || !req.body.description || !req.body.address || !req.body.latitude || !req.body.longitude || !req.body.time || !req.body.date || !req.body.duration) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    // con.query('select * from post_job where user_pub_id="'+req.body.user_pub_id+'" and artist_pub_id="'+req.body.artist_pub_id+'" and time="'+req.body.time+'"',function(err,result){
    //   if(err){
    //     cm.responseMessage(constant.Zero,err,res);
    //   }else{
    //     if(result.length>0){
    //       cm.responseMessage(constant.Zero,constant.timeMsg,res);
    //     }else{
    // console.log(req.body.user_pub_id)
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      }
      else {
        var status = 1;
        var job_id = cm.randomString(8, '0123456789abcdefghijklmnopqrstuvwxyz');
        var parData = {
          job_id: job_id,
          artist_pub_id: req.body.artist_pub_id,
          cat_id: req.body.cat_id,
          time: req.body.time,
          date: req.body.date,
          user_pub_id: req.body.user_pub_id,
          job_title: req.body.job_title,
          description: req.body.description,
          duration: req.body.duration,
          address: req.body.address,
          status: status,
          price: req.body.price,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          job_start_time: req.body.job_start_time,
          created_at: (new Date()).valueOf().toString(),
          updated_at: (new Date()).valueOf().toString()
        }
        cm.insert('post_job', parData, function (err, result) {
          if (err) {
            cm.responseMessage(constant.Zero, err, res)
          } else {
            var insertId = result.insertId;
            con.query('select * from post_job where id="' + insertId + '"', function (err, resultPost) {
              if (err) {
                cm.responseMessage(constant.Zero, err, res)

              } else {
                var resultPost = JSON.parse(JSON.stringify(resultPost));
                var job_id = resultPost[0].job_id;
                var parApplydata = {
                  job_id: job_id,
                  artist_pub_id: req.body.artist_pub_id,
                  status: 1,
                  created_at: (new Date()).valueOf().toString(),
                  updated_at: (new Date()).valueOf().toString()
                }
                cm.insert('apply_job', parApplydata, function (err, result) {
                  if (err) {
                    cm.responseMessage(constant.Zero, err, res)
                  } else {
                    con.query('select * from user where user_pub_id="' + req.body.artist_pub_id + '"', function (err, resultUser) {
                      if (err) {
                        cm.responseMessage(constant.Zero, err, res);
                      } else {
                        var resultUser = JSON.parse(JSON.stringify(resultUser));
                        var title = constant.AccepJotTitle;
                        var msg = constant.Accept_Job_msg;
                        var type = constant.Direct_Job;
                        var device_token = resultUser[0].device_token;
                        var parData = {
                          user_pub_id: req.body.artist_pub_id,
                          title: title,
                          type: type,
                          msg: msg,
                          created_at: (new Date()).valueOf().toString()
                        }
                        cm.insert('notification', parData, function (err, result) {
                          if (err) {
                            cm.responseMessage(constant.Zero, err, res);
                          } else {
                            fn.pushnotification(title, msg, device_token, type)
                            cm.responseMessage(constant.One, constant.POST_JOB, res)
                          }
                        })

                      }
                    })

                  }
                })
              }
            })
          }
        })
      }
    })
    //     }
    //   }
    // })

  }

})



app.post('/getMyJobs', function (req, res) {
  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkFields, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      } else {
        if (result.length > 0) {
          cm.getPostedJobs(req.body.user_pub_id, function (err, result) {
            if (err) {
              cm.responseMessage(constant.Zero, err, res)
            }
            var result = JSON.parse(JSON.stringify(result));
            if (result.length != 0) {
              var resultLength = result.length;
              console.log(result.length);
              var counter = 0;
              var result_array = [];
              result.forEach(function (result) {
                con.query('select coalesce(count(job_id),0) as applicant_count from apply_job where job_id="' + result.job_id + '" and status in(0,1,2,5)', function (err, resultCount) {
                  if (err) {
                    console.log(err);
                  } else {
                    var resultCount = JSON.parse(JSON.stringify(resultCount));
                    if (resultCount.length > 0) {
                      result.applicant_count = resultCount[0].applicant_count;
                    } else {
                      result.applicant_count = 0;
                    }
                    result_array.push(result);
                    counter++;
                    if (counter == resultLength) {
                      cm.responseMessagedata(constant.One, constant.GET_JOB, result_array, res)
                      console.log("counter" + counter);
                    }
                  }
                })
              })
            } else {
              cm.responseMessage(constant.Zero, constant.NO_CAT, res)
            }
          });
        } else {
          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
        }
      }
    });
  }
});


app.post(constant.UpdateJob, function (req, res) {
  if (!req.body.job_id || !req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      } else {
        if (result.length != 0) {
          let job_id = req.body.job_id;
          con.query("select * from post_job where job_id='" + job_id + "'", function (err, jobData) {
            if (err) {
              cm.responseMessage(constant.Zero, err, res)
            } else {
              if (jobData.length == 0) {
                cm.responseMessage(constant.Zero, constant.USER_NOT_FOUND, res)
              } else {
                con.query('update post_job set cat_id=?,time=?,date=?,job_title=?,description=?,duration=?,address=?,latitude=?,longitude=?,price=?,job_start_time=? where job_id=?', [req.body.cat_id, req.body.time, req.body.date, req.body.job_title, req.body.description, req.body.duration, req.body.address, req.body.latitude, req.body.longitude, req.body.price, req.body.job_start_time, req.body.job_id], function (err, result, fields) {
                  if (err) {
                    cm.responseMessage(constant.Zero, err, res)
                  } else {
                    if (result.length != 0) {
                      cm.responseMessage(constant.One, constant.JOB_UPDATE, res)
                    } else {
                      cm.responseMessage(constant.Zero, constant.NOT_RESPONDING, res)
                    }
                  }
                });
              }
            }
          });
        } else {
          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
        }
      }
    })
  }
});

//Delete Job
app.post(constant.Deletejob, function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {
    cm.responseMessage(constant.Zero, err, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      } else {
        if (result.length != 0) {
          cm.getAppliedJob(req.body.job_id, function (err, job) {
            if (err) {
              cm.responseMessage(constant.Zero, err, res)
            } else {
              if (job.length == 0) {
                var status = 4;
                con.query('update post_job set status=? where job_id=?', [status, req.body.job_id], function (err, result) {
                  if (err) {
                    cm.responseMessage(constant.One, err, res)
                  } else {
                    if (result.length != 0) {
                      var status = 4;
                      con.query('update apply_job set status=? where job_id=?', [status, req.body.job_id], function (err, result) {
                        if (!err) {
                          cm.getUserStatus(req.body.user_pub_id, function (err, result) {
                            if (err) {
                              console.log(err)
                            } else {
                              // var msg=constant.Delete_msg;
                              // var title=constant.Delete_job_title;
                              // var type=constant.Delete_job;
                              //         var result=JSON.parse(JSON.stringify(result));
                              // var reciver_token=result[0].device_token;
                              // fn.pushnotification(title,msg,reciver_token,type);
                              cm.responseMessage(constant.One, constant.JOB_DELETE, res)
                            }
                          })
                        }
                      })
                    } else {
                      cm.responseMessage(constant.Zero, constant.NOT_RESPONDING, res)
                    }
                  }
                });
              } else {
                cm.responseMessage(constant.Zero, constant.ARTIST_WORKING, res)
              }
            }
          });
        } else {
          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS)
        }
      }
    })
  }
});



app.post('/rejectJob', function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      } else {
        if (result.length != 0) {
          cm.getAppliedJob(req.body.job_id, function (err, job) {
            if (err) {
              cm.responseMessage(constant.Zero, err, res)
            } else {
              if (job.length == 0) {
                if (result.length != 0) {
                  var status = 3;
                  con.query('update apply_job set status=? where job_id=? and artist_pub_id="' + req.body.user_pub_id + '"', [status, req.body.job_id], function (err, result) {
                    if (!err) {
                      cm.getUserStatus(req.body.user_pub_id, function (err, result) {
                        if (err) {
                          console.log(err)
                        } else {
                          con.query('select *from post_job where job_id="' + req.body.job_id + '"', function (err, result) {
                            if (err) {
                              console.log(err)
                            } else {
                              var result = JSON.parse(JSON.stringify(result));
                              var user_pub_id = result[0].user_pub_id;
                              con.query("select *from user where user_pub_id='" + user_pub_id + "'", function (err, result) {
                                if (err) {
                                  console.log(err)
                                } else {
                                  var result = JSON.parse(JSON.stringify(result));
                                  // var email=result[0].email_id;
                                  // var name=result[0].name;
                                  con.query('select * from user where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultArtist) {
                                    if (err) {
                                      cm.responseMessage(constant.Zero, err, res);
                                    } else {
                                      var resultArtist = JSON.parse(JSON.stringify(resultArtist));
                                      var emailArtist = resultArtist[0].email;
                                      var name = resultArtist[0].name;
                                      var reciver_token = resultArtist[0].device_token;
                                      var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.JOB_REJECTED + constant.SIGNATURE;
                                      cm.sendmail(emailArtist, constant.JOB_REJECTED, msg)
                                      var title = constant.Job_reject;
                                      var type = constant.reject_job_type;
                                      var msg = constant.Job_reject_msg;
                                      var parData = {
                                        user_pub_id: req.body.user_pub_id,
                                        title: title,
                                        type: type,
                                        msg: msg,
                                        created_at: (new Date()).valueOf().toString()
                                      }
                                      cm.insert('notification', parData, function (err, result) {
                                        if (err) {
                                          cm.responseMessage(constant.Zero, err, res);
                                        } else {
                                          fn.pushnotification(title, msg, reciver_token, type);
                                          cm.responseMessage(constant.One, constant.JOB_REJECTED, res);
                                        }
                                      })
                                    }
                                  })

                                }
                              })
                            }
                          })
                        }
                      })

                    }
                  })
                } else {

                  cm.responseMessage(constant.Zero, constant.NOT_RESPONDING, res)
                }

              } else {

                cm.responseMessage(constant.Zero, constant.ARTIST_WORKING, res)
              }
            }
          });

        } else {

          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS)
        }

      }
    })
  }
});


app.post('/changeJobStatus', function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id || !req.body.status) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res)
      } else {
        if (result.length != 0) {
          var status = req.body.status;
          if (status == 1) {
            con.query('update post_job set status=? where job_id=?', [status, req.body.job_id], function (err, result) {

            })
            con.query('update apply_job set status=? where job_id=?', [3, req.body.job_id], function (err, result) {
            });
          }
          con.query('update apply_job set status=? where job_id=?', [status, req.body.job_id], function (err, result) {

            if (err) {

              cm.responseMessage(constant.Zero, err, res)
            } else {
              if (result.length != 0) {
                var msg = "";
                var mg = "";
                var title = "";
                var type = "";
                if (status == 4) {
                  mg = constant.DELETE_JOB_BY_USER;
                  msg = constant.JOB_DELETE;
                  title = constant.Delete_msg_title;
                  type = constant.Delete_job;
                }
                if (status == 1) {
                  mg = constant.CONFIRM_JOB_BY_USER;
                  msg = constant.JOB_CONFIRM;
                  title = constant.AccepJotTitle;
                  type = constant.Accept_Job;
                }
                if (status == 3) {
                  mg = constant.REJECT_JOB_BY_USER;
                  msg = constant.JOB_REJECTED;
                  title = constant.Reject_title;
                  type = constant.reject_job_type;

                }
                cm.getsingleApplyjob(req.body.job_id, function (err, job) {
                  if (job.length > 0) {
                    var reciver_pub = job[0].artist_pub_id;
                    cm.getUserStatus(reciver_pub, function (err, user_result) {
                      if (err) {

                        cm.responseMessage(constant.Zero, err, res)
                      } else {
                        var data1 = JSON.parse(JSON.stringify(user_result));
                        var reciver_token = data1[0].device_token;
                        fn.pushnotification(title, msg, reciver_token, type);
                      }
                    });

                    cm.responseMessage(constant.One, constant.JOB_START, res)
                  }
                })
              } else {

                cm.responseMessage(constant.Zero, constant.NOT_RESPONDING, res)
              }
            }
          })

        } else {

          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
        }
      }
    });
  }
});

//Apply Job
app.post(constant.ApplyJob, function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {

        cm.responseMessage(constant.Zero, err, res)
      } else {
        var parData = {
          artist_pub_id: req.body.user_pub_id,
          job_id: req.body.job_id,
          created_at: (new Date()).valueOf().toString(),
          updated_at: (new Date()).valueOf().toString(),
        }
        con.query("INSERT INTO apply_job set ?", parData, function (err, result) {
          if (err) {

            cm.responseMessage(constant.Zero, err, res)
          } else {

            con.query('select *from post_job where job_id="' + req.body.job_id + '"', function (err, Jobresult) {
              if (err) {
                console.log(err)
              } else {
                var Jobresult = JSON.parse(JSON.stringify(Jobresult));

                var user_pub_id = Jobresult[0].user_pub_id;
                con.query('select *from user where user_pub_id="' + user_pub_id + '"', function (err, userresult) {
                  if (err) {
                    console.log(err)
                  } else {
                    // 		var email=userresult[0].email_id
                    //      console.log(email)
                    //      var user_name=userresult[0].name
                    //      console.log(user_pub_id);

                    //   var msg = constant.HELLO+'<br><br/>'+user_name+constant.APPLIED_JOB+constant.SIGNATURE;
                    // cm.sendmail(email,constant.APPLIED_JOB,msg)
                    //      cm.responseMessage(constant.One,constant.APPLIED_JOB,res)
                    con.query('select *from user where user_pub_id="' + user_pub_id + '"', function (err, result) {
                      if (err) {
                        console.log(err)
                      } else {
                        var email1 = userresult[0].email_id
                        var user_name = userresult[0].name
                        var result = JSON.parse(JSON.stringify(result));
                        var email2 = result[0].email_id;
                        var user_name = result[0].name;
                        var msg = constant.HELLO + '<br><br/>' + user_name + ' ' + constant.APPLIED_JOB + constant.SIGNATURE;
                        cm.sendmail(email1, constant.APPLIED_JOB, msg)
                        var msg1 = constant.APPLIED_JOB;
                        var title = constant.Applied_job_title;
                        var type = constant.Applied_job;
                        var device_token = result[0].device_token;
                        var parData = {
                          user_pub_id: user_pub_id,
                          title: title,
                          type: type,
                          msg: msg1,
                          created_at: (new Date()).valueOf().toString()
                        }
                        cm.insert('notification', parData, function (err, result) {
                          if (err) {
                            cm.responseMessage(constant.Zero, err, res);
                          } else {
                            fn.pushnotification(title, msg1, device_token, type)
                            cm.responseMessage(constant.One, constant.APPLIED_JOB, res)

                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})
//Get Job throw Status
app.post(constant.GetJobByStatus, function (req, res) {
  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res);
  } else {
    var status = req.body.status;
    var user_pub_id = req.body.user_pub_id;
    var qua = 'select p.*,a.*,c.cat_name, u.name,cs.currency_symbol,concat("' + base_url + '",u.image)  as image from post_job p join categories c on c.id=p.cat_id  join user u on  u.user_pub_id = p.user_pub_id  join currency_setting cs on cs.status="1" join apply_job a on p.job_id=a.job_id where a.artist_pub_id="' + user_pub_id + '" and a.status="' + status + '" order by a.created_at desc';
    con.query(qua, function (err, resultPostData) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res);
      } else {
        var resultPostData = JSON.parse(JSON.stringify(resultPostData));
        if (resultPostData.length > 0) {
          if (status == "0") {


            var message = constant.pending_job;
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          }
          if (status == "1") {
            var message = constant.confirmJob;
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          } if (status == "2") {

            var message = constant.getCompleteJob;
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          } if (status == "3") {
            var message = constant.getRejectJob;
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          } if (status == "4") {
            var message = constant.getDeactivejob;
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          }
          if (status == "5") {
            var message = constant.runningJob
            cm.responseMessagedata(constant.One, message, resultPostData, res);
          }
        } else {
          var msg = constant.NODATA;
          cm.responseMessage(constant.Zero, msg, res);

        }
      }
    })
  }
});

//Get All Posted Artist

app.post(constant.GetJobsArtist, function (req, res) {
  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res);

  } else {
    if (!req.body.cat_id) {
      cm.getUserStatus(req.body.user_pub_id, function (err, result) {
        if (err) {
          cm.responseMessage(constant.Zero, constant.USER_NOT_FOUND, res)
        } else {
          if (result.length > 0) {
            cm.getJobsArtist1(req.body.user_pub_id, function (err, result) {
              if (err) {
                cm.responseMessage(constant.Zero, constant.ERR, res)
              }
              // var result = JSON.parse(JSON.stringify(result));
              if (result.length != 0) {
                cm.responseMessagedata(constant.One, constant.GET_JOB, result, res)
              } else {
                cm.responseMessage(constant.Zero, constant.NO_CAT, res)
              }
            });
          } else {

            cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
          }
        }
      });
    } else {
      cm.getUserStatus(req.body.user_pub_id, function (err, result) {
        if (err) {

          cm.responseMessage(constant.Zero, constant.USER_NOT_FOUND, res)
        } else {
          if (result.length > 0) {
            var cat_id = result[0].cat_id;

            cm.getJobsArtist(req.body.user_pub_id, req.body.cat_id, req.body.job_id, function (err, result) {

              if (err) {
                cm.responseMessage(constant.Zero, err, res)
              }
              var result = JSON.parse(JSON.stringify(result));
              if (result.length > 0) {
                cm.responseMessagedata(constant.One, constant.GET_JOB, result, res)
              } else {
                cm.responseMessage(constant.Zero, constant.NO_CAT, res)
              }
            });
          } else {
            cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
          }
        }
      });

    }
  }
});




//Get Jobs Applid By User
app.post(constant.GetJobsAppliedByUser, function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {
    cm.responseMessage(constant.Zero, constant.chkFields, res);
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res);

      } else {
        if (result.length > 0) {
          cm.getJobsAppliedUser(req.body.job_id, function (err, result) {
            if (err) {
              cm.responseMessage(constant.Zero, err, res);

            }
            result = JSON.parse(JSON.stringify(result));
            if (result.length != 0) {
              res.send({
                "status": 1,
                "message": constant.GET_JOB,
                "data": result,
                "count": result.length
              });
            } else {

              cm.responseMessage(constant.Zero, constant.NO_CAT, res);

            }
          });
        } else {
          // res.send({
          //     "status": 2,
          //     "message": constant.ACCOUNT_STATUS
          // });
          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res);

        }
      }
    });
  }
});

//Accept
app.post(constant.AcceptJobByUser, function (req, res) {
  if (!req.body.job_id || !req.body.artist_pub_id) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  }
  con.query('update post_job set status="1" where job_id="' + req.body.job_id + '" ', function (err, resultJob) {
    if (err) {

      cm.responseMessage(constant.Zero, constant.ERR, res)
    } else {
      con.query('update apply_job set status="1" where job_id="' + req.body.job_id + '" and artist_pub_id="' + req.body.artist_pub_id + '"', function (err, resultJob) {
        if (err) {

          cm.responseMessage(constant.Zero, constant.Err, res)
        } else {
          con.query('update apply_job set status="3" where job_id="' + req.body.job_id + '" and artist_pub_id!="' + req.body.artist_pub_id + '"', function (err, resultJob) {
            if (err) {
              // console.log(err);
              cm.responseMessage(constant.Zero, constant.ERR, res);

            } else {
              con.query('select * from user where user_pub_id="' + req.body.artist_pub_id + '"', function (err, resulUser) {
                if (err) {
                  cm.responseMessage(constant.Zero, err, res);

                } else {

                  var resulUser = JSON.parse(JSON.stringify(resulUser));
                  console.log(resulUser);
                  var name = resulUser[0].name;
                  var email = resulUser[0].email_id;
                  console.log(email)
                  var msg = constant.HELLO + '<br><br/>' + name + constant.APPLIED_JOB + constant.SIGNATURE;
                  cm.sendmail(email, constant.AccepJotTitle, msg);

                  var title = constant.AccepJotTitle;
                  var msg1 = constant.Accept_Job_msg;
                  var type = constant.Accept_Job;
                  var device_token = resulUser[0].device_token;
                  var parData = {
                    user_pub_id: req.body.artist_pub_id,
                    title: title,
                    type: type,
                    msg: msg1,
                    created_at: (new Date()).valueOf().toString()
                  }
                  cm.insert('notification', parData, function (err, result) {
                    if (err) {
                      cm.responseMessage(constant.Zero, err, res);
                    } else {
                      fn.pushnotification(title, msg1, device_token, type)
                      cm.responseMessage(constant.One, constant.AccepJotTitle, res)
                    }
                  })

                }
              })
            }
          })
        }
      })
    }
  })
})

//Start_job

app.post(constant.StartJob, function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {
    console.log("check all field")
    cm.responseMessage(constant.Zero, constant.chkField, res)

  } else {
    con.query('select * FROM apply_job where artist_pub_id="' + req.body.user_pub_id + '" and status="5"', function (err, result1) {
      if (err) {
        console.log(err)
      } else {
        if (result1.length > 0) {

          cm.responseMessage(constant.Zero, constant.jobRunning, res)

        } else {
          var parData = {
            status: 5,
            end_time: "",
            start_time: (new Date()).valueOf().toString(),
            updated_at: (new Date()).valueOf().toString(),
          }
          con.query('update apply_job set status="5" where job_id=? and artist_pub_id="' + req.body.user_pub_id + '" and status="1"', [req.body.job_id], function (err, result) {
            if (err) {
              console.log(err)
            } else {
              con.query('update post_job set ? where job_id=?', [parData, req.body.job_id], function (err, resultStart) {
                if (err) {
                  console.log(err)
                } else {
                  con.query("select *from post_job where job_id='" + req.body.job_id + "'", function (err, result) {
                    if (result.length > 0) {
                      var reciver_pub = result[0].user_pub_id;
                      cm.getUserStatus(reciver_pub, function (err, user_result) {
                        if (err) {
                          console.log(err)
                        } else {
                          var user_result = JSON.parse(JSON.stringify(user_result));
                          var email = user_result[0].email_id;


                          var name = user_result[0].name;
                          var msg = constant.HELLO + '<br><br/>' + name + constant.JOB_START + constant.SIGNATURE;
                          cm.sendmail(email, constant.JOB_START, msg);
                          var user_pub_id = user_result[0].user_pub_id;
                          var device_token = user_result[0].device_token;
                          var title = constant.startJob;
                          var msg1 = constant.StartJobByArtist;
                          var type = constant.Start_job;
                          var parData = {
                            user_pub_id: user_pub_id,
                            title: title,
                            type: type,
                            msg: msg1,
                            created_at: (new Date()).valueOf().toString()
                          }
                          cm.insert('notification', parData, function (err, result) {
                            if (err) {
                              cm.responseMessage(constant.Zero, err, res);
                            } else {
                              fn.pushnotification(title, msg1, device_token, type)
                              cm.responseMessage(constant.One, constant.START_JOB, res);
                            }
                          })
                        }
                      });
                      // res.send({
                      // 	"status":1,
                      // 	"message":"start job"
                      // })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })

  }
})

//end job

app.post(constant.EndJob, function (req, res) {
  if (!req.body.user_pub_id || !req.body.job_id) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    con.query("select *from post_job where job_id='" + req.body.job_id + "' and status !='2'", function (err, result) {

      if (err) {

        cm.responseMessage(constant.Zero, constant.ERR, res)
      } else {
        con.query('update apply_job set status="2" where job_id="' + req.body.job_id + '" and status="5"', function (err, result) {
          if (err) {

            cm.responseMessage(constant.Zero, constant.ERR, res)
          } else {
            var end_time = (new Date()).valueOf().toString();

            con.query('update post_job set status="2",end_time="' + end_time + '" where job_id="' + req.body.job_id + '"', function (err, result) {
              if (err) {

                cm.responseMessage(constant.Zero, constant.ERR, res)
              } else {
                con.query('SELECT * from post_job where job_id="' + req.body.job_id + '" and status ="2"', function (err, result) {
                  if (result.length > 0) {
                    var user_id = result[0].user_pub_id;
                    var parData = {
                      user_pub_id: user_id,
                      final_amount: result[0].price,
                      status: 1,
                      job_id: req.body.job_id,
                      invoice_id: cm.randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                      artist_pub_id: req.body.user_pub_id,
                      created_at: (new Date()).valueOf().toString(),
                      updated_at: (new Date()).valueOf().toString()
                    }
                    con.query('insert into booking_invoice1 set ?', [parData], function (err, result) {
                      if (err) {
                        // console.log(err)
                        cm.responseMessage(constant.Zero, constant.ERR, res)
                      } else {
                        con.query('select *from user where user_pub_id="' + user_id + '"', function (err, result) {
                          if (err) {
                            console.log(err)
                          } else {


                            var result = JSON.parse(JSON.stringify(result));
                            var email = result[0].email_id;
                            var name = result[0].name
                            var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.Completejob + constant.SIGNATURE;
                            cm.sendmail(email, constant.Completejob, msg);
                            var device_token = result[0].device_token;
                            var title = constant.Completejob;
                            var msg1 = constant.completeJobMsg;
                            var type = constant.end_job;
                            var parData = {
                              user_pub_id: user_id,
                              title: title,
                              type: type,
                              msg: msg1,
                              created_at: (new Date()).valueOf().toString()
                            }
                            cm.insert('notification', parData, function (err, result) {
                              if (err) {
                                cm.responseMessage(constant.Zero, err, res);
                              } else {
                                fn.pushnotification(title, msg1, device_token, type)
                                cm.responseMessage(constant.One, constant.end_job_succ, res)
                              }
                            })

                          }
                        })
                      }
                    })
                  } else {
                    cm.responseMessage(constant.Zero, constant.NOT_FOUND_DATA, res)
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})

//get all Active job Job

app.post(constant.GetAllActiveJobs, function (req, res) {
  if (!req.body.user_pub_id) {
    // console.log("not define")
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  }
  else {
    con.query('SELECT *FROM POST_JOB where user_pub_id="' + req.body.user_pub_id + '" and status="5"', function (err, result) {
      if (err) {
        // console.log(err)
        cm.responseMessage(constant.Zero, constant.ERR, res)
      } else {


        cm.responseMessagedata(constant.One, constant.ActiveJob, result, res)
      }
    })
  }
});

//get All ActiveJob 
app.post(constant.GetCurrentJob, function (req, res) {
  if (!req.body.user_pub_id) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {

        cm.responseMessage(constant.Zero, constant.ERR, res)
      } else {
        if (result.length > 0) {
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
              Activeresult[0].total_time = resultInMinutes;

              cm.responseMessagedata(constant.One, constant.CURRENT_APPOINTMENT, Activeresult, res)

            } else {

              cm.responseMessage(constant.Zero, constant.NODATA, res)
            }
          });
        } else {

          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
        }
      }
    });
  }
});

//Near Artist
app.post(constant.GetNearestArtist, function (req, res) {
  if (!req.body.user_pub_id || !req.body.latitude || !req.body.longitude) {

    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {

        cm.responseMessage(constant.Zero, constant.ERR, res)
      } else {
        if (result.length > 0) {
          cm.getNearbyArtist(req.body.user_pub_id, req.body.latitude, req.body.longitude, function (err, NearArtistresult) {
            if (err) {

              cm.responseMessage(constant.Zero, constant.ERR, res)
            }
            NearArtistresult = JSON.parse(JSON.stringify(NearArtistresult));
            if (NearArtistresult.length != 0) {
              res.send({
                "status": 1,
                "message": constant.GET_ARTIST_NEAR,
                "data": NearArtistresult,
                "count": NearArtistresult.length
              });

            } else {

              cm.responseMessage(constant.Zero, constant.NODATA, res)
            }
          });
        } else {

          cm.responseMessage(constant.TWo, constant.ACCOUNT_STATUS, res)
        }
      }
    });
  }
});

app.post('/getAllArtist', function (req, res) {

  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getUserStatus(req.body.user_pub_id, function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero.constant.NODATA, res)
      } else {
        var result = JSON.parse(JSON.stringify(result));
        // console.log(result)
        if (result.length > 0) {
          if (!req.body.cat_id) {
            var result_array = [];
            var c = 0;
            cm.getAllArtist1(req.body.user_pub_id, function (err, result1) {
              if (err) {
                cm.responseMessage(constant.Zero, constant.ERR, res)
              } else {
                if (result1.length > 0) {
                  var result1 = JSON.parse(JSON.stringify(result1));
                  cm.responseMessagedata(constant.One, constant.getAllArtist, result1, res);
                } else {
                  cm.responseMessagedata(constant.Zero, constant.NODATA, res);

                }

              }
            })
          } else {
            cm.getAllArtist(req.body.user_pub_id, req.body.cat_id, function (err, result1) {
              if (err) {
                cm.responseMessage(constant.Zero, constant.ERR, res)
              } else {
                if (result1.length > 0) {

                  var result1 = JSON.parse(JSON.stringify(result1));
                  cm.responseMessagedata(constant.One, constant.getAllArtist, result1, res);
                } else {
                  cm.responseMessage(constant.Zero, constant.NODATA, res);

                }
              }
            })
          }
        }
      }
    })
  }
})



// app.post('/getAllArtist',function(req,res){
//   console.log("getAllArtist")
//   if(!req.body.user_pub_id ){
//     cm.responseMessage(constant.Zero,constant.chkfield,res)
//   }else{
//     cm.getUserStatus(req.body.user_pub_id,function(err,result){
//       if(err){
//         cm.responseMessage(constant.Zero.constant.NODATA,res)
//       }else{
//         var result=JSON.parse(JSON.stringify(result));
//         // console.log(result)
//         if(result.length>0){
//           if(!req.body.cat_id){
//             var result_array=[];
//             var c=0;
//              cm.getAllArtist1(req.body.user_pub_id,function(err,result1){
//           if(err){
//             cm.responseMessage(constant.Zero,constant.ERR,res)
//           }else{

//             var result1=JSON.parse(JSON.stringify(result1));
//                         if(result1.length>0){           
//            result1.forEach(function(rows){
//             con.query('select * from rating where artist_pub_id="'+rows.user_pub_id+'"',function(err,resultRating){
//               if(err){
//                 res.send({
//                   "status":0,
//                   "message":err
//                 })
//               }else{
//                 var resultRating=JSON.parse(JSON.stringify(resultRating));
//                 rows.Rating=resultRating;
//                 con.query('select COALESCE(ROUND(AVG(rating),2),0)as Allrating from rating where artist_pub_id="'+rows.user_pub_id+'"',function(err,resultAllRating){
//                   if(err){
//                     res.send({
//                       "status":0,
//                       "message":err
//                     })
//                   }else{
//                       var resultAllRating=JSON.parse(JSON.stringify(resultAllRating));
//                       rows.Allrating=resultAllRating[0];
//                       var result_service=[];
//                       con.query('select * from service where user_pub_id="'+rows.user_pub_id+'"',function(err,resultService){
//                         if(err){
//                             res.send({
//                               "status":0,
//                               "message":err
//                             })
//                         }else{
//                           if(resultService.length>0){
//                             var resultService=JSON.parse(JSON.stringify(resultService));
//                             var resultLength=resultService.length;
//           // for(var i=0;i<result.length;i++){
//              resultService.forEach(function(row_service){
//             con.query('select concat("'+base_url+'",service_image) as service_image from service_images where service_id="'+row_service.service_id+'"',function(err,resultServiceImage){
//               if(err){
//                 console.log(err);
//               }else{
//                 var resultImage=JSON.parse(JSON.stringify(resultServiceImage));
//                 // console.log(resultImage);
//                 row_service.service_image=resultImage[0];

//                   result_service.push(row_service);

//                  rows.service= result_service;
//               con.query('select * from apply_job where artist_pub_id="'+rows.user_pub_id+'" and status="2"',function(err,resultwork){
//   if(err){
//     res.send({
//       "status":0,
//       "message":err
//     })
//   }else{
//     var result_work=[];

//     var result=JSON.parse(JSON.stringify(resultwork));
//     console.log(result);
//     if(result.length>0){
//     var resultLength2=result.length;
//     resultwork.forEach(function(row){
//       con.query('select p.*,p.cat_id as post_cat_id,u.*,COALESCE(c1.cat_name,"") as post_cat_name ,concat("'+base_url+'",u.image) as image,c.currency_symbol ,r.* from post_job p JOIN user u on u.user_pub_id=p.user_pub_id JOIN currency_setting c Left JOIN categories c1 on p.cat_id=c1.id JOIN booking_invoice1 b JOIN rating r on b.invoice_id=r.invoice_id  where p.job_id="'+row.job_id+'" and b.job_id="'+row.job_id+'" and c.status="1"',function(err,resultsWork){
//         if(err){
//           res.send({
//             "status":0,
//             "message":err
//           })
//         }else{

//           var row=JSON.parse(JSON.stringify(resultsWork));

//           result_work.push(row[0]);
//           rows.work=result_work;


//                             c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }

//         }
//       })
//     })    
//     }else{
//             console.log('sbb');
//                                c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }

//     }

//   }
// })




//               }
//             })

//           })

//                           }else{
//                             c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }      
//                           }
//                         }
//                       })                 

//                     }
//                 })

//               }
//             })
//            })


//             }else{
//               cm.responseMessage(constant.Zero,constant.NODATA,res)
//             }
//           }
//          });
//           }else{

//           var result_array=[];
//           var c=0
//          cm.getAllArtist(req.body.user_pub_id,req.body.cat_id,function(err,result1){
//           if(err){
//             cm.responseMessage(constant.Zero,constant.ERR,res)
//           }else{
//             var result1=JSON.parse(JSON.stringify(result1));
//             console.log(result1)
//             if(result1.length>0){

//             var result1=JSON.parse(JSON.stringify(result1));
//                         if(result1.length>0){           
//            result1.forEach(function(rows){
//             con.query('select * from rating where artist_pub_id="'+rows.user_pub_id+'"',function(err,resultRating){
//               if(err){
//                 res.send({
//                   "status":0,
//                   "message":err
//                 })
//               }else{
//                 var resultRating=JSON.parse(JSON.stringify(resultRating));
//                 rows.Rating=resultRating;
//                 con.query('select COALESCE(ROUND(AVG(rating),2),0)as Allrating from rating where artist_pub_id="'+rows.user_pub_id+'"',function(err,resultAllRating){
//                   if(err){
//                     res.send({
//                       "status":0,
//                       "message":err
//                     })
//                   }else{
//                       var resultAllRating=JSON.parse(JSON.stringify(resultAllRating));
//                       rows.Allrating=resultAllRating[0];
//                       var result_service=[];
//                       con.query('select * from service where user_pub_id="'+rows.user_pub_id+'"',function(err,resultService){
//                         if(err){
//                             res.send({
//                               "status":0,
//                               "message":err
//                             })
//                         }else{
//                           if(resultService.length>0){
//                             var resultService=JSON.parse(JSON.stringify(resultService));
//                             var resultLength=resultService.length;
//           // for(var i=0;i<result.length;i++){
//              resultService.forEach(function(row_service){
//             con.query('select concat("'+base_url+'",service_image) as service_image from service_images where service_id="'+row_service.service_id+'"',function(err,resultServiceImage){
//               if(err){
//                 console.log(err);
//               }else{
//                 var resultImage=JSON.parse(JSON.stringify(resultServiceImage));
//                 // console.log(resultImage);
//                 row_service.service_image=resultImage[0];

//                   result_service.push(row_service);

//                  rows.service= result_service;
//               con.query('select * from apply_job where artist_pub_id="'+rows.user_pub_id+'" and status="2"',function(err,resultwork){
//   if(err){
//     res.send({
//       "status":0,
//       "message":err
//     })
//   }else{
//     var result_work=[];

//     var result=JSON.parse(JSON.stringify(resultwork));
//     console.log(result);
//     if(result.length>0){
//     var resultLength2=result.length;
//     resultwork.forEach(function(row){
//       con.query('select p.*,p.cat_id as post_cat_id,u.*,COALESCE(c1.cat_name,"") as post_cat_name ,concat("'+base_url+'",u.image) as image,c.currency_symbol ,r.* from post_job p JOIN user u on u.user_pub_id=p.user_pub_id JOIN currency_setting c Left JOIN categories c1 on p.cat_id=c1.id JOIN booking_invoice1 b JOIN rating r on b.invoice_id=r.invoice_id  where p.job_id="'+row.job_id+'" and b.job_id="'+row.job_id+'" and c.status="1"',function(err,resultsWork){
//         if(err){
//           res.send({
//             "status":0,
//             "message":err
//           })
//         }else{

//           var row=JSON.parse(JSON.stringify(resultsWork));


//           result_work.push(row[0]);
//           rows.work=result_work;
//                             c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }

//         }
//       })
//     })    
//     }else{
//                                c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }

//     }

//   }
// })
//               }
//             })

//           })

//                           }else{
//                             c++;
//                 if(c==result1.length){
//                       res.send({
//                 "status": 1,
//                  "message": constant.GET_ARTIST_NEAR,
//                  "data": result1,
//                 "count": result1.length
//               })
//                 }      
//                           }
//                         }
//                       })                 

//                     }
//                 })

//               }
//             })
//            })


//             }else{
//               cm.responseMessage(constant.Zero,constant.NODATA,res)
//             }
//             }else{
//               cm.responseMessage(constant.Zero,constant.NODATA,res)
//             }
//           }
//          });
//         }
//         }else{
//           cm.responseMessage(constant.TWo,constant.ACCOUNT_STATUS,res)
//         }
//       }
//     })
//   }
// })
// getInvoice

app.post(constant.GetInvoice, function (req, res) {
  if (!req.body.user_pub_id) {


    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    if (!req.body.status) {
      cm.GetInvoice1(req.body.user_pub_id, function (err, result) {
        if (err) {
          console.log(err)
        } else {
          var result = JSON.parse(JSON.stringify(result));
          if (result.length > 0) {
            if (err) {
              cm.responseMessage(constant.Zero, constant.NODATA, res)
            } else {
              cm.responseMessagedata(constant.One, constant.GetAllInvoice, result, res)
            }
          }
        }
      })
    }
    else {
      cm.GetInvoice(req.body.user_pub_id, req.body.status, function (err, result) {
        if (err) {

          //                cm.responseMessage(constant.Zero, constant.ERR, res)
          cm.responseMessage(constant.Zero, err, res)
        } else {
          var result = JSON.parse(JSON.stringify(result))
          if (result.length > 0) {

            if (err) {
              console.log(err)
            } else {
              cm.responseMessagedata(constant.One, constant.GetAllInvoice, result, res)
            }

          } else {


            cm.responseMessage(constant.Zero, constant.NODATA, res)
          }
        }



      })



    }
  }
})

//Done Job

app.post('/getJobDone', function (req, res) {
  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getTotalDoneJob(req.body.user_pub_id, function (err, result) {
      if (err) {
        console.log(err)
      } else {

        var result = JSON.parse(JSON.stringify(result));
        if (result.length > 0) {
          res.send({
            "status": 1,
            "message": constant.jobDone,
            "data": result,

          })

        } else {
          cm.responseMessage(constant.Zero, constant.NODATA, res)
        }

      }
    })
  }
})

//total Earn

app.post('/getTotalEarneds', function (req, res) {
  if (!req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res)
  } else {
    cm.getTotalEarn(req.body.user_pub_id, function (err, result) {
      if (err) {
        console.log(err)
      } else {

        var result = JSON.parse(JSON.stringify(result));
        if (result.length > 0) {
          res.send({
            "status": 1,
            "message": constant.jobDone,
            "data": result,

          })

        } else {
          cm.responseMessage(constant.Zero, constant.NODATA, res)
        }

      }
    })
  }
})


//Paid Invoice
app.post('/makePayment', function (req, res) {
  if (!req.body.user_pub_id || !req.body.invoice_id) {
    res.send({
      "status": 0,
      "message": constant.chkfield
    })
  } else {
    if (!req.body.coupon_id) {
      con.query('select * from booking_invoice1 where user_pub_id="' + req.body.user_pub_id + '" and invoice_id="' + req.body.invoice_id + '"', function (err, resultBooking) {
        if (err) {
          console.log(err)
        } else {
          var resultBooking = JSON.parse(JSON.stringify(resultBooking));
          var booking_amount = resultBooking[0].final_amount;
          var job_id = resultBooking[0].job_id
          var artist_pub_id = resultBooking[0].artist_pub_id;
          cm.fannanConverter(booking_amount, "amount").then(function (final_point) {
            cm.getMyPoints(req.body.user_pub_id).then(function (data) {
              if (data) {
                var user_point = data.point;
                if (final_point <= user_point) {
                  var type = "minus";
                  cm.manageUserPoint(req.body.user_pub_id, user_point, final_point, type).then(function (data1) {
                    if (data1) {
                      var artist_pub_id = resultBooking[0].artist_pub_id;
                      req.body.created_at = (new Date()).valueOf().toString();
                      cm.addTransactionHistory(req.body.user_pub_id, final_point, "0", req.body.invoice_id, artist_pub_id, req.body.created_at).then(function (data1) {
                        cm.getMyPoints(artist_pub_id).then(function (data) {
                          if (data) {
                            var user_point = data.point;
                            var type = "add";
                            cm.manageUserPoint(artist_pub_id, user_point, final_point, type).then(function (data1) {
                              if (data1) {

                                cm.addTransactionHistory(artist_pub_id, final_point, "1", req.body.invoice_id, req.body.user_pub_id, req.body.created_at).then(function (data1) {
                                  con.query('update booking_invoice1 set status="1" where invoice_id="' + req.body.invoice_id + '"', function (err, result) {
                                    if (err) {
                                      console.log(err)
                                    } else {
                                      con.query('select * from user where user_pub_id="' + artist_pub_id + '"', function (err, resultUser) {
                                        if (err) {
                                          cm.responseMessage(constant.Zero, err, res);
                                        } else {
                                          var resultUser = JSON.parse(JSON.stringify(resultUser));
                                          var email = resultUser[0].email;
                                          var name = resultUser[0].name;
                                          var device_token = resultUser[0].device_token;
                                          var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.Invoice_created + constant.SIGNATURE;
                                          cm.sendmail(email, constant.Invoice_created, msg)
                                          var title = constant.Invoice_created;
                                          var type = constant.invoice_type;
                                          var msg1 = constant.Invoice_created;
                                          var parData = {
                                            user_pub_id: artist_pub_id,
                                            title: title,
                                            type: type,
                                            msg: msg1,
                                            created_at: (new Date()).valueOf().toString()
                                          }
                                          cm.insert('notification', parData, function (err, result) {
                                            if (err) {
                                              cm.responseMessage(constant.Zero, err, res);
                                            } else {
                                              fn.pushnotification(title, msg1, device_token, type);
                                              // cm.responseMessage(constant.One,constant.JOB_REJECTED,res);
                                              cm.responseMessage(constant.One, constant.makeMoney, res);
                                            }
                                          })
                                        }
                                      })
                                    }
                                  })
                                }).then(function (err) {
                                  console.log('addTransaction1')
                                })

                              }
                            }).then(function (err) {
                              console.log('erwwwr');
                            })
                          }
                        }).then(function (err) {
                          console.log('err');
                        });
                      }).then(function (err) {
                        console.log('addtransaction')
                      })



                    }
                  }).then(function (err) {
                    console.log('erwwwr');
                  })
                } else {
                  cm.responseMessage(constant.Zero, constant.insufficient, res);
                }
              }
            }).then(function (err) {
              console.log('err');
            });
          })
        }
      })
    } else {
      con.query('select * from booking_invoice1 where user_pub_id="' + req.body.user_pub_id + '" and invoice_id="' + req.body.invoice_id + '"', function (err, resultBooking) {
        if (err) {
          console.log(err)
        } else {
          var resultBooking = JSON.parse(JSON.stringify(resultBooking));
          // cm.checkCoupon(req.body.coupon_code,req.body.user_pub_id).then(function(coupon_id){
          //   if(coupon_id==0){
          //     cm.responseMessage(constant.Zero,constant.alreadyCouponUsed,res);
          //   }else{
          //     req.body.coupon_id=coupon_id;
          var booking_amount = resultBooking[0].final_amount;
          var job_id = resultBooking[0].job_id;
          var artist_pub_id = resultBooking[0].artist_pub_id;
          cm.couponCalculation(req.body.coupon_id, booking_amount).then(function (data) {
            var booking_amount = data.net_amount;
            var booking_amount = Math.round(booking_amount)

            cm.fannanConverter(booking_amount, "amount").then(function (final_point) {
              cm.getMyPoints(req.body.user_pub_id).then(function (data) {
                if (data) {
                  var user_point = data.point;
                  if (final_point <= user_point) {
                    var type = "minus";
                    cm.manageUserPoint(req.body.user_pub_id, user_point, final_point, type).then(function (data1) {
                      if (data1) {
                        var artist_pub_id = resultBooking[0].artist_pub_id;
                        req.body.created_at = (new Date()).valueOf().toString();
                        cm.addTransactionHistory(req.body.user_pub_id, final_point, "0", req.body.invoice_id, artist_pub_id, req.body.created_at).then(function (data1) {
                          cm.getMyPoints(artist_pub_id).then(function (data) {
                            if (data) {
                              var user_point = data.point;
                              var type = "add";
                              cm.manageUserPoint(artist_pub_id, user_point, final_point, type).then(function (data1) {
                                if (data1) {
                                  cm.addTransactionHistory(artist_pub_id, final_point, "1", req.body.invoice_id, req.body.user_pub_id, req.body.created_at).then(function (data1) {
                                    con.query('update booking_invoice1 set status="1",net_amount="' + booking_amount + '",coupon_id="' + req.body.coupon_id + '" where invoice_id="' + req.body.invoice_id + '"', function (err, result) {
                                      if (err) {
                                        console.log(err)
                                      } else {
                                        con.query('select * from coupon where id="' + req.body.coupon_id + '"', function (err, resultCoupon) {
                                          if (err) {
                                            console.log(err);
                                          } else {
                                            var resultCoupon = JSON.parse(JSON.stringify(resultCoupon));
                                            var counter = resultCoupon[0].counter;
                                            var final_counter = counter - 1;
                                            if (final_counter > 0) {
                                              con.query('update coupon set counter="' + final_counter + '" where id="' + req.body.coupon_id + '"', function (err, result) {
                                                if (err) {
                                                  console.log(err);
                                                } else {
                                                  con.query('insert into user_coupon set user_pub_id="' + req.body.user_pub_id + '",invoice_id="' + req.body.invoice_id + '",coupon_id="' + req.body.coupon_id + '" ', function (err, result) {
                                                    if (err) {
                                                      cm.responseMessage(constant.Zero, err, res);
                                                    } else {
                                                      con.query('select * from user where user_pub_id="' + artist_pub_id + '"', function (err, resultUser) {
                                                        if (err) {
                                                          cm.responseMessage(constant.Zero, err, res);
                                                        } else {
                                                          var resultUser = JSON.parse(JSON.stringify(resultUser));
                                                          var email = resultUser[0].email;
                                                          var name = resultUser[0].name;
                                                          var device_token = resultUser[0].device_token;
                                                          var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.Invoice_created + constant.SIGNATURE;
                                                          cm.sendmail(email, constant.Invoice_created, msg)
                                                          var title = constant.Invoice_created;
                                                          var type = constant.invoice_type;
                                                          var msg1 = constant.Invoice_created;
                                                          var parData = {
                                                            user_pub_id: artist_pub_id,
                                                            title: title,
                                                            type: type,
                                                            msg: msg1,
                                                            created_at: (new Date()).valueOf().toString()
                                                          }
                                                          cm.insert('notification', parData, function (err, result) {
                                                            if (err) {
                                                              cm.responseMessage(constant.Zero, err, res);
                                                            } else {
                                                              fn.pushnotification(title, msg1, device_token, type);
                                                              // cm.responseMessage(constant.One,constant.JOB_REJECTED,res);
                                                              cm.responseMessage(constant.One, constant.makeMoney, res);
                                                            }
                                                          })
                                                        }
                                                      })

                                                    }
                                                  })
                                                }
                                              })
                                            } else {
                                              con.query('update coupon set status="3",counter="' + final_counter + '" where id="' + req.body.coupon_id + '"', function (err, result) {
                                                if (err) {
                                                  console.log(err);
                                                } else {
                                                  con.query('insert into user_coupon set user_pub_id="' + req.body.user_pub_id + '",invoice_id="' + req.body.invoice_id + '",coupon_id="' + req.body.coupon_id + '" ', function (err, result) {
                                                    if (err) {
                                                      cm.responseMessage(constant.Zero, err, res);
                                                    } else {
                                                      con.query('select * from user where user_pub_id="' + artist_pub_id + '"', function (err, resultUser) {
                                                        if (err) {
                                                          cm.responseMessage(constant.Zero, err, res);
                                                        } else {
                                                          var resultUser = JSON.parse(JSON.stringify(resultUser));
                                                          var email = resultUser[0].email;
                                                          var name = resultUser[0].name;
                                                          var device_token = resultUser[0].device_token;
                                                          var msg = constant.HELLO + '<br><br/>' + name + ' ' + constant.Invoice_created + constant.SIGNATURE;
                                                          cm.sendmail(email, constant.Invoice_created, msg)
                                                          var title = constant.Invoice_created;
                                                          var type = constant.invoice_type;
                                                          var msg1 = constant.Invoice_created;
                                                          var parData = {
                                                            user_pub_id: artist_pub_id,
                                                            title: title,
                                                            type: type,
                                                            msg: msg1,
                                                            created_at: (new Date()).valueOf().toString()
                                                          }
                                                          cm.insert('notification', parData, function (err, result) {
                                                            if (err) {
                                                              cm.responseMessage(constant.Zero, err, res);
                                                            } else {
                                                              fn.pushnotification(title, msg1, device_token, type);
                                                              // cm.responseMessage(constant.One,constant.JOB_REJECTED,res);
                                                              cm.responseMessage(constant.One, constant.makeMoney, res);
                                                            }
                                                          })
                                                        }
                                                      })

                                                    }
                                                  })
                                                }
                                              })
                                            }
                                          }
                                        })
                                      }
                                    })
                                  }).then(function (err) {
                                    console.log('addTransaction1')
                                  })

                                }
                              }).then(function (err) {
                                console.log('erwwwr');
                              })
                            }
                          }).then(function (err) {
                            console.log('err');
                          });
                        }).then(function (err) {
                          console.log('addtransaction')
                        })
                      }
                    }).then(function (err) {
                      console.log('erwwwr');
                    })
                  } else {
                    cm.responseMessage(constant.Zero, constant.insufficient, res);
                  }

                }
              }).then(function (err) {
                console.log('err');
              });
            })
          }).catch(function (err) {
            cm.responseMessage(constant.Zero, err, res);
          })
          //   }
          // }).then(function(err){
          //   console.log("err");
          // })
        }
      })
    }
    // 	}
    // })
  }
})

app.post('/checkCouponCode', function (req, res) {
  if (!req.body.coupon_code || !req.body.invoice_id || !req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkfield, res);
  } else {
    con.query('select * from booking_invoice1 where user_pub_id="' + req.body.user_pub_id + '" and invoice_id="' + req.body.invoice_id + '"', function (err, resultBooking) {
      if (err) {
        console.log(err)
      } else {
        result = [];
        var resultBooking = JSON.parse(JSON.stringify(resultBooking));
        cm.checkCoupon(req.body.coupon_code, req.body.user_pub_id).then(function (coupon_id) {
          if (coupon_id == 0) {
            cm.responseMessage(constant.Zero, constant.alreadyCouponUsed, res);
          } else {
            req.body.coupon_id = coupon_id;
            var booking_amount = resultBooking[0].final_amount;
            // var job_id = resultBooking[0].job_id;
            cm.couponCalculation(req.body.coupon_id, booking_amount).then(function (data) {
              res.send({
                "status": 1,
                "message": constant.getAllData,
                "data": data
              })
            }).catch(function (err) {
              cm.responseMessage(constant.Zero, err, res);

            })
          }
        }).catch(function (err) {
          cm.responseMessage(constant.Zero, err, res);

        })
      }
    })
  }
})

app.post('/getProfileById', function (req, res) {
  if (!req.body.user_pub_id) {

  } else {
    con.query('select u.*,concat("' + base_url + '",u.image) as image ,COALESCE(c1.cat_name,"") as cat_name from user u Left JOIN categories c1 on u.cat_id=c1.id where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultUser) {
      if (err) {
        console.log(err);
      } else {
        var resultUser = JSON.parse(JSON.stringify(resultUser));
        con.query('select r.*,concat("' + base_url + '",u.image)as image,u.name from rating r join user u on u.user_pub_id=r.user_pub_id join user u1 on u1.user_pub_id=r.artist_pub_id where r.artist_pub_id="' + req.body.user_pub_id + '" and  u1.is_private="0"', function (err, resultRating) {
          if (err) {
            cm.responseMessage(constant.Zero, err, res);
          } else {
            var resultRating = JSON.parse(JSON.stringify(resultRating));
            resultUser[0].Rating = resultRating;
            con.query('select COALESCE(ROUND(AVG(rating),2),0) as Allrating from rating join user on rating.user_pub_id=user.user_pub_id join user as user1 on user1.user_pub_id=rating.artist_pub_id where rating.artist_pub_id="' + req.body.user_pub_id + '" and user1.is_private="0"', function (err, resultAllRating) {
              if (err) {
                cm.responseMessage(constant.Zero, err, res);
              } else {
                var resultAllRating = JSON.parse(JSON.stringify(resultAllRating));
                resultUser[0].Allrating = resultAllRating[0];
                var result_service = [];
                var count_service = 0;
                con.query('select s.* from service s join user u on s.user_pub_id=u.user_pub_id where s.user_pub_id="' + req.body.user_pub_id + '" and u.is_private="0"', function (err, resultService) {
                  if (err) {
                    cm.responseMessage(constant.Zero, err, res);

                  } else {
                    if (resultService.length > 0) {
                      var resultService = JSON.parse(JSON.stringify(resultService));
                      var resultLength = resultService.length;

                      // for(var i=0;i<result.length;i++){
                      resultService.forEach(function (row_service) {
                        con.query('select concat("' + base_url + '",service_image) as service_image from service_images where service_id="' + row_service.service_id + '"', function (err, resultServiceImage) {
                          if (err) {
                            console.log(err);
                          } else {
                            var resultImage = JSON.parse(JSON.stringify(resultServiceImage));
                            // console.log(resultImage);
                            row_service.service_image = resultImage[0];
                            result_service.push(row_service);
                            resultUser[0].service = result_service;
                            count_service++;
                            if (count_service == resultLength) {
                              con.query('select a.* from apply_job a join user u on u.user_pub_id=a.artist_pub_id where a.artist_pub_id="' + req.body.user_pub_id + '" and a.status="2" and  u.is_private="0"', function (err, resultwork) {
                                if (err) {
                                  cm.responseMessage(constant.Zero, err, res);
                                } else {
                                  var result_work = [];
                                  var c = 0;
                                  var result = JSON.parse(JSON.stringify(resultwork));
                                  if (result.length > 0) {
                                    var resultLength1 = result.length;
                                    // console.log(resultLength2);
                                    resultwork.forEach(function (row) {
                                      con.query('select p.*,p.cat_id as post_cat_id,u.*,COALESCE(c1.cat_name,"") as post_cat_name ,concat("' + base_url + '",u.image) as image,c.currency_symbol ,r.* from post_job p JOIN user u on u.user_pub_id=p.user_pub_id JOIN currency_setting c Left JOIN categories c1 on p.cat_id=c1.id JOIN booking_invoice1 b  JOIN  rating r on b.invoice_id=r.invoice_id  where p.job_id="' + row.job_id + '" and b.job_id="' + row.job_id + '" and c.status="1" and  u.is_private="0"', function (err, resultsWork) {
                                        if (err) {
                                          cm.responseMessage(constant.Zero, err, res);
                                        } else {
                                          var row = JSON.parse(JSON.stringify(resultsWork));
                                          if (row.length > 0) {
                                            result_work.push(row[0]);
                                          }
                                          resultUser[0].work = result_work;
                                          c++;
                                          if (c == resultLength1) {
                                            con.query('select count(j.job_id) as jobDone  from apply_job j join user u on j.artist_pub_id = u.user_pub_id where j.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0" and j.status="2"', function (err, resultJob) {
                                              if (err) {
                                                cm.responseMessage(constant.Zero, err, res);
                                              } else {
                                                var resultJob = JSON.parse(JSON.stringify(resultJob))
                                                resultUser[0].jobDone = resultJob[0];
                                                con.query('select COALESCE(sum(p.price),0.0) as totalEarned from post_job p join apply_job a on a.job_id=p.job_id join user u on u.user_pub_id=a.artist_pub_id where a.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0"  ', function (err, resultEarned) {
                                                  if (err) {
                                                    cm.responseMessage(constant.Zero, err, res);
                                                  } else {
                                                    var resultEarned = JSON.parse(JSON.stringify(resultEarned));
                                                    resultUser[0].earnedMoney = resultEarned[0]
                                                    con.query('select *,concat("' + base_url + '",image) as image from gallery where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultGallery) {
                                                      if (err) {
                                                        cm.responseMessage(constant.Zero, err, res)
                                                      } else {
                                                        var resultGallery = JSON.parse(JSON.stringify(resultGallery));
                                                        resultUser[0].gallery = resultGallery;
                                                        res.send({
                                                          "status": 1,
                                                          "message": constant.GET_ARTIST_NEAR,
                                                          "data": resultUser[0]
                                                        })
                                                      }
                                                    })
                                                  }
                                                })
                                              }
                                            })
                                          }
                                        }
                                      })
                                    })
                                  } else {
                                    con.query('select count(j.job_id) as jobDone from apply_job j join user u on u.user_pub_id=j.artist_pub_id where j.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0" and j.status="2"', function (err, resultJob) {
                                      if (err) {
                                        cm.responseMessage(constant.Zero, err, res);
                                      } else {
                                        var resultJob = JSON.parse(JSON.stringify(resultJob))
                                        resultUser[0].jobDone = resultJob[0];
                                        con.query('select COALESCE(sum(p.price),0.0) as totalEarned from post_job p join apply_job a on a.job_id=p.job_id join user u on u.user_pub_id=a.artist_pub_id where a.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0"', function (err, resultEarned) {
                                          if (err) {
                                            cm.responseMessage(constant.Zero, err, res);
                                          } else {
                                            var resultEarned = JSON.parse(JSON.stringify(resultEarned));
                                            resultUser[0].earnedMoney = resultEarned[0]
                                            con.query('select *,concat("' + base_url + '",image) as image from gallery where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultGallery) {
                                              if (err) {
                                                cm.responseMessage(constant.Zero, err, res)
                                              } else {
                                                var resultGallery = JSON.parse(JSON.stringify(resultGallery));
                                                resultUser[0].gallery = resultGallery;
                                                res.send({
                                                  "status": 1,
                                                  "message": constant.GET_ARTIST_NEAR,
                                                  "data": resultUser[0]
                                                })
                                              }
                                            })
                                          }
                                        })
                                      }
                                    })
                                  }
                                }
                              })
                            }
                          }
                        })
                      })
                    } else {

                      con.query('select j.* from apply_job j join user u on u.user_pub_id=j.artist_pub_id where j.artist_pub_id="' + req.body.user_pub_id + '" and j.status="2" and u.is_private="0"', function (err, resultwork) {
                        if (err) {
                          cm.responseMessage(constant.Zero, err, res);
                        } else {
                          var result_work = [];
                          var c = 0;
                          var result = JSON.parse(JSON.stringify(resultwork));
                          if (result.length > 0) {
                            var resultLength1 = result.length;
                            // console.log(resultLength2);

                            resultwork.forEach(function (row) {
                              con.query('select p.*,p.cat_id as post_cat_id,u.*,COALESCE(c1.cat_name,"") as post_cat_name ,concat("' + base_url + '",u.image) as image,c.currency_symbol ,r.* from post_job p JOIN user u on u.user_pub_id=p.user_pub_id JOIN currency_setting c Left JOIN categories c1 on p.cat_id=c1.id JOIN booking_invoice1 b JOIN rating r on b.invoice_id=r.invoice_id  where p.job_id="' + row.job_id + '" and b.job_id="' + row.job_id + '" and c.status="1" and u.is_private="0"', function (err, resultsWork) {
                                if (err) {
                                  cm.responseMessage(constant.Zero, err, res);

                                } else {

                                  var row = JSON.parse(JSON.stringify(resultsWork));
                                  if (row.length > 0) {
                                    result_work.push(row[0]);
                                  }
                                  resultUser[0].work = result_work;
                                  c++;
                                  if (c == resultLength1) {
                                    con.query('select count(j.job_id) as jobDone from apply_job j join user u on u.user_pub_id =j.artist_pub_id where j.artist_pub_id="' + req.body.user_pub_id + '" and j.status="2" and u.is_private="0"', function (err, resultJob) {
                                      if (err) {
                                        cm.responseMessage(constant.Zero, err, res);
                                      } else {
                                        var resultJob = JSON.parse(JSON.stringify(resultJob))
                                        resultUser[0].jobDone = resultJob[0];
                                        con.query('select COALESCE(sum(p.price),0.0) as totalEarned from post_job p join apply_job a on a.job_id=p.job_id join user u on u.user_pub_id=a.artist_pub_id where a.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0"', function (err, resultEarned) {
                                          if (err) {
                                            cm.responseMessage(constant.Zero, err, res);
                                          } else {
                                            var resultEarned = JSON.parse(JSON.stringify(resultEarned));
                                            resultUser[0].earnedMoney = resultEarned[0]
                                            con.query('select *,concat("' + base_url + '",image) as image from gallery where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultGallery) {
                                              if (err) {
                                                cm.responseMessage(constant.Zero, err, res)
                                              } else {
                                                var resultGallery = JSON.parse(JSON.stringify(resultGallery));
                                                resultUser[0].gallery = resultGallery;
                                                res.send({
                                                  "status": 1,
                                                  "message": constant.GET_ARTIST_NEAR,
                                                  "data": resultUser[0]
                                                })
                                              }
                                            })
                                          }
                                        })
                                      }
                                    })

                                  }

                                }
                              })
                            })
                          } else {
                            con.query('select count(j.job_id) as jobDone from apply_job j join user u on u.user_pub_id=j.artist_pub_id where j.artist_pub_id="' + req.body.user_pub_id + '" and j.status="2" and u.is_private="0"', function (err, resultJob) {
                              if (err) {
                                cm.responseMessage(constant.Zero, err, res);

                              } else {
                                var resultJob = JSON.parse(JSON.stringify(resultJob))
                                resultUser[0].jobDone = resultJob[0];
                                con.query('select COALESCE(sum(p.price),0.0) as totalEarned from post_job p join apply_job a on a.job_id=p.job_id join user u on a.artist_pub_id=u.user_pub_id where a.artist_pub_id="' + req.body.user_pub_id + '" and u.is_private="0"', function (err, resultEarned) {
                                  if (err) {
                                    cm.responseMessage(constant.Zero, err, res);

                                  } else {
                                    var resultEarned = JSON.parse(JSON.stringify(resultEarned));
                                    resultUser[0].earnedMoney = resultEarned[0]
                                    con.query('select *,concat("' + base_url + '",image) as image from gallery where user_pub_id="' + req.body.user_pub_id + '"', function (err, resultGallery) {
                                      if (err) {
                                        cm.responseMessage(constant.Zero, err, res)
                                      } else {
                                        var resultGallery = JSON.parse(JSON.stringify(resultGallery));
                                        resultUser[0].gallery = resultGallery;
                                        res.send({
                                          "status": 1,
                                          "message": constant.GET_ARTIST_NEAR,
                                          "data": resultUser[0]
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })

                          }

                        }
                      })
                    }
                  }
                })

              }
            })

          }
        })
      }

    })

  }
})

app.post('/rejectJobByArtist', function (req, res) {
  // con.query('select ')
  if (!req.body.job_id || !req.body.user_pub_id) {
    cm.responseMessage(constant.Zero, constant.chkField, res);
  }
  else {
    con.query('update post_job set status="0" where job_id ="' + req.body.job_id + '"', function (err, result) {
      if (err) {
        cm.responseMessage(constant.Zero, err, res);
      } else {
        con.query('update apply_job set status="3" where job_id="' + req.body.job_id + '" and artist_pub_id="' + req.body.user_pub_id + '"', function (err, result) {
          if (err) {
            cm.responseMessage(constant.Zero, err, res);
          } else {
            con.query('update apply_job set status="0" where job_id="' + req.body.job_id + '" and artist_pub_id!="' + req.body.user_pub_id + '"', function (err, result) {
              if (err) {
                cm.responseMessage(constant.Zero, err, res);
              } else {
                con.query('select * from post_job where job_id="' + req.body.job_id + '"', function (err, resultPost) {
                  if (err) {
                    cm.responseMessage(constant.Zero, err, res)
                  } else {
                    var resultPost = JSON.parse(JSON.stringify(resultPost));
                    var user_pub_id = resultPost[0].user_pub_id;
                    con.query('select * from user where user_pub_id="' + user_pub_id + '"', function (err, resultUser) {
                      if (err) {
                        cm.responseMessage(constant.Zero, err, res)
                      } else {
                        var resultUser = JSON.parse(JSON.stringify(resultUser));
                        var device_token = resultUser[0].device_token;
                        var title = constant.Reject_title;
                        var type = constant.reject_job_type;
                        var msg1 = constant.Job_reject_msg_artist;
                        var parData = {
                          user_pub_id: user_pub_id,
                          title: title,
                          type: type,
                          msg: msg1,
                          created_at: (new Date()).valueOf().toString()
                        }
                        cm.insert('notification', parData, function (err, result) {
                          if (err) {
                            cm.responseMessage(constant.Zero, err, res);
                          } else {
                            fn.pushnotification(title, msg1, device_token, type);
                            // cm.responseMessage(constant.One,constant.JOB_REJECTED,res);
                          }
                        })

                      }
                    })
                  }
                })
                cm.responseMessage(constant.One, constant.Reject_job, res)
              }
            })
          }
        })
      }

    }
    )
  }
})

module.exports = app