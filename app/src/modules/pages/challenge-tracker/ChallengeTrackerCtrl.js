/**
*/

'use strict';

angular.module('myApp').controller('ChallengeTrackerCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', '$location', function($scope, $timeout, appHttp, UserModel, $location) {

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

	$scope.testData = {

		'user': {
			'_id':"{ObjectId} ObjectId('123l4k234l')",
			'email':"",
			'emails_all':[
				{
					'email':"n.rane9@gmail.com",
					'confirmed':"1",
					'primary':"1"
				}
			],
			'phone':{
				'area_code':"919",
				'number':"8893195",
				'confirmed':"1",
				'primary':"1"
			},
			"phones_all":[
				{
					"area_code":"919",
					"number":"8893195",
					"confirmed":"1",
					"primary":"1"
				}
			],
			"first_name":"Neel",
			"last_name":"Rane",
			"password":"{String} [encrypted salt + encrypted password] lkj3lkrjlfkjlk3j4",
			"password_salt":"{String} [string of password salt] 3lkfsajlf93kfakf",
			"sess_id":"{String} [string of current session id] 3l4klaskj3",
			"password_reset_key":"{String} [string of random string to allow resetting password] lk3jlkja",
			"facebook_id":"128333",
			"signup": "{String} [timestamp YYYY-MM-DD HH:mm:ssZ] 2013-06-13 15:30:00-07:00",
			"last_login": "{String} [timestamp YYYY-MM-DD HH:mm:ssZ] 2013-06-13 02:30:00+03:30",
			"status": "member",
			"super_admin": "{Number} 1",
			"social":{
				"google":{
					"token":"{String}"
				},
				"facebook":{
					"token":"{String}"
				}
			},
			'challenge_goal': [
				{
					'_id':"52deab2fd9af64fa572b0795",
					'challenge_goal_id':"Push-ups",
					"date_started":"2014-02-06 15:30:00-07:00",
					"date_deadline":"2014-05-01 15:30:00-07:00",
					"date_completed":"{String} YYYY-MM-DD HH:mm:ssZ",
					"completed_approved_user_id":"{String} The user id of the user who approved that this challenge goal is complete.",
					"milestone":[
						{
							"date":"2014-01-14 15:30:00-07:00",
							"value":"1",
							"description":"{String} The details/proof of completion of this milestone"
						},
						{
							"date":"2014-01-21 15:30:00-07:00",
							"value":"1",
							"description":"{String} The details/proof of completion of this milestone"
						}
					]
				},
				{
					"_id":"52deac67d9af64fa572b07a0",
					"challenge_goal_id":"Leg Press",
					"date_started":"2014-02-06 15:30:00-07:00",
					"date_deadline":"2014-05-01 15:30:00-07:00",
					"date_completed":"{String} YYYY-MM-DD HH:mm:ssZ",
					"completed_approved_user_id":"{String} The user id of the user who approved that this challenge goal is complete.",
					"milestone":[
						{
							"date":"2014-01-14 15:30:00-07:00",
							"value":".05",
							"description":"{String} The details/proof of completion of this milestone"
						},
						{
							"date":"2014-01-15 15:30:00-07:00",
							"value":".07",
							"description":"{String} The details/proof of completion of this milestone"
						},
						{
							"date":"2014-01-21 15:30:00-07:00",
							"value":".45",
							"description":"{String} The details/proof of completion of this milestone"
						}
					]
				},
				{
					"_id":"52deac67d9af64fa572b07a1",
					"challenge_goal_id":"Monday Meeting Dinners",
					"date_started":"2014-02-06 15:30:00-07:00",
					"date_deadline":"2014-05-01 15:30:00-07:00",
					"date_completed":"{String} YYYY-MM-DD HH:mm:ssZ",
					"completed_approved_user_id":"{String} The user id of the user who approved that this challenge goal is complete.",
					"milestone":[
						{
							"date":"2014-01-14 15:30:00-07:00",
							"value":"0",
							"description":"{String} The details/proof of completion of this milestone"
						},
						{
							"date":"2014-01-21 15:30:00-07:00",
							"value":"1",
							"description":"{String} The details/proof of completion of this milestone"
						}
					]
				}
			],
			"challenge":[
				{
					"_id":"{String} sdfeaf234d",
					"name":"{String} One of: 'sigma', 'phi', 'epsilon', 'brother_mentor', 'fellow', etc.",
					"date_started":"{String} YYYY-MM-DD HH:mm:ssZ",
					"date_deadline":"{String} YYYY-MM-DD HH:mm:ssZ",
					"date_completed":"{String} YYYY-MM-DD HH:mm:ssZ"
				}
			]
		},
		
		"challenge": {
			"_id": "{String} sdfeaf234d",
			"name": "{String} SHOULD BE UNIQUE! No two of the same name!. One of: 'sigma', 'phi', 'epsilon', 'brother_mentor', 'fellow', etc.",
			"max_duration": "{Number} Number of days from start date after which user fails the challenge / is kicked out",
			"min_points": "{Number} The minimum number of points required to complete this challenge",
			"group": [
				{
					"_id": "{String} OPTIONAL?? i.e. sdfeaf234d",
					"name": "{String} Should match challenge_goal.challenge.group. SHOULD BE UNIQUE among others in this challenge!",
					"min_points": "{Number} The minimum number of points that must be earned in this group. I.e. 5"
				}
			]
		},
		"challenge_tag": {
			"_id": "{ObjectId} ObjectId('123l4k234l')",
			"name": "{String} Name of the tag, i.e. 'brotherhood'"
		}
	};
	$scope.challenge_goals =  [
			{
				"_id": "52deab2fd9af64fa572b0795",
				"challenge": [
					{
						
						"date_last_active": "{String} YYYY-MM-DD HH:mm:ssZ OR undefined",
						"name": "phi",
						"required": 0,
						"group": "muscle_strength",
						"min_value": 20,
						"target_value": '25',
						"points": 3,
						"max_value": 25,
						"max_points": 10
					}
				],
				"title": "Push-ups",
				"description": "Do 25 consecutive 3-second push-ups. Going down in 3 seconds, and then up in 1.",
				"last_updated": "2014-01-21 09:16:08-08:00"
			},
			{
				"_id": "52deac67d9af64fa572b07a0",
				"challenge": [
					{
						"name": "phi",
						"required": 0,
						"group": "muscle_strength",
						"min_value": 1,
						"target_value": '2',
						"points": 3,
						"max_value": 2,
						"max_points": 4
					}
				],
				"tags": [],
				"title": "Leg Press",
				"description": "You must leg press 1.75x your body weight",
				"last_updated": "2014-01-21 09:20:39-08:00"
			},
			{
				"_id": "52deac67d9af64fa572b07a1",
				"challenge": [
					{
						
						"date_last_active": "{String} YYYY-MM-DD HH:mm:ssZ OR undefined",
						"name": "phi",
						"required": 0,
						"group": "",
						"min_value": 2,
						"target_value": '3',
						"points": 3,
						"max_value": 3,
						"max_points": 3
					}
				],
				"title": "Monday Meeting Dinner",
				"description": "Lead 3 dinners for monday meetings through the semester",
				"last_updated": "2014-01-21 09:16:08-08:00"
			}

		];

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
				$scope.trackerData.myChallengeGoals[goal].name = response.result.result.title;
				$scope.challengeGoalNameList[goal] = {
					'val': response.result.result._id,
					'name': response.result.result.title
				};
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
		if (percent === 0){
			return 0;
		}
		else if (percent < 0.5)
			return(Math.round(255));
		else
			return(Math.round((1-percent)*510));
	};
	$scope.rgbVal2 = function(percent, params){
		if (percent === 0){
			return 200;
		}
		else if (percent < 0.5)
			return(Math.round(percent*510));
		else
			return(255);
	};
	$scope.rgbVal3 = function(percent){
		if (percent === 0){
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

	
//	*/
		
}]);