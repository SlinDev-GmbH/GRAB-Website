import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function DownloadLevelRequest(level_id) {
	level_id = level_id.replaceAll(':', '/');
	const response = await request(`${SERVER_URL}download/${level_id}`, {}, false);
	if (!response) return null;
	return await response.arrayBuffer();
}
