import { DATA_URL } from '../../configuration';
import { request } from '../RequestUtils';

export async function GetBestTimeReplayRequest(replay_key) {
	const response = await request(`${DATA_URL}${replay_key}`, {}, false);
	if (!response) return null;
	return await response.arrayBuffer();
}
