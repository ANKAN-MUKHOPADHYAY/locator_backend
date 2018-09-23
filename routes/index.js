var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require('./dbconnection');
var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Warm welcome from TechNinzaz' });
  res.json({status:true, message: 'Hey Welcome'})
});

router.get('/getuserinfo', function(req,res){
	res.json({status:true, message: 'Success Response', result: {fname:'Jagan',lname:'Mohan'}})
});

router.post('/getuserinfo', function(req,res){
  console.log(req.body);
	res.json({status:true, message: 'Success Response', result: {fname:'Jagan',lname:'Mohan'}})
});

router.post('/dummyApi', function(req,res){
  console.log(req.body);

	var chkQry = "SELECT * FROM sample_data WHERE (??=? AND ??=?) OR (??=?)";
	var cheQryData = ['firstname',req.body.firstname,'lastname',req.body.lastname,'id',req.body.userid];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	sqlGetCall(chkQry, function(response){	
    console.log(response);	
		if(response.length<1){
			var query,data;
			if(req.body.type == "PERSONAL_INFO"){
				query = 'INSERT into sample_data (??,??,??,??,??,??) values (?,?,?,?,?,?)';
				data = ['initial','firstname','middlename','lastname','gender', 'dob', req.body.initial, req.body.firstname, req.body.middlename, req.body.lastname, req.body.gender, req.body.dob];
				query = mysql.format(query,data);
      }
			console.log(query);
			sqlGetCall(query, function(resp){
        console.log(resp);
				res.json({status:true, message: 'User Added Successfully', result: resp.insertId});
			});
		} else {
			if(req.body.type == "PERSONAL_INFO"){
				query = 'UPDATE sample_data SET ??=?, ??=?, ??=?, ??=?, ??=?, ??=? WHERE ??=?';
				data = ['initial', req.body.initial,'firstname', req.body.firstname,'middlename', req.body.middlename,'lastname', req.body.lastname,'gender', req.body.gender, 'dob', req.body.dob, 'id',response[0].id];
				query = mysql.format(query,data);
			} 
			//console.log(query);
			sqlGetCall(query, function(resp){
				//console.log(resp);
				res.json({status:true, message: 'User Details Updated Successfully',result: response[0].id });
			});
		}
	});
});

router.post('/dummyApiContact', function(req,res){
  //console.log(req.body);
	var chkQry = "SELECT * FROM sample_data WHERE (??=?)";
	var cheQryData = ['id',req.body.userid];
	chkQry = mysql.format(chkQry,cheQryData);
	console.log(chkQry);
	sqlGetCall(chkQry, function(response){	
    console.log(response);	
		if(response.length<1){
			var query,data;
			query = 'INSERT into sample_data (??,??,??,??,??,??) values (?,?,?,?,?,?)';
			data = ['mobile','email','address','pincode','city', 'state', req.body.mobilenumber, req.body.emailid, req.body.address, req.body.pincode, req.body.city, req.body.state];
			query = mysql.format(query,data);
			sqlGetCall(query, function(resp){
        console.log(resp);
				res.json({status:true, message: 'User Added Successfully', result: resp.insertId});
			});
		} else {
			query = 'UPDATE sample_data SET ??=?, ??=?, ??=?, ??=?, ??=?, ??=? WHERE ??=?';
			data = ['mobile', req.body.mobilenumber,'email', req.body.emailid, 'address', req.body.address, 'pincode', req.body.pincode, 'city', req.body.city, 'state', req.body.state, 'id', req.body.userid];
			query = mysql.format(query,data);
			console.log(query);
			sqlGetCall(query, function(resp){
				//console.log(resp);
				res.json({status:true, message: 'User Details Updated Successfully', result: response[0].id});
			});
		}
	});
});


function sqlGetCall(query,callback){
	if(query){
		connection.query(query, function(err,res){
			setTimeout(function() {
				if(err){
					callback(err);
				}
				callback(res);
			}, 100);
		});	
	}
}
module.exports = router;
