var con=require('../config/database')
var http = require("https");
var request=require('request');
var constant=require('../constant/constant')
var base_url=constant.base_url;


/*insert Data*/
module.exports.insert=function(table, obj, cb)
{
    con.connect(function(err){
        var que = "INSERT INTO "+table+" (";
        var counter = 1;
        for(var k in obj){
            if (counter==1) {
                que += k
            }
            else{
                que += ", "+k
            }
            counter++;
        }   
        que += ") VALUES ( ";
        var counter = 1;
            for (var l in obj) {
                if (counter==1) {
                    que += "'"+obj[l]+"'"
                }else{
                    que += ", "+"'"+obj[l]+"'"
                }       
                counter++;
            }
        que += ")";
        con.query(que, cb);
    });
}
module.exports.getallDataWhere=function(table,obj,cb)
{
    con.connect(function(err){
    var que = "SELECT * FROM  "+table+" WHERE ";
        var counter=1;
        for(var k in obj){
            if(counter==1)
            {
                que += k+"= '"+obj[k]+"'";
            }
            else
            {
                que += " AND "+k+"= '"+obj[k]+"' ";

            }
            counter++;
        }
    // console.log(que);
    con.query(que, cb);
    })
}


module.exports.getUserByEmail=function(email_id,cb)
{
    var que = "SELECT * FROM `user` WHERE `email_id`='"+email_id+"'";
    con.query(que, cb);
}
module.exports.getCouponById=function(id,cb){
    var que="select * From coupon where id='"+id+"'";
    con.query(que,cb);
}
module.exports.getAllCoupons=function(id,cb){
    var que="select * From coupon ";
    con.query(que,cb);
}
module.exports.update=function(table, where, obj, cb)
{
    var que = "UPDATE "+table+" SET ";
    var counter=1;
    for(var k in obj){
    if(counter==1){
         que += k+" = '"+obj[k]+"'"
    }
    else{
    que += ", "+k+" = '"+obj[k]+"'"
    }
     counter++;
    }
    var key = Object.keys(where);
    que += " WHERE "+key[0]+" = '"+where[key[0]]+"'";
    con.query(que, cb);
}

/*Get user Status*/
module.exports.getUserStatus=function(user_pub_id,cb)
{
    var que='SELECT * FROM user WHERE status="1" AND user_pub_id="'+user_pub_id+'"';
    con.query(que,cb)
}
module.exports.getallcat=function(cb)
{
   var que='SELECT *,concat("'+base_url+'", image) as image FROM categories WHERE status="1"';
   con.query(que,cb) ;
}

module.exports.randomString=function(length,chars){
    var result='';
    for(var i=length; i>0;--i)
    result +=chars[Math.floor(Math.random()*chars.length)];
    return result;
}

module.exports.getAllArtist=function(user_pub_id,cat_id,cb)
{
    var que="SELECT cs.currency_symbol,cat.cat_name,us.*,concat('"+base_url+"',us.image) as image from user us JOIN `currency_setting` AS cs ON cs.status = 1 JOIN `categories` AS cat ON cat.id = us.cat_id WHERE us.status = '1' AND us.user_pub_id !='"+user_pub_id+"' and  us.cat_id='"+cat_id+"' AND (us.sub_end_date != '' AND us.sub_end_date > ROUND(UNIX_TIMESTAMP()*1000)) ";
    con.query(que,cb);
}
module.exports.getAllArtist1=function(user_pub_id,cb)
{
    var que="SELECT cs.currency_symbol,cat.cat_name,us.*,concat('"+base_url+"',us.image) as image from user us JOIN `currency_setting` AS cs ON cs.status = 1 JOIN `categories` AS cat ON cat.id = us.cat_id WHERE us.status = '1' AND us.user_pub_id !='"+user_pub_id+"' AND (us.sub_end_date != '' AND us.sub_end_date > ROUND(UNIX_TIMESTAMP()*1000)) ";
    con.query(que,cb);
}

module.exports.getNearbyArtist=function(user_pub_id,lat,lng,cb)
{
    var que = "SELECT cs.currency_symbol,cat.cat_name,us.*,concat('"+base_url+"',us.image) as image, "+
    "( 3959* acos( cos( radians("+lat+") ) * cos( radians( us.latitude ) ) * cos( radians( us.longitude ) - radians("+lng+") ) + sin( radians("+lat+") ) * sin( radians( us.latitude ) ) ) )  AS distance "+
    "FROM `user` as us JOIN `currency_setting` AS cs ON cs.status = 1 "+
    "JOIN `categories` AS cat ON cat.id = us.cat_id WHERE us.status = '1' HAVING distance <= '32' AND us.user_pub_id !='"+user_pub_id+"' "+
    "AND (us.sub_end_date != '' AND us.sub_end_date > ROUND(UNIX_TIMESTAMP()*1000)) ORDER BY `distance`";
    con.query(que, cb);
}

