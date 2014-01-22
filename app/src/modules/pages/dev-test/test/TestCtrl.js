'use strict';

angular.module('myApp').controller('TestCtrl', ['$scope', '$timeout', 'appHttp', 'UserModel', '$location', function($scope, $timeout, appHttp, UserModel, $location) {
	
	$scope.user =UserModel.load();
	
	
	var cropDiv1 = document.getElementById('crop1'),
          cropDiv2 = document.getElementById('crop2'),
          crop1,
          crop2;

      crop1 = new Crop(cropDiv1, {
        coords: [[100, 100], [400, 400]],
        onChange: updateCoords
      });
      crop2 = new Crop(cropDiv2, {
        coords: [[440, 0], [640, 200]],
        onChange: updateCoords
      });

      cropDiv1.addEventListener('click', function (event) {
        zoom(event, crop1);
      });
      cropDiv2.addEventListener('click', function (event) {
        zoom(event, crop2);
      });

      function updateCoords(el, coords) {
        el.querySelector('.coords').innerText = '(' + coords[0].join(',') + '), (' + coords[1].join(',') + ')';
      }

      function zoom(event, crop) {
        var role = event.target.getAttribute('data-role');

        if (role === 'zoomIn') {
          crop.scaleImage(1.05);
        } else if (role === 'zoomOut') {
          crop.scaleImage(0.95);
        }
      }
	  
}]);