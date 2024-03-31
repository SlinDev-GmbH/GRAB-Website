export async function makeCreatorRequest(server, userID, accessToken) {
  const response = await fetch(server + 'set_user_info_admin/' + userID + '?is_creator=true', {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text()
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }
  confirm("Result: " + responseBody);
  return true
}