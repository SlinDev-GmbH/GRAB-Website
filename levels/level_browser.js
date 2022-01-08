//const SERVER_URL = "https://grab-api-dev.slindev.workers.dev/grab/v1/";
const SERVER_URL = "https://api.slin.dev/grab/v1/";
var isLoading = false;
var lastPageTimestamp = -1;
var noMoreLevels = false;
var numberOfLevels = 0;
var currentTab = 0;
var levelsUserID = ""

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
	isLoading = true;

	console.log("loading more levels");

	let accessToken = getCookie("access_token");
	let isAdmin = getCookie("is_admin");
	let isModerator = getCookie("is_moderator");

	if(currentTab === 0)
	{
		let totalLevelCountResponse = await fetch(SERVER_URL + 'total_level_count');
		let totalLevelCount = await totalLevelCountResponse.text();

		var title = document.getElementById("title-text");
		title.innerHTML = "Community Levels (" + totalLevelCount + " Levels)";
	}


	let requestURL = "";
	if(currentTab == 0)
	{
		requestURL = SERVER_URL + 'list?max_format_version=3';
		if(lastPageTimestamp != -1) requestURL += '&page_timestamp=' + lastPageTimestamp;
		if(levelsUserID && levelsUserID.length > 0)
		{
			//List only a specific users levels
			requestURL += '&user_id=' + levelsUserID;

			//Admins also get to see the hidden levels of that user
			if(isAdmin && accessToken)
			{
				requestURL += '&type=all&access_token=' + accessToken
				noMoreLevels = true //The endpoint for this currently does not support pagination
			}
		}
	}
	else if(currentTab == 1 && accessToken && accessToken.length > 0)
	{
		userID = accessToken.split(":")[0];
		requestURL = SERVER_URL + 'get_favorite_levels?access_token=' + accessToken;
	}
	else
	{
		return;
	}

	let response = await fetch(requestURL);
	if(response.status != 200)
	{
		let text = await response.text();
		console.log(text);
		return;
	}

	let responseBody = await response.json();

	var containerWrapper = document.getElementById("list-container-wrapper");
	var container = document.getElementById("list-container");

	numberOfLevels += responseBody.length;

	for(let levelInfo of responseBody)
	{
		let levelIdentifierParts = levelInfo.data_key.split(":");
		levelIdentifierParts = levelIdentifierParts.slice(1);

		lastPageTimestamp = levelInfo.creation_timestamp;

		let cell = document.createElement("div");
		container.appendChild(cell);
		if(isAdmin === "true" || isModerator === "true")
		{
			cell.className = 'list-cell-admin';
		}
		else
		{
			cell.className = 'list-cell';
		}
		let creators = "";
		if(levelInfo.creators && levelInfo.creators.length > 0)
		{
			creators = '<i>by ' + levelInfo.creators.join(", ") + '</i>'
		}
		cell.innerHTML = '<b class="cell-title">' + levelInfo.title + '</b><br>' + creators + '<br><br><div class=cell-description>' + levelInfo.description + '</div>';

		if(!levelsUserID || levelsUserID.length == 0)
		{
			let moreLevelsButton = document.createElement("button");
			moreLevelsButton.className = "cell-button-more-levels";
			moreLevelsButton.innerHTML = "More Levels";
			cell.appendChild(moreLevelsButton);
			moreLevelsButton.onclick = function () { window.open('index.html?user_id=' + levelIdentifierParts[0]) };
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

		if(accessToken)
		{
			userID = accessToken.split(":")[0];

			let favoriteButton = document.createElement("button");
			cell.appendChild(favoriteButton);
			if(currentTab == 0) favoriteButton.innerHTML = "<b>ADD TO FAVORITES</b>";
			else favoriteButton.innerHTML = "<b>REMOVE FROM FAVORITES</b>";
			favoriteButton.onclick = function () {
			  	(async () => {
			  		if(currentTab == 0)
			  		{
			  			let response = await fetch(SERVER_URL + 'add_favorite_level?access_token=' + accessToken + "&level_id=" + levelInfo.identifier);
						let responseBody = await response.text();
						console.log(responseBody);
			  		}
			  		else if(currentTab == 1)
			  		{
			  			let response = await fetch(SERVER_URL + 'remove_favorite_level?access_token=' + accessToken + "&level_id=" + levelInfo.identifier);
						let responseBody = await response.text();
						console.log(responseBody);
			  		}
				})();
			};
		}


		if(isModerator === "true")
		{
			let linebreak = document.createElement("br");
			cell.appendChild(linebreak);
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
				})();
				return false;
			};
		}

		if(isAdmin === "true")
		{
			linebreak = document.createElement("br");
			cell.appendChild(linebreak);

			let hideButton = document.createElement("button");
			cell.appendChild(hideButton);
			hideButton.innerHTML = "<b>HIDE</b>";
			//hideButton.className = "cell-button-hide";
			hideButton.onclick = function () {
				if(confirm("Do you really want to hide this level?"))
				{
				  	(async () => {
						let response = await fetch(SERVER_URL + 'hide/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?access_token=' + accessToken);
						let responseBody = await response.text();
						console.log(responseBody);
					})();
				}
			};

			linebreak = document.createElement("br");
			cell.appendChild(linebreak);

			let creatorButton = document.createElement("button");
			cell.appendChild(creatorButton);
			creatorButton.innerHTML = "<b>MAKE CREATOR</b>";
			//hideButton.className = "cell-button-hide";
			creatorButton.onclick = function () {
			  	(async () => {
					let response = await fetch(SERVER_URL + 'set_user_info_admin/' + levelIdentifierParts[0] + '?access_token=' + accessToken + '&is_creator=true');
					let responseBody = await response.text();
					console.log(responseBody);
				})();
			};
		}

		let button = document.createElement("a");
		cell.appendChild(button);
		button.innerHTML = "OPEN";
		button.className = "cell-button";
		button.href = 'level.html?level=' + levelIdentifierParts.join(":");
	}

	//Either reached end of list or is favorites tab that doesn't have pagination
	if(responseBody.length == 0 || currentTab == 1)
	{
		noMoreLevels = true;

		let linebreak = document.createElement("br");
		containerWrapper.appendChild(linebreak);

		let button = document.createElement("p");
		containerWrapper.appendChild(button);
		button.innerHTML = "Total number of levels: " + numberOfLevels;
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
				document.cookie = 'access_token=' + responseBody.access_token + '; expires=' + date.toUTCString();
				document.cookie = 'is_admin=' + responseBody.info.is_admin + '; expires=' + date.toUTCString();
				document.cookie = 'is_moderator=' + responseBody.info.is_moderator + '; expires=' + date.toUTCString();
			}
		}

		let accessToken = getCookie("access_token");
		let isAdmin = getCookie("is_admin");
		let isModerator = getCookie("is_moderator");

		if(isAdmin === "true")
		{
			console.log("You are an admin with super special powers! Current Access Token: " + accessToken);
		}

		if(isModerator === "true")
		{
			console.log("You are a moderator with special powers!");
		}

		if(accessToken)
		{
			let tabBar = document.getElementById("tabbar");

			let favoritesButton = document.createElement("button");
			tabBar.appendChild(favoritesButton);
			favoritesButton.innerHTML = "My Favorites";
			favoritesButton.className = "tablinks";
			favoritesButton.addEventListener("click", function(event) { tabChanged(event, 'favorites'); }, false);
		}

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

function tabChanged(event, tab)
{
	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	//document.getElementById(cityName).style.display = "block";
	event.currentTarget.className += " active";

	let newTab = 0;
	if(tab === "community")
	{
		var title = document.getElementById("title-text");
		title.innerHTML = "Community Levels";
		newTab = 0;
	}
	else if(tab === "favorites")
	{
		var title = document.getElementById("title-text");
		title.innerHTML = "My Favorites";
		newTab = 1;
	}

	if(newTab != currentTab)
	{
		lastPageTimestamp = -1;
		noMoreLevels = false;
		numberOfLevels = 0;
		currentTab = newTab;
		clearLevels();
		loadMoreLevels();
	}
}
