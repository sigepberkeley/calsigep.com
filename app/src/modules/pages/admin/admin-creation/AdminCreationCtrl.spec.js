'use strict';

describe('AdminCreationCtrl', function(){
	var ctrl, scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('AdminCreationCtrl', {$scope: scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});