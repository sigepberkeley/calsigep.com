/**
Tests for all /api/userChallengeGoal endpoints

NOTE: "it" blocks with modularized/nested function and async code can be finicky - I don't think nested "it" blocks are allowed BUT need an outer "it" block to ensure the async code gets run (otherwise it will just complete immediately before running any tests). So if and when to use "done" for the it blocks and where to put them is sometimes hard to follow/trace. When in doubt, try an "it" block and if it errors or doesn't complete, try just putting an "expect" there directly - it's likely already in an "it" block..

@toc
public methods
1. UserChallengeGoal
2. UserChallengeGoal.run
private methods
3.5. clearData
3. before
4. after
5. go
	6. saveChallengeGoals
	7. saveChallenge
	10. addMilestone
	11. readByDate
	8. readChallenge
	9. readChallengeGoal
*/

'use strict';

var https = require("https");
var request = require('request');
var async = require('async');
var lodash = require('lodash');
var Q = require('q');
var moment = require('moment');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');
var ArrayMod =require(pathParts.services+'array/array.js');

var self, db, api;

//NOTE: make sure to namespace all values to ensure no conflicts with other modules that run asynchronously and may be altering the same challenge goals / data otherwise - leading to odd and very hard to debug errors..
var ns ='ucg_';		//namespace =UserChallengeGoal ('ucg' for short)
var TEST_USERS =[
	{
		email: ns+'t1@email.com',
		first_name: ns+'First',
		last_name: ns+'Last',
		password: ns+'pass',
		challenge: [],
		challenge_goal: []
	},
	{
		email: ns+'t2@email.com',
		first_name: ns+'First2',
		last_name: ns+'Last2',
		password: ns+'pass',
		challenge: [],
		challenge_goal: []
	}
];
var TEST_CHALLENGEGOALS =[
	{
		challenge: [
			{
				name: ns+'sigma'
			}
		],
		title: ns+'Epsilon Interviews',
		description: ns+'Desc'
	},
	{
		challenge: [
			{
				name: ns+'sigma'
			}
		],
		title: ns+'3.1 semester GPA'
	},
	{
		challenge: [
			{
				name: ns+'phi'
			}
		],
		title: ns+'3.15 semester GPA'
	},
	{
		challenge: [
			{
				name: ns+'epsilon'
			},
			{
				name: ns+'epsilon_special'
			}
		],
		title: ns+'3.2 semester GPA'
	},
	{
		challenge: [
			{
				name: ns+'brother_mentor'
			}
		],
		title: ns+'3.25 semester GPA'
	}
];
/**
Variable to store variables we need to use in multiple tests (i.e. counters)
@property globals
@type Object
*/
var globals ={
};

module.exports = UserChallengeGoal;

/**
Main function/object (will be exported)
@toc 1.
@method UserChallengeGoal
@param {Object} params
	@param {Object} db
	@param {Object} api
	// @param {Object} MongoDBMod
*/
function UserChallengeGoal(params) {
	db =params.db;
	api =params.api;
	// MongoDBMod =params.MongoDBMod;
	
	self =this;
}

