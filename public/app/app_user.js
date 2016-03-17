angular.module('NightLifeApp', ['ngRoute'])

// app routes
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
    templateUrl: '/public/app/views/user_home.html',
    controller: 'HomeController'
    })
    // logged in routes
    .when('/profile', {
    templateUrl: '/public/app/views/user_profile.html',
    controller: 'ProfileController'
    })
    // default
    .otherwise({ 
      redirectTo: '/' 
    }); 

});