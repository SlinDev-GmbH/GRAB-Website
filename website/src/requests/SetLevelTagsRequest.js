export async function setLevelTagsRequest(server, accessToken, levelID, modTags, userTags) {
  const levelPath = levelID.split(/[:/]/).slice(0, 2).join('/');
  let queryParams = "?"
  if(modTags) queryParams += "mod_tags=" + modTags.join(',')
  if(modTags && userTags) queryParams += "&"
  if(userTags) queryParams += "tags=" + userTags.join(',')
  const response = await fetch(server + 'tag/' + levelPath + queryParams, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success'){
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
