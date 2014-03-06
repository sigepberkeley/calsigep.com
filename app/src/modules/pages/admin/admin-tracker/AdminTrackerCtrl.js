/**
*/

'use strict';

angular.module('myApp').controller('AdminTrackerCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', '$location', function($scope, $timeout, appHttp, UserModel, $location) {
	
	$scope.brothers = [];
	getBrothers();
	function getBrothers(){
		var data = {};

		appHttp.go({}, {url:'user/search', data:data}, {})
			.then(function(response) {
				//console.log("response:  " + JSON.stringify(response.result.users));
				fillBrotherList(response.result.results);
			});
	}

	function fillBrotherList(bros){

		for(var ii=0; ii<bros.length; ii++){
			$scope.brothers[ii] = {
				val: bros[ii]._id,
				name: bros[ii].first_name + ' ' + bros[ii].last_name
			};
		}

	}

	$scope.formVals = {
		brother: '',
		development_module:'',
		date_started:'',
		date_deadline: ''
	};
	$scope.devModules = [
		{
			val: 'sigma',
			name: 'Sigma'
		},
		{
			val: 'phi',
			name: 'Phi'
		},
		{
			val: 'epsilon',
			name: 'Epsilon'
		}
	];

	$scope.formValsSelected = function(params){
		console.log("Adding to challenge" + JSON.stringify($scope.formVals.brother));

		var data = {
			user_id: $scope.formVals.brother,
			challenge: {
				name: $scope.formVals.development_module,
				date_started: $scope.formVals.date_started,
				date_deadline: $scope.formVals.date_deadline
			}
		};

		appHttp.go({}, {url:'userChallengeGoal/saveChallenge', data:data}, {})
			.then(function(response) {
				console.log("Added the challenge");
			});

	};


}]);