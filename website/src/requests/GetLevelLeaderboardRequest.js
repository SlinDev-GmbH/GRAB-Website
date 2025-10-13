export async function getLevelLeaderboardRequest(server, levelId) {
	const levelPath = levelId.split(/[:/]/).slice(0, 2).join('/');
	const response = await fetch(server + 'statistics_top_leaderboard/' + levelPath);
	const responseBody = await response.text();
	if (response.status !== 200) {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}
	return JSON.parse(responseBody);
}
