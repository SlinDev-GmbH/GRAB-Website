export async function getUserPurchaseHistoryRequest(server, accessToken, userID) {
  const response = await fetch(server + 'get_user_info_admin?user_id=' + userID, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();

  if(response.status != 200) {
    confirm("Error: " + responseBody);
    return false
  }

  const data = JSON.parse(responseBody);
  const purchase_history = [];

  const purchase_history_length = data.purchase_history_length;
  for (let i = 0; i < purchase_history_length; i++) {
    purchase_history.push(data[`purchase_history_${i}`]);
  }

  return purchase_history;
}