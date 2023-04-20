export async function setLevelTagsRequest(server, accessToken, levelID, tags) {
  const levelIdentifierParts = levelID.split(':')
  const response = await fetch(server + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + '?tags=' + tags.join(','), {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200){
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
