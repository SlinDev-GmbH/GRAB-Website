export async function removeLevelRecordRequest(server, accessToken, levelID, userID) {
	const levelIdentifierParts = levelID.split(':');
	const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1];
	const response = await fetch(server + 'statistics_remove_user/' + identifierPath + '?user_id=' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status !== 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
