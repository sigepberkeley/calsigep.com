/**
Development Challenge Goals tracker
- heat map organized by 3 things: person, challenge goal, date (choose one then can view the other 2 as x and y axes on a grid for the chosen one)
- allow users to put in updates/progress by day/week and then have that auto-calculate based on deadline if they're ahead or behind schedule (green =on pace, yellow =starting to lag, red=behind. Blue = complete & approved (by challenge coordinator))
- 3 key use cases:
	- admin
		- create, update, delete challenge goals
		- [access / ability to do anything a coordinator can do]
	- user (participant) [select ONE user and show grid of goals and dates]
		- update (and view) his own progress (be able to daily/weekly submit a current amount / state for each goal - we'll then auto-calculate if he's on, ahead of, or behind pace based on how much time has elapsed/is left)
		- view the progress of his mentee(s) (to help support and keep mentee(s) on track)
	- coordinator [select ONE date (most current/today) and show grid of users and goals]
		- see progress of all participants in the challenge
		- mark/confirm a challenge goal complete for one or more users
		- create, update a user's challenge (i.e. mark them complete in the Sigma Challenge by setting the date_completed value and start them in the Phi Challenge by setting the date_started and date_deadline
	
- api calls to write
	- view users.challenges for all users - DONE? - need to test
	- read challenge goals by (one) user - DONE? - need to test
	- be able to edit user.challenges (add them into new challenge and/or change date_started, date_deadline, date_completed for existing ones) - DONE? - need to test
		- this automatically adds in / updates all challenge goals for that challenge and sets the date_started and date_deadline for all those challenge goals
	- read by (one) date (and optionally select a challenge as well) - return all challenge goals (in the particular challenge) with a 'users' key that is an array of all users that have that goal (optionally that have NOT completed it?) with their LATEST (up until the date specified) milestone and date_started, date_deadline, date_completed.
	
	- view (& edit) challenges goals
		- general/standard viewing/editing (limit only to 'current' challenge versions unless otherwise specified) - JUST USE SEARCH FUNCTION?
		- "fork" a challenge's goals (i.e. for modified Epsilon program) - have checkboxes for which of the current ones to copy over and the name of the new/forked challenge to give these copied ones. - JUST USE UPDATE FUNCTION AND HANDLE ON FRONT END?
		
	- later
		- do privileges / security

		
RPC challengeGoal endpoints
@module challengeGoal
@class challengeGoalApi

@toc
1. rpcSearch
2. rpcRead
3. rpcSave (create or update, pending if _id field is present)
3.1. rpcSaveBulk
4. rpcDelete
5. rpcObsoleteChallenge
6. rpcSaveTag
7. rpcSearchTag
8. rpcReadByChallenge
*/

'use strict';

var lodash = require('lodash');
var inherits = require('util').inherits;

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

// var Base = require('./base');
// var Base = require('../../../routes/api/base.js');		//can't pass this in since it's used with inherits (which has to be outside the function definition??)
var Base =require(pathParts.routes+'api/base.js');

var ChallengeGoalMod = require(pathParts.controllers+'challengeGoal/challengeGoal.js');

var sampleChallengeGoalReturn = {
	_id: "objectid",
	challenge: "array",
	title: "string",
	description: "string",
	tags: "string"
};

var defaults = {
	group: 'challengeGoal',
	info: 'ChallengeGoal API',
	namespace: 'ChallengeGoal'
};

var db;

module.exports = ChallengeGoalApi;

/**
@param {Object} options
	@param {Object} db
*/
function ChallengeGoalApi(options){
	this.opts = lodash.extend({}, defaults, options||{});
	Base.call(this, this.opts);
	
	db =this.opts.db;
}

inherits(ChallengeGoalApi, Base);

ChallengeGoalApi.prototype.getRpcMethods = function(){
	return {
		search: this.rpcSearch(),
		read: this.rpcRead(),
		save: this.rpcSave(),
		saveBulk: this.rpcSaveBulk(),
		delete1: this.rpcDelete(),
		obsoleteChallenge: this.rpcObsoleteChallenge(),
		saveTag: this.rpcSaveTag(),
		searchTag: this.rpcSearchTag(),
		readByChallenge: this.rpcReadByChallenge()
	};
};

