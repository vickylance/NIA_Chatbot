var app = angular.module('submitExample', ['ngMaterial']);
var messages = j('.messages-content'),
	d, i = 0,
	msg = "",
	botmsg = "";

function setDate() {
	d = new Date();
	j('<div class="timestamp">' + formatAMPM(d) + '</div>').appendTo(j('.message:last'));
}

function insertMessage(msg) {
	if (j.trim(msg) == '') {
		return false;
	}
	j('<div class="message message-personal new">' + msg + '</div>').appendTo(j('#mCSB_1_container'));
	setDate();
	j('.message-input').val(null);
	updateScrollbar();
}

function insertBotMessage(msg) {
	if (j.trim(msg) == '') {
		return false;
	}
	j('<div class="message new">' + msg + '</div>').appendTo(j('#mCSB_1_container'));
	setDate();
	j('.message-input').val(null);
	j('.message.loading').remove();
	j('.message.timestamp').remove();
	updateScrollbar();
}

function updateScrollbar() {
	messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
		scrollInertia: 10,
		timeout: 0
	});
}

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}
var toggle = true;
j(window).bind('keypress', function (e) {
	if (e.keyCode == 13) {
		if (toggle) {
			j("#input-0").focus();
		} else {
			j("#input-0").blur();
		}
		toggle = !toggle;
	}
});

function setTyping() {
	j('<div class="message loading new"><span></span></div>').appendTo(j('#mCSB_1_container'));
	j('<div class="timestamp">Typing...</div>').appendTo(j('.message:last'));
	j('.message-input').prop('disabled', true);
}

j(window).load(function () {
	messages.mCustomScrollbar();
	j('.md-virtual-repeat-scroller').mCustomScrollbar();
	insertBotMessage("Hello, I am Nithya Robo");
	setTyping();
	setTimeout(function () {
		insertBotMessage("I am here to help you.");
	}, 1000);
	setTimeout(function () {
		insertBotMessage("As I'm new and in my learning period, I may not have answers to all your questions. However will try my best to provide the right information");
	}, 2000);
});


function email_template() {
	j('<div class="message new"><table><tr><td>Name:</td><td><input id="name" type="text" name="name" placeholder="Please enter your name"/></td></tr><tr><td>Email:</td><td><input id="email" type="email" name="email" placeholder="Please enter your email" /></td></tr><tr><td> Query: </td><td><textarea id="query" name="query" placeholder="Please enter your query here"></textarea></td></tr><tr><td><input id="send_email" type="submit" value="Send Email" /></td></tr></table>').appendTo(j('#mCSB_1_container'));
		var name = j("input#name");
		var email = j("input#email");
		var query = j("textarea#query");
	j('#send_email').click(function (e) {
		if ((email.val() && name.val() && query.val()) == null || (email.val() && name.val() && query.val()) == "") {		
			if(j(".message.new:last").text().match(/^Please provide all the details./i) == "Please provide all the details."){
				j(".message.new:last").remove();
			}
			insertBotMessage("Please provide all the details.");
	        return false;
    	}
    	else{
		name.attr('disabled', 'disabled');
		name.removeAttr('id');
		email.attr('disabled', 'disabled');
		email.removeAttr('id');
		query.attr('disabled', 'disabled');
		query.removeAttr('id');
		j("input#send_email").attr('disabled', 'disabled');
		j("input#send_email").removeAttr('id');
		if(j(".message.new:last").text().match(/^Please provide all the details./i) == "Please provide all the details."){
				j(".message.new:last").remove();
			}
		insertBotMessage("Your email is sent successfully. We will get back to you shortly...");
		}
	});
}

app.controller('autoCompleteController', autoCompleteController);