module.exports.getNearbyArtistCat=function(user_pub_id,lat,lng,cat_id,cb){
 var que = "SELECT cs.currency_symbol,cat.cat_name,us.*,concat('"+base_url+"',us.image) as image,( 3959* acos( cos( radians("+lat+") ) * cos( radians( us.latitude ) ) * cos( radians( us.longitude ) - radians("+lng+") ) + sin( radians("+lat+") ) * sin( radians( us.latitude ) ) ) )  AS distance FROM `user` as us JOIN `currency_setting` AS cs ON cs.status = 1 JOIN `categories` AS cat ON cat.id = us.cat_id WHERE us.status = '1' AND us.user_pub_id !='"+user_pub_id+" ' and us.cat_id='"+cat_id+"' ORDER BY `distance`";
    con.query(que, cb);   
}
module.exports.getPostedJobs=function(user_pub_id,cb){
    var que='SELECT us.name,us.mobile_no,cs.currency_symbol,pj.*,cat.cat_name,concat("'+base_url+'",us.image) as image from post_job as pj join categories as cat on cat.id=pj.cat_id join user as us on us.user_pub_id=pj.user_pub_id join currency_setting as cs on cs.status=1 WHERE pj.status !="4" AND pj.user_pub_id="'+user_pub_id+'" ORDER BY pj.id DESC';
    // var que='SELECT sk.skill,cat.cat_name,us.name,us.mobile_no,cs.currency_symbol,pj.* from post_job as pj join skill as sk on sk.id=pj.skill_id JOIN categories as cat on cat.id=pj.cat_id JOIN user as us on us.user_pub_id=pj.user_pub_id JOIN currency_setting as cs on cs.status=1 WHERE pj.status!="4" AND pj.user_pub_id="'+user_pub_id+'" ORDER BY pj.id DESC';
    con.query(que,cb);
}
module.exports.getPostedJobs1=function(user_pub_id,cb){
    var que='SELECT us.name,us.mobile_no,cs.currency_symbol,pj.*,cat.cat_name,concat("'+base_url+'",us.image) as image from post_job as pj join categories as cat on cat.id=pj.cat_id join user as us on us.user_pub_id=pj.user_pub_id join currency_setting as cs on cs.status=1 WHERE pj.status !="4" AND pj.user_pub_id="'+user_pub_id+'" ORDER BY pj.id DESC limit 5';
    // var que='SELECT sk.skill,cat.cat_name,us.name,us.mobile_no,cs.currency_symbol,pj.* from post_job as pj join skill as sk on sk.id=pj.skill_id JOIN categories as cat on cat.id=pj.cat_id JOIN user as us on us.user_pub_id=pj.user_pub_id JOIN currency_setting as cs on cs.status=1 WHERE pj.status!="4" AND pj.user_pub_id="'+user_pub_id+'" ORDER BY pj.id DESC';
    con.query(que,cb);
}
module.exports.getAcceptedJob=function(user_pub_id,cb)
{
var que="select p.*,a.*,c.cat_name, u.name,cs.currency_symbol,concat('"+base_url+"',u.image)  as image from post_job p join categories c on c.id=p.cat_id  join user u on  u.user_pub_id = p.user_pub_id  join currency_setting cs on cs.status='1' join apply_job a on p.job_id=a.job_id where a.artist_pub_id='"+user_pub_id+"' and a.status='1' order by a.created_at desc limit 5";
con.query(que,cb);
}
module.exports.getReferralCode=function(cb){
    var que='SELECT * FROM referral_setting WHERE id="1"';
}

module.exports.getAppliedJob=function(job_id,cb){
    var que='SELECT * FROM apply_job where status in(5) AND job_id="'+job_id+'"';
    con.query(que,cb);
}

module.exports.getsingleApplyjob=function(job_id,cb){
    var que='SELECT * FROM apply_job WHERE job_id="'+job_id+'"';
    con.query(que,cb);

}

module.exports.getSingleJob=function(job_id,cb)
{
    var que='SELECT * FROM post_job WHERE job_id="'+job_id+'"';
    con.query(que,cb)
}
module.exports.getNotifications=function(user_pub_id, cb)
{
    var que = "SELECT * FROM `notification` WHERE `user_pub_id` = '"+user_pub_id+"' OR `type` = 'All' ORDER BY `created_at` DESC";    //console.log(que);
    con.query(que, cb);
}

