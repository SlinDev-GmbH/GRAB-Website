import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsSuperModeratorRequest(user_id, is_supermoderator) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_supermoderator }, true);
	return !!response;
}
