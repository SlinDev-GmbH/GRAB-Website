export async function GetLevelReportInfoRequest(server, levelId, accessToken) {
    const levelPath = levelId.split(/[:/]/).slice(0, 2).join('/');
    const response = await fetch(server + 'report_info/' + levelPath, {headers: {'Authorization': 'Bearer ' + accessToken}})
    const responseBody = await response.text();
    if(response.status != 200) {
        confirm("Error: " + responseBody);
        return false
    }
    return JSON.parse(responseBody)
}