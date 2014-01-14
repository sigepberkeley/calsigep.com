/**
@toc
1. init
2. $scope.addGroup
3. $scope.deleteGroup
4. $scope.submitForm
5. resetChallenge
5.1. $scope.$watch('challenge',..

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Object} challenge The challenge
		@param {String} [_id] Set for edit only
		@param {String} name
		@param {Number} max_duration
		@param {Number} min_points
		@param {Array} group Array of group objects, each has:
			@param {String} [_id]
			@param {String} name
			@param {Number} min_points
@param {Array} groups Array of strings for groups to use for autocomplete vals
@param {Array} challengeNames Array of strings for challenge names to use for autocomplete vals
@param {Function} save Called to save the challenge

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'

@dependencies

@usage
partial / html:
<div app-dev-challenge-save challenge='challenge' groups='groups' challenge-names='challengeNames' save='saveChallenge'></div>

controller / js:
$scope.challenge ={
	_id: 'idchallenge',
	name: 'challenge name',
	group: []
};

$scope.groups =[
	'group1',
	'group2'
];

$scope.challengeNames =[
	'name1',
	'name2'
];

// @param {Object} params
$scope.saveChallenge =function(params, callback) {
	//save (to backend) here
	callback({});
};

//end: usage
*/

'use strict';

angular.module('app').directive('appDevChallengeSave', [ function () {

	return {
		restrict: 'A',
		scope: {
			challenge: '=',
			groups: '=',
			challengeNames: '=',
			save: '&'
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
				"<form class='jrg-forminput-form' name='challengeForm' ng-submit='submitForm()'>"+
					"<div jrg-forminput type='autocomplete' vals-autocomplete='challengeNames' label='Name' placeholder='sigma' ng-model='challenge.name' opts='' required ng-minlength='2'></div>"+
					"<div jrg-forminput type='number' label='Max. Duration (Days)' placeholder='365' ng-model='challenge.max_duration' required opts=''></div>"+
					"<div jrg-forminput type='number' label='Min. Points' placeholder='0' ng-model='challenge.min_points' required opts=''></div>"+
					
					"<h4 class='margin-large-t'>Groups</h4>"+
					
					"<div class='margin-l app-dev-challenge-save-group' ng-repeat='group in challenge.group'>"+
						
						"<div jrg-forminput type='autocomplete' vals-autocomplete='groups' label='(Points) Group' placeholder='academics' ng-model='group.name' opts=''></div>"+
						"<div jrg-forminput type='number' label='Min. Points' placeholder='0' ng-model='group.min_points' required opts=''></div>"+
						
						"<div class='margin-tb'>"+
							"<span class='margin-l btn btn-small btn-danger' ng-click='deleteGroup($index, {})'>Delete</span>"+
						"</div>"+
						
					"</div>"+
					
					"<div class='margin-tb' ng-show='challenge.group && (challenge.group.length <1 || challenge.group[(challenge.group.length-1)].name)'>"+
						"<div class='btn' ng-click='addGroup({})'>Add Group</div>"+
					"</div>"+
					
					"<div class='margin-tb'>"+
						"<button class='btn btn-primary jrg-forminput-submit' type='submit' >Save</button>"+
					"</div>"+
				"</form>"+
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
		
			/**
			@toc 1.
			@method init
			*/
			function init(params) {
				if($scope.challenge.group ===undefined || $scope.challenge.group.length <1) {
					$scope.addGroup({});
				}
			}
			
			/**
			@toc 2.
			@method $scope.addGroup
			*/
			$scope.addGroup =function(params) {
				//only allow adding if none yet OR if last one has a name filled out
				if($scope.challenge.group ===undefined || $scope.challenge.group.length <1 || $scope.challenge.group[$scope.challenge.group.length-1].name) {
					if($scope.challenge.group ===undefined) {
						$scope.challenge.group =[];
					}
					//set some defaults
					var defaultGroup ={
						name: '',
					};
					$scope.challenge.group.push(defaultGroup);
				}
			};
			
			/**
			@toc 3.
			@method $scope.deleteGroup
			*/
			$scope.deleteGroup =function(index, params) {
				$scope.challenge.group.splice(index,1);
			};
			
			/**
			@toc 4.
			@method $scope.submitForm
			*/
			$scope.submitForm =function() {
				if($scope.challengeForm.$valid) {
					var paramsSend ={};
					
					if($scope.save !==undefined && $scope.save() !==undefined && typeof($scope.save()) =='function') {		//ensure it exists
						$scope.save()(paramsSend, function(ppCallback) {
							//blank out challenge if it was an add (if don't have _id)
							// if(ppCallback.reset
							if($scope.challenge._id ===undefined) {
								resetChallenge({});
							}
						});
					}
				}
				else {
					$scope.$emit('evtAppalertAlert', {type:'error', msg:'Please fill out all required fields properly!'});
				}
			};
			
			/**
			@toc 5.
			@method resetChallenge
			*/
			function resetChallenge(params) {
				$scope.challenge ={};
				init({});
			}
			
			/**
			Hack to ensure form is valid (otherwise when load a challenge, there's an extra group that's not valid; this fixes it..)
			@toc 5.1.
			@method $scope.$watch('challenge',..
			*/
			$scope.$watch('challenge', function(newVal, oldVal) {
				// if(!angular.equals(oldVal, newVal)) {
				if(1) {
					$scope.addGroup({});
					$scope.deleteGroup(($scope.challenge.group.length-1), {});
					// if($scope.challenge.group.length <1) {
						// $scope.addGroup({});
					// }
				}
			});
			
			
			init({});
		}
	};
}]);