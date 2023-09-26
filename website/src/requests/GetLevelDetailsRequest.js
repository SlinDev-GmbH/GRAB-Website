export async function GetLevelDetailsRequest(server, levelId) {
    const response = await fetch(server + 'details/' + levelId.split(":").join("/"))
    const responseBody = await response.text();
    if(response.status != 200) {
        confirm("Error: " + responseBody);
        return false
      }
      return JSON.parse(responseBody)
  }