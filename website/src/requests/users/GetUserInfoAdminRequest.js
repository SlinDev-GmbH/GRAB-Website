import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserInfoAdminRequest(user_id) {
	const response = await request(`${SERVER_URL}get_user_info_admin`, { user_id }, true);
	return await safe_json(response);
}
