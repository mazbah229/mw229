import Widget from './widget'

const urlObj = new URL(window.location.href)

const urlString = urlObj.searchParams.get('clientDomain')
const urlParts = urlString?.split('-protocol-bit-assist-')
const protocol = urlParts?.[0] === 'i' ? 'http://' : 'https://'
const domain = urlParts?.[1]

const clientDomain = protocol + domain

window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  new Widget({ clientDomain })
})
