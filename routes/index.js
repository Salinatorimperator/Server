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
	exceeded_time:0,
	units_perhour:[0,0,0,0,0,0,0,0]
}



// values for units and avg
var state, time;
var results = {state : "", time : ""};

//values for units per hour





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
		.fromFile(require('path').join(__dirname, '..', 'data.csv'))
		.then((jsonObj)=>{
			results = jsonObj
			var states = results.map((o)=>o.State)
			//console.log(states)

			
			var val = results.reduce((acc, cur) => {


				var today = new Date();
				
				var today_day = today.getDate();
				var today_month =  today.getMonth() + 1;
				var today_year =  today.getFullYear();

				var date  = new Date(cur.Timestamp);
				var hour = date.getHours();
				var minutes = date.getMinutes();
				var seconds = date.getTime()/1000+9*3600*1000;
				var day =date.getDate();
				var month = date.getMonth()+1;
				var year = date.getFullYear();
				//console.log(hour)
				//console.log(cur.State)
				//if(today_day == day & today_month == month & today_year == year){
				//Calculates the last state	
				values.state = states[states.length-1]

				//Calculates how many units and avg
				if(acc.lastTime == 0) acc.lastTime = seconds 
				if(acc.precedent_hour == 0) acc.precedent_hour = hour
				//console.log(cur.State)
				if(hour == acc.precedent_hour){
					if(acc.lastState !== cur.State && cur.State == 'transit'){

						acc.count += 1

						acc.avg += seconds - acc.lastTime;
											
						acc.it += 1;
						acc.lastTime = seconds

					
						acc.count_per_hour[acc.iteration_vector]+=1;
						acc.precedent_hour = hour;
					}
				}else{
					acc.iteration_vector+=1;
					acc.precedent_hour = hour;
				}
				
				acc.lastState = cur.State


				//How many units per hour
				//console.log(acc.precedent_hour)



				//}
				return acc
			}, {lastState: undefined, count: 0, lastTime: 0, avg: 0, it: 0, precedent_hour:0, iteration_vector:0, count_per_hour:[0,0,0,0,0,0,0,0]})
			values.units_left = dairly_units - val.count
			values.pitch_avg =  (val.avg/val.it).toFixed(2)
			values.units_perhour = val.count_per_hour
			console.log(values.units_perhour)
		})
});


router.get('/', function (req, res, next) {
		
	csv()
		.fromFile(require('path').join(__dirname, '..', 'data.csv'))
		.then((jsonObj)=>{
			results = jsonObj
			var states = results.map((o)=>o.State)
			

			
			var val = results.reduce((acc, cur) => {


				var today = new Date();
				
				var today_day = today.getDate();
				var today_month =  today.getMonth() + 1;
				var today_year =  today.getFullYear();

				var date  = new Date(cur.Timestamp);
				var hour = date.getHours();
				var minutes = date.getMinutes();
				var seconds = date.getTime()/1000+9*3600*1000;
				var day =date.getDate();
				var month = date.getMonth()+1;
				var year = date.getFullYear();

				//console.log(hour)
				//if(today_day == day & today_month == month & today_year == year){
				//Calculates the last state	
				values.state = states[states.length-1]

				//Calculates how many units and avg
				if(acc.lastTime == 0) acc.lastTime = seconds 
				if(acc.precedent_hour == 0) acc.precedent_hour = hour
				//console.log(cur.State)
				if(hour == acc.precedent_hour){
					if(acc.lastState !== cur.State && cur.State == 'transit'){

						acc.count += 1
						
						acc.avg += seconds - acc.lastTime;
											
						acc.it += 1;
						acc.lastTime = seconds

						acc.count_per_hour[acc.iteration_vector]+=1;

						acc.precedent_hour = hour;

					}else{
						acc.iteration_vector+=1;
						acc.precedent_hour = hour;
					}

					acc.lastState = cur.State
				}
				return acc
			}, {lastState: undefined, count: 0, lastTime: 0, avg: 0, it: 0, precedent_hour:0, iteration_vector:0, count_per_hour:[0,0,0,0,0,0,0,0]})
			values.units_left = dairly_units - val.count
			values.pitch_avg =  (val.avg/val.it).toFixed(2)
			values.units_perhour = val.count_per_hour
			//console.log(val.count_per_hour)
		})
	res.render('base', values)
})


router.post('/getdata', (req, res) => {

	res.send({values})
})


// setup routing
//router.get('/', function(req, res, next) {
  //res.render('base', name)
//})






// export the module
module.exports = router