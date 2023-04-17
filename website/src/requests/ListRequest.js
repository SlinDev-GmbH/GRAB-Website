export async function listRequest(server, accessToken, listType, searchTerm, maxLevelFormatVersion, userID, nextPage) {
  let requestURL = server + 'list?max_format_version=' + maxLevelFormatVersion
  if(listType === 'tab_newest')
  {
    if(searchTerm && searchTerm.length > 0) requestURL += '&type=search&search_term=' + searchTerm
  }
  else if(listType === 'tab_verified')
  {
    requestURL += '&type=ok'
  }
  else if(listType === 'tab_my_levels' || listType === 'tab_other_user')
  {
    requestURL += '&user_id=' + userID
  }
  else if(listType === 'tab_favorite_levels')
  {
    requestURL = server + 'get_favorite_levels'
  }
  else if(listType === 'tab_search_users')
  {
    requestURL += '&type=user_name&search_term=' + searchTerm
  }
  else if(listType === 'tab_hidden')
  {
    requestURL += '&type=hidden'
  }
  else if(listType === 'tab_reported_levels')
  {
    requestURL = server + 'report_list?type=level&max_format_version=' + maxLevelFormatVersion;
  }
  else if(listType === 'tab_reported_users')
  {
    requestURL = server + 'report_list?type=user';
  }
  else if(listType === 'tab_banned_users')
  {
    requestURL = server + 'report_list?type=banned_user';
  }

  if(nextPage) requestURL += '&page_timestamp=' + nextPage

  let headers = {}
  if(accessToken) headers['Authorization'] = 'Bearer ' + accessToken
  const response = await fetch(requestURL, { headers: headers })
  if(response.status != 200) {
    return false
  }

  return await response.json()
}
