export async function GetCuratedListsRequest(server) {
	const response = await fetch(server + 'get_curated_lists/');
	const responseBody = await response.text();
	if (response.status != 200) {
		confirm('Error: ' + responseBody);
		return false;
	}
	return JSON.parse(responseBody);
}