module.exports.responseMessage=function(status,message,res)
{
    res.send({
        "status":status,
        "message":message  
    })
}

module.exports.responseMessagedata=function(status,message,data,res)
{
    res.send({
        "status":status,
        "message":message,
        "data": data
    })
}

module.exports.GetInvoice=function(user_pub_id,status,cb)
{
    // var que="select b.*,u.name,concat('"+base_url+"',u.image)as image,cs.currency_symbol,c.cat_name,p.start_time,p.end_time,p.duration from booking_invoice1 as b join user as u on u.user_pub_id=b.artist_pub_id JOIN `currency_setting` AS cs ON cs.status =1 join categories as c on c.id=u.cat_id join post_job as p on p.job_id=b.job_id where b.user_pub_id='"+user_pub_id+"' and b.status='"+status+"' order by b.created_at DESC"
    var que="select u.name,concat('"+base_url+"',u.image)as image,cs.currency_symbol,c.cat_name,p.start_time,p.end_time,p.duration,co.*, b.*, IF(co.discount_type!='',IF(co.discount_type=2, concat(co.discount,'Flat Off'), concat(co.discount,'% Off')),'') as discount from booking_invoice1 as b join user as u on u.user_pub_id=b.artist_pub_id  left join coupon as co on co.id=b.coupon_id JOIN `currency_setting` AS cs ON cs.status =1 join categories as c on c.id=u.cat_id join post_job as p on p.job_id=b.job_id where (b.user_pub_id='"+user_pub_id+"' || b.artist_pub_id='"+user_pub_id+"') and b.status='"+status+"'  order by b.created_at DESC"
    con.query(que,cb)
}

module.exports.GetInvoice1=function(user_pub_id,cb)
{
var que="select u.name,concat('"+base_url+"',u.image)as image,cs.currency_symbol,c.cat_name,p.start_time,p.end_time,p.duration,co.*,b.*, IF(co.discount_type!='',IF(co.discount_type=2, concat(co.discount,'Flat Off'), concat(co.discount,'% Off')),'') as discount from booking_invoice1 as b join user as u on u.user_pub_id=b.artist_pub_id left join coupon as co on co.id=b.coupon_id JOIN `currency_setting` AS cs ON cs.status =1 join categories as c on c.id=u.cat_id join post_job as p on p.job_id=b.job_id where b.user_pub_id='"+user_pub_id+"' or b.artist_pub_id ='"+user_pub_id+"'  order by b.created_at DESC"
  con.query(que,cb)
}
module.exports.GetInvoice12=function(user_pub_id,cb)
{
var que="select u.name,concat('"+base_url+"',u.image)as image,cs.currency_symbol,c.cat_name,p.start_time,p.end_time,p.duration,co.*,b.*, IF(co.discount_type!='',IF(co.discount_type=2, concat(co.discount,'Flat Off'), concat(co.discount,'% Off')),'') as discount from booking_invoice1 as b join user as u on u.user_pub_id=b.artist_pub_id left join coupon as co on co.id=b.coupon_id JOIN `currency_setting` AS cs ON cs.status =1 join categories as c on c.id=u.cat_id join post_job as p on p.job_id=b.job_id where b.user_pub_id='"+user_pub_id+"' or b.artist_pub_id ='"+user_pub_id+"'  order by b.created_at DESC LIMIT 5"
  con.query(que,cb)
}
module.exports.getMyPoints=function(user_id){
    return new Promise((resolve, reject) => {
    con.query('select * from user_point where user_id="'+user_id+'"',function(err,result){
        console.log(err);
        if(err){
            reject(false);
        }else{
            if(result.length > 0){
                var result=JSON.parse(JSON.stringify(result));
            resolve(result[0]);
            } else {
                reject(false);
            }
        } 
    })
    });
} 

