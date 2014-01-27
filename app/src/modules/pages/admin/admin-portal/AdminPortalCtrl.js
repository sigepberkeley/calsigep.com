/**
*/

'use strict';

angular.module('myApp').controller('AdminPortalCtrl', ['$scope',
function($scope)
{
	$scope.links =
	[
		{
			'href': 'admin-albums',
			'text': 'Manage Albums'
		},
		{
			'href': 'admin-creation',
			'text': 'Create New Admin'
		}
	];
}]);