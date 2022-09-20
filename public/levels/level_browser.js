const MAX_FORMAT_VERSION = 6
const MODERATION_ACTION_EXTRA = "" //"&duration=61"
var isLoading = false;
var isAtTop = true;
var nextPageTimestamp = -1;
var noMoreLevels = false;
var numberOfLevels = 0;
var currentTab = "newest";
var levelsUserID = ""
var currentSearchTerm = ""

function getCookie(cname)
{
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++)
	{
		let c = ca[i];
		while(c.charAt(0) == ' ')
		{
			c = c.substring(1);
		}
		if(c.indexOf(name) == 0)
		{
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

async function clearLevels()
{
	var containerWrapper = document.getElementById("list-container-wrapper");
	var container = document.getElementById("list-container");
	container.innerHTML = '';

	for(let i = containerWrapper.children.length - 1; i >= 0; i -= 1)
	{
		if(containerWrapper.children[i] != container)
		{
			containerWrapper.removeChild(containerWrapper.children[i]);
		}
	}
}

async function loadMoreLevels()
{
	if(isLoading || noMoreLevels) return;

	if(currentTab === "search_users" && currentSearchTerm.length === 0)
	{
		//TODO: Should show a message to enter a search term
		return
	}

	isLoading = true;

	console.log("loading more levels");

	let accessToken = getCookie("access_token");
	let userInfoString = getCookie("user_info")
	let userInfo = undefined
	if(userInfoString && userInfoString.length > 0) userInfo = JSON.parse(userInfoString);

	if(currentTab === "newest" && currentSearchTerm.length === 0)
	{
		let totalLevelCountResponse = await fetch(SERVER_URL + 'total_level_count');
		let totalLevelCount = await totalLevelCountResponse.text();

		var title = document.getElementById("title-text");
		title.innerHTML = "All Levels (" + totalLevelCount + " Levels)";
	}

	let requestURL = "";
	if(((currentTab !== "favorites" && currentTab !== "report_levels" && currentTab !== "report_users" && currentTab !== "banned_users") || currentSearchTerm.length > 0) && currentTab !== "search_users")
	{
		requestURL = SERVER_URL + 'list?max_format_version=' + MAX_FORMAT_VERSION;
		if(currentTab === "verified" && currentSearchTerm.length == 0) requestURL += '&type=ok';
		if(currentTab === "hidden" && currentSearchTerm.length == 0) requestURL += '&type=hidden&access_token=' + accessToken;
		if(currentSearchTerm.length > 0) requestURL += '&type=search&search_term=' + currentSearchTerm;

		if(nextPageTimestamp != -1) requestURL += '&page_timestamp=' + nextPageTimestamp;
		if(((levelsUserID && levelsUserID.length > 0) || (userInfo && userInfo.user_id && userInfo.user_id.length > 0 && currentTab === "mylevels")) && currentSearchTerm.length == 0)
		{
			requestURL += '&user_id='

			//List only a specific users levels
			if(currentTab === "mylevels") requestURL += userInfo.user_id
			else requestURL += levelsUserID

			//Admins also get to see the hidden levels of that user
			if(userInfo && "is_admin" in userInfo && userInfo.is_admin === true && accessToken)
			{
				requestURL += '&type=all&access_token=' + accessToken
				noMoreLevels = true //The endpoint for this currently does not support pagination
			}
		}
	}
	else if(currentTab === "favorites" && accessToken && accessToken.length > 0)
	{
		requestURL = SERVER_URL + 'get_favorite_levels?access_token=' + accessToken;
	}
	else if(currentTab === "report_levels" && accessToken && accessToken.length > 0)
	{
		requestURL = SERVER_URL + 'report_list?access_token=' + accessToken + '&type=level&max_format_version=' + MAX_FORMAT_VERSION;
	}
	else if(currentTab === "report_users" && accessToken && accessToken.length > 0)
	{
		requestURL = SERVER_URL + 'report_list?access_token=' + accessToken + '&&type=user&max_format_version=' + MAX_FORMAT_VERSION;
	}
	else if(currentTab === "banned_users" && accessToken && accessToken.length > 0)
	{
		//TODO: Should probably remove max_format_version parameter here, and in above cases, but check if there is a case where it is used somehow first
		requestURL = SERVER_URL + 'report_list?access_token=' + accessToken + '&&type=banned_user&max_format_version=' + MAX_FORMAT_VERSION;
	}
	else if(currentTab === "search_users")
	{
		requestURL = SERVER_URL + 'list?type=user_name&search_term=' + currentSearchTerm;
	}
	else
	{
		return;
	}

	let response = await fetch(requestURL);
	if(response.status != 200)
	{
		noMoreLevels = true
		isLoading = false
		let text = await response.text();
		//console.log(text);
		if(accessToken && text === "Invalid Access Token") logout();
		return;
	}

	let responseBody = await response.json();

	var containerWrapper = document.getElementById("list-container-wrapper");
	var container = document.getElementById("list-container");

	numberOfLevels += responseBody.length;

	for(let listElement of responseBody)
	{
		let cell = document.createElement("div");
		container.appendChild(cell);
		if(userInfo && (("is_admin" in userInfo && userInfo.is_admin === true) || ("is_moderator" in userInfo && userInfo.is_moderator === true)))
		{
			if(currentTab === "report_levels" || currentTab === "report_users")
			{
				cell.className = 'list-cell-admin-reports';
			}
			else
			{
				cell.className = 'list-cell-admin';
			}
		}
		else
		{
			cell.className = 'list-cell';
		}

		//This is a cell with user info! add user specific content and then skip everything after this if
		if(currentTab === "report_users" || currentTab === "banned_users" || currentTab === "search_users")
		{
			//console.log(listElement)
			let userInfo = listElement
			if(currentTab === "report_users")
			{
				userInfo = listElement.object_info
			}

			let moreLevelsButton = document.createElement("a");
			moreLevelsButton.className = "cell-button-more-levels";
			moreLevelsButton.innerHTML = "Levels";
			let newURL = new URL(window.location);
			newURL.searchParams.set("user_id", userInfo.user_id);
			moreLevelsButton.href = newURL.href;
			cell.appendChild(moreLevelsButton);

			if("user_name" in userInfo)
			{
				let userNameElement = document.createElement("b");
				userNameElement.className = "cell-title"
				userNameElement.innerHTML = userInfo.user_name
				cell.appendChild(userNameElement);

				if("is_creator" in userInfo)
				{
					let stamp = document.createElement("img");
					stamp.className = "verified-user-stamp";
					stamp.src = "../images/creator.png";
					userNameElement.appendChild(stamp);
				}
			}

			if("user_id" in userInfo)
			{
				let userNameElement = document.createElement("b");
				userNameElement.className = "cell-description"
				userNameElement.innerHTML = "<i>User ID: " + userInfo.user_id + "</i>"
				cell.appendChild(userNameElement);
			}

			if("user_level_count" in userInfo)
			{
				let levelCountElement = document.createElement("b");
				levelCountElement.className = "cell-description"
				levelCountElement.innerHTML = "User Level Count: " + userInfo.user_level_count
				cell.appendChild(levelCountElement);
			}

			if("moderation_strike_count" in userInfo)
			{
				let strikeCountElement = document.createElement("b");
				strikeCountElement.className = "cell-description"
				strikeCountElement.innerHTML = "Current Strike Count: " + userInfo.moderation_strike_count
				cell.appendChild(strikeCountElement);
			}

			if("user_id" in userInfo || "user_name" in userInfo || "user_level_count" in userInfo)
			{
				let linebreak = document.createElement("br");
				cell.appendChild(linebreak);
			}

			if("moderation_info" in userInfo)
			{
				//Show current (or previous) moderation info if it exists
				let moderationInfoText = document.createElement("div");
				moderationInfoText.innerHTML = "<b>Moderation Info:</b><br>"
				for(var key in userInfo.moderation_info)
				{
					if(key.startsWith("date_"))
					{
						let date = new Date(userInfo.moderation_info[key])
						moderationInfoText.innerHTML += key + ": " + date.toString() + "<br>"
					}
					else
					{
						moderationInfoText.innerHTML += key + ": " + userInfo.moderation_info[key] + "<br>"
					}
				}

				cell.appendChild(moderationInfoText);

				console.log(moderationInfoText)

				let linebreak = document.createElement("br");
				cell.appendChild(linebreak);
			}

			//This one only works for admins, but only admins can see the reports anyway, so doing it here is fine
			if(currentTab === "report_users" || currentTab === "search_users")
			{
				if(currentTab === "report_users")
				{
					//Show some stats about the reports
					let reportsInfoText = document.createElement("div");
					reportsInfoText.innerHTML = ""
					for(var key in listElement)
					{
						if(key.startsWith("reported_")) reportsInfoText.innerHTML += key + ": " + listElement[key] + "<br>"
					}

					cell.appendChild(reportsInfoText);

					linebreak = document.createElement("br");
					cell.appendChild(linebreak);
				}

				let banNowButton = document.createElement("button");
				cell.appendChild(banNowButton);
				banNowButton.innerHTML = "<b>BAN 7 DAYS</b>";
				banNowButton.onclick = function () {

					let reasonMapping = {
						hatespeech: "Inappropriate Language",
						behavior: "Inappropriate Behavior",
						noise: "Loud music / Screeching / other weird noises",
						imposter: "Pretending to be someone else",
						name: "Inappropriate user name",
						other: "Other"
					}

					let onOk = function(value) {
						(async () => {
							let response = await fetch(SERVER_URL + 'moderation_action/' + userInfo.user_id + '?access_token=' + accessToken + '&type=ban&duration=604800&reason=user_' + value);
							let responseBody = await response.text();
							confirm("Result: " + responseBody);
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								logout();
							}
							else if(responseBody === "Success")
							{
								await fetch(SERVER_URL + 'reports_reset/' + userInfo.user_id + '?access_token=' + accessToken); //Also reset the users reports if the punishment was successful
							}
						})()
					}

					showOptionsDialog("Ban User", "Why do you want to ban this user for 7 days?", reasonMapping, onOk)
				};

				linebreak = document.createElement("br");
				cell.appendChild(linebreak);

				let moderateButton = document.createElement("button");
				cell.appendChild(moderateButton);
				moderateButton.innerHTML = "<b>PUNISH</b>";
				moderateButton.onclick = function () {

					let onOk = function(value) {
						(async () => {
							let response = await fetch(SERVER_URL + 'moderation_action/' + userInfo.user_id + '?access_token=' + accessToken + '&reason=user_' + value + MODERATION_ACTION_EXTRA);
							let responseBody = await response.text();
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								confirm("Error: " + responseBody);
								logout();
							}
							else if(responseBody === "Success")
							{
								response = await fetch(SERVER_URL + 'reports_reset/' + userInfo.user_id + '?access_token=' + accessToken); //Also reset the users reports if the punishment was successful

								if(response.status != 200)
								{
									responseBody = await response.text();
									confirm("Error: " + responseBody);
								}
							}
						})()
					}

					if(currentTab !== "report_users")
					{
						let reasonMapping = {
							hatespeech: "Inappropriate language",
							behavior: "Inappropriate behavior",
							noise: "Loud or unpleasant noises",
							imposter: "Pretending to be someone else",
							name: "Inappropriate user name",
							other: "Other"
						}

						showOptionsDialog("Punish User", "For what reason do you want to warn or ban the user?", reasonMapping, onOk)
					}
					else
					{
						let bestReason = ""
						let bestReasonScore = 0
						for(var key in listElement)
						{
							if(key.startsWith("reported_score_"))
							{
								if(listElement[key] > bestReasonScore)
								{
									bestReasonScore = listElement[key]
									bestReason = key.slice(15)
								}
							}
						}

						onOk(bestReason)
					}
				};

				let resetButton = document.createElement("button");
				cell.appendChild(resetButton);
				resetButton.innerHTML = "<b>RESET</b>";
				resetButton.onclick = function () {
					if(confirm("Do you really want to reset this users reports?"))
					{
					  	(async () => {
							let response = await fetch(SERVER_URL + 'reports_reset/' + userInfo.user_id + '?access_token=' + accessToken);
							let responseBody = await response.text();
							confirm("Result: " + responseBody);
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								logout();
							}
						})();
					}
				};
			}

			if(currentTab === "banned_users")// || currentTab === "report_users")
			{
				linebreak = document.createElement("br");
				cell.appendChild(linebreak);

				let unbanButton = document.createElement("button");
				cell.appendChild(unbanButton);
				if(currentTab === "banned_users") unbanButton.innerHTML = "<b>REMOVE BAN</b>";
				else unbanButton.innerHTML = "<b>REMOVE CURRENT ACTION</b>";
				unbanButton.onclick = function () {
					if(confirm("Do you really want to remove the current action from this user?"))
					{
					  	(async () => {
							let response = await fetch(SERVER_URL + 'moderation_action_remove/' + userInfo.user_id + '?access_token=' + accessToken);
							let responseBody = await response.text();
							confirm("Result: " + responseBody);
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								logout();
							}
						})();
					}
				};

				let resetButton = document.createElement("button");
				cell.appendChild(resetButton);
				resetButton.innerHTML = "<b>RESET STRIKES</b>";
				resetButton.onclick = function () {
					if(confirm("Do you really want to reset this users strikes?"))
					{
						(async () => {
							let response = await fetch(SERVER_URL + 'moderation_strikes_reset/' + userInfo.user_id + '?access_token=' + accessToken);
							let responseBody = await response.text();
							confirm("Result: " + responseBody);
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								logout();
							}
						})();
					}
				};
			}

			continue
		}

		let levelInfo = listElement
		if(currentTab === "report_levels")
		{
			levelInfo = listElement.object_info
		}

		if(!("page_timestamp" in levelInfo))
		{
			//User lists currently don't have a page_timestamp, so just use the creation timestamp instead
			levelInfo["page_timestamp"] = levelInfo.creation_timestamp
		}

		let levelIdentifierParts = levelInfo.data_key.split(":");
		levelIdentifierParts = levelIdentifierParts.slice(1);

		nextPageTimestamp = levelInfo.page_timestamp;

		let creators = "";
		if(levelInfo.creators && levelInfo.creators.length > 0)
		{
			creators = '<i>by ' + levelInfo.creators.join(", ") + '</i>'
		}

		let difficulty = "unrated"
		if("statistics" in levelInfo)
		{
			if("difficulty" in levelInfo.statistics && "total_played" in levelInfo.statistics)
			{
				if(levelInfo.statistics.difficulty !== 1.0 && levelInfo.statistics.total_played > 0)
				{
					if(levelInfo.statistics.difficulty < 0.01) difficulty = "very hard"
					else if(levelInfo.statistics.difficulty < 0.1) difficulty = "hard"
					else if(levelInfo.statistics.difficulty < 0.4) difficulty = "medium"
					else difficulty = "easy"
				}
			}
		}
		cell.innerHTML = '<b class="cell-difficulty" style="color: rgb(255, 0, 0);">' + difficulty + '</b><br>'

		cell.innerHTML += '<b class="cell-title">' + levelInfo.title
		if(creators && creators.length > 0)
		{
			cell.innerHTML += '</b><br>' + creators
		}
		if(levelInfo.description && levelInfo.description.length > 0)
		{
			cell.innerHTML += '<br><br><div class=cell-description>' + levelInfo.description
		}
		if("statistics" in levelInfo)
		{
			if("total_played" in levelInfo.statistics && levelInfo.statistics.total_played > 0)
			{
				cell.innerHTML += '<br>Plays: ' + levelInfo.statistics.total_played
				if("liked" in levelInfo.statistics) cell.innerHTML += '<br>Liked: ' + Math.round(levelInfo.statistics.liked * 100) + '%'
			}
		}
		cell.innerHTML += '</div>';

		if((!levelsUserID || levelsUserID.length == 0) && currentTab !== "mylevels")
		{
			let moreLevelsButton = document.createElement("a");
			moreLevelsButton.className = "cell-button-more-levels";
			moreLevelsButton.innerHTML = "More Levels";
			let newURL = new URL(window.location);
			newURL.searchParams.set("user_id", levelIdentifierParts[0]);
			moreLevelsButton.href = newURL.href;
			cell.appendChild(moreLevelsButton);
		}

		//Show OK stamp on levels that have the tag
		if("tags" in levelInfo && levelInfo.tags.length > 0)
		{
			for(const tag of levelInfo.tags)
			{
				if(tag === "ok")
				{
					let stamp = document.createElement("img");
					stamp.className = "cell-stamp-ok";
					stamp.src = "../images/stamp_ok.png";
					cell.appendChild(stamp);
					break;
				}
			}
		}

		if(accessToken && userInfo)
		{
			if((currentTab !== "report_levels" || currentSearchTerm.length > 0) && currentTab !== "search_users")
			{
				//Report button
				let reportButton = document.createElement("button");
				cell.appendChild(reportButton);
				reportButton.className = "cell-button-report";
				reportButton.onclick = function () {
					let reasonMapping = {
						sexual: "Sexual Content / Genitals",
						violence: "Detailed Violence",
						hatespeech: "Offensive Language",
						loweffort: "Very low effort level",
						glitch: "Requires to use a Glitch to finish",
						other: "Other"
					}

					let onOk = function(value) {
						(async () => {
							let response = await fetch(SERVER_URL + 'report/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '/' + levelInfo.iteration + '?access_token=' + accessToken + '&reason=' + value);
							let responseBody = await response.text();
							console.log(responseBody);
							confirm(response.status == 200? "Success" : "Error: Need to login again?");
							if(response.status != 200 && accessToken && responseBody === "Invalid Access Token")
							{
								logout();
							}
						})()
					}

					showOptionsDialog("Report Level", "Why should this level be removed?", reasonMapping, onOk)
				};
			}
			else
			{
				//Only admins get any levels at the report_levels tab, so anything happening in this if is admins only

				if("handled" in listElement && listElement.handled === true)
				{
					cell.setAttribute('handled','handled') //reports that have already been handled are marked green and are ready to be removed completely.
				}

				let linebreak = document.createElement("br");
				cell.appendChild(linebreak);

				//Show some stats about the reports
				let reportsInfoText = document.createElement("div");
				reportsInfoText.innerHTML = ""
				for(var key in listElement)
				{
					if(key.startsWith("reported_")) reportsInfoText.innerHTML += key + ": " + listElement[key] + "<br>"
				}

				cell.appendChild(reportsInfoText);
			}

			if("is_admin" in userInfo && userInfo.is_admin === true)
			{
				//Report user button on level cells
				let reportButton = document.createElement("button");
				cell.appendChild(reportButton);
				reportButton.className = "cell-button-report-user";
				reportButton.onclick = function () {
					let reasonMapping = {
						hatespeech: "Inappropriate Language",
						behavior: "Inappropriate Behavior",
						noise: "Loud music / Screeching / other weird noises",
						imposter: "Pretending to be someone else",
						name: "Inappropriate user name",
						other: "Other"
					}

					let onOk = function(value) {
						(async () => {
							let response = await fetch(SERVER_URL + 'report/' + levelIdentifierParts[0] + '?access_token=' + accessToken + '&reason=' + value);
							let responseBody = await response.text();
							console.log(responseBody);
							confirm(response.status == 200? "Success" : "Error: Need to login again?");
							if(response.status != 200 && accessToken && responseBody === "Invalid Access Token")
							{
								logout();
							}
						})()
					}

					showOptionsDialog("Report User", "Why should this user be banned?", reasonMapping, onOk)
				};
			}

			let linebreak = document.createElement("br");
			cell.appendChild(linebreak);

			//Setup a button favorite the level (or remove from favorites if on favorites page)
			let favoriteButton = document.createElement("button");
			cell.appendChild(favoriteButton);
			if(currentTab !== "favorites") favoriteButton.innerHTML = "<b>ADD TO FAVORITES</b>";
			else favoriteButton.innerHTML = "<b>REMOVE FROM FAVORITES</b>";
			favoriteButton.onclick = function () {
			  	(async () => {
			  		if(currentTab !== "favorites")
			  		{
			  			let response = await fetch(SERVER_URL + 'add_favorite_level?access_token=' + accessToken + "&level_id=" + levelInfo.identifier);
						let responseBody = await response.text();
						console.log(responseBody);
						confirm(response.status == 200? "Success" : "Error: Already removed? Need to login again?");
						if(response.status != 200 && accessToken && responseBody === "Invalid Access Token")
						{
							logout();
						}
			  		}
			  		else if(currentTab === "favorites")
			  		{
			  			let response = await fetch(SERVER_URL + 'remove_favorite_level?access_token=' + accessToken + "&level_id=" + levelInfo.identifier);
						let responseBody = await response.text();
						console.log(responseBody);
						confirm(response.status == 200? "Success" : "Error: Already removed? Need to login again?");
						if(response.status != 200 && accessToken && responseBody === "Invalid Access Token")
						{
							logout();
						}
			  		}
				})();
			};

			if("is_moderator" in userInfo && userInfo.is_moderator === true)
			{
				let linebreak = document.createElement("br");
				cell.appendChild(linebreak);

				if(((currentTab !== "report_levels" && !("hidden" in levelInfo && levelInfo.hidden) && currentTab !== "hidden") || currentSearchTerm.length > 0) && currentTab !== "search_users")
				{
					linebreak = document.createElement("br");
					cell.appendChild(linebreak);

					let tagsForm = document.createElement("form");
					cell.appendChild(tagsForm);
					tagsForm.innerHTML = '<fieldset><legend>Tags:</legend><input type="checkbox" value="ok">ok <input type="submit" value="Submit" /></fieldset>';
					let tagsParentObject = tagsForm.childNodes[0];
					let tagOptions = []
					for(const option of tagsParentObject.childNodes)
					{
						if(option.type === "checkbox")
						{
							tagOptions.push(option);
							if("tags" in levelInfo && levelInfo.tags.length > 0)
							{
								for(const tag of levelInfo.tags)
								{
									if(tag === option.value)
									{
										option.checked = true;
									}
								}
							}
						}
					}

					tagsForm.onsubmit = function(event) {
						let tags = "";
						for(const option of tagOptions)
						{
							if(option.checked)
							{
								tags += option.value + ",";
							}
						}

						(async () => {
							let response = await fetch(SERVER_URL + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=' + tags + '&access_token=' + accessToken);
							let responseBody = await response.text();
							console.log(responseBody);
							confirm("Result: " + responseBody);
							if(response.status != 200 && accessToken && responseBody === "Not authorized!")
							{
								logout();
							}
						})();
						return false;
					};

					linebreak = document.createElement("br");
					cell.appendChild(linebreak);
				}

				if(("hidden" in levelInfo && levelInfo.hidden) || (currentTab === "hidden" && (!currentSearchTerm || currentSearchTerm.length === 0)))
				{
					let showButton = document.createElement("button");
					cell.appendChild(showButton);
					showButton.innerHTML = "<b>SHOW</b>";
					showButton.onclick = function () {
						if(confirm("Do you really want to show this level?"))
						{
						  	(async () => {
								let response = await fetch(SERVER_URL + 'show/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?access_token=' + accessToken);
								let responseBody = await response.text();
								console.log(responseBody);
								confirm("Result: " + responseBody);
								if(response.status != 200 && accessToken && responseBody === "Not authorized!")
								{
									logout();
								}
							})();
						}
					};

					if(currentTab !== "hidden")
					{
						cell.setAttribute('bad','bad')
					}
				}
				else
				{
					//Only admins get to see the hide level button
					if("is_admin" in userInfo && userInfo.is_admin === true)
					{
						let hideButton = document.createElement("button");
						cell.appendChild(hideButton);
						hideButton.innerHTML = "<b>HIDE</b>";
						//hideButton.className = "cell-button-hide";
						hideButton.onclick = function () {

							let reasonMapping = {
								sexual: "Sexual Content / Genitals",
								violence: "Detailed Violence",
								hatespeech: "Offensive Language",
								loweffort: "Very low effort level",
								glitch: "Requires to use a Glitch to finish",
								other: "Other"
							}

							if(userInfo.is_admin === true) reasonMapping["nopunish"] = "Don't punish"

							let onOk = function(value) {
								(async () => {
										let identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
										if(currentTab === "report_levels" && "iteration" in levelInfo) identifierPath += '/' + levelInfo.iteration //This is the iteration for the reports object this is called for! Not used anymore for new reports! TODO: Remove
										let response = await fetch(SERVER_URL + 'hide/' + identifierPath + '?access_token=' + accessToken);
										let responseBody = await response.text();
										console.log(responseBody);
										if(response.status != 200 && accessToken && responseBody === "Not authorized!")
										{
											confirm("Result: " + responseBody);
											logout();
										}
										else if(responseBody === "Success" && value !== "nopunish")
										{
											let extra = MODERATION_ACTION_EXTRA
											if(value === "glitch")
											{
												extra += "&reason=message&type=message&message=A+level+you+published+relies+on+a+glitch+that+is+not+working+anymore.+If+you+fix+the+level,+please+let+me+know+through+discord+or+tiktok+to+make+it+available+again."
											}
											else
											{
												extra += '&reason=level_' + value
											}
											let moderationResponse = await fetch(SERVER_URL + 'moderation_action/' + levelIdentifierParts[0] + '?access_token=' + accessToken + extra);
											let moderationResponseBody = await moderationResponse.text();
											console.log(moderationResponseBody);
											if(moderationResponse.status === 200 && moderationResponseBody === "Success")
											{
												response = await fetch(SERVER_URL + 'reports_reset/' + levelIdentifierParts[0] + '?access_token=' + accessToken); //Also reset the users reports if the punishment was successful
												responseBody = await response.text()
												confirm("Result: " + responseBody);
											}
											else
											{
												confirm("Result: " + moderationResponseBody);
											}
										}
									})();
							}

							showOptionsDialog("Hide Level", "Why should this level be hidden?", reasonMapping, onOk)
						};
					}

					//This one only work for admins, but only admins can see the reports anyway, so doing it here is fine
					if(currentTab === "report_levels")
					{
						let approveButton = document.createElement("button");
						cell.appendChild(approveButton);
						approveButton.innerHTML = "<b>APPROVE</b>";
						//hideButton.className = "cell-button-hide";
						approveButton.onclick = function () {
							if(confirm("Do you really want to approve this level and ignore future reports for this iteration?"))
							{
							  	(async () => {
							  		let url = SERVER_URL + 'ignore_reports/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
							  		if("iteration" in levelInfo) url += '/' + levelInfo.iteration //Needed to work with old reports TODO: Remove very soon
							  		url += '?access_token=' + accessToken

							  		let response = await fetch(url);
									let responseBody = await response.text();
									console.log(responseBody);
									confirm("Result: " + responseBody);
									if(response.status != 200 && accessToken && responseBody === "Not authorized!")
									{
										logout();
									}
								})();
							}
						};
					}
				}
			}

			if(("is_admin" in userInfo && userInfo.is_admin === true && !levelInfo["hidden"] && currentTab !== "hidden" && currentTab !== "report_levels") || currentSearchTerm.length > 0)
			{
				linebreak = document.createElement("br");
				cell.appendChild(linebreak);

				let creatorButton = document.createElement("button");
				cell.appendChild(creatorButton);
				creatorButton.innerHTML = "<b>MAKE CREATOR</b>";
				creatorButton.onclick = function () {
				  	(async () => {
						let response = await fetch(SERVER_URL + 'set_user_info_admin/' + levelIdentifierParts[0] + '?access_token=' + accessToken + '&is_creator=true');
						let responseBody = await response.text();
						console.log(responseBody);
						confirm("Result: " + responseBody);
						if(response.status != 200 && accessToken && responseBody === "Not authorized!")
						{
							logout();
						}
					})();
				};
			}
		}

		let button = document.createElement("a");
		cell.appendChild(button);
		button.innerHTML = "OPEN";
		button.className = "cell-button";
		button.href = 'viewer?level=' + levelInfo.identifier;
	}

	//Either reached end of list or is favorites tab that doesn't have pagination
	if(responseBody.length == 0 || currentTab === "favorites" || currentTab === "report_levels" || currentTab === "report_users" || currentTab === "banned_users" || currentTab === "search_users") //TODO: Support pagination for report listings on the server side and here
	{
		noMoreLevels = true;

		let linebreak = document.createElement("br");
		containerWrapper.appendChild(linebreak);

		let button = document.createElement("p");
		containerWrapper.appendChild(button);
		button.innerHTML = "Count: " + numberOfLevels;
		button.className = "level-counter";
	}

	isLoading = false;
}

