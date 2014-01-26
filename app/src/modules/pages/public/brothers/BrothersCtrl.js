/**
*/

'use strict';

angular.module('myApp').controller('BrothersCtrl', ['$scope', 'appHttp',
function($scope, appHttp)
{
	$scope.cur_brother = 0;

	$scope.officers = 
	[
		{ 'title': 'President', 'name': 'Matt Symonds'},
		{ 'title': 'VP Recruitment', 'name': 'Jordan Gilles'},
		{ 'title': 'VP Communications', 'name': 'Divit Sood'},
		{ 'title': 'Chaplain', 'name': 'Keane Ellis'},
		{ 'title': 'VP Development', 'name': 'Milan Amin'},
		{ 'title': 'VP Finance', 'name': 'Aidan Clark'},
		{ 'title': 'VP Programming', 'name': 'Eric Liu'}
	];
	
	$scope.brothers = [];
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
			'image': 'ie-safari-logo.png',
			'year': '2014',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': 'ie-safari-logo.png',
			'year': '2015',
			'major': 'EECS',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': 'ie-safari-logo.png',
			'year': '2016',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': 'ie-safari-logo.png',
			'year': '2017',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': 'ie-safari-logo.png',
			'year': '2018',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		},
		{
			'first_name': 'John',
			'last_name': 'Bob',
			'image': 'ie-safari-logo.png',
			'year': '2019',
			'major': 'Math',
			'hometown': 'Berkeley, CA',
			'blurb': 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test.'
		}
	];
	*/

}]);