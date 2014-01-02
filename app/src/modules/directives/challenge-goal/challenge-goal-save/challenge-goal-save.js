/**
@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
@param {Object} goal The challenge goal
	@param {String} id
	@param {String} title
	@param {String} [description]
	@param {Array} [tags]
	@param {Array} challenge_name
		@param {String} _id
		@param {String} name
		@param {String} date_last_active
		@param {String} [group]
		@param {Number} points
		@param {Number} goal_value
		@param {Number} [min_value]
		@param {Number} [max_value]
		@param {Number} [max_points]
@param {Array} tags Array of tag objects, each has:
	@param {String} _id
	@param {String} name

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
TODO

@dependencies

@usage
partial / html:
<div app-challenge-goal-save goal='goal' tags='tags' ></div>
TODO

controller / js:
$scope.goal ={
	_id: 'idgoal',
	title: 'goal title',
	description: 'goal description',
	tags: ['tag1', 'tag2'],
	challenge_name: [
	]
};

$scope.tags =[
	{_id: 'id1', name: 'tag1'},
	{_id: 'id2', name: 'tag2'},
	{_id: 'id3', name: 'tag3'}
];

//end: usage
*/

'use strict';

angular.module('app').directive('appChallengeGoalSave', [ function () {

	return {
		restrict: 'A',
		scope: {
			goal: '=',
			tags: '='
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
					"<div jrg-forminput type='textarea' placeholder='Description' ng-model='goal.description' opts=''></div>"+
					"<div jrg-multiselect select-opts='selectOptsTags' ng-model='selectValsTags' config='configTags'></div>"+
					
					"<div ng-repeat='challenge in goal.challenge_name'>"+
						"<div jrg-forminput placeholder='Challenge' ng-model='challenge.name' opts='' required></div>"+
						"<div jrg-forminput placeholder='Goals Group' ng-model='challenge.group' opts=''></div>"+
						"<div jrg-forminput placeholder='Points' ng-model='challenge.points' opts='' required></div>"+
						"<div jrg-forminput placeholder='Target Value' ng-model='challenge.target_value' opts='' required></div>"+
						"<div jrg-forminput placeholder='Min. Value' ng-model='challenge.min_value' opts=''></div>"+
						"<div jrg-forminput placeholder='Max. Value' ng-model='challenge.max_value' opts=''></div>"+
						"<div jrg-forminput placeholder='Max. Points' ng-model='challenge.max_points' opts=''></div>"+
					"</div>"+
					
					"<button class='btn btn-primary jrg-forminput-submit' type='submit' >Save</button>"+
				"</form>"+
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
			function init(params) {
				initSelectTags({});
			}
			
			function initSelectTags(params) {
				$scope.selectValsTags =[];
				$scope.configTags ={};
				$scope.selectOptsTags =[];
				var ii, selectOptsTags =[];
				for(ii =0; ii<$scope.tags.length; ii++) {
					selectOptsTags.push({
						val: $scope.tags[ii]._id,
						name: $scope.tags[ii].name
					});
				}
				$scope.selectOptsTags =selectOptsTags;
			}
			
			init({});
		}
	};
}]);