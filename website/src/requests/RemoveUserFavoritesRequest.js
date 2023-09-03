export async function removeUserFavorites(server, levelID, accessToken) {
  const response = await fetch(server + 'remove_favorite_level?level_id=' + levelID + '&access_token=' + accessToken)
  const responseBody = await response.text()
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
