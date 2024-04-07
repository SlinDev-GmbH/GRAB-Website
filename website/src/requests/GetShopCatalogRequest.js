export async function getShopCatalogRequest(server) {
    const response = await fetch(server + 'get_shop_catalog?version=2')
    const responseBody = await response.text();
    if(response.status != 200) {
        return false
    }
    return JSON.parse(responseBody)
}
