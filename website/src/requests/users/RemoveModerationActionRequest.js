import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function RemoveModerationActionRequest(user_id) {
	const response = await request(`${SERVER_URL}moderation_action_remove/${user_id}`, {}, true);
	return !!response;
}
