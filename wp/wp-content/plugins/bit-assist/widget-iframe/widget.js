import { common } from './channels/common.js'
import { custom_form } from './channels/custom_form.js'
import { custom_iframe } from './channels/custom_iframe.js'
import { faq } from './channels/faq.js'
import { knowledge_base } from './channels/knowledge_base.js'
import { wechat } from './channels/wechat.js'
import { woocommerce } from './channels/woocommerce.js'
import { wp_search } from './channels/wp_search.js'
import closeIcon from './images/close-icon.svg'
import {
  $,
  createElm,
  globalAppend,
  globalClassListAdd,
  globalClassListContains,
  globalClassListRemove,
  globalClassListToggle,
  globalEventListener,
  globalInnerHTML,
  globalInnerText,
  globalPostMessage,
  globalQuerySelectorAll,
  globalSetProperty,
} from './utils/Helpers.js'
import './css/style.scss'

export default class Widget {
  apiEndPoint
  root
  widgetData
  clientDomain
  widgetBubble
  widgetBubbleWrapper
  contentWrapper
  widgetWrapper
  channels
  #isMobileDevice
  #clientPageUrl
  #scrollPercent
  callToAction
  closeCallToAction
  #isOfficeHours
  card
  selectedFormBg
  cardBody
  formBody
  #delayExist
  iFrameWrapper
  animationName
  formData
  clickTrack

  constructor(config) {
    this.clickTrack = {
      isWidgetClicked: false,
    }
    this.#delayExist = true
    this.#isOfficeHours = true
    this.#isMobileDevice = false
    this.root = document.documentElement
    this.clientDomain = config.clientDomain
    this.contentWrapper = $('#contentWrapper')
    this.widgetWrapper = $('#widgetWrapper')
    this.widgetBubbleWrapper = $('#widgetBubbleWrapper')
    this.widgetBubble = $('#widgetBubble')
    this.addEvents()
    this.getClientInfo()
  }

  delay = n => new Promise(resolve => setTimeout(resolve, n * 1000))

  // ====================
  // Events
  // ====================
  addEvents = () => {
    globalEventListener(window, 'message', this.onMessageReceived)
    globalEventListener(this.widgetBubble, 'click', this.onBubbleClick)
  }

  closeWidget = () => {
    this.hideCard()
    this.hideChannels()
    if (typeof this.iFrameWrapper !== 'undefined') {
      this.removeIframe()
    }
    globalClassListRemove(this.widgetBubble, 'open')
    globalClassListAdd(this.contentWrapper, 'hide')
    this.widgetOpenActions(false)
    globalSetProperty(this.root.style, '--card-width', '330px')
    this.showActiveBadge()
    this.enableAnimation()
  }

