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
@return {Promise}
	@param {Object} challenge
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
	@param {Object} challenge The data to save. If '_id' field is present, it will update; otherwise it will create
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
	
	CrudMod.save(db, data.challenge, {'collection':'challenge'}, function(err, ret1) {
		ret.msg +=ret1.msg;
		if(ret1.result) { 
			ret.challenge =ret1.result;
		}
		else {
			ret.challenge =data.challenge;
		}
		
		deferred.resolve(ret);
	});
	
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
Module exports
@method exports
@return {Challenge} Challenge constructor
**/
module.exports = new Challenge({});