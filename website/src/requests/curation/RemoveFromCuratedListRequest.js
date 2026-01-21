import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function RemoveFromCuratedListRequest(level_id, list_key) {
	const params = { level_id, list_key };
	const response = await request(`${SERVER_URL}remove_from_curated_list`, params, true);
	return !!response;
}
