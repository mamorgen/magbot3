const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');
const {google} = require('googleapis');
const RestNio = require('restnio');

var user = require('./login.var');
console
getSchools(user.magister.school)
	.then((schools) => schools[0])
	.then((school) => magister({
		school,
		username: user.magister.username,
		password: user.magister.password,
	}))
	.then((m) => {
        m.appointments(day(-1), day(4))
        .then((m => {
			console.dir(m)
			pushCalendar(m)
        }))
	}, (err) => {
		console.error('something went wrong:', err);
    });
var user = require('./login');


let server = new RestNio((router, restnio) => {
	router.all('/', {
		func: (params, client) => {
			return getSchools(user.magister.school)
			.then((schools) => schools[0])
			.then((school) => magister({
				school,
				username: user.magister.username,
				password: user.magister.password,
			}))
			.then((m) => m.appointments(day(-1), day(4)));
		}
	});
}, {
	port: 8080
});
server.bind();


// getSchools(user.magister.school)
// 	.then((schools) => schools[0])
// 	.then((school) => magister({
// 		school,
// 		username: user.magister.username,
// 		password: user.magister.password,
// 	}))
// 	.then((m) => {
//         m.appointments(day(-1), day(4))
//         .then((m => {
// 			console.dir(m)
// 			//pushCalendar(m)
//         }))
// 	}, (err) => {
// 		console.error('something went wrong:', err);
//     });

function pushCalendar(m, auth) {
    delEvents(auth)
    const calendar = google.calendar({version: 'v3', auth});
	for(var i = 0; m.length - 1 >= i; i++){
		var event = {
			'summary': [m[i].rawData.Vakken[0]?toTitleCase(m[i].rawData.Vakken[0].Naam):m[i].rawData.Omschrijving] + ' van ' + m[i].rawData.Docenten[0].Naam,
			'location': isNaN(m[i].rawData.Lokatie)?m[i].rawData.Lokatie:'lokaal '+m[i].rawData.Lokatie,
			'description': m[i].rawData.Inhoud?m[i].rawData.Inhoud:m[i].rawData.Omschrijving,
			'start': {
				'dateTime': m[i].rawData.Start,
				'timeZone': 'Europe/Amsterdam',
			},
			'end': {
				'dateTime': m[i].rawData.Einde,
				'timeZone': 'Europe/Amsterdam',
			}
		};
		calendar.events.insert({
				auth: auth,
				calendarId: user.calendar.calendarid,
				resource: event,
			}, function(err, event) {
			if (err) {
				console.log('There was an error contacting the Calendar service: ' + err);
				return;
			}
		})
	}
}

function delEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
	  calendarId: user.calendar.calendarid,
	  singleEvents: true,
	  orderBy: 'startTime',
	}, (err, res) => {
	  if (err) return console.log('The API returned an error: ' + err);
	  const events = res.data.items;
	  if (events.length) {
		events.map((event, i) => {
		  calendar.events.delete({
			calendarId: user.calendar.calendarid,
			eventId: event.id
		  });
		});
	  } else {
		console.log('No upcoming events found.');
	  }
	});
  }

function day(extra) {
    if(!extra){extra = 0}
    extra = extra + 1
    return moment().businessAdd(extra)._d
}