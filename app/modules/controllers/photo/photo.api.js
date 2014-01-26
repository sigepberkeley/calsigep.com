/**
RPC follow endpoints
@module photo
@class PhotoApi

@toc
1. rpcCreatePhoto
2. rpcUpdatePhoto
3. rpcReadPhotos
4. rpcSearchPhotos
5. rpcDeletePhotos
6. rpcCreateAlbum
7. rpcUpdateAlbum
8. rpcReadAlbum
9. rpcSearchAlbums
10. rpcDeleteAlbums
11. rpcAddPhotoToAlbum
12. rpcCropPhoto
13. rpcUploadProfilePhoto
*/

'use strict';

// var passport = require('passport');
var lodash = require('lodash');
var inherits = require('util').inherits;

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

// var Base = require('./base');
// var Base = require('../../../routes/api/base.js');		//can't pass this in since it's used with inherits (which has to be outside the function definition??)
var Base =require(pathParts.routes+'api/base.js');

var AuthMod = require(pathParts.controllers+'auth/auth.js');
var UserMod = require(pathParts.controllers+'user/user.js');
var PhotoMod = require(pathParts.controllers+'photo/photo.js');

var defaults = {
	group: 'photo',
	info: 'Photo API',
	namespace: 'Photo'
};

// var self;
var db;

module.exports = PhotoApi;

/**
@param {Object} options
	@param {Object} db
	// @param {Object} Base
	// @param {Object} authMod
	// @param {Object} userMod
	// @param {Object} photoMod
*/
function PhotoApi(options){
	this.opts = lodash.merge({}, defaults, options||{});
	// Base =this.opts.Base;
	Base.call(this, this.opts);

	db =this.opts.db;
	// this.authMod = this.opts.authMod;
	// this.userMod =this.opts.userMod;
	// self =this;
}

inherits(PhotoApi, Base);

PhotoApi.prototype.getRpcMethods = function(){
	return {
		createPhoto: this.rpcCreatePhoto(),
		updatePhoto: this.rpcUpdatePhoto(),
		readPhotos: this.rpcReadPhotos(),
		searchPhotos: this.rpcSearchPhotos(),
		deletePhotos: this.rpcDeletePhotos(),
		createAlbum: this.rpcCreateAlbum(),
		updateAlbum: this.rpcUpdateAlbum(),
		readAlbum: this.rpcReadAlbum(),
		searchAlbums: this.rpcSearchAlbums(),
		deleteAlbums: this.rpcDeleteAlbums(),
		addPhotoToAlbum: this.rpcAddPhotoToAlbum(),
		cropPhoto: this.rpcCropPhoto(),
		uploadProfilePhoto: this.rpcUploadProfilePhoto(),
	};
};

