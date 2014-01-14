/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsChallengeCtrl', ['$scope', 'appHttp', 'appChallengeNameModel', 
function($scope, appHttp, appChallengeNameModel) {
	$scope.formVals ={
		challengeName: ''
	};
	
	$scope.challenge ={};

	$scope.optsChallenge ={
		ngChange: function() { $scope.readChallenge({}); }
	};
	$scope.selectOptsChallenge =[];
	$scope.challengeNames =[];
	appChallengeNameModel.read({})
	.then(function(retName) {
		$scope.challengeNames =retName.names;
		//form select opts
		var ii, opts =[];
		for(ii =0; ii<retName.names.length; ii++) {
			opts.push({
				val: retName.names[ii],
				name: retName.names[ii]
			});
		}
		$scope.selectOptsChallenge =opts;
	});
	
	$scope.readChallenge =function(params) {
		appHttp.go({}, {url:'challengeGoal/readByChallenge', data:{challenge_name: $scope.formVals.challengeName} }, {})
		.then(function(response) {
			$scope.challenge =response.result.challenge;
		});
	};
}]);