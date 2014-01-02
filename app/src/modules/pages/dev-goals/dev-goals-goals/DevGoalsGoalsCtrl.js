/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsGoalsCtrl', ['$scope', 'appHttp',
function($scope, appHttp) {
	/**
	@property $scope.visible Toggles visibility (used with ng-show and ng-hide) of elements
	@type Object
	*/
	$scope.visible ={
		addGoal: false
	};
	
	$scope.challengeGoal ={};
	
	$scope.challengeTags =[];
	appHttp.go({}, {url:'challengeGoal/searchTag', data:{} }, {})
	.then(function(response) {
		$scope.challengeTags =response.result.results;
	});
	
}]);