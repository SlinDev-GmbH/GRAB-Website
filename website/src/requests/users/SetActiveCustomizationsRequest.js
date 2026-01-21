import { SERVER_URL } from '../../configuration';
import { useUserStore } from '../../stores/user';
import { safe_fetch } from '../RequestUtils';

export async function SetActiveCustomizationsRequest(active_customizations) {
	const response = await safe_fetch(`${SERVER_URL}set_active_customizations`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${useUserStore().accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(active_customizations),
	});

	if (!response.ok) {
		window.toast(`Error: ${await response.text()}`, 'error');
		return null;
	}

	return !!response;
}
