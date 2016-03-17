angular.module('NightLifeApp')
.controller('ProfileController', ['$scope', 'user', function($scope, user) {
  user.getUser().success(function(data) {
    $scope.user = data;
    // set the username
    var username = "You";
    if (data.twitter) {
        username = data.twitter.displayName;
    }
    else if (data.facebook) {
        username = data.facebook.displayName;
    }
    $scope.user.username = username;
    $scope.userLogout = function() {
      user.logoutUser();
    };
  });  
}]);