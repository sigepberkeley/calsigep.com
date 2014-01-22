/**
*/

'use strict';

angular.module('myApp').controller('AdminAlbumsCtrl', ['$scope', 'UserModel', 'appHttp',
function($scope, UserModel, appHttp)
{
	$scope.albums = [];
	var user = UserModel.load();
	
	var search_promise =appHttp.go({}, {url:'photo/searchAlbums', data:  {}  }, {});
	search_promise.then(
		function(ret1)
		{
			$scope.albums = ret1.result.albums;
		},
		function(ret1)
		{
			console.log(ret1.msg);
		}
	);
	
	$scope.deleteAlbum = function(index)
	{
		var delete_promise =appHttp.go({}, {url:'photo/deleteAlbums', data:  {'user_id': user._id, 'album_ids': [$scope.albums[index]._id], 'delete_photos': 1 }  }, {});
		delete_promise.then(
			function(ret1)
			{
				$scope.albums.splice(index, 1);
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	};
}]);