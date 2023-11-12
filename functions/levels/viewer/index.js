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
			const levelInfo = await context.env.LEVEL_DB.get(lookupString, { type: "json" })

			let levelStatsObjectID = context.env.LEVEL_STATISTICS.idFromName("level_stats:" + levelInfo.identifier)
			let statsObject = await context.env.LEVEL_STATISTICS.get(levelStatsObjectID);

			let statsInfoRequest = new Request("https://durableobject/get_info", {method: "GET"})
			let statsInfoResponse = await statsObject.fetch(statsInfoRequest)
			let statsInfoResponseJson = await statsInfoResponse.json()
			
			if(levelInfo)
			{
				const lookupFile = new URL(context.request.url)
				lookupFile.pathname = './levels/viewer/'
				const lookupReq = new Request(lookupFile.toString(), {
					cf: context.request.cf
				})

				const asset = await context.env.ASSETS.fetch(lookupReq)
				let assetText = await asset.text()

				let metaDescription = ''
				if(levelInfo.creators && levelInfo.creators.length > 0)
				{
					metaDescription = "By: " + levelInfo.creators.join(",") + "\n"
				}
				if(levelInfo.description) metaDescription += "Description: " + levelInfo.description + "\n\n"

				const creationDate = new Date(levelInfo.creation_timestamp);
				const updatedDate = new Date(levelInfo.update_timestamp);
				metaDescription += "Created: " + creationDate.toDateString() + "\n"
				if(creationDate.toDateString() !== updatedDate.toDateString()) metaDescription += "Last Updated: " + updatedDate.toDateString() + "\n"

				if(statsInfoResponseJson)
				{
					if("total_played_count" in statsInfoResponseJson && statsInfoResponseJson.total_played_count > 0)
					{
						metaDescription += "Plays: " + statsInfoResponseJson.total_played_count

						if("played_count" in statsInfoResponseJson && "finished_count" in statsInfoResponseJson && statsInfoResponseJson.played_count > 0)
						{
							const difficulty = statsInfoResponseJson.finished_count / statsInfoResponseJson.played_count
							if(metaDescription.length > 0) metaDescription += "\n"
							metaDescription += "Difficulty: "
							if(difficulty < 0.01)
							{
								metaDescription += "very hard"
							}
							else if(difficulty < 0.1)
							{
								metaDescription += "hard"
							}
							else if(difficulty < 0.4)
							{
								metaDescription += "medium"
							}
							else
							{
								metaDescription += "easy"
							}
						}
					}
				}

				let levelThumbUrl = ""
				let levelThumbWidth = "0"
				let levelThumbHeight = "0"
				if("images" in levelInfo && "thumb" in levelInfo.images && "key" in levelInfo.images.thumb)
				{
					levelThumbUrl = context.env.GRAB_IMAGES_SERVER_URL + levelInfo.images.thumb.key
					levelThumbWidth = "" + levelInfo.images.thumb.width
					levelThumbHeight = "" + levelInfo.images.thumb.height
				}

				assetText = assetText.replace("__PAGE_TITLE__", escapeHTML(levelInfo.title))
				assetText = assetText.replace("__PAGE_DESCRIPTION__", escapeHTML(metaDescription))
				assetText = assetText.replace("__PAGE_PREVIEW_IMAGE_URL__", escapeHTML(levelThumbUrl))
				assetText = assetText.replace("__PAGE_PREVIEW_IMAGE_WIDTH__", escapeHTML(levelThumbWidth))
				assetText = assetText.replace("__PAGE_PREVIEW_IMAGE_HEIGHT__", escapeHTML(levelThumbHeight))

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
