import { SERVER_URL } from '../../configuration';
import { clean_level_id, request } from '../RequestUtils';

export async function RemoveUserFavoritesRequest(level_id) {
	level_id = clean_level_id(level_id);
	const response = await request(`${SERVER_URL}remove_favorite_level`, { level_id }, true);
	return !!response;
}
