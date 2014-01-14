/**
*/

'use strict';

angular.module('myApp').controller('DevChallengeListCtrl', ['$scope', 'appHttp', 
function($scope, appHttp) {
	
	//set up jrg-lookup
	$scope.optsLookup ={};
	$scope.filterFields =['name'];
	$scope.challenges =[];
	$scope.challengesRaw ={};
	
	/**
	@param {Object} params
		@param {Number} cursor Where to load from
		@param {Number} loadMorePageSize How many to return
		@param {String} searchText The string of text that was searched
	@param {Function} callback Function to pass the results back to - takes the following arguments:
		@param {Array} results The new results to add in
		@param {Object} [params]
	*/
	$scope.loadMoreChallenges =function(params, callback) {
		var data1 ={
			skip: params.cursor || 0,
			limit:params.loadMorePageSize || 100,
			fields: {}		//return all
		};
		if(params.searchText !==undefined) {
			data1.searchString =params.searchText;
			data1.searchFields =$scope.filterFields;
		}
		appHttp.go({}, {url:'challenge/search', data:data1 }, {})
		.then(function(response) {
			var challenges =formatChallenges(response.result.results, {});
			if(callback) {
				callback(challenges, {});
			}
			else {		//set directly
				$scope.challenges =challenges;
			}
		});
	};
	
	/**
	@toc
	@method formatChallenges
	@return {Array} The same challenges passed in but with some added/changed fields
	*/
	function formatChallenges(challenges, params) {
		var ii;
		for(ii =0; ii<challenges.length; ii++) {
			if(challenges[ii].xDisplay ===undefined) {
				challenges[ii].xDisplay ={};
			}
			challenges[ii].xDisplay.visible =false;
		}
		return challenges;
	}
	
	$scope.deleteChallenge =function(challenge, challengesIndex, params) {
		var data1 ={
			challenge_id: challenge._id
		};
		appHttp.go({}, {url:'challenge/delete1', data:data1 }, {})
		.then(function(response) {
			$scope.challenges.splice(challengesIndex, 1);
		});
	};
	
}]);