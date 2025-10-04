export async function reportLevelRequest(server, accessToken, levelID, reason, image = undefined) {
	const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
	const response = await fetch(server + 'report/' + levelPath + '?reason=' + reason, {
		headers: { Authorization: 'Bearer ' + accessToken },
		...(image && {
			body: image,
			method: 'POST',
		}),
	});
	const responseBody = await response.text();
	if (response.status != 200 || responseBody !== 'Success') {
		confirm('Error: ' + responseBody);
		return false;
	}

	return true;
}
