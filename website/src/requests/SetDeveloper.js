export async function setDeveloper(server, accessToken, userID, isDeveloper) {
	const requestURL = `${server}set_user_info_admin/${userID}?is_developer=${isDeveloper}`;

	const response = await fetch(requestURL, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();

	if (response.status != 200 || responseBody !== 'Success') {
		window.toast('Error: ' + responseBody, 'error');
		return false;
	}

	return true;
}
