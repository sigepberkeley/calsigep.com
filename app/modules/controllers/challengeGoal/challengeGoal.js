/**
The challenge collection is closely linked to this challenge_goal collection and whenever a challenge goal is saved / added, the challenge collection is updated with the name(s) of the challenges for that goal and any (points) groups for each challenge. This ensures that the challenge collection is always up to date and synced with the challenge goals (all challenge names and points groups in challenge goals will always be present the challenge collection as well).

ChallengeGoal module representing the challenge goals
@module challengeGoal
@class challengeGoal

@toc
1. search
2. read
3. save
3.1. saveBulk
3.5. saveActual (private function)
3.6. saveChallengeNamesAndGroups (private function)
4. delete1
5. obsoleteChallenge
6. saveTag
7. searchTag
8. readByChallenge
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

var ChallengeMod =require(pathParts.controllers+'challenge/challenge.js');

var self;

var defaults = {
};

/**
ChallengeGoal module constructor
@class ChallengeGoal
@constructor
@param options {Object} constructor options
**/
function ChallengeGoal(options){
    this.opts = lodash.merge({}, defaults, options||{});

	self = this;
}

/**
@toc 1.
@method search
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['title']] Fields to search searchString within
		@example ['title', 'description']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, title:1}] Fields to return
		@example {_id:1, title:1, priority:1}
	@param {Number} [skip =0] Where to start returning from (like a cursor)
	@param {Number} [limit =20] How many to return
@param {Object} params
@return {Promise}
	@param {Object} ret
		@param {Number} code
		@param {String} msg
		@param {Array} results
**/
ChallengeGoal.prototype.search = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.search '};

	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'title':1},
		'searchFields':['title']
	};
	if(data.fields ===undefined) {
		data.fields = defaults.fields;
	}
	if(data.limit ===undefined) {
		data.limit = defaults.limit;
	}
	if(data.searchFields ===undefined) {
		data.searchFields = defaults.searchFields;
	}

	var query ={};
	var ppSend =CrudMod.setSearchParams(data, query, {});
	
	LookupMod.search(db, 'challenge_goal', ppSend, function(err, ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Reads one or more challenge goals
@toc 2.
@method read
@param {Object} data One of '_id' or '_ids' or 'fullQuery' is required
	@param {String} [_id] Id for object to lookup. Will be converted to mongo object id if necessary.
	@param {Array} [_ids] Ids to look up object info on Will be converted to mongo object ids if necessary.
	@param {Object} [fullQuery] Full mongo query to use directly for read
	@param {Array} [fields ={'_id':1, 'title':1}] Mongo query for which fields in the record to return. Use the empty object {} to get all fields.
		@example {'_id':1, 'title':1, 'priority':1}
	@param {Object} [query] Additional query for lookup (will be added to the id(s) query).
@param {Object} params
@return {Promise}
	@param {Object} challenge_goal (or challenge_goals)
**/
ChallengeGoal.prototype.read = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.read ', challenge_goal:false};

	var ppSend = {
		'collection':'challenge_goal'
	};
	if(data._ids !==undefined) {		//for bulk read, return less info
		ppSend.defaults = {
			'fields':{'_id':1, 'title':1}
		};
	}
	else if(data.fields !== undefined)
	{
		ppSend.defaults =
		{
			'fields': data.fields
		};
	}
	else
	{
		ppSend.defaults =
		{
			'fields':{}
		};
	}
	CrudMod.read(db, data, ppSend, function(err, ret1) {
		/*
		//TESTING SMS
		if(ret1.result && ret1.result.phone) {
			TextMod.send({textParams: {to: ret1.result.phone.number, text:'Test Text!'} });
		}
		//end: TESTING SMS
		*/
	
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Creates or updates a challenge goal
@toc 3.
@method save
@param {Object} data
	@param {Object} challenge_goal The data to save. If '_id' field is present, it will update; otherwise it will create
	@param {Array} [new_tags] Array of one or more NEW tags to create. Each item should have at least a name field. One of tags or new_tags is required.
		@param {String} name
@param {Object} params
	@param {Boolean} [bulk] True if called from bulk call
@return {Promise}
	@param {Object} challenge_goal
	@param {Array} challenge Array of challenge objects from the names/groups in this challenge goal
**/
ChallengeGoal.prototype.save = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.save ', challenge_goal:{}};
	
	if(data.new_tags !==undefined) {
		self.saveTag(db, {new_tags:data.new_tags}, {})
		/**
		@param {Object} retTag
			@param {Array} tags The final tags (now all joined into an object and all have _id fields, even new tags)
				@param {String} _id
				@param {String} name
		*/
		.then(function(retTag) {
			//add these new tag id's
			if(retTag.tags !==undefined) {
				if(data.challenge_goal.tags ===undefined) {
					data.challenge_goal.tags =[];
				}
				var ii;
				for(ii =0; ii<retTag.tags.length; ii++) {
					data.challenge_goal.tags.push(retTag.tags[ii]._id);
				}
			}
			
			saveActual(db, data, params)
			.then(function(ret1) {
				deferred.resolve(ret1);
			}, function(err) {
				deferred.reject(err);
			});
		}, function(retErr) {
			deferred.reject(retErr);
		});
	}
	else {
		saveActual(db, data, params)
		.then(function(ret1) {
			deferred.resolve(ret1);
		}, function(err) {
			deferred.reject(err);
		});
	}

	return deferred.promise;
};

/**
Creates or updates multiple challenge goals
@toc 3.1.
@method saveBulk
@param {Object} data
	@param {Array} challenge_goal Array of challenge goal objects to save. For each challenge goal object, if '_id' field is present, it will update; otherwise it will create
@param {Object} params
@return {Promise}
	@param {Array} challenge_goal Array of challenge goal objects
	@param {Array} challenge Array of challenge objects from the names/groups in this challenge goal
**/
ChallengeGoal.prototype.saveBulk = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.saveBulk ', challenge_goal:[], challenge:[]};
	
	var ii, dataTemp;
	var promises =[];
	// var deferreds =[];
	for(ii = 0; ii < data.challenge_goal.length; ii++) {
		//need closure inside for loop
		(function(ii) {
			// deferreds[ii] =Q.defer();		//do it anyway and just immediately resolve for ones that already have _id field
			
			dataTemp ={
				challenge_goal: data.challenge_goal[ii]
			};
			promises[ii] =self.save(db, dataTemp, {bulk:true});
			// promises[ii] =deferreds[ii].promise;
		})(ii);
	}
	
	Q.all(promises).then(function(ret1) {
		for(ii =0; ii<ret1.length; ii++) {
			if(ret1[ii].challenge_goal !==undefined) {
				ret.challenge_goal[ii] =ret1[ii].challenge_goal;
			}
			else {
				ret.challenge_goal[ii] =false;
			}
			
			// if(ret1[ii].challenge !==undefined) {
				// ret.challenge[ii] =ret1[ii].challenge;
			// }
			// else {
				// ret.challenge[ii] =false;
			// }
		}
		
		//NOW have to save challenge names & groups (for bulk save have to do this ONCE at end to ensure no duplicates!)
		saveChallengeNamesAndGroups(db, ret.challenge_goal, {})
		.then(function(retNames) {
			ret.challenge =retNames.challenge;
			deferred.resolve(ret);
		}, function(retErr) {
			deferred.reject(retErr);
		});
		
	}, function(err) {
		deferred.reject(ret);
	});

	return deferred.promise;
};

/**
@toc 3.5.
@method saveActual
@param {Object} data
	@param {Object} challenge_goal The data to save. If '_id' field is present, it will update; otherwise it will create
@param {Object} params
	@param {Boolean} [bulk] True if called from bulk call
@return {Object} (via Promise)
	@param {Object} challenge_goal
	@param {Array} challenge Array of challenge objects from the names/groups in this challenge goal
*/
function saveActual(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal saveActual ', challenge_goal:{}, challenge:[]};
	
	//convert to int
	// var toIntChallenge =['required', 'points', 'target_value', 'min_value', 'max_value', 'max_points'];
	var toIntChallenge =['required'];		//UPDATE: want to convert to FLOAT for most, not INT - so only convert things that are booleans
	var xx, ii;
	if(data.challenge_goal.challenge !==undefined) {
		for(xx in data.challenge_goal.challenge) {
			for(ii =0; ii<toIntChallenge.length; ii++) {
				if(data.challenge_goal.challenge[xx][toIntChallenge[ii]] !==undefined) {
					data.challenge_goal.challenge[xx][toIntChallenge[ii]] =parseInt(data.challenge_goal.challenge[xx][toIntChallenge[ii]], 10);
				}
			}
		}
	}
	
	//add timestamps
	data.challenge_goal.last_updated =DatetimeMod.timestamp({});
	
	CrudMod.save(db, data.challenge_goal, {'collection':'challenge_goal'}, function(err, ret1) {
		ret.msg +=ret1.msg;
		if(ret1.result) { 
			ret.challenge_goal =ret1.result;
		}
		else {
			ret.challenge_goal =data.challenge_goal;
		}
		
		//update challenges collection (insert challenges for new names and update/add (points) groups). BUT if a bulk save, have to do this just ONCE at the end to ensure uniqueness of challenge names (since can't have multiple challenges with the same name and may likely have challenge goals for the same challenge being saved and may have timing issues which could lead to duplicates)
		if((params.bulk ===undefined || !params.bulk) && ret.challenge_goal.challenge !==undefined) {		//if have challenge key / array (may not on an update that just updates challenge goal title or something)
			saveChallengeNamesAndGroups(db, [ret.challenge_goal], {})
			.then(function(ret1) {
				ret.challenge =ret1.challenge;
				deferred.resolve(ret);
			}, function(retErr) {
				deferred.reject(retErr);
			});
		}
		else {
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
}

/**
Pulls out all the challenge names and (points) groups and saves them into the challenge collection as well
@toc 3.6
@method saveChallengeNamesAndGroups
@param {Array} challengeGoals Array of one or more challenge goals, each is an object of:
	@param {Array} challenge Array of objects
		@param {String} name
		@param {String} [group]
@return {Object} (via Promise)
	@param {Array} challenge Array of challenges that were updated (one for each data.names name - whether it was updated, inserted, or not)
*/
function saveChallengeNamesAndGroups(db, challengeGoals, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal saveChallengeNamesAndGroups ', challenge:[]};
	
	var names =[];
	/**
	@property groupsByName Will hold an array of group names per challenge (for adding to challenge collection)
	@type Object
	*/
	var groupsByName ={};
	
	//pull out challenge names
	var ii, curName, kk, curGroupName;
	for(kk =0; kk<challengeGoals.length; kk++) {
		for(ii =0; ii<challengeGoals[kk].challenge.length; ii++) {
			curName =challengeGoals[kk].challenge[ii].name;
			if(names.indexOf(curName) <0) {		//if not already there - no duplicates!
				names.push(curName);
			}
			if(challengeGoals[kk].challenge[ii].group !==undefined) {
				curGroupName =challengeGoals[kk].challenge[ii].group;
				if(groupsByName[curName] ===undefined) {
					groupsByName[curName] =[];
				}
				if(groupsByName[curName].indexOf(curGroupName) <0) {		//if not already there - no duplicates!
					groupsByName[curName].push(curGroupName);
				}
			}
		}
	}
	
	ChallengeMod.updateNamesAndGroups(db, {names:names, groupsByName:groupsByName}, {})
	.then(function(ret1) {
		ret.challenge =ret1.challenge;
		deferred.resolve(ret);
	}, function(retErr) {
		deferred.reject(retErr);
	});
	
	return deferred.promise;
}


/**
Remove one or more challenge goals
@toc 4.
@method delete1
@param {Object} data
	@param {String} [challenge_goal_id] Id of challenge goal to delete. one of '_id' or '_ids' is required
	@param {Array} [_ids] Ids of challenge goals to delete (will be converted to mongo object ids if necessary). one of '_id' or '_ids' is required
@param {Object} params
@return {Promise}
	@param {Object} challenge_goal
**/
ChallengeGoal.prototype.delete1 = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.delete1 '};

	data._id = data.challenge_goal_id;
	delete data.challenge_goal_id;
	
	var ppSend ={
		'collection':'challenge_goal'
	};
	CrudMod.delete1(db, data, ppSend, function(ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Makes a current challenge's challenge goals obsolete by setting the challenge.date_last_active for THIS challenge and makes a copy of the original for the NEW ones
@toc 5.
@method obsoleteChallenge
@param {Object} data
	@param {String} challenge_name Name of challenge to make obsolete/copy, i.e. 'epsilon'
	@param {String} [date_last_active] The last active date to set (defaults to current date)
@param {Object} params
@return {Promise}
	@param {Array} challenge_goal_obsolete Array of the old (obsolete) challenge goals
**/
ChallengeGoal.prototype.obsoleteChallenge = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.obsoleteChallenge ', challenge_goal_obsolete:[]};
	
	var defaults ={
		date_last_active: DatetimeMod.timestamp({})
	};
	data =lodash.merge(defaults, data);
	
	var ii, index1;
	var obsoleteGoals =[];
	//find all challenge goals for this challenge
	db.challenge_goal.find({'challenge.name': data.challenge_name}).toArray(function(err, records) {
		for(ii =0; ii<records.length; ii++) {
			index1 =ArrayMod.findArrayIndex(records[ii].challenge, 'name', data.challenge_name, {});
			if(index1 >-1) {
				//set the date_last_active for the existing (to be obsolete) goal for this challenge
				obsoleteGoals[ii] =ArrayMod.copy(records[ii], {});
				obsoleteGoals[ii].challenge[index1].date_last_active =data.date_last_active;
				delete obsoleteGoals[ii]._id;		//MUST delete this otherwise it will just do an UPDATE and overwrite the existing ones!
			}
		}
		
		//insert the new goals
		self.saveBulk(db, {challenge_goal:obsoleteGoals}, {})
		.then(function(ret1) {
			ret.challenge_goal_obsolete =ret1.challenge_goal;
			deferred.resolve(ret);
		}, function(err) {
			deferred.reject(err);
		});
	});

	return deferred.promise;
};

/**
Saves (create if new, edit if _id already exists) one or more tags
@toc 6.
@method saveTag
@param {Object} data
	@param {Array} [tags] One or more arrays of EXISTING tags to save/update. One of tags or new_tags is required.
		@param {String} _id
		@param {String} name
	@param {Array} [new_tags] Array of one or more NEW tags to create. Each item should have at least a name field. One of tags or new_tags is required.
		@param {String} name
@param {Object} params
@return {Object} (via Promise)
	@param {Number} code
	@param {String} msg
	@param {Array} tags The final tags (now all joined into an object and all have _id fields, even new tags)
		@param {String} _id
		@param {String} name
**/
ChallengeGoal.prototype.saveTag = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.saveTag ', tags:[] };
	
	var promises =[], deferreds =[];
	var promiseIndices ={
		create: false,
		update: false
	};
	
	//create
	if(data.new_tags !==undefined) {
		promiseIndices.create =deferreds.length;
		deferreds[promiseIndices.create] =Q.defer();
		CrudMod.createBulk(db, {'docs':data.new_tags}, {collection: 'challenge_tag'}, function(code, ret1) {
			if(ret1.results) {
				ret.tags =ret.tags.concat(ret1.results);
			}
			deferreds[promiseIndices.create].resolve({});
		});
		promises[promiseIndices.create] =deferreds[promiseIndices.create].promise;
	}
	
	//update
	if(data.tags !==undefined) {
		promiseIndices.update =deferreds.length;
		deferreds[promiseIndices.update] =Q.defer();
		CrudMod.updateBulk(db, {'docs':data.tags}, {collection: 'challenge_tag'}, function(code, ret1) {
			if(ret1.results) {
				ret.tags =ret.tags.concat(ret1.results);
			}
			deferreds[promiseIndices.update].resolve({});
		});
		promises[promiseIndices.update] =deferreds[promiseIndices.update].promise;
	}
	
	Q.all(promises).then(function(ret1) {
		deferred.resolve(ret);
	}, function(err) {
		deferred.reject(ret);
	});
		
	/*
	var setObj ={};
	if(data.tags !==undefined) {
		setObj =data.tags;
	}
	
	var ii, objId;
	if(data.new_tags !==undefined) {
		for(ii =0; ii<data.new_tags.length; ii++) {
			objId =MongoDBMod.objectId({string:true});
			setObj[objId] ={
				name: data.new_tags[ii].name
			}
		}
	}
	*/
	

	return deferred.promise;
};

/**
@toc 7.
@method search
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['title']] Fields to search searchString within
		@example ['title', 'description']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, title:1}] Fields to return
		@example {_id:1, title:1, priority:1}
	@param {Number} [skip =0] Where to start returning from (like a cursor)
	@param {Number} [limit =20] How many to return
@param {Object} params
@return {Promise}
	@param {Object} ret
		@param {Number} code
		@param {String} msg
		@param {Array} results
**/
ChallengeGoal.prototype.searchTag = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.searchTag '};

	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'name':1},
		'searchFields':['name']
	};
	if(data.fields ===undefined) {
		data.fields = defaults.fields;
	}
	if(data.limit ===undefined) {
		data.limit = defaults.limit;
	}
	if(data.searchFields ===undefined) {
		data.searchFields = defaults.searchFields;
	}

	var query ={};
	var ppSend =CrudMod.setSearchParams(data, query, {});
	
	LookupMod.search(db, 'challenge_tag', ppSend, function(err, retArray1) {
		deferred.resolve(retArray1);
	});

	return deferred.promise;
};

/**
Reads all challenge goals for a particular challenge name (and groups them by challenge group)
@toc 8.
@method readByChallenge
@param {Object} data
	@param {String} challenge_name
@param {Object} params
@return {Object} (via Promise)
	@param {Number} code
	@param {String} msg
	@param {Object} challenge
		@param {String} _id
		@param {String} name
		@param {Number} max_duration
		@param {Number} min_points
		@param {Array} group Array of group objects:
			@param {String} _id
			@param {String} name
			@param {Number} min_points
			@param {Array} goal Array of challenge goal objects for THIS group name
		@param {Array} goal Array of challenge goal objects that are NOT in any group (or at least not in one of the groups for THIS challenge - though there shouldn't be any of those!)
**/
ChallengeGoal.prototype.readByChallenge = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'ChallengeGoal.searchTag '};

	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'name':1},
		'searchFields':['name']
	};
	if(data.fields ===undefined) {
		data.fields = defaults.fields;
	}
	if(data.limit ===undefined) {
		data.limit = defaults.limit;
	}
	if(data.searchFields ===undefined) {
		data.searchFields = defaults.searchFields;
	}

	var query ={};
	var ppSend =CrudMod.setSearchParams(data, query, {});
	
	LookupMod.search(db, 'challenge_tag', ppSend, function(err, retArray1) {
		deferred.resolve(retArray1);
	});

	return deferred.promise;
};


/**
Module exports
@method exports
@return {ChallengeGoal} ChallengeGoal constructor
**/
module.exports = new ChallengeGoal({});