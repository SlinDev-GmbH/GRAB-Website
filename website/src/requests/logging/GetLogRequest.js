import { LOGGING_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function GetLogRequest(key) {
	const params = { key };
	const response = await request(`${LOGGING_URL}object`, params, true);
	return await response.text();
}
