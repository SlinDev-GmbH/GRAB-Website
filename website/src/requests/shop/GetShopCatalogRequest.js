import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetShopCatalogRequest() {
	const response = await request(`${SERVER_URL}get_shop_catalog`, { version: 2 }, false);
	return await safe_json(response);
}
