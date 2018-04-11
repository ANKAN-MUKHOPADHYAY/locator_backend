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

router.post('/addinstitute', function(req,res){
	//console.log("you are here");
	var chkQry = "SELECT * FROM institute_registration WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['inst_name',req.body.i_name,'inst_contact',req.body.i_contact,'inst_email',req.body.i_email];
	chkQry = mysql.format(chkQry,cheQryData);
	//console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into institute_registration (??,??,??,??,??,??,??,??) values (?,?,?,?,?,?,?,?)';
			var data = ['inst_name','inst_address','inst_city','inst_contact','inst_altcontact','inst_email','inst_password','inst_images',req.body.i_name,req.body.i_address,req.body.i_city,req.body.i_contact,req.body.i_altcontact,req.body.i_email,md5(req.body.i_password),req.body.i_images];
			query = mysql.format(query,data);
			console.log(query);
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
	var chkQry = "SELECT * FROM institute_registration WHERE ??=?";
	var cheQryData = ['id',req.body.i_id];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1 && (req.body.i_type=='location' || req.body.i_type=='course')){
			var query = 'update institute_registration set ??=? where ??=?';
			if(req.body.i_type=='location'){
				var data = ['inst_prefer_locations',req.body.i_lc,'id',req.body.i_id];	
			}else{
				var data = ['inst_off_courses',req.body.i_lc,'id',req.body.i_id];	
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
	var searchQry = 'SELECT * from user_enquiry where ??=? AND ?? = ?';
	var searchQryData = ['course_id',req.params.cid, 'location_id', req.params.lid];
	searchQry = mysql.format(searchQry,searchQryData);
	connection.query(searchQry,function(err,results){
		//console.log(results);
		if(results.length>=1){
			var query1 = "SELECT et.enq_id, GROUP_CONCAT(DISTINCT et.inst_id) as institute_received, loc.location_name, loc.id as location_id, loc.location_city, loc.location_state,course.course_name, course.id as course_id, ue.user_id, ur.user_first_name, ur.user_last_name, ur.user_mobile_number, ur.user_altmobile_number, ur.user_email, ur.user_type, ue.course_id, ue.datetime, ue.location_id FROM user_enquiry ue, enquiry_trans et, user_registration ur, offered_locations loc, offered_courses course WHERE ?? = ?? AND ?? = ? AND ?? = ? AND ?? = ?? GROUP BY ue.user_id";
			var query1Data = ["ue.id", "et.enq_id", "ue.course_id", req.params.cid, "ue.location_id", req.params.lid, "ue.user_id", "ur.user_id"];
			query1 = mysql.format(query1, query1Data);
			console.log('----------');
			console.log(query1);
			connection.query(query1, function(e, r){
				if(e) {
					res.json({status: false, response: e});
				} else {
					/*r.forEach(function(i,k){
						var queryCourse = "SELECT * FROM offered_locations WHERE ?? = ?";
						var queryCourseData = ['id', i.course_id];
						queryCourse = mysql.format(queryCourseData);
						connection.query(queryCourse, function(eC, rC){
							console.log('-----------');
							console.log(rC);
							//r[i].CourseInfoDetail = rC;
							//console.log(r[i]);
						});
					});*/
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
	var chkQry = "SELECT * FROM institute_registration WHERE ??=? OR ??=? AND ??=?";
	var cheQryData = ['inst_contact',req.body.i_loginparams,'inst_email',req.body.i_loginparams,'inst_password',md5(req.body.i_password)];
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
		col = "inst_enquired";
		searchQry = "SELECT r.user_id as userid, t.tranx_id as transactionid, t.enq_id as enquiryid, t.inst_message as message, r.user_first_name as firstname,r.user_last_name as lastname,r.user_mobile_number as mobile, r.user_email as email,r.user_type as usertype, c.course_id as courseid, c.course_name as coursename, l.location_id, l.location_name,l.location_relevant_name,l.location_city,l.location_state, l.location_pincode,l.location_nearby from enquiry_trans t, user_enquiry e, user_registration r , offered_courses c, offered_locations l where t.enq_id = e.id AND e.user_id = r.user_id AND e.course_id=c.id AND e.location_id=l.id AND ?? = ? AND ??=? AND ??=? AND ??=? order by e.datetime desc";
		searchQryData = ['inst_id',req.params.instid,col,1,'inst_contacted',0,'inst_student',0];
	}else if(req.params.type=='contact'){
		col = "inst_contacted";
		searchQry = "SELECT r.user_id as userid, t.tranx_id as transactionid, t.enq_id as enquiryid, t.inst_message as message, r.user_first_name as firstname,r.user_last_name as lastname,r.user_mobile_number as mobile, r.user_email as email,r.user_type as usertype, c.course_id as courseid, c.course_name as coursename, l.location_id, l.location_name,l.location_relevant_name,l.location_city,l.location_state, l.location_pincode,l.location_nearby from enquiry_trans t, user_enquiry e, user_registration r , offered_courses c, offered_locations l where t.enq_id = e.id AND e.user_id = r.user_id AND e.course_id=c.id AND e.location_id=l.id AND ?? = ? AND ??=? AND ??=? order by e.datetime desc"
		searchQryData = ['inst_id',req.params.instid,'inst_contacted',1,'inst_student',0];
	}else if(req.params.type=='student'){
		col = "inst_student";
		searchQry = "SELECT r.user_id as userid, t.tranx_id as transactionid, t.enq_id as enquiryid, t.inst_message as message, r.user_first_name as firstname,r.user_last_name as lastname,r.user_mobile_number as mobile, r.user_email as email,r.user_type as usertype, c.course_id as courseid, c.course_name as coursename, l.location_id, l.location_name,l.location_relevant_name,l.location_city,l.location_state, l.location_pincode,l.location_nearby from enquiry_trans t, user_enquiry e, user_registration r , offered_courses c, offered_locations l where t.enq_id = e.id AND e.user_id = r.user_id AND e.course_id=c.id AND e.location_id=l.id AND ?? = ? AND ??=? order by e.datetime desc"
		searchQryData = ['inst_id',req.params.instid,'inst_student',1];
	}else{
		res.json({status:false, response: "Wrong "+type+" value"});	
	}

	//searchQryData = ['inst_id',req.params.instid,col,1];
	searchQry = mysql.format(searchQry,searchQryData);
	console.log(searchQry);
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

	var chkQry = "SELECT * FROM enquiry_trans WHERE ??=? AND ?? = ?";

	if(req.body.type=='enquiry'){
		col = "inst_enquired";
		console.log(col);
	}else if(req.body.type=='contact'){
		col = "inst_contacted";
	}else if(req.body.type=='student'){
		col = "inst_student";
	}else{
		res.json({status:false, response: "Wrong "+type+" value"});	
	}
	var cheQryData = ['tranx_id',req.body.trans_id,col,0];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1){

			var query = 'update enquiry_trans set ??=? where ??=?';
			var data = [col,1,'tranx_id',req.body.trans_id];	
			query = mysql.format(query,data);
			console.log(query);
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
	var chkQry = "SELECT * FROM enquiry_trans WHERE ??=?";
	var cheQryData = ['tranx_id',req.body.transactionid];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length==1){
			var query = 'update enquiry_trans set ??=? where ??=?';
			var	data = ['inst_message',req.body.message,'tranx_id',req.body.transactionid];	
			
			query = mysql.format(query,data);
			console.log(query);
			connection.query(query,function(err,result){
				res.json({status: true, message: 'Institute Message Updated Successfully'});	 
			});
		}else{
			res.json({status: false,message: 'Enquiry having some problem. Try again later'});
		}
	});
});

router.post('/offerings',function(req,res){
	var chkQry = "SELECT * FROM institute_registration WHERE ??=?";
	var cheQryData = ['id',req.body.i_id];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		var query;
		var query1Data;
		if(results.length==1 && req.body.i_type=='course'){
			query = 'SELECT b.*, "true" as opted FROM institute_registration a INNER JOIN offered_courses b ON FIND_IN_SET(b.id, a.inst_off_courses) > 0 WHERE a.id=?';
			query1Data = [req.body.i_id];
		} else if(results.length==1 && req.body.i_type=='location'){
			query = 'SELECT b.*, "true" as opted FROM institute_registration a INNER JOIN offered_locations b ON FIND_IN_SET(b.id, a.inst_prefer_locations) > 0 WHERE a.id=?';
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
	var chkQry = "SELECT * FROM institute_registration WHERE ??=?";
	var cheQryData = ['id',req.params.instid];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry,function(errr,results){
		console.log(results);
		var locationQry,courseQry;
		var locquery1Data,coursequery1Data;
		if(results.length==1){
			courseQry = 'SELECT b.*, "true" as opted FROM institute_registration a INNER JOIN offered_courses b ON FIND_IN_SET(b.id, a.inst_off_courses) > 0 WHERE a.id=?';
			coursequery1Data = [req.params.instid];
			
			locationQry = 'SELECT b.*, "true" as opted FROM institute_registration a INNER JOIN offered_locations b ON FIND_IN_SET(b.id, a.inst_prefer_locations) > 0 WHERE a.id=?';
			locquery1Data = [req.params.instid];

			courseQry = mysql.format(courseQry, coursequery1Data);
			connection.query(courseQry,function(er,result){
				delete results[0].inst_off_courses;
				delete results[0].inst_prefer_locations;
				delete results[0].inst_password;

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

module.exports = router;
