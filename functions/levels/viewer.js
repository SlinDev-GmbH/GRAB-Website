export async function onRequest(context)
{
	const { method, url } = request
	const finalURL = new URL(url)

	let levelID = finalURL.searchParams.get("level")
	if(levelID)
	{
		let levelIDComponents = levelID.split(":")
		if(levelIDComponents.length >= 2)
		{
			const lookupString = 'level_info:' + levelIDComponents[0] + ':' + levelIDComponents[1]
			const levelInfo = await env.LEVEL_DB.get(lookupString)
			if(levelInfo)
			{
				return new Response(levelInfo, {
					status: 200
				})
			}
		}
	}

	return new Response('Not Found', { status: 404 })
}
