export async function setActiveCustomizationsRequest(server, accessToken, active_customizations) {
    const response = await fetch(server + 'set_active_customizations?access_token=' + accessToken, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(active_customizations)
    })
    const responseBody = await response.text();
    if(response.status != 200 || responseBody !== 'Success'){
        confirm("Error: " + responseBody);
        return false
    }

    return true
}