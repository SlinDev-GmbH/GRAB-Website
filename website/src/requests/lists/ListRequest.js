import { SERVER_URL, MAX_FORMAT_VERSION } from '../../configuration';
import { request, safe_json } from '../RequestUtils';

export async function ListRequest(type, difficulty, tag, search_term, user_id, page_timestamp) {
	const max_format_version = MAX_FORMAT_VERSION;

	let params = { max_format_version };
	let endpoint = 'list';

	// search types
	if (type === 'tab_newest') {
		if (search_term && search_term.length > 0) {
			params.type = 'search';
			params.search_term = search_term;
		} else {
			params.type = (tag ? tag + '_' : '') + 'newest' + (difficulty ? '_' + difficulty : '');
		}
	} else if (type === 'tab_ok_newest') {
		params.type = 'ok_' + (tag ? tag + '_' : '') + 'newest' + (difficulty ? '_' + difficulty : '');
	} else if (type === 'tab_my_levels' || type === 'tab_other_user') {
		params.user_id = user_id;
	} else if (type === 'tab_search_users') {
		params.type = 'user_name';
		params.search_term = search_term;
	}

	// simple types
	else if (type === 'tab_hidden') {
		params.type = 'hidden';
	} else if (type === 'tab_deletion_queue') {
		params.type = 'deletionqueue';
	} else if (type === 'accelerating') {
		params.type = 'accelerating';
	} else if (type === 'popular_recent') {
		params.type = 'popular_recent';
	} else if (type === 'user_played') {
		params.type = 'user_played';
	}

	// curation
	else if (type.includes('curated_')) {
		params.type = type;
	}

	// non 'list' endpoints
	else if (type === 'tab_top_users') {
		endpoint = 'get_top_users';
		params = { limit: 500 };
	} else if (type === 'tab_favorite_levels') {
		endpoint = 'get_favorite_levels';
	} else if (type === 'tab_verify_queue') {
		endpoint = 'report_list';
		params = { type: 'verify', max_format_version };
	} else if (type === 'tab_reported_levels') {
		endpoint = 'report_list';
		params = { type: 'level', max_format_version };
	} else if (type === 'tab_reported_users') {
		endpoint = 'report_list';
		params = { type: 'user' };
	} else if (type === 'tab_banned_users') {
		endpoint = 'report_list';
		params = { type: 'banned_user' };
	} else if (type === 'tab_audit') {
		endpoint = 'report_list';
		params = { type: 'audit' };
	}

	// fallback to allowing new types
	else if (type) {
		params.type = type;
	}

	const requires_auth = [
		'tab_favorite_levels',
		'tab_verify_queue',
		'tab_hidden',
		'tab_reported_levels',
		'tab_reported_users',
		'tab_banned_users',
		'tab_deletion_queue',
		'tab_audit',
		'user_played',
	].includes(type);

	if (page_timestamp) params.page_timestamp = page_timestamp;

	const response = await request(`${SERVER_URL}${endpoint}`, params, requires_auth);
	return await safe_json(response);
}
