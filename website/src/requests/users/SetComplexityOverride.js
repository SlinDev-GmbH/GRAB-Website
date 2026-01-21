import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetComplexityOverride(user_id, complexity_override) {
	const response = await request(`${SERVER_URL}set_user_info_admin/${user_id}`, { complexity_override }, true);
	return !!response;
}
