const apiEndPoint = window?.bit_assist_?.api?.base
const iframeHost = window?.bit_assist_?.isDev !== '1' ? `${apiEndPoint}/iframe` : 'http://localhost:5000'
const iframeDomain = new URL(iframeHost).origin
const separator = window?.bit_assist_?.api?.separator || '?'

const protocol = window.location.protocol === 'http:' ? 'i' : 's'
const domain = window.location.hostname === 'localhost' ? window.location.host : window.location.hostname
const url = window.location.href
const winWidth = document.documentElement.offsetWidth
const winHeight = window.innerHeight
let defaultHeight = '100px'
let defaultWidth = '100px'
let currentScrollPercent = 0

const css = `
#bit-assist-widget-container{--ba-top:auto;--ba-left:auto;--ba-bottom:10;--ba-right:10;position:fixed;z-index:2147483646;bottom:0;right:0;width:${defaultWidth};height:${defaultHeight};max-width:100%}
#bit-assist-widget-container.bottom-right{left:var(--ba-left);right:var(--ba-right);top:var(--ba-top);bottom:var(--ba-bottom)}
#bit-assist-widget-container.bottom-left{left:var(--ba-left);right:var(--ba-right);top:var(--ba-top);bottom:var(--ba-bottom)}
#bit-assist-widget-container.top-right{left:var(--ba-left);right:var(--ba-right);top:var(--ba-top);bottom:var(--ba-bottom)}
#bit-assist-widget-container.top-left{left:var(--ba-left);right:var(--ba-right);top:var(--ba-top);bottom:var(--ba-bottom)}
#bit-assist-widget-iframe{width:100%;height:100%;border:none;}
.bit-assist-hide{visibility:hidden;pointer-events:none}
`

const styleElement = document.createElement('style')
styleElement.appendChild(document.createTextNode(css))

const widgetContainer = document.createElement('div')
widgetContainer.id = 'bit-assist-widget-container'
hideWidget()

const iframeElement = document.createElement('iframe')
iframeElement.title = 'wp-bit-assist'
iframeElement.src = `${iframeHost}${separator}clientDomain=${protocol}-protocol-bit-assist-${domain}`
iframeElement.id = 'bit-assist-widget-iframe'
iframeElement.setAttribute('allowfullscreen', '')
iframeElement.setAttribute('scrolling', 'no')
widgetContainer.appendChild(iframeElement)

document.body.append(styleElement, widgetContainer)

// Pass scroll percent to iframe
function windowScrollPercentage(e, pageScroll = false) {
  const scrollTop = window.scrollY
  const docHeight = document.body.offsetHeight
  const winHeight = window.innerHeight
  const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100)
  if (!pageScroll) {
    return scrollPercent
  }

  if (!currentScrollPercent && scrollPercent >= pageScroll) {
    currentScrollPercent = 1
    sendScrollPercent(scrollPercent)
  }
  else if (currentScrollPercent && scrollPercent < pageScroll) {
    currentScrollPercent = 0
    sendScrollPercent(scrollPercent)
  }
}

function sendScrollPercent(scrollPercent) {
  iframeElement.contentWindow.postMessage({ action: 'scrollPercent', scrollPercent }, iframeDomain)
}

document.addEventListener('click', (e) => {
  if (widgetContainer.classList.contains('bit-assist-open') && !e.target.closest('#bit-assist-widget-container')) {
    iframeElement.contentWindow.postMessage({ action: 'clickOutside' }, iframeDomain)
  }
})

// Listen for messages from iframe
window.addEventListener('message', (e) => {
  if (e.origin !== iframeDomain) {
    return
  }

  const { action } = e.data

  if (action === 'getClientInfo') {
    const scrollPercent = windowScrollPercentage()
    iframeElement.contentWindow.postMessage(
      { action: 'windowLoaded', url, winWidth, winHeight, scrollPercent, apiEndPoint },
      iframeDomain,
    )
  }
  else if (action === 'widgetLoaded') {
    const { height, width, position, top, bottom, left, right, pageScroll } = e.data

    widgetPosition(position, top, bottom, left, right)
    widgetContainer.classList.remove('bit-assist-hide')
    widgetContainer.classList.add(position)
    resetWidgetSize(width, height)
    if (pageScroll > 0) {
      window.addEventListener('scroll', e => windowScrollPercentage(e, pageScroll))
    }
  }
  else if (action === 'widgetOpen') {
    if (isLoadedTawkTo() && Boolean(window.Tawk_API?.isChatMaximized?.()) === true) {
      window.Tawk_API?.minimize()
    }
    const { isWidgetOpen } = e.data
    widgetContainer.classList.toggle('bit-assist-open', isWidgetOpen)
  }
  else if (action === 'removeWidget') {
    widgetContainer.remove()
    styleElement.remove()
  }
  else if (action === 'resetWidgetSize') {
    const { height, width } = e.data
    resetWidgetSize(width, height)
  }
  else if (action === 'chatWidgetClick') {
    const { chatWidgetName } = e.data
    openChatWidget(chatWidgetName)
  }
  else if (action === 'bitAssistChannelClick') {
    const { channelInfo } = e.data
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'bitAssistChannel', ...channelInfo })
  }
})

