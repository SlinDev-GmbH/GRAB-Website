import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function GiftCosmeticRequest(user_id, sku) {
	const response = await request(`${SERVER_URL}add_purchase_admin`, { user_id, version: 3, sku }, true);
	return !!response;
}
