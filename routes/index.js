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

module.exports = router;
