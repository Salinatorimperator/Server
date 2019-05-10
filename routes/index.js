// set up dependencies
var express = require('express');
var router = express.Router();
//const csv = require('csv-parser');
const csv = require('csvtojson')  
const fs = require('fs');
var moment = require('moment');
//const upload = multer({ dest: 'tmp/csv/' });
//var config = require('config/config.json')

console.log(router)


var cDate = new Date()

const dairly_units = 25;

var values = {
	state: 'Wait...',
	units_left: 0,
	pitch_avg:0,
	units_prod:0,
	exceeded_time:0
}




/*	
var values = {
	state: '',
	current_pu: 0,
	target_pu:'16',
	daily_avg:'15 min',
	target_avg:'12 min'
}
*/
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

/*
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
*/


router.get('/', function (req, res, next) {
		
	  csv()
		.fromFile(require('path').join(__dirname, '..', 'data.csv'))
		.then((jsonObj)=>{
			results = jsonObj
		    //console.log(jsonObj.State);
    		var dates = results.map((o)=>moment(o.Timestamp).format("MM-DD-YYYY HH:mm:ss"))
    		var states = results.map((o)=>o.State)
    		values.state = states[states.length-1]
			values.units_left = dairly_units - results.reduce((acc, cur) => {

				if(acc.lastState !== cur.State && cur.State == 'transit') acc.count += 1
				acc.lastState = cur.State
				return acc
			}, {lastState: undefined, count: 0}).count

			})
		
      res.render('base',{ 
      	values: values,
      	//config: config
      });

      //values.current_pu = 0
    })


router.post('/getdata', (req, res) => {


	csv()
	.fromFile(require('path').join(__dirname, '..', 'data.csv'))
	.then((jsonObj)=>{
		results = jsonObj
	    //console.log(jsonObj.State);
		/*var dates = results.reduce((acc, cur)=>{

			if(acc.lastState !== cur.State && cur.State == 'transit'){
				var date  = new Date(cur.Timestamp);
				var seconds = date.getTime();
				acc.avg+=seconds-lastTime;
				it+=1;

				acc.lastState = cur.State	

			}
			acc.lastTime = seconds
		},{lastState: undefined, lastTime:0, avg:0, it:0})
		console.log(dates)	*/

		var states = results.map((o)=>o.State)
		values.state = states[states.length-1]

		
		var val = results.reduce((acc, cur) => {


			var today = new Date();
			
			var today_day = today.getDate();
			var today_month =  today.getMonth() + 1;
			var today_year =  today.getFullYear();

			var date  = new Date(cur.Timestamp);
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getTime()/1000+9*3600*1000;

			console.log(minutes)

			if(acc.lastTime == 0) acc.lastTime = seconds 
			if(acc.lastState !== cur.State && cur.State == 'transit'){

				acc.count += 1

				
				//console.log(acc.lastTime)
				//console.log(seconds)
				
				acc.avg += seconds - acc.lastTime;
					
				
				acc.it += 1;
				acc.lastTime = seconds

			} 
			acc.lastState = cur.State

			return acc
		}, {lastState: undefined, count: 0, lastTime: 0, avg: 0, it: 0})
		values.units_left = dairly_units - val.count
		values.pitch_avg =  val.avg/val.it
		//console.log(values.pitch_avg)
		})
	res.send({values})
})


// setup routing
//router.get('/', function(req, res, next) {
  //res.render('base', name)
//})






// export the module
module.exports = router