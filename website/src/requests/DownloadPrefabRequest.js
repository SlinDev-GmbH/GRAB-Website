export async function downloadPrefabRequest(server, accessToken, userID, prefabID) {
	const response = await fetch(`${server}prefab_download?identifier=${prefabID}&user_id=${userID}`, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});

	if (response.status !== 200) {
		const responseBody = await response.text();
		window.toast('Error: ' + responseBody, 'error');
		return false;
	}

	return await response.arrayBuffer();
}
