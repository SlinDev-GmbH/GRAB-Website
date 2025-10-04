export async function getUserInfoAdminRequest(server, accessToken, userID) {
	const response = await fetch(server + 'get_user_info_admin?user_id=' + userID, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();

	if (response.status != 200) {
		confirm('Error: ' + responseBody);
		return false;
	}

	return JSON.parse(responseBody);
}
