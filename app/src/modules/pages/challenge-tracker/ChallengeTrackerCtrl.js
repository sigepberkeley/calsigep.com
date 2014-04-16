/**
*/

'use strict';

angular.module('myApp').controller('ChallengeTrackerCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', 'jrgArray', function($scope, $timeout, appHttp, UserModel, jrgArray) {

	$scope.user =UserModel.load();
	$scope.userID = $scope.user._id;
	$scope.usersDevChallenge = getDevChallenge();
	$scope.data1 = {
		user_id: $scope.userID
	};
	$scope.challenge = appHttp.go({}, {url:'userChallengeGoal/readChallenge', data:$scope.data1}, {});

	$scope.optsData = {
		'deadline': moment('2014-05-01', 'YYYY-MM-DD'),
		'startDate': moment('2014-01-04', 'YYYY-MM-DD')
	};

	

	$scope.tempVal = 0;
	$scope.challengeGoalNameList = [];
	$scope.opts = {};

	$scope.userChallengeGoals = [];
	getTrackerData();
	//	$scope.tempChallengeGoals = getChallengeGoals();

	function getDevChallenge(){
		var data2 = {
			"_id" : $scope.userID
		};
		appHttp.go({}, {url:'user/read', data:data2}, {})
			.then(function(response) {
				$scope.usersDevChallenge = response.result.result.dev_challenge;
			});
	}

	//	function getChallengeGoals(){
	//		var goals = [];
	//		var goal;
	//		var data2 = {
	//			"user_id" : $scope.userID
	//		};
	//		appHttp.go({}, {url:'userChallengeGoal/readChallengeGoal', data:data2}, {})
	//			.then(function(response) {
	//				$scope.userChallengeGoals = response.result.challenge_goal;
	//			});


	//		return goals;
	//	}

	$scope.trackerData = {
		'myChallengeGoals': [],
		'weeks': [],
		'milestoneGrid':[]
	};
	function getTrackerData(){
		var goals = [];
		var goal;
		var data2 = {
			"user_id" : $scope.userID
		};
		appHttp.go({}, {url:'userChallengeGoal/readChallengeGoal', data:data2}, {})
			.then(function(response) {
				goals = response.result.challenge_goal;
				$scope.userChallengeGoals = response.result.challenge_goal;
				for (goal= 0; goal<goals.length; goal++){
					if ($scope.trackerData.myChallengeGoals[goal] === undefined){
						$scope.trackerData.myChallengeGoals[goal] = {
							'_id': goals[goal].challenge_goal_id,
							'name': '',
							'target_value':''
						};
						fillMyChallengeGoals(goal);
					}
				}
				getMilestoneData();

			});
	}
	function fillMyChallengeGoals(goal){
		var data2 = {
			"_id" :$scope.trackerData.myChallengeGoals[goal]._id
		};
		appHttp.go({}, {url:'challengeGoal/read', data:data2}, {})
			.then(function(response) {
				$scope.trackerData.myChallengeGoals[goal].target_value = response.result.result.challenge[0].target_value;
				if (response.result.result.challenge[0].required == 1){
					$scope.trackerData.myChallengeGoals[goal].name = response.result.result.title + '*';
				}else{
					$scope.trackerData.myChallengeGoals[goal].name = response.result.result.title;
				}
				
				if (response.result.result.challenge[0].required == 1){
					$scope.challengeGoalNameList[goal] = {
						'val': response.result.result._id,
						'name': JSON.stringify(response.result.result.title)+'*'
					};
				}else{
					$scope.challengeGoalNameList[goal] = {
						'val': response.result.result._id,
						'name': response.result.result.title
					};
				}
				//console.log($scope.challengeGoalNameList[goal]);
			});
	}
	function getMilestoneData(){
		$scope.today = moment();
		var numColumns = $scope.today.diff($scope.optsData.startDate, 'weeks');
		$scope.weeksToDeadline = $scope.optsData.deadline.diff($scope.optsData.startDate, 'weeks');
		for (var ii=0; ii<numColumns; ii++){
			if( $scope.trackerData.weeks[ii]===undefined) {
				$scope.trackerData.weeks[ii] = ii+1;
			}
		}
		var lastWeeksMilestoneData, thisWeeksMilestoneData, currentIndex;
		for (var jj = 0; jj<$scope.trackerData.myChallengeGoals.length; jj++){
			if ($scope.trackerData.milestoneGrid[jj] === undefined){
				$scope.trackerData.milestoneGrid[jj] = {
					'challenge_goal_id':'',
					'milestonesByWeek': []
					};
			} 
			//console.log(JSON.stringify($scope.userChallengeGoals));
			$scope.trackerData.milestoneGrid[jj].challenge_goal_id = $scope.userChallengeGoals[jj].challenge_goal_id;
			lastWeeksMilestoneData = 0;
			thisWeeksMilestoneData = 0;
			currentIndex = 0;
			for (ii=0; ii<numColumns; ii++){
				if ($scope.userChallengeGoals[jj].milestone[currentIndex] === undefined){
					$scope.trackerData.milestoneGrid[jj].milestonesByWeek[ii] = lastWeeksMilestoneData;
				}
				else{
					if (Math.abs($scope.optsData.startDate.diff($scope.userChallengeGoals[jj].milestone[currentIndex].date,'weeks')) > ii+1){
						$scope.trackerData.milestoneGrid[jj].milestonesByWeek[ii] = lastWeeksMilestoneData;
					}
					else if(Math.abs($scope.optsData.startDate.diff($scope.userChallengeGoals[jj].milestone[currentIndex].date,'weeks')) < ii+1){
						ii--;
						thisWeeksMilestoneData = $scope.userChallengeGoals[jj].milestone[currentIndex].value;
						$scope.trackerData.milestoneGrid[jj].milestonesByWeek[ii] = thisWeeksMilestoneData;
						lastWeeksMilestoneData = thisWeeksMilestoneData;
						currentIndex++;
					}
					else{
						thisWeeksMilestoneData = $scope.userChallengeGoals[jj].milestone[currentIndex].value;
						$scope.trackerData.milestoneGrid[jj].milestonesByWeek[ii] = thisWeeksMilestoneData;
						lastWeeksMilestoneData = thisWeeksMilestoneData;
						currentIndex++;
					}
				}
			}
		}
	}

	$scope.formVals = {
		goalToAddMilestoneFor : '',
		newMilestoneValue: '',
		newMilestoneDescription: '',
		newMilestoneDate : moment()
	};
	$scope.addMilestone = function(){
		console.log('Goal:			' + $scope.formVals.goalToAddMilestoneFor);
		console.log('New Value:		' + $scope.formVals.newMilestoneValue);
		console.log('Description:	' + $scope.formVals.newMilestoneDescription);
		console.log('Date:			' + $scope.formVals.newMilestoneDate);

		var data = {
			"user_id": $scope.userID,
			"challenge_goal_id": $scope.formVals.goalToAddMilestoneFor,
			'milestone': {
				"value": $scope.formVals.newMilestoneValue,
				"description": $scope.formVals.newMilestoneDescription,
				"date": $scope.formVals.newMilestoneDate
			}
		};
		appHttp.go({}, {url:'userChallengeGoal/addMilestone', data:data}, {})
			.then(function(response) {
				console.log("Add milestone response: "+response);
				history.go(0);
			});

	};

	$scope.percent = function(current, target, thisWeek, deadlineWeek){
		var temp, percent;
		temp = (current/target)/((thisWeek+1)/deadlineWeek).toFixed(3);
		percent = Math.min(temp,1).toFixed(3);
		$scope.tempVal = parseFloat(percent).toFixed(3);
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

	//	var data2 = {
	//		"user_id" : $scope.userID,
	//		"challenge":{	
	//			"name": "phi",
	//			"date_started":"2014-02-06 15:30:00-07:00",
	//			"date_deadline":"2014-05-01 15:30:00-07:00"
	//		}
	//	};
	//	appHttp.go({}, {url:'userChallengeGoal/saveChallenge', data:data2}, {})
	//		.then(function(response) {
	//			$scope.tempChallengeGoals = response;
	//		});

	//	jrgArray- Luke's github

	//	
	//you can find the index of an array of objects.


//	*/

}]);