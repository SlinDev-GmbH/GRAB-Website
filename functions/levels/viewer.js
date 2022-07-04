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
			const levelInfo = await context.env.LEVEL_DB.get(lookupString, { type: "json" })
			
			const lookupFile = new URL(context.request.url)
			lookupFile.pathname = './levels/viewer/'
			const lookupReq = new Request(lookupFile.toString(), {
				cf: context.request.cf
			})

			const asset = await context.env.ASSETS.fetch(lookupReq)// context.next("viewer/index.html")
			console.log(asset)
			let assetText = await asset.text()

			let metaDescription = levelInfo.description
			if(levelInfo.creators && levelInfo.creators.length > 0)
			{
				metaDescription += ' - by ' + levelInfo.creators.join(",");
			}
			if(!metaDescription)
			{
				metaDescription = ""
			}

			assetText = assetText.replace("__PAGE_TITLE__", "GRAB: " + levelInfo.title)
			assetText = assetText.replace("__PAGE_DESCRIPTION__", metaDescription)

			if(levelInfo)
			{
				return new Response(assetText, {
					status: 200,
					headers: asset.headers
				})
			}
		}
	}

	return new Response('Not Found', { status: 404 })
}
