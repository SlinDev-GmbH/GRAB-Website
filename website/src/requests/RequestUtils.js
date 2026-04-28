import { useUserStore } from '../stores/user';

export function build_url(base, params = {}) {
	const url = new URL(base);

	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.set(key, value);
	});

	return url.toString();
}

export async function safe_fetch(input, init, error_callback) {
	try {
		const res = await fetch(input, init);

		if (!res.ok) {
			const text = await res.text();
			window.toast(`Error: ${text}`, 'error');
			if (error_callback) error_callback(text);
			return null;
		}

		return res;
	} catch (e) {
		if (e instanceof Error) {
			window.toast(`Error: ${e.message}`, 'error');
			if (error_callback) error_callback(e.message);
		}
		return null;
	}
}

export async function safe_json(response) {
	if (!response) return null;

	try {
		return await response.json();
	} catch {
		return null;
	}
}

export async function request(base_url, params = {}, auth = false, error_callback, init) {
	const url = build_url(base_url, params);

	const response = await safe_fetch(
		url,
		{
			...(auth && {
				headers: {
					Authorization: `Bearer ${useUserStore().accessToken}`,
				},
			}),
			...(init ? init : {}),
		},
		error_callback,
	);

	return response;
}

export function clean_level_id(level_id, ch = ':') {
	return level_id.split(/[:/]/).slice(0, 2).join(ch);
}
