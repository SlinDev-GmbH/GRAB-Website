export async function RemoveFromCuratedListRequest(server, accessToken, levelID, type) {
	const response = await fetch(server + 'remove_from_curated_list?' + 'level_id=' + levelID + '&list_key=' + type, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
