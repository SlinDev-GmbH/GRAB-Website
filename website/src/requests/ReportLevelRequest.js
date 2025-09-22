export async function reportLevelRequest(server, accessToken, levelID, reason, image = undefined) {
	const levelIdentifierParts = levelID.split(':');
	const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1];
	const response = await fetch(server + 'report/' + identifierPath + '?reason=' + reason, {
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
