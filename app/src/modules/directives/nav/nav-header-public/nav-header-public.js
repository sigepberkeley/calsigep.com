/**
@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Object} nav The full nav object from the nav service / nav-config.js
		@param {Array} links The links to display; each is an object of:
			@param {String} html
			@param {String} href
	@param {String} appPathImg

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'

@dependencies

@usage
partial / html:
<div app-nav-header-public app-path-img='appPathImg' nav='nav'></div>

controller / js:
$scope.appPathImg ='/src/common/img';

$scope.nav ={
	links: [
		{
			html: 'link1',
			href: 'href1'
		}
	]
};

//end: usage
*/

'use strict';

angular.module('app').directive('appNavHeaderPublic', ['appConfig', function (appConfig) {

	return {
		restrict: 'A',
		scope: {
			nav: '=',
			appPathImg: '='
		},

		replace: true,
		template: function(element, attrs) {
			var defaultsAttrs ={
			};
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			var html ="<div class='nav-header header-public'>"+
				"<img class='header-public-img-bm' ng-src='{{appPathImg}}/logos/balanced_man.png' />"+
				"<div class='header-public-inner flexbox'>"+
					"<img class='header-public-img-sigep' ng-src='{{appPathImg}}/logos/sigep-text.png' />"+
					"<img class='header-public-img-berkeley' ng-src='{{appPathImg}}/logos/berkeley-text.png' />"+
					
					// "<img ng-src='{{appPathImg}}/logos/slogan.png' />"+
					// "<img ng-src='{{appPathImg}}/logos/heart.png' />"+
					
					"<div class='header-public-links-all flex1'>"+
						"<div class='header-public-link header-public-link-menu pull-right' ng-click='toggleMenu({})'>Menu</div>"+
						
						"<div class='header-public-links pull-right'>"+
							"<a ng-repeat='link in nav.links' class='a-div header-public-link {{link.classes.cont}}' ng-href='{{link.href}}'>{{link.html}}</a>"+
						"</div>"+
					"</div>"+
					
					"<a ng-href='{{appPathLink}}dev-goals' class='a-block'><img class='header-public-img-letters' ng-src='{{appPathImg}}/logos/greek-letters.png' /></a>"+
				"</div>"+
				
				//menu
				"<div class='header-public-menu padding-lr' ng-show='visible.menu'>"+
					"<a ng-repeat='link in nav.links' class='a-div header-public-menu-link padding-tb {{link.classes.cont}}' ng-href='{{link.href}}'>{{link.html}}</a>"+
					"<a ng-href='{{appPathLink}}dev-goals' class='a-block'><img class='header-public-img-letters-menu' ng-src='{{appPathImg}}/logos/greek-letters.png' /></a>"+
				"</div>"+
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
			$scope.appPathLink =appConfig.appPathLink;
			
			$scope.visible ={
				menu: false
			};
			
			$scope.toggleMenu =function(params) {
				$scope.visible.menu =!$scope.visible.menu;
			};

			
		}
	};
}]);