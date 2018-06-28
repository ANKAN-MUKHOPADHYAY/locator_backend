var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('./dbconnection');


/* GET home page. */
/*router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Warm welcome from TechNinzaz' });
  res.json({status:true, message: 'Hey Welcome'})
});*/

router.post('/addnewcourse', function(req,res){
	//console.log(query);
	var chkQry = 'SELECT * from OFFERED_COURSES where ??=?';
	var cheQryData = ['LOC_COURSE_NAME',req.body.course_name];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry, function(errr,results){
		//console.log(results);
		if(results.length<1){
				var query = 'INSERT into OFFERED_COURSES (??,??,??,??) Values (?,?,?,?)';
				var data = ['LOC_COURSE_NAME','LOC_COURSE_IMAGE','LOC_COURSE_ACTIVE_STATUS','LOC_COURSE_CREATED_BY',req.body.course_name,req.body.imageurl,req.body.course_status,req.body.createdby];
				query = mysql.format(query,data);
				//console.log(query);
				connection.query(query, function(err,result){
					//console.log(result);
					res.json({status: true, message:'Course Created Successfully'});
				});
		} else {
			res.json({status: false, message:'Course Already Exist', result: results[0]});
		}

	});
	//console.log(req.body);

	//res.json({status:true, message: 'Success Response', result: {fname:'Jagan',lname:'Mohan'}})
});


router.post('/addlocation',function(req,res){
	var chkQry = "SELECT * FROM OFFERED_LOCATIONS WHERE ??=? AND ??=?";
	var cheQryData = ['LOC_LOCATION_NAME',req.body.location_name,'LOC_LOCATION_PINCODE',req.body.location_pincode];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
				var query = 'INSERT into OFFERED_LOCATIONS (??,??,??,??,??,??,??) values (?,?,?,?,?,?,?)';
				var data = ['LOC_LOCATION_NAME','LOC_LOCATION_RELEVANCE_NAME','LOC_LOCATION_NEARBY','LOC_LOCATION_CITY','LOC_LOCATION_STATE','LOC_LOCATION_PINCODE','LOC_LOCATION_CREATED_BY',req.body.location_name,req.body.location_relevant_name,req.body.location_nearby,req.body.location_city,req.body.location_state,req.body.location_pincode,req.body.location_createdby];

				query = mysql.format(query,data);
				//console.log(query);
				connection.query(query,function(err,result){
					res.json({status: true, message: 'Location Created Successfully'});
				});
		}else{
			res.json({status: false,message: 'Location Aleady Exist',result: results[0]});
		}
	});
});


module.exports = router;