  widgetClickRequest = async () => {
    if (globalClassListContains(this.channels, 'show') && !this.clickTrack.isWidgetClicked) {
      this.clickTrack.isWidgetClicked = true
      try {
        fetch(`${this.apiEndPoint}/analyticsStore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widget_id: this.widgetData.id, is_clicked: 1 }),
        })
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  onBubbleClick = (e, toggleIfNotExist = false) => {
    if (toggleIfNotExist && globalClassListContains(this.widgetBubble, 'open')) {
      return
    }

    if (this.widgetData?.styles?.widget_style === 'widget_box') {
      globalClassListAdd(this.contentWrapper, 'widget-box')
    }

    globalClassListToggle(this.channels, 'show')

    if (this.widgetData?.isAnalyticsActivate === 1) {
      this.widgetClickRequest()
    }

    if (globalClassListContains(this.card, 'show')) {
      globalSetProperty(this.root.style, '--card-width', '330px')
      this.hideCard()
      this.resetClientWidgetSize()
    }
    else if (typeof this.iFrameWrapper !== 'undefined') {
      this.removeIframe()
    }
    else {
      globalClassListToggle(this.contentWrapper, 'hide')
      const isWidgetOpen = globalClassListToggle(this.widgetBubble, 'open')
      this.widgetOpenActions(isWidgetOpen)
    }
    if (globalClassListContains(this.contentWrapper, 'hide')) {
      this.showActiveBadge()
      this.enableAnimation()
    }
    else {
      this.hideActiveBadge()
      this.disableAnimation()
    }
  }

  widgetOpenActions = (isWidgetOpen) => {
    this.openClientWidget(isWidgetOpen)
    if (isWidgetOpen && !globalClassListContains(this.callToAction, 'hide')) {
      this.callToActionHide()
      return
    }

    this.resetClientWidgetSize()
  }

  callToActionHide = () => {
    globalClassListAdd(this.callToAction, 'hide')
    globalClassListAdd(this.closeCallToAction, 'hide')

    this.resetClientWidgetSize()
  }

  channelClickRequest = async (channel_id) => {
    if (channel_id !== undefined && !Object.hasOwn(this.clickTrack, channel_id)) {
      this.clickTrack[channel_id] = true
      try {
        fetch(`${this.apiEndPoint}/analyticsStore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widget_id: this.widgetData.id, channel_id, is_clicked: 1 }),
        })
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  onChannelClick = (e) => {
    e.preventDefault()
    let channel = e.target.closest('.channel')

    if (this.widgetData?.styles?.widget_style === 'widget_box') {
      channel = e.target.closest('.channel-widget-box')
    }
    const { id, url, channel_name, target } = channel.dataset || {}
    const widgetChannel = this.widgetData?.widget_channels.find(item => item.id === id)
    const { title, unique_id } = widgetChannel?.config || {}
    const { isChatWidget } = widgetChannel?.config?.card_config || {}

    if (this.widgetData?.isAnalyticsActivate === 1) {
      this.channelClickRequest(id)
    }

    if (channel_name === 'faq') {
      this.renderFaq(widgetChannel)
    }
    else if (channel_name === 'wechat') {
      this.renderWeChat(widgetChannel)
    }
    else if (channel_name === 'custom-form') {
      this.renderForm(widgetChannel)
    }
    else if (channel_name === 'woocommerce') {
      this.renderWooCommerce(widgetChannel)
    }
    else if (channel_name === 'knowledge-base') {
      this.renderKnowledgeBase(widgetChannel)
    }
    else if (channel_name === 'wp-search') {
      this.renderWPSearch(widgetChannel?.config)
    }
    else if (channel_name === 'google-map') {
      this.renderIframe(url, channel_name, unique_id)
    }
    else if (channel_name === 'youtube' || channel_name === 'custom-iframe') {
      this.renderIframe(url, channel_name, false, widgetChannel?.config?.iframe_options)
    }
    else if (isChatWidget) {
      this.chatWidgetClick(channel_name)
    }
    else if (target === 'new_window' && url !== '#') {
      window.open(url, '_blank', 'popup')
    }
    else if (url !== '#') {
      window.open(url, target)
    }

    this.resetClientWidgetSize()

    if (this.widgetData?.styles?.google_analytics === 1) {
      this.channelClickEventTrigger(channel_name, title, url)
    }
  }

  // =====================
  // poseMessage to parent
  // =====================

  getClientInfo = () => {
    globalPostMessage(parent, { action: 'getClientInfo' }, `${this.clientDomain}`)
  }

  openClientWidget = (isWidgetOpen) => {
    globalPostMessage(parent, { action: 'widgetOpen', isWidgetOpen }, `${this.clientDomain}`)
  }

  removeClientWidget = () => {
    globalPostMessage(parent, { action: 'removeWidget' }, `${this.clientDomain}`)
  }

  renderWidgetConf = () => {
    globalPostMessage(
      parent,
      {
        action: 'widgetLoaded',
        height: (this.widgetData?.styles?.size || 60) + 20,
        width: (this.widgetData?.styles?.size || 60) + 20,
        position: this.widgetData?.styles?.position,
        top: this.widgetData?.styles?.top || 0,
        bottom: this.widgetData?.styles?.bottom || 0,
        left: this.widgetData?.styles?.left || 0,
        right: this.widgetData?.styles?.right || 0,
        pageScroll: this.widgetData?.page_scroll,
      },
      `${this.clientDomain}`,
    )
  }

  chatWidgetClick = (chatWidgetName) => {
    globalPostMessage(parent, { action: 'chatWidgetClick', chatWidgetName }, `${this.clientDomain}`)
  }

  channelClickEventTrigger = (channelType, channelName, channelUrl) => {
    globalPostMessage(
      parent,
      { action: 'bitAssistChannelClick', channelInfo: { channelType, channelName, channelUrl } },
      `${this.clientDomain}`,
    )
  }

