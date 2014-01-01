/**
@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
TODO

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
TODO

@dependencies
TODO

@usage
partial / html:
<div app-challenge-goal-save></div>
TODO

controller / js:
TODO

//end: usage
*/

'use strict';

angular.module('app').directive('appChallengeGoalSave', [ function () {

	return {
		restrict: 'A',
		scope: {
		},

		// replace: true,
		template: function(element, attrs) {
			var defaultsAttrs ={
			};
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			var html ="<div>"+
				"<form class='jrg-forminput-form' name='challengeGoalForm' ng-submit='submitForm()'>"+
					"<div jrg-forminput placeholder='Title' ng-model='goal.title' opts='' required ng-minlength='2'></div>"+
					
					"<div jrg-multiselect id='select1' select-opts='selectOpts' ng-model='selectVals' config='config'></div>"+
					"<div jrg-datetimepicker ng-model='ngModel' opts='opts'></div>"+
					
					"<button class='btn btn-primary jrg-forminput-submit' type='submit' >Save</button>"+
				"</form>"+
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
			$scope.selectVals =[];
			$scope.config ={};
			$scope.selectOpts =[
				{'val':1, 'name':'one'},
				{'val':2, 'name':'two'},
				{'val':3, 'name':'three'},
				{'val':4, 'name':'four'},
				{'val':5, 'name':'five'}
			];
		
			$scope.ngModel ='';
			$scope.opts ={
				pikaday: {
					//firstDay: 1,                //start on Monday
					showTime: true                //show timepicker as well
				}
			};
		}
	};
}]);