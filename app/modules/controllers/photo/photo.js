/**
Handles photos for the photo gallery

@module photo
@class photo

@toc
public methods
1. createPhoto
2. updatePhoto
3. readPhotos
4. searchPhotos
5. deletePhotos
6. createAlbum
7. updateAlbum
8. readAlbum
9. searchAlbums
10. deleteAlbums
11. addPhotoToAlbum
12. cropPhoto

private methods
*/

'use strict';

var crypto =require('crypto');
var moment = require('moment');
var Q = require('q');
var lodash = require('lodash');
var async = require('async');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var StringMod =require(pathParts.services+'string/string.js');
var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');
var CrudMod =require(pathParts.services+'crud/crud.js');
var LookupMod =require(pathParts.services+'lookup/lookup.js');

//global values that will be set by passed in objects (to avoid having to require in every file)
// var db;
var self;

var defaults =
{
	
};

/**
@param {Object} options
	// @param {Object} db
	// @param {Object} userMod
	// @param {Object} AuthMod
	// @param {Object} StringMod
	// @param {Object} MongoDBMod
*/
function Photo(options)
{
	this.opts = lodash.merge({}, defaults, options||{});
	self = this;
}

/**
Create a photo
@toc 1.
@method createPhoto
@param {Object} data
	@param {String} user_id Uploader's _id
	@param {Object} photo Photo object
	@param {String} album_id _id of album to add newly created image to. Optional.
@param {Object} params
@return {Promise}
	@param {Object} photo New Photo object
	
**/
Photo.prototype.createPhoto = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.createPhoto ', 'photo': {}};
	var ii;
	
	console.log('photo.url: ' + data.photo.url);
	db.photo.insert(data.photo, {'safe': true}, function(err, photo)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			photo = photo[0]; //Comes back as array
			ret.photo = photo;
			console.log('photo2.url: ' + photo.url);
			if(data.album_id !== undefined)
			{
				var add_promise = self.addPhotoToAlbum(db, {'user_id': data.user_id, 'album_id': data.album_id, 'photo_id': photo._id.toHexString()}, {});
				add_promise.then(
					function(ret1)
					{
						ret.code = 0;
						deferred.resolve(ret);
					},
					function(ret1)
					{
						ret.code = 1;
						ret.msg += ret1.msg;
						deferred.reject(ret);
					}
				);
			}
			else
			{
				ret.code = 0;
				deferred.resolve(ret);
			}
		}
	});
	
	return deferred.promise;
};

/**
Update a photo
@toc 2.
@method updatePhoto
@param {Object} data
	@param {String} user_id Uploader's _id
	@param {String} photo_id Id of photo to update
	@param {Object} photo Partial Photo object with new info
@param {Object} params
@return {Promise}
	
**/
Photo.prototype.updatePhoto = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.updatePhoto '};
	var ii;
	
	var id_obj = MongoDBMod.makeIds({'id': data.photo_id});
	delete data.photo._id;
	
	db.photo.update({'_id': id_obj}, {'$set': data.photo }, {'safe': true}, function(err, valid)
	{
		if(err || !valid)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Read photos by _id
@toc 3.
@method readPhotos
@param {Object} data
	@param {Array} photo_ids Ids of photos to read
@param {Object} params
@return {Promise}
	@param {Array} photos Photo objects
**/
Photo.prototype.readPhotos = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.readPhotos ', 'photos': []};
	var ii;
	var jj;
	
	var ids = MongoDBMod.makeIds({'ids': data.photo_ids});
	
	db.photo.find({'_id': {'$in': ids}}).toArray(function(err, photos)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			//Ensure order is the same as was passed in
			photos.sort(function(a, b)
			{
				if(ids.indexOf(a._id) < ids.indexOf(b._id))
				{
					return 1;
				}
				else
				{
					return -1;
				}
			});
			
			ret.code = 0;
			ret.photos = photos;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Search photos
@toc 4.
@method searchPhotos
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['url']] Fields to search searchString within
		@example ['first_name', 'last_name']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, url:1}] Fields to return
		@example {_id:1, first_name:1, last_name:1}
	@param {Number} [skip =0] Where to start returning from (like a cursor)
	@param {Number} [limit =20] How many to return
@param {Object} params
@return {Promise}
	@param {Array} photos Photo objects
