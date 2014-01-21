'use strict';

describe('BrothersCtrl', function(){
	var ctrl, scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('BrothersCtrl', {$scope: scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});