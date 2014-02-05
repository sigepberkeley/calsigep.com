/**
UserChallengeGoal module representing the challenge goals
@module userChallengeGoal
@class userChallengeGoal

@toc
1. readChallenge
1.5. readChallengeGoal
2. saveChallenge
3. readByDate
4. addMilestone
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
var UserMod =require(pathParts.controllers+'user/user.js');

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
			ret.challenge =ret1.result.challenge;		//just want the challenge key itself; not the whole user object
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
			ret.challenge_goal =ret1.result.challenge_goal;		//just want the challenge_goal key itself; not the whole user object
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
		@param {String} date_started YYYY-MM-DD HH:mm:ssZ
		@param {String} date_deadline YYYY-MM-DD HH:mm:ssZ
		@param {String} date_completed YYYY-MM-DD HH:mm:ssZ
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
		ChallengeGoalMod.read(db, {fullQuery:{'challenge.name':data.challenge.name, 'date_last_active':{$exists:false} } }, {})
		.then(function(retRead) {
			console.log('Returned challenge goal' + JSON.stringify(retRead));
			//B2. read THIS USER's challenge goals
			self.readChallengeGoal(db, {user_id:data.user_id}, {})
			.then(function(retGoal) {
				console.log(retGoal);
				console.log(retRead.results.length);
				//B3. now that have both all the challenge goals (in this challenge) and all the user's challenge goals, compare them and UPDATE on matches or ADD if not existing yet
				var promises =[], deferreds =[];
				if (retGoal.challenge_goal === undefined){
					retGoal.challenge_goal = [];
				}
				var userGoals =retGoal.challenge_goal;
				var ii, index1, newGoal, dataUpdate, needToUpdate;
				for(ii =0; ii<retRead.results.length; ii++) {
					//need closure inside for loop
					(function(ii) {
						deferreds[ii] =Q.defer();
						promises[ii] =deferreds[ii].promise;		//set for ALL to use closure on ii variable even though some will immediately resolve since no update is necessary
						needToUpdate =false;
						index1 =ArrayMod.findArrayIndex(userGoals, 'challenge_goal_id', retRead.results[ii]._id, {});
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
								challenge_goal_id: retRead.results[ii]._id,
								date_started: data.challenge.date_started,
								date_deadline: data.challenge.date_deadline,
								milestone: []
							};
							needToUpdate =true;
						}
						console.log('need to update?:  ' + needToUpdate);
						console.log('The new goal to add: ' + newGoal);
						if(needToUpdate) {
							dataUpdate ={
								main:{
									_id: data.user_id
								},
								subObj:newGoal
							};
							CrudMod.saveSubArray(db, dataUpdate, {'collection':'user', 'subKey':'challenge_goal', subKeysNoObjectId:true}, function(retSaveGoal) {
								console.log('retSaveGoal:   '+retSaveGoal);
								deferreds[ii].resolve({});		//for now, not returning this/anything here

							}, function(err) {
								console.log('ERROR:  '+err);
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
Returns a list of all users and their challenge goals with just the MOST CURRENT milestone that is BEFORE the date_max that is passed in.

A. get all challenge goals for this challenge
B. get all users that have at least one of the challenge goals
C. go through each user challenge goal and 1. remove if not one of the goalIds, 2. add in challenge goal name, 3. remove all but appropriate milestone (the lastest that's before the data.date_max)

@toc 3.
@method readByDate
@param {Object} data
	@param {String} date_max YYYY-MM-DD HH:mm:ssZ The last date to read milestones for challenge goals (will return only milestones BEFORE this date)
	@param {String} challenge_name The challenge to return challenge goals for
@param {Object} params
@return {Object} (via Promise)
	@param {Array} users Has the user.challenge_goal array but with some modifications
		@param {Array} challenge_goal each challenge goal is an object of:
			@param {String} challenge_goal_id
			@param {String} challenge_goal_name This is a STUFFED / populated field that isn't normally here
			@param {String} date_started
			@param {String} date_deadline
			@param {String} date_completed
			@param {Object} milestone NOTE this is an OBJECT instead of a normal array since we're returning only for the LATEST date / milestone BEFORE the passed in data.date_max
				@param {String} date
				@param {Mixed} value
				@param {String} [description]
**/
UserChallengeGoal.prototype.readByDate = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'UserChallengeGoal.readByDate ', users:false};

	//A. get all challenge goals for this challenge
	ChallengeGoalMod.read(db, {fullQuery:{'challenge.name':data.challenge_name, 'date_last_active':{$exists:false} } }, {})
	.then(function(retRead) {
	
		var goals =retRead.results;
		//B. get all users that have at least one of the challenge goals
		var goalIds =[];
		var ii;
		for(ii =0; ii<goals.length; ii++) {
			goalIds.push(goals[ii]._id);
		}
		db.user.find({'challenge_goal.challenge_goal_id': {$in:goalIds} }, {challenge_goal:1, first_name:1, last_name:1}).toArray(function(err, users) {
			//C. go through each user challenge goal and 1. remove if not one of the goalIds, 2. add in challenge goal name, 3. remove all but appropriate milestone (the lastest that's before the data.date_max)
			var indexGoal, index1, jj, kk, ll, curGoal, curUserGoal, curMilestoneDate, milestoneDateTemp, milestoneKeepIndex;
			var removeIndices =[];		//will hold indices for which goals to REMOVE at the end
			
			// format goalIds for matching?? wtf?
			for(ii =0; ii<goalIds.length; ii++) {
				goalIds[ii] =goalIds[ii].toString();
			}
			//format challenge goal ids for matching..
			for(ii =0; ii<goals.length; ii++) {
				goals[ii]._id =MongoDBMod.idsToString({id: goals[ii]._id});
			}
			
			for(ii =0; ii<users.length; ii++) {
				removeIndices =[];		//reset (do per user)
				for(jj =0; jj<users[ii].challenge_goal.length; jj++) {
					curUserGoal =users[ii].challenge_goal[jj];
					//C1. remove if not a challenge goal we're interested in (not in this challenge)
					index1 =goalIds.indexOf(curUserGoal.challenge_goal_id.toString());		//need to convert to string for match to work..
					if(index1 <0) {		//not found
						removeIndices.push(jj);
					}
					else {
						indexGoal =ArrayMod.findArrayIndex(goals, '_id', curUserGoal.challenge_goal_id.toString(), {});		//need to convert to string for matching..
						curGoal =goals[indexGoal];		//indexGoal should exist
						//C2. add in challenge goal name
						users[ii].challenge_goal[jj].challenge_goal_name =curGoal.title;
						
						//C3. remove all but most recent milestone BEFORE data.date_max
						curMilestoneDate ='0000-00-00 00:00:00+00:00';		//set arbitrarily low
						milestoneKeepIndex =false;		//reset
						if(users[ii].challenge_goal[jj].milestone !==undefined) {
							for(kk =0; kk<users[ii].challenge_goal[jj].milestone.length; kk++) {
								milestoneDateTemp =users[ii].challenge_goal[jj].milestone[kk].date;
								if(milestoneDateTemp >curMilestoneDate && milestoneDateTemp <=data.date_max) {
									milestoneDateTemp =curMilestoneDate;
									milestoneKeepIndex =kk;
								}
							}
							users[ii].challenge_goal[jj].milestone =users[ii].challenge_goal[jj].milestone[milestoneKeepIndex];
						}
					}
				}
				
				//remove non-matching goals
				for(jj =(removeIndices.length-1); jj>=0; jj--) {
					// users[ii].challenge_goal.splice(removeIndices[jj], 1);
					users[ii].challenge_goal =ArrayMod.remove(users[ii].challenge_goal, removeIndices[jj]);
				}
			}
			
			ret.users =users;
			deferred.resolve(ret);
		});
	});
	
	return deferred.promise;
};

