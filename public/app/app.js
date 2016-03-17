angular.module('NightLifeApp', ['ngRoute'])

// app routes
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
    templateUrl: '/public/app/views/home.html',
    controller: 'HomeController'
    })
    .when('/login', {
    templateUrl: '/public/app/views/login.html'
    })
    // default
    .otherwise({ 
      redirectTo: '/' 
    }); 

});