function autoCompleteController($rootScope, $scope, $timeout, $q, $log) {
	var self = this;
	self.car = loadCar();
	self.querySearch = querySearch;
	self.selectedItemChange = selectedItemChange;
	self.searchTextChange = searchTextChange;
	var qa_present;
	var attempt = 0;
	$scope.submit1 = function () {
		$scope.noCacheResults = false;
		// j('.md-autocomplete-suggestions').hide();
		var user_input = angular.lowercase(j('#input-0').val());
		j("#input-0").blur();
		if (j.trim(user_input) == '') {
			console.log("fasle");
			return false;
		}


		if (/hi|hello|hay/i.test(user_input) == true) {
			insertMessage(user_input);
			setTyping();
			setTimeout(function () {
				insertBotMessage("May I know what you are looking for");
			}, 1000);
		} else {
			var answer_count = 0;
			var correct_answer, correct_question;

			self.car.map(function (car) {
				if (car.value.indexOf(user_input) === 0) {
					answer_count = answer_count + 1;
					correct_answer = car.answer;
					correct_question = car.value;
				}
			});

			if (answer_count == 1) {
				qa_present = true;
				insertMessage(correct_question);
				setTyping();
				setTimeout(function () {
					insertBotMessage(correct_answer);
				}, 1000);
			}
		
			if (!qa_present) {
				if (attempt < 1) {
					insertMessage(user_input);
					setTyping();
					setTimeout(function () {
						insertBotMessage("Oops! Sorry I didn't understand your question. Can you please type your question in the format Ex : How can / What is");
					}, 1000);
					attempt = attempt + 1;
				} else {
					insertMessage(user_input);
					setTyping();
					setTimeout(function () {
						insertBotMessage("Sorry I still didn't get your question. While I try to learn the answer to your question, could you please contact 1800-xxx-xxx for the right answer");
						email_template();
					}, 1000);
					attempt = 0;
				}
			} else {
				qa_present = false;
				attempt = 0;
			}
		}
		j('#input-0').val('');
	}

	function querySearch(query) {
		var start = Math.floor(Math.random() * (self.car.length - 100));
		var end = 10 + start;
		var results = query ? self.car.filter(createFilterFor(query)) : self.car.slice(1, 10),
			deferred;

		if (self.simulateQuery) {
			deferred = $q.defer();
			$timeout(function () {
					deferred.resolve(results);
				},
				Math.random() * 1000, false);
			return deferred.promise;
		} else {
			return results;
		}
	}

	function searchTextChange(text) {}

	function selectedItemChange(item) {}

	//build list of states as map of key-value pairs
	function loadCar() {
		var arrCarList = new Array(
			"What is Insurance?<answer> It is a system by which the losses suffered by a few are spread over many, exposed to similar risks. Insurance is a protection against financial loss arising on the happening of an unexpected event.",
			"Why do I need Insurance?<answer> Insurance is a hedge against the occurrence of unforeseen incidents. Insurance products help you in not only mitigating risks but also helps you by providing a financial cushion against adverse financial burdens suffered.",
			"What does General Insurance do for me?<answer> Accidents... illness... fire... financial securities are the things you'd like to worry about any time. General Insurance provides you the much-needed protection against such unforeseen events. Unlike Life Insurance, General Insurance is not meant to offer returns but is a protection against contingencies. Under certain Acts of Parliament, some types of insurance like Motor Insurance and Public Liability Insurance have been made compulsory.",
			"How much Insurance do I need?<answer> It is very important to have adequate amount of coverage for each insurance policy. For any asset or property insurance, the value of the asset based on market value or reinstatement value should be taken into consideration before deciding Sum Insured. If the Sum Insured is not adequate, the percentage representing the uncovered portion of the asset is to be borne by the insured.",
			"What all can I get covered under insurance?<answer> Almost everything that has a financial value in your life and has a probability of getting lost, stolen or damaged, can be covered through insurance. Property (both movable and immovable), vehicle, cash, household goods, health, dishonesty and also your liability towards others can be covered.",
			"Why should one cover oneself immediately?<answer> Accidents and mishaps can occur anytime and anywhere. It is important to identify the risks faced and insure oneself against these at the earliest.",
			"What is Premium?<answer> Premium is the fixed amount of sum paid over the period by the insured to the insurance company to take insurance policy and to complete the contract of insurance.",
			"Why should I fill up proposal form for buying Insurance?<answer> Insurance is a contract between the insured and the insurer. The proposal form is the basis of contract and it contains all the required information for the preparation of the policy which is a contract document.",
			"What is Underwriting?<answer> It is the consideration of material fact to asses the risk and to take the decision whether to accept the risk for insurance contract and if so at what rate of premium.",
			"What is deductible?<answer> The amount, which the insured has to bear in all cases and this amount is first, deducted from the total assessed payable claims amount before determining insurance company's liability.",
			"What is Reinsurance?<answer> It is an arrangement by which insurance companies spread their risk with other underwriters or reinsurance companies called Reinsurance."
		);
		return arrCarList.map(function (car) {
			return {
				value: car.split('<answer>')[0].toLowerCase(),
				answer: car.split('<answer>')[1],
				display: car.split('<answer>')[0]
			};
		});
	}
	//filter function for search query
	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(car) {
			return (car.value.indexOf(lowercaseQuery) >= 0);
		};
	}
}

app.controller('ChatTitleCtrl', ['$scope', function ($scope) {
	$scope.maximChatbox = function () {
		j("#minim-chat").css("display", "block");
		j("#maxi-chat").css("display", "none");
		j("#chatbox").css("margin", "0");
		j("#animHelpText").css("display", "none");
	};
	$scope.minimChatbox = function () {
		j("#minim-chat").css("display", "none");
		j("#maxi-chat").css("display", "block");
		j("#chatbox").css("margin", "0 0 -53vh 0");
		j("#animHelpText").css("display", "block");
	};
}]);
