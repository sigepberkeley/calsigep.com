/**
RPC challenge endpoints
@module challenge
@class challengeApi

@toc
1. rpcSearch
2. rpcRead
3. rpcSave (create or update, pending if _id field is present)
3.1. rpcSaveBulk
4. rpcDelete
5. rpcUpdateNamesAndGroups
6. rpcReadGroupNames
*/

'use strict';

var lodash = require('lodash');
var inherits = require('util').inherits;

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

// var Base = require('./base');
// var Base = require('../../../routes/api/base.js');		//can't pass this in since it's used with inherits (which has to be outside the function definition??)
var Base =require(pathParts.routes+'api/base.js');

var ChallengeMod = require(pathParts.controllers+'challenge/challenge.js');

var sampleChallengeReturn = {
	_id: "objectid",
	name: "string",
	max_duration: "number",
	min_points: "number",
	group: "array"
};

var defaults = {
	group: 'challenge',
	info: 'Challenge API',
	namespace: 'Challenge'
};

var db;

module.exports = ChallengeApi;

/**
@param {Object} options
	@param {Object} db
*/
function ChallengeApi(options){
	this.opts = lodash.extend({}, defaults, options||{});
	Base.call(this, this.opts);
	
	db =this.opts.db;
}

inherits(ChallengeApi, Base);

ChallengeApi.prototype.getRpcMethods = function(){
	return {
		search: this.rpcSearch(),
		read: this.rpcRead(),
		save: this.rpcSave(),
		saveBulk: this.rpcSaveBulk(),
		delete1: this.rpcDelete(),
		updateNamesAndGroups: this.rpcUpdateNamesAndGroups(),
		readGroupNames: this.rpcReadGroupNames(),
		readNames: this.rpcReadNames()
	};
};

/**
@toc 1.
@method rpcSearch
**/
ChallengeApi.prototype.rpcSearch = function(){
	var self = this;

	return {
		info: 'Search challenges',
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
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.search(db, params, {});
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
ChallengeApi.prototype.rpcRead = function(){
	var self = this;

	return {
		info: 'Read one or more challenges',
		params: {
			_id: { type: 'string', info: "Id for object to lookup. Will be converted to mongo object id if necessary." },
			_ids: { type: 'array', info: "Ids to look up object info on Will be converted to mongo object ids if necessary." },
			fullQuery: { type: 'object', info: "Full mongo query to use directly for read" },
			fields: { type: 'object', info: "Mongo query for which fields in the record to return. Use the empty object {} to get all fields." },
			query: { type: 'object', info: "Additional query for lookup (will be added to the id(s) query)." }
		},
		returns: {
			challenge: sampleChallengeReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.read(db, params, {});
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
ChallengeApi.prototype.rpcSave = function(){
	var self = this;

	return {
		info: 'Save (create or update (if _id field is present)) a challenge',
		params: {
			challenge: {type: 'object', required: false, info: "The challenge object to insert/update. If _id is left out, will create this challenge with a new _id. All other parameters are optional and are the fields that will be updated. NOTE: challenge data will only be returned on CREATE, not on update." }
		},
		returns: {
			challenge: sampleChallengeReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.save(db, params, {});
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
ChallengeApi.prototype.rpcSaveBulk = function(){
	var self = this;

	return {
		info: "Bulk save (create or update (if _id field is present)) a challenge.",
		params: {
			challenge: {type: 'array', required: true, info: "Array of the challenge objects to insert/update. For each challenge: If _id is left out, will create this challenge with a new _id. All other parameters are optional and are the fields that will be updated. NOTE: challenge data will only be returned on CREATE, not on update." }
		},
		returns: {
			challenge: [
				sampleChallengeReturn
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
			var promise =ChallengeMod.saveBulk(db, params, {});
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
ChallengeApi.prototype.rpcDelete = function(){
	var self = this;

	return {
		info: 'Removes one or more challenges',
		params: {
			challenge_id: { type: 'string', info: "Id for object to delete. Will be converted to mongo object id if necessary." },
			_ids: { type: 'array', info: "Ids of objects to delete. Will be converted to mongo object ids if necessary." }
		},
		returns: {
			challenge: sampleChallengeReturn
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.delete1(db, params, {});
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
@method rpcUpdateNamesAndGroups
**/
ChallengeApi.prototype.rpcUpdateNamesAndGroups = function(){
	var self = this;

	return {
		info: 'Takes an array of names and groups for each name and updates (or adds) the appropriate challenge',
		params: {
			names: { type: 'array', required: true, info: "Names to insert (if do not already exist)" },
			groupsByName: { type: 'object', info: "Organized by challenge name; each key is an array of group names per challenge" }
		},
		returns: {
			challenge: [
				sampleChallengeReturn
			]
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.updateNamesAndGroups(db, params, {});
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
@method rpcReadGroupNames
**/
ChallengeApi.prototype.rpcReadGroupNames = function(){
	var self = this;

	return {
		info: 'Returns all UNIQUE group names (from challenge.group.name)',
		params: {
		},
		returns: {
			names: []
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.readGroupNames(db, params, {});
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
@method rpcReadNames
**/
ChallengeApi.prototype.rpcReadNames = function(){
	var self = this;

	return {
		info: 'Returns all challenge names',
		params: {
		},
		returns: {
			names: []
		},
		/**
		@method action
		@param {Object} params
			@param {Object} data new challenge params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =ChallengeMod.readNames(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};