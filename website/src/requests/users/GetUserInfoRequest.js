import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserInfoRequest(user_id) {
	const response = await request(`${SERVER_URL}get_user_info`, { user_id }, false);
	return await safe_json(response);
}
