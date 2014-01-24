'use strict';

describe('AdminAlbumEditCtrl', function(){
	var ctrl, scope ={};
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('AdminAlbumEditCtrl', {$scope: scope});
	}));
	
	/*
	it('should do something', function() {
	});
	*/
});