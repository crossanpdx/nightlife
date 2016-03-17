angular.module('NightLifeApp')
.factory('yelp', ['$http', function($http) {
  // get the session location info
  this.getSess = function() {
    return $http.get('/api/session/location')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // get the local data from Yelp
  this.getLocal = function(location) {
    return $http.get('/api/search/' + location)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.getOffset = function(location, offset) {
    return $http.get('/api/search/' + location + '/' + offset)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);