export async function getUserModerationHistoryRequest(server, accessToken, userID) {
  const response = await fetch(server + 'get_user_info_admin?user_id=' + userID, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();

  if(response.status != 200) {
    confirm("Error: " + responseBody);
    return false
  }

  const data = JSON.parse(responseBody);

  const moderation_history = [];

  const moderation_history_length = data.moderation_history_length;
  for (let i = 0; i < moderation_history_length; i++) {
    moderation_history.push(data[`moderation_history_${i}`]);
  }

  return moderation_history;
}