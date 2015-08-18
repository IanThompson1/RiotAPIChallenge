var apiKey = '8534cb90-e767-43c3-a3b2-168a027cd8d0';
var playerID = 0;//24483554;34148603
var matchID = 0;//2195029913;2242598223
var buildIds = [];
var finalBuildImages = "";
//var buildOrderIds = [];
//var buildOrder = [];
var exampleBuild = [
[1056, 7986],
[2003, 8408],
[3340, 8993],
[2003, 9676],
[1056, 333347],
[1056, 334226],
[2003, 335560],
[2003, 335769],
[2003, 336110],
[2003, 338520],
[1026, 512889],
[1001, 660804],
[1052, 662556],
[3020, 986978],
[1058, 1118580],
[3089, 1122664],
[3057, 1264188],
[3113, 1462530],
[3100, 1605386],
[1026, 1761101],
[1052, 1943156]];

function setIDs(newPlayerID,newMatchID){
	playerID = newPlayerID;
	matchID = newMatchID; 
}

function getParticipantId(playerId,matchDetails){
	var playerParticipantId = -1
	var finalItems = [];
	playerList = matchDetails.participantIdentities;
	for (playerIndex in playerList)	{ //Go through list of players
		currentPlayerId = playerList[playerIndex].player.summonerId; // Get their summoner Id
		if (currentPlayerId == playerId) { // if their summoner Id 
			playerParticipantId = playerList[playerIndex].participantId-1;
			return playerParticipantId;
		}
	}
}

//
function getPlayerItemBuilds(gameFrames,playerParticipantId){//getBuildOrderIds
	var buildOrderIds = []
	for (frameIndex = 1; frameIndex<gameFrames.length;frameIndex++){
		frame=gameFrames[frameIndex];
		frameEvents=frame.events;
		for (frameEventIndex in frameEvents){
			currentEvent = frameEvents[frameEventIndex]
			itemPurchaseTimestamp = currentEvent.timestamp;
			if (currentEvent.participantId == playerParticipantId && currentEvent.eventType === "ITEM_PURCHASED"){
				itemId = currentEvent.itemId
				buildOrderIds.push([itemId,itemPurchaseTimestamp]);
			}
		}
	}
	return buildOrderIds;
}

function getItemDetails(itemId){
	itemName = $.Deferred();
	$.ajax({
		url: 'https://global.api.pvp.net/api/lol/static-data/euw/v1.2/item/' + itemId + '?api_key=' + apiKey,
		type: 'GET',
		dataType:'json',
		data:{},
		success: function (itemDetails) {//itemD
			itemName.resolve(itemDetails.name);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
            
        }
	});
	return itemName.promise();
}

function getChampionDetails(championId){
	var championDetails = $.Deferred();
	$.ajax({
		url: 'https://global.api.pvp.net/api/lol/static-data/euw/v1.2/champion/' + championId + '?champData=image&api_key=' + apiKey,
		type: 'GET',
		dataType:'json',
		data:{},
		success: function (results){
			championDetails.resolve(results);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
            
        }
    });
    return championDetails.promise();
}

function getChampionURL(championDetails){
	var championURL = "http://ddragon.leagueoflegends.com/cdn/5.15.1/img/champion/" + championDetails.image.full;
	return championURL;
}

function getMatchSummary(matchDetails, participantId){
	var player = matchDetails.participants[participantId];
	var teamID = player.teamId;
	var stats = player.stats;
	var summary = {
		"champion": player.championId,
		"summonerOne": player.spell1Id,
		"summonerTwo": player.spell2Id,
		"kills": stats.kills,
		"deaths": stats.deaths,
		"assists": stats.assists,
		"finalItems": [
			stats.item0,
			stats.item1,
			stats.item2,
			stats.item3,
			stats.item4,
			stats.item5,
			stats.item6,
		]
	}
	if (matchDetails.teams[0].teamId === teamID){
		summary["winner"] = matchDetails.teams[0].winner;
	}
	else{
		summary["winner"] = matchDetails.teams[1].winner;
	}
	return summary;
}

function getItemImage(itemId){
	var imageURL = "http://ddragon.leagueoflegends.com/cdn/5.15.1/img/item/"+itemId+".png"
	return imageURL;
}

function createSummaryImage(build, championURL,kda, winner){
	var summaryDiv = document.createElement("div");
	var champDiv = document.createElement("div");
	var kdaSpan = document.createElement("span");
	var summonerDiv = document.createElement("div");
	var itemsSpan = document.createElement("span");

	var chmpImg = document.createElement("img");
	chmpImg.src = championURL;
	summaryDiv.appendChild(chmpImg);

	var kdaText = document.createTextNode(kda);
	kdaSpan.appendChild(kdaText)
	kdaSpan.style.padding = "0 5 0 10";
	kdaSpan.style.fontSize = "130%"
	summaryDiv.appendChild(kdaSpan);

	for (buildIndex in build){
		var imgTmp = document.createElement("img");
		var imgurl = getItemImage(build[buildIndex]);
		imgTmp.src = imgurl;
		itemsSpan.appendChild(imgTmp);
	}

	itemsSpan.style.padding = "0 10 0 5";
	summaryDiv.appendChild(itemsSpan);
	if (winner == true){
		summaryDiv.style.backgroundColor = "green";
	}
	else{
		summaryDiv.style.backgroundColor = "red";
	}
	summaryDiv.style.display = "inline-block"
	return summaryDiv;
}

