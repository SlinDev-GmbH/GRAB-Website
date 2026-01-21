import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function DownloadPrefabRequest(user_id, identifier) {
	const params = { identifier, user_id };
	const response = await request(`${SERVER_URL}prefab_download`, params, true);
	if (!response) return null;
	return await response.arrayBuffer();
}
