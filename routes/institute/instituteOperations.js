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

router.post('/addinstitute', function(req,res){
	console.log("you are here");
	var chkQry = "SELECT * FROM institute_registration WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['inst_name',req.body.i_name,'inst_contact',req.body.i_contact,'inst_altcontact',req.body.i_altcontact,'inst_email',req.body.i_email];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into institute_registration (??,??,??,??,??,??,??) values (?,?,?,?,?,?,?)';
			var data = ['inst_name','inst_address','inst_city','inst_contact','inst_altcontact','inst_email','inst_images',req.body.i_name,req.body.i_address,req.body.i_city,req.body.i_contact,req.body.i_altcontact,req.body.i_email,req.body.i_images];
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

router.post('/addinstitute', function(req,res){
	var chkQry = "SELECT * FROM institute_registration WHERE ??=? OR ??=? OR ??=?";
	var cheQryData = ['inst_name',req.body.i_name,'inst_contact',req.body.i_contact,'inst_altcontact',req.body.i_altcontact,'inst_email',req.body.i_email];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	connection.query(chkQry,function(errr,results){
		if(results.length<1){
			var query = 'INSERT into institute_registration (??,??,??,??,??,??,??) values (?,?,?,?,?,?,?)';
			var data = ['inst_name','inst_address','inst_city','inst_contact','inst_altcontact','inst_email','inst_images',req.body.i_name,req.body.i_address,req.body.i_city,req.body.i_contact,req.body.i_altcontact,req.body.i_email,req.body.i_images];
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
				x.user_id = result.insertId;
				res.json({status: true, message: 'Institute Updated Successfully',result: x});	

			});
		}else{
			res.json({status: false,message: 'Institute Not Exist',result: results[0]});
		}
	});
}); 



router.get('/searchstudents/:cid/:lid', function(req,res){
	var searchQry = 'SELECT * from user_enquiry where ?? like ?';
	var searchQryData = ['id',req.params.enqid];
	searchQry = mysql.format(searchQry,searchQryData);
	connection.query(searchQry,function(err,results){
		console.log(results);
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


module.exports = router;