function getMatchDetails(matchId,playerId) {
	var matchDetails = $.Deferred();
	$.ajax({
		url: 'https://euw.api.pvp.net/api/lol/euw/v2.2/match/' + matchId + '?includeTimeline=true&api_key=' + apiKey,
		type: 'GET',
		dataType:'json',
		data:{},
		success: function (searchResults) {
			matchDetails.resolve(searchResults);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
	});
	return matchDetails.promise();
}

function getFinalItems(matchDetails,participantId) {
	var summary = getMatchSummary(matchDetails, participantId);
	var finalItems = summary["finalItems"];
	return finalItems;
}

function getBuildIds(matchDetails, participantId) {
	var gameFrames = matchDetails.timeline.frames;
	var buildOrderIds = getPlayerItemBuilds(gameFrames,participantId);
	return buildOrderIds
}

function getChampionId(matchDetails, participantId) {
	var championId = matchDetails.participants[participantId].championId;
	return championId;
}

function getSummonerSpellIds(matchDetails, participantId){
	var summonerSpells = {
		"spell1": matchDetails.participants[participantId].spell1Id,
		"spell2": matchDetails.participants[participantId].spell2Id
	}
	return summonerSpells;
}

//Not neccesary yet. 
function getBuildNames(buildIds) {
	for(x in buildIds){
		getItemDetails(buildIds[x][0]).done(function (itemName){
		})
	}
}

function countItems(itemList){
	var count = seq_dict();
	for(itemIndex in itemList){
		count.increment(itemList[itemIndex]);
	}
	return count;
}

function classifyItemPurchaseTimestamp(itemPurchases){
	var classification = {first:[], early:[], mid:[], late:[]};
	var counted = {first:"", early:"", mid:"", late:""};
	for(itemIndex in itemPurchases){
		item = itemPurchases[itemIndex][0]
		itemPurchaseTime = itemPurchases[itemIndex][1];
		if (itemPurchaseTime <= 90000) { 
			classification.first.push(item);
		}
		else if (itemPurchaseTime > 90000 && itemPurchaseTime <= 600000){
			classification.early.push(item);
		}
		else if(itemPurchaseTime >600001 && itemPurchaseTime <=1200000){
			classification.mid.push(item);
		}
		else {
			classification.late.push(item);
		}
	}

	counted.early = countItems(classification.early);
	counted.first = countItems(classification.first);
	counted.mid = countItems(classification.mid);
	counted.late = countItems(classification.late); 
	return counted;
}

function seq_dict() {
	var keys = [];
	var vals = {};
	return {
		increment: function (key){
			if (!vals[key]){
				keys.push(key);
				vals[key] = 1;
			}
			else{
				vals[key]++;
			}
		},
		value: function (key){
			return vals[key];
		},
		getkeys: function (){
			return keys;
		}
	};
}

function downloadFile(fname, data,summaryImage) {
	var b = document.createElement('a');
	b.download=fname;
	b.style.color = "inherit";
	b.style.textDecoration = "none";
	b.href='data:application/json;base64,'+window.btoa(unescape(encodeURIComponent(data)));
	b.appendChild(summaryImage);
	return b
};

function makeJSON(itemBuild){
	var title = "Page title";
	var type = "custom";
	var map = "SR";
	var mode = "CLASSIC";
	var firstItems = itemBuild.first;
	var earlyItems = itemBuild.early;
	var midItems = itemBuild.mid;
	var lateItems = itemBuild.late;
	var itemSet = {
		"title": title,
		"type": type,
		"map": map,
		"mode": mode,
		"blocks": []
	}
	itemSet["blocks"].push(makeBlock(firstItems,"Starting items"));
	itemSet["blocks"].push(makeBlock(earlyItems,"Early game"))
	itemSet["blocks"].push(makeBlock(midItems,"Mid game"))
	itemSet["blocks"].push(makeBlock(lateItems,"Late game"))
	return itemSet;
}

function makeBlock(items, blockName){
	var block = {
		"type": blockName, 
		"items": []
	};
	itemIds = items.getkeys();
	for(itemIdIndex in itemIds){
		item = itemIds[itemIdIndex];
		count = items.value(item);
		block["items"].push({
			"id": item.toString(),
			"count": count
		});
	}
	return block;
}


function generateBuildJSON(playerId,matchId){
	setIDs(playerId,matchId);
	getMatchDetails(matchID,playerID).done(function (matchDetails){
		var participantId = getParticipantId(playerID,matchDetails);
		var buildIds = getBuildIds(matchDetails,participantId);
		var classifiedBuild = classifyItemPurchaseTimestamp(buildIds);
		var itemSetJSON = makeJSON(classifiedBuild);
		var JSONstring = JSON.stringify(itemSetJSON);
		var finalItems = getFinalItems(matchDetails,participantId);
		var matchSummary = getMatchSummary(matchDetails,participantId);
		var championId = matchSummary["champion"];
		var winner = matchSummary["winner"];
		var kda = matchSummary["kills"] +"/" + matchSummary["deaths"] + "/" + matchSummary["assists"];
		getChampionDetails(championId).done(function (championDetails){
			var championURL = getChampionURL(championDetails)
			var summaryImage = createSummaryImage(finalItems,championURL,kda,winner);
			var downloadable = downloadFile("champion.json",JSONstring,summaryImage);
			var br = document.createElement("br");
			document.getElementById("matchSummary").appendChild(downloadable);
			document.getElementById("matchSummary").appendChild(br);
		});
	});
}
