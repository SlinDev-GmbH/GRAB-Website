export async function getLevelStatisticsRequest(server, levelId) {
	const response = await fetch(server + 'statistics/' + levelId.split(':').join('/'));
	const responseBody = await response.text();
	if (response.status !== 200) {
		confirm('Error: ' + responseBody);
		return false;
	}
	return JSON.parse(responseBody);
}
