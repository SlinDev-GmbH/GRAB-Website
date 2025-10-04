export async function removeLevelRecordRequest(server, accessToken, levelID, userID) {
    const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
	const response = await fetch(server + 'statistics_remove_user/' + levelPath + '?user_id=' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status !== 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
