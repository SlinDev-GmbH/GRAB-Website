export async function getShopItemsRequest(server) {
  const response = await fetch(server + 'get_shop_items?version=2')
  const responseBody = await response.text();
  if(response.status != 200) {
      return false
  }
  return JSON.parse(responseBody)
}
