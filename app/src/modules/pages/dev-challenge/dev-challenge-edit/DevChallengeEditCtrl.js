/**
*/

'use strict';

angular.module('myApp').controller('DevChallengeEditCtrl', ['$scope', 'appHttp', '$routeParams', 'appChallengeGroupModel', 'appChallengeNameModel', 
function($scope, appHttp, $routeParams, appChallengeGroupModel, appChallengeNameModel) {
	$scope.challenge ={};
	
	/**
	If an edit, load from backend
	*/
	if($routeParams.id !==undefined) {
		appHttp.go({}, {url:'challenge/read', data:{_id: $routeParams.id} }, {})
		.then(function(response) {
			$scope.challenge =response.result.result;
		});
	}
	
	$scope.challengeGroups =[];
	appChallengeGroupModel.read({})
	.then(function(retGroup) {
		$scope.challengeGroups =retGroup.groups;
	});
	
	$scope.challengeNames =[];
	appChallengeNameModel.read({})
	.then(function(retName) {
		$scope.challengeNames =retName.names;
	});
	
	/**
	@method $scope.saveChallenge
	*/
	$scope.saveChallenge =function(params, callback) {
		var ppSend ={
			challenge:$scope.challenge
		};
		appHttp.go({}, {url:'challenge/save', data:ppSend }, {})
		.then(function(response) {
			$scope.$emit('evtAppalertAlert', {type:'success', msg: 'Saved!'});
			callback({});
		});
	};
	
}]);