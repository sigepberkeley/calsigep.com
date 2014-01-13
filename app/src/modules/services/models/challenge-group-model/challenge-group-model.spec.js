'use strict';

describe('appChallengeGroupModel factory', function() {
	var $rootScope ={}, appChallengeGroupModel, $httpBackend;
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function(_$rootScope_, _appChallengeGroupModel_, _$httpBackend_) {
		$httpBackend =_$httpBackend_;
		$rootScope = _$rootScope_;
		appChallengeGroupModel =_appChallengeGroupModel_;
	}));
	
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});
	
	it('should read groups both from backend api and locally if already have them', function() {
		var groups =[];
		
		var groupNames =[
			'name1',
			'name2'
		];
		$httpBackend.expectPOST('/api/challenge/readGroupNames').respond({result: {names: groupNames } });
		
		appChallengeGroupModel.read({})
		.then(function(ret1) {
			groups =ret1.groups;
		});
		
		expect(groups.length).toBe(0);
		$rootScope.$digest();
		$httpBackend.flush();
		expect(groups.length).toBe(groupNames.length);
		
		//go again now that have them
		appChallengeGroupModel.read({})
		.then(function(ret1) {
			groups =ret1.groups;
		});
		$rootScope.$digest();
		expect(groups.length).toBe(groupNames.length);
	});
});