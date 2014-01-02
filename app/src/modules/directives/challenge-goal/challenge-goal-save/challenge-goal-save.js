/**
@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
@param {Object} goal The challenge goal
	@param {String} id
	@param {String} title
	@param {String} [description]
	@param {Array} [tags]
	@param {Array} challenge
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
	challenge: [
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
					"<div jrg-forminput label='Title' placeholder='GPA' ng-model='goal.title' opts='' required ng-minlength='2'></div>"+
					"<div jrg-forminput type='textarea' label='Description' placeholder='Description' ng-model='goal.description' opts=''></div>"+
					"<div jrg-forminput type='multi-select' label='Tags' placeholder='sound_mind' select-opts='selectOptsTags' ng-model='selectValsTags' opts='configTags'></div>"+
					
					"<h4>Challenges</h4>"+
					"<div>Each challenge goal can be part of multiple challenges with different requirements for each (i.e. all challenges should have some sort of GPA/grades goals but the values and points will likely be different for each challenge)</div>"+
					"<div class='margin-l' ng-repeat='challenge in goal.challenge'>"+
						"<div jrg-forminput label='Challenge Name' placeholder='sigma' ng-model='challenge.name' opts='' required></div>"+
						
						"<div>Goals can be grouped together for setting minimum points per group to ensure balance when earning points (i.e. bench press, pushups, leg press, and pullups are just a few different ways to display muscle strength but we don't need ALL of these necessarily so we can just set a minimum of 10 points for a 'muscle_strength' group and allow them to achieve it in many different ways)</div>"+
						"<div jrg-forminput label='Challenge Goal Group' placeholder='academics' ng-model='challenge.group' opts=''></div>"+
						
						"<div>The number points awarded for earning the 'Target Value'</div>"+
						"<div jrg-forminput type='number' label='Points' placeholder='10' ng-model='challenge.points' opts='' required></div>"+
						
						"<div jrg-forminput type='number' label='Target Value' placeholder='3.1' ng-model='challenge.target_value' opts='' required></div>"+
						
						"<div>A minimum value allows partial points; the minimum value is where the points starts at 0. For example, earning a 3.0 GPA with a min value of 2.9 and a target value of 3.1 and points of 10 would earn (3.0-2.9)/(3.1-2.9)*10 = 5 points</div>"+
						"<div jrg-forminput type='number' label='Min. Value' placeholder='2.9' ng-model='challenge.min_value' opts=''></div>"+
						
						"<div>A maximum value allows extra points to reward people who went above the target value. For example, achieving a 3.8 GPA with a target value of 3.1, max value of 4.0, points of 10 and max points of 20 would earn (20-10)/(4.0-3.1)*(3.9-3.1) =7.78 extra points, (10+7.78) = 17.78 total points for this goal</div>"+
						"<div jrg-forminput type='number' label='Max. Value' placeholder='4.0' ng-model='challenge.max_value' opts=''></div>"+
						
						"<div>Max points is the maximum that will be awarded for this goal if the max value (or above) is achieved. This prevents 'runaway points' for any individual goal to keep balance in development</div>"+
						"<div jrg-forminput type='number' label='Max. Points' placeholder='20' ng-model='challenge.max_points' opts=''></div>"+
						
					"</div>"+
					"<div class='btn' ng-click='addChallenge({})'>Add Challenge</div>"+
					
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
				if($scope.goal.challenge ===undefined || $scope.goal.challenge.length <1) {
					$scope.addChallenge({});
				}
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
			
			$scope.addChallenge =function(params) {
				//only allow adding if none yet OR if last one has a name filled out
				if($scope.goal.challenge ===undefined || $scope.goal.challenge.length <1 || $scope.goal.challenge[$scope.goal.challenge.length-1].name) {
					if($scope.goal.challenge ===undefined) {
						$scope.goal.challenge =[];
					}
					var defaultChallenge ={
						name: ''
					};
					$scope.goal.challenge.push(defaultChallenge);
				}
			};
			
			init({});
		}
	};
}]);