/**
*/

'use strict';

angular.module('myApp').controller('RosterCtrl', ['$scope', 'appHttp',
function($scope, appHttp) {
	
/**
 *  We're going to need a list of the member information. We can use 
 *  the ng-repeat directive to build the actual roster. 
 */

 /**
  *  Backend calls
  *  users stores array of user objects from the database
  */
	var params = {'fields': {}};

	params.searchString = 'undergrad';

	params.searchFields = ['alumni_status'];

	var promise1 = appHttp.go({}, {url:'user/search', data:params}, {});
		promise1.then(function(response) {
			$scope.users = response.result.results;		
	});

	


}]);