init();

function init()
{
	(async () => {
		let response = await fetch('https://api.slin.dev/grab/v1/list?max_format_version=3');
		//console.log(response);
		let responseBody = await response.json();
		//console.log(responseBody);
		//console.log(`decoded = ${JSON.stringify(decoded)}`);

		for(let levelInfo of responseBody)
		{
			let btn = document.createElement("button");
			btn.innerHTML = levelInfo.title;
			btn.onclick = function () {
				window.location.href = 'level.html?level=' + levelInfo.data_key;
			};
			document.body.appendChild(btn);
		}
	})();
}
