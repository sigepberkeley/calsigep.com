/**
This file pairs with the nav.js file/service. This is the custom stuff - the lists (objects) of components and buttons.

Sets up the header and footer navigation buttons / displays.
Each button generally has the following properties (but check the corresponding HTML template for a full reference)
	- `html` of the content to display, i.e. "Title Here" or "<span class='fa fa-bell'></span>" or "&nbsp;"
	- either an `href` or `click`. For the `click`, it's generally a $rootScope.$broadcast that can be listened for in the appropriate controller for that page.
	- `classes` which is an object that has style classes to apply for different parts of the nav item (i.e. `cont` is usually the class for the outer-most container)
		- use classes.cont ='hidden' as a special class to HIDE (display:none) the entire header and/or footer
	
@example
buttons: [
	{
		html: "<span class='fa fa-bell'></span>",
		href: this.paths.appPathLink+'notifications',
		id: 'notifications'
	},
	{
		html: "<span class='icon-calendar-17-dark'></span>",
		click: function() { $rootScope.$broadcast('NavEventChangePage', {page:'event1'}); },
	},
	{
		html: "<span class='icon-tribe'></span>",
		href: this.paths.appPathLink+'tribes'
	}
]

@module nav
@class nav-config

@toc
1. init
2. initPaths
3. initComponents
4. initPages

*/

'use strict';

