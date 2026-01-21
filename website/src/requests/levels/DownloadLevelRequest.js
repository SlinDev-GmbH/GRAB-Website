import { SERVER_URL } from '../../configuration';
import { clean_level_id, request } from '../RequestUtils';

export async function DownloadLevelRequest(level_id) {
	level_id = clean_level_id(level_id, '/');
	const response = await request(`${SERVER_URL}download/${level_id}`, {}, false);
	if (!response) return null;
	return await response.arrayBuffer();
}
