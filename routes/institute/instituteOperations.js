var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../dbconnection');
var md5 = require('md5');

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
				res.json({status: true, message: 'Institute Added Successfully',result: x});

			});
		}else{
			res.json({status: false,message: 'Institute Already Exist',result: results[0]});
		}
	});
});

router.post('/updatelc', function(req,res){
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=?";
	var cheQryData = ['LOC_INST_ID',req.body.i_id];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1 && (req.body.i_type=='location' || req.body.i_type=='course')){
			var query = 'update INSTITUTE_REGISTRATION set ??=? where ??=?';
			if(req.body.i_type=='location'){
				var data = ['LOC_INST_OFFER_LOCATION',req.body.i_lc,'LOC_INST_ID',req.body.i_id];
			}else{
				var data = ['LOC_INST_OFFER_COURSE',req.body.i_lc,'LOC_INST_ID',req.body.i_id];
			}

			query = mysql.format(query,data);
			//console.log(query);
			connection.query(query,function(err,result){
				//console.log(result);
				var x = {};
				x.user_id = req.body.i_id;
				res.json({status: true, message: 'Institute Updated Successfully',result: x});

			});
		}else{
			res.json({status: false,message: 'Institute Not Exist',result: results[0]});
		}
	});
});

router.get('/searchstudents/:cid/:lid', function(req,res){
	var searchQry = 'SELECT * from USER_ENQUIRY where ??=? AND ?? = ?';
	var searchQryData = ['LOC_SELECTED_COURSE',req.params.cid, 'LOC_SELECTED_LOCATION', req.params.lid];
	searchQry = mysql.format(searchQry,searchQryData);
	//console.log(searchQry)
	connection.query(searchQry,function(err,results){
		console.log(results);
		if(results.length>=1){
			var query1 = "SELECT et.LOC_ENQ_ID, GROUP_CONCAT(DISTINCT et.LOC_INST_ID) as institute_received, loc.LOC_LOCATION_NAME, loc.LOC_LOCATION_ID, loc.LOC_LOCATION_CITY, loc.LOC_LOCATION_STATE, course.LOC_COURSE_NAME, course.LOC_COURSE_ID, ue.LOC_USER_ID, ur.LOC_USER_FNAME, ur.LOC_USER_LNAME, ur.LOC_USER_MOBILE, ur.LOC_USER_ALT_CONTACT, ur.LOC_USER_EMAIL, ur.LOC_USER_TYPE, ue.LOC_SELECTED_COURSE, ue.LOC_ENQ_CREATE_TIME, ue.LOC_SELECTED_LOCATION FROM USER_ENQUIRY ue, ENQUIRY_TRANX et, USER_REGISTRATION ur, OFFERED_LOCATIONS loc, OFFERED_COURSES course WHERE ?? = ?? AND ?? = ? AND ?? = ? AND ?? = ?? GROUP BY ue.LOC_USER_ID";
			var query1Data = ["ue.LOC_ENQ_ID", "et.LOC_ENQ_ID", "ue.LOC_SELECTED_COURSE", req.params.cid, "ue.LOC_SELECTED_LOCATION", req.params.lid, "ue.LOC_USER_ID", "ur.LOC_USER_ID"];
			query1 = mysql.format(query1, query1Data);
			console.log('----------');
			console.log(query1);
			connection.query(query1, function(e, r){
				if(e) {
					res.json({status: false, response: e});
				} else {
					r.forEach(function(i,k){
						//console.log(sessionStorage.getItem('logged_in'));
						//console.log;
						console.log(i.LOC_USER_MOBILE);
					});
					res.json({status: true, response: r});
				}
			});
		}else{
			res.json({status:false, response: "No Matching Found"});
		}
	});
});

router.post('/loginInstitute', function(req,res){
	//console.log("you are here");
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=? OR ??=? AND ??=?";
	var cheQryData = ['LOC_INST_CONTACT',req.body.i_loginparams,'LOC_INST_EMAIL',req.body.i_loginparams,'LOC_INST_PWD',md5(req.body.i_password)];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		//console.log(results);
		if(results.length>1){
			res.json({status: false, message: 'Institute Details exist more than one'});
		}else{
			/*delete(results[0].inst_off_courses);
			delete(results[0].inst_prefer_locations);
			delete(results[0].inst_password);*/
			res.json({status: true,message: 'Institute Login Successful',result: results[0]});
		}
	});
});


