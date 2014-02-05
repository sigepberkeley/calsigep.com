'use strict';


angular.module('myApp').controller('TestCtrl', ['$scope', '$timeout', 'svcHttp', 'UserModel', 'LGlobals', '$location', function($scope, $timeout, svcHttp, UserModel, LGlobals, $location) {


$scope.opts ={
        ngChange: function() {$scope.searchTasks({}); }
};

$scope.searchTasks =function(){
	document.getElementById('phones').innerHTML = '{{formVals.carrier}}';
};

$scope.formVals = {
	first_name: '',
	last_name:'',
	email:'',
	phone_number:'',
	carrier:'',
	alum_status:'Undergrad',
	position:'gen_member',
	challenge:'',
	grad_year:'',
	first_major:'',
	second_major:'',
	minor:'',
	hometown:'',
	big_bro:'',
	little_bro:'',
	mentor:'',
	mentee:'',
	animal_name:'',
	undergrad:'UC Berkeley',
	grad_school:'',
	address:'',
	city:'',
	state:'',
	zip_code:'',
	dinner_team:'',
	olympics_team:'',
	parent_email:'',
	live_in_status:''

};

$scope.carrierOptsTags =[
        {val: 'AT&T', name: 'AT&T'},
        {val: 'Verizon', name: 'Verizon'},
        {val: 'Sprint', name: 'Sprint'},
        {val: "TMobile", name: 'T-Mobile'}
];

$scope.alumOptsTags = [
	{val: 'Undergrad', name: 'Undergrad'},
	{val: 'Alumnus', name: 'Alumnus'}
];

$scope.positionOptsTags = [
	{val: 'vPMD', name: 'VP Member Development'},
	{val: 'vPR', name: 'VP Recruitment'},
	{val: 'vPComm', name: 'VP Communications'},
	{val: 'vPFin', name: 'VP Finance'},
	{val: 'vPProg', name: 'VP Programming'},
	{val: 'Chap', name: 'Chaplain'},
	{val: 'Pres', name: 'President'},
	{val: 'standards_board', name: 'Standards Board'},
	{val: 'recruitment_board', name: 'Recruitment Board'},
	{val: 'gen_member', name:'General Member'},
	{val: 'Other', name:'Other'}
];

$scope.challengeOptsTags = [
	{val: 'sigma', name: 'Sigma'},
	{val: 'phi', name: 'Phi'},
	{val: 'epsilon', name: 'Epsilon'},
	{val: 'brother_mentor', name: 'Brother Mentor'},
];

$scope.yNOptsTags = [
	{val: 'Yes', name: 'Yes'},
	{val: 'No', name: 'No'}

];



}]);


// inline blocks

// more info page
// philanthropy page