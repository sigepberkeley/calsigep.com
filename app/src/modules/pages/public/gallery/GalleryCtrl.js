/**
*/

'use strict';

angular.module('myApp').controller('GalleryCtrl', ['$scope', 'appHttp', '$timeout', 
function($scope, appHttp, $timeout)
{
	$scope.albums = [];
	$scope.album_view = false;
	$scope.cur_album = {'photos': []};		//Currently viewed album
	
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
	
	$scope.viewAlbum = function(index)
	{
		$scope.cur_album = $scope.albums[index];
		$scope.album_view = true;
		
		if($scope.albums[index].loaded !== true)
		{
			//Look up the rest of the album's data
			var read_promise =appHttp.go({}, {url:'photo/readAlbum', data:  {'album_id': $scope.albums[index]._id}  }, {});
			read_promise.then(
				function(ret1)
				{
					$scope.albums[index] = ret1.result.album;
					$scope.albums[index].loaded = true;		//So we know not to look it up again
					$scope.cur_album = $scope.albums[index];
					$scope.slides = $scope.cur_album.photos;
					$timeout(function() {
						$scope.$broadcast('jrgCarouselReInit', {});
					}, 250);
				},
				function(ret1)
				{
					console.log(ret1.msg);
				}
			);
		}
	};
	
	//Carousel
	$scope.slides = [{'placeholder': ''}];
	$scope.opts =
	{
		'curSlide': 0
	};
	
}]);