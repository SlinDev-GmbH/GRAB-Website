export async function prefabBlockRequest(server, accessToken, userID, prefabID) {
	const response = await fetch(`${server}prefab_block/${userID}/${prefabID}`, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});

	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
