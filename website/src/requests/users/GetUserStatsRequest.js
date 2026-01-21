import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserStatsRequest(user_id) {
	const response = await request(`${SERVER_URL}get_user_stats`, { user_id }, false);
	return await safe_json(response);
}