**/
Photo.prototype.searchPhotos = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.searchPhotos ', 'photos': []};
	
	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'url':1},
		'searchFields':['url']
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
	
	LookupMod.search(db, 'photo', ppSend, function(err, ret1)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			ret.photos = ret1.results;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Delete photos
@toc 5.
@method deletePhotos
@param {Object} data
	@param {String} user_id Deleter's _id
	@param {Array} photo_ids List of _ids to delete
@param {Object} params
@return {Promise}
**/
Photo.prototype.deletePhotos = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.deletePhotos '};
	
	var ids = MongoDBMod.makeIds({'ids': data.photo_ids});
	
	db.photo.remove({'_id': {'$in': ids}}, {'safe': true}, function(err1)
	{
		if(err1)
		{
			ret.code = 1;
			ret.msg += err1;
			deferred.reject(ret);
		}
		else
		{
			//Find albums that had these photos
			db.album.find({'photos._id': {'$in': data.photo_ids}}, {'photos': 1}).toArray(function(err2, albums)
			{
				if(err2)
				{
					ret.code = 1;
					ret.msg += err2;
					deferred.reject(ret);
				}
				else
				{
					//Go through each album. Remove deleted photos and save the album
					async.forEach(
						albums,
						function(album, callback)
						{
							//Find and remove the deleted photos
							var ii;
							for(ii = 0; ii < album.photos.length; ii++)
							{
								if(data.photo_ids.indexOf(album.photos[ii]._id) !== -1)
								{
									album.photos.splice(ii, 1);
									ii--;
								}
							}
							
							//album is now up-to-date, save it.
							var update_promise = self.updateAlbum(db, {'user_id': data.user_id, 'album_id': album._id, 'album': album}, {});
							update_promise.then(
								function(ret1)
								{
									callback(false);
								},
								function(ret1)
								{
									callback(true);
								}
							);
						},
						function(err3)
						{
							if(err3)
							{
								ret.code = 1;
								ret.msg += err3;
								deferred.reject(ret);
							}
							else
							{
								ret.code = 0;
								deferred.resolve(ret);
							}
						}
					);
				}
			});
		}
	});
	
	return deferred.promise;
};

