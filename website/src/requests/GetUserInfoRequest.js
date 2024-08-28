export async function getUserInfoRequest(server) {
  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get('user_id');
  const response = await fetch(server + 'get_user_info?user_id=' + userID)
  const responseBody = await response.text();
  if(response.status != 200) {
    confirm("Error: " + responseBody);
    return false
  }
  return JSON.parse(responseBody)
}
