export async function setUserFavorites(server, levelID, accessToken) {
	const response = await fetch(server + 'add_favorite_level?level_id=' + levelID + '&access_token=' + accessToken);
	if (response.status != 200) {
		const responseBody = await response.text();
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
