export async function moderationActionRequest(server, accessToken, userID, reason, duration=undefined, message=undefined) {
  let extra = ''
  if(reason === "level_glitch") {
    extra += "?reason=message&type=message&message=A+level+you+published+relies+on+a+glitch+that+is+not+working+anymore.+If+you+fix+the+level,+please+let+me+know+through+discord+or+tiktok+to+make+it+available+again."
  }
  else if (message !== undefined && message !== "") {
    extra += '?reason=message&type=message&message=' + message
  }
  else {
    extra += '?reason=' + reason
  }
  if (duration && duration > 0) {
    extra += '&duration=' + duration
  }
  const response = await fetch(server + 'moderation_action/' + userID + extra, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
