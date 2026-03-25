import { SERVER_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function SetIsAttestationExemptRequest(user_id, is_attestation_exempt) {
	const url = `${SERVER_URL}set_user_info_admin/${user_id}`;
	const response = await request(url, { is_attestation_exempt }, true);
	return !!response;
}