function init()
{
	let authInfo = null;
	if(window.location.hash.length > 0)
	{
		let hash = window.location.hash.substring(1);
		let data = atob(hash);
		authInfo = JSON.parse(data);
	}

	let params = (new URL(document.location)).searchParams;
	levelsUserID = params.get('user_id');
	let currentTabName = levelsUserID? "user" : params.get('tab');
	let currentTimestamp = params.get('timestamp');
	if(currentTimestamp) nextPageTimestamp = currentTimestamp;

	if(history.replaceState)
	{
		let newURL = new URL(window.location);
		newURL.searchParams.delete("timestamp");
		newURL.hash = "";
		window.history.replaceState({path:newURL.href}, '', newURL.href);
		isAtTop = false;
	}

	(async () => {

		if(authInfo !== null && "org_scoped_id" in authInfo && "code" in authInfo)
		{
			console.log(authInfo);

			let response = await fetch(SERVER_URL + 'get_access_token?service_type=oculus_web_demo&service_user_token=' + authInfo.org_scoped_id + ':' + authInfo.code);

			if(response.status != 200)
			{
				let responseBody = await response.text();
				console.log(responseBody);
			}
			else
			{
				let responseBody = await response.json();

				var date = new Date(responseBody.expiry);
				document.cookie = 'access_token=' + responseBody.access_token + '; path=/; expires=' + date.toUTCString();
				document.cookie = "user_info=" + JSON.stringify(responseBody.info) + "; path=/; expires=" + date.toUTCString();
			}
		}

		let accessToken = getCookie("access_token");
		let userInfoString = getCookie("user_info")
		let userInfo = undefined
		if(userInfoString && userInfoString.length > 0) userInfo = JSON.parse(userInfoString);

		let tabBar = document.getElementById("tabbar");

		if(accessToken && userInfo)
		{
			if("is_admin" in userInfo && userInfo.is_admin === true)
			{
				console.log("You are an admin with super special powers! Current Access Token: " + accessToken);
			}

			if("is_moderator" in userInfo && userInfo.is_moderator === true)
			{
				console.log("You are a moderator with special powers!");
			}

			if("user_level_count" in userInfo && userInfo.user_level_count > 0)
			{
				let myLevelsButton = document.createElement("button");
				tabBar.appendChild(myLevelsButton);
				myLevelsButton.innerHTML = "My Levels";
				myLevelsButton.className = "tablinks";
				myLevelsButton.id = "tab_mylevels"
				myLevelsButton.addEventListener("click", function(event) { tabChanged('mylevels'); }, false);
			}

			let favoritesButton = document.createElement("button");
			tabBar.appendChild(favoritesButton);
			favoritesButton.innerHTML = "My Favorites";
			favoritesButton.className = "tablinks";
			favoritesButton.id = "tab_favorites"
			favoritesButton.addEventListener("click", function(event) { tabChanged('favorites'); }, false);

			let loginoutButton = document.getElementById("loginout-button");
			loginoutButton.className = "logout-button";
			loginoutButton.innerHTML = "Logout";
			loginoutButton.addEventListener("click", logout);

			const copyAccessTokenButton = document.getElementById("copy-token-button")
			copyAccessTokenButton.style.display = "block"
			copyAccessTokenButton.addEventListener("click", function(event) {
				navigator.clipboard.writeText(accessToken);
			});

			if("is_admin" in userInfo && userInfo.is_admin === true)
			{
				let hiddenButton = document.createElement("button");
				tabBar.appendChild(hiddenButton);
				hiddenButton.innerHTML = "Hidden Levels";
				hiddenButton.className = "tablinks";
				hiddenButton.id = "tab_hidden"
				hiddenButton.addEventListener("click", function(event) { tabChanged('hidden'); }, false);

				let reportLevelsButton = document.createElement("button");
				tabBar.appendChild(reportLevelsButton);
				reportLevelsButton.innerHTML = "Reported Levels";
				reportLevelsButton.className = "tablinks";
				reportLevelsButton.id = "tab_report_levels"
				reportLevelsButton.addEventListener("click", function(event) { tabChanged('report_levels'); }, false);

				let reportUsersButton = document.createElement("button");
				tabBar.appendChild(reportUsersButton);
				reportUsersButton.innerHTML = "Reported Users";
				reportUsersButton.className = "tablinks";
				reportUsersButton.id = "tab_report_users"
				reportUsersButton.addEventListener("click", function(event) { tabChanged('report_users'); }, false);

				let bannedUsersButton = document.createElement("button");
				tabBar.appendChild(bannedUsersButton);
				bannedUsersButton.innerHTML = "Banned Users";
				bannedUsersButton.className = "tablinks";
				bannedUsersButton.id = "tab_banned_users"
				bannedUsersButton.addEventListener("click", function(event) { tabChanged('banned_users'); }, false);

				//Should be public, but still pretty rough, so keeping it to admins for now
				let searchUsersButton = document.createElement("button");
				tabBar.appendChild(searchUsersButton);
				searchUsersButton.innerHTML = "Players";
				searchUsersButton.className = "tablinks";
				searchUsersButton.id = "tab_search_users"
				searchUsersButton.addEventListener("click", function(event) { tabChanged('search_users'); }, false);
			}
		}

		if(currentTabName && currentTabName.length > 0) tabChanged(currentTabName);
		loadMoreLevels();
	})();
}

