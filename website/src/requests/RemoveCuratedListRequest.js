export async function RemoveCuratedListRequest(server, accessToken, name) {
	const response = await fetch(server + 'remove_curated_list?' + 'name=' + name, {
		headers: { Authorization: 'Bearer ' + accessToken },
	});
	const responseBody = await response.text();
	if (response.status != 200) {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}
	return JSON.parse(responseBody);
}