module.exports.getMyjodsData = function(result, cb){
    var result_array = [];
    result
			.reduce(function(promiseresult, resultdata, index) {
	
				return promiseresult
					.then(function(data) {
						return new Promise(function(resolve, reject) {
							// console.log(resultdata);
							con.query('select coalesce(count(job_id),0) as applicant_count from apply_job where job_id="'+resultdata.job_id+'" and status in(0,1,2,5)',function(err,resultCount){
									if(err){
									  console.log("coalesce error",err);
									}else{
									  var resultCount=JSON.parse(JSON.stringify(resultCount));
									 //console.log("data"+ resultCount); 
									  resultdata.applicant_count=resultCount[0].applicant_count;
										result_array.push(resultdata)
										resolve(result_array);
									}
							})
						})
					}).catch(function(err){
						reject(err);
					})
				}, Promise.resolve(null)).then(arrayOfResult => {
					
					cb(result_array)
				})
}
module.exports.fannanConverter=function(data,type){   
    return new Promise((resolve, reject) => {
    con.query('select * from setting where def_key="fannan_point"',function(err,result){
        console.log(err);
        if(err){
            reject(false);
        }else{
            if(result.length > 0){ 
                var result=JSON.parse(JSON.stringify(result));
                var resultData=JSON.parse(result[0].def_value);
                var point=resultData.point
                var price=resultData.price
                if(type=="amount"){
                    var resp = (point*data)/price;
                } else {
                    var resp = (data*price)/point;
                }
                resolve(resp);
            } else {
                reject(false);
            }
        } 
    })
    });
}

module.exports.checkCoupon=function(coupon_code,user_id){   
    return new Promise((resolve, reject) => {
    con.query('select * from coupon where coupon_code="'+coupon_code+'" and status="1"',function(err,result){
        if(err){
            reject("server error.")
        }else{
            if(result.length>0){
                var coupon_id=result[0].id;
                console.log(coupon_id);
                if(result[0].counter > 0){
                    con.query('select * from user_coupon where coupon_id="'+coupon_id+'" and user_pub_id="'+user_id+'"',function(err,result){
                        if(err){
                            reject("Server error.");
                        }else{
                            if(result.length>0){

                                resolve(0);
                            }else{

                                resolve(coupon_id);
                            }
                        }
                    })
                } else {
                    reject("Coupon expire.")
                }
            } else {
                    reject("Invailid coupon")
            }
        } 
    })
    });
}

module.exports.couponCalculation=function(coupon_id,amount){
return new Promise((resolve,reject)=>{
    con.query('select * from coupon where id="'+coupon_id+'"',function(err,resultCoupon){
        if(err){
            reject(false);
        }else{
            var resultCoupon=JSON.parse(JSON.stringify(resultCoupon));
            var discount_type=resultCoupon[0].discount_type;
            var data={coupon_id:coupon_id};
            if(discount_type=="1"){
                var discount=resultCoupon[0].discount;
                var total_amount=(amount*discount)/100;
                var net_amount=amount-total_amount;
                // var net_amount=Math.round(net_amount)
                var net_amount= +(Math.round(net_amount + "e+2")  + "e-2");
                data.net_amount=net_amount;
                data.discount=discount +"% Off";
                
                if(net_amount<0){
                    reject('This coupon is not valid for this amount.')
                }else{
                resolve(data);
                }
            }else{
                var discount=resultCoupon[0].discount;
                var net_amount=amount-discount;
                data.net_amount=net_amount;
                data.discount=discount +"Flat Off";
                var net_amount=Math.round(net_amount)
                if(net_amount<0){
                    reject('This coupon is not valid for this amount.')
                }else{
                resolve(data);

                }
            }
        }
    })
})
}
module.exports.LoginData=function(email,device_token,device_type){
    return new Promise((resolve, reject) => {
        con.query('select *,concat("'+base_url+'",image) as image from user where email_id="'+email+'"',function(err,result){
				
            console.log(result)
            if(err){
            reject(err);                
            }else{
                if(result.length==0){
                    
                    reject(false);
                }else{

                            if(result[0].status=='0'){
                                
                                reject(false);
                            }else{
                                // if(role!=1)
                                con.query('update user set device_type="'+device_type+'",device_token="'+device_token+'" where email_id="'+email+'"',function(err,result_update){

                                       if(err){
                                           constant.log(err);
                                       }
                                       else{
                                           if(result.length>0){
                                               var cat_id=result[0].cat_id;
                                               console.log(cat_id)
                                               if(cat_id != "NA" ){
                                               con.query('select * from categories where id="'+cat_id+'"',function(err,resultCat){
                                                   console.log(resultCat)
                                                   if(err){
                                                       console.log(err);
                                                   }else{
                                                var resultCat=JSON.parse(JSON.stringify(resultCat));
                                                console.log(resultCat);
                                                var cat_name=resultCat[0].cat_name;
                                                console.log(cat_name);
                                                result[0].cat_name=cat_name;
                                                var user_id=result[0].user_pub_id
                                                 
                                                con.query('select rating from rating where user_pub_id="'+user_id+'"',function(err,resultRating){
                                                    if(err){
                                                        console.log(err);
                                                    }else{
                                                         var resultRating=JSON.parse(JSON.stringify(resultRating))
                                                        if(resultRating.length>0){
                                                                result[0].rating=resultRating[0].rating;
                                                        // cm.responseMessagedata(constant.One,constant.LOGINSUCCESSFULL,result[0],res)					
                                                            resolve(result[0]);
                                                        }else{
                                                                // console.log('ssffsddfs');
                                                            result[0].rating=0.0;
                                                    // cm.responseMessagedata(constant.One,constant.LOGINSUCCESSFULL,result[0],res)
                                                                resolve(result[0]);
                                                        }

                                                    }
                                                })
                                                }
                                            })
                                        }else{
                                           var user_id=result[0].user_pub_id
                                                 
                                                con.query('select rating from rating where user_pub_id="'+user_id+'"',function(err,resultRating){
                                                    if(err){
                                                        console.log(err);
                                                    }else{
                                                        var resultRating=JSON.parse(JSON.stringify(resultRating))
                                                        if(resultRating.length>0){
                                                                result[0].rating=resultRating[0].rating;
                                                            //    cm.responseMessagedata(constant.One,constant.LOGINSUCCESSFULL,result[0],res)
                                                            resolve(result[0]);
                                            }else{
                                                                // console.log('ssffsddfs');
                                                            result[0].rating=0.0;
                                                    resolve(result[0]);
                                                        //   cm.responseMessagedata(constant.One,constant.LOGINSUCCESSFULL,result[0],res)
                                                        }

                                                            }
                                                })
                                       
                                       }
                                           
                                       }
                                           else{
                                            //    cm.responseMessage(constant.Zero,constant.USER_NOT_FOUND,res);
                                reject(false);                                           
                                               }
                                       }
                                   });

                            }
                       
                }
            }
        })
    });
}

