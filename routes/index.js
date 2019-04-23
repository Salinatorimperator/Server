// set up dependencies
var express = require('express');
var router = express.Router();
//const csv = require('csv-parser');
const csv = require('csvtojson')  
const fs = require('fs');
var moment = require('moment');
//const upload = multer({ dest: 'tmp/csv/' });

console.log(router)


var cDate = new Date()

console.log(cDate.getDate())	
var values = {
	state: '',
	current_pu: 0,
	target_pu:'16',
	daily_avg:'15 min',
	target_avg:'12 min'
}

var state, time;
var results = {state : "", time : ""};

//const results = [];

/*
fs.watchFile('data.csv', function (curr, prev){
	fs.createReadStream('data.csv')  
	  .pipe(csv())
	  .on('data', (row) => results.push(row))
	  .on('end', () => {
	  	//prueba = results[0]
	  	setTimeout((function() {
		  		console.log(results);
	    		console.log('CSV file successfully processed');
	  	}), 1000);

 	 });
	});
*/


fs.watchFile('data.csv', function (curr, prev){
		csv()
		.fromFile('data.csv')
		.then((jsonObj)=>{
			results = jsonObj
		    //console.log(jsonObj.State);
    		var dates = results.map((o)=>moment(o.Timestamp).format("MM-DD-YYYY HH:mm:ss"))
    		var states = results.map((o)=>o.State)
    		values.state = states[states.length-1]
    		console.log(dates)
    		console.log(states)
		    results.forEach(function(entry){
		    	//console.log(entry.State)
		    	//values.state = entry.State;
		    	//console.log(entry.Timestamp)
		    	if(entry.State == 'transit'){
		    		values.current_pu+=1;
		    	}
		    })
			})

	});


router.get('/', function (req, res, next) {

	  console.log(values)
      res.render('base',{ 
      	values: values
      });
    })

router.post('/getdata', (req, res) => {
	console.log(req.body)
	console.log(values)
	res.send({values})
})


// setup routing
//router.get('/', function(req, res, next) {
  //res.render('base', name)
//})






// export the module
module.exports = router