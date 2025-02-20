export const $ = s => document.querySelector(s)

export const createElm = (elm, attributes) => {
  const domElm = document.createElement(elm)

  if (attributes) {
    for (const attribute in attributes) {
      domElm.setAttribute(attribute, attributes[attribute])
    }
  }
  return domElm
}

export const globalAppend = (elm, child) => (Array.isArray(child) ? elm.append(...child) : elm.append(child))

export const globalEventListener = (selector, type, callback) => selector.addEventListener(type, callback)

export const globalSetProperty = (selector, propName, value) => selector.setProperty(propName, value)

export const globalPostMessage = (parent, message, clientDomain) => parent.postMessage(message, clientDomain)

export const globalQuerySelectorAll = (documentTarget, selectedClass) => documentTarget.querySelectorAll(selectedClass)

export const globalClassListRemove = (selector, action) => selector?.classList.remove(action)

export const globalClassListAdd = (selector, action) => selector?.classList.add(action)

export const globalClassListContains = (selector, action) => selector?.classList.contains(action)

export const globalClassListToggle = (selector, action) => selector?.classList.toggle(action)

export const globalSetAttribute = (domElm, attribute, value) => {
  domElm.setAttribute(attribute, value)
}

export const globalInnerHTML = (domElm, value) => {
  domElm.innerHTML = value
}
export const globalInnerText = (domElm, value) => {
  domElm.textContent = value
}