/**
Adds one milestone to the user.challenge_goal.milestone array for the given user_id and challenge_goal_id
@toc 4.
@method addMilestone
@param {Object} data
	@param {String} user_id Id of user to save challenge goal milestone for
	@param {String} challenge_goal_id
	@param {Object} milestone
		@param {Mixed} value
		@param {String} [description]
		@param {String} [date =current timestamp] YYYY-MM-DD HH:mm:ssZ Optional (defaults to current datetime)
@param {Object} params
@return {Object} (via Promise)
	@param {Object} milestone The final milestone that was saved (i.e. now with the date field added in)
**/
UserChallengeGoal.prototype.addMilestone = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'UserChallengeGoal.addMilestone ', milestone:false};

	//read user
	UserMod.read(db, {_id:data.user_id, fields:{_id: 1, challenge_goal:1} }, {})
	.then(function(retUser) {
		var challengeGoal =retUser.result.challenge_goal;
		var index1 =ArrayMod.findArrayIndex(challengeGoal, 'challenge_goal_id', data.challenge_goal_id, {});
		if(index1 >-1) {
			if(challengeGoal[index1].milestone ===undefined) {
				challengeGoal[index1].milestone =[];
			}
			var curMilestone =data.milestone;
			curMilestone._id =MongoDBMod.objectId({string:true});
			if(curMilestone.date ===undefined) {
				curMilestone.date =DatetimeMod.timestamp({});
			}
			// console.log('challenge goal adding milestone to: '+JSON.stringify(challengeGoal));
			challengeGoal[index1].milestone.push(curMilestone);
			
			//save
			var newUserData ={
				user_id: retUser.result._id,
				challenge_goal: challengeGoal
			};
			UserMod.update(db, newUserData, {})
			.then(function(ret1) {
				ret.milestone =curMilestone;
				deferred.resolve(ret);
			}, function(retErr) {
				deferred.reject(retErr);
			});
		}
		else {
			ret.code =2;
			ret.msg +="challenge_goal_id does not exist ";
			deferred.reject(ret);
		}
	}, function(retErr) {
		deferred.reject(retErr);
	});
	
	return deferred.promise;
};

/**
Module exports
@method exports
@return {UserChallengeGoal} UserChallengeGoal constructor
**/
module.exports = new UserChallengeGoal({});