var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require('./dbconnection');
var md5 = require('md5');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');

router.post('/loginCandidate', function (req, res) {
	var chkQry = "SELECT * FROM USER_REGISTRATION WHERE ??=? OR ??=? AND ??=?";
	var cheQryData = ['LOC_USER_EMAIL', req.body.i_loginparams, 'LOC_USER_MOBILE', req.body.i_loginparams, 'LOC_USER_PWD', md5(req.body.i_password)];
	chkQry = mysql.format(chkQry, cheQryData);
	connection.query(chkQry, function (errr, results) {
		if (errr) {
			res.json({ "Error": true, "Message": "Error executing MySQL query" });
		} else {
			if (results.length > 1) {
				res.json({ status: false, message: 'User Details exist more than one' });
			} else if (results.length == 0) {
				res.json({ status: false, message: 'User Details doesnot exist' });
			} else {
				// Create Token as user logs in
				var token = jwt.sign(results, config.secret, {
					expiresIn: 1440
				});
				user_id = results[0].user_id;
				var data = {
					LOC_USER_ID: results[0].LOC_USER_ID,
					DEVICE_TYPE: req.body.device_type,
					ACCESS_TOKEN: token,
					IP_ADDRESS: req.body.ip
				}
				//console.log(data);
				var query = "INSERT INTO  ?? SET  ?";
				var table = ["ACCESS_LOG"];
				query = mysql.format(query, table);
				connection.query(query, data, function (err, rows) {
					if (err) {
						res.json({ "status": false, "Message": "Error executing MySQL query" });
					} else {
						delete (results[0].LOC_USER_PWD);
						results[0].ACCESS_TOKEN = token;
						res.json({ status: true, message: 'User Login Successful', result: results[0] });
					}
				});
			}
		}
		console.log(results);
	});
});

router.post('/adduser', function (req, res) {
	var chkQry = "SELECT * FROM USER_REGISTRATION WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['LOC_USER_MOBILE', req.body.u_mobile, 'LOC_USER_EMAIL', req.body.u_email, 'LOC_USER_ALT_CONTACT', req.body.u_mobile];
	chkQry = mysql.format(chkQry, cheQryData);
	//console.log(chkQry);
	connection.query(chkQry, function (errr, results) {
		if(errr){
			res.json({ "status": false, "Message": "Error executing MySQL query" });
		} else {
			if (results.length === 0) {
				var query = 'INSERT into USER_REGISTRATION (??,??,??,??,??,??,??,??) values (?,?,?,?,?,?,?,?)';
				var data = ['LOC_USER_FNAME', 'LOC_USER_LNAME', 'LOC_USER_MOBILE', 'LOC_USER_ALT_CONTACT', 'LOC_USER_EMAIL', 'LOC_USER_TYPE', 'LOC_USER_PWD', 'LOC_USER_ACTIVE', req.body.u_fname, req.body.u_lname, req.body.u_mobile, req.body.u_altmobile, req.body.u_email, req.body.u_type, md5(req.body.u_password), 1];
				query = mysql.format(query, data);
				//console.log(query);
				connection.query(query, function (err, result) {
					var x = {};
					x.user_id = result.insertId;
	
					// Create Token as user logs in
					var token = jwt.sign(results, config.secret, {
						expiresIn: 1440
					});
					var data = {
						LOC_USER_ID: x.user_id,
						DEVICE_TYPE: req.body.device_type,
						ACCESS_TOKEN: token,
						IP_ADDRESS: req.body.ip
					}
					//console.log(data);
					var query = "INSERT INTO  ?? SET  ?";
					var table = ["ACCESS_LOG"];
					query = mysql.format(query, table);
					connection.query(query, data, function (err, rows) {
						if (err) {
							res.json({ "status": false, "Message": "Error executing MySQL query" });
						} else {
							x.ACCESS_TOKEN = token;
							res.json({ status: true, message: 'User Added Successfully', result: x });
						}
					});
					var createPreference = 'INSERT into USER_ADDITIONAL_INFO (??,??,??,??,??,??) values (?,?,?,?,?,?)';
					var newData = ['LOC_USER_ID', 'LOC_USERNAME', 'LOC_USER_SUB_MSG', 'LOC_USER_SUB_CALL', 'LOC_USER_SUB_MAIL', 'LOC_USER_PROFILE', x.user_id, req.body.u_fname + '_' + req.body.u_lname, 1, 1, 1, null];
					createPreference = mysql.format(createPreference, newData);
					//console.log(createPreference);
					connection.query(createPreference, function (error, updated) { console.log(updated) });
					
				});
			} else {
				res.json({ status: false, message: 'User Already Exist', result: results[0] });
			}
		}
	});
});

