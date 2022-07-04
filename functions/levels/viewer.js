export async function onRequest(context)
{
	const { method, url } = context.request
	const finalURL = new URL(url)

	let levelID = finalURL.searchParams.get("level")
	if(levelID)
	{
		let levelIDComponents = levelID.split(":")
		if(levelIDComponents.length >= 2)
		{
			const lookupString = 'level_info:' + levelIDComponents[0] + ':' + levelIDComponents[1]
			console.log(context.env.LEVEL_DB)
			console.log(lookupString)
			const levelInfo = await context.env.LEVEL_DB.get(lookupString)
			console.log(levelInfo)
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
