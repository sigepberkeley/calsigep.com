/**
@toc
1. setup - whitelist, appPath, html5Mode
2. generic / common routes
3. site-specific routes
4. catch-all 'otherwise' route

Declare app level module which depends on filters, and services.

Also handles setting HTML5 mode and handling routing (optionally checking login state first)

HTML5 mode true (for modern browsers) means no "#" in the url. HTML5 mode false (IE <10 and Android <4) has a "#/" in the url as a fallback for older browsers that don't support HTML5 History

The "resolve" block in the routes allows calling functions (that return a $q deferred promise) that will be executed BEFORE routing to the appropriate page/controller (this is often used for checking logged in state and updating routing accordingly - i.e. don't allow accessing pages that require login if the user isn't currently logged in)
@module ang-app
*/

'use strict';

//combine all jackrabbitsgroup modules into 'jrg' module for easy reference later (including in test specs)
angular.module('jrg', [
		//services
		'jackrabbitsgroup.angular-string',
		'jackrabbitsgroup.angular-array',
		// 'jackrabbitsgroup.angular-facebook-auth',
		'jackrabbitsgroup.angular-google-auth',
		//directives
		'jackrabbitsgroup.angular-forminput',
		'jackrabbitsgroup.angular-autocomplete',
		'jackrabbitsgroup.angular-multiselect',
		'jackrabbitsgroup.angular-datetimepicker',
		'jackrabbitsgroup.angular-lookup',
		'jackrabbitsgroup.angular-area-select',
		'jackrabbitsgroup.angular-image-upload',
		'jackrabbitsgroup.angular-carousel-directive'
	]
);

//declare some other modules so can group sets of services & directives together for easy reference elsewhere
angular.module('models', []);
angular.module('app', [
	'models'		//so don't have to actually use/include 'models' anywhere, just use 'app' instead
]);

