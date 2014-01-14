/**
Tests for all /api/challengeGoal endpoints

NOTE: "it" blocks with modularized/nested function and async code can be finicky - I don't think nested "it" blocks are allowed BUT need an outer "it" block to ensure the async code gets run (otherwise it will just complete immediately before running any tests). So if and when to use "done" for the it blocks and where to put them is sometimes hard to follow/trace. When in doubt, try an "it" block and if it errors or doesn't complete, try just putting an "expect" there directly - it's likely already in an "it" block..

@toc
public methods
1. ChallengeGoal
2. ChallengeGoal.run
private methods
3.5. clearData
3. before
4. after
5. go
	6. save
	6.1. saveBulk
	6.2. saveUpdate
	7. read
	10. obsoleteChallenge
	8. search
	11. readByChallenge
	9. delete1
*/

'use strict';

var https = require("https");
var request = require('request');
var async = require('async');
var lodash = require('lodash');
var Q = require('q');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');

var self, db, api;

//NOTE: make sure to namespace all values to ensure no conflicts with other modules that run asynchronously and may be altering the same challenge goals / data otherwise - leading to odd and very hard to debug errors..
var TEST_CHALLENGEGOALS =[
	{
		challenge: [
			{
				name: 'challenge_goal_sigma'
			}
		],
		title: 'challenge_goal Epsilon Interviews',
		description: 'challenge_goal Interview/meet with at least 90% of Epsilons. Ask them: 1. why they joined SigEp, 2. favorite SigEp experience/memory, 3. 1 thing they would like to see from the Sigma class / chapter this semester. Note, can be up to 4 people per meeting (i.e. 2 sigmas & 2 epsilons), does not all have to be individual meetings (though those are preferred)'
	},
	{
		challenge: [
			{
				name: 'challenge_goal_sigma'
			}
		],
		title: 'challenge_goal 3.1 semester GPA'
	},
	{
		challenge: [
			{
				name: 'challenge_goal_phi'
			}
		],
		title: 'challenge_goal 3.15 semester GPA'
	},
	{
		challenge: [
			{
				name: 'challenge_goal_epsilon'
			},
			{
				name: 'challenge_goal_epsilon_special'
			}
		],
		title: 'challenge_goal 3.2 semester GPA'
	},
	{
		challenge: [
			{
				name: 'challenge_goal_brother_mentor'
			}
		],
		title: 'challenge_goal 3.25 semester GPA'
	}
];
var testChallengeGoal = TEST_CHALLENGEGOALS[0];
/**
Variable to store variables we need to use in multiple tests (i.e. counters)
@property globals
@type Object
*/
var globals ={
	obsoleteGoalsLength: 0,
	addedChallenges: []		//used for clean-up - saving challenge goals updates / inserts challenges to ensure the names/(point) groups are all in the challenge collection. So we need to remove these at the end.
};

module.exports = ChallengeGoal;

/**
Main function/object (will be exported)
@toc 1.
@method ChallengeGoal
@param {Object} params
	@param {Object} db
	@param {Object} api
	// @param {Object} MongoDBMod
*/
function ChallengeGoal(params) {
	db =params.db;
	api =params.api;
	// MongoDBMod =params.MongoDBMod;
	
	self =this;
}

/**
@toc 2.
@method ChallengeGoal.run
@param {Object} params
*/
ChallengeGoal.prototype.run =function(params) {
	var deferred =Q.defer();
	
	describe('ChallengeGoalModule', function() {
		it("should test all challenge goal calls", function(done)
		{
			var promise =before({});
			promise.then(function(ret1) {
				done();
				deferred.resolve(ret1);
			}, function(err) {
				deferred.reject(err);
			});
		});
	});
	
	return deferred.promise;
};

/**
@toc 3.5.
@method clearData
@param {Object} params
@return {Promise} This will ALWAYS resolve (no reject)
*/
function clearData(params) {
	var deferred =Q.defer();
	var ret ={msg: ''};
	
	//drop test challenge goal(s)
	var titles =[];
	var ii;
	for(ii =0; ii<TEST_CHALLENGEGOALS.length; ii++) {
		titles[ii] =TEST_CHALLENGEGOALS[ii].title;
	}
	db.challenge_goal.remove({title: {$in:titles} }, function(err, numRemoved) {
		if(err) {
			ret.msg +="db.challenge_goal.remove Error: "+err;
		}
		else if(numRemoved <1) {
			ret.msg +="db.challenge_goal.remove Num removed: "+numRemoved;
		}
		else {
			ret.msg +="db.challenge_goal.remove Removed "+numRemoved;
		}
		
		//also remove any challenges that were created (secondarily)
		var jj, challengeIds =[], curId;
		for(jj =0; jj<globals.addedChallenges.length; jj++) {
			curId =globals.addedChallenges[jj]._id;
			if(challengeIds.indexOf(curId) <0) {		//have to check since there may be duplicates
				challengeIds.push(curId);
			}
		}
		//convert to object id's
		challengeIds =MongoDBMod.makeIds({ids: challengeIds});
		db.challenge.remove({_id: {$in:challengeIds} }, function(err, numRemoved1) {
			if(err) {
				ret.msg +=" db.challenge.remove Error: "+err;
			}
			else if(numRemoved1 <1) {
				ret.msg +=" db.challenge.remove Num removed: "+numRemoved1;
			}
			else {
				ret.msg +=" db.challenge.remove Removed "+numRemoved1;
			}
			
			deferred.resolve(ret);
		});
		
	});
	
	return deferred.promise;
}