function scroller() {
	// add more contents if user scrolled down enough
	var container = document.getElementById("list-container");
	if(document.body.scrollTop + document.documentElement.scrollTop + window.innerHeight + 100 > container.offsetHeight + container.offsetTop)
	{
		(async () => {
			loadMoreLevels();
		})();
	}
}

window.onload = init;
window.onscroll = scroller;


function tabChanged(tab)
{
	//user isn't a real tab, but still a valid value that is always available, so don't make it switch to newest in that case
	if(tab !== "user")
	{
		//Fallback to newest list if the requested tab doesn't exist
		let activeTabButton = document.getElementById("tab_" + tab)
		if(!activeTabButton) tab = "newest";
	}

	let titleString = "Levels"
	if(tab === "newest")
	{
		titleString = "All Levels";
	}
	if(tab === "verified")
	{
		titleString = "Verified Levels";
	}
	if(tab === "mylevels")
	{
		titleString = "My Levels";
	}
	if(tab === "favorites")
	{
		titleString = "My Favorites";
	}
	if(tab === "hidden")
	{
		titleString = "Hidden Levels";
	}
	if(tab === "report_levels")
	{
		titleString = "Reported Levels";
	}
	if(tab === "report_users")
	{
		titleString = "Reported Users";
	}
	if(tab === "banned_users")
	{
		titleString = "Banned Users";
	}
	if(tab === "search_users")
	{
		titleString = "User Search";
	}
	if(tab === "user")
	{
		titleString = "User";
	}
	else
	{
		levelsUserID = "";
	}

	if(tab != currentTab || !isAtTop)
	{
		if(history.pushState)
		{
			let newURL = new URL(window.location);
			newURL.searchParams.set("tab", tab);
			if(tab !== "user") newURL.searchParams.delete("user_id");
			window.history.pushState({path:newURL.href}, '', newURL.href);
		}

		// Get all elements with class="tablinks" and remove the class "active"
		tablinks = document.getElementsByClassName("tablinks");
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
		let activeTabButton = document.getElementById("tab_" + tab)
		if(activeTabButton) activeTabButton.className += " active";

		let title = document.getElementById("title-text");
		title.innerHTML = titleString;

		isAtTop = true;
		nextPageTimestamp = -1;
		noMoreLevels = false;
		numberOfLevels = 0;
		currentTab = tab;
		clearLevels();
		loadMoreLevels();
	}
}