router.get('/receivedleads/:type/:instid', function(req,res){
	var searchQry ;

	var col = '';
	var searchQryData;

	if(req.params.type=='enquiry'){
		col = "LOC_INST_ENQUIRED";
		searchQry = "SELECT r.LOC_USER_ID as userid, t.LOC_TRANX_ID as transactionid, t.LOC_ENQ_ID as enquiryid, t.LOC_INST_MESSAGE as message, r.LOC_USER_FNAME as firstname,r.LOC_USER_LNAME as lastname,r.LOC_USER_MOBILE as mobile, r.LOC_USER_EMAIL as email,r.LOC_USER_TYPE as usertype, c.LOC_COURSE_ID as courseid, c.LOC_COURSE_NAME as coursename, l.LOC_LOCATION_ID, l.LOC_LOCATION_NAME,l.LOC_LOCATION_RELEVANCE_NAME,l.LOC_LOCATION_CITY,l.LOC_LOCATION_STATE, l.LOC_LOCATION_PINCODE from ENQUIRY_TRANX t, USER_ENQUIRY e, USER_REGISTRATION r , OFFERED_COURSES c, OFFERED_LOCATIONS l where t.LOC_ENQ_ID = e.LOC_ENQ_ID AND e.LOC_USER_ID = r.LOC_USER_ID AND e.LOC_SELECTED_COURSE=c.LOC_COURSE_ID AND e.LOC_SELECTED_LOCATION=l.LOC_LOCATION_ID AND ?? = ? AND ??=? AND ??=? AND ??=? order by e.LOC_ENQ_CREATE_TIME	 desc";
		searchQryData = ['LOC_INST_ID',req.params.instid,col,1,'LOC_INST_CONTACTED',0,'LOC_INST_STUDENT',0];
	}else if(req.params.type=='contact'){
		col = "LOC_INST_CONTACTED";
		searchQry = "SELECT r.LOC_USER_ID as userid, t.LOC_TRANX_ID as transactionid, t.LOC_ENQ_ID as enquiryid, t.LOC_INST_MESSAGE as message, r.LOC_USER_FNAME as firstname,r.LOC_USER_LNAME as lastname,r.LOC_USER_MOBILE as mobile, r.LOC_USER_EMAIL as email,r.LOC_USER_TYPE as usertype, c.LOC_COURSE_ID as courseid, c.LOC_COURSE_NAME as coursename, l.LOC_LOCATION_ID, l.LOC_LOCATION_NAME,l.LOC_LOCATION_RELEVANCE_NAME,l.LOC_LOCATION_CITY,l.LOC_LOCATION_STATE, l.LOC_LOCATION_PINCODE from ENQUIRY_TRANX t, USER_ENQUIRY e, USER_REGISTRATION r , OFFERED_COURSES c, OFFERED_LOCATIONS l where t.LOC_ENQ_ID = e.LOC_ENQ_ID AND e.LOC_USER_ID = r.LOC_USER_ID AND e.LOC_SELECTED_COURSE=c.LOC_COURSE_ID AND e.LOC_SELECTED_LOCATION=l.LOC_LOCATION_ID AND ?? = ? AND ??=? AND ??=? order by e.LOC_ENQ_CREATE_TIME	 desc"
		searchQryData = ['LOC_INST_ID',req.params.instid,'LOC_INST_CONTACTED',1,'LOC_INST_STUDENT',0];
	}else if(req.params.type=='student'){
		col = "LOC_INST_STUDENT";
		searchQry = "SELECT r.LOC_USER_ID as userid, t.LOC_TRANX_ID as transactionid, t.LOC_ENQ_ID as enquiryid, t.LOC_INST_MESSAGE as message, r.LOC_USER_FNAME as firstname,r.LOC_USER_LNAME as lastname,r.LOC_USER_MOBILE as mobile, r.LOC_USER_EMAIL as email,r.LOC_USER_TYPE as usertype, c.LOC_COURSE_ID as courseid, c.LOC_COURSE_NAME as coursename, l.LOC_LOCATION_ID, l.LOC_LOCATION_NAME,l.LOC_LOCATION_RELEVANCE_NAME,l.LOC_LOCATION_CITY,l.LOC_LOCATION_STATE, l.LOC_LOCATION_PINCODE from ENQUIRY_TRANX t, USER_ENQUIRY e, USER_REGISTRATION r , OFFERED_COURSES c, OFFERED_LOCATIONS l where t.LOC_ENQ_ID = e.LOC_ENQ_ID AND e.LOC_USER_ID = r.LOC_USER_ID AND e.LOC_SELECTED_COURSE=c.LOC_COURSE_ID AND e.LOC_SELECTED_LOCATION=l.LOC_LOCATION_ID AND ?? = ? AND ??=? order by e.LOC_ENQ_CREATE_TIME	 desc"
		searchQryData = ['LOC_INST_ID',req.params.instid,'LOC_INST_STUDENT',1];
	}else{
		res.json({status:false, response: "Wrong "+type+" value"});
	}

	//searchQryData = ['inst_id',req.params.instid,col,1];
	searchQry = mysql.format(searchQry,searchQryData);
	//console.log(searchQry);
	connection.query(searchQry,function(err,results){
		//console.log(results);
		if(results.length>=1){
			res.json({status: true, response:results});

		}else{
			res.json({status:false, response: "No Leads"});
		}
	});
});

