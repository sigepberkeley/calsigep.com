/**
A factory style service (simple but can not be injected during the compile phase like a provider can be), see here for more info: http://stackoverflow.com/questions/15666048/angular-js-service-vs-provider-vs-factory

@toc
//public
1. read
3. stuffChallengeTags
//private
2. getFromApi

@usage
//js Angular controller:
angular.module('myApp').controller('TestCtrl', ['$scope', 'appChallengeTagModel', function($scope, appChallengeTagModel) {
	var retVal =(appChallengeTagModel.test('my test val'));
	console.log(retVal);
}]);

*/

'use strict';

angular.module('app').factory('appChallengeTagModel', ['appStorage', 'appHttp', '$q', 'jrgArray', function(appStorage, appHttp, $q, jrgArray) {

	//public methods & properties that will be returned
	var publicObj ={
		
		/**
		@toc 1.
		@method read
		*/
		read: function(params) {
			var deferred =$q.defer();
			if(!tags || tags.length <1) {
				getFromApi({})
				.then(function(ret) {
					deferred.resolve({tags: tags});
				});
			}
			else {		//just return directly if we already have them
				deferred.resolve({tags: tags});
			}
			return deferred.promise;
		},
		
		/**
		Takes an array of challenge goal objects and replaces the 'tags' array for each with an object of tags (with an _id and name field) - this gives access to the NAMES of the tags (instead of just the id).
		@toc 3.
		@method stuffChallengeTags
		@param {Array} challengeGoals Array of challenge goal objects - the 'tags' field will be replaced in each of them (if this field exists).
			@example
				[
					{
						tags: [
							'id1',
							'id2'
						]
					}
				]
		@param {Object} params
		@return {Object} (via Promise)
			@param {Array} challengeGoals Array of challenge goal objects - but now with all 'tags' fields/arrays converted to objects with a 'name' field
				@example
					[
						{
							tags: [
								{
									_id: 'id1',
									name: 'tag name 1'
								},
								{
									_id: 'id2',
									name: 'tag name 2'
								}
							]
						}
					]
		*/
		stuffChallengeTags: function(challengeGoals, params) {
			var deferred =$q.defer();
			//ensure have tags
			this.read({})
			.then(function(retTag) {
				var ii, jj, tagIndex, tagNames;
				for(ii =0; ii<challengeGoals.length; ii++) {
					if(challengeGoals[ii].tags !==undefined) {
						tagNames =[];
						for(jj =0; jj<challengeGoals[ii].tags.length; jj++) {
							tagIndex =jrgArray.findArrayIndex(tags, '_id', challengeGoals[ii].tags[jj], {});
							//not found
							if(tagIndex <0) {
								challengeGoals[ii].tags[jj] ={
									_id: challengeGoals[ii].tags[jj],
									name: ''
								};
							}
							//found: set to the tag
							else {
								challengeGoals[ii].tags[jj] =tags[tagIndex];
							}
							tagNames.push(challengeGoals[ii].tags[jj].name);
						}
						if(challengeGoals[ii].xDisplay ===undefined) {
							challengeGoals[ii].xDisplay ={};
						}
						challengeGoals[ii].xDisplay.tagNames =tagNames;
					}
				}
				deferred.resolve({challengeGoals: challengeGoals});
			});
			return deferred.promise;
		}
		
	};
	
	//private methods and properties - should ONLY expose methods and properties publicly (via the 'return' object) that are supposed to be used; everything else (helper methods that aren't supposed to be called externally) should be private.
	/**
	@property tags
	@type Array
	*/
	var tags =[];
	
	/**
	@toc 2.
	@method getFromApi
	@param {Object} params
	@return {Object} (via Promise)
	*/
	function getFromApi(params) {
		var deferred =$q.defer();
		var data1 ={
			limit:999		//want to return all of them
		};
		appHttp.go({}, {url:'challengeGoal/searchTag', data:data1 }, {})
		.then(function(response) {
			tags =response.result.results;
			deferred.resolve({});
		});
		return deferred.promise;
	}
	
	return publicObj;
}]);