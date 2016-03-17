angular.module('NightLifeApp')
.factory('attend', ['$http', function($http) {
  this.venueNumbers = function(id) {
    return $http.get('/api/numbers/' + id)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.attendUser = function() {
    return $http.get('/api/user/venues')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.attendVenue = function(id) {
    return $http.get('/api/user/attend/' + id)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.removeVenue = function(id) {
    return $http.get('/api/user/remove/' + id)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);