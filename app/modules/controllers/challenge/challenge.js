/**
Challenge module representing the challenges
@module challenge
@class challenge

@toc
1. search
2. read
3. save
3.1. saveBulk
3.5. saveActual (private function)
4. delete1
5. updateNamesAndGroups
6. readGroupNames
7. readNames
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

var self;

var defaults = {
};

/**
Challenge module constructor
@class Challenge
@constructor
@param options {Object} constructor options
**/
function Challenge(options){
    this.opts = lodash.merge({}, defaults, options||{});

	self = this;
}

/**
@toc 1.
@method search
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['name']] Fields to search searchString within
		@example ['title', 'description']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, name:1}] Fields to return
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
Challenge.prototype.search = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.search '};

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
	
	LookupMod.search(db, 'challenge', ppSend, function(err, ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Reads one or more challenges
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
	@param {Object} challenge (or challenges)
**/
Challenge.prototype.read = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.read ', challenge:false};

	var ppSend = {
		'collection':'challenge'
	};
	if(data._ids !==undefined) {		//for bulk read, return less info
		ppSend.defaults = {
			'fields':{'_id':1, 'name':1}
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
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Creates or updates a challenge
@toc 3.
@method save
@param {Object} data
	@param {Object} challenge The data to save. If '_id' field is present, it will update; otherwise it will create
	@param {Array} [new_tags] Array of one or more NEW tags to create. Each item should have at least a name field. One of tags or new_tags is required.
		@param {String} name
@param {Object} params
@return {Promise}
	@param {Object} challenge
**/
Challenge.prototype.save = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.save ', challenge:{}};

	saveActual(db, data, params)
	.then(function(ret1) {
		deferred.resolve(ret1);
	}, function(err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

/**
Creates or updates multiple challenges
@toc 3.1.
@method saveBulk
@param {Object} data
	@param {Array} challenge Array of challenge objects to save. For each challenge object, if '_id' field is present, it will update; otherwise it will create
@param {Object} params
@return {Object}  (via Promise)
	@param {Array} challenge
**/
Challenge.prototype.saveBulk = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.saveBulk ', challenge:[]};
	
	var ii, dataTemp;
	var promises =[];
	// var deferreds =[];
	for(ii = 0; ii < data.challenge.length; ii++) {
		//need closure inside for loop
		(function(ii) {
			// deferreds[ii] =Q.defer();		//do it anyway and just immediately resolve for ones that already have _id field
			
			dataTemp ={
				challenge: data.challenge[ii]
			};
			promises[ii] =self.save(db, dataTemp, {});
			// promises[ii] =deferreds[ii].promise;
		})(ii);
	}
	
	Q.all(promises).then(function(ret1) {
		for(ii =0; ii<ret1.length; ii++) {
			if(ret1[ii].challenge !==undefined) {
				ret.challenge[ii] =ret1[ii].challenge;
			}
			else {
				ret.challenge[ii] =false;
			}
		}
		deferred.resolve(ret);
	}, function(err) {
		deferred.reject(ret);
	});

	return deferred.promise;
};

/**
@toc 3.5.
@method saveActual
@param {Object} data
	@param {Object} challenge The data to save. If '_id' field is present, it will update; otherwise it will create. Since the 'name' field must be UNIQUE, it will first check if a challenge with this name exists and add in the appropriate _id if it does (though you still should ALREADY pass in that _id if it already exists! This is just a second fool-proofing check).
*/
function saveActual(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge saveActual ', challenge:{}};
	
	//convert to int
	var toInt =['max_duration', 'min_points'];
	var ii;
	for(ii =0; ii<toInt.length; ii++) {
		if(data.challenge[toInt[ii]] !==undefined) {
			data.challenge[toInt[ii]] =parseInt(data.challenge[toInt[ii]], 10);
		}
	}
	
	var idSave =false;		//save since data.challenge gets overwritten apparently...
	
	if(data.challenge._id ===undefined) {
		//since name must be UNIQUE, first check to make sure this challenge name doesn't already exist (if it does, add in the _id field)
		db.challenge.find({name:data.challenge.name}, {_id:1}).toArray(function(err, challenges) {
			if(err) {
				ret.code =1;
				ret.msg +='err: '+err;
				deferred.reject(ret);
			}
			else {
				if(challenges && challenges.length >0) {		//already exists, add _id field
					console.log('challenge saveActual name already exists (but no _id passed in; setting _id appropriately to ensure uniqueness)');
					data.challenge._id =challenges[0]._id;
					idSave =data.challenge._id;
				}
				
				CrudMod.save(db, data.challenge, {'collection':'challenge'}, function(err, ret1) {
					ret.msg +=ret1.msg;
					if(ret1.result) { 
						ret.challenge =ret1.result;
					}
					else {
						ret.challenge =data.challenge;
					}
					
					//ensure id..
					if(ret.challenge._id ===undefined && idSave) {
						ret.challenge._id =idSave;
					}
					
					deferred.resolve(ret);
				});
			}
		});
	}
	else {
		idSave =data.challenge._id;
		CrudMod.save(db, data.challenge, {'collection':'challenge'}, function(err, ret1) {
			ret.msg +=ret1.msg;
			if(ret1.result) { 
				ret.challenge =ret1.result;
			}
			else {
				ret.challenge =data.challenge;
			}
			
			//ensure id..
			if(ret.challenge._id ===undefined && idSave) {
				ret.challenge._id =idSave;
			}
			
			deferred.resolve(ret);
		});
	}
	
	return deferred.promise;
}

/**
Remove one or more challenges
@toc 4.
@method delete1
@param {Object} data
	@param {String} [challenge_id] Id of challenge to delete. one of '_id' or '_ids' is required
	@param {Array} [_ids] Ids of challenges to delete (will be converted to mongo object ids if necessary). one of '_id' or '_ids' is required
@param {Object} params
@return {Promise}
	@param {Object} challenge
**/
Challenge.prototype.delete1 = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.delete1 '};

	data._id = data.challenge_id;
	delete data.challenge_id;
	
	var ppSend ={
		'collection':'challenge'
	};
	CrudMod.delete1(db, data, ppSend, function(ret1) {
		deferred.resolve(ret1);
	});

	return deferred.promise;
};

/**
Takes an array of names and groups for each name and updates (or adds) the appropriate challenge
@toc 5.
@method updateNamesAndGroups
@param {Object} data
	@param {Array} names Names to insert (if do not already exist)
		@example ['sigma', 'phi_edit']
	@param {Object} groupsByName Organized by challenge name; each key is an array of group names per challenge
		@example
			{
				sigma: ['group1', 'group2'],
				phi_edit: ['group3', 'group1']
			}
@param {Object} params
@return {Object} (via Promise)
	@param {Array} challenge Array of challenge objects (one for each data.names name - whether it was updated, inserted, or not)
**/
Challenge.prototype.updateNamesAndGroups = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.updateNamesAndGroups '};

	//form query to search for all names
	var query ={
		$or: []
	};
	var ii;
	for(ii =0; ii<data.names.length; ii++) {
		query.$or.push({'name':data.names[ii]});
	}
	db.challenge.find(query, {}).toArray(function(err, challenges) {
		if(err) {
			ret.code =1;
			ret.msg +="Error: "+err;
			deferred.reject(ret);
		}
		else {
			if(!challenges) {
				challenges =[];
			}
			
			var curName, curChallengeIndex, jj, curGroupName, curGroupIndex;
			//challenges has 0 or more challenges; go through and add in group names (and add the challenge itself if doesn't exist)
			for(ii =0; ii<data.names.length; ii++) {
				curName =data.names[ii];
				curChallengeIndex =ArrayMod.findArrayIndex(challenges, 'name', curName, {});
				if(curChallengeIndex <0) {		//if doesn't exist yet, create
					curChallengeIndex =challenges.length;		//set before push to use length (without -1)
					challenges.push({
						name: curName,
						group: []
					});
				}
				
				//add groups
				if(data.groupsByName[curName] !==undefined && data.groupsByName[curName]) {
					for(jj =0; jj<data.groupsByName[curName].length; jj++) {
						curGroupName =data.groupsByName[curName][jj];
						if(challenges[curChallengeIndex].group ===undefined) {
							challenges[curChallengeIndex].group =[];
						}
						curGroupIndex =ArrayMod.findArrayIndex(challenges[curChallengeIndex].group, 'name', curGroupName, {});
						if(curGroupIndex <0) {		//not found
							challenges[curChallengeIndex].group.push({
								_id: MongoDBMod.objectId({string:true}),
								name: curGroupName
							});
						}
					}
				}
			}
			
			//now we have all challenges that need to be saved fully updated (new challenges inserted if names didn't exist yet and group names updated in each challenge) so we can (bulk) save
			self.saveBulk(db, {challenge: challenges}, {})
			.then(function(retSave) {
				ret.challenge =retSave.challenge;
				deferred.resolve(ret);
			}, function(retErr) {
				deferred.reject(retErr);
			});
		}
	});

	return deferred.promise;
};

/**
Returns all UNIQUE group names (from challenge.group.name)
@toc 6.
@method readGroupNames
@param {Object} data
@param {Object} params
@return {Object} (via Promise)
	@param {Array} names
**/
Challenge.prototype.readGroupNames = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.readGroupNames ', names:[]};
	
	db.challenge.find({}, {group:1}).toArray(function(err, challenges) {
		if(err) {
			ret.code =1;
			ret.msg +="Error: "+err;
			deferred.reject(ret);
		}
		else if(!challenges) {
			ret.code =2;
			deferred.resolve(ret);
		}
		else {
			var ii, jj, curName;
			for(ii =0; ii<challenges.length; ii++) {
				if(challenges[ii].group !==undefined) {
					for(jj =0; jj<challenges[ii].group.length; jj++) {
						curName =challenges[ii].group[jj].name;
						if(ret.names.indexOf(curName) <0) {		//if not already there
							ret.names.push(curName);
						}
					}
				}
			}
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Returns all challenge names
@toc 7.
@method readNames
@param {Object} data
@param {Object} params
@return {Object} (via Promise)
	@param {Array} names
**/
Challenge.prototype.readNames = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Challenge.readNames ', names:[]};
	
	db.challenge.find({}, {name:1}).toArray(function(err, challenges) {
		if(err) {
			ret.code =1;
			ret.msg +="Error: "+err;
			deferred.reject(ret);
		}
		else if(!challenges) {
			ret.code =2;
			deferred.resolve(ret);
		}
		else {
			var ii;
			for(ii =0; ii<challenges.length; ii++) {
				ret.names.push(challenges[ii].name);
			}
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};


/**
Module exports
@method exports
@return {Challenge} Challenge constructor
**/
module.exports = new Challenge({});