import { LOGGING_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function DeleteLogRequest(key) {
	const params = { key };
	const response = await request(`${LOGGING_URL}delete_object`, params, true, undefined, {
		method: 'DELETE',
	});
	return await safe_json(response);
}
