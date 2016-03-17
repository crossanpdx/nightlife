require('dotenv').config();

var Yelp = require('yelp');

var opts = {
  consumer_key: process.env.YELP_KEY,
  consumer_secret: process.env.YELP_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKSEC,
};

var yelp = new Yelp(opts);

module.exports = function (app, db, passport) {
    
    // function to check if user is logged in
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
    
    // direct user to correct app if logged in or anon
    app.route('/')
        .get(function (request, response) {
    		if (request.isAuthenticated()) {
    			response.sendFile(process.cwd() + '/public/app/loggedin.html');
    		} else {
    			response.sendFile(process.cwd() + '/public/app/index.html');
    		}
            
        });
        
    // ANON APIS
	app.route('/api/search/:location')
		.get(function (req, res) {
			// get the location
			var location = req.params.location;
			// put the location in the session
			req.session.location = location;
			// search yelp for venues sorted on highest rated
			yelp.search({ term: 'bar, pub, club, restaurant', sort:2, location: location, limit:20 })
			.then(function (data) {
			  res.json(data);
			})
			.catch(function (err) {
			  res.status(400).json(err);
			});
		});
		// route with offset for pages
	app.route('/api/search/:location/:offset')
		.get(function (req, res) {
			var location = req.params.location;
			var offset = parseInt(req.params.offset, 10);
			yelp.search({ term: 'bar, pub, club, restaurant', location: location, sort:2, offset:offset, limit:20 })
			.then(function (data) {
			  res.json(data);
			})
			.catch(function (err) {
			  res.status(400).json(err);
			});
		});
		// route to get venue numbers
	app.route('/api/numbers/:venue')
		.get(function (req, res) {
			var venueID = req.params.venue;
			db.collection('venues').findOne({ "venue_id": venueID }, function(err, venue) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// send the numbers or 0
            		if (!venue) {
            			res.json({ numbers: 0 });
            		} else {
            			res.json({ numbers: venue.numbers});
            		}
            	}
            });
		});
		// route to get session location
	app.route('/api/session/location')
		.get(function (req, res) {
			if (req.session.location) {
				res.json({ location: req.session.location });
			} else {
				res.status(400);
			}
		});
        
    // LOGGED IN APIS
    app.route('/api/user')
        .get(isLoggedIn, function(req, res) {
			res.json(req.user);
        });
    app.route('/api/user/venues')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
            db.collection('users').findOne({"_id": userID }, {"_id": 0, "attending": 1}, function(err, attending) {
                if (err) {
                    // no user found so log the error
                    console.log("Error: " + err);
                    res.status(400).json(err);
                } else {
                    // user found send back the attending array
                    res.json(attending);
                }
            });
    	});
    app.route('/api/user/attend/:venueid')
        .get(isLoggedIn, function(req, res) {
            var venueID = req.params.venueid;
            var userID = req.user._id;
            db.collection('users').findOne({"_id": userID }, {"_id": 1}, function(err, user) {
                if (err) {
                    // no user found so log the error
                    console.log("Error: " + err);
                    res.status(400).json(err);
                } else {
                    // user found add the venue to the going array and activity message
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": req.user._id}, { $push: { "attending": venueID, "activity": { $each: [{ "venue": venueID, "type": "going", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                }
            });
            // and add the number to the venue id
            db.collection('venues').findOne({ "venue_id": venueID }, function(err, venue) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add or update the venue
            		db.collection('venues').update({ "venue_id" : venueID }, { $inc: { "numbers" : 1 } }, { upsert: true, multi: false });
            		res.send("Finished!");
            	}
            });
        });
    app.route('/api/user/remove/:venueid')
        .get(isLoggedIn, function(req, res) {
            var venueID = req.params.venueid;
            var userID = req.user._id;
            db.collection('users').findOne({"_id": userID }, {"_id": 1}, function(err, user) {
                if (err) {
                    // no user found so error
                    console.log("Error: " + err);
                    res.status(400).json(err);
                } else {
                    // user found remove the venue from the going array and add activity message
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": req.user._id}, { $pull: { "attending": venueID  }, $push: { "activity": { $each: [{ "venue": venueID, "type": "not going", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                }
            });
            // and add the number to the venue id
            db.collection('venues').findOne({ "venue_id": venueID }, function(err, venue) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add or update the venue
            		db.collection('venues').update({ "venue_id" : venueID }, { $inc: { "numbers" : -1 } }, { upsert: true, multi: false });
            		res.send("Finished!");
            	}
            });
        });
        
    // authentication routes (FIRST LOG IN)
        
	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	app.route('/auth/facebook')
	    .get(passport.authenticate('facebook'));
	    
	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	
	// authorize routes (CONNECT ADDITIONAL ACCOUNT)
	// put the logic in the above authentication routes, in future could have seperate strategy as per passport docs

	
	// LOG OUT
		
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
};