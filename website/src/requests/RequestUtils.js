import { useUserStore } from '../stores/user';

export function build_url(base, params = {}) {
	const url = new URL(base);

	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.set(key, value);
	});

	return url.toString();
}

export async function safe_fetch(input, init) {
	try {
		const res = await fetch(input, init);
		if (!res.ok) return null;

		return res;
	} catch {
		return null;
	}
}

export async function safe_json(response) {
	if (!response) return null;

	try {
		return JSON.parse(await response.text());
	} catch {
		return null;
	}
}

export async function request(base_url, params = {}, auth = false, error_callback) {
	const url = build_url(base_url, params);

	const response = await safe_fetch(url, {
		...(auth && {
			headers: {
				Authorization: `Bearer ${useUserStore().accessToken}`,
			},
		}),
	});

	if (!response) return null;

	if (!response.ok) {
		const text = await response.text();
		window.toast(`Error: ${text}`, 'error');
		if (error_callback) error_callback(text);
		return null;
	}

	return response;
}

export function clean_level_id(level_id, ch = ':') {
	return level_id.split(/[:/]/).slice(0, 2).join(ch);
}
