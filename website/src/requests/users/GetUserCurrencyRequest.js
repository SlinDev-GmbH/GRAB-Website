import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserCurrencyRequest() {
	const response = await request(`${SERVER_URL}get_user_currency_info`, {}, true);
	return await safe_json(response);
}
