export async function removeModerationActionRequest(server, accessToken, userID) {
	const response = await fetch(server + 'moderation_action_remove/' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
