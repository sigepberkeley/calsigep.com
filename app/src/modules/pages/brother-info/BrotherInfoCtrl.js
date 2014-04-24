/**
*/

'use strict';

angular.module('myApp').controller('BrotherInfoCtrl', ['$scope', '$routeParams', 'appHttp',
function($scope, $routeParams, appHttp) {

	var promise1 = appHttp.go({}, {url:'user/read', data:{_id: $routeParams.id}}, {});
		promise1.then(function(response) {
			$scope.user = response.result.result;	
	});

}]);