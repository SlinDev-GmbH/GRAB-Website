export async function resetReportsRequest(server, accessToken, userID) {
	const response = await fetch(server + 'reports_reset/' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}

	return true;
}
