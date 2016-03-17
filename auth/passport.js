
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');

module.exports = function (passport, db) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
	passport.deserializeUser(function (id, done) {
		if (id.twitter) {
		    db.collection('users').findOne({ 'twitter.id': id.twitter.id }, function(err, user) {
				done(err, user);
		    });
		}
		else if (id.facebook) {
		    db.collection('users').findOne({ 'facebook.id': id.facebook.id }, function(err, user) {
				done(err, user);
		    });
		}
	});

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================

	passport.use(new TwitterStrategy({
        consumerKey     : configAuth.twitterAuth.apikey,
        consumerSecret  : configAuth.twitterAuth.apisecret,
        callbackURL     : configAuth.twitterAuth.callbackURL
        // ADDED FOR CONNECT - to pass in the req from our route (check if a user is logged in or not)
     
	},
    // ADDED FOR CONNECT - added req param for connect
    function(req, token, refreshToken, profile, done) {
        	
    // ADDED FOR CONNECT - now we only do this if user not logged in - else added for connecting accounts
    if (!req.user) {
		db.collection('users').findOne({ 'twitter.id' : profile.id }, function(err, user) {
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found then log them in
            if (user) {
                return done(null, user); // user found, return that user
            } else {
                // if there is no user, create them
			    var twitterObj = {
			        'id': profile.id,
			        'username': profile.username,
			        'displayName': profile.displayName,
			        'token': token
			    };
			    db.collection('users').insert({ 
			        'twitter': twitterObj
			    });
			    db.collection('users').findOne({ 'twitter.id' : profile.id }, function(err, user) {
			    	if (err) {
			    		return done(err);
			    	} else {
			    		return done(null, user);
			    	}
			    });
			}
        });
    } else {
        // ADDED FOR CONNECT - user logged in and we have to link accounts
        var user = req.user; 
	    var twitterObj = {
	        'id': profile.id,
	        'username': profile.username,
	        'displayName': profile.displayName,
	        'token': token
	    };
        // update the user
        db.collection('users').update({"facebook.id": user.facebook.id}, { 'facebook': user.facebook, 'twitter': twitterObj }, { upsert: false, multi: false });
	    db.collection('users').findOne({ 'twitter.id' : profile.id }, function(err, user) {
	    	if (err) {
	    		return done(err);
	    	} else {
	    		return done(null, user);
	    	}
	    });
    }
		
	}));
	
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
	
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.appID,
        clientSecret    : configAuth.facebookAuth.appSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL
        // ADDED FOR CONNECT - to pass in the req from our route (check if a user is logged in or not)
        
    },
    // ADDED FOR CONNECT - added req param for connect
    function(req, token, refreshToken, profile, done) {

    // ADDED FOR CONNECT - now we only do this if user not logged in - else added for connecting accounts
    if (!req.user) {
            db.collection('users').findOne({ 'facebook.id' : profile.id }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
				    var facebookObj = {
				        'id': profile.id,
				        'email': profile.email || "Email private",
				        'displayName': profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
				        'token': token
				    };
				    db.collection('users').insert({ 
				        'facebook': facebookObj
				    });
				    db.collection('users').findOne({ 'facebook.id' : profile.id }, function(err, user) {
				    	if (err) {
				    		return done(err);
				    	} else {
				    		return done(null, user);
				    	}
				    });
				}
			});
    } else {
        // ADDED FOR CONNECT - user logged in and we have to link accounts
        var user = req.user; 
	    var facebookObj = {
	        'id': profile.id,
	        'email': profile.email || "Email private",
	        'displayName': profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
	        'token': token
	    };
        // update the user
        db.collection('users').update({"twitter.id": user.twitter.id}, { 'twitter': user.twitter, 'facebook': facebookObj }, { upsert: false, multi: false });
	    db.collection('users').findOne({ 'facebook.id' : profile.id }, function(err, user) {
	    	if (err) {
	    		return done(err);
	    	} else {
	    		return done(null, user);
	    	}
	    });
    }
    
	}));
	
};