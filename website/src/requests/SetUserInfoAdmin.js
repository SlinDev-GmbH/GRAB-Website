export async function setUserInfoAdmin(server, accessToken, userID, isVerifier) {

  let requestURL = server + 'set_user_info_admin/' + userID
  if(isVerifier === true) requestURL += "?is_verifier=true"
  else requestURL += "?is_verifier=false"

  const response = await fetch(requestURL, {headers: {'Authorization': 'Bearer ' + accessToken}})
  const responseBody = await response.text();
  if(response.status != 200 || responseBody !== 'Success'){
    confirm("Error: " + responseBody);
    return false
  }

  return true
}
