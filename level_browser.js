init();

function init()
{
	(async () => {
		let response = await fetch('https://api.slin.dev/grab/v1/list?max_format_version=3');
		let responseBody = await response.json();

		for(let levelInfo of responseBody)
		{
			let btn = document.createElement("button");
			btn.innerHTML = '<b>' + levelInfo.title + '</b><br><i>by ' + levelInfo.creators.join(", ") + '</i><br><br>' + levelInfo.description;
			btn.onclick = function () {
				window.location.href = 'level.html?level=' + levelInfo.data_key;
			};
			btn.style = 'width: 50%; height: 150px; float: left;';

			var container = document.getElementById("list-container");
			container.appendChild(btn);
		}
	})();
}
