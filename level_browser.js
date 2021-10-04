init();

function init()
{
	(async () => {
		let response = await fetch('https://api.slin.dev/grab/v1/list?max_format_version=3');
		let responseBody = await response.json();

		var container = document.getElementById("list-container");

		for(let levelInfo of responseBody)
		{
			let levelIdentifierParts = levelInfo.data_key.split(":");
			levelIdentifierParts = levelIdentifierParts.slice(1);

			let cell = document.createElement("div");
			container.appendChild(cell);
			cell.className = 'list-cell';
			cell.innerHTML = '<b class="cell-title">' + levelInfo.title + '</b><br><i>by ' + levelInfo.creators.join(", ") + '</i><br><br>' + levelInfo.description;
			
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
