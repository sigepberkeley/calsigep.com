/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsListCtrl', ['$scope', 'appHttp', 'appChallengeTagModel',
function($scope, appHttp, appChallengeTagModel) {

	$scope.goals =[];
	
	function init(params) {
		searchGoals({});
	}
	
	function searchGoals(params) {
		var data1 ={
			limit:100,
			fields: {}		//return all
		};
		appHttp.go({}, {url:'challengeGoal/search', data:data1 }, {})
		.then(function(response) {
			formatGoals(response.result.results, {});
		});
	}
	
	function formatGoals(goals, params) {
		appChallengeTagModel.stuffChallengeTags(goals, {})
		.then(function(ret1) {
			goals =ret1.challengeGoals;
			
			var ii;
			for(ii =0; ii<goals.length; ii++) {
				if(goals[ii].xDisplay ===undefined) {
					goals[ii].xDisplay ={};
				}
				goals[ii].xDisplay.visible =false;
				goals[ii].xDisplay.tagNames =goals[ii].xDisplay.tagNames.join(', ');
			}
		
			$scope.goals =goals;
		});
	}
	
	$scope.deleteGoal =function(goal, goalsIndex, params) {
		var data1 ={
			challenge_goal_id: goal._id
		};
		appHttp.go({}, {url:'challengeGoal/delete1', data:data1 }, {})
		.then(function(response) {
			$scope.goals.splice(goalsIndex, 1);
		});
	};
	
	init({});
}]);