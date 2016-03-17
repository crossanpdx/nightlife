angular.module('NightLifeApp')
.factory('user', ['$http', '$window', function($http, $window) {
  this.getUser = function() {
    return $http.get('/api/user')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  this.logoutUser = function() {
    return $http.get('/logout')
              .success(function(data) {
                $window.location.href = '/';
              })
              .error(function(err) {
                console.log(err);
                return err;
              });
  };
  return this;
}]);