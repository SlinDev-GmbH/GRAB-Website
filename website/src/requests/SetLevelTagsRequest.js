export async function setLevelTagsRequest(server, accessToken, levelID, modTags, userTags) {
  const levelIdentifierParts = levelID.split(':')
  let queryParams = "?"
  if(modTags) queryParams += modTags.join(',')
  if(modTags && userTags) queryParams += "&"
  if(userTags) queryParams += modTags.join(',')
  const response = await fetch(server + 'tag/' + levelIdentifierParts[0] + '/' + levelIdentifierParts[1] + queryParams, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success'){
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
