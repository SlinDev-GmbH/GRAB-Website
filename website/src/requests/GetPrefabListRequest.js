export async function getPrefabListRequest(server, accessToken, userID, maxFormatVersion, cursor) {
	const response = await fetch(
		`${server}prefab_list?user_id=${userID}&max_format_version=${maxFormatVersion}${cursor ? `&cursor=${cursor}` : ''}`,
		{
			headers: { Authorization: 'Bearer ' + accessToken },
		},
	);
	const responseBody = await response.text();
	if (response.status != 200) {
		return false;
	}
	return JSON.parse(responseBody);
}
