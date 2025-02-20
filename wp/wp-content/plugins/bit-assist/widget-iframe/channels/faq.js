import leftArrow from '../images/left-circle-arrow.svg'
import {
  $,
  createElm,
  globalAppend,
  globalClassListToggle,
  globalEventListener,
  globalInnerHTML,
  globalQuerySelectorAll,
} from '../utils/Helpers.js'

export const faq = {
  renderFaq(widgetChannel) {
    const widgetThis = this
    widgetThis.hideChannels()
    widgetThis.renderCard()
    widgetThis.setCardStyle(widgetChannel.config)
    const cardConfig = widgetChannel.config?.card_config

    const faqBody = createElm('div', { id: 'faqBody' })
    const listWrapper = createElm('div', { id: 'listWrapper' })
    const lists = createElm('div', { id: 'lists' })
    const listSearch = createElm('input', {
      type: 'text',
      id: 'listSearch',
      class: 'formControl',
      placeholder: 'Search',
    })
    globalAppend(listWrapper, [lists, listSearch])

    const faqDescription = createElm('div', { id: 'faqDescription' })
    const descriptionTitle = createElm('div', { class: 'descriptionTitle' })
    const closeDescBtn = createElm('button', { class: 'iconBtn closeDescBtn', title: 'Back' })
    const leftArrowIcon = createElm('img', { src: leftArrow, alt: 'back' })
    globalAppend(closeDescBtn, leftArrowIcon)

    const pElm = createElm('p')
    globalAppend(descriptionTitle, [closeDescBtn, pElm])

    const content = createElm('div', { class: 'content' })
    globalAppend(faqDescription, [descriptionTitle, content])
    globalAppend(faqBody, [listWrapper, faqDescription])

    globalInnerHTML(widgetThis.cardBody, '')
    globalAppend(widgetThis.cardBody, faqBody)

    globalEventListener(listSearch, 'input', widgetThis.searchList)
    globalEventListener(closeDescBtn, 'click', e => faq.faqDescToggle(widgetThis, e))

    faq.renderFaqItem(widgetThis, cardConfig?.faqs)
  },

  renderFaqItem(widgetThis, items) {
    widgetThis.itemListAppend(items)
    globalQuerySelectorAll(document, '.listItemTitleWrapper').forEach((item) => {
      globalEventListener(item, 'click', e => faq.faqDescToggle(widgetThis, e, items))
    })
  },

  faqDescToggle(widgetThis, e, faqs) {
    if (faqs) {
      const faq = faqs.find(
        item => Number(item.id) === Number(e.target.closest('.listItemTitleWrapper').dataset.item_id),
      )
      globalInnerHTML($('.descriptionTitle p'), faq?.title || '')
      globalInnerHTML($('.content'), faq?.description || '')
    }

    const faqBody = $('#faqBody')
    const isOpen = globalClassListToggle($('#faqBody'), 'openDesc')
    if (isOpen) {
      const descHeight = $('#faqDescription').scrollHeight
      Object.assign(faqBody.style, {
        height: descHeight > 400 ? '400px' : `${descHeight}px`,
        overflow: descHeight > 400 ? 'auto' : 'initial',
      })
    }
    else {
      faqBody.removeAttribute('style')
    }

    globalClassListToggle($('#listWrapper'), 'hide')
    widgetThis.resetClientWidgetSize()
  },
}
