export async function getLevelStatisticsRequest(server, levelId) {
	const levelPath = levelId.split(/[:/]/).slice(0, 2).join('/');
	const response = await fetch(server + 'statistics/' + levelPath);
	const responseBody = await response.text();
	if (response.status !== 200) {
		confirm('Error: ' + responseBody);
		return false;
	}
	return JSON.parse(responseBody);
}
