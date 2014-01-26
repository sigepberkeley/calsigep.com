/**
*/

'use strict';

angular.module('myApp').controller('AdminAlbumEditCtrl', ['$scope', '$routeParams', 'UserModel', 'appHttp', '$location',
function($scope, $routeParams, UserModel, appHttp, $location)
{
	var user = UserModel.load();
	
	$scope.new_album = true;
	var album_id;
	$scope.album = {};
	$scope.cur_image = {};
	
	if($routeParams.album_id !== undefined && $routeParams.album_id !== null && $routeParams.album_id.length > 0)
	{
		$scope.new_album = false;
		album_id = $routeParams.album_id;
		
		var read_promise =appHttp.go({}, {url:'photo/readAlbum', data:  {'album_id': album_id}  }, {});
		read_promise.then(
			function(ret1)
			{
				$scope.album = ret1.result.album;
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	}
	
	$scope.saveAlbum = function()
	{
		$scope.msg = 'Saving...';
		if($scope.new_album === true)
		{
			var create_promise =appHttp.go({}, {url:'photo/createAlbum', data:  {'user_id': user._id, 'album': $scope.album}  }, {});
			create_promise.then(
				function(ret1)
				{
					$scope.msg = 'Album Saved';
					$scope.album = ret1.result.album;
					$scope.new_album = false;
					album_id = $scope.album._id;
					
					$location.url("admin-album-edit?album_id=" + album_id);
				},
				function(ret1)
				{
					$scope.msg = 'Error';
					console.log(ret1.msg);
				}
			);
		}
		else
		{
			var update_promise =appHttp.go({}, {url:'photo/updateAlbum', data:  {'user_id': user._id, 'album_id': album_id, 'album': $scope.album}  }, {});
			update_promise.then(
				function(ret1)
				{
					$scope.msg = 'Album Saved';
				},
				function(ret1)
				{
					$scope.msg = 'Error';
					console.log(ret1.msg);
				}
			);
		}
	};
	
	//Takes two indices in $scope.album.photos. Reorders so that the entry at the first index is at the second index.
	//Other entries shift by no more than 1 position.
	$scope.shiftPhoto = function(old_index, new_index)
	{
		if(new_index != old_index && new_index >= 0 && new_index < $scope.album.photos.length)
		{
			//Remove the old entry
			var temp = $scope.album.photos.splice(old_index, 1);
			//temp is now a single-element array
			
			//Insert the removed entry at the new index by removing 0 entries from that index and adding one
			$scope.album.photos.splice(new_index, 0, temp[0]);
		}
	};
	
	$scope.uploadOpts =
	{
		//'type':'byUrl',
		// 'uploadPath':'/imageUpload',
		'uploadPath': 'api/photo/uploadPhoto',
		'uploadDirectory':$scope.appPathImg + '/images/uploads',
		'serverParamNames': {
			'file': 'myFile'
		},
		'uploadCropPath':'/api/photo/cropPhoto',
		// 'callbackInfo':{'evtName':evtImageUpload, 'args':[{'var1':'yes'}]},
		'imageServerKeys':{'imgFileName':'result.fileNameSave', 'picHeight':'result.picHeight', 'picWidth':'result.picWidth', 'imgFileNameCrop':'result.newFileName'},                //hardcoded must match: server return data keys
		//'htmlDisplay':"<div class='ig-form-pic-upload'><div class='ig-form-pic-upload-button'>Select Photo</div></div>",
		// 'cropOptions': {'crop':true, 'cropMaxHeight':500, 'cropMaxWidth':500}
		'cropOptions': {'crop':true}
		//'values':{'dirPath':'/uploads'}
	};
	
	//Adds the photo currently uploaded in the file upload zone to the database and the album
	$scope.addPhoto = function()
	{
		var index1 =$scope.cur_image.url.lastIndexOf('.');
		var crop_file_name = $scope.cur_image.url.slice(0, index1) + '_crop' + $scope.cur_image.url.slice(index1, $scope.cur_image.url.length);
		
		var create_promise =appHttp.go({}, {url:'photo/createPhoto', data:  {'user_id': user._id, 'photo': {'url': crop_file_name}, 'album_id': album_id, 'current_location': $scope.appPathImg +'/images/uploads/'+ crop_file_name}  }, {});
		create_promise.then(
			function(ret1)
			{
				$scope.album.photos.push(ret1.result.photo);
				delete $scope.cur_image.url;
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	};
	
	//Remove the photo from the database and the album. File will remain on the server, however.
	$scope.deletePhoto = function(index)
	{
		var delete_promise =appHttp.go({}, {url:'photo/deletePhotos', data:  {'user_id': user._id, 'photo_ids': [$scope.album.photos[index]._id] }  }, {});
		delete_promise.then(
			function(ret1)
			{
				$scope.album.photos.splice(index, 1);
			},
			function(ret1)
			{
				console.log(ret1.msg);
			}
		);
	};
}]);