router.post('/updateleadstatus/', function(req,res){

	var chkQry = "SELECT * FROM ENQUIRY_TRANX WHERE ??=? AND ?? = ?";

	if(req.body.type=='enquiry'){
		col = "LOC_INST_ENQUIRED";
		//console.log(col);
	}else if(req.body.type=='contact'){
		col = "LOC_INST_CONTACTED";
	}else if(req.body.type=='student'){
		col = "LOC_INST_STUDENT";
	}else{
		res.json({status:false, response: "Wrong "+type+" value"});
	}
	var cheQryData = ['LOC_TRANX_ID',req.body.trans_id,col,0];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1){

			var query = 'update ENQUIRY_TRANX set ??=? where ??=?';
			var data = [col,1,'LOC_TRANX_ID',req.body.trans_id];
			query = mysql.format(query,data);
			//console.log(query);
			//console.log(query);
			connection.query(query,function(err,result){
				//console.log(result);
				res.json({status: true, message: 'Status Updated Successfully'});

			});
		}else{
				res.json({status: false,message: 'Not Found ',result: results[0]});
		}
	});
});

router.post('/sendMessage', function(req,res){
	var chkQry = "SELECT * FROM ENQUIRY_TRANX WHERE ??=?";
	var cheQryData = ['LOC_TRANX_ID',req.body.transactionid];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1){
			var query = 'update ENQUIRY_TRANX set ??=? where ??=?';
			var	data;
			if(results[0].LOC_INST_MESSAGE == null){
				var newMsg =  [];
				newMsg.push(req.body.message);
				data = ['LOC_INST_MESSAGE',JSON.stringify(newMsg),'LOC_TRANX_ID',req.body.transactionid];
			} else {
				var existingMsg = JSON.parse(results[0].LOC_INST_MESSAGE);
				existingMsg.push(req.body.message);
				data = ['LOC_INST_MESSAGE',JSON.stringify(existingMsg),'LOC_TRANX_ID',req.body.transactionid];
			}
			query = mysql.format(query,data);
			//console.log(query);
			connection.query(query,function(err,result){
				res.json({status: true, message: 'Institute Message Updated Successfully'});
			});
		}else{
			res.json({status: false,message: 'Enquiry having some problem. Try again later'});
		}
	});
});

router.post('/offerings',function(req,res){
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=?";
	var cheQryData = ['LOC_INST_ID',req.body.i_id];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		var query;
		var query1Data;
		if(results.length==1 && req.body.i_type=='course'){
			query = 'SELECT b.*, "true" as opted FROM INSTITUTE_REGISTRATION a INNER JOIN OFFERED_COURSES b ON FIND_IN_SET(b.LOC_COURSE_ID, a.LOC_INST_OFFER_COURSE) > 0 WHERE a.LOC_INST_ID=?';
			query1Data = [req.body.i_id];
		} else if(results.length==1 && req.body.i_type=='location'){
			query = 'SELECT b.*, "true" as opted FROM INSTITUTE_REGISTRATION a INNER JOIN OFFERED_LOCATIONS b ON FIND_IN_SET(b.LOC_LOCATION_ID, a.LOC_INST_OFFER_LOCATION) > 0 WHERE a.LOC_INST_ID=?';
			query1Data = [req.body.i_id];
		} else {
			res.json({status: false,message: 'There is some problem'});
		}

		query = mysql.format(query, query1Data);
		connection.query(query,function(er,result){
			res.json({status: true, message: 'Successful', response: result});
		});
	});
});


