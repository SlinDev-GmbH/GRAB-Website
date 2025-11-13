export async function getBestTimeReplayRequest(server, levelID, userID) {
	const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
	const response = await fetch(server + 'best_time_replay/' + levelPath + '?user_id=' + userID);
	if (response.status !== 200) {
		const responseBody = await response.text();
		window.toast('Error: ' + responseBody, 'error');
		return false;
	}
	return await response.json();
}