  // =====================
  // poseMessage from parent
  // =====================
  onMessageReceived = (e) => {
    const { action } = e.data
    if (action === 'windowLoaded') {
      this.handleWindowLoaded(e.data)
    }
    else if (action === 'scrollPercent') {
      this.handleScrollPercent(e.data)
    }
    else if (action === 'clickOutside') {
      this.closeWidget()
    }
  }

  handleWindowLoaded = ({ url, winWidth, winHeight, scrollPercent, apiEndPoint }) => {
    globalSetProperty(this.root.style, '--client-win-width', `${winWidth}px`)
    globalSetProperty(this.root.style, '--client-win-height', `${winHeight}px`)
    this.#scrollPercent = scrollPercent
    this.apiEndPoint = apiEndPoint
    this.#isMobileDevice = winWidth < 768
    this.#clientPageUrl = url.slice(this.clientDomain.length + 1, url.length)

    this.fetchWidgetData()
  }

  handleScrollPercent = ({ scrollPercent }) => {
    this.#scrollPercent = scrollPercent
    if (this.widgetData?.page_scroll > 0 && !this.#delayExist) {
      this.widgetShowAfterScroll()
    }
  }

  // =====================
  // Widget setup
  // =====================
  fetchWidgetData = async () => {
    try {
      const { data } = await fetch(`${this.apiEndPoint}/bitAssistWidget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: this.clientDomain }),
      }).then(res => res.json())

      this.widgetData = data

      if (typeof this.widgetData.id === 'undefined') {
        console.error(this.widgetData)
        this.removeClientWidget()
        return
      }

      this.widgetSetup()
    }
    catch (err) {
      console.log(err)
      this.removeClientWidget()
    }
  }

  widgetSetup = async () => {
    const showOn = this.widgetData?.styles?.widget_show_on

    if (showOn !== undefined) {
      if (showOn.length === 0) {
        return
      }

      if (this.#isMobileDevice && !showOn.includes('mobile')) {
        return
      }

      if (!this.#isMobileDevice && !showOn.includes('desktop')) {
        return
      }
    }

    if (!this.setWidgetVisibleOrNot()) {
      return
    }

    this.renderWidgetConf()
    if (this.widgetData?.business_hours?.length && !this.checkBusinessHours()) {
      return
    }

    this.addCustomStyles()
    this.renderChannels()
    this.renderWidgetBubble()
    this.hideCredit()
    this.#delayExist = true
    await this.widgetShowDelay()
    this.delayExist = false
    this.showCallToAction()
    this.widgetShowAfterScroll()

    if (this.widgetData.styles?.position?.indexOf('top') > -1) {
      globalSetProperty(this.root.style, '--widget-minus-sizeY', `${this.widgetData.styles?.top || 0}px`)
    }
    if (this.widgetData.styles?.position?.indexOf('bottom') > -1) {
      globalSetProperty(this.root.style, '--widget-minus-sizeY', `${this.widgetData.styles?.bottom || 0}px`)
    }
    if (this.widgetData.styles?.position?.indexOf('left') > -1) {
      globalSetProperty(this.root.style, '--widget-minus-sizeX', `${this.widgetData.styles?.left || 0}px`)
    }
    if (this.widgetData.styles?.position?.indexOf('right') > -1) {
      globalSetProperty(this.root.style, '--widget-minus-sizeX', `${this.widgetData.styles?.right || 0}px`)
    }

    if (
      this.widgetData?.isAnalyticsActivate
      && this.widgetData.id !== 'undefined'
      && this.widgetData.widget_channels.length !== 0
    ) {
      fetch(`${this.apiEndPoint}/analyticsStore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widget_id: this.widgetData.id }),
      })
    }
  }

  hideCredit = () => {
    if (this.widgetData?.hide_credit) {
      $('#credit')?.remove()
    }
  }

  setWidgetVisibleOrNot = () => {
    if (this.widgetData?.exclude_pages?.length > 0) {
      let isExistAnyShowOn = false
      let isThisPageVisible = false

      const isPageExcluded = this.widgetData?.exclude_pages.some((page) => {
        if (page.visibility === 'showOn') {
          isExistAnyShowOn = true
        }

        if (
          (page.condition === 'contains' && this.#clientPageUrl.includes(page.url))
          || (page.condition === 'equal' && this.#clientPageUrl === page.url)
          || (page.condition === 'startWith' && this.#clientPageUrl.startsWith(page.url))
          || (page.condition === 'endWith' && this.#clientPageUrl.endsWith(page.url))
        ) {
          if (page.visibility === 'hideOn') {
            return true
          }

          isThisPageVisible = true
          return false
        }

        return false
      })

      if (
        (isExistAnyShowOn && !isPageExcluded && !isThisPageVisible)
        || (!isExistAnyShowOn && isPageExcluded && !isThisPageVisible)
      ) {
        this.removeClientWidget()
        return false
      }
    }

    return true
  }

  checkBusinessHours = () => {
    const date = new Date()
    const toDay = this.widgetData?.business_hours[date.getDay()]

    if (!toDay || !toDay?.start || !toDay?.end) {
      this.removeClientWidget()
      return false
    }

    const [startHour, startMinute] = toDay?.start.split(':').map(Number) || [0, 0]
    const [endHour, endMinute] = toDay?.end.split(':').map(Number) || [0, 0]

    const timezone = this.widgetData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    const currentTime = date.toLocaleTimeString('en-US', { timeZone: timezone, hour12: false })
    const [currentHour, currentMinute] = currentTime.split(':').map(Number)

    if (
      currentHour < startHour
      || (currentHour === startHour && currentMinute < startMinute)
      || currentHour > endHour
      || (currentHour === endHour && currentMinute > endMinute)
    ) {
      this.#isOfficeHours = false
    }

    return true
  }

  addCustomStyles = () => {
    if (this.widgetData.custom_css?.length > 0) {
      const styleElm = createElm('style')
      globalAppend(styleElm, document.createTextNode(this.widgetData.custom_css))
      globalAppend(document.head, styleElm)
    }
  }

  renderChannels = () => {
    const widgetBox = this.widgetData?.styles?.widget_style
    this.channels = createElm('div', { id: 'channels' })

    if (widgetBox === 'widget_box') {
      globalClassListAdd(this.channels, 'channel-padding')
    }

    const allChannels = this.widgetData?.widget_channels
      ?.filter(
        widgetChannel =>
          ((this.#isMobileDevice && widgetChannel.config?.channel_show_on.includes('mobile'))
            || (!this.#isMobileDevice && widgetChannel.config?.channel_show_on.includes('desktop')))
          && ((!this.#isOfficeHours && !widgetChannel.config?.hide_after_office_hours) || this.#isOfficeHours),
      )
      .map((widgetChannel) => {
        const channelBtn = createElm('button', {
          'class': widgetBox === 'widget_box' ? 'channel-widget-box' : 'channel',
          'data-id': widgetChannel.id,
          'data-channel_name': widgetChannel.channel_name.toLowerCase(),
          'data-url': widgetChannel.config?.url || '#',
          'data-target': widgetChannel.config.open_window_action,
        })
        const channelName = createElm('div', { class: 'channel-name' })
        globalInnerText(channelName, widgetChannel.config.title)

        const channelIcon = createElm('div', { class: 'channel-icon' })
        const channelImg = createElm('img', { src: widgetChannel.channel_icon, alt: widgetChannel.config.title })

        globalAppend(channelIcon, channelImg)
        globalAppend(channelBtn, [channelName, channelIcon])
        return channelBtn
      })

    globalAppend(this.channels, allChannels)
    globalAppend(this.contentWrapper, this.channels)
    if (widgetBox === 'widget_box') {
      globalClassListAdd(this.contentWrapper, 'widget-box')
    }
    globalQuerySelectorAll(document, widgetBox === 'widget_box' ? '.channel-widget-box' : '.channel').forEach(
      (channel) => {
        globalEventListener(channel, 'click', this.onChannelClick)
      },
    )
  }

  renderWidgetBubble = () => {
    globalSetProperty(this.root.style, '--widget-size', `${this.widgetData?.styles?.size || 60}px`)
    globalSetProperty(this.root.style, '--widget-color', this.widgetData?.styles?.color?.str)

    if (this.widgetData?.widget_behavior === 2) {
      // this.widgetBubble.removeEventListener('click', this.onBubbleClick)
      globalEventListener(this.widgetBubble, 'mouseenter', e => this.onBubbleClick(e, true))

      // globalEventListener(this.widgetWrapper, 'mouseleave', this.onBubbleClick)
    }
    else if (this.widgetData?.widget_behavior === 3) {
      this.onBubbleClick()
    }

    globalClassListAdd(this.widgetBubble, this.widgetData?.styles?.shape)
    globalClassListAdd(this.widgetWrapper, this.widgetData?.styles?.position)

    $('#widget-img').src = this.widgetData?.styles?.customImage || this.widgetData?.styles?.iconUrl
    globalClassListAdd($('#widget-img'), this.widgetData?.styles?.customImage ? 'image' : 'icon')

    // Change image color depend on background
    const brightness = Math.round(
      (Number.parseInt(this.widgetData?.styles?.color?.r, 10) * 299
        + Number.parseInt(this.widgetData?.styles?.color?.g, 10) * 587
        + Number.parseInt(this.widgetData?.styles?.color?.b, 10) * 114)
      / 1000,
    )
    globalSetProperty(this.root.style, '--widget-bubble-icon-color', brightness > 125 ? 'invert(0)' : 'invert(1)')

    // Active Badge & Attention Animation
    this.showActiveBadge()
    this.enableAnimation()
    if (globalClassListContains(this.channels, 'show')) {
      this.hideActiveBadge()
      this.disableAnimation()
    }
  }

  showActiveBadge = () => {
    const widgetShape = this.widgetData?.styles?.shape

    if (this.widgetData?.styles?.badge_active === 0) {
      globalClassListRemove(this.widgetBubbleWrapper, `active-${widgetShape}`)
    }
    else {
      globalClassListAdd(this.widgetBubbleWrapper, `active-${widgetShape}`)
      globalSetProperty(this.root.style, '--widget-active-badge-color', this.widgetData?.styles?.badge_color?.str)
    }

    this.resetClientWidgetSize()
  }

  hideActiveBadge = () => {
    globalClassListRemove(this.widgetBubbleWrapper, `active-${this.widgetData?.styles?.shape}`)
  }

  enableAnimation = () => {
    const animationType = this.widgetData?.styles?.animation_type

    if (this.widgetData?.styles?.animation_active === 1) {
      globalSetProperty(this.root.style, '--animation-delay', `${this.widgetData?.styles?.animation_delay?.delay}s`)

      if (animationType === 1) {
        this.animationName = '--wiggle-animation'
        globalClassListAdd(this.widgetBubbleWrapper, this.animationName)
      }
      else if (animationType === 2) {
        this.animationName = '--jump-animation'
        globalClassListAdd(this.widgetBubbleWrapper, this.animationName)
      }
      else if (animationType === 3) {
        this.animationName = '--shockwave-animation'
        globalClassListAdd(this.widgetBubbleWrapper, this.animationName)
      }
    }

    this.resetClientWidgetSize()
  }

  disableAnimation = () => {
    globalClassListRemove(this.widgetBubbleWrapper, this.animationName)
  }

  widgetShowDelay = async () => {
    if (this.widgetData?.initial_delay > 0) {
      await this.delay(this.widgetData.initial_delay)
    }
  }

  widgetShowAfterScroll = async () => {
    if (this.widgetData?.page_scroll <= 0 || this.#scrollPercent >= this.widgetData?.page_scroll) {
      globalClassListRemove(this.widgetWrapper, 'hide')
    }
    else {
      globalClassListAdd(this.widgetWrapper, 'hide')
    }
    this.resetClientWidgetSize()
  }

  showCallToAction = async () => {
    if (!this.widgetData?.call_to_action?.text) {
      return
    }

    if (this.widgetData?.call_to_action?.delay > 0) {
      await this.delay(this.widgetData.call_to_action.delay)
    }

    this.callToAction = createElm('div', { id: 'callToActionMsg' })
    globalInnerHTML(this.callToAction, this.widgetData.call_to_action.text)

    const ctaImage = createElm('img', { src: closeIcon })
    this.closeCallToAction = createElm('button', { class: 'iconBtn', id: 'closeCallToAction' })
    globalAppend(this.closeCallToAction, ctaImage)
    globalEventListener(this.closeCallToAction, 'click', this.callToActionHide)

    $('#widgetBubbleRow').prepend(this.closeCallToAction, this.callToAction)

    if (globalClassListContains(this.widgetBubble, 'open')) {
      this.callToActionHide()
      return
    }

    this.resetClientWidgetSize()
  }
}

Object.assign(Widget.prototype, {
  ...custom_form,
  ...common,
  ...custom_iframe,
  ...faq,
  ...knowledge_base,
  ...wechat,
  ...woocommerce,
  ...wp_search,
})
