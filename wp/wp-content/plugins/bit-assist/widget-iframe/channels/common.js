import closeIcon from '../images/close-icon.svg'
import rightArrowIcon from '../images/right-circle-arrow.svg'
import {
  $,
  createElm,
  globalAppend,
  globalClassListAdd,
  globalClassListContains,
  globalClassListRemove,
  globalEventListener,
  globalInnerHTML,
  globalPostMessage,
  globalQuerySelectorAll,
  globalSetProperty,
} from '../utils/Helpers.js'

export const common = {
  hideChannels() {
    if (globalClassListContains(this.channels, 'show')) {
      globalClassListRemove(this.channels, 'show')
    }
  },

  debounce(callback, delay) {
    let debounceTimer
    return function (...args) {
      const context = this
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => callback.apply(context, args), delay)
    }
  },

  renderCard() {
    if ($('#card')) {
      globalClassListAdd(this.card, 'show')
      return
    }

    this.card = createElm('div', { id: 'card', class: 'show' })
    const cardHeader = createElm('div', { id: 'cardHeader' })
    const h4Elm = createElm('h4')
    const iconBtn = createElm('button', { class: 'iconBtn closeCardBtn', title: 'Close' })
    const closeBtnIcon = createElm('img', { src: closeIcon, alt: 'Close' })
    globalAppend(iconBtn, closeBtnIcon)

    globalAppend(cardHeader, [h4Elm, iconBtn])
    this.cardBody = createElm('div', { id: 'cardBody' })
    globalAppend(this.card, [cardHeader, this.cardBody])
    globalAppend(this.contentWrapper, this.card)

    globalEventListener(iconBtn, 'click', this.closeWidget)
  },

  setCardStyle(config) {
    this.selectedFormBg = config?.card_config?.card_bg_color?.str

    globalInnerHTML($('#cardHeader>h4'), config?.title)

    globalSetProperty(this.root.style, '--card-theme-color', this.selectedFormBg)
    globalSetProperty(this.root.style, '--card-text-color', config?.card_config?.card_text_color?.str)
  },

  hideCard() {
    if (globalClassListContains(this.card, 'show')) {
      globalClassListRemove(this.card, 'show')
    }
  },

  itemListAppend(items) {
    const itemsObj = []
    items?.forEach((item) => {
      const listItem = createElm('div', { class: 'listItem' })
      const listItemTitleWrapper = createElm('button', {
        'class': 'listItemTitleWrapper',
        'data-item_id': item.id ? item.id : item.order_id,
      })

      const title = createElm('p', { class: 'title' })
      globalInnerHTML(
        title,
        item.title
          ? item.title
          : (item.order_id ? `Order Id: ${item.order_id} (${item.shipping_status})` : '') || '',
      )

      const detailsIcon = createElm('img', { src: rightArrowIcon, alt: 'Details' })
      globalAppend(listItemTitleWrapper, detailsIcon)
      globalAppend(listItemTitleWrapper, title)

      globalAppend(listItem, listItemTitleWrapper)
      itemsObj.push(listItem)
    })
    globalAppend($('#lists'), itemsObj)
  },

  searchList(e) {
    const search = e.target.value.toLowerCase()
    globalQuerySelectorAll(document, '.listItem').forEach((item) => {
      if (item.querySelector('.title').textContent.toLowerCase().includes(search)) {
        globalClassListRemove(item, 'hide')
      }
      else {
        globalClassListAdd(item, 'hide')
      }
    })
  },

  resetClientWidgetSize() {
    globalPostMessage(
      parent,
      { action: 'resetWidgetSize', height: this.widgetWrapper.offsetHeight, width: this.widgetWrapper.offsetWidth },
      `${this.clientDomain}`,
    )
  },
}
