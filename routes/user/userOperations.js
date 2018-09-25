var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../dbconnection');
var md5 = require('md5');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');

/*router.post('/loginCandidate', function(req,res){
	console.log(req.body);
	if(!req.session.count)
		req.session.count = 1;
	 else 
		req.session.count++;

	
	var chkQry = "SELECT * FROM USER_REGISTRATION WHERE ??=? OR ??=? AND ??=?";
	var cheQryData = ['LOC_USER_EMAIL',req.body.i_loginparams,'LOC_USER_MOBILE',req.body.i_loginparams,'LOC_USER_PWD',md5(req.body.i_password)];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		//console.log(results);
		if(results.length>1){
			res.json({status: false, message: 'User Details exist more than one'});
		}else if(results.length == 0){
			res.json({status: false, message: 'User Details doesnot exist'});
		} else {
			delete(results[0].LOC_USER_PWD);
			results[0].platform = req.body.platform;
			results[0].access_ip = req.body.access_ip;
			req.session.sessionVal = md5(results[0].LOC_USER_ID+results[0].LOC_USER_FNAME);
			results[0].session = req.session;
			console.log(req.session);
			//createAccessLog(results[0]);
			res.json({status: true,message: 'User Login Successful',result: results[0]});
		}
	});
});*/


function createAccessLog(data) {
	var d = new Date();
	var month, day;
	month = d.getMonth() + 1; if (month < 10) { month = "0" + month; }
	day = d.getDate(); if (day < 10) { day = "0" + day; }
	var fullDate = d.getFullYear() + '-' + month + '-' + day;
	//console.log(data);
	var checkSession = "SELECT * from ACCESS_LOG WHERE ??=? AND ??=? AND ??=?";
	var checkData = ['LOC_EMAIL_ID', data.LOC_USER_EMAIL, 'LOC_SESSION_ID', data.session.sessionVal, 'LOC_ACCESS_DATE', fullDate];
	checkSession = mysql.format(checkSession, checkData);
	console.log(checkSession);
	sqlGetCall(checkSession, function (results) {
		if (results.length > 0) {
			var updateQry = 'UPDATE ACCESS_LOG SET ??=?,??=?,??=? WHERE ??=?';
			var updateData = ['LOC_ACCESS_SOURCE', data.platform, 'LOC_IP_ADDRESS', data.access_ip, 'LOC_ATTEMP_COUNT', data.session.count, 'LOC_ACCESS_ID', results[0].LOC_ACCESS_ID];
			updateQry = mysql.format(updateQry, updateData);
			sqlGetCall(updateQry, function (result) {
				console.log(result);
			});
		} else {
			var accessQry = "INSERT INTO ACCESS_LOG (??,??,??,??,??,??,`LOC_ACCESS_DATE`) VALUES (?,?,?,?,?,?,NOW())";
			var accessData = ['LOC_EMAIL_ID', 'LOC_ACCESS_SOURCE', 'LOC_IP_ADDRESS', 'LOC_SESSION_ID', 'LOC_SESSION_ACTIVE', 'LOC_ATTEMP_COUNT', data.LOC_USER_EMAIL, data.platform, data.access_ip, data.session.sessionVal, 1, data.session.count];
			accessQry = mysql.format(accessQry, accessData);
			//console.log(accessQry);
			sqlGetCall(accessQry, function (result) {
				console.log(result);
			});
		}
	})

	/*connection.query(checkSession,function(errr,results){
		console.log(results);
		if(results.length > 0){
			var updateQry = 'UPDATE ACCESS_LOG SET ??=?,??=?,??=? WHERE ??=?';
			var updateData = ['LOC_ACCESS_SOURCE',data.platform,'LOC_IP_ADDRESS',data.access_ip,'LOC_ATTEMP_COUNT',data.session.count, 'LOC_ACCESS_ID',results[0].LOC_ACCESS_ID];
			updateQry = mysql.format(updateQry,updateData);
			console.log(updateQry)
			connection.query(updateQry, function(err, result){
				console.log(result);
			});
		} else {
			var accessQry = "INSERT INTO ACCESS_LOG (??,??,??,??,??,??,`LOC_ACCESS_DATE`) VALUES (?,?,?,?,?,?,NOW())";
			var accessData = ['LOC_EMAIL_ID','LOC_ACCESS_SOURCE','LOC_IP_ADDRESS','LOC_SESSION_ID','LOC_SESSION_ACTIVE','LOC_ATTEMP_COUNT', data.LOC_USER_EMAIL, data.platform, data.access_ip,data.session.sessionVal,1,data.session.count];
			accessQry = mysql.format(accessQry,accessData);
			console.log(accessQry);
			connection.query(accessQry, function(err, result){
				console.log(result);
			});
		}
	});*/
}

