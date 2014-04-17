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
 *  userIterator returns an array of a specific piece of information on each user.
 *  @param users is an array of individuals with profiles on the website.
 *  @param param is the field for each user of which an array will be made.
 */


function formatUsers(users) {
	var user;
	for (var i = 0; i < users.length; i++) {
		user = users[i];
		if (user.position == "Position" || user.position === undefined) {
			user.position_hide = true;
		}
		user.dev_challenge = user.dev_challenge.charAt(0).toUpperCase() + user.dev_challenge.slice(1);
	}
	return users;
}
/**
 *  Backend calls
 *  users stores array of user objects from the database
 */
	var params = {'fields': {}};

	params.searchString = 'undergrad';

	params.searchFields = ['alumni_status'];

	var promise1 = appHttp.go({}, {url:'user/search', data:params}, {});
		promise1.then(function(response) {
			$scope.users = formatUsers(response.result.results);		
	});




}]);