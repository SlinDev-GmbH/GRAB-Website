export async function getUserInfoRequest(server, user_id) {
	const urlParams = new URLSearchParams(window.location.search);
	const userID = user_id || urlParams.get('user_id');
	const response = await fetch(server + 'get_user_info?user_id=' + userID);
	const responseBody = await response.text();
	if (response.status != 200) {
		window.toast('Error: ' + responseBody, "error");
		return false;
	}
	return JSON.parse(responseBody);
}