module.exports.addTransactionHistory=function(user_id,point,trans_type,invoice_id,target_id,created_at){
return new Promise((resolve,reject)=>{
con.query('INSERT INTO transaction_history set user_id="'+user_id+'",point="'+point+'",trans_type="'+trans_type+'",invoice_id="'+invoice_id+'",target_id="'+target_id+'",created_at="'+created_at+'"',function(err,result){
if(err){
    reject(err);
}else{
    console.log(result);
    if(result.affectedRows){
        console.log('enter');
        resolve(result);
    }else{
        reject(false);
    }
}
})
})
}

module.exports.manageUserPoint=function(user_pub_id,user_point1,point,type){
    return new Promise((resolve, reject) => {
        if(type=="add"){
            var final_point=user_point1+point;
            var created_at=(new Date()).valueOf().toString();
            var updated_at=(new Date()).valueOf().toString();
            console.log(final_point);
            con.query('select * from user_point where user_id="'+user_pub_id+'"',function(err,result){
                if(err){
                    console.log(err);
                }else{
                    if(result.length){
                        con.query('update user_point set point="'+final_point+'" where user_id="'+user_pub_id+'"',function(err,result){
                            if(err){
                                console.log(err);
                            }else{
                                console.log(result)
                                resolve(result);
                            }
                        })
                    }else{
                        con.query('insert into user_point set user_id="'+user_pub_id+'",point="'+final_point+'",created_at="'+created_at+'",updated_at="'+updated_at+'"',function(err,result){
                            if(err){
                                console.log('insert common user_point'+err);
                                reject(err);
                            }else{
                                resolve(result);
                            }
                        })                
                    }
                }
            })
        }else{
            var final_point=user_point1-point;
            var created_at=(new Date()).valueOf().toString();
            var updated_at=(new Date()).valueOf().toString();
            con.query('select * from user_point where user_id="'+user_pub_id+'"',function(err,result){
                if(err){
                    console.log(err);
                }else{
                    if(result.length){
                        con.query('update user_point set point="'+final_point+'" where user_id="'+user_pub_id+'"',function(err,result){
                            if(err){
                                console.log(err);
                            }else{
                                resolve(result);
                            }
                        })
                    }else{
                        con.query('insert into user_point set user_id="'+user_pub_id+'",point="'+final_point+'",created_at="'+created_at+'",updated_at="'+updated_at+'"',function(err,result){
                            if(err){
                                console.log('df'+err)
                                reject(err);
                            }else{
                                resolve(result);
                            }
                        })                
                    }
                }
            })
        }
    });
}

