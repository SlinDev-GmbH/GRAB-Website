import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function RemoveCuratedListRequest(name) {
	const response = await request(`${SERVER_URL}remove_curated_list`, { name }, true);
	return await safe_json(response);
}
