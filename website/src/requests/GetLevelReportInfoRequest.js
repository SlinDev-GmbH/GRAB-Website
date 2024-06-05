export async function GetLevelReportInfoRequest(server, levelId, accessToken) {
    const response = await fetch(server + 'report_info/' + levelId.split(":").join("/"), {headers: {'Authorization': 'Bearer ' + accessToken}})
    const responseBody = await response.text();
    if(response.status != 200) {
        confirm("Error: " + responseBody);
        return false
    }
    return JSON.parse(responseBody)
}