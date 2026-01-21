import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function GetLevelCountRequest(type) {
	const response = await request(`${SERVER_URL}total_level_count`, { type }, false);
	if (!response) return null;
	return await response.text();
}
