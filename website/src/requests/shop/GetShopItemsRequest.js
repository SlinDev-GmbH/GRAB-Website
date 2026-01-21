import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetShopItemsRequest() {
	const response = await request(`${SERVER_URL}get_shop_items`, { version: 3 }, false);
	return await safe_json(response);
}
