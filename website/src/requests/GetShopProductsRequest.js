export async function getShopProductsRequest(server) {
    const response = await fetch(server + 'get_shop_products?version=3')
    const responseBody = await response.text();
    if(response.status != 200) {
        return false
    }
    return JSON.parse(responseBody)
}
