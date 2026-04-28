import { LOGGING_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function SearchLogsRequest(cursor, query = {}) {
	const params = {
		...(cursor && { cursor }),
		...query,
	};
	const response = await request(`${LOGGING_URL}search`, params, true);
	return await safe_json(response);
}
