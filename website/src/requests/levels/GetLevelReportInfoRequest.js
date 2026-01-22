import { SERVER_URL } from '../../configuration';
import { clean_level_id, request, safe_json } from '../RequestUtils';

export async function GetLevelReportInfoRequest(level_id) {
	level_id = clean_level_id(level_id, '/');
	const response = await request(`${SERVER_URL}report_info/${level_id}`, {}, true);
	return await safe_json(response);
}
