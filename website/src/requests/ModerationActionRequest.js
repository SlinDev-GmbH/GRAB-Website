export async function moderationActionRequest(server, accessToken, userID, reason) {
  let extra = ''
  if(reason === "level_glitch") {
    extra += "?reason=message&type=message&message=A+level+you+published+relies+on+a+glitch+that+is+not+working+anymore.+If+you+fix+the+level,+please+let+me+know+through+discord+or+tiktok+to+make+it+available+again."
  }
  else {
    extra += '?reason=' + reason
  }
  const response = await fetch(server + 'moderation_action/' + userID + extra, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