/**
Create an album. Extra keys on any photos will be removed.
@toc 6.
@method createAlbum
@param {Object} data
	@param {String} user_id Uploader's _id
	@param {Object} album Album object
@param {Object} params
@return {Promise}
	@param {Object} album New album object
	
**/
Photo.prototype.createAlbum = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.createAlbum ', 'album': {}};
	var ii;
	
	if(data.album.photos === undefined || data.album.photos === null)
	{
		data.album.photos = [];	//Ensure photos field is defined
	}
	
	//Remove any extra keys on the photos
	var xx;
	for(ii = 0; ii < data.album.photos.length; ii++)
	{
		for(xx in data.album.photos[ii])
		{
			if(xx != '_id')
			{
				delete data.album.photos[ii][xx];
			}
		}
	}
	
	db.album.insert(data.album, function(err, album)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			ret.album = album[0];	//Comes back as array
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Update an album.  Extra keys on any photos will be removed.
@toc 7.
@method updateAlbum
@param {Object} data
	@param {String} user_id Uploader's _id
	@param {String} album_id Album's _id
	@param {Object} album Album object
@param {Object} params
@return {Promise}
	
**/
Photo.prototype.updateAlbum = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.updateAlbum '};
	var ii;
	
	var id_obj = MongoDBMod.makeIds({'id': data.album_id});
	delete data.album._id;
	
	//Remove any extra keys on the photos
	var xx;
	for(ii = 0; ii < data.album.photos.length; ii++)
	{
		for(xx in data.album.photos[ii])
		{
			if(xx != '_id')
			{
				delete data.album.photos[ii][xx];
			}
		}
	}
	
	db.album.update({'_id': id_obj}, {'$set': data.album }, {'safe': true}, function(err, valid)
	{
		if(err || !valid)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Read an album and its photos
@toc 8.
@method readAlbum
@param {Object} data
	@param {Array} album_id Id of album to read
	@param {Number} [fill_photos = 1] 1 to fill in photo data, 0 to skip
@param {Object} params
@return {Promise}
	@param {Object} album Album object
**/
Photo.prototype.readAlbum = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.readAlbum ', 'album': {}};
	var ii;

	if(data.fill_photos === undefined || data.fill_photos === null)
	{
		data.fill_photos = 1;
	}
	
	db.album.findOne({'_id': MongoDBMod.makeIds({'id': data.album_id})}, function(err, album)
	{
		if(err || !album)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			if(data.fill_photos === 1)
			{
				//Get photos
				var photo_ids = [];
				for(ii = 0; ii < album.photos.length; ii++)
				{
					photo_ids.push(album.photos[ii]._id);
				}
				
				var photos_promise = self.readPhotos(db, {'photo_ids': photo_ids}, {});
				photos_promise.then(
					function(ret1)
					{
						ret.code = 0;
						album.photos = ret1.photos;
						ret.album = album;
						deferred.resolve(ret);
					},
					function(ret1)
					{
						ret.code = 1;
						ret.msg += ret1.msg;
						deferred.reject(ret);
					}
				);
			}
			else
			{
				ret.code = 0;
				ret.album = album;
				deferred.resolve(ret);
			}
		}
	});
	
	return deferred.promise;
};

/**
Search albums
@toc 9.
@method searchAlbums
@param {Object} data
	@param {String} [searchString] Text to search for
	@param {Array} [searchFields =['name', 'desc']] Fields to search searchString within
		@example ['first_name', 'last_name']
	@param {Array} [skipIds] _id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))
		@example ['324234', '328sakd23', '23lkjafl83']
	@param {Object} [fields ={_id:1, name:1, desc: 1}] Fields to return
		@example {_id:1, first_name:1, last_name:1}
	@param {Number} [skip =0] Where to start returning from (like a cursor)
	@param {Number} [limit =20] How many to return
@param {Object} params
@return {Promise}
	@param {Array} albums Album objects
**/
Photo.prototype.searchAlbums = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.searchAlbums ', 'albums': []};
	
	var defaults ={
		'limit':20,
		'fields':{'_id':1, 'name':1, 'desc': 1},
		'searchFields':['name', 'desc']
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
	
	LookupMod.search(db, 'album', ppSend, function(err, ret1)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			ret.albums = ret1.results;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Delete albums
@toc 10.
@method deleteAlbums
@param {Object} data
	@param {String} user_id Deleter's _id
	@param {Array} album_ids List of _ids to delete
	@param {Number} [delete_photos = 0] 1 to delete photos in the albums as well
@param {Object} params
@return {Promise}
**/
Photo.prototype.deleteAlbums = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.deleteAlbums '};
	
	var ids = MongoDBMod.makeIds({'ids': data.album_ids});
	
	//DRY continuation function
	var deleteAlbums = function()
	{
		db.album.remove({'_id': {'$in': ids}}, {'safe': true}, function(err)
		{
			if(err)
			{
				ret.code = 1;
				ret.msg += err;
				deferred.reject(ret);
			}
			else
			{
				ret.code = 0;
				deferred.resolve(ret);
			}
		});
	};
	
	
	if(data.delete_photos === 1)
	{
		//Look up the albums, find and remove their photos, then delete the albums
		db.album.find({'_id': {'$in': ids}}, {'photos': 1}).toArray(function(err1, albums)
		{
			if(err1)
			{
				ret.code = 1;
				ret.msg += err1;
				deferred.reject(ret);
			}
			else
			{
				//Get a list of every photo id to delete
				var photo_ids = [];
				var ii;
				var jj;
				for(ii = 0; ii < albums.length; ii++)
				{
					for(jj = 0; jj < albums[ii].photos.length; jj++)
					{
						//Don't add the same photo twice
						if(photo_ids.indexOf(albums[ii].photos[jj]._id) === -1)
						{
							photo_ids.push(albums[ii].photos[jj]._id);
						}
					}
				}
				
				var photo_promise = self.deletePhotos(db, {'user_id': data.user_id, 'photo_ids': photo_ids}, {});
				photo_promise.then(
					function(ret1)
					{
						deleteAlbums();
					},
					function(ret1)
					{
						ret.code = 1;
						ret.msg += ret1.msg;
						deferred.reject(ret);
					}
				);
			}
		});
	}
	else
	{
		deleteAlbums();
	}

	return deferred.promise;
};

/**
Add a photo to an album
@toc 11.
@method addPhotoToAlbum
@param {Object} data
	@param {String} user_id Uploader's _id
	@param {String} album_id Album's _id
	@param {String} photo_id Photo's _id
@param {Object} params
@return {Promise}
	
**/
Photo.prototype.addPhotoToAlbum = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.addPhotoToAlbum '};
	var ii;
	
	var id_obj = MongoDBMod.makeIds({'id': data.album_id});
	
	db.album.findOne({'_id': id_obj}, function(err, album)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			album.photos.push({'_id': data.photo_id});
			var update_promise = self.updateAlbum(db, {'user_id': data.user_id, 'album_id': data.album_id, 'album': album}, {});
			update_promise.then(
				function(ret1)
				{
					ret.code = 0;
					deferred.resolve(ret);
				},
				function(ret1)
				{
					ret.code = 1;
					ret.msg += ret1.msg;
					deferred.reject(ret);
				}
			);
		}
	});
	
	return deferred.promise;
};

/**
Crop a photo
@toc 12.
@method cropPhoto
@param {Object} data
@param {Object} params
@return {Promise}
	@param {String} cropped_path Path to the newly created image
**/
Photo.prototype.cropPhoto = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Photo.cropPhoto ', 'cropped_path': ''};
	var ii;
	
	var im = require('imagemagick');
	
	//File names relative to the root project directory
	var input_file = 'image.jpg';
	var output_file = 'crop_image.jpg';
	var new_width = 100;
	var new_height = 100;
	var x_off = 30;
	var y_off = 30;
	
	var geometry = new_width + 'x' + new_height + '+' + x_off + '+' + y_off;	//Format: 120x80+30+15
	
	var args = [input_file, "-crop", geometry, output_file];
	
	im.convert(args, function(err)
	{
		if(err)
		{
			ret.code = 1;
			ret.msg += err;
			deferred.reject(ret);
		}
		else
		{
			ret.code = 0;
			ret.cropped_path = output_file;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};


module.exports = new Photo({});