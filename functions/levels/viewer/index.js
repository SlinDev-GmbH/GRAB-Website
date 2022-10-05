function escapeHTML(unsafe)
{
	return unsafe.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, c => '&#' + ('000' + c.charCodeAt(0)).slice(-4) + ';')
}

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
			//const levelInfo = await context.env.LEVEL_DB.get(lookupString, { type: "json" })
			const { levelInfo, levelMetadata } = await context.env.LEVEL_DB.getWithMetadata(lookupString, { type: "json" });
			
			if(levelInfo)
			{
				const lookupFile = new URL(context.request.url)
				lookupFile.pathname = './levels/viewer/'
				const lookupReq = new Request(lookupFile.toString(), {
					cf: context.request.cf
				})

				const asset = await context.env.ASSETS.fetch(lookupReq)
				console.log(asset)
				let assetText = await asset.text()

				let metaDescription = levelInfo.description
				if(levelInfo.creators && levelInfo.creators.length > 0)
				{
					if(metaDescription && metaDescription.length > 0)
						metaDescription += ' - by ' + levelInfo.creators.join(",")
					else
						metaDescription = 'by ' + levelInfo.creators.join(",")
				}
				if(!metaDescription)
				{
					metaDescription = ""
				}

				if(levelMetadata && levelMetadata.statistics)
				{
					if(metaDescription.length > 0) metaDescription += "\n"
					metaDescription += levelMetadata.statistics
				}


				assetText = assetText.replace("__PAGE_TITLE__", "GRAB: " + escapeHTML(levelInfo.title))
				assetText = assetText.replace("__PAGE_DESCRIPTION__", escapeHTML(metaDescription))

				let response = new Response(assetText, {
					status: 200,
					headers: asset.headers
				})

				return response
			}
		}
	}

	return new Response('Not Found', { status: 404 })
}
