import { MAX_FORMAT_VERSION, SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetPrefabListRequest(user_id, cursor, keys_only = false) {
	const max_format_version = MAX_FORMAT_VERSION;
	const params = { user_id, max_format_version, ...(cursor && { cursor }), ...(keys_only && { keys_only }) };
	const response = await request(`${SERVER_URL}prefab_list`, params, true);
	return await safe_json(response);
}
