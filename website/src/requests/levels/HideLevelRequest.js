import { SERVER_URL } from '../../configuration';
import { clean_level_id, request } from '../RequestUtils';

export async function HideLevelRequest(level_id) {
	level_id = clean_level_id(level_id, '/');

	let success = false;
	const response = await request(`${SERVER_URL}hide/${level_id}`, {}, true, (error) => {
		if (error === 'Scheduled for deletion!') success = true;
		if (error === 'Previous moderation action is still active') success = true;
	});

	return !!response || success;
}
