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
			console.log(lookupString)
			console.log(context.env.LEVEL_DB)
			//const levelList = await context.env.LEVEL_DB.list()
			//console.log(levelList)

			const levelInfo = await context.env.LEVEL_DB.get(lookupString)
			if(levelInfo)
			{
				return new Response(levelInfo, {
					status: 200
				})
			}

			return new Response(lookupString, {
					status: 404
				})
		}
	}

	return new Response('Not Found', { status: 404 })
}
