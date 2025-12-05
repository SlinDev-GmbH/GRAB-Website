export async function prefabDeleteRequest(server, accessToken, userID, prefabID) {
	const response = await fetch(`${server}prefab_delete?identifier=${prefabID}&user_id=${userID}`, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});

	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		window.toast('Error: ' + responseBody, 'error');
		return false;
	}

	return true;
}
