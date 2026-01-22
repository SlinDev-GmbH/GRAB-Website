import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function ModerationActionRequest(user_id, reason, duration, message) {
	const params = {
		...(message ? { message, reason: 'message' } : { reason }),
		...(duration && { duration, type: 'ban' }),
	};

	const response = await request(`${SERVER_URL}moderation_action/${user_id}`, params, true);
	return !!response;
}
