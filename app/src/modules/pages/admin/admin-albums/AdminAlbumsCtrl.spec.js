'use strict';

describe('AdminAlbumsCtrl', function(){
	var ctrl, scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('AdminAlbumsCtrl', {$scope: scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});