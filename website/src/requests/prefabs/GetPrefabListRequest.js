import { SERVER_URL } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function GetPrefabListRequest(user_id, max_format_version, cursor, keys_only = false) {
	const params = { user_id, max_format_version, ...(cursor && { cursor }), ...(keys_only && { keys_only }) };
	const response = await request(`${SERVER_URL}prefab_list`, params, true);
	return await safe_json(response);
}
