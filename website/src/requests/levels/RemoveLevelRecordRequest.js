import { SERVER_URL } from '../../configuration';
import { clean_level_id, request } from '../RequestUtils';

export async function RemoveLevelRecordRequest(level_id, user_id) {
	level_id = clean_level_id(level_id, '/');
	const response = await request(`${SERVER_URL}statistics_remove_user/${level_id}`, { user_id }, true);
	return !!response;
}
