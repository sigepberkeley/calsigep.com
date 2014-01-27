/**
*/

'use strict';

angular.module('myApp').controller('AdminCreationCtrl', ['$scope', 'UserModel', 'appHttp',
function($scope, UserModel, appHttp)
{
	var user = UserModel.load();
	
	$scope.users = [];
	$scope.search = {'search_string': '' };
	
	$scope.searchUsers = function()
	{
		var search_data =
		{
			'searchString': $scope.search.search_string,
			'searchFields': ['first_name', 'last_name'],
			'fields': {'first_name':1, 'last_name':1, 'admin': 1, 'super_admin': 1, '_id': 1},
			'limit': 10000	//Just return everyone
		};
		
		var search_promise =appHttp.go({}, {url:'user/search', data:  search_data  }, {});
		search_promise.then(
			function(ret1)
			{
				$scope.users = ret1.result.results;
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	};
	
	$scope.makeAdmin = function(index)
	{
		var admin_promise =appHttp.go({}, {url:'user/makeAdmin', data:  {'user_id': user._id, 'new_admin_id': $scope.users[index]._id} }, {});
		admin_promise.then(
			function(ret1)
			{
				$scope.users[index].admin = 1;
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	};
	
}]);