router.get('/searchcourses/:course', function(req,res){
	console.log(req.params.course);
	var x =  '%'+req.params.course+'%';
	var searchQry = 'SELECT * from OFFERED_COURSES where ?? like ?';
	var searchQryData = ['LOC_COURSE_NAME',x];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Course Not Found"});
		}
	});
});

router.get('/searchlocations/:location', function(req,res){
	//console.log(req.params.course);
	var x =  '%'+req.params.location+'%';
	var searchQry = 'SELECT * from OFFERED_LOCATIONS where ?? like ? or ??=? or ?? like ? ';
	var searchQryData = ['LOC_LOCATION_NAME',x, 'LOC_LOCATION_PINCODE',req.params.location, 'LOC_LOCATION_RELEVANCE_NAME',x];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
	connection.query(searchQry,function(err,results){
		if(results.length>=1){
			res.json({status:true, response: results});
		}else{
			res.json({status:false, response: "Location Not Found"});
		}
	});
});

router.post('/loginInstitute', function(req,res){
	//console.log("you are here");
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE (??=? OR ??=?) AND ??=?";
	var cheQryData = ['LOC_INST_CONTACT',req.body.i_loginparams,'LOC_INST_EMAIL',req.body.i_loginparams,'LOC_INST_PWD',md5(req.body.i_password)];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		//console.log(results);
		if(results.length > 1){
			res.json({status: false, message: 'Institute Details exist more than one'});
		}else if(results.length < 1){
			res.json({status: false, message: 'Login information incorrect'});
		} else {
			var token = jwt.sign(results, config.secret, {
				expiresIn: 1440
			});
			user_id = results[0].user_id;
			var data = {
				LOC_USER_ID: results[0].LOC_INST_ID,
				DEVICE_TYPE: req.body.device_type,
				ACCESS_TOKEN: token,
				IP_ADDRESS: req.body.ip
			}
			//console.log(data);
			var query = "INSERT INTO  ?? SET  ?";
			var table = ["ACCESS_LOG"];
			query = mysql.format(query, table);
			console.log(query);
			connection.query(query, data, function (err, rows) {
				if (err) {
					res.json({ "status": false, "Message": "Error executing MySQL query" });
				} else {
					delete(results[0].inst_off_courses);
					delete(results[0].inst_prefer_locations);
					delete (results[0].inst_password);
					results[0].ACCESS_TOKEN = token;
					//res.json({ status: true, message: 'User Login Successful', result: results[0] });
					res.json({status: true,message: 'Institute Login Successful',result: results[0]});
				}
			});
		}
	});
});

router.post('/addinstitute', function(req,res){
	//console.log("you are here");
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['LOC_INST_NAME',req.body.i_name,'LOC_INST_CONTACT',req.body.i_contact,'LOC_INST_EMAIL',req.body.i_email];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into INSTITUTE_REGISTRATION (??,??,??,??,??,??,??,??) values (?,?,?,?,?,?,?,?)';
			var data = ['LOC_INST_NAME','LOC_INST_ADDRESS','LOC_INST_CITY','LOC_INST_CONTACT','LOC_INST_ALTCONTACT','LOC_INST_EMAIL', 'LOC_INST_PWD', 'LOC_INST_IMG', req.body.i_name, req.body.i_address,req.body.i_city, req.body.i_contact,req.body.i_altcontact, req.body.i_email,md5(req.body.i_password), req.body.i_images];
			query = mysql.format(query,data);
			//console.log(query);
			connection.query(query,function(err,result){
				//console.log(result);
				var x = {};
				x.user_id = result.insertId;


				// Create Token as user logs in
				var token = jwt.sign(results, config.secret, {
					expiresIn: 1440
				});
				var data = {
					LOC_USER_ID: x.user_id,
					DEVICE_TYPE: req.body.device_type,
					ACCESS_TOKEN: token,
					IP_ADDRESS: req.body.ip
				}
				//console.log(data);
				var query = "INSERT INTO  ?? SET  ?";
				var table = ["ACCESS_LOG"];
				query = mysql.format(query, table);
				connection.query(query, data, function (err, rows) {
					if (err) {
						res.json({ "status": false, "Message": "Error executing MySQL query" });
					} else {
						x.ACCESS_TOKEN = token;
						res.json({status: true, message: 'Institute Added Successfully',result: x});
					}
				});
			});
		}else{
			res.json({status: false,message: 'Institute Already Exist',result: results[0]});
		}
	});
});
module.exports = router;
