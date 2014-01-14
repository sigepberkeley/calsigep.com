/**
Tests for all /api/challenge endpoints

NOTE: "it" blocks with modularized/nested function and async code can be finicky - I don't think nested "it" blocks are allowed BUT need an outer "it" block to ensure the async code gets run (otherwise it will just complete immediately before running any tests). So if and when to use "done" for the it blocks and where to put them is sometimes hard to follow/trace. When in doubt, try an "it" block and if it errors or doesn't complete, try just putting an "expect" there directly - it's likely already in an "it" block..

@toc
public methods
1. Challenge
2. Challenge.run
private methods
3.5. clearData
3. before
4. after
5. go
	6. save
	6.1. saveBulk
	6.2. saveUpdate
	7. read
	8. search
	10. updateNamesAndGroups
	11. readGroupNames
	12. readNames
	13. readByName
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

//NOTE: make sure to namespace all values to ensure no conflicts with other modules that run asynchronously and may be altering the same challenges / data otherwise - leading to odd and very hard to debug errors..
var TEST_CHALLENGES =[
	{
		name: 'sigma',
		max_duration: 150,
		min_points: 0
	},
	{
		name: 'phi',
		max_duration: 150,
		min_points: 0
	},
	{
		name: 'epsilon',
		max_duration: 300,
		min_points: 0
	},
	{
		name: 'brother_mentor',
		max_duration: 500,
		min_points: 0
	},
	{
		name: 'fellow',
		max_duration: 1000,
		min_points: 0
	}
];
var testChallenge = TEST_CHALLENGES[0];
/**
Variable to store variables we need to use in multiple tests (i.e. counters)
@property globals
@type Object
*/
var globals ={
	newNameChallenges: []		//array of new challenges, each is an object that has at least a 'name' key
};

module.exports = Challenge;

/**
Main function/object (will be exported)
@toc 1.
@method Challenge
@param {Object} params
	@param {Object} db
	@param {Object} api
	// @param {Object} MongoDBMod
*/
function Challenge(params) {
	db =params.db;
	api =params.api;
	// MongoDBMod =params.MongoDBMod;
	
	self =this;
}

