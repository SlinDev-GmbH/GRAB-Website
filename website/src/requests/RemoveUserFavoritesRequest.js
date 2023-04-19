export async function removeUserFavorites(server, levelID, accessToken) {
  const response = await fetch(server + 'remove_favorite_level?level_id=' + levelID + '&access_token=' + accessToken)
  if (response.status != 200) {
    return false
  } else return true
}
