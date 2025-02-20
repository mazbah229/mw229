import { createElm, globalAppend, globalInnerHTML } from '../utils/Helpers.js'

export const wechat = {
  renderWeChat(widgetChannel) {
    const widgetThis = this
    widgetThis.hideChannels()
    widgetThis.renderCard()
    widgetThis.setCardStyle(widgetChannel.config)
    const { url } = widgetChannel.config

    const weChatBody = createElm('div', {
      id: 'weChatBody',
      style: 'min-height: calc(var(--card-width) - 30px)',
    })

    const weChatQRCode = createElm('img', {
      id: 'weChatQRCode',
      alt: 'WeChat QR Code',
      src: url,
      style: 'width: 100%',
    })

    globalAppend(weChatBody, weChatQRCode)
    globalInnerHTML(widgetThis.cardBody, '')
    globalAppend(widgetThis.cardBody, weChatBody)
  },
}
