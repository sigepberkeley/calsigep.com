'use strict';

describe('ProfileCtrl', function(){
	var ctrl, scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('ProfileCtrl', {$scope: scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});