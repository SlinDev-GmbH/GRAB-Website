export async function approveLevelRequest(server, accessToken, levelID) {
  const levelIdentifierParts = levelID.split(':')
  const identifierPath = levelIdentifierParts[0] + '/' + levelIdentifierParts[1]
  const response = await fetch(server + 'ignore_reports/' + identifierPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