module.exports.getJobsArtist=function(user_pub_id,cat_id,job_id,cb)
{
   // var que ="SELECT cat.cat_name,us.name AS user_name,us.mobile AS user_mobile,us.address AS user_address,(Pj.duration * aus.price) AS price,CONCAT( '"+base_url_php+"',  us.image) AS user_image,cs.currency_symbol,Pj.* FROM `post_job` AS Pj JOIN `category` AS cat ON cat.id = Pj.cat_id JOIN `user` AS us ON us.user_pub_id = Pj.user_pub_id JOIN `user` AS aus ON aus.user_pub_id = '"+user_pub_id+"' JOIN `currency_setting` AS cs ON cs.status = 1 where Pj.status IN (0,1,2) and Pj.cat_id ="+cat_id+" and Pj.job_id not in ( select job_id from applied_job where photographar_pub_id='"+user_pub_id+"') order by created_at DESC";
    var que ="SELECT cat.cat_name,us.name AS name,us.mobile_no AS mobile_no,us.address AS  address,f.status as favourite_status ,COALESCE(f.status,0) as favourite_status,(Pj.duration * aus.price) AS price,CONCAT( '"+constant.base_url+"',  us.image) AS image,cs.currency_symbol,Pj.* FROM `post_job` AS Pj JOIN `categories` AS cat ON cat.id = Pj.cat_id JOIN `user` AS us ON us.user_pub_id = Pj.user_pub_id JOIN `user` AS aus ON aus.user_pub_id = '"+user_pub_id+"' JOIN `currency_setting` AS cs ON cs.status = 1 left join favourite f on f.target_id=Pj.job_id and f.user_pub_id='"+user_pub_id+"' where Pj.status IN (0) and Pj.cat_id ='"+cat_id+"' and Pj.job_id!='"+job_id+"' and Pj.user_pub_id !='"+user_pub_id+"'  and Pj.job_id not in ( select job_id from apply_job where artist_pub_id ='"+user_pub_id+"') order by created_at DESC";
    con.query(que, cb);
}   
module.exports.getJobsArtist1=function(user_pub_id,cb)
{
    var que="SELECT cat.cat_name,us.name AS name,us.mobile_no AS mobile_no,COALESCE(f.status,0) as favourite_status,us.address AS address,(Pj.duration * us.price) AS price,CONCAT( '"+constant.base_url+"',  us.image) AS image,cs.currency_symbol,Pj.* FROM `post_job` AS Pj  JOIN `categories` AS cat ON cat.id = Pj.cat_id  JOIN `user` AS us ON us.user_pub_id = Pj.user_pub_id JOIN `currency_setting` AS cs ON cs.status = 1 left join favourite f on f.target_id=Pj.job_id  and f.user_pub_id='"+user_pub_id+"' where Pj.status IN (0) and  Pj.user_pub_id !='"+user_pub_id+"'  and  Pj.job_id not in ( select job_id from apply_job where artist_pub_id ='"+user_pub_id+"') order by created_at DESC";
    con.query(que,cb);
}

module.exports.getJobsAppliedArtist=function(user_pub_id,cb)
{
    var que ="SELECT cat.cat_name,Aj.status As job_status,Aj.id As aj_id,us.name AS name,us.mobile_no AS mobile_no,us.address AS address,(Pj.duration * aus.price) AS price,CONCAT( '"+base_url+"',  us.image) AS image,cs.currency_symbol,Pj.* FROM `post_job` AS Pj  JOIN `categories` AS cat ON cat.id = Pj.cat_id JOIN `user` AS us ON us.user_pub_id = Pj.user_pub_id JOIN `user` AS aus ON aus.user_pub_id = '"+user_pub_id+"' JOIN `apply_job` AS Aj ON Aj.job_id = Pj.job_id and Aj.artist_pub_id='"+user_pub_id+"' JOIN `currency_setting` AS cs ON cs.status = 1 where Pj.status IN (0,1) and Pj.job_id in ( select job_id from apply_job where artist_pub_id='"+user_pub_id+"' and status IN (0,1,3,4)) order by date DESC";
    con.query(que, cb);
} 

module.exports.getJobsAppliedUser=function(job_id,cb)
{
    var que ="SELECT cat.cat_name,Aj.status As status,Aj.id As aj_id,us.name AS name,us.mobile_no AS mobile_no,us.address AS address,(Pj.duration * us.price) AS price,CONCAT( '"+base_url+"',  us.image) AS image,cs.currency_symbol,Pj.*,Aj.artist_pub_id FROM `apply_job` AS Aj JOIN `post_job` AS Pj ON Pj.job_id = Aj.job_id  JOIN `categories` AS cat ON cat.id = Pj.cat_id JOIN `user` AS us ON us.user_pub_id = Aj.artist_pub_id JOIN `currency_setting` AS cs ON cs.status = 1 where Aj.job_id='"+job_id+"' and Aj.status != '3'";
    con.query(que, cb);
} 

