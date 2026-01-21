import { SERVER_URL } from '../../configuration';
import { clean_level_id, request, safe_json } from '../RequestUtils';

export async function GetLevelDetailsRequest(level_id) {
	level_id = clean_level_id(level_id, '/');
	const response = await request(`${SERVER_URL}details/${level_id}`, {}, false);
	return await safe_json(response);
}
