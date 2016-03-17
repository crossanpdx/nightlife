module.exports = {
	'twitterAuth': {
    	'apikey' : process.env.TWITTER_KEY,
    	'apisecret' : process.env.TWITTER_SECRET,
		'callbackURL': 'https://nightlife-coordination-app-irishraven.c9users.io/auth/twitter/callback'
	},
	'facebookAuth': {
    	'appID' : process.env.FB_ID,
    	'appSecret' : process.env.FB_SECRET,
		'callbackURL': 'https://nightlife-coordination-app-irishraven.c9users.io/auth/facebook/callback'
	}
};