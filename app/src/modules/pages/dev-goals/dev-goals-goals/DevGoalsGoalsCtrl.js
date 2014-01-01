/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsGoalsCtrl', ['$scope',
function($scope) {
	/**
	@property $scope.visible Toggles visibility (used with ng-show and ng-hide) of elements
	@type Object
	*/
	$scope.visible ={
		addGoal: false
	};
}]);