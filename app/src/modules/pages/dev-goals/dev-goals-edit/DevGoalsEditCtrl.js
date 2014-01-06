/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsEditCtrl', ['$scope', 'appHttp',
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
	
	$scope.saveGoal =function(params, callback) {
		appHttp.go({}, {url:'challengeGoal/save', data:{challenge_goal:$scope.challengeGoal} }, {})
		.then(function(response) {
			$scope.$emit('evtAppalertAlert', {type:'success', msg: 'Saved!'});
			callback({});
		});
	};

	/**
	@method $scope.saveNewTags
	@param {Object} params
	@param {Array} new_tags Array of tag objects, each has:
		@param {String} name
	*/
	$scope.saveNewTags =function(params, callback) {
		appHttp.go({}, {url:'challengeGoal/saveTag', data:{new_tags:params.new_tags} }, {})
		.then(function(response) {
			callback({});
		});
	};
}]);