/**
A factory style service (simple but can not be injected during the compile phase like a provider can be), see here for more info: http://stackoverflow.com/questions/15666048/angular-js-service-vs-provider-vs-factory

@toc
//public
1. read
//private
2. getFromApi

@usage
//js Angular controller:
angular.module('myApp').controller('TestCtrl', ['$scope', 'appChallengeGroupModel', function($scope, appChallengeGroupModel) {
	var retVal =(appChallengeGroupModel.test('my test val'));
	console.log(retVal);
}]);

*/

'use strict';

angular.module('app').factory('appChallengeGroupModel', ['appStorage', 'appHttp', '$q', function(appStorage, appHttp, $q) {

	//public methods & properties that will be returned
	var publicObj ={
		/**
		@toc 1.
		@method read
		@param {Object} params
		@return {Object} (via Promise)
			@param {Array} groups The groups as a 1D array
		*/
		read: function(params) {
			var self =this;
			var deferred =$q.defer();
			if(!groups || groups.length <1) {
				getFromApi({})
				.then(function(ret) {
					deferred.resolve({groups:groups});
				});
			}
			else {		//just return directly if we already have them
				deferred.resolve({groups:groups});
			}
			return deferred.promise;
		}
		
	};
	
	//private methods and properties - should ONLY expose methods and properties publicly (via the 'return' object) that are supposed to be used; everything else (helper methods that aren't supposed to be called externally) should be private.
	/**
	@property groups
	@type Array
	*/
	var groups =[];
	
	/**
	@toc 2.
	@method getFromApi
	@param {Object} params
	@return {Object} (via Promise)
	*/
	function getFromApi(params) {
		var deferred =$q.defer();
		appHttp.go({}, {url:'challenge/readGroupNames', data:{} }, {})
		.then(function(response) {
			groups =response.result.names;
			deferred.resolve({});
		});
		return deferred.promise;
	}
	
	return publicObj;
}]);