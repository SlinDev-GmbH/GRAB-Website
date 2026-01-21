import { SERVER_URL } from '../../configuration';
import { clean_level_id, request } from '../RequestUtils';

export async function SetLevelTagsRequest(level_id, mod_tags, user_tags) {
	level_id = clean_level_id(level_id, '/');
	const params = {
		...(mod_tags && { mod_tags: mod_tags.join(',') }),
		...(user_tags && { user_tags: user_tags.join(',') }),
	};
	const response = await request(`${SERVER_URL}tag/${level_id}`, params, true);
	return !!response;
}
