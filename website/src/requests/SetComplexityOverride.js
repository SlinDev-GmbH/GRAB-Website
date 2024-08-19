export async function setComplexityOverride(server, accessToken, userID, complexity_override) {
  const requestURL = `${server}set_user_info_admin/${userID}?complexity_override=${complexity_override}`;

  const response = await fetch(requestURL, {headers: {'Authorization': 'Bearer ' + accessToken}});
  const responseBody = await response.text();

  if (response.status != 200 || responseBody !== 'Success') {
    confirm("Error: " + responseBody);
    return false;
  }

  return true;
}