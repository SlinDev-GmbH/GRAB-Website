export async function getLevelReplayRequest(server, replayKey) {
	const response = await fetch(server + replayKey);
	if (response.status !== 200) {
		const responseBody = await response.text();
		confirm('Error: ' + responseBody);
		return false;
	}
	return await response.arrayBuffer();
}
