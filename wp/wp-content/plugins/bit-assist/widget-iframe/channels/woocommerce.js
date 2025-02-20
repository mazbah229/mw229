import leftArrow from '../images/left-circle-arrow.svg'
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
  globalQuerySelectorAll,
  globalSetAttribute,
} from '../utils/Helpers.js'

export const woocommerce = {
  renderWooCommerce(widgetChannel) {
    const widgetThis = this

    widgetThis.hideChannels()
    widgetThis.renderCard()
    widgetThis.setCardStyle(widgetChannel.config)
    const cardConfig = widgetChannel.config?.card_config

    widgetThis.formBody = createElm('form', { id: 'formBody', method: 'POST' })
    const dynamicFieldsDiv = createElm('div', { id: 'dynamicFields' })
    const hiddenInput = createElm('input', {
      type: 'hidden',
      name: 'widget_channel_id',
      value: widgetChannel.id,
    })
    const submitButton = createElm('button', { type: 'submit' })
    globalInnerText(submitButton, cardConfig?.submit_button_text)

    globalAppend(widgetThis.formBody, [dynamicFieldsDiv, hiddenInput, submitButton])

    globalInnerHTML(widgetThis.cardBody, '')
    globalAppend(widgetThis.cardBody, widgetThis.formBody)

    globalEventListener(widgetThis.formBody, 'submit', e => woocommerce.formSubmitted(widgetThis, e, widgetChannel))
    woocommerce.createAllFields(cardConfig?.form_fields)
  },

  createAllFields(fields) {
    const dynamicFields = $('#dynamicFields')

    fields?.forEach((field) => {
      woocommerce.createTextField(field, dynamicFields)
    })
  },

  createTextField(field, dynamicFields) {
    const fieldInput = createElm('input')
    const fieldType = field.field_type
    const newFieldType = fieldType.includes('_') ? fieldType.split('_')[1] : fieldType

    globalSetAttribute(fieldInput, 'name', `${newFieldType}`)

    globalSetAttribute(fieldInput, 'placeholder', field.label + (field.required ? '' : ' (optional)'))
    if (field.required) {
      globalSetAttribute(fieldInput, 'required', '')
    }

    globalClassListAdd(fieldInput, 'formControl')
    globalSetAttribute(fieldInput, 'type', fieldType)
    globalAppend(dynamicFields, fieldInput)
  },

  async formSubmitted(widgetThis, e, widgetChannel) {
    e.preventDefault()

    const submitBtn = e.target.querySelector('[type="submit"]')
    const oldText = submitBtn.textContent
    const formData = new FormData(e.target)

    try {
      globalInnerText(submitBtn, 'Sending...')
      globalClassListAdd(submitBtn, 'disabled')

      const responseData = await fetch(`${widgetThis.apiEndPoint}/responses`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json())

      if (responseData?.status === 'success') {
        woocommerce.formSubmittedData(widgetThis, formData, widgetChannel)
      }
      else {
        await woocommerce.showToast(widgetThis, 'error', responseData?.data, widgetChannel)
      }

      e.target.reset()
      globalQuerySelectorAll(e.target, '.cfit-title').forEach((title) => {
        globalInnerText(title, 'No file chosen')
      })
      globalClassListRemove(submitBtn, 'disabled')
      globalInnerText(submitBtn, oldText)
    }
    catch (err) {
      console.log(err)
      await woocommerce.showToast(widgetThis, 'error')

      globalClassListRemove(submitBtn, 'disabled')
      globalInnerText(submitBtn, oldText)
    }
  },

  async formSubmittedData(widgetThis, formData, widgetChannel, page = 1) {
    formData.set('page', page)
    const orderDetails = await fetch(`${widgetThis.apiEndPoint}/orderDetails`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())

    if (orderDetails.status === 'success') {
      await woocommerce.showToast(widgetThis, 'success', orderDetails?.data, widgetChannel, formData)
    }
  },

  async showToast(widgetThis, type, data, widgetChannel, formData) {
    if (data?.status_code === 200) {
      woocommerce.orderDetailsItems(widgetThis, data, widgetChannel)

      if (data?.pagination?.has_next || data?.pagination?.has_previous) {
        woocommerce.renderOrderDetailsPagination(widgetThis, data?.pagination, formData, widgetChannel)
      }
      return
    }

    const toast = createElm('div', { class: `toast ${type}` })
    const toastContent = createElm('div', { class: 'toast-content' })
    const toastText = createElm('div', { class: 'toast-text' })

    const toastTextTitle = createElm('div', { class: 'toast-text-title' })
    toastTextTitle.textContent = type === 'success' ? '404' : 'Error'

    const toastTextBody = createElm('div', { class: 'toast-text-body' })
    toastTextBody.textContent = type === 'success' ? data?.message : 'Something went wrong'

    globalAppend(toastText, [toastTextTitle, toastTextBody])
    globalAppend(toastContent, toastText)
    globalAppend(toast, toastContent)

    globalAppend(widgetThis.cardBody, toast)
    globalClassListAdd(widgetThis.formBody, 'hide')

    if (globalClassListContains(toast, 'success')) {
      toastTextTitle.style.color = widgetThis.selectedFormBg
    }

    await widgetThis.delay(2)
    if (!globalClassListContains(widgetThis.formBody, 'hide')) {
      return
    }

    widgetThis.cardBody.removeChild(toast)
    globalClassListRemove(widgetThis.formBody, 'hide')
  },

  orderDetailsItems(widgetThis, data, widgetChannel) {
    const orderDetailsBody = createElm('div', { id: 'orderDetailsBody' })
    const listWrapper = createElm('div', { id: 'listWrapper' })
    const lists = createElm('div', { id: 'lists' })

    globalAppend(listWrapper, lists)

    const orderDetailsDescription = createElm('div', { id: 'orderDetailsDescription' })
    const descriptionTitle = createElm('div', { class: 'descriptionTitle' })
    const closeDescBtn = createElm('button', { class: 'iconBtn closeDescBtn', title: 'Back' })
    globalInnerHTML(closeDescBtn, leftArrow)
    const pElm = createElm('p')
    globalAppend(descriptionTitle, [closeDescBtn, pElm])

    const content = createElm('div', { class: 'content' })
    globalAppend(orderDetailsDescription, [descriptionTitle, content])
    globalAppend(orderDetailsBody, [listWrapper, orderDetailsDescription])

    globalInnerHTML(widgetThis.cardBody, '')
    globalAppend(widgetThis.cardBody, orderDetailsBody)

    const orderDetails = widgetChannel?.config?.order_details
    if (data.items.length === 1) {
      woocommerce.singleItemContentShow(widgetThis, orderDetails, data)
      return
    }

    globalEventListener(closeDescBtn, 'click', e => woocommerce.orderDetailsDescToggle(widgetThis, e))
    woocommerce.renderWooCommerceItem(widgetThis, data, orderDetails)
  },

  singleItemContentShow(widgetThis, orderDetails, data) {
    const item = data.items[0]

    const orderDetailsBody = $('#orderDetailsBody')
    orderDetailsBody.removeChild($('#listWrapper'))
    orderDetailsBody.removeChild($('#orderDetailsDescription'))

    const singleItemContent = createElm('div', { id: 'singleItemContent' })

    const itemTitle = createElm('p', { class: 'descriptionTitle title' })
    globalInnerHTML(itemTitle, item.order_id ? `Order Id: ${item.order_id} (${item.shipping_status})` : '')
    const itemContent = createElm('div', { class: 'content' })
    globalAppend(singleItemContent, [itemTitle, itemContent])
    globalAppend(orderDetailsBody, singleItemContent)

    woocommerce.showContent(orderDetails, item)
    widgetThis.resetClientWidgetSize()
  },

  renderWooCommerceItem(widgetThis, data, orderDetails) {
    widgetThis.itemListAppend(data.items)
    globalQuerySelectorAll(document, '.listItemTitleWrapper').forEach((item) => {
      globalEventListener(item, 'click', (e) => {
        woocommerce.orderDetailsDescToggle(widgetThis, e, data, orderDetails)
      })
    })
    widgetThis.resetClientWidgetSize()
  },

  orderDetailsDescToggle(widgetThis, e, data, orderDetails) {
    if (data) {
      const item = data.items.find(
        item => Number(item.order_id) === Number(e.target.closest('.listItemTitleWrapper').dataset.item_id),
      )
      globalInnerHTML($('.descriptionTitle p'), `Order Id: ${item?.order_id}` || '')
      woocommerce.showContent(orderDetails, item)
    }

    const orderDetailsBody = $('#orderDetailsBody')
    const isOpen = globalClassListToggle($('#orderDetailsBody'), 'openDesc')
    if (isOpen) {
      const descHeight = $('#orderDetailsDescription').scrollHeight
      Object.assign(orderDetailsBody.style, {
        height: descHeight > 400 ? '400px' : `${descHeight}px`,
        overflow: descHeight > 400 ? 'auto' : 'initial',
      })
    }
    else {
      orderDetailsBody.removeAttribute('style')
    }

    globalClassListToggle($('#listWrapper'), 'hide')
    widgetThis.resetClientWidgetSize()
  },

  showContent(orderDetails, item) {
    let content = ''

    orderDetails?.filter(Boolean).forEach((key) => {
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      let formattedValue = item[key]
      if (typeof formattedValue === 'string') {
        formattedValue = formattedValue
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }

      content += `${formattedKey}: ${formattedValue}<br>`
    })

    globalInnerHTML($('.content'), content)

    $('.content').style.fontSize = '1rem'
    $('.content').style.lineHeight = '2'
  },

  renderOrderDetailsPagination(widgetThis, pagination, formData, widgetChannel) {
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

    globalEventListener(nextPage, 'click', () =>
      woocommerce.formSubmittedData(widgetThis, formData, widgetChannel, pagination?.next))
    globalEventListener(prevPage, 'click', () =>
      woocommerce.formSubmittedData(widgetThis, formData, widgetChannel, pagination?.previous))

    globalAppend(paginationWrap, [prevPage, nextPage, pageNumber])
    globalAppend($('#lists'), paginationWrap)

    widgetThis.resetClientWidgetSize()
  },
}
