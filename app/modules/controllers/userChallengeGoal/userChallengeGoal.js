/**
UserChallengeGoal module representing the challenge goals
@module userChallengeGoal
@class userChallengeGoal

@toc
1. readChallenge
1.5. readChallengeGoal
2. saveChallenge
*/

'use strict';

var Q = require('q');
var lodash = require('lodash');
var async = require('async');
// var moment = require('moment');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var StringMod =require(pathParts.services+'string/string.js');
var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');
var CrudMod =require(pathParts.services+'crud/crud.js');
var LookupMod =require(pathParts.services+'lookup/lookup.js');
var DatetimeMod =require(pathParts.services+'datetime/datetime.js');
var ArrayMod =require(pathParts.services+'array/array.js');

var ChallengeGoalMod =require(pathParts.controllers+'challengeGoal/challengeGoal.js');

var self;

var defaults = {
};

/**
UserChallengeGoal module constructor
@class UserChallengeGoal
@constructor
@param options {Object} constructor options
**/
function UserChallengeGoal(options){
    this.opts = lodash.merge({}, defaults, options||{});

	self = this;
}

/**
@toc 1.
@method readChallenge
@param {Object} data
	@param {String} user_id Id of user to lookup challenges for
@param {Object} params
@return {Promise}
	@param {Array} challenge
**/
UserChallengeGoal.prototype.readChallenge = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'UserChallengeGoal.readChallenge ', challenge:false};

	var data1 ={
		_id: data.user_id,
		fields: {challenge:1}
	};
	var ppSend = {
		collection:'user'
	};
	CrudMod.read(db, data1, ppSend, function(err, ret1) {
		if(ret1.result) {
			ret.challenge =ret1.result;
		}
		deferred.resolve(ret);
	});
	
	return deferred.promise;
};

/**
@toc 1.5.
@method readChallengeGoal
@param {Object} data
	@param {String} user_id Id of user to lookup challenge goal for
@param {Object} params
@return {Promise}
	@param {Array} challenge_goal
**/
UserChallengeGoal.prototype.readChallengeGoal = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'UserChallengeGoal.readChallengeGoal ', challenge_goal:false};

	var data1 ={
		_id: data.user_id,
		fields: {challenge_goal:1}
	};
	var ppSend = {
		collection:'user'
	};
	CrudMod.read(db, data1, ppSend, function(err, ret1) {
		if(ret1.result) {
			ret.challenge_goal =ret1.result;
		}
		deferred.resolve(ret);
	});
	
	return deferred.promise;
};

/**
Saves (creates or updates) the user.challenge for this challenge AND adds in / updates the challenge goals to the user.challenge_goal array so the user has all the challenge goals for this challenge.
A. update user.challenge
B. update user.challenge_goal
	B1. read all challenge goals
	B2. read all USER's challenge goals
	B3. compare all challenge goals with USER's challenge goals - on match, UPDATE; else add new to user.challenge_goal for EACH goal that needs to be updated. When ALL updates (one per goal that needs to be added/updated) are done, resolve

@toc 2.
@method saveChallenge
@param {Object} data
	@param {String} user_id Id of user to save challenge for (either add into new challenge or change dates for existing challenge)
	@param {Object} challenge The challenge to add (or update)
		@param {String} [_id] Id of challenge sub object - if present, will be an update instead of a create
		@param {String} name
		@param {String} date_started
		@param {String} date_deadline
		@param {String} date_completed
@param {Object} params
	@param {Boolean} [resetChallengeGoals =false] True to reset all user.challenge_goals (even if already exist)
@return {Promise}
	// @param {Array} challenge
**/
UserChallengeGoal.prototype.saveChallenge = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'UserChallengeGoal.readChallenge ', challenge:false};

	//A. update / save this challenge into user.challenge
	var data1 ={
		main:{
			_id: data.user_id
		},
		subObj:data.challenge
	};
	CrudMod.saveSubArray(db, data1, {'collection':'user', 'subKey':'challenge', subKeysNoObjectId:true}, function(retSave) {
		//B. go through all challenge goals for this challenge (by name) and add / update them in user.challenge_goal
		
		//B1. read challenge goals
		ChallengeGoalMod.read(db, {fullQuery:{'challenge_name.name':data.challenge.name, 'date_last_active':{$exists:false} } }, {})
		.then(function(retRead) {
		
			//B2. read THIS USER's challenge goals
			self.readChallengeGoal(db, {user_id:data.user_id}, {})
			.then(function(retGoal) {
			
				//B3. now that have both all the challenge goals (in this challenge) and all the user's challenge goals, compare them and UPDATE on matches or ADD if not existing yet
				var promises =[], deferreds =[];
				var userGoals =retGoal.challenge_goal;
				var ii, index1, newGoal, dataUpdate, needToUpdate;
				for(ii =0; ii<retRead.challenge_goal.length; ii++) {
					//need closure inside for loop
					(function(ii) {
						deferreds[ii] =Q.defer();
						promises[ii] =deferreds[ii].promise;		//set for ALL to use closure on ii variable even though some will immediately resolve since no update is necessary
						needToUpdate =false;
						index1 =ArrayMod.findArrayIndex(userGoals, 'challenge_goal_id', retRead.challenge_goal[ii]._id, {});
						if(index1 >-1) {		//user already has this goal - UPDATE
							if(params.resetChallengeGoals !==undefined && params.resetChallengeGoals) {		//if WANT to overwrite (otherwise just leave it alone)
								newGoal ={
									_id: userGoals[index1]._id,
									challenge_goal_id: userGoals[index1].challenge_goal_id,
									date_started: data.challenge.date_started,
									date_deadline: data.challenge.date_deadline,
									milestone: []
								};
								needToUpdate =true;
							}
						}
						else {		//ADD
							newGoal ={
								challenge_goal_id: retRead.challenge_goal[ii]._id,
								date_started: data.challenge.date_started,
								date_deadline: data.challenge.date_deadline,
								milestone: []
							};
							needToUpdate =true;
						}
						
						if(needToUpdate) {
							dataUpdate ={
								main:{
									_id: data.user_id
								},
								subObj:newGoal
							};
							CrudMod.saveSubArray(db, dataUpdate, {'collection':'user', 'subKey':'challenge_goal', subKeysNoObjectId:true}, function(retSaveGoal) {
								deferreds[ii].resolve({});		//for now, not returning this/anything here
							}, function(err) {
								deferreds[ii].reject(err);
							});
						}
						else {		//just resolve immediately
							deferreds[ii].resolve({});
						}
					})(ii);
				}
				
				//when ALL updates/additions are done, THEN return
				Q.all(promises).then(function(ret1) {
					deferred.resolve(ret);
				}, function(err) {
					deferred.reject(ret);
				});

			});
		});
	});
	
	return deferred.promise;
};

/**
Module exports
@method exports
@return {UserChallengeGoal} UserChallengeGoal constructor
**/
module.exports = new UserChallengeGoal({});