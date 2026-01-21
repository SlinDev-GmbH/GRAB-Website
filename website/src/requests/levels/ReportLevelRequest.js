import { SERVER_URL } from '../../configuration';
import { useUserStore } from '../../stores/user';
import { build_url, clean_level_id, safe_fetch } from '../RequestUtils';

export async function ReportLevelRequest(level_id, reason, image) {
	level_id = clean_level_id(level_id, '/');

	const url = build_url(`${SERVER_URL}report/${level_id}`, { reason });

	const response = await safe_fetch(url, {
		headers: {
			Authorization: `Bearer ${useUserStore().accessToken}`,
		},
		...(image && {
			body: image,
			method: 'POST',
		}),
	});

	if (!response.ok) {
		window.toast(`Error: ${await response.text()}`, 'error');
		return null;
	}

	return !!response;
}
