import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function ResetReportsRequest(user_id) {
	const response = await request(`${SERVER_URL}reports_reset/${user_id}`, {}, true);
	return !!response;
}