/**
@toc 2.
@method Challenge.run
@param {Object} params
*/
Challenge.prototype.run =function(params) {
	var deferred =Q.defer();
	
	describe('ChallengeModule', function() {
		it("should test all challenge calls", function(done)
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
	
	//drop test challenge(s)
	var names =[];
	var ii=0;
	for(ii =0; ii<TEST_CHALLENGES.length; ii++) {
		names[ii] =TEST_CHALLENGES[ii].name;
	}
	//add new name challenges too
	for(ii =0; ii<globals.newNameChallenges.length; ii++) {
		names.push(globals.newNameChallenges[ii].name);
	}
	db.challenge.remove({name: {$in:names} }, function(err, numRemoved) {
		if(err) {
			ret.msg +="db.challenge.remove Error: "+err;
		}
		else if(numRemoved <1) {
			ret.msg +="db.challenge.remove Num removed: "+numRemoved;
		}
		else {
			ret.msg +="db.challenge.remove Removed "+numRemoved;
		}
		
		deferred.resolve(ret);
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
		console.log('\nChallenge BEFORE: '+ret1.msg);

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
Do clean up to put database back to original state it was before ran tests (remove test challenge(s), etc.)
@toc 4.
@method after
@param {Object} params
*/
function after(params) {
	var deferred =Q.defer();
	
	var promiseClearData =clearData({})
	.then(function(ret1) {
		console.log('\nChallenge AFTER: '+ret1.msg);
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
		var challengesBulk =TEST_CHALLENGES.slice(0, numBulk);
		var challengesNonBulk =TEST_CHALLENGES.slice(numBulk, TEST_CHALLENGES.length);
		
		//non bulked
		for(ii =0; ii<challengesNonBulk.length; ii++) {
			(function(ii) {
				deferreds[ii] =Q.defer();
				params ={
					challenge: challengesNonBulk[ii]
				};
				api.expectRequest({method:'Challenge.save'}, {data:params}, {}, {})
				.then(function(res) {
					data =res.data.result;
					expect(data.challenge.name).toEqual(challengesNonBulk[ii].name);
					expect(data.challenge._id).toBeDefined();
					TEST_CHALLENGES[(ii+numBulk)]._id =data.challenge._id;		//save for use later
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
		var challengesBulk =TEST_CHALLENGES.slice(0, numBulk);
		var challengesNonBulk =TEST_CHALLENGES.slice(numBulk, TEST_CHALLENGES.length);
		
		//bulked
		params ={
			challenge: challengesBulk
		};
		api.expectRequest({method:'Challenge.saveBulk'}, {data:params}, {}, {})
		.then(function(res) {
			data =res.data.result;
			for(ii =0; ii<challengesBulk.length; ii++) {
				expect(data.challenge[ii].name).toEqual(challengesBulk[ii].name);
				expect(data.challenge[ii]._id).toBeDefined();
				TEST_CHALLENGES[ii]._id =data.challenge[ii]._id;		//save for use later
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
		testChallenge.name ='challenge new name';
		var params =
		{
			challenge: testChallenge
		};
		api.expectRequest({method:'Challenge.save'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			read({'newName':testChallenge.name});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 7.
	@method read
	@param {Object} opts
		@param {String} newName The challenge's updated name (will check it here to complete the 'saveUpdate' test)
	*/
	var read =function(opts) {
		var params ={
			_id: testChallenge._id
		};
		api.expectRequest({method:'Challenge.read'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.result).toBeDefined();
			expect(data.result.name).toBe(opts.newName);
			
			search({});
		});
	};
	
	/**
	@toc 8.
	@method search
	@param {Object} opts
	*/
	var search =function(opts) {
		// it('should return all challenges with no search query entered', function() {
		var params ={
		};
		api.expectRequest({method:'Challenge.search'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.results.length).toBe(TEST_CHALLENGES.length);
			
			// it('should return the matched set of challenges with a search', function() {
			var params ={
				searchString: 'brother_Mentor',		//should be case-insensitive		//note: can NOT use the [0] test challenge since that name was CHANGED via the save call test above!
				searchFields: ['name']
			};
			api.expectRequest({method:'Challenge.search'}, {data:params}, {}, {})
			.then(function(res) {
				var data =res.data.result;
				expect(data.results.length).toBe(1);
				
				var params ={
					searchString: 'epsilon',
					searchFields: ['name']
				};
				api.expectRequest({method:'Challenge.search'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
					expect(data.results.length).toBe(1);
					
					updateNamesAndGroups({});		//go to next function/test in sequence
				});
			});
		});
	};
	
	/**
	@toc 10.
	@method updateNamesAndGroups
	@param {Object} opts
	*/
	var updateNamesAndGroups =function(opts) {
		var params ={
			//2 new challenges ('phi_edit' and 'sigma', which was re-named earlier so now is 'new')
			names: ['sigma', 'phi_edit', 'epsilon'],
			//4 new groups
			groupsByName: {
				sigma: ['group1', 'group2'],
				phi_edit: ['group3', 'group1'],
				epsilon: ['group4']
			}
		};
		globals.newNameChallenges =[
			{
				name: 'sigma'
			},
			{
				name: 'phi_edit'
			}
		];		//set so delete expectations can be matched appropriately
		
		api.expectRequest({method:'Challenge.updateNamesAndGroups'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			readGroupNames({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 11.
	@method readGroupNames
	@param {Object} opts
	*/
	var readGroupNames =function(opts) {
		var params ={
		};
		api.expectRequest({method:'Challenge.readGroupNames'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.names.length).toBe(4);
			readNames({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 12.
	@method readNames
	@param {Object} opts
	*/
	var readNames =function(opts) {
		var params ={
		};
		api.expectRequest({method:'Challenge.readNames'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.names.length).toBe(TEST_CHALLENGES.length+globals.newNameChallenges.length);
			readByName({});		//go to next function/test in sequence
		});
	};
	
	/**
	@toc 13.
	@method readByName
	@param {Object} opts
	*/
	var readByName =function(opts) {
		var params ={
			name: TEST_CHALLENGES[1].name
		};
		api.expectRequest({method:'Challenge.readByName'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			expect(data.challenge._id).toBe(TEST_CHALLENGES[1]._id);
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
		// it('should delete a challenge', function() {
		params ={
			challenge_id: TEST_CHALLENGES[0]._id
		};
		api.expectRequest({method:'Challenge.delete1'}, {data:params}, {}, {})
		.then(function(res) {
			var data =res.data.result;
			
			params ={
			};
			api.expectRequest({method:'Challenge.search'}, {data:params}, {}, {})
			.then(function(res) {
				var data =res.data.result;
				expect(data.results.length).toBe((TEST_CHALLENGES.length-1+globals.newNameChallenges.length));		//should be 1 less now that deleted one
				
				// it('should delete multiple challenges', function() {
				params ={
					_ids: [TEST_CHALLENGES[1]._id, TEST_CHALLENGES[2]._id]
				};
				api.expectRequest({method:'Challenge.delete1'}, {data:params}, {}, {})
				.then(function(res) {
					var data =res.data.result;
				
					params ={
					};
					
					api.expectRequest({method:'Challenge.search'}, {data:params}, {}, {})
					.then(function(res) {
						var data =res.data.result;
						expect(data.results.length).toBe((TEST_CHALLENGES.length-1-2+globals.newNameChallenges.length));		//should be 1 less now that deleted ones
						
						deferred.resolve({});
					});
					
				});
			
			});
		});
	};
	
	save({});		//start all the calls going
	
	return deferred.promise;
}