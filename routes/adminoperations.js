var express = require('express');
var mysql = require('mysql');
var router = express.Router();

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

router.post('/addnewcourse', function(req,res){
	//console.log(query);
	var chkQry = 'SELECT * from offered_courses where ??=?';
	var cheQryData = ['course_name',req.body.course_name];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry, function(errr,results){
		//console.log(results);
		if(results.length<1){
			var queryMax = 'SELECT MAX(id)+1 as nid from offered_courses';
			connection.query(queryMax, function(e,r){
				//console.log(r);
				var newCoureID = 'L0000'+ r[0].nid;
				//console.log(result);
				var query = 'INSERT into offered_courses (??,??,??) Values (?,?,?)';
				var data = ['course_id','course_name','course_status',newCoureID,req.body.course_name,req.body.course_status];
				query = mysql.format(query,data);
				//console.log(query);
				connection.query(query, function(err,result){
					//console.log(result);
					res.json({status: true, message:'Course Created Successfully'});
				});
			});
			
			
		} else {
			res.json({status: false, message:'Course Already Exist', result: results[0]});
		}
		
	});
	//console.log(req.body);
	
	//res.json({status:true, message: 'Success Response', result: {fname:'Jagan',lname:'Mohan'}})
});


router.post('/addlocation',function(req,res){
	var chkQry = "SELECT * FROM offered_locations WHERE ??=? AND ??=?";
	var cheQryData = ['location_name',req.body.l_name,'location_pincode',req.body.l_pincode];
	chkQry = mysql.format(chkQry,cheQryData);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var queryMax = 'SELECT max(id+1) as lid from offered_locations';
			connection.query(queryMax,function(e,r){
				var newLocationID = 'LOC00'+ r[0].lid;
				var query = 'INSERT into offered_locations (??,??,??,??,??,??,??) values (?,?,?,?,?,?,?)';
				var data = ['location_id','location_name','location_relevant_name','location_city','location_state','location_pincode','location_nearby',newLocationID,req.body.l_name,req.body.lr_name,req.body.l_city,req.body.l_state,req.body.l_pincode,req.body.l_nearby];

				query = mysql.format(query,data);
				//console.log(query);
				connection.query(query,function(err,result){
					res.json({status: true, message: 'Location Created Successfully'});	
				});
			});
		}else{
			res.json({status: false,message: 'Location Aleady Exist',result: results[0]});
		}
	});
});


module.exports = router;
