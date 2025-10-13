export async function AddToCuratedListRequest(server, accessToken, levelID, type, key) {
	const response = await fetch(server + 'add_to_curated_list?' + 'level_id=' + levelID + '&list_key=' + type + '&level_key=' + key, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		window.toast('Error: ' + responseBody, 'error');
		return false;
	}

	return true;
}