router.post('/userenquiry', function (req, res) {
	var chkQry = "SELECT * FROM USER_ENQUIRY WHERE ??=? AND ??=? AND ??=?";
	var cheQryData = ['LOC_USER_ID', req.body.u_id, 'LOC_SELECTED_COURSE', req.body.u_cid, 'LOC_SELECTED_LOCATION', req.body.u_lid];
	chkQry = mysql.format(chkQry, cheQryData);
	connection.query(chkQry, function (errr, results) {
		if (results.length < 1) {
			var query = 'INSERT into USER_ENQUIRY (??,??,??,??) values (?,?,?,?)';
			var data = ['LOC_USER_ID', 'LOC_SELECTED_COURSE', 'LOC_SELECTED_LOCATION', 'LOC_BATCH_STATUS', req.body.u_id, req.body.u_cid, req.body.u_lid, 0];
			query = mysql.format(query, data);
			console.log(query);
			connection.query(query, function (err, result) {
				var x = {};
				x.enquiry_id = result.insertId;
				res.json({ status: true, message: 'User Enquiry Added Successfully', result: x });
			});
		} else {
			res.json({ status: false, message: 'Enquiry Already Exist', result: results[0] });
		}
	});
});

router.get('/searchenquiry/:enqid', function (req, res) {
	var searchQry = 'SELECT * from USER_ENQUIRY where ?? like ?';
	var searchQryData = ['LOC_ENQ_ID', req.params.enqid];
	searchQry = mysql.format(searchQry, searchQryData);
	connection.query(searchQry, function (err, results) {
		console.log(results[0]);
		if (results.length >= 1) {
			var queryLC, queryLCData;
			if (results[0].LOC_BATCH_STATUS == 0) {
				queryLC = 'SELECT * from INSTITUTE_REGISTRATION where find_in_set(?,??) <> 0 and find_in_set(?,??) <> 0';
				queryLCData = [results[0].LOC_SELECTED_COURSE, 'LOC_INST_OFFER_COURSE', results[0].LOC_SELECTED_LOCATION, 'LOC_INST_OFFER_LOCATION'];
				queryLC = mysql.format(queryLC, queryLCData);
				console.log(queryLC);
			} else {
				queryLC = 'SELECT e.LOC_TRANX_ID, i.LOC_INST_ID, i.LOC_INST_NAME,i.LOC_INST_ADDRESS, i.LOC_INST_CITY, i.LOC_INST_CONTACT, i.LOC_INST_ALTCONTACT, i.LOC_INST_EMAIL, i.LOC_INST_IMG, i.LOC_INST_ABOUT,i.LOC_INST_DESC, e.LOC_INST_MESSAGE, e.LOC_INST_ENQUIRED, e.LOC_INST_CONTACTED inst_contacted, e.LOC_INST_STUDENT FROM ENQUIRY_TRANX e INNER JOIN INSTITUTE_REGISTRATION i ON e.LOC_INST_ID = i.LOC_INST_ID WHERE ??=?';
				queryLCData = ['LOC_ENQ_ID', req.params.enqid];
				queryLC = mysql.format(queryLC, queryLCData);
				console.log(queryLC);
			}
			connection.query(queryLC, function (e, r) {
				console.log(r);
				res.json({ status: true, response: r });
			});
		} else {
			res.json({ status: false, response: "No Matching Found" });
		}
	});

});

router.get('/usertransaction', function (req, res) {
	var searchQry = 'SELECT * from USER_ENQUIRY where ?? = ?';
	var searchQryData = ['LOC_BATCH_STATUS', 0];
	searchQry = mysql.format(searchQry, searchQryData);
	//console.log(searchQry);
	connection.query(searchQry, function (err, results) {
		//console.log(results);
		if (results.length >= 1) {
			results.forEach(function (i, v) {
				//console.log(i.id);
				var queryLC = 'SELECT LOC_INST_ID from INSTITUTE_REGISTRATION where find_in_set(?,??) <> 0 and find_in_set(?,??) <> 0';
				var queryLCData = [i.LOC_SELECTED_COURSE, 'LOC_INST_OFFER_COURSE', i.LOC_SELECTED_LOCATION, 'LOC_INST_OFFER_LOCATION'];
				queryLC = mysql.format(queryLC, queryLCData);
				console.log(queryLC);
				connection.query(queryLC, function (e, institutes) {
					//console.log(r);
					institutes.forEach(function (value, key) {
						console.log(value);
						var query = 'INSERT into ENQUIRY_TRANX (??,??,??,??,??) values (?,?,?,?,?)';
						var data = ['LOC_ENQ_ID', 'LOC_INST_ID', 'LOC_INST_ENQUIRED', 'LOC_INST_CONTACTED', 'LOC_INST_STUDENT', i.LOC_ENQ_ID, value.LOC_INST_ID, 1, 0, 0];
						query = mysql.format(query, data);

						connection.query(query, function (err, result) {
							//console.log(result);
						});

					});


				});

				var query = 'UPDATE USER_ENQUIRY SET ??=? WHERE ??=?';
				var data = ['LOC_BATCH_STATUS', '1', 'LOC_ENQ_ID', i.LOC_ENQ_ID];
				query = mysql.format(query, data);
				connection.query(query, function (err, result) {
					//res.json({status:true, response: "Batch execution Successfully."});
				});
			})

			res.json({ status: true, response: "Batch Executed Successfully." });

		} else {
			res.json({ status: false, response: "No Matching Found" });
		}
	});
});

