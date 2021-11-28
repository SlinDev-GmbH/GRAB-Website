//const SERVER_URL = "https://grab-api-dev.slindev.workers.dev/grab/v1/";
const SERVER_URL = "https://api.slin.dev/grab/v1/";

init();

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

function init()
{
	let authInfo = null;
	if(window.location.hash.length > 0)
	{
		let hash = window.location.hash.substring(1);
		let data = atob(hash);
		authInfo = JSON.parse(data);
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
				document.cookie = 'access_token=' + responseBody.access_token + '; expires=' + date.toUTCString();
				document.cookie = 'is_admin=' + responseBody.info.is_admin + '; expires=' + date.toUTCString();
			}
		}

		let accessToken = getCookie("access_token");
		let isAdmin = getCookie("is_admin");

		if(isAdmin === "true")
		{
			console.log("You are an admin with special powers! Current Access Token: " + accessToken);
		}

		let response = await fetch(SERVER_URL + 'list?max_format_version=3');
		let responseBody = await response.json();

		var container = document.getElementById("list-container");

		for(let levelInfo of responseBody)
		{
			let levelIdentifierParts = levelInfo.data_key.split(":");
			levelIdentifierParts = levelIdentifierParts.slice(1);

			let cell = document.createElement("div");
			container.appendChild(cell);
			cell.className = 'list-cell';
			let creators = "";
			if(levelInfo.creators && levelInfo.creators.length > 0)
			{
				creators = '<i>by ' + levelInfo.creators.join(", ") + '</i>'
			}
			cell.innerHTML = '<b class="cell-title">' + levelInfo.title + '</b><br>' + creators + '<br><br>' + levelInfo.description;


			if(isAdmin === "true")
			{
				cell.className = 'list-cell-admin'
				cell.innerHTML += '<br><br>'

				let tagsForm = document.createElement("form");
				cell.appendChild(tagsForm);
				tagsForm.innerHTML = '<fieldset><legend>Tags:</legend><input type="checkbox" value="ok">ok <input type="checkbox" value="nobby">nobby <input type="submit" value="Submit" /></fieldset>';
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

				//console.log("ok");
				tagsForm.onsubmit = function(event) {
					console.log("blubb");
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

				let linebreak = document.createElement("br");
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
			}

			let button = document.createElement("button");
			cell.appendChild(button);
			button.innerHTML = "<b>OPEN</b>";
			button.className = "cell-button";
			button.onclick = function () {
				window.location.href = 'level.html?level=' + levelIdentifierParts.join(":");
			};
		}
	})();
}
