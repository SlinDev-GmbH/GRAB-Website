import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsDeveloperRequest(user_id, is_developer) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_developer }, true);
	return !!response;
}