/**
Returns RPC schema object for Photo.createPhoto
@toc 1.
@method rpcCreatePhoto
**/
PhotoApi.prototype.rpcCreatePhoto = function()
{
	var self = this;

	return {
		info: 'Create a photo',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user creating the image" },
			photo: { required: true, type: 'object', info: "Photo object to create. url should be relative to app/src/common/img/images/photos/" },
			album_id: { type: 'string', info: "_id of album to add newly created image to. Optional." }
		},
		returns:
		{
			photo: "Newly created photo object"
		},
		/**
		Create a photo
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.createPhoto(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.updatePhoto
@toc 2.
@method rpcUpdatePhoto
**/
PhotoApi.prototype.rpcUpdatePhoto = function()
{
	var self = this;

	return {
		info: 'Update a photo',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user updating the photo" },
			photo_id: { required: true, type: 'string', info: "_id of photo to update" },
			photo: { required: true, type: 'object', info: "(Partial) Photo object with new information" },
		},
		returns:
		{
		},
		/**
		Update a photo
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.updatePhoto(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.readPhotos
@toc 3.
@method rpcReadPhoto
**/
PhotoApi.prototype.rpcReadPhotos = function()
{
	var self = this;

	return {
		info: 'Get photos by _id',
		params:
		{
			photo_ids: { required: true, type: 'array', info: "List of _ids to look up" },
		},
		returns:
		{
			photos: "Array of photo objects. Order will be the same as the order in which the _ids were passed in"
		},
		/**
		Read photos
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.readPhotos(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.searchPhotos
@toc 4.
@method rpcSearchPhotos
**/
PhotoApi.prototype.rpcSearchPhotos = function()
{
	var self = this;

	return {
		info: 'Search photos',
		params:
		{
			searchString: { type: 'string', info: "Text to search for" },
			searchFields: { type: 'array', info: "Fields to search searchString within, i.e. ['first_name', 'last_name']" },
			skipIds: { type: 'array', info: "_id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))" },
			fields: { type: 'object', info: "Fields to return, i.e. {_id:1, url:1}" },
			skip: { type: 'number', info: "Where to start returning from (like a cursor), default =0" },
			limit: { type: 'number', info: "How many to return, default =20" }
		},
		returns:
		{
			photos: "Array of photo objects"
		},
		/**
		Search photos
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.searchPhotos(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.deletePhotos
@toc 5.
@method rpcDeletePhotos
**/
PhotoApi.prototype.rpcDeletePhotos = function()
{
	var self = this;

	return {
		info: 'Delete photos by _id. Deleted photos will be removed from albums.',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user deleting the photos" },
			photo_ids: { required: true, type: 'array', info: "List of _ids to delete" },
		},
		returns:
		{
		},
		/**
		Delete photos
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.deletePhotos(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.createAlbum
@toc 6.
@method rpcCreateAlbum
**/
PhotoApi.prototype.rpcCreateAlbum = function()
{
	var self = this;

	return {
		info: 'Create an album.  Extra keys on any photos will be removed.',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user creating the album" },
			album: { required: true, type: 'object', info: "Album object to create" },
		},
		returns:
		{
			album: "Newly created album object"
		},
		/**
		Create an album
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.createAlbum(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.updateAlbum
@toc 7.
@method rpcUpdateAlbum
**/
PhotoApi.prototype.rpcUpdateAlbum = function()
{
	var self = this;

	return {
		info: 'Update an album.  Extra keys on any photos will be removed.',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user creating the album" },
			album_id: { required: true, type: 'string', info: "_id of album to update" },
			album: { required: true, type: 'object', info: "(Partial) Album object with new information" },
		},
		returns:
		{
		},
		/**
		Update an album
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.updateAlbum(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.readAlbum
@toc 8.
@method rpcReadAlbum
**/
PhotoApi.prototype.rpcReadAlbum = function()
{
	var self = this;

	return {
		info: 'Get an album by _id. Album photos will be looked up and filled in automatically, by default',
		params:
		{
			album_id: { required: true, type: 'string', info: "_id of album to read" },
			fill_photos: { type: 'number', info: "1 to fill in photo data, 0 to skip. Default = 1" }
		},
		returns:
		{
			album: "Album object. Each entry in the photos array will be a full photo object unless otherwise specified."
		},
		/**
		Read an album
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.readAlbum(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.searchAlbums
@toc 9.
@method rpcSearchAlbums
**/
PhotoApi.prototype.rpcSearchAlbums = function()
{
	var self = this;

	return {
		info: 'Search albums',
		params:
		{
			searchString: { type: 'string', info: "Text to search for" },
			searchFields: { type: 'array', info: "Fields to search searchString within, i.e. ['first_name', 'last_name']" },
			skipIds: { type: 'array', info: "_id fields to skip (will be added to query AFTER they are converted to mongo ids (if necessary))" },
			fields: { type: 'object', info: "Fields to return, i.e. {_id:1, url:1}" },
			skip: { type: 'number', info: "Where to start returning from (like a cursor), default =0" },
			limit: { type: 'number', info: "How many to return, default =20" }
		},
		returns:
		{
			albums: "Array of albums"
		},
		/**
		Search albums
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.searchAlbums(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.deleteAlbums
@toc 10.
@method rpcDeleteAlbums
**/
PhotoApi.prototype.rpcDeleteAlbums = function()
{
	var self = this;

	return {
		info: 'Delete albums by _id. Does not delete photos in the albums, by default.',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user deleting the album" },
			album_ids: { required: true, type: 'array', info: "List of _ids to delete" },
			delete_photos: { type: 'number', info: "1 to delete photos in the albums as well. Default = 0" },
		},
		returns:
		{
		},
		/**
		Delete albums
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.deleteAlbums(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.addPhotoToAlbum
@toc 11.
@method rpcAddPhotoToAlbum
**/
PhotoApi.prototype.rpcAddPhotoToAlbum = function()
{
	var self = this;

	return {
		info: 'Add an existing photo to an existing album',
		params:
		{
			user_id: { required: true, type: 'string', info: "_id of user adding the photo" },
			album_id: { required: true, type: 'string', info: "_id of album to add to" },
			photo_id: { required: true, type: 'string', info: "_id of photo to add" },
		},
		returns:
		{
		},
		/**
		Update an album
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.addPhotoToAlbum(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.cropPhoto
@toc 12.
@method rpcCropPhoto
**/
PhotoApi.prototype.rpcCropPhoto = function()
{
	var self = this;

	return {
		info: 'Crop photo',
		params:
		{
			
		},
		returns:
		{
		},
		/**
		Crop a photo
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.cropPhoto(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

/**
Returns RPC schema object for Photo.uploadProfilePhoto
@toc 12.
@method rpcUploadProfilePhoto
**/
PhotoApi.prototype.rpcUploadProfilePhoto = function()
{
	var self = this;

	return {
		info: 'Upload a profile photo to the temporary uploads folder',
		params:
		{
			
		},
		returns:
		{
		},
		/**
		Crop a photo
		@method action
		@param {Object} params (detailed above)
		@param {Object} out callback object which provides `win` and `fail` functions for handling `success` and `fail` callbacks
			@param {Function} win Success callback
			@param {Function} fail Fail callback
		**/
		action: function(params, out) {
			var promise =PhotoMod.uploadProfilePhoto(db, params, {});
			promise.then(function(ret1)
			{
				out.win(ret1);
			}, function(err)
			{
				// self.handleError(out.fail);
				self.handleError(out, err, {});
			});
		}
	};
};