router.get('/userenquiries/:userid', function (req, res) {
	console.log(req.params.userid);
	var enuryQry = 'SELECT LOC_ENQ_ID, LOC_BATCH_STATUS as batch from USER_ENQUIRY WHERE ??=? ORDER BY LOC_ENQ_CREATE_TIME DESC';
	var enuryData = ['LOC_USER_ID', req.params.userid];
	enuryQry = mysql.format(enuryQry, enuryData);
	console.log(enuryQry);
	connection.query(enuryQry, function (err, results) {
		if (results.length >= 1) {
			res.json({ status: true, result: results });
		} else {
			res.json({ status: false, result: "No Matching Found" });
		}
	});
});

router.get('/userinfo/:usrid', function (req, res) {
	//console.log(req.params.usrid);
	//var usrQry = 'SELECT * from user_registration WHERE ??=?';
	var usrQry = 'SELECT * FROM USER_REGISTRATION ureg, USER_ADDITIONAL_INFO uselect where ureg.LOC_USER_ID = uselect.LOC_USER_ID AND ??=?';
	var usrData = ['ureg.LOC_USER_ID', req.params.usrid];
	usrQry = mysql.format(usrQry, usrData);
	//console.log(usrQry);
	connection.query(usrQry, function (err, results) {
		//console.log(results);
		if (results.length >= 1) {
			delete results[0].user_pwd;
			res.json({ status: true, result: results[0] });
		} else {
			res.json({ status: false, result: "No Matching Found" });
		}
	});
});

router.get('/usermessage/:transactionId', function (req, res) {
	var usrQry = 'SELECT LOC_INST_MESSAGE from ENQUIRY_TRANX WHERE ??=?';
	var usrData = ['LOC_TRANX_ID', req.params.transactionId];
	usrQry = mysql.format(usrQry, usrData);
	console.log(usrQry);
	connection.query(usrQry, function (err, results) {
		console.log(results);
		if (results.length >= 1) {
			res.json({ status: true, result: results[0].LOC_INST_MESSAGE });
		} else {
			res.json({ status: false, result: "No Message Available" });
		}
	});
});

/*	Update Username   */
router.put('/updateusername', function (req, res) {
	var usrQry = 'SELECT * from user_selection WHERE ??=?';
	var usrData = ['user_id', req.body.uid];
	usrQry = mysql.format(usrQry, usrData);
	console.log(usrQry);
	connection.query(usrQry, function (err, results) {
		console.log(results);
		if (results.length >= 1) {
			var updateQry = 'UPDATE user_selection SET ??=? WHERE ??=?';
			var updateData = ['username', req.body.username, 'user_id', req.body.uid];
			updateQry = mysql.format(updateQry, updateData);
			console.log(updateQry);
			connection.query(updateQry, function (er, resp) {
				if (results.length >= 1) {
					res.json({ status: true, result: "Updated Successfully" })
				}
			});
		} else {
			res.json({ status: false, result: "User doesn't exist" });
		}
	});
});

router.put('/updateUserPreference', function (req, res) {
	var usrQry = 'SELECT * from USER_ADDITIONAL_INFO WHERE ??=?';
	var usrData = ['LOC_USER_ID', req.body.uid];
	usrQry = mysql.format(usrQry, usrData);
	//console.log(usrQry);
	sqlGetCall(usrQry, function (results) {
		console.log(results);
		if (results.length >= 1) {
			var updateQry = 'UPDATE USER_ADDITIONAL_INFO SET ??=?,??=?,??=? WHERE ??=?';
			var updateData = ['LOC_USER_SUB_MSG', req.body.msg, 'LOC_USER_SUB_CALL', req.body.call, 'LOC_USER_SUB_MAIL', req.body.mail, 'LOC_INC_ID', results[0].LOC_INC_ID];
			updateQry = mysql.format(updateQry, updateData);
			sqlGetCall(updateQry, function (resp) {
				if (results.length >= 1) {
					res.json({ status: true, result: "Updated Preferences Successfully" })
				}
			});
		} else {
			res.json({ status: false, result: "User doesn't exist" });
		}
	});

	/*connection.query(usrQry,function(err,results){
		console.log(results);
		if(results.length>=1){
			var updateQry = 'UPDATE user_selection SET ??=?,??=?,??=? WHERE ??=?';
			var updateData = ['subscribe_message',req.body.msg,'subscribe_call',req.body.call,'subscribe_mail',req.body.mail,'user_id',req.body.uid];
			updateQry = mysql.format(updateQry,updateData);
			console.log(updateQry);
			connection.query(updateQry,function(er,resp){
				if(results.length>=1){
					res.json({status:true, result: "Updated Successfully"})
				}
			});
		}else{
			res.json({status:false, result: "User doesn't exist"});
		}
	});*/
});

