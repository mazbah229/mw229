import { $, createElm, globalAppend, globalEventListener, globalInnerHTML, globalInnerText, globalSetAttribute } from '../utils/Helpers.js'

export const wp_search = {
  wp_post_types: undefined,
  renderWPSearch(config) {
    this.hideChannels()
    this.renderCard()
    this.setCardStyle(config)

    wp_search.wp_post_types = config?.wp_post_types

    const wpSearchBody = createElm('div', { id: 'wpSearchBody' })
    const listWrapper = createElm('div', { id: 'listWrapper' })
    const lists = createElm('div', { 'id': 'lists', 'data-link_open_action': config.open_window_action })
    const listSearch = createElm('input', {
      type: 'text',
      id: 'listSearch',
      class: 'formControl',
      placeholder: 'Search',
    })
    globalAppend(listWrapper, [lists, listSearch])
    globalAppend(wpSearchBody, listWrapper)

    globalInnerHTML(this.cardBody, '')
    globalAppend(this.cardBody, wpSearchBody)

    this.searchPostPage('')
    globalEventListener(
      listSearch,
      'input',
      this.debounce(e => this.searchPostPage(e.target.value), 600),
    )
  },

  async searchPostPage(value, page = 1) {
    const { data, pagination } = await this.fetchWPSearchData(value, page)

    this.renderWPSearchItem(data)
    if (pagination?.has_next || pagination?.has_previous) {
      this.renderWPSearchPagination(pagination)
    }

    this.resetClientWidgetSize()
  },

  async fetchWPSearchData(value, page) {
    const { data } = await fetch(`${this.apiEndPoint}/wpSearch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: value, page, postTypes: wp_search.wp_post_types }),
    }).then(res => res.json())

    return data
  },

  renderWPSearchItem(items) {
    const lists = $('#lists')
    globalInnerHTML(lists, '')
    const itemsObj = []

    items?.forEach((item) => {
      const listItem = createElm('div', { class: 'listItem' })
      const listItemTitleWrapper = createElm('button', { class: 'listItemTitleWrapper', title: item.guid })
      const title = createElm('p', { class: 'title' })
      const type = createElm('p', { class: 'type' })

      globalAppend(listItem, listItemTitleWrapper)
      globalAppend(listItemTitleWrapper, [title, type])
      globalInnerText(title, item?.post_title || '(no title)')
      globalInnerText(type, item?.post_type || '')
      itemsObj.push(listItem)

      globalEventListener(listItemTitleWrapper, 'click', () => {
        const { link_open_action } = lists.dataset
        if (link_open_action === 'new_window') {
          window.open(item.guid, '_blank', 'popup')
        }
        else {
          window.open(item.guid, link_open_action)
        }
      })
    })

    globalAppend(lists, itemsObj)
  },

  renderWPSearchPagination(pagination) {
    const paginationWrap = createElm('div', { class: 'pagination' })

    const pageNumber = createElm('span', { class: 'pageNumber' })
    globalInnerText(pageNumber, `${pagination?.current} / ${pagination?.total} page`)

    const nextPage = createElm('button', { class: 'nextPage' })
    globalInnerText(nextPage, 'Next')
    if (!pagination?.has_next) {
      globalSetAttribute(nextPage, 'disabled', '')
    }
    const prevPage = createElm('button', { class: 'prevPage' })
    globalInnerText(prevPage, 'Prev')
    if (!pagination?.has_previous) {
      globalSetAttribute(prevPage, 'disabled', '')
    }

    const searchValue = $('#listSearch')?.value || ''
    globalEventListener(nextPage, 'click', () => this.searchPostPage(searchValue, pagination?.next))
    globalEventListener(prevPage, 'click', () => this.searchPostPage(searchValue, pagination?.previous))

    globalAppend(paginationWrap, [prevPage, nextPage, pageNumber])
    globalAppend($('#lists'), paginationWrap)
  },
}