/**
@toc 3.
@method before
@param {Object} params
*/
function before(params) {
	var deferred =Q.defer();
	
	var promiseClearData =clearData({})
	.then(function(ret1) {
		console.log('\nChallengeGoal BEFORE: '+ret1.msg);

		var promise =go({});
		promise.then(function(ret1) {
			var promiseAfter =after({});
			promiseAfter.then(function(retAfter) {
				deferred.resolve(ret1);
			}, function(err) {
				deferred.reject(err);
			});
		}, function(err) {
			deferred.reject(err);
		});
	});

	return deferred.promise;
}

/**
Do clean up to put database back to original state it was before ran tests (remove test challenge goal(s), etc.)
@toc 4.
@method after
@param {Object} params
*/
function after(params) {
	var deferred =Q.defer();
	
	var promiseClearData =clearData({})
	.then(function(ret1) {
		console.log('\nChallengeGoal AFTER: '+ret1.msg);
		deferred.resolve({});
	});
	
	return deferred.promise;
}

/**
@toc 5.
@method go
@param {Object} params
*/
function go(params) {
	var deferred =Q.defer();
	var reqObj;
	
	/**
	Tests both save AND saveBulk (via function call) calls
	@toc 6.
	@method save
	@param {Object} opts
	*/
	var save =function(opts) {
		var promises =[], ii, params, deferreds =[];
		var data;
		var numBulk =2;		//hardcoded must match what's set in saveBulk
		var challengeGoalsBulk =TEST_CHALLENGEGOALS.slice(0, numBulk);
		var challengeGoalsNonBulk =TEST_CHALLENGEGOALS.slice(numBulk, TEST_CHALLENGEGOALS.length);
		
		//non bulked
		for(ii =0; ii<challengeGoalsNonBulk.length; ii++) {
			(function(ii) {
				deferreds[ii] =Q.defer();
				params ={
					challenge_goal: challengeGoalsNonBulk[ii]
				};
				api.expectRequest({method:'ChallengeGoal.save'}, {data:params}, {}, {})
				.then(function(res) {
					data =res.data.result;
					globals.addedChallenges =globals.addedChallenges.concat(data.challenge);		//save for clearing at end
					expect(data.challenge_goal.title).toEqual(challengeGoalsNonBulk[ii].title);
					expect(data.challenge_goal._id).toBeDefined();
					TEST_CHALLENGEGOALS[(ii+numBulk)]._id =data.challenge_goal._id;		//save for use later
					deferreds[ii].resolve({});
				});
				
				promises[ii] =deferreds[ii].promise;
			})(ii);
		}
		
		//once non-bulk promises are all done
		Q.all(promises).then(function(ret1) {
			saveBulk({});
		}, function(err) {
			saveBulk({});
		});
	};
	
	/**
	@toc 6.1.
	@method saveBulk
	@param {Object} opts
	*/
	var saveBulk =function(opts) {
		var ii, params;
		var data;
		var numBulk =2;		//hardcoded must match what's set in save
		var challengeGoalsBulk =TEST_CHALLENGEGOALS.slice(0, numBulk);
		var challengeGoalsNonBulk =TEST_CHALLENGEGOALS.slice(numBulk, TEST_CHALLENGEGOALS.length);
		
		//bulked
		params ={
			challenge_goal: challengeGoalsBulk
		};
		api.expectRequest({method:'ChallengeGoal.saveBulk'}, {data:params}, {}, {})
		.then(function(res) {
			data =res.data.result;
			globals.addedChallenges =globals.addedChallenges.concat(data.challenge);		//save for clearing at end
			for(ii =0; ii<challengeGoalsBulk.length; ii++) {
				expect(data.challenge_goal[ii].title).toEqual(challengeGoalsBulk[ii].title);
				expect(data.challenge_goal[ii]._id).toBeDefined();
				TEST_CHALLENGEGOALS[ii]._id =data.challenge_goal[ii]._id;		//save for use later
			}
			saveUpdate({});
		});
	};
	
	
	/**
	@toc 6.2.
	@method saveUpdate
	@param {Object} opts
	*/
	var saveUpdate =function(opts) {
		testChallengeGoal.title ='challenge_goal new title';
		var params =
		{
			challenge_goal: testChallengeGoal
		};
		api.expectRequest({method:'ChallengeGoal.save'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			globals.addedChallenges =globals.addedChallenges.concat(data.challenge);		//save for clearing at end
			read({'newTitle':testChallengeGoal.title});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 7.
	@method read
	@param {Object} opts
		@param {String} newTitle The challenge goal's updated title (will check it here to complete the 'saveUpdate' test)
	*/
	var read =function(opts) {
		var params ={
			_id: testChallengeGoal._id
		};
		api.expectRequest({method:'ChallengeGoal.read'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.result).toBeDefined();
			expect(data.result.title).toBe(opts.newTitle);
			expect(data.result.priority).toBe(testChallengeGoal.priority);
			
			obsoleteChallenge({});
		});
	};
	
	/**
	@toc 10.
	@method obsoleteChallenge
	@param {Object} opts
	*/
	var obsoleteChallenge =function(opts) {
		var params ={
			challenge_name: 'challenge_goal_epsilon'
		};
		api.expectRequest({method:'ChallengeGoal.obsoleteChallenge'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			globals.obsoleteGoalsLength =1;
			expect(data.challenge_goal_obsolete.length).toBe(globals.obsoleteGoalsLength);		//copied goals should be same length as original goals FOR THIS CHALLENGE
			
			search({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 8.
	@method search
	@param {Object} opts
	*/
	var search =function(opts) {
		// it('should return all challenge goals with no search query entered', function() {
		var params ={
		};
		api.expectRequest({method:'ChallengeGoal.search'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.results.length).toBe(TEST_CHALLENGEGOALS.length+globals.obsoleteGoalsLength);
			
			// it('should return the matched set of challenge goals with a search', function() {
			var params ={
				searchString: 'gpA',		//should be case-insensitive
				searchFields: ['title']
			};
			api.expectRequest({method:'ChallengeGoal.search'}, {data:params}, {}, {})
			.then(function(res) {
				var data =res.data.result;
				expect(data.results.length).toBe(4+globals.obsoleteGoalsLength);
				
				var params ={
					searchString: 'epsilon',
					searchFields: ['challenge.name']
				};
				api.expectRequest({method:'ChallengeGoal.search'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
					expect(data.results.length).toBe(1+globals.obsoleteGoalsLength);
					
					readByChallenge({});		//go to next function/test in sequence
				});
			});
		});
	};
	
	/**
	@toc 11.
	@method readByChallenge
	@param {Object} opts
	*/
	var readByChallenge =function(opts) {
		var params ={
			challenge_name: TEST_CHALLENGEGOALS[1].challenge[0].name
		};
		api.expectRequest({method:'ChallengeGoal.readByChallenge'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.challenge).toBeDefined();
			// console.log(data.challenge);
			//@todo - do some actual expects / tests here
			
			delete1({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 9.
	@method delete1
	@param {Object} opts
	*/
	var delete1 =function(opts) {
		var params ={};
		// it('should delete a challenge goal', function() {
		params ={
			challenge_goal_id: TEST_CHALLENGEGOALS[0]._id
		};
		api.expectRequest({method:'ChallengeGoal.delete1'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			
			params ={
			};
			api.expectRequest({method:'ChallengeGoal.search'}, {data:params}, {}, {})
			.then(function(res) {
				var data =res.data.result;
				expect(data.results.length).toBe((TEST_CHALLENGEGOALS.length-1+globals.obsoleteGoalsLength));		//should be 1 less now that deleted one
				
				// it('should delete multiple challenge goals', function() {
				params ={
					_ids: [TEST_CHALLENGEGOALS[1]._id, TEST_CHALLENGEGOALS[2]._id]
				};
				api.expectRequest({method:'ChallengeGoal.delete1'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
				
					params ={
					};
					
					api.expectRequest({method:'ChallengeGoal.search'}, {data:params}, {}, {})
					.then(function(res) {
						var data =res.data.result;
						expect(data.results.length).toBe((TEST_CHALLENGEGOALS.length-1-2+globals.obsoleteGoalsLength));		//should be 1 less now that deleted ones
						
						deferred.resolve({});
					});
					
				});
			
			});
		});
	};
	
	save({});		//start all the calls going
	
	return deferred.promise;
}