router.get('/getInstituteInformation/:instid', function(req,res){
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=?";
	var cheQryData = ['LOC_INST_ID',req.params.instid];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry,function(errr,results){
		//console.log(results);
		var locationQry,courseQry;
		var locquery1Data,coursequery1Data;
		if(results.length==1){
			courseQry = 'SELECT b.*, "true" as opted FROM INSTITUTE_REGISTRATION a INNER JOIN OFFERED_COURSES b ON FIND_IN_SET(b.LOC_COURSE_ID, a.LOC_INST_OFFER_COURSE) > 0 WHERE a.LOC_INST_ID=?';
			coursequery1Data = [req.params.instid];

			locationQry = 'SELECT b.*, "true" as opted FROM INSTITUTE_REGISTRATION a INNER JOIN OFFERED_LOCATIONS b ON FIND_IN_SET(b.LOC_LOCATION_ID, a.LOC_INST_OFFER_LOCATION) > 0 WHERE a.LOC_INST_ID=?';
			locquery1Data = [req.params.instid];

			courseQry = mysql.format(courseQry, coursequery1Data);
			connection.query(courseQry,function(er,result){
				delete results[0].LOC_INST_OFFER_COURSE;
				delete results[0].LOC_INST_OFFER_LOCATION;
				delete results[0].LOC_INST_PWD;

				locationQry = mysql.format(locationQry, locquery1Data);
				connection.query(locationQry,function(e,resp){
					results[0].courses = result;
					results[0].location = resp;
					//console.log(results);
					res.json({status: true, message: 'Successful', response: results});
				});
			});
		} else {
			res.json({status: false,message: 'There is some problem'});
		}
	});
});

router.post('/updateInstituteBasicInfo', function(req,res){
	var chkQry = "SELECT * FROM INSTITUTE_REGISTRATION WHERE ??=?";
	var cheQryData = ['LOC_INST_ID',req.body.instid];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log()
	connection.query(chkQry,function(errr,results){
		//console.log(results);
		var updateQry;
		var updateData;
		//var str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
		var inst_about = req.body.LOC_INST_ABOUT.split("\n").join("<br />");
		var inst_desc = req.body.LOC_INST_DESC.split("\n").join("<br />");
		console.log(inst_about);
		if(results.length==1){
			if(req.body.hasOwnProperty('LOC_INST_ABOUT')){
				updateQry = 'UPDATE INSTITUTE_REGISTRATION SET ??=?, ??=?, ??=?,??=?,??=?,??=?,??=? WHERE ??=?';
				updateData = ['LOC_INST_ABOUT',inst_about,'LOC_INST_DESC',inst_desc, 'LOC_INST_CONTACT',req.body.LOC_INST_CONTACT, 'LOC_INST_ALTCONTACT',req.body.LOC_INST_ALTCONTACT,'LOC_INST_EMAIL',req.body.LOC_INST_EMAIL,'LOC_INST_FOUNDER',req.body.LOC_INST_FOUNDER,'LOC_INST_FOUND_DATE', req.body.LOC_INST_FOUND_DATE, 'LOC_INST_ID',req.body.LOC_INST_ID];
				updateQry = mysql.format(updateQry, updateData);
			} else {
				updateQry = 'UPDATE INSTITUTE_REGISTRATION SET ??=?,??=?,??=?,??=?,??=? WHERE ??=?';
				updateData = ['LOC_INST_CONTACT',req.body.LOC_INST_CONTACT,'LOC_INST_ALTCONTACT',req.body.LOC_INST_ALTCONTACT,'LOC_INST_EMAIL', req.body.LOC_INST_EMAIL,'LOC_INST_FOUNDER', req.body.LOC_INST_FOUNDER,'LOC_INST_FOUND_DATE',req.body.LOC_INST_FOUND_DATE,'LOC_INST_ID', req.body.LOC_INST_ID];
				updateQry = mysql.format(updateQry, updateData);
			}
			console.log(updateQry);
			connection.query(updateQry,function(er,result){
				res.json({status: true, message: 'Institute info updated Successfully'});
			});
		} else {
			res.json({status: false,message: 'There is some problem'});
		}
	});
});

module.exports = router;
