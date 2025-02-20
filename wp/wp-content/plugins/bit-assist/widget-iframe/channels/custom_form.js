import {
  $,
  createElm,
  globalAppend,
  globalClassListAdd,
  globalClassListContains,
  globalClassListRemove,
  globalEventListener,
  globalInnerHTML,
  globalInnerText,
  globalQuerySelectorAll,
  globalSetAttribute,
} from '../utils/Helpers.js'

export const custom_form = {
  renderForm(widgetChannel) {
    const widgetThis = this

    widgetThis.hideChannels()
    widgetThis.renderCard()
    widgetThis.setCardStyle(widgetChannel.config)
    const cardConfig = widgetChannel.config?.card_config

    // Render form
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

    globalEventListener(widgetThis.formBody, 'submit', e => custom_form.formSubmitted(widgetThis, e))
    custom_form.createAllFields(cardConfig?.form_fields)
  },

  createAllFields(fields) {
    const dynamicFields = $('#dynamicFields')

    let flag = false
    fields?.forEach((field) => {
      if (field.field_type === 'file' && !flag) {
        globalSetAttribute($('#formBody'), 'enctype', 'multipart/form-data')
        flag = true
      }

      if (field.field_type === 'rating') {
        custom_form.createRatingField(field, dynamicFields, 'rating')
      }
      else if (field.field_type === 'feedback') {
        custom_form.createRatingField(field, dynamicFields, 'feedback')
      }
      else {
        custom_form.createTextField(field, dynamicFields)
      }
    })
  },

  createRatingField(field, dynamicFields, filedType) {
    const randomId = Math.floor(Math.random() * 100000000)
    const name = field.label.toLowerCase().replace(/ /g, '_')
    const wrapper = createElm('div', { class: filedType })

    if (filedType === 'rating') {
      globalClassListAdd(wrapper, field.rating_type)
    }

    let types = []
    if (filedType === 'feedback') {
      types = ['bug', 'suggest', 'love']
    }
    else if (field.rating_type === 'star') {
      types = ['5 star', '4 star', '3 star', '2 star', '1 star']
    }
    else {
      types = ['sad', 'confused', 'happy']
    }

    types.forEach((type) => {
      const fieldId = `${name}_${type.replace(/ /g, '_')}_${randomId}`

      const inputElm = createElm('input', { type: 'radio', name, value: type, id: fieldId })
      if (field.required) {
        globalSetAttribute(inputElm, 'required', '')
      }

      const labelElm = createElm('label', { title: type, for: fieldId, class: type })
      if (filedType === 'feedback') {
        globalInnerHTML(labelElm, `${type.charAt(0).toUpperCase() + type.slice(1)}`)
        const feedbackIcon = createElm('div', { class: 'feedback-icon' })
        labelElm.prepend(feedbackIcon)
      }

      globalAppend(wrapper, [inputElm, labelElm])
    })
    globalAppend(dynamicFields, wrapper)
  },

  createTextField(field, dynamicFields) {
    const fieldInput = createElm(field.field_type === 'textarea' ? 'textarea' : 'input')

    globalSetAttribute(
      fieldInput,
      'name',
      `${field.label.toLowerCase().replace(/ /g, '_')}${field?.allow_multiple ? '[]' : ''}`,
    )
    globalSetAttribute(fieldInput, 'placeholder', field.label + (field.required ? '' : ' (optional)'))
    if (field.required) {
      globalSetAttribute(fieldInput, 'required', '')
    }

    if (field.field_type === 'GDPR') {
      custom_form.gdprField(field, dynamicFields, fieldInput)
      return
    }

    globalClassListAdd(fieldInput, 'formControl')
    globalSetAttribute(fieldInput, 'type', field.field_type)

    if (field.field_type === 'file') {
      custom_form.fileField(field, dynamicFields, fieldInput)
      return
    }
    globalAppend(dynamicFields, fieldInput)
  },

  fileField(field, dynamicFields, fieldInput) {
    if (field?.allow_multiple) {
      globalSetAttribute(fieldInput, 'multiple', '')
    }

    const inputWrap = createElm('div', { class: 'formControl customFile' })

    const customFileInput = createElm('div', { class: 'cfit' })
    const customFileInputBtn = createElm('button', { class: 'cfit-btn', type: 'button' })
    globalInnerText(customFileInputBtn, 'Attach File')
    const customFileInputTitle = createElm('div', { class: 'cfit-title' })
    globalInnerText(customFileInputTitle, 'No file chosen')

    globalAppend(customFileInput, [customFileInputBtn, customFileInputTitle])
    globalAppend(inputWrap, [customFileInput, fieldInput])
    globalAppend(dynamicFields, inputWrap)

    globalEventListener(customFileInputBtn, 'click', () => fieldInput.click())
    globalEventListener(fieldInput, 'change', (e) => {
      let fileName = 'No file chosen'
      const fileLength = e.target.files.length
      if (fileLength > 0) {
        fileName = fileLength === 1 ? e.target.files[0].name : `${fileLength} files`
      }
      globalInnerText(customFileInputTitle, fileName)
    })
  },

  gdprField(field, dynamicFields, fieldInput) {
    globalSetAttribute(fieldInput, 'type', 'checkbox')

    const link = createElm('a', { target: '_blank' })
    globalInnerHTML(link, field.label)
    if (field?.url) {
      link.href = field.url
    }

    const gdprContainer = createElm('div', { class: 'gdprContainer' })
    globalAppend(gdprContainer, [fieldInput, link])
    globalAppend(dynamicFields, gdprContainer)
  },

  async formSubmitted(widgetThis, e) {
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
        await custom_form.showToast(widgetThis, 'success', responseData?.data)
      }
      else {
        await custom_form.showToast(widgetThis, 'error', responseData?.data)
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
      await custom_form.showToast(widgetThis, 'error')
      e.target.reset()
      globalQuerySelectorAll(e.target, '.cfit-title').forEach((title) => {
        globalInnerText(title, 'No file chosen')
      })
      globalClassListRemove(submitBtn, 'disabled')
      globalInnerText(submitBtn, oldText)
    }
  },

  async showToast(widgetThis, type, message) {
    if (!widgetThis.cardBody.contains(widgetThis.formBody)) {
      return
    }

    const toast = createElm('div', { class: `toast ${type}` })
    const toastContent = createElm('div', { class: 'toast-content' })
    const toastText = createElm('div', { class: 'toast-text' })

    const toastTextTitle = createElm('div', { class: 'toast-text-title' })
    toastTextTitle.textContent = type === 'success' ? 'Success' : 'Error'

    const toastTextBody = createElm('div', { class: 'toast-text-body' })
    toastTextBody.textContent = type === 'success' ? message : 'Something went wrong'

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
}
