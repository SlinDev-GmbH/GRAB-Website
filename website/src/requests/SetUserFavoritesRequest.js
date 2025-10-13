export async function setUserFavorites(server, levelID, accessToken) {
	levelID = levelID.split(/[:/]/).slice(0, 2).join(':');
	const response = await fetch(server + 'add_favorite_level?level_id=' + levelID + '&access_token=' + accessToken);
	if (response.status != 200) {
		const responseBody = await response.text();
		window.toast('Error: ' + responseBody, "error");
		return false;
	}

	return true;
}
