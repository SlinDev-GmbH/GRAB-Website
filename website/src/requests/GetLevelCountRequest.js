export async function getLevelCountRequest(server, type) {
	const response = await fetch(server + 'total_level_count?type=' + type);
	const responseBody = await response.text();
	if (response.status != 200) {
		confirm('Error: ' + responseBody);
		return false;
	}
	return responseBody;
}
