import closeIcon from '../images/close-icon.svg'
import leftArrow from '../images/left-circle-arrow.svg'
import rightArrow from '../images/right-circle-arrow.svg'
import {
  $,
  createElm,
  globalAppend,
  globalClassListAdd,
  globalClassListRemove,
  globalClassListToggle,
  globalEventListener,
  globalInnerHTML,
  globalQuerySelectorAll,
  globalSetProperty,
} from '../utils/Helpers.js'

export const knowledge_base = {
  renderKnowledgeBase(widgetChannel) {
    const widgetThis = this

    widgetThis.hideChannels()
    widgetThis.renderCard()
    widgetThis.setCardStyle(widgetChannel.config)
    const cardConfig = widgetChannel.config?.card_config

    const knowledgeBaseBody = createElm('div', { id: 'knowledgeBaseBody' })
    const listWrapper = createElm('div', { id: 'listWrapper' })
    const lists = createElm('div', { id: 'lists' })
    const listSearch = createElm('input', {
      type: 'text',
      id: 'listSearch',
      class: 'formControl',
      placeholder: 'Search',
    })
    globalAppend(listWrapper, [lists, listSearch])

    const overlay = createElm('div', { class: 'overlay' })
    const knowledgeBaseDescription = createElm('div', { id: 'knowledgeBaseDescription' })
    const descriptionTitle = createElm('div', { class: 'descriptionTitle' })
    const p = createElm('p')
    const modalActions = createElm('div', { class: 'modalActions' })

    const prevKBBtn = createElm('button', { class: 'iconBtn rounded prevKB', title: 'Prev' })
    const prevKbImg = createElm('img', { src: leftArrow, alt: 'prev' })
    globalAppend(prevKBBtn, prevKbImg)

    const nextKBBtn = createElm('button', { class: 'iconBtn rounded nextKB', title: 'Next' })
    const nextKbImg = createElm('img', { src: rightArrow, alt: 'next' })
    globalAppend(nextKBBtn, nextKbImg)

    const closeKBBtn = createElm('button', { class: 'iconBtn rounded closeKB', title: 'Close' })
    const closeKbImg = createElm('img', { src: closeIcon, alt: 'close' })
    globalAppend(closeKBBtn, closeKbImg)

    globalAppend(modalActions, [prevKBBtn, nextKBBtn, closeKBBtn])
    globalAppend(descriptionTitle, [p, modalActions])

    const content = createElm('div', { class: 'content' })
    globalAppend(knowledgeBaseDescription, [descriptionTitle, content])
    globalAppend(knowledgeBaseBody, [listWrapper, overlay, knowledgeBaseDescription])

    globalInnerHTML(widgetThis.cardBody, '')
    globalAppend(widgetThis.cardBody, knowledgeBaseBody)

    globalEventListener(listSearch, 'input', widgetThis.searchList)
    globalEventListener(closeKBBtn, 'click', () => knowledge_base.knowledgeBaseDescToggle(widgetThis))
    globalEventListener(prevKBBtn, 'click', () => widgetThis.gotoPrevNextKB('previousElementSibling'))
    globalEventListener(nextKBBtn, 'click', () => widgetThis.gotoPrevNextKB('nextElementSibling'))

    widgetThis.renderKnowledgeBaseItem(widgetThis, cardConfig?.knowledge_bases)
  },

  renderKnowledgeBaseItem(widgetThis, items) {
    widgetThis.itemListAppend(items)
    globalQuerySelectorAll(document, '.listItemTitleWrapper').forEach((item) => {
      globalEventListener(item, 'click', e => knowledge_base.knowledgeBaseDescToggle(widgetThis, e, items))
    })
  },

  gotoPrevNextKB(indicator) {
    const item = $('.listItem.active')[indicator]
    if (item) {
      item.querySelector('.listItemTitleWrapper').click()
    }
  },

  knowledgeBaseDescToggle(widgetThis, e, knowledgeBases) {
    globalClassListRemove($('.listItem.active'), 'active')

    const knowledgeBaseBody = $('#knowledgeBaseBody')
    if (!knowledgeBases) {
      globalClassListRemove(knowledgeBaseBody, 'openDesc')
      globalSetProperty(widgetThis.root.style, '--card-width', '330px')
      widgetThis.resetClientWidgetSize()
      return
    }

    globalClassListToggle(e.target.closest('.listItem'), 'active')
    const knowledgeBase = knowledgeBases.find(
      item => Number(item.id) === Number(e.target.closest('.listItemTitleWrapper').dataset.item_id),
    )
    if (!knowledgeBase) {
      return
    }

    globalClassListAdd(knowledgeBaseBody, 'openDesc')
    globalInnerHTML($('.descriptionTitle p'), knowledgeBase?.title || '')
    globalInnerHTML($('.content'), knowledgeBase?.description || '')

    globalSetProperty(widgetThis.root.style, '--modal-title-height', `${$('.descriptionTitle').offsetHeight}px`)
    globalSetProperty(widgetThis.root.style, '--card-width', '767px')
    widgetThis.resetClientWidgetSize()
  },
}
