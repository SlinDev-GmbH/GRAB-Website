export async function GetLevelBrowserRequest(server) {
  const response = await fetch(server + 'get_level_browser?version=1')
  const responseBody = await response.text();
  if(response.status != 200) {
    return false
  }
  return JSON.parse(responseBody)
}
