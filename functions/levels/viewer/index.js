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
			//const levelInfo = JSON.parse('{"identifier":"291d931uxfl4ub4dfmvjs:1637879683","title":"blubb","complexity":8,"format_version":3,"iteration":3,"creation_timestamp":1640003463900,"update_timestamp":1640004818729,"data_key":"level_data:291d931uxfl4ub4dfmvjs:1637879683:3","levellist_ok_timestamp":1640003463900,"hidden":false,"levellist_search_title":"blubb_1640003463900","levellist_hidden_timestamp":1643117337869,"tags":["ok"]}')

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

				assetText = assetText.replace("__PAGE_TITLE__", "GRAB: " + levelInfo.title)
				assetText = assetText.replace("__PAGE_DESCRIPTION__", metaDescription)

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
