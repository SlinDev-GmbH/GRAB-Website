export async function getUserCurrencyRequest(server, accessToken) {
  const response = await fetch(server + 'get_user_currency_info?access_token=' + accessToken)
  const responseBody = await response.text();
  if(response.status != 200) {
    return false
  }
  return JSON.parse(responseBody)
}