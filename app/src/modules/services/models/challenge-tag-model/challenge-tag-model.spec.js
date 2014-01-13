'use strict';

describe('appChallengeTagModel factory', function() {
	var $rootScope ={}, appChallengeTagModel, $httpBackend;
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function(_$rootScope_, _appChallengeTagModel_, _$httpBackend_) {
		$httpBackend =_$httpBackend_;
		$rootScope = _$rootScope_;
		appChallengeTagModel =_appChallengeTagModel_;
	}));
	
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});
	
	it('should read tags both from backend api and locally if already have them', function() {
		var tags =[];
		
		var tagResults =[
			{_id:'id1', name:'tag1'},
			{_id:'id2', name: 'tag2'}
		];
		$httpBackend.expectPOST('/api/challengeGoal/searchTag').respond({result: {results: tagResults } });
		
		appChallengeTagModel.read({})
		.then(function(retTag) {
			tags =retTag.tags;
		});
		
		expect(tags.length).toBe(0);
		$rootScope.$digest();
		$httpBackend.flush();
		expect(tags.length).toBe(tagResults.length);
		
		//go again now that have them
		appChallengeTagModel.read({})
		.then(function(retTag) {
			tags =retTag.tags;
		});
		$rootScope.$digest();
		expect(tags.length).toBe(tagResults.length);
	});
	
	it('should have working stuffChallengeTags function', function() {
		var tagResults =[
			{_id:'id1', name:'tag1'},
			{_id:'id2', name: 'tag2'}
		];
		$httpBackend.expectPOST('/api/challengeGoal/searchTag').respond({result: {results: tagResults } });
		
		var challengeGoals =[
			{
				tags: [
					'id1',		//this DOES match a tag that is returned
					'tag2'
				]
			},
			{
				title: 'goal 2'
				//no tags
			},
			{
				title: 'goal 3',
				tags: [
					'id3'
				],
				xDisplay: {}		//pre-created xDisplay field
			}
		];
		
		var newChallengeGoals =false;
		appChallengeTagModel.stuffChallengeTags(challengeGoals, {})
		.then(function(retGoals) {
			newChallengeGoals =retGoals.challengeGoals;
		});
		$rootScope.$digest();
		$httpBackend.flush();
		
		expect(newChallengeGoals.length).toBe(challengeGoals.length);
	});
});