angular.module('myApp', [
'ngRoute', 'ngSanitize', 'ngTouch', 'ngAnimate', 'ngCookies',		//additional angular modules
'ui.bootstrap',
'btford.socket-io',
'jrg',
'app'		//local / app specific directives and services (anything that can be used across apps should be added to an external (bower) directive or service library)
]).
config(['$routeProvider', '$locationProvider', 'appConfigProvider', '$compileProvider', function($routeProvider, $locationProvider, appConfigProvider, $compileProvider) {
	/**
	setup - whitelist, appPath, html5Mode
	@toc 1.
	*/
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|content|geo|http?):/);		//otherwise ng-href links don't work on Android within TriggerIO: http://stackoverflow.com/questions/16130902/angular-js-and-trigger-io-cant-follow-a-link-on-android-that-works-on-ios		//UPDATE: Angular 1.2.0 no longer has urlSanitizationWhitelist; it's been renamed to aHrefSanitizationWhitelist and may no longer even be necessary: http://stackoverflow.com/questions/15105910/angular-ng-view-routing-not-working-in-phonegap
	
	var appPath =appConfigProvider.dirPaths.appPath;
	var staticPath = appConfigProvider.dirPaths.staticPath;

	//handle browsers with no html5 history api (AND Android <3 which checks as true but doesn't really fully support it..)
	var appPathRoute =appPath;
	var html5History =!!(window.history && window.history.pushState);		//actual check
	//android / browser sniffer 2nd check
	var ua = navigator.userAgent;
	if(typeof(globalPhoneGap) !="undefined" && globalPhoneGap ===true) {
		html5History =false;
	}
	else if( ua.indexOf("Android") >= 0 )
	{
		var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
		if (androidversion < 3)
		{
			html5History =false;
		}
	}
	// html5History =false;		//TESTING		//update: TriggerIO does NOT seem to work with html5 history so have to disable it..
	if(html5History) {
		$locationProvider.html5Mode(true);		//un comment this to use HTML5 History API (better BUT note that server must be configured to auto-redirect all requests to /index.html since this will create url paths that don't actually exist file-wise so I default it to off for initial testing / setup until server is configured properly to handle this)
	}
	else {		//update for route matching and forming
		appPathRoute ='/';
		appConfigProvider.dirPaths.appPathLink =appConfigProvider.dirPaths.appPathLink+"#/";
		appConfigProvider.dirPaths.appPathLocation ='';
	}
	
	var pagesPath =staticPath+'modules/pages/';

	
	/**
	Generic / common routes
	@toc 2.
	*/
	// $routeProvider.when(appPathRoute+'home', {redirectTo: appPathRoute+'dev-test/test'});
	
	$routeProvider.when(appPathRoute+'login', {templateUrl: pagesPath+'login/login.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'signup', {templateUrl: pagesPath+'signup/signup.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'logout', {templateUrl: pagesPath+'logout/logout.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'user-delete', {templateUrl: pagesPath+'userDelete/user-delete.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
		
	$routeProvider.when(appPathRoute+'password-reset', {templateUrl: pagesPath+'passwordReset/password-reset.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	
	//3rd party redirect/callback routes
	$routeProvider.when(appPathRoute+'callback-twitter-auth', {templateUrl: pagesPath+'callback/callback-twitter-auth/callback-twitter-auth.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'callback-facebook-auth', {templateUrl: pagesPath+'callback/callback-facebook-auth/callback-facebook-auth.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	
	//dev-test
	// $routeProvider.when(appPathRoute+'test', {templateUrl: pagesPath+'test/test.html'});
	$routeProvider.when(appPathRoute+'dev-test/test', {templateUrl: pagesPath+'dev-test/test/test.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	
	$routeProvider.when(appPathRoute+'dev-test/design', {templateUrl: pagesPath+'dev-test/design/design.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'dev-test/socketio', {templateUrl: pagesPath+'dev-test/socketio/socketio.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
	$routeProvider.when(appPathRoute+'dev-test/social', {templateUrl: pagesPath+'dev-test/social/social.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});

	
	/**
	site-specific routes
	@toc 3.
	*/
	
	//yeoman generated routes here - DO NOT DELETE THIS COMMENT AS IT IS USED BY YEOMAN TO GENERATE A NEW ROUTE!
$routeProvider.when(appPathRoute+'dev-goals-edit', {templateUrl: pagesPath+'dev-goals/dev-goals-edit/dev-goals-edit.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'dev-goals-list', {templateUrl: pagesPath+'dev-goals/dev-goals-list/dev-goals-list.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'dev-challenge-list', {templateUrl: pagesPath+'dev-challenge/dev-challenge-list/dev-challenge-list.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'dev-challenge-edit', {templateUrl: pagesPath+'dev-challenge/dev-challenge-edit/dev-challenge-edit.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'dev-goals-challenge', {templateUrl: pagesPath+'dev-goals/dev-goals-challenge/dev-goals-challenge.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'dev-goals', {templateUrl: pagesPath+'dev-goals/dev-goals/dev-goals.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'challenge-tracker', {templateUrl: pagesPath+'/challenge-tracker/challenge-tracker.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'contact', {templateUrl: pagesPath+'public/contact/contact.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'profile', {templateUrl: pagesPath+'/profile/profile.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'admin-portal', {templateUrl: pagesPath+'admin/admin-portal/admin-portal.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'admin-albums', {templateUrl: pagesPath+'admin/admin-albums/admin-albums.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'admin-album-edit', {templateUrl: pagesPath+'admin/admin-album-edit/admin-album-edit.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'philosophy', {templateUrl: pagesPath+'public/philosophy/philosophy.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'brothers', {templateUrl: pagesPath+'public/brothers/brothers.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'rush', {templateUrl: pagesPath+'public/rush/rush.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'gallery', {templateUrl: pagesPath+'public/gallery/gallery.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'admin-creation', {templateUrl: pagesPath+'admin/admin-creation/admin-creation.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({
					auth: {
						loggedIn: {}
					}
				});
			}
		}
	});
$routeProvider.when(appPathRoute+'calendar', {templateUrl: pagesPath+'/calendar/calendar.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'module-tracker', {templateUrl: pagesPath+'/module-tracker/module-tracker.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'documents', {templateUrl: pagesPath+'/documents/documents.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'admin-tracker', {templateUrl: pagesPath+'admin/admin-tracker/admin-tracker.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'bestof', {templateUrl: pagesPath+'/bestof/bestof.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'roster', {templateUrl: pagesPath+'/roster/roster.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'bms', {templateUrl: pagesPath+'/bms/bms.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
$routeProvider.when(appPathRoute+'brother-info', {templateUrl: pagesPath+'/brother-info/brother-info.html',
		resolve: {
			auth: function(appAuth) {
				return appAuth.checkSess({});
			}
		}
	});
//end: yeoman generated routes here - DO NOT DELETE THIS COMMENT AS IT IS USED BY YEOMAN TO GENERATE A NEW ROUTE!
	

	/**
	catch-all 'otherwise' route
	@toc 4.
	*/
	$routeProvider.otherwise({redirectTo: appPathRoute+'rush'});
	
}]);