function widgetPosition(position, top, bottom, left, right) {
  if (position.includes('top')) {
    widgetContainer.style.setProperty('--ba-top', `${top}px`)
  }
  if (position.includes('bottom')) {
    widgetContainer.style.setProperty('--ba-bottom', `${bottom}px`)
  }
  if (position.includes('left')) {
    widgetContainer.style.setProperty('--ba-left', `${left}px`)
  }
  if (position.includes('right')) {
    widgetContainer.style.setProperty('--ba-right', `${right}px`)
  }
}

function resetWidgetSize(width, height) {
  defaultWidth = `${width}px`
  defaultHeight = `${height}px`
  Object.assign(widgetContainer.style, {
    width: defaultWidth,
    height: defaultHeight,
  })
}

function openChatWidget(chatWidgetName) {
  hideAllChatBots()
  if (chatWidgetName === 'tawk') {
    openTawkTo()
  }
  if (chatWidgetName === 'crisp') {
    openCrispChat()
  }
  if (chatWidgetName === 'intercom') {
    openIntercom()
  }
  if (chatWidgetName === 'tidio') {
    openTidio()
  }
}

window.addEventListener('load', () => {
  if (isLoadedTawkTo()) {
    handleTawkTo()
  }
  if (isLoadedCrisp()) {
    handleCrisp()
  }
  if (isLoadedIntercom()) {
    handleIntercom()
  }
  if (isLoadedTidio()) {
    handleTidio()
  }
})

let isTawkClickable = false
let isTidioClickable = false
let isCrispClickable = false
let isIntercomClickable = false

// Tawk Channel Starts
function handleTawkTo() {
  window.Tawk_API.onLoad = function () {
    isTawkClickable = true
    window.Tawk_API.hideWidget()
  }
  window.Tawk_API.onChatMinimized = function () {
    window.Tawk_API.hideWidget()
    showWidget()
  }
}

function openTawkTo() {
  if (!isTawkClickable) {
    alertMessage('Tawk')
    return null
  }

  try {
    window.Tawk_API.showWidget()
    window.Tawk_API.toggle()
    hideWidget()
  }
  catch (e) {
    console.log(e)
    alertMessage('Tawk')
    showWidget()
  }
}

function isLoadedTawkTo() {
  return typeof Tawk_API !== 'undefined'
}
// Tawk Channel Ends

// Crisp Channel Starts
function handleCrisp() {
  isCrispClickable = true
  window.$crisp.push(['do', 'chat:hide'])

  window.$crisp.push([
    'on',
    'chat:closed',
    function () {
      window.$crisp.push(['do', 'chat:hide'])
      showWidget()
    },
  ])
}

function openCrispChat() {
  if (!isCrispClickable) {
    alertMessage('Crisp')
    return null
  }

  try {
    window.$crisp.push(['do', 'chat:show'])
    window.$crisp.push(['do', 'chat:toggle'])
    hideWidget()
  }
  catch {
    alertMessage('Crisp')
    showWidget()
  }
}

function isLoadedCrisp() {
  return typeof $crisp !== 'undefined'
}
// Crisp Chanel Ends

// Intercom Channel Starts

function handleIntercom() {
  isIntercomClickable = true

  window.Intercom('update', {
    hide_default_launcher: true,
  })

  window.Intercom('onShow', () => {
    hideWidget()
  })

  window.Intercom('onHide', () => {
    showWidget()
  })
}

function openIntercom() {
  if (!isIntercomClickable) {
    alertMessage('Intercom')
    return null
  }

  try {
    window.Intercom('show')
    hideWidget()
  }
  catch (e) {
    console.log(e)
    alertMessage('Intercom')
    showWidget()
  }
}

function isLoadedIntercom() {
  return typeof Intercom !== 'undefined'
}
// Intercom Channel Ends

// Tidio Channel Starts
function handleTidio() {
  window.tidioChatApi.hide()

  window.tidioChatApi.on('ready', () => {
    isTidioClickable = true
    window.tidioChatApi.hide()
  })

  window.tidioChatApi.on('close', () => {
    showWidget()
    window.tidioChatApi.hide()
  })
}

function openTidio() {
  if (!isTidioClickable) {
    alertMessage('Tidio')
    return null
  }

  try {
    window.tidioChatApi.open()
    window.tidioChatApi.show()
    hideWidget()
  }
  catch (e) {
    console.log(e)
    alertMessage('Tawk')
    showWidget()
  }
}

function isLoadedTidio() {
  return typeof tidioChatApi !== 'undefined'
}
// Tidio Channel Ends

// ============= Common Functions ============== //
function showWidget() {
  widgetContainer.classList.remove('bit-assist-hide')
  hideAllChatBots()
}

function hideAllChatBots() {
  if (isLoadedTawkTo()) {
    window.Tawk_API?.minimize?.()
  }
  if (isLoadedCrisp()) {
    window.$crisp?.push?.(['do', 'chat:hide'])
  }
  if (isLoadedIntercom()) {
    window.Intercom?.('hide')
  }
  if (isLoadedTidio()) {
    window.tidioChatApi?.hide?.()
  }
}

function hideWidget() {
  widgetContainer.classList.add('bit-assist-hide')
}

function alertMessage(channel) {
  // eslint-disable-next-line no-alert
  return alert(`Sorry, ${channel} is not loaded yet!`)
}
