/**
*/

'use strict';

angular.module('myApp').controller('ProfileCtrl', ['$scope', 'UserModel', 'appHttp',
function($scope, UserModel, appHttp)
{
	$scope.user = UserModel.load();
	var user_id = $scope.user._id;
	
	var read_promise =appHttp.go({}, {url:'user/read', data:  {'_id': user_id, 'fields': {} }  }, {});
	read_promise.then(
		function(ret1)
		{
			$scope.user = ret1.result.result;
		},
		function(ret1)
		{
			$scope.msg = 'Error';
		}
	);
	
	$scope.alumni_status_opts =
	[
		{
			'val': 'alumnus',
			'name': 'Alumnus'
		},
		{
			'val': 'undergrad',
			'name': 'Undergrad'
		}
	];
	
	$scope.dev_challenge_opts =
	[
		{
			'val': 'sigma',
			'name': 'Sigma'
		},
		{
			'val': 'phi',
			'name': 'Phi'
		},
		{
			'val': 'epsilon',
			'name': 'Epsilon'
		}
	];
	
	$scope.live_in_opts =
	[
		{
			'val': 'Yes',
			'name': 'Yes'
		},
		{
			'val': 'No',
			'name': 'No'
		},
	];
	
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
	
	$scope.updateUser = function()
	{
		$scope.msg = 'Processing...';
		$scope.user.user_id = user_id;
		var update_promise =appHttp.go({}, {url:'user/update', data:  $scope.user  }, {});
		update_promise.then(
			function(ret1)
			{
				$scope.msg = 'Profile Updated';
			},
			function(ret1)
			{
				$scope.msg = 'Error';
			}
		);
	};
	
	
}]);