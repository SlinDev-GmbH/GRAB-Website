import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserPurchaseHistoryRequest(user_id) {
	const response = await request(`${SERVER_URL}get_user_info_admin`, { user_id }, true);
	const json = await safe_json(response);
	if (!json) return null;

	const len = json.purchase_history_length ?? 0;
	return Array.from({ length: len }, (_, i) => json[`purchase_history_${i}`]).filter(Boolean);
}
