import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsVerifierRequest(user_id, is_verifier) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_verifier }, true);
	return !!response;
}
