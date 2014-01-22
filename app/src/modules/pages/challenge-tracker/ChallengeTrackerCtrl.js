/**
*/

'use strict';

angular.module('myApp').controller('ChallengeTrackerCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', '$location', function($scope, $timeout, appHttp, UserModel, $location) {

	$scope.user =UserModel.load();
	$scope.userID = $scope.user._id;
	$scope.data1 = {
		user_id: $scope.userID
	};
	$scope.challenge = appHttp.go({}, {url:'userChallengeGoal/readChallenge', data:$scope.data1}, {});

	$scope.optsData = {
		'deadline': moment('2014-05-01', 'YYYY-MM-DD'),
		'startDate': moment('2014-01-07', 'YYYY-MM-DD')
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
						
						"date_last_active": "{String} YYYY-MM-DD HH:mm:ssZ OR undefined / not-exists for the current version. This is so can raise the standards with time but still see a copy of older 'versions' of the same challenge. I.e. the 'current' Epsilon goals will have this field blank and to 'retire' the current Epsilon goals to change them, the current ones would be cloned and the existing ones would get the current/last active date filled in.",
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
						
						"date_last_active": "{String} YYYY-MM-DD HH:mm:ssZ OR undefined / not-exists for the current version. This is so can raise the standards with time but still see a copy of older 'versions' of the same challenge. I.e. the 'current' Epsilon goals will have this field blank and to 'retire' the current Epsilon goals to change them, the current ones would be cloned and the existing ones would get the current/last active date filled in.",
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
	$scope.targetVal = function(goal_id){
		var xx, yy;
		for (xx in $scope.challenge_goals){
			// return $scope.challenge_goals[xx]._id;
			if ($scope.challenge_goals[xx]._id == goal_id)
				return $scope.challenge_goals[xx].challenge[0].target_value;
		}
		return -1;
	};
	$scope.percent = function(current, target, thisWeek, deadlineWeek){
		var temp, percent;
		temp = (current/target)/((thisWeek+1)/deadlineWeek);
		percent = Math.min(temp,1).toFixed(3);
		$scope.tempVal = percent;
		// return(percent);
	};
	$scope.rgbVal1 = function(percent, params){
		if ($scope.tempVal < 0.5)
			return(Math.round(255));
		else
			return(Math.round((1-$scope.tempVal)*510));
	};
	$scope.rgbVal2 = function(percent, params){
		if ($scope.tempVal < 0.5)
			return(Math.round($scope.tempVal*510));
		else
			return(255);
	};
	$scope.today = moment();
	$scope.numColumns = $scope.today.diff($scope.optsData.startDate, 'weeks');
	$scope.weeksToDeadline = $scope.optsData.deadline.diff($scope.optsData.startDate, 'weeks');
	$scope.columns = [];
	var ii;
	for (ii=0; ii<$scope.numColumns; ii++){
		if( $scope.columns[ii]===undefined) {
			$scope.columns[ii] = ii+1;
		}
	}

		
}]);