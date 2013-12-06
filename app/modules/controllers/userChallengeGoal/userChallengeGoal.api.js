/**	
@module userChallengeGoal
@class userChallengeGoalApi

@toc
1. rpcReadChallenge
1.5. rpcReadChallengeGoal
2. rpcSaveChallenge
*/

'use strict';

var lodash = require('lodash');
var inherits = require('util').inherits;

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

// var Base = require('./base');
// var Base = require('../../../routes/api/base.js');		//can't pass this in since it's used with inherits (which has to be outside the function definition??)
var Base =require(pathParts.routes+'api/base.js');

var UserChallengeGoalMod = require(pathParts.controllers+'userChallengeGoal/userChallengeGoal.js');

var defaults = {
	group: 'userChallengeGoal',
	info: 'UserChallengeGoal API',
	namespace: 'UserChallengeGoal'
};

var db;

module.exports = UserChallengeGoalApi;

/**
@param {Object} options
	@param {Object} db
*/
function UserChallengeGoalApi(options){
	this.opts = lodash.extend({}, defaults, options||{});
	Base.call(this, this.opts);
	
	db =this.opts.db;
}

inherits(UserChallengeGoalApi, Base);

UserChallengeGoalApi.prototype.getRpcMethods = function(){
	return {
		readChallenge: this.rpcReadChallenge(),
		readChallengeGoal: this.rpcReadChallengeGoal(),
		saveChallenge: this.rpcSaveChallenge()
	};
};

/**
@toc 1.
@method rpcReadChallenge
**/
UserChallengeGoalApi.prototype.rpcReadChallenge = function(){
	var self = this;

	return {
		info: 'Read challenges for one user',
		params: {
			user_id: { type: 'string', info: "Id of user to read for" }
		},
		returns: {
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
			var promise =UserChallengeGoalMod.readChallenge(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};

/**
@toc 1.5.
@method rpcReadChallengeGoal
**/
UserChallengeGoalApi.prototype.rpcReadChallengeGoal = function(){
	var self = this;

	return {
		info: 'Read challenge goals for one user',
		params: {
			user_id: { type: 'string', info: "Id of user to read for" }
		},
		returns: {
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
			var promise =UserChallengeGoalMod.readChallengeGoal(db, params, {});
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
@method rpcSaveChallenge
**/
UserChallengeGoalApi.prototype.rpcSaveChallenge = function(){
	var self = this;

	return {
		info: 'Save (create or update if already have a challenge object with the given name)',
		params: {
			challenge: { type: 'object', info: "The full object to create/update." }
		},
		returns: {
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
			var promise =UserChallengeGoalMod.saveChallenge(db, params, {});
			promise.then(function(ret1) {
				out.win(ret1);
			}, function(err) {
				self.handleError(out, err, {});
			});
		}
	};
};