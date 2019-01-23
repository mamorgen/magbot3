const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
const database = './db/'

var loginFunc = require('./login.function');
var delCalendar = require('./delCalendar.function')
var pushCalendar = require('./pushCalendar.function');
var getAuthCode = require('./authcode.exec')

var key = require('./key')

var secret = require('./secret')
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://www.magbot.tk'
);

getUsers();

function getUsers() {
	getAuthCode()
	.then((code => {
		fs.readdirSync(database).forEach(file => {
			fs.readFile('db/'+file, function read(err, data) {
				if (err) { throw err; }
				var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
				login = JSON.parse(login)
				login.authcode = code
				loginFunc(login)
				.then((all => {
					delCalendar(all, pushCalendar)
				}))
			});
		})
	}))
}