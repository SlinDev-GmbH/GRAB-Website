export async function resetReportsRequest(server, accessToken, userID) {
  const response = await fetch(server + 'reports_reset/' + userID, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 && accessToken && responseBody === "Not authorized!")
  {
    confirm("Result: " + responseBody);
    //TODO: Log out user
    //logout();
    return false
  }

  return true
}
