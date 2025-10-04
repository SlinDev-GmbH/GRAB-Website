export async function approveLevelRequest(server, accessToken, levelID) {
  const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
  const response = await fetch(server + 'ignore_reports/' + levelPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