router.put('/updatepassword', function (req, res) {
	var usrQry = 'SELECT * from user_registration WHERE ??=? AND ??=?';
	var usrData = ['user_id', req.body.uid, 'user_pwd', md5(req.body.u_old_pwd)];
	usrQry = mysql.format(usrQry, usrData);
	console.log(usrQry);
	connection.query(usrQry, function (err, results) {
		console.log(results);
		if (results.length >= 1) {
			var updateQry = 'UPDATE user_registration SET ??=? WHERE ??=?';
			var updateData = ['user_pwd', md5(req.body.u_new_pwd), 'user_id', req.body.uid];
			updateQry = mysql.format(updateQry, updateData);
			console.log(updateQry);
			connection.query(updateQry, function (er, resp) {
				if (results.length >= 1) {
					res.json({ status: true, result: "Password Updated Successfully" })
				}
			});
		} else {
			res.json({ status: false, result: "User information doesn't match. Kindly re verify" });
		}
	});
});

router.get('/oldenquiryinfo/:val', function (req, res) {
	var usrQry = 'SELECT * from USER_ENQUIRY WHERE ??=?';
	var usrData = ['LOC_USER_ID', req.params.val];
	usrQry = mysql.format(usrQry, usrData);
	console.log(usrQry);
	connection.query(usrQry, function (err, results) {
		if (results.length >= 1) {
			var Qry = 'SELECT r.LOC_USER_ID, c.LOC_COURSE_ID as course_id, c.LOC_COURSE_IMAGE, c.LOC_COURSE_NAME, l.LOC_LOCATION_ID, l.LOC_LOCATION_NAME, l.LOC_LOCATION_RELEVANCE_NAME,l.LOC_LOCATION_CITY,l.LOC_LOCATION_STATE, l.LOC_LOCATION_PINCODE, r.LOC_ENQ_ID as enquiry_id, r.LOC_BATCH_STATUS as batch, cast(r.LOC_ENQ_CREATE_TIME as Date) as datetime from USER_ENQUIRY r , OFFERED_COURSES c, OFFERED_LOCATIONS l where c.LOC_COURSE_ID = r.LOC_SELECTED_COURSE AND l.LOC_LOCATION_ID=r.LOC_SELECTED_LOCATION AND r.LOC_USER_ID=? order by r.LOC_ENQ_CREATE_TIME asc';
			var Data = [req.params.val];
			Qry = mysql.format(Qry, Data);

			connection.query(Qry, function (er, resp) {
				if (results.length >= 1) {
					res.json({ status: true, result: resp });
				} else {
					res.json({ status: false, result: "Issue with your User Account" });
				}
			});
		} else {
			res.json({ status: false, result: "There is no enquiry made by you before kindly go ahead and create some." });
		}
	});

});

router.put('/updatePersonalInfo', function (req, res) {
	var usrQry = 'SELECT * from USER_ADDITIONAL_INFO WHERE ??=?';
	var usrData = ['LOC_USER_ID', req.body.uid];
	usrQry = mysql.format(usrQry, usrData);
	sqlGetCall(usrQry, function (results) {
		if (results.length >= 1) {
			var updateQry = 'UPDATE USER_ADDITIONAL_INFO SET ??=?,??=?,??=?,??=? WHERE ??=?';
			var updateData = ['LOC_USER_PERMANENT_ADDRESS', req.body.permanent_address, 'LOC_USER_CURRENT_ADDRESS', req.body.current_address, 'LOC_USER_CITY', req.body.current_city, 'LOC_USER_STATE', req.body.current_state, 'LOC_INC_ID', results[0].LOC_INC_ID];
			updateQry = mysql.format(updateQry, updateData);
			console.log(updateQry);
			sqlGetCall(updateQry, function (resp) {
				if (results.length >= 1) {
					res.json({ status: true, result: "Updated Successfully" })
				}
			});
		} else {
			res.json({ status: false, result: "User doesn't exist" });
		}
	});
});


function sqlGetCall(query, callback) {
	if (query) {
		connection.query(query, function (err, res) {
			setTimeout(function () {
				if (err) {
					callback(err);
				}
				callback(res);
			}, 100);
		});
	}
}

module.exports = router;