module.exports.getCurrentAppointmentArtist=function(user_pub_id,cb)
{
    var que ="SELECT cat.cat_name,us.name AS name,us.mobile_no AS mobile_no,CONCAT( '"+constant.base_url+"',  us.image) AS image,cs.currency_symbol,p.*,a.artist_pub_id FROM `post_job` AS p JOIN `categories` AS cat ON cat.id = p.cat_id JOIN user AS us ON us.user_pub_id = p.user_pub_id JOIN `currency_setting` AS cs ON cs.status = 1 join apply_job a on a.job_id=p.job_id WHERE p.status IN (5) AND a.artist_pub_id ='"+user_pub_id+"'";
    con.query(que, cb);
}

module.exports.sendmail_old=function(user_email,subject,msg)
{
    var msg=decodeURI(msg);
    var url=encodeURI("/api/sendmail.php?subject="+subject+"&body="+msg+"&from="+constant.FROM+"&to="+user_email+"&authkey="+constant.AUTH_KEY+"");
    console.log(url);
    var options = {
        "method": "POST",
        "hostname": "control.msg91.com",
        "port": null,
        "path": url,
        "headers": {}
    };
    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });

    req.end();
}



// module.exports.sendmail=function(user_email,subject,msg)
// {
//     var payload = {
//     email_id: user_email,
//     subject: subject,
//     msg: msg
//     };

//  request({
//           uri: base_url+"fannan2_webservice/index.php/Webservice/send_email_new_v2",
//           method: "POST",
//           form: payload
//         }, function(error, response, body) {
//         // console.log(response);
//               if(error){
//                     console.log("error",error);
//             }else{
//                         console.log("response",response);
                           
//             }
//     })
// }
module.exports.sendmail=function(user_email,subject,msg,next = false)
{
    var api_key = 'ef5924af46ea9c61c8e31f5c006ada8b-65b08458-d9013671';
    var domain = 'mg.live2talks.com';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    var data = {
        from: 'amit@samyotech.com', //Fannan <no-reply@fannanapp.com>
        to: user_email,
        subject: subject,
        // text : msg,
        html: msg
        };
        
        mailgun.messages().send(data, function (error, body) {
            if(!error && next){
                console.log(body);
                next(body);
            }else{
                console.log(error);
            }
        });
}

module.exports.update1=function(table, where, obj, cb)
{
    var que = "UPDATE "+table+" SET ";
    var counter=1;
    for(var k in obj){
    if(counter==1){
         que += k+" = '"+obj[k]+"'"
    }
    else{
    que += ", "+k+" = '"+obj[k]+"'"
    }
     counter++;
    }
    var key = Object.keys(where);
    que += " WHERE "+key[0]+" = '"+where[key[0]]+"' ";
    console.log()
    db.query(que, cb);
}


module.exports.getMyticket=function(user_pub_id, cb)
{
    var que = "SELECT * FROM `ticket` WHERE `user_pub_id` = '"+user_pub_id+"' ORDER BY `created_at` DESC";    //console.log(que);
    con.query(que, cb);
}

module.exports.getRating=function(user_pub_id,cb)
{
 var que="select r.*,p.price,u.name,concat('"+base_url+"',u.image)as image from rating as r join booking_invoice1 as b on b.invoice_id=r.invoice_id join user as u on u.user_pub_id=r.user_pub_id join post_job as p on p.job_id=b.job_id where r.artist_pub_id='"+user_pub_id+"' and p.status=2 order by created_at"
     con.query(que,cb);
}

