export async function getLevelLeaderboardRequest(server, levelId) {
	const response = await fetch(server + 'statistics_top_leaderboard/' + levelId.split(':').join('/'));
	const responseBody = await response.text();
	if (response.status !== 200) {
		confirm('Error: ' + responseBody);
		return false;
	}
	return JSON.parse(responseBody);
}
