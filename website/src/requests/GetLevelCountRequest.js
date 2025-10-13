export async function getLevelCountRequest(server, type) {
	const response = await fetch(server + 'total_level_count?type=' + type);
	const responseBody = await response.text();
	if (response.status != 200) {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}
	return responseBody;
}
