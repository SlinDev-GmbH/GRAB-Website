import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsModerator(user_id, is_moderator) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_moderator }, true);
	return !!response;
}