function showOptionsDialog(title, subtitle, options, onOk)
{
	let dialog = document.getElementById('popup')
	let titleElement = document.getElementById('popup-title')
	let descriptionElement = document.getElementById('popup-description')
	let reasonSelector = document.getElementById('popup-reason')
	let closeButton = document.getElementById('popup-button-cancel')
	let okButton = document.getElementById('popup-button-ok')

	titleElement.innerHTML = title
	descriptionElement.innerHTML = subtitle

	reasonSelector.innerHTML = ""
	let selectOption = document.createElement("option")
	selectOption.innerHTML = "- Select -"
	reasonSelector.appendChild(selectOption)

	for(let key in options)
	{
		let option = document.createElement("option")
		option.innerHTML = options[key]
		option.value = key
		reasonSelector.appendChild(option)
	}
			
	if(!dialog.hasAttribute('open'))
	{
		// show the dialog 
		dialog.setAttribute('open','open');

		closeButton.onclick = function(event) { dialog.removeAttribute('open'); reasonSelector.selectedIndex = 0; }
		okButton.onclick = function(event) {
				if(reasonSelector.selectedIndex === 0) return //Don't allow to report without a reason!
				dialog.removeAttribute('open');
				onOk(reasonSelector.value)
				reasonSelector.selectedIndex = 0;
			}
	}
}

function search(event)
{
	currentSearchTerm = event.target.value
	if(!currentSearchTerm || currentSearchTerm.length == 0)
	{
		currentSearchTerm = ""
	}
	else
	{
		currentSearchTerm = currentSearchTerm.toLowerCase().replace(/[^a-z0-9]/g, '')
	}

	let title = document.getElementById("title-text");
	title.innerHTML = "Search";

	isAtTop = true;
	nextPageTimestamp = -1;
	noMoreLevels = false;
	numberOfLevels = 0;
	clearLevels();
	loadMoreLevels();
}

function login()
{
	window.location.href = 'https://auth.oculus.com/sso/?redirect_uri=' + PAGE_URL + '/levels&organization_id=1298096256894263'
}

function logout()
{
	//Set cookies to be expired
	document.cookie = 'access_token=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
	document.cookie = 'user_info=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

	window.location.href = window.location.href;
}
