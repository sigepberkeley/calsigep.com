/**
*/

'use strict';

angular.module('myApp').controller('ModuleTrackerCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', '$location', function($scope, $timeout, appHttp, UserModel, $location) {
	
	$scope.userList = [];
	$scope.optsData = {
		'deadline': moment('2014-05-01', 'YYYY-MM-DD'),
		'startDate': moment('2014-01-04', 'YYYY-MM-DD'),
		'today': moment(),
		'dateToReadUpTo':''
	};
	$scope.formVals = {
		development_module:'',
		status_week:''
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
	$scope.weeks = [];
	fillWeeks();
	function fillWeeks(){
		var numWeeks = $scope.optsData.today.diff($scope.optsData.startDate, 'weeks');
		for (var ii = 0; ii < numWeeks; ii++){
			if( $scope.weeks[ii]===undefined) {
				$scope.weeks[ii] = {
					val: (ii+1),
					name: "Week " + (ii+1)
				};
			}
		}
	}
	/*
	Format for the tracker data variable
	
	$scope.trackerData = {
		target_values: [],
		user_specific: [
			{
				user_id: 'The alphanumeric id of the specific user',
				user_name:'The name of the person whose status is being looked at',
				challenge_goal_status: [
					{
						challenge_goal_id: 'The alphanumeric id of the specific challenge goal',
						challenge_goal_name: 'The name of the specific challenge goal',
						this_weeks_value:'The current milestone value for this goal'
					}
				]
			}
		]
	}
	*/


	$scope.trackerData = {
		target_values: [],
		user_specific: []
	};

	$scope.formValsSelected = function(){
		$scope.formVals.dateToReadUpTo = moment($scope.optsData.startDate);
		console.log($scope.formVals.dateToReadUpTo);
		$scope.formVals.dateToReadUpTo.add('weeks', $scope.formVals.status_week);
		$scope.formVals.dateToReadUpTo.add('days', 1);
		console.log($scope.formVals.dateToReadUpTo);
		var data = {
			date_max:$scope.formVals.dateToReadUpTo,
			challenge_name: $scope.formVals.development_module
		};

		appHttp.go({}, {url:'userChallengeGoal/readByDate', data:data}, {})
			.then(function(response) {
				//console.log("response:  " + JSON.stringify(response.result.users));
				fillTrackerData(response.result.users);
			});
	};

	function fillTrackerData(users){
		for (var ii=0; ii< users.length; ii++){
			if ($scope.trackerData.user_specific[ii] === undefined){
				$scope.trackerData.user_specific[ii] = {
					user_id: users[ii]._id,
					user_name : users[ii].first_name + ' ' +users[ii].last_name,
					challenge_goal_status:[]
				};
			}
			for (var jj=0; jj< users[ii].challenge_goal.length; jj++){
				if ($scope.trackerData.user_specific[ii].challenge_goal_status[jj] === undefined){
					$scope.trackerData.user_specific[ii].challenge_goal_status[jj] = {
						challenge_goal_id: users[ii].challenge_goal[jj].challenge_goal_id,
						challenge_goal_name: users[ii].challenge_goal[jj].challenge_goal_name,
						this_weeks_value: ''
					};
					if (users[ii].challenge_goal[jj].milestone === undefined){
						$scope.trackerData.user_specific[ii].challenge_goal_status[jj].this_weeks_value = 0;
					}
					else{
						$scope.trackerData.user_specific[ii].challenge_goal_status[jj].this_weeks_value = users[ii].challenge_goal[jj].milestone.value;
					}
				}
			}
		}
		console.log("Filled Tracker");
		fillTargetValues();
	}

	function fillTargetValues(){
		var data = {
			challenge_name: $scope.formVals.development_module
		};

		appHttp.go({}, {url:'challengeGoal/readByChallenge', data:data}, {})
			.then(function(response) {
				var goals = response.result.challenge.goal;
				for (var ii=0; ii < goals.length; ii++){
					$scope.trackerData.target_values[ii] = {
							challenge_name: goals[ii].title,
							target_value: ''
						};
					if (goals[ii].target_value === undefined){
						$scope.trackerData.target_values[ii].target_value = 1;
					}
					else{
						$scope.trackerData.target_values[ii].target_value = goals[ii].target_value;
					}
				}
				console.log("Filled target vals: " + JSON.stringify($scope.trackerData.target_values));
			});
	}

	$scope.percentage = 0;
	$scope.weeksToDeadline = $scope.optsData.deadline.diff($scope.optsData.startDate, 'weeks');
	$scope.percent = function(current, target){
		var temp, percent;
		temp = (current/target)/(($scope.formVals.status_week)/$scope.weeksToDeadline).toFixed(3);
		percent = Math.min(temp,1).toFixed(3);
		$scope.percentage = parseFloat(percent).toFixed(3);
	};
	$scope.rgbVal1 = function(percent, params){
		if (percent < 0.000001){
			return 0;
		}
		else if (percent < 0.5)
			return(Math.round(255));
		else
			return(Math.round((1-percent)*510));
	};
	$scope.rgbVal2 = function(percent, params){
		if (percent < 0.000001){
			return 200;
		}
		else if (percent < 0.5)
			return(Math.round(percent*510));
		else
			return(255);
	};
	$scope.rgbVal3 = function(percent){
		if (percent < 0.000001){
			return 255;
		}
		return 0;
	};


}]);