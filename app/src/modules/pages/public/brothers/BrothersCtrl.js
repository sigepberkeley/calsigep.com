/**
*/

'use strict';

angular.module('myApp').controller('BrothersCtrl', ['$scope', 'appHttp',
function($scope, appHttp)
{
	$scope.cur_brother = 0;

	$scope.officers = 
	[
		{ 'title': 'President', 'name': 'Nolan McPeek'},
		{ 'title': 'VP Recruitment', 'name': 'Matt Symonds'},
		{ 'title': 'VP Communications', 'name': 'Bryson Edgar'},
		{ 'title': 'Chaplain', 'name': 'Sebastien Welch'},
		{ 'title': 'VP Development', 'name': 'Akash Sharma'},
		{ 'title': 'VP Finance', 'name': 'Nick Hancock'},
		{ 'title': 'VP Programming', 'name': 'Ryan Miller'}
	];
	
	var read_promise =appHttp.go({}, {url:'user/search', data: {'fields': {}, 'searchString': 'undergrad', 'searchFields': ['alumni_status'], limit: 1000 } }, {});
	read_promise.then(
		function(ret1)
		{
			$scope.brothers = ret1.result.results;
			var ii;
			for(ii = 0; ii < $scope.brothers.length; ii++)
			{
				if($scope.brothers[ii].image === undefined || $scope.brothers[ii].image === null || $scope.brothers[ii].image.length < 1)
				{
					$scope.brothers[ii].image = 'images/bioPics/person-headshot-blank.jpg';
				}
			}
		},
		function(ret1)
		{
			console.log('Error');
		}
	);
	
	//Takes an index in $scope.brothers. Displays that brother's profile
	$scope.viewProfile = function(index)
	{
		//Handle wraparound
		if(index >= $scope.brothers.length)
		{
			index = 0;
		}
		else if(index < 0)
		{
			index = $scope.brothers.length - 1;
		}
		
		$scope.cur_brother = index;
		$scope.profile_show = true;
	};
	
	/*
	//Testing
	$scope.brothers = 
	[
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2014',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2015',
			'major': 'EECS',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2016',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2017',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2018',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': $scope.appPathImg + '/ie-safari-logo.png',
			'year': '2019',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		}
	];
	*/
}]);