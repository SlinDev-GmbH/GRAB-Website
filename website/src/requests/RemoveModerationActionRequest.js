export async function removeModerationActionRequest(server, accessToken, userID) {
	const response = await fetch(server + 'moderation_action_remove/' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}

	return true;
}
