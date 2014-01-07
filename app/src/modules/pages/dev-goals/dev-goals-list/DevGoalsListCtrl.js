/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsListCtrl', ['$scope', 'appHttp',
function($scope, appHttp) {

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
			response.result.results =formatGoals(response.result.results, {});
			$scope.goals =response.result.results;
		});
	}
	
	function formatGoals(goals, params) {
		var ii;
		for(ii =0; ii<goals.length; ii++) {
			goals[ii].xDisplay ={
				visible: false
			};
		}
		return goals;
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