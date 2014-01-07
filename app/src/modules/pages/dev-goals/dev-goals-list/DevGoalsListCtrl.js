/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsListCtrl', ['$scope', 'appHttp',
function($scope, appHttp) {

	$scope.goals =[];
	
	appHttp.go({}, {url:'challengeGoal/search', data:{} }, {})
	.then(function(response) {
		response.result.results =formatGoals(response.result.results, {});
		$scope.goals =response.result.results;
	});
	
	function formatGoals(goals, params) {
		var ii;
		for(ii =0; ii<goals.length; ii++) {
			goals[ii].xDisplay ={
				visible: false
			};
		}
		return goals;
	}
}]);