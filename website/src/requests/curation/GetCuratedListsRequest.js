import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetCuratedListsRequest() {
	const response = await request(`${SERVER_URL}get_curated_lists`, {}, false);
	return await safe_json(response);
}