module.exports.getMyChat=function(user_pub_id,artist_pub_id, cb)
{
    var que="SELECT (c.artist_pub_id)as receiver_id,(c.user_pub_id)as sender_id,(us.name)as receiver_name ,(u.name)as sender_name ,"
    +"CONCAT('"+base_url+"',u.image)as receiver_image,CONCAT('"+base_url+"',u.image)as sender_image,CONCAT('"+base_url+"',c.image) as image,"
    +"c.* FROM chat as c join user as u on u.user_pub_id=c.user_pub_id join user as us on us.user_pub_id=c.artist_pub_id "
    +"WHERE (c.user_pub_id = '"+user_pub_id+"' AND c.artist_pub_id = '"+artist_pub_id+"') or "
    +"( c.artist_pub_id = '"+user_pub_id+"' and c.user_pub_id = '"+artist_pub_id+"') ORDER BY c.id ASC" 
    // var que="SELECT (c.artist_pub_id)as receiver_id,(c.user_pub_id)as sender_id,(us.name)as sender_name,(u.name)as receiver_name,CONCAT('"+base_url+"',us.image)as sender_image,CONCAT('"+base_url+"',u.image)as receiver_image,c.* FROM ((chat c join user u on c.artist_pub_id=u.user_pub_id)left join user us on c.user_pub_id=us.user_pub_id) WHERE (c.user_pub_id = '"+user_pub_id+"' AND c.artist_pub_id = '"+artist_pub_id+"') or( c.artist_pub_id = '"+user_pub_id+"' and c.user_pub_id = '"+artist_pub_id+"')"
    con.query(que, cb);
}

module.exports.getChatData=function(user_pub_id,artist_pub_id,cb)
{
    var que="SELECT * FROM `chat` WHERE (`user_pub_id` = '"+user_pub_id+"' AND `artist_pub_id` = '"+artist_pub_id+"' ) or( `user_pub_id` = '"+artist_pub_id+"' and `user_pub_id_receiver` = '"+user_pub_id+"' )";
    con.query(que, cb);
}

module.exports.getChatHistory=function(user_pub_id,cb)
{
 // var que = "SELECT (c.user_pub_id)as sender_id,(c.artist_pub_id)as receiver_id,(u.name) as receiver_name,(us.name) as sender_name,CONCAT('"+base_url+"',us.image) as sender_image,CONCAT('"+base_url+"',u.image) as receiver_image,c.* FROM ((chat c JOIN user u ON c.artist_pub_id=u.user_pub_id ) LEFT JOIN user us ON c.user_pub_id=us.user_pub_id)  WHERE c.artist_pub_id='"+user_pub_id+"' ORDER BY c.id DESC"; 
//    var que="SELECT (c.user_pub_id) as sender_id,(c.artist_pub_id)as receiver_id,(u.name) as receiver_name,(us.name) as sender_name,"
//    +"CONCAT('"+base_url+"',us.image) as sender_image,CONCAT('"+base_url+"',u.image) as receiver_image,c.* FROM "
//    +"chat c JOIN user u ON c.artist_pub_id=u.user_pub_id LEFT JOIN user us ON c.user_pub_id=us.user_pub_id "
//    +"WHERE (c.artist_pub_id='"+user_pub_id+"' || c.user_pub_id='"+user_pub_id+"') ORDER BY c.id DESC ";

   var que="SELECT (c.artist_pub_id) as receiver_id,(c.user_pub_id)as sender_id,(u.name) as receiver_name,(us.name) as sender_name,"
   +"CONCAT('"+base_url+"',us.image) as sender_image,CONCAT('"+base_url+"',u.image) as receiver_image, c.*,"
   +"(SELECT p.message from chat as p WHERE ((p.user_pub_id=c.user_pub_id AND p.artist_pub_id=c.artist_pub_id) OR (p.artist_pub_id=c.user_pub_id AND p.user_pub_id =c.artist_pub_id)) order by p.id desc limit 1) as message, "
   +"(SELECT p.send_at from chat as p WHERE ((p.user_pub_id=c.user_pub_id AND p.artist_pub_id=c.artist_pub_id) OR (p.artist_pub_id=c.user_pub_id AND p.user_pub_id =c.artist_pub_id)) order by p.id desc limit 1) as send_at "
   +" FROM "
   +"chat c JOIN user u ON c.artist_pub_id=u.user_pub_id LEFT JOIN user us ON c.user_pub_id=us.user_pub_id "
   +"WHERE c.user_pub_id='"+user_pub_id+"' GROUP BY c.artist_pub_id ORDER BY send_at DESC  ";


con.query(que, cb);
}

module.exports.getTotalDoneJob=function(user_pub_id,cb)
{
    var que = "SELECT COUNT(id) AS total FROM `post_job` WHERE `status`='2' AND `user_pub_id`='"+user_pub_id+"'";
    con.query(que, cb);
}

module.exports.getTotalEarn=function(user_pub_id,cb)
{
    var que="SELECT sum(p.price) AS Earned,c.currency_symbol FROM post_job as p join currency_setting as c on c.status=1 WHERE p.status=2 AND p.user_pub_id='"+user_pub_id+"'";
    con.query(que,cb);
}