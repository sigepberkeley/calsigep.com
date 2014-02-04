'use strict';

describe('CalendarCtrl', function() {
	var $ctrl, $scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function(_$rootScope_, _$controller_) {
		$scope = _$rootScope_.$new();
		$ctrl = _$controller_('CalendarCtrl', {$scope: $scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});