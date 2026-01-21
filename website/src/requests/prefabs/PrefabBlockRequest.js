import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function PrefabBlockRequest(user_id, prefab_id) {
	const url = `${SERVER_URL}prefab_block/${user_id}/${prefab_id}`;
	const response = await request(url, {}, true);
	return !!response;
}