/**
@toc 1.
@method rpcSearch
**/
ChallengeGoalApi.prototype.rpcSearch = function(){
	var self = this;

	return {
		info: 'Search challenge goals',
		params: {
			searchString: { type: 'string', info: "Text to search for" },
			searchFields: { type: 'array', info: "Fields to search searchString within, i.e. ['first_name', 'last_name']" },
			skipIds: { type: 'array', info: "_id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))" },
			fields: { type: 'object', info: "Fields to return, i.e. {_id:1, first_name:1, last_name:1}" },
			skip: { type: 'number', info: "Where to start returning from (like a cursor), default =0" },
			limit: { type: 'number', info: "How many to return, default =20" }
		},
		returns: {
			code: 'string',
			msg: 'string',
			results: 'array'
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.search(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 2.
@method rpcRead
**/
ChallengeGoalApi.prototype.rpcRead = function(){
	var self = this;

	return {
		info: 'Read one or more challenge goals',
		params: {
			_id: { type: 'string', info: "Id for object to lookup. Will be converted to mongo object id if necessary." },
			_ids: { type: 'array', info: "Ids to look up object info on Will be converted to mongo object ids if necessary." },
			fullQuery: { type: 'object', info: "Full mongo query to use directly for read" },
			fields: { type: 'object', info: "Mongo query for which fields in the record to return. Use the empty object {} to get all fields." },
			query: { type: 'object', info: "Additional query for lookup (will be added to the id(s) query)." }
		},
		returns: {
			challenge_goal: sampleChallengeGoalReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.read(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 3.
@method rpcSave
**/
ChallengeGoalApi.prototype.rpcSave = function(){
	var self = this;

	return {
		info: 'Save (create or update (if _id field is present)) a challenge goal',
		params: {
			challenge_goal: {type: 'object', required: false, info: "The challenge goal object to insert/update. If _id is left out, will create this challenge goal with a new _id. All other parameters are optional and are the fields that will be updated. NOTE: challenge goal data will only be returned on CREATE, not on update." }
		},
		returns: {
			challenge_goal: sampleChallengeGoalReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.save(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 3.1.
@method rpcSaveBulk
**/
ChallengeGoalApi.prototype.rpcSaveBulk = function(){
	var self = this;

	return {
		info: "Bulk save (create or update (if _id field is present)) a challenge goal.",
		params: {
			challenge_goal: {type: 'array', required: true, info: "Array of the challenge goal objects to insert/update. For each challenge goal: If _id is left out, will create this challenge goal with a new _id. All other parameters are optional and are the fields that will be updated. NOTE: challenge goal data will only be returned on CREATE, not on update." },
			new_tags: { type: 'array', required: false, info: "Array of one or more NEW tags to create. Each item should have at least a name field. If set, this will add new tags and add their _id's to this goal as well." }
		},
		returns: {
			challenge_goal: [
				sampleChallengeGoalReturn
			]
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.saveBulk(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 4.
@method rpcDelete
**/
ChallengeGoalApi.prototype.rpcDelete = function(){
	var self = this;

	return {
		info: 'Removes one or more challenge goals',
		params: {
			challenge_goal_id: { type: 'string', info: "Id for object to delete. Will be converted to mongo object id if necessary." },
			_ids: { type: 'array', info: "Ids of objects to delete. Will be converted to mongo object ids if necessary." }
		},
		returns: {
			challenge_goal: sampleChallengeGoalReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.delete1(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 5.
@method rpcObsoleteChallenge
**/
ChallengeGoalApi.prototype.rpcObsoleteChallenge = function(){
	var self = this;

	return {
		info: 'Makes a new version of a challenge by copying all the existing goals and making a last active date for the existing ones. This is used to track versions of challenges through time since standards should be RAISED through time.',
		params: {
			challenge_name: { type: 'string', required: true, info: "Name of challenge to make obsolete/copy, i.e. 'epsilon'" },
			date_last_active: { type: 'string', required:false, info: "The last active date to set (defaults to current date)." }
		},
		returns: {
			challenge_goal_obsolete: [
				sampleChallengeGoalReturn
			]
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.obsoleteChallenge(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 6.
@method rpcSaveTag
**/
ChallengeGoalApi.prototype.rpcSaveTag = function(){
	var self = this;

	return {
		info: 'Saves (create if new, edit if _id already exists) one or more tags',
		params: {
			tags: { type: 'object', required: false, info: 'One or more objects of EXISTING tags to save/update. Each tag should have the _id field as the key and be an object with at least a name field. One of tags or new_tags is required.' },
			new_tags: { type: 'array', required: false, info: 'Array of one or more NEW tags to create. Each item should have at least a name field. One of tags or new_tags is required.' }
		},
		returns: {
			tags: {}
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data Params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.saveTag(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 7.
@method rpcSearchTag
**/
ChallengeGoalApi.prototype.rpcSearchTag = function(){
	var self = this;

	return {
		info: 'Search challenge goal tags',
		params: {
			searchString: { type: 'string', info: "Text to search for" },
			searchFields: { type: 'array', info: "Fields to search searchString within, i.e. ['first_name', 'last_name']" },
			skipIds: { type: 'array', info: "_id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))" },
			fields: { type: 'object', info: "Fields to return, i.e. {_id:1, first_name:1, last_name:1}" },
			skip: { type: 'number', info: "Where to start returning from (like a cursor), default =0" },
			limit: { type: 'number', info: "How many to return, default =20" }
		},
		returns: {
			code: 'string',
			msg: 'string',
			results: 'array'
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.searchTag(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 8.
@method rpcReadByChallenge
**/
ChallengeGoalApi.prototype.rpcReadByChallenge = function(){
	var self = this;

	return {
		info: 'Search challenge goals by challenge name and group by challenge group',
		params: {
			challenge_name: { type: 'string', required:true, info: "Challenge to lookup" }
		},
		returns: {
			code: 'string',
			msg: 'string',
			challenge: 'object'
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge goal params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeGoalMod.readByChallenge(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};