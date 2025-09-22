export async function setUserInfoAdminRequest(server, levelID, accessToken) {
	const response = await fetch(server + 'set_user_info_admin?level_id=' + levelID + '&access_token=' + accessToken);
	if (response.status != 200) {
		const responseBody = await response.text();
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
