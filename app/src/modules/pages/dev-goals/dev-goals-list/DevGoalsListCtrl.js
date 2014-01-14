/**
*/

'use strict';

angular.module('myApp').controller('DevGoalsListCtrl', ['$scope', 'appHttp', 'appChallengeTagModel', '$q',
function($scope, appHttp, appChallengeTagModel, $q) {
	
	//set up jrg-lookup
	$scope.optsLookup ={};
	// $scope.filterFields =['title', 'tags', 'challenge.name'];
	// $scope.filterFields =['title', 'challenge.name'];		//'tags' actually isn't easy / performant to search since only store tag IDs so would need to stuff/populate names on backend FIRST and then lookup/search.. for now just skip and potentially add a separate "search by tags" backend function and frontend search/page
	$scope.filterFields =['title', 'xDisplay.challengeNames'];		//jrg-lookup doesn't support searching arrays (i.e. challenge[ii].name) so 'challenge.name' just looks for a "['challenge']['name']" field, which doesn't exist..) so need to create a derived/joined field to search
	$scope.goals =[];
	$scope.goalsRaw ={
	};
	
	/**
	@param {Object} params
		@param {Number} cursor Where to load from
		@param {Number} loadMorePageSize How many to return
		@param {String} searchText The string of text that was searched
	@param {Function} callback Function to pass the results back to - takes the following arguments:
		@param {Array} results The new results to add in
		@param {Object} [params]
	*/
	$scope.loadMoreGoals =function(params, callback) {
		var data1 ={
			skip: params.cursor || 0,
			limit:params.loadMorePageSize || 100,
			fields: {}		//return all
		};
		if(params.searchText !==undefined) {
			data1.searchString =params.searchText;
			// data1.searchFields =$scope.filterFields;		//fields are now different since backend supports 'challenge.name' searching of arrays while jrg-lookup doesn't
			data1.searchFields =['title', 'challenge.name'];
		}
		appHttp.go({}, {url:'challengeGoal/search', data:data1 }, {})
		.then(function(response) {
			formatGoals(response.result.results, {})
			.then(function(retGoals) {
				if(callback) {
					callback(retGoals.goals, {});
				}
				else {		//set directly
					$scope.goals =retGoals.goals;
				}
			});
			
		});
	};
	
	function init(params) {
		// searchGoals({});		//will be called from jrg-lookup directive
	}
	
	function formatGoals(goals, params) {
		var deferred =$q.defer();
		appChallengeTagModel.stuffChallengeTags(goals, {})
		.then(function(ret1) {
			goals =ret1.challengeGoals;
			
			var ii, challengeNames, jj;
			for(ii =0; ii<goals.length; ii++) {
				if(goals[ii].xDisplay ===undefined) {
					goals[ii].xDisplay ={};
				}
				goals[ii].xDisplay.visible =false;
				goals[ii].xDisplay.tagNames =goals[ii].xDisplay.tagNames.join(', ');
				
				//join challenge names into one string for jrg-lookup searching
				if(goals[ii].challenge !==undefined) {
					challengeNames =[];		//reset
					for(jj =0; jj<goals[ii].challenge.length; jj++) {
						challengeNames.push(goals[ii].challenge[jj].name);
					}
					goals[ii].xDisplay.challengeNames =challengeNames.join(', ');
				}
				else {
					goals[ii].xDisplay.challengeNames ='';
				}
			}
		
			deferred.resolve({goals: goals});
		});
		return deferred.promise;
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