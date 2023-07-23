export async function resetReportsRequest(server, accessToken, userID) {
  const response = await fetch(server + 'reports_reset/' + userID, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success'){
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
