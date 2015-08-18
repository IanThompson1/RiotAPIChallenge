var apiKey = '8534cb90-e767-43c3-a3b2-168a027cd8d0';
var euwAccounts = {
	"Huni": ["Fnatic Hun1", "Fnatic Hunl"],
	"Reignover": ["Fnatic Reign0ver"],
	"Rekkles": ["Fnatic Rekkles"],
	"YellOwStar": ["FnaticYellOwStaR"],
	"Febiven": ["Fnatic Febiven"]
};
var testName = "Fnatic Hun1";
var testId = 69277199;
var matchHistory = [];
var matchId = 0;
var playerId = 0;//77028455;

function getPlayerId(playerName){
	playerId = $.Deferred();
	$.ajax({
		url: 'https://euw.api.pvp.net/api/lol/euw/v1.4/summoner/by-name/' + playerName + '?api_key=' + apiKey,
		type: 'GET',
		dataType:'json',
		data:{},
		success: function (playerDetails) {
			var playerNameTrimmed = playerName.toLowerCase().replace(/\s+/g, '');
			playerId.resolve(playerDetails[playerNameTrimmed].id);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
	});
	return playerId.promise();
}

function getPlayerMatchHistory(playerId){
	matchHistoryIds = $.Deferred();
	$.ajax({
		url: 'https://euw.api.pvp.net/api/lol/euw/v2.2/matchhistory/' + playerId + '?rankedQueues=RANKED_SOLO_5x5&api_key=' + apiKey,
		type: 'GET',
		dataType:'json',
		data:{},
		success: function (matchHistory) {
			var matches = matchHistory.matches;
			tmpMatchIds = [];
			for (matchIndex in matches){
				tmpMatchIds.push(matches[matchIndex].matchId);
			}
			matchHistoryIds.resolve(tmpMatchIds);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
	});
	return matchHistoryIds.promise();
}


function setMatchField(matchID){
	document.getElementById("matchID").value = matchID;
	document.getElementById("setButton").disabled = false;
}

function appendMatch(matchID){
	var ul = document.getElementById("matchesList");
	var li = document.createElement("li");
	var a = document.createElement("a");
	a.appendChild(document.createTextNode(matchID));
	a.setAttribute("onclick","setMatchField("+matchID+")");
	li.appendChild(a);
	ul.insertBefore(li,ul.firstChild);
}


document.getElementById("matchButton").addEventListener('click', function(){
	playerName = document.getElementById("playerName").value;
	getPlayerId(playerName).done(function (playerIdTemp){
		playerId = playerIdTemp;
		getPlayerMatchHistory(playerId).done(function (matchHistory){
			$(document.getElementById("matchesList")).empty();
			for(matchIndex in matchHistory.reverse()){
				matchID = matchHistory[matchIndex];
				generateBuildJSON(playerId,matchID);
			}
			
		});
	});
});

document.getElementById("setButton").addEventListener('click', function(){
	matchId = document.getElementById("matchID").value;
	generateBuildJSON(playerId,matchId);
});


