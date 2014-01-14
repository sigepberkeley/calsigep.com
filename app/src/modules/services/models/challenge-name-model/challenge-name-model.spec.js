'use strict';

describe('appChallengeNameModel factory', function() {
	var $rootScope ={}, appChallengeNameModel, $httpBackend;
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function(_$rootScope_, _appChallengeNameModel_, _$httpBackend_) {
		$httpBackend =_$httpBackend_;
		$rootScope = _$rootScope_;
		appChallengeNameModel =_appChallengeNameModel_;
	}));
	
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});
	
	it('should read names both from backend api and locally if already have them', function() {
		var names =[];
		
		var challengeNames =[
			'name1',
			'name2'
		];
		$httpBackend.expectPOST('/api/challenge/readNames').respond({result: {names: challengeNames } });
		
		appChallengeNameModel.read({})
		.then(function(ret1) {
			names =ret1.names;
		});
		
		expect(names.length).toBe(0);
		$rootScope.$digest();
		$httpBackend.flush();
		expect(names.length).toBe(challengeNames.length);
		
		//go again now that have them
		appChallengeNameModel.read({})
		.then(function(ret1) {
			names =ret1.names;
		});
		$rootScope.$digest();
		expect(names.length).toBe(challengeNames.length);
	});
});