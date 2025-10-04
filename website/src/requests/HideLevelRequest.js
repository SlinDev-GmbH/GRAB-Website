export async function hideLevelRequest(server, accessToken, levelID) {
  const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
  const response = await fetch(server + 'hide/' + levelPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    if(responseBody === 'Scheduled for deletion!') return true
    if(responseBody === 'Previous moderation action is still active') return true
    return false
  }

  return true
}