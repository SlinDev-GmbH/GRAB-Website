import { LOGGING_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetUserLogsRequest(user_id, cursor, limit) {
	const params = {
		...(cursor && { cursor }),
		...(limit && { limit }),
	};
	const response = await request(`${LOGGING_URL}user/${user_id}`, params, true);
	return await safe_json(response);
}
