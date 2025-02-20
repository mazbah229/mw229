import { $, createElm, globalAppend, globalInnerHTML, globalSetProperty } from '../utils/Helpers.js'

export const custom_iframe = {
  renderIframe(url, channelName, iframe = false, iframeOptions = false) {
    this.hideChannels()
    this.iFrameWrapper = createElm('div', { id: 'iframe-wrapper', class: channelName.toLowerCase() })

    if (iframe) {
      globalInnerHTML(this.iFrameWrapper, iframe)
    }
    else {
      const iframeElm = createElm('iframe', {
        scrolling: iframeOptions?.scrollbar === true ? 'yes' : 'no',
        src: url,
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: '',
      })
      globalAppend(this.iFrameWrapper, iframeElm)
    }

    if (iframeOptions) {
      const { aspect_ratio, width, height } = iframeOptions

      if (aspect_ratio === 'custom') {
        globalSetProperty(this.root.style, '--iframe-height', `${width}px`)
        globalSetProperty(this.root.style, '--iframe-height', `${height}px`)
      }

      globalSetProperty(this.root.style, '--iframe-aspect-ratio', aspect_ratio)
    }

    globalAppend($('#contentWrapper'), this.iFrameWrapper)
    this.resetClientWidgetSize()
  },

  removeIframe() {
    this.iFrameWrapper.remove()
    this.iFrameWrapper = undefined
    this.resetClientWidgetSize()
  },
}
