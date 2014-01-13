/**

GET URL params
@param {String} [id] Challenge goal id (to load and edit this goal)

*/

'use strict';

angular.module('myApp').controller('DevGoalsEditCtrl', ['$scope', 'appHttp', '$routeParams', 'appChallengeTagModel', 'appChallengeGroupModel', 
function($scope, appHttp, $routeParams, appChallengeTagModel, appChallengeGroupModel) {
	/**
	@property $scope.visible Toggles visibility (used with ng-show and ng-hide) of elements
	@type Object
	*/
	$scope.visible ={
		addGoal: false
	};
	
	$scope.challengeGoal ={};
	
	/**
	If an edit, load from backend
	*/
	if($routeParams.id !==undefined) {
		appHttp.go({}, {url:'challengeGoal/read', data:{_id: $routeParams.id} }, {})
		.then(function(response) {
			$scope.challengeGoal =response.result.result;
			//default show
			$scope.visible.addGoal =true;
		});
	}
	
	$scope.challengeTags =[];
	appChallengeTagModel.read({})
	.then(function(retTag) {
		$scope.challengeTags =retTag.tags;
	});
	
	$scope.challengeGroups =[];
	appChallengeGroupModel.read({})
	.then(function(retGroup) {
		$scope.challengeGroups =retGroup.groups;
	});
	
	/**
	@method $scope.saveGoal
	@param {Object} params
		@param {Array} [new_tags] Array of tag objects, each has:
	*/
	$scope.saveGoal =function(params, callback) {
		var ppSend ={
			challenge_goal:$scope.challengeGoal
		};
		if(params.new_tags !==undefined) {
			ppSend.new_tags =params.new_tags;
		}
		appHttp.go({}, {url:'challengeGoal/save', data:ppSend }, {})
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
	/*
	$scope.saveNewTags =function(params, callback) {
		appHttp.go({}, {url:'challengeGoal/saveTag', data:{new_tags:params.new_tags} }, {})
		.then(function(response) {
			callback({});
		});
	};
	*/
}]);