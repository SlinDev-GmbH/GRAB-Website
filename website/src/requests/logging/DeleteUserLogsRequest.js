import { LOGGING_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function DeleteUserLogsRequest(user_id) {
	const response = await request(`${LOGGING_URL}delete_user_logs/${user_id}`, {}, true, undefined, {
		method: 'DELETE',
	});
	return await safe_json(response);
}