angular.module('app').
factory('appNavConfig', ['appConfig', 'jrgArray', function(appConfig, jrgArray) {
var inst ={

	//self: appNav,		//so can use 'self' instead of 'this' in this file and it will still work to refer to appNav INSTEAD of this file.		//UPDATE: does NOT work - circular dependency..
	historyBack: false,		//placeholder - will be set in appNav
	
	inited: false,		//trigger that will be set after this first time this is run

	pathRoot: 'modules/services/nav/',
	
	paths: {},		//holds file paths for various things, specifically templates (HTML template files) and appPathLink. See initPaths function for more info.
	
	components :{},		//will hold parts of pages for use later

	pages :{},		//will hold all the navigation page objects for defining the nav (header and footer)

	/**
	For all the pages where the url route is not the same as the pages key
	@property pagesRouteMap Key-pairs where the key corresponds to this.pages array keys and the value corresponds to the url page to match. i.e. {'login': 'login-url'}
	@type Object
	@example
		eventviewinfo:{
			url: 'eventview',		//the sanitized version of the url (i.e. no hypens)
			params: {
				page: 'info'
			}
		},
		//will match things like 'test/898' or 'test/yes/no' in case passing in :id or other sub-page parameters in the URL (but NOT in GET query params)
		test:{
			urlRegex: 'test\/'		//the sanitized version of the url (i.e. no hypens)
		},
	*/
	pagesRouteMap: {
	},
	
	/**
	@toc 1.
	@method init
	*/
	init: function(params) {
		if(!this.inited) {		//only init once
			this.initPaths(params);
			this.initComponents({});
			this.initPages(params);
			
			this.inited =true;		//set for next time
		}
	},
	
	/**
	@toc 2.
	@method initPaths
	*/
	initPaths: function(params) {
		this.pathRoot =appConfig.dirPaths.staticPath+this.pathRoot;		//prepend static path to account for different environments / configs and ensure this always references the correct path
		this.paths.templates = {
			headerCentered: this.pathRoot+'header-centered/header-centered.html',
			footerFlex: this.pathRoot+'footer-flex/footer-flex.html',
			headerPublic: this.pathRoot+'header-public/header-public.html',
		};
		this.paths.appPathLink =appConfig.dirPaths.appPathLink;
	},
	
	/**
	@toc 3.
	@method initComponents
	*/
	initComponents: function(params) {
		var self =this;
		
		//NOTE: this references a function in THIS file/service, which is NOT what we want, we want to reference appNav SO we need to overwrite/set the historyBack function here from appNav later so this will work!
		this.components.backButton ={
			html: "<span class='fa fa-arrow-left'></span>",
			click: function() {self.historyBack({}); }
		};
		
		this.components.headerCentered ={
			template: this.paths.templates.headerCentered,
			title: {
				html: '[Title]'
			},
			buttons: {
				left: [
					this.components.backButton,
					{
						html: "Test",
						href: this.paths.appPathLink+'dev-test/test'
					}
				],
				right: [
					{
						html: "<span class='fa fa-sign-in'></span>",
						href: this.paths.appPathLink+'login'
					},
					{
						html: "<span class='fa fa-sign-out'></span>",
						href: this.paths.appPathLink+'logout'
					}
				]
			}
		};
		
		this.components.footerMain ={
			template: this.paths.templates.footerFlex,
			classes: {
				cont: ''
			},
			buttons: [
				{
					// html: "<span class='fa fa-unlock'></span>",
					// href: this.paths.appPathLink+'password-reset'
					html: "SocketIO",
					href: this.paths.appPathLink+'dev-test/socketio'
				},
				{
					html: "Design",
					href: this.paths.appPathLink+'dev-test/design'
				},
				{
					html: "Test",
					href: this.paths.appPathLink+'dev-test/test'
				}
			]
		};
		//hardcoded array indices for use to change these buttons later
		this.components.footerMainIndices ={
		};
		
		this.components.headerPublic ={
			template: this.paths.templates.headerPublic,
			links: [
				{
					html: "Philosophy",
					href: this.paths.appPathLink+'philosophy'
				},
				{
					html: "Scholarship",
					href: this.paths.appPathLink+'BMS'
				},
				{
					html: "Brothers",
					href: this.paths.appPathLink+'brothers'
				},
				{
					html: "Rush",
					href: this.paths.appPathLink+'rush'
				},
				{
					html: "Contact",
					href: this.paths.appPathLink+'contact'
				}
			]
		};
		//hardcoded array indices for use to change these buttons later
		this.components.headerPublicIndices ={
			philosophy:0,
			BMS:1,
			brothers:2,
			rush:3,
			contact:4
		};
		
		
		this.components.footerPublic ={
			template: this.paths.templates.footerFlex,
			classes: {
				cont: 'hidden'
			}
		};
		
		
		//members header
		this.components.headerMembers ={
			template: this.paths.templates.headerPublic,
			links: [
				{
					html: "Public",
					href: this.paths.appPathLink
				},
				{
					html: "Calendar",
					href: this.paths.appPathLink+'calendar'
				},
				{
					html: "Docs",
					href: this.paths.appPathLink+'documents'
				},
				{
					html: "Dev Goals",
					href: this.paths.appPathLink+'dev-goals'
				},
				{
					html: "Profile",
					href: this.paths.appPathLink+'profile'
				},
				{
					html: "Roster",
					href: this.paths.appPathLink+'roster'
				},
				{
					html: "Admin",
					href: this.paths.appPathLink+'admin-portal'
				}

			]
		};
		//hardcoded array indices for use to change these buttons later
		this.components.headerMembersIndices ={
			public1:0,
			calendar:1,
			documents:2,
			devgoals:3,
			profile:4,
			roster:5,
			adminportal:6
		};
		
		this.components.defaultNav ={
			header: this.components.headerCentered,
			footer: this.components.footerMain
		};
		
		this.components.publicNav ={
			header: this.components.headerPublic,
			footer: this.components.footerPublic
		};
		
		this.components.membersNav ={
			header: this.components.headerMembers,
			footer: this.components.footerPublic
		};
	},
	
	/**
	NOTE: need to COPY / deep clone the components otherwise they'll overwrite backwards (copying arrays/objects by reference instead of by value)
	@toc 4.
	@method initPages
	*/
	initPages: function(params) {
		
		// this.pages.defaultPage =jrgArray.copy(this.components.defaultNav);			//in case missed a page, show default nav
		this.pages.defaultPage =jrgArray.copy(this.components.publicNav);
		
		//site-specific
		//CUSTOM nav definitions
		/*
		//login
		this.pages.login ={
			header: {
				template: this.paths.templates.headerCentered,
				title: {
					html: '&nbsp;'
				},
				buttons: {
					left: [
						{
							html: "&nbsp;"
						}
					],
					right: [
						{
							html: "&nbsp;"
						}
					]
				}
			},
			footer: {
				template: this.paths.templates.footerFlex,
				buttons: [
					{
						html: "&nbsp;"
					}
				]
			}
		};
		
		//signup
		this.pages.signup ={
			header: {
				template: this.paths.templates.headerCentered,
				title: {
					html: '&nbsp;'
				},
				buttons: {
					left: [
						{
							html: "&nbsp;"
						}
					],
					right: [
						{
							html: "&nbsp;"
						}
					]
				}
			},
			footer: {
				template: this.paths.templates.footerFlex,
				buttons: [
					{
						html: "&nbsp;"
					}
				]
			}
		};
		*/
		
		
		//test
		this.pages.test =jrgArray.copy(this.components.defaultNav);
		// this.pages.test.header.classes ={
			// cont: 'hidden'
		// };
		// this.pages.test.footer.classes ={
			// cont: 'hidden'
		// };
		
		//philosophy
		this.pages.philosophy =jrgArray.copy(this.components.publicNav);
		this.pages.philosophy.header.links[this.components.headerPublicIndices.philosophy].classes ={
			cont: 'selected'
		};

		//BMS
		this.pages.BMS =jrgArray.copy(this.components.publicNav);
		this.pages.BMS.header.links[this.components.headerPublicIndices.BMS].classes ={
			cont: 'selected'
		};

		//brothers
		this.pages.brothers =jrgArray.copy(this.components.publicNav);
		this.pages.brothers.header.links[this.components.headerPublicIndices.brothers].classes ={
			cont: 'selected'
		};


		//rush
		this.pages.rush =jrgArray.copy(this.components.publicNav);
		this.pages.rush.header.links[this.components.headerPublicIndices.rush].classes ={
			cont: 'selected'
		};

		//contact
		this.pages.contact =jrgArray.copy(this.components.publicNav);
		this.pages.contact.header.links[this.components.headerPublicIndices.contact].classes ={
			cont: 'selected'
		};
		
		//MEMBERS
		//calendar
		this.pages.calendar =jrgArray.copy(this.components.membersNav);
		this.pages.calendar.header.links[this.components.headerMembersIndices.calendar].classes ={
			cont: 'selected'
		};

		//documents
		this.pages.documents =jrgArray.copy(this.components.membersNav);
		this.pages.documents.header.links[this.components.headerMembersIndices.documents].classes ={
			cont: 'selected'
		};
		
		//dev-goals
		this.pages.devgoals =jrgArray.copy(this.components.membersNav);
		this.pages.devgoals.header.links[this.components.headerMembersIndices.devgoals].classes ={
			cont: 'selected'
		};
		
		//profile
		this.pages.profile =jrgArray.copy(this.components.membersNav);
		this.pages.profile.header.links[this.components.headerMembersIndices.profile].classes ={
			cont: 'selected'
		};
		

		//roster
		this.pages.roster =jrgArray.copy(this.components.membersNav);
		this.pages.roster.header.links[this.components.headerMembersIndices.roster].classes ={
			cont: 'selected'
		};

		//brother-info
		this.pages.brotherinfo =jrgArray.copy(this.components.membersNav);

		//admin
		this.pages.adminportal =jrgArray.copy(this.components.membersNav);
		this.pages.adminportal.header.links[this.components.headerMembersIndices.adminportal].classes ={
			cont: 'selected'
		};
		
		//end: CUSTOM nav definitions
	}
};
inst.init({});
return inst;
}]);