export async function giftCosmeticRequest(server, accessToken, userID, cosmeticID) {
  const response = await fetch(server + 'add_purchase_admin?user_id=' + userID + '&version=3&sku=' + cosmeticID, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}