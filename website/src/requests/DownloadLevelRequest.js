export async function downloadLevelRequest(server, levelId) {
	const response = await fetch(server + 'download/' + levelId.split(':').join('/'));
	if (response.status !== 200) {
		const responseBody = await response.text();
		confirm('Error: ' + responseBody);
		return false;
	}
	return await response.arrayBuffer();
}
