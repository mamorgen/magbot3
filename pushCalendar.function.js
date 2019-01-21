const {google} = require('googleapis');

module.exports = function (auth, login, m) {
	const calendar = google.calendar({version: 'v3', auth});
	for(var i = 0; m.length - 1 >= i; i++){
		if(m[i].isCancelled == (login.cancelled == 'true')){
			var event = {
				'summary': [m[i].classes[0]?toTitleCase(m[i].classes[0]):m[i].classes] + ' van ' + [m[i].teachers[0]?m[i].teachers[0].description:'niemand'],
				'location': isNaN(m[i].location)?m[i].location:'lokaal '+m[i].location,
				'description': m[i].annotation?m[i].annotation:m[i].description,
				'start': {
					'dateTime': m[i].start,
					'timeZone': 'Europe/Amsterdam',
				},
				'end': {
					'dateTime': m[i].end,
					'timeZone': 'Europe/Amsterdam',
				},
				'reminders': {
					'useDefault': false,
					'overrides': [
					  	{
							'method': 'popup',
							'minutes': Number(login.notify)
						},
					],
				},
			};

			if(m[i].infoType > 1 && login.mail) {
				event.reminders.overrides = [
					{
						'method': 'popup',
						'minutes': Number(login.notify)
					},
					{
						'method': 'email',
						'minutes': 24 * 60 * 7
					}
				]
			}

			calendar.events.insert({
					auth: auth,
					calendarId: login.calendarid,
					resource: event,
				}, function(err, event) {
				if (err) {
					console.log('There was an error contacting the Calendar service: ' + err);
					return;
                }
			})
		}
    }
    return 'succes';
}

function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}