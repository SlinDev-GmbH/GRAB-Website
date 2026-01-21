import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsCreatorRequest(user_id, is_creator) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_creator }, true);
	return !!response;
}