/**
@toc 2.
@method UserChallengeGoal.run
@param {Object} params
*/
UserChallengeGoal.prototype.run =function(params) {
	var deferred =Q.defer();
	
	describe('UserChallengeGoalModule', function() {
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
	
	//drop test data
	var emails =[];
	var ii=0;
	for(ii =0; ii<TEST_USERS.length; ii++) {
		emails[ii] =TEST_USERS[ii].email;
	}
	db.user.remove({email: {$in:emails} }, function(err, numRemoved) {
		if(err) {
			ret.msg +="db.user.remove Error: "+err;
		}
		else if(numRemoved <1) {
			ret.msg +="db.user.remove Num removed: "+numRemoved;
		}
		else {
			ret.msg +="db.user.remove Removed "+numRemoved;
		}
		
		//remove challenge goals
		var titles =[];
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
		console.log('\nUserChallengeGoal BEFORE: '+ret1.msg);

		var reqObj, params;
		//create users then save _id's for use later
		async.forEach(TEST_USERS, function(user1, aCallback) {
			// params = lodash.clone(user1);
			reqObj =api.httpGo({method:'Auth.create'}, {data:user1}, {});
			request(reqObj, function(error, response, data)
			{
				data =api.parseData(data, {});
				user1._id =data.result.user._id;
				user1.authority_keys = {'user_id': user1._id, 'sess_id': data.result.user.sess_id};
				aCallback(false);
			});
		}, function(err) {
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
		console.log('\nUserChallengeGoal AFTER: '+ret1.msg);
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
	Insert all challenge goals first (could / should do this in before function..)
	@toc 6.
	@method saveChallengeGoals
	@param {Object} opts
	*/
	var saveChallengeGoals =function(opts) {
		var ii, params;
		var data;
		var challengeGoalsBulk =TEST_CHALLENGEGOALS;
		
		//bulked
		params ={
			challenge_goal: challengeGoalsBulk
		};
		api.expectRequest({method:'ChallengeGoal.saveBulk'}, {data:params}, {}, {})
		.then(function(res) {
			data =res.data.result;
			for(ii =0; ii<challengeGoalsBulk.length; ii++) {
				// expect(data.challenge_goal[ii].title).toEqual(challengeGoalsBulk[ii].title);
				// expect(data.challenge_goal[ii]._id).toBeDefined();
				TEST_CHALLENGEGOALS[ii]._id =data.challenge_goal[ii]._id;		//save for use later
			}
			saveChallenge({});
		});
	};
	
	
	/**
	@toc 7.
	@method saveChallenge
	@param {Object} opts
	*/
	var saveChallenge =function(opts) {
		var params =
		{
			user_id: TEST_USERS[0]._id,
			challenge: {
				name: TEST_CHALLENGEGOALS[0].challenge[0].name,
				date_started: '2013-08-20 09:15:00-07:00',
				date_deadline: '2013-12-15 09:15:00-07:00',
				date_completed: ''
			}
		};
		api.expectRequest({method:'UserChallengeGoal.saveChallenge'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			
			addMilestone({});
		});
	};
	
	/**
	@toc 10.
	@method addMilestone
	@param {Object} opts
	*/
	var addMilestone =function(opts) {
		//set dates to differentiate with readByDate later
		var milestones =[
			{
				value: 1,
				date: '2013-09-02 08:30:00-08:00'
			},
			{
				value: 3,
				description: 'interviewed johnny and bobby',
				date: '2013-09-07 08:30:00-08:00'
			},
			{
				value: 5,
				description: 'interviewed 2 more',
				date: '2013-09-15 13:03:05-08:00'
			}
		];
		
		/*
		//not working - timing? all over-writing each other?
		var promises =[], ii, params, deferreds =[];
		for(ii =0; ii<milestones.length; ii++) {
			(function(ii) {
				deferreds[ii] =Q.defer();
				params ={
					user_id: TEST_USERS[0]._id,
					challenge_goal_id: TEST_CHALLENGEGOALS[0]._id,
					milestone: milestones[ii]
				};
				api.expectRequest({method:'UserChallengeGoal.addMilestone'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
					expect(data.milestone.value).toBe(milestones[ii].value);
					deferreds[ii].resolve({});
				});
				
				promises[ii] =deferreds[ii].promise;
			})(ii);
		}
		
		Q.all(promises).then(function(ret1) {
			readByDate({});
		}, function(err) {
			readByDate({});
		});
		*/
		
		//in sequence
		var params;
		var curIndex =0;
		params ={
			user_id: TEST_USERS[0]._id,
			challenge_goal_id: TEST_CHALLENGEGOALS[0]._id,
			milestone: milestones[curIndex]
		};
		api.expectRequest({method:'UserChallengeGoal.addMilestone'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.milestone.value).toBe(milestones[curIndex].value);
			
			curIndex =1;
			params ={
				user_id: TEST_USERS[0]._id,
				challenge_goal_id: TEST_CHALLENGEGOALS[0]._id,
				milestone: milestones[curIndex]
			};
			api.expectRequest({method:'UserChallengeGoal.addMilestone'}, {data:params}, {}, {})
			.then(function(res) {
				var data =res.data.result;
				expect(data.milestone.value).toBe(milestones[curIndex].value);
				
				curIndex =2;
				params ={
					user_id: TEST_USERS[0]._id,
					challenge_goal_id: TEST_CHALLENGEGOALS[0]._id,
					milestone: milestones[curIndex]
				};
				api.expectRequest({method:'UserChallengeGoal.addMilestone'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
					expect(data.milestone.value).toBe(milestones[curIndex].value);
					
					readByDate({});
				});
			});
		});
		
	};
	
	/**
	@toc 11.
	@method readByDate
	@param {Object} opts
	*/
	var readByDate =function(opts) {
		var params =
		{
			date_max: '2013-09-08 08:30:00-08:00',		//set to after the 2nd milestone from above
			challenge_name: TEST_CHALLENGEGOALS[0].challenge[0].name		//must match at least one of the challenges for this challenge goal
		};
		api.expectRequest({method:'UserChallengeGoal.readByDate'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.users.length).toBe(1);
			//find the goal for this challenge goal id
			var index1 =ArrayMod.findArrayIndex(data.users[0].challenge_goal, 'challenge_goal_id', TEST_CHALLENGEGOALS[0]._id, {});
			
			//@todo - finish
			expect(data.users[0].challenge_goal[index1].milestone.date).toBe('2013-09-07 08:30:00-08:00');
			expect(data.users[0].challenge_goal[index1].milestone.value).toBe(3);		//the value set on the date '2013-09-07 08:30:00-08:00'
			
			readChallenge({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 8.
	@method readChallenge
	@param {Object} opts
	*/
	var readChallenge =function(opts) {
		var params =
		{
			user_id: TEST_USERS[0]._id
		};
		api.expectRequest({method:'UserChallengeGoal.readChallenge'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.challenge.length).toBe(1);
			
			readChallengeGoal({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 9.
	@method readChallengeGoal
	@param {Object} opts
	*/
	var readChallengeGoal =function(opts) {
		var params =
		{
			user_id: TEST_USERS[0]._id
		};
		api.expectRequest({method:'UserChallengeGoal.readChallengeGoal'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.challenge_goal.length).toBe(2);		//2 sigma challenge goals and we added the 'sigma' challenge
			
			//find the goal for the challenge goal id that we added milestones to
			var index1 =ArrayMod.findArrayIndex(data.challenge_goal, 'challenge_goal_id', TEST_CHALLENGEGOALS[0]._id, {});
			expect(data.challenge_goal[index1].milestone.length).toBe(3);
			
			deferred.resolve({});
		});
	};
	
	saveChallengeGoals({});		//start all the calls going
	
	return deferred.promise;
}