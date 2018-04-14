var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var md5 = require('md5');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'techninzaz_locator'
});

connection.connect();

/* GET home page. */
/*router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Warm welcome from TechNinzaz' });
  res.json({status:true, message: 'Hey Welcome'})
});*/

router.post('/loginCandidate', function(req,res){
	console.log(req.body);
	var chkQry = "SELECT * FROM user_registration WHERE ??=? OR ??=? AND ??=?";
	var cheQryData = ['user_email',req.body.i_loginparams,'user_mobile_number',req.body.i_loginparams,'user_pwd',md5(req.body.i_password)];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		console.log(results);
		if(results.length>1){
			res.json({status: false, message: 'User Details exist more than one'});
		}else if(results.length == 0){
			res.json({status: false, message: 'User Details doesnot exist'});
		} else {
			delete(results[0].user_pwd);
			res.json({status: true,message: 'User Login Successful',result: results[0]});
		}
	});
});

router.post('/adduser', function(req,res){
	var chkQry = "SELECT * FROM user_registration WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['user_mobile_number',req.body.u_mobile,'user_email',req.body.u_email,'user_altmobile_number',req.body.u_altmobile];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into user_registration (??,??,??,??,??,??,??) values (?,?,?,?,?,?,?)';
			var data = ['user_first_name','user_last_name','user_mobile_number','user_altmobile_number','user_email','user_type','user_pwd',req.body.u_fname,req.body.u_lname,req.body.u_mobile,req.body.u_altmobile,req.body.u_email,req.body.u_type,md5(req.body.u_password)];
			query = mysql.format(query,data);
			console.log(query);
			connection.query(query,function(err,result){
				//console.log(result);
				var x = {};
				x.user_id = result.insertId;
				res.json({status: true, message: 'User Added Successfully',result: x});

			});
		}else{
			res.json({status: false,message: 'User Already Exist',result: results[0]});
		}
	});
});

router.post('/userenquiry', function(req,res){
	var chkQry = "SELECT * FROM user_enquiry WHERE ??=? AND ??=? AND ??=?";
	var cheQryData = ['user_id',req.body.u_id,'course_id',req.body.u_cid,'location_id',req.body.u_lid];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into user_enquiry (??,??,??) values (?,?,?)';
			var data = ['user_id','course_id','location_id',req.body.u_id,req.body.u_cid,req.body.u_lid];
			query = mysql.format(query,data);
			//console.log(query);
			connection.query(query,function(err,result){
				var x = {};
				x.enquiry_id = result.insertId;
				res.json({status: true, message: 'User Enquiry Added Successfully', result:x});
			});
		}else{
			res.json({status: false,message: 'Enquiry Already Exist',result: results[0]});
		}
	});
});

router.get('/searchenquiry/:enqid', function(req,res){
	var searchQry = 'SELECT * from user_enquiry where ?? like ?';
	var searchQryData = ['id',req.params.enqid];
	searchQry = mysql.format(searchQry,searchQryData);
	connection.query(searchQry,function(err,results){
		//console.log(results);
		if(results.length>=1){
			var queryLC= 'SELECT * from institute_registration where find_in_set(?,??) <> 0 and find_in_set(?,??) <> 0';
			var queryLCData = [results[0].course_id,'inst_off_courses',results[0].location_id,'inst_prefer_locations'];
			queryLC = mysql.format(queryLC,queryLCData);
			console.log(queryLC);
			connection.query(queryLC,function(e,r){
					res.json({status: true, response:r});
			});
		}else{
			res.json({status:false, response: "No Matching Found"});
		}
	});

});

router.get('/usertransaction', function(req,res){
	var searchQry = 'SELECT * from user_enquiry where ?? = ?';
	var searchQryData = ['batch',0];
	searchQry = mysql.format(searchQry,searchQryData);

	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			results.forEach(function(i,v){
				//console.log(i.id);
				var queryLC= 'SELECT id from institute_registration where find_in_set(?,??) <> 0 and find_in_set(?,??) <> 0';
				var queryLCData = [i.course_id,'inst_off_courses',i.location_id,'inst_prefer_locations'];
				queryLC = mysql.format(queryLC,queryLCData);

				connection.query(queryLC,function(e,institutes){
		 			//console.log(r);
		 			institutes.forEach(function(value,key){
		 				//console.log(value);
		 				var query = 'INSERT into enquiry_trans (??,??,??,??,??) values (?,?,?,?,?)';
						var data = ['enq_id','inst_id','inst_enquired','inst_contacted','inst_student',i.id,value.id, 1,0,0];
						query = mysql.format(query,data);

						connection.query(query,function(err,result){
							//console.log(result);
						});

		 			});


				});

				var query = 'UPDATE user_enquiry SET ??=? WHERE ??=?';
				var data = ['batch','1','id',i.id];
				query = mysql.format(query,data);
				connection.query(query,function(err,result){
						//res.json({status:true, response: "Batch execution Successfully."});
				});
			})

			res.json({status:true, response: "Batch Executed Successfully."});

		}else{
			res.json({status:false, response: "No Matching Found"});
		}
	});
});

router.get('/userenquiries/:userid', function(req,res){
	console.log(req.params.userid);
	var enuryQry = 'SELECT id as enquiry_id  from user_enquiry WHERE ??=? ORDER BY datetime DESC';
	var enuryData = ['user_id',req.params.userid];
	enuryQry = mysql.format(enuryQry,enuryData);
	console.log(enuryQry);
	connection.query(enuryQry,function(err,results){
		console.log(results);
		if(results.length>=1){
			res.json({status: true, result:results[0]});
		}else{
			res.json({status:false, result: "No Matching Found"});
		}
	});
});

router.get('/userinfo/:usrid', function(req,res){
	console.log(req.params.usrid);
	var usrQry = 'SELECT * from user_registration WHERE ??=?';
	var usrData = ['user_id',req.params.usrid];
	usrQry = mysql.format(usrQry,usrData);
	console.log(usrQry);
	connection.query(usrQry,function(err,results){
		console.log(results);
		if(results.length>=1){
			delete results[0].user_pwd;
			res.json({status: true, result:results[0]});
		}else{
			res.json({status:false, result: "No Matching Found"});
		}
	});
});

module.exports = router;
