import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetLevelBrowserRequest() {
	const response = await request(`${SERVER_URL}get_level_browser`, { version: 1 }, false);
	return await safe_json(response);
}
