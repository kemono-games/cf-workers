addEventListener('fetch', event => {
  event.respondWith(fetchAndStream(event.request, event));
});

async function fetchAndStream(request, ctx) {
  const accept = request.headers.get("accept");
  let image = {};

  if (/image\/avif/.test(accept)) {
    // image.format = "avif";
  } else if (/image\/webp/.test(accept)) {
    image.format = "webp";
  }

  const baseUrl = OSS_ENDPOINT
  const url = new URL(request.url)
  const pathname = url.pathname.replace('/preview.jpg', '')
  const ossUrl = `${baseUrl}/${pathname}?x-oss-process=video/snapshot,t_5000,f_jpg,h_720`

  const cache = await caches.open(`preview_cache:${image.format ?? 'jpg'}`)
  const cachedImg = await cache.match(ossUrl)
  if (cachedImg) {
    return cachedImg
  }

  const fetchUrl = image.format ? `https://${IMAGE_RESIZE_DOMAIN}/cdn-cgi/image/format=${image.format}/${ossUrl}` : ossUrl
  const response = await fetch(fetchUrl, {cf:{image}});

  ctx.waitUntil(cache.put(ossUrl, response.clone()))

  const { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}
