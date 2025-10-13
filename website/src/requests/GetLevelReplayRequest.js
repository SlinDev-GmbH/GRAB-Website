export async function getLevelReplayRequest(server, replayKey) {
	const response = await fetch(server + replayKey);
	if (response.status !== 200) {
		const responseBody = await response.text();
		window.toast('Error: ' + responseBody, "error");
		return false;
	}
	return await response.arrayBuffer();
}
