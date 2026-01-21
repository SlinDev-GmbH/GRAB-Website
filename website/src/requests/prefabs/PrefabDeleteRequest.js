import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function PrefabDeleteRequest(user_id, identifier) {
	const response = await request(`${SERVER_URL}prefab_delete`, { identifier, user_id }, true);
	return !!response;
}
