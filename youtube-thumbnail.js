const axios = require('axios')

exports.handler = async (req, resp, context) => {
    const path = req.path
    if (!/^\/[a-zA-Z0-9-_]+\.jpg$/.test(path)) {
      resp.setStatusCode(400)
      return resp.send('failed')
    }

    const id = path.match(/^\/([a-zA-Z0-9-_]+)\.jpg$/)[1]
    const maxResUrl = `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`
    const hqUrl = `https://i3.ytimg.com/vi/${id}/hqdefault.jpg`

    let url = maxResUrl
    try {
      await axios.head(url)
    } catch {
      url = hqUrl
    }
    
    try {
      const { data, headers } = await axios.get(url, { responseType: "arraybuffer" })
      resp.setStatusCode(200)
  
      for (const key in headers) {
        resp.setHeader(key, headers[key])
      }
      resp.send(Buffer.from(data))
    } catch(err) {
      console.error('Fetch thumbnail failed. Url:', url)
      console.error(err)
      resp.setStatusCode(404)
      resp.send('Fetch thumbnail failed.')
    }
}
