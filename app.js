var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var routes = require('./routes/routes.js');
var passport = require('passport');
var session = require('express-session');

require('dotenv').config();

app.set('port', (process.env.PORT || 8080));

app.use('/public', express.static(process.cwd() + '/public'));

mongo.connect(process.env.MONGO_URL, function (error, db) {
    if (error) {
    throw new Error('Database failed to connect!');
    } else {
    console.log('MongoDB successfully connected on port 27017.');
    }
    
    require('./auth/passport')(passport, db);

    // required for passport
    app.use(session({
    	secret: 'secretOwl',
    	resave: false,
    	saveUninitialized: true
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    // routes
    routes(app, db, passport);
    
    
    app.listen(app.get('port'), function() {
        console.log('Express server listening on port', app.get('port'));
    });
    
});