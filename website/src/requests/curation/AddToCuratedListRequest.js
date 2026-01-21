import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function AddToCuratedListRequest(level_id, list_key, level_key) {
	const params = { level_id, list_key, level_key };
	const response = await request(`${SERVER_URL}add_to_curated_list`, params, true);
	return !!response;
}
