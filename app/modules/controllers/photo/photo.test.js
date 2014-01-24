/**
Tests for all /api/photo endpoints

NOTE: "it" blocks with modularized/nested function and async code can be finicky - I don't think nested "it" blocks are allowed BUT need an outer "it" block to ensure the async code gets run (otherwise it will just complete immediately before running any tests). So if and when to use "done" for the it blocks and where to put them is sometimes hard to follow/trace. When in doubt, try an "it" block and if it errors or doesn't complete, try just putting an "expect" there directly - it's likely already in an "it" block..

@toc
public methods
1. Photo
2. Photo.run
private methods
3. before
4. after
5. go
	6. createPhoto
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

//NOTE: make sure to namespace all values to ensure no conflicts with other modules that run asynchronously and may be altering the same users / data otherwise - leading to odd and very hard to debug errors..
var TEST_USERS =[
	{
		email: 'photo_test@example.com',
		first_name: 'photo_Joe',
		last_name: 'photo_Shmoe',
		password: 'test'
	},
	{
		email: 'photo_example@test.com',
		first_name: 'photo_Jane',
		last_name: 'photo_Doe',
		password: 'test'
	},
	{
		email: 'photo_foo@bar.com',
		first_name: 'photo_Foo',
		last_name: 'photo_Bar',
		password: 'test'
	},
	{
		email: 'photo_qwerty@asdf.com',
		first_name: 'photo_Mike',
		last_name: 'photo_Ike',
		password: 'test'
	},
	{
		email: 'photo_lala@hoho.com',
		first_name: 'photo_Bill',
		last_name: 'photo_Ted',
		password: 'test'
	}
];
var testUser =TEST_USERS[0];

module.exports = Photo;

/**
Main function/object (will be exported)
@toc 1.
@method Photo
@param {Object} params
	@param {Object} db
	@param {Object} api
	// @param {Object} MongoDBMod
*/
function Photo(params)
{
	db =params.db;
	api =params.api;
	// MongoDBMod =params.MongoDBMod;
	
	self =this;
}

/**
@toc 2.
@method Photo.run
@param {Object} params
*/
Photo.prototype.run =function(params)
{
	var deferred =Q.defer();
	
	describe('PhotoModule', function()
	{
		it("should test all photo calls", function(done)
		{
			var promise =before({});
			promise.then(function(ret1)
			{
				done();
				deferred.resolve(ret1);
			}, function(err)
			{
				deferred.reject(err);
			});
		});
	});
	
	return deferred.promise;
};

/**
@toc 3.
@method before
@param {Object} params
*/
function before(params)
{
	var deferred =Q.defer();
	var msg ='';
	
	//drop test user(s)
	var emails = [];
	var ii;
	for(ii = 0; ii < TEST_USERS.length; ii++)
	{
		emails.push(TEST_USERS[ii].email);
	}

	db.user.remove({'email': {'$in':emails} }, function(err, numRemoved)
	{
		if(err)
		{
			msg +="db.user.remove Error: "+err;
		}
		else if(numRemoved <1) {
			msg +="db.user.remove Num removed: "+numRemoved;
		}
		else {
			msg +="db.user.remove Removed "+numRemoved;
		}
		console.log('\nPhoto BEFORE: '+msg);
		
		//Populate db with test users
		async.forEach(TEST_USERS, function(user1, aCallback)
		{
			var reqObj =api.httpGo({method:'Auth.create'}, {data:user1}, {});
			request(reqObj, function(error, response, data)
			{
				data =api.parseData(data, {});
				user1._id =data.result.user._id;	//Save _id to TEST_USERS array
				user1.authority_keys = {'user_id': user1._id, 'sess_id': data.result.user.sess_id};
				aCallback(false);
			});
		}, function(err)
		{
			var promise =go({});
			promise.then(function(ret1)
			{
				var promiseAfter =after({});
				promiseAfter.then(function(retAfter)
				{
					deferred.resolve(ret1);
				}, function(err)
				{
					deferred.reject(err);
				});
				
				deferred.resolve(ret1);
			}, function(err)
			{
				deferred.reject(err);
			});
		});
	});
	
	return deferred.promise;
}

/**
Do clean up to put database back to original state it was before ran tests (remove test user(s), etc.)
@toc 4.
@method after
@param {Object} params
*/
function after(params)
{
	var deferred =Q.defer();
	var msg ='';
	
	//drop test user(s)
	var emails = [];
	var ii;
	for(ii = 0; ii < TEST_USERS.length; ii++)
	{
		emails.push(TEST_USERS[ii].email);
	}
	db.user.remove({'email': {'$in':emails} }, function(err, numRemoved)
	{
		if(err)
		{
			msg +="db.user.remove Error: "+err;
		}
		else if(numRemoved <1)
		{
			msg +="db.user.remove Num removed: "+numRemoved;
		}
		else
		{
			msg +="db.user.remove Removed "+numRemoved;
		}
		console.log('\nPhoto AFTER: '+msg);
		deferred.resolve({});
	});
	return deferred.promise;
}

/**
@toc 5.
@method go
@param {Object} params
*/
function go(params)
{
	var deferred =Q.defer();
	var reqObj;
	
	/**
	@toc 6.
	@method createPhoto
	@param {Object} opts
	*/
	var createPhoto =function(opts)
	{
		var photo_params =
		{
			// 'authorize': true,		//Tell security module to go through checks even though this is the test DB
			'authority_keys': TEST_USERS[0].authority_keys,
		};
		api.expectRequest({method:'Photo.createPhoto'}, {'data':photo_params}, {}, {}).then(function(res)
		{
			deferred.resolve({});	//Finished
		});
	};
	
	createPhoto();		//start all the calls going
	
	return deferred.promise;
}