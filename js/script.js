'use strict'

const formatCurrency = value => {
  return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}

const App = {}
App.formOptions = document.querySelector('#form-options')
App.formAddItem = document.querySelector('#form-add-item')
App.displayValue = document.querySelector('#display > #display-value')
App.displayMoney = document.querySelector('#display > #display-money')
App.sumList = document.querySelector('#sum-list')
App.percentMoneyCurrent = 0
App.progressbar = document.querySelector('#progressbar > div')
App.isEditedOptions = false
App.currentItem = null

App.sumTotal = 0

App.data = {}

App.toogle = () => {

  if (App.isEditedOptions) {
    App.formOptions['list-data'].classList.remove('background-danger')
    App.loadOptions()
    App.isEditedOptions = false
  }

  let style = App.formOptions.style

  if (isMobile()) {
    if (style.left === '-100%') {
      style.left = '0'
    } else {
      style.left = '-100%'
    }
  } else {
    if (style.top === '-100%') {
      style.top = '0'
    } else {
      style.top = '-100%'
    }
  }
}

App.formOptions.clear = () => {
  App.formOptions.querySelector('[name=money-available]').value = ''
  App.formOptions.querySelector('[name=list-data]').value = ''
  App.isEditedOptions = true
}

App.addEvents = () => {

  document.querySelectorAll('.app-toogle')
    .forEach((item) => { item.addEventListener('click', App.toogle) })

  App.formOptions['btn-clear'].addEventListener('click', event => {
    event.preventDefault()
    App.formOptions.clear()
  })

  App.formOptions['theme-name'].addEventListener('change', event => {
    event.preventDefault()
    App.data.themeName = event.target.value
    App.setTheme(event.target.value)
    App.save()
  })

  App.formOptions.addEventListener('change', event => {
    const changedElement = event.target

    if (changedElement.name == 'money-available' || changedElement.name == 'list-data') {
      App.isEditedOptions = true
    }

  })

  App.formOptions.addEventListener('submit', event => {

    event.preventDefault()

    const moneyAvailable = App.formOptions['money-available']
    const listData = App.formOptions['list-data']
    let json = listData.value || '[]'

    const checkValues = () => {
      try {
        JSON.parse(json)
        return true
      } catch {
        return false
      }
    }

    if (checkValues()) {
      App.data.moneyAvailable = parseFloat(moneyAvailable.value) || 0

      App.data.listData = JSON.parse(json)
      App.save()
      App.toogle()
    } else {
      listData.classList.add('background-danger')
      listData.focus()
    }
  })

  App.formAddItem.addEventListener('submit', event => {
    event.preventDefault()

    let description = App.formAddItem['description'].value
    const amount = App.formAddItem['amount'].value || 1
    const price = App.formAddItem['price'].value

    if (description) description = `${description} - `

    App.data.listData.unshift({
      'des': `${description}${amount} X ${formatCurrency(parseFloat(price))}`,
      'amount': parseFloat(amount),
      'price': parseFloat(price),
      'total': parseFloat((amount * price).toFixed(2))
    })

    App.formAddItem['description'].value = ''
    App.formAddItem['amount'].value = ''
    App.formAddItem['price'].value = ''

    App.currentItem = 'firstItem'
    App.save()
  })

  App.sumList.addEventListener('click', event => {
    const clickedElement = event.target

    if (clickedElement.tagName === 'BUTTON') {
      App.data.listData.splice(clickedElement.id, 1)
      App.save()
    }
  })
}

App.start = () => {

  if (isMobile()) {
    App.formOptions.style.left = '-100%'
    App.formOptions.style.transition = 'left .5s ease-in-out'
  } else {
    App.formOptions.style.top = '-100%'
    App.formOptions.style.transition = 'top .5s ease-in-out'
  }

  App.data = JSON.parse(localStorage.getItem('Soma Compras')) || { listData: [] }
  App.addEvents()
  App.refresh()
  App.setTheme(App.data.themeName)
}

App.setTheme = themeName => {
  const style = document.querySelector('#app-style').style
  const setProp = (nameProp, value) => {
    style.setProperty(nameProp, value)
    document.documentElement.style.setProperty(nameProp, value)
  }

  if (themeName === 'Dark') {

    setProp('--background-default', '#363636')
    setProp('--color-default', 'cornsilk')

    setProp('--color-sucssess', '#1C1C1C')
    setProp('--color-danger', 'Crimson')
    setProp('--color-neutral', 'darkblue')

    setProp('--icr', ' 0')
    setProp('--icg', ' 0')
    setProp('--icb', ' 20')

    setProp('--set-intensity-color-ligth', ' .2')
    setProp('--setIntensityColorMedium', ' .45')
    setProp('--setIntensityColorHard', ' .95')
  }

  if (themeName === 'Light') {

    setProp('--background-default', 'white')
    setProp('--color-default', '#808080')

    setProp('--color-sucssess', '#4F4F4F')
    setProp('--color-danger', '#FF6347')
    setProp('--color-neutral', '#FFFAFA')

    setProp('--icr', '65')
    setProp('--icg', '65')
    setProp('--icb', '65')

    setProp('--set-intensity-color-ligth', ' .07')
    setProp('--setIntensityColorMedium', ' .1')
    setProp('--setIntensityColorHard', ' .3')

  }

  setProp('--intensityColorLigth', ' rgba(var(--icr), var(--icg), var(--icb), var(--set-intensity-color-ligth))')
  setProp('--intensityColorMedium', ' rgba(var(--icr), var(--icg), var(--icb), var(--setIntensityColorMedium))')
  setProp('--intensityColorHard', ' rgba(var(--icr), var(--icg), var(--icb), var(--setIntensityColorHard))')
}

App.save = () => {
  localStorage.setItem('Soma Compras', JSON.stringify(App.data))
  App.refresh()
}

App.loadOptions = () => {
  if(!App.data.themeName) App.data.themeName = 'Dark'
  if(!App.data.moneyAvailable) App.data.moneyAvailable = 0

  App.formOptions['money-available'].value = App.data.moneyAvailable
  App.formOptions['list-data'].value = JSON.stringify(App.data.listData)
  App.formOptions['theme-name'].querySelector(`option[value="${App.data.themeName}"]`).selected = true
}

App.refresh = () => {

  App.sumTotal = App.data.listData.reduce((accumulator, { total }) => {
    accumulator = accumulator + total
    return accumulator
  }, 0)

  App.displayValue.innerHTML = formatCurrency(App.sumTotal)

  App.sumList.innerHTML = App.data.listData.map(({ des, total }, index) => `
<hr>
<ul class="item">
<div class="description-item">
  <p>${des}</p>
</div>
<div class="total-item">${formatCurrency(total)}</div>
<div class="percent-item">
  <div class="progress" style="width:${((total / App.sumTotal) * 100).toFixed(0)}%;">
    <div>${((total / App.sumTotal) * 100).toFixed(0)}%</div>
  </div>
</div>
<div class="del-item no-print"><button id="${index}">✗</button></div>
</ul>
`).join('') + '<hr>'

  App.loadOptions()

  App.displayMoney.innerHTML =
    `💰 ${formatCurrency(App.data.moneyAvailable)}<br>
${formatCurrency(App.data.moneyAvailable - App.sumTotal)}
`
  let percentMoneyLast = parseInt(App.percentMoneyCurrent)
  App.percentMoneyCurrent = parseInt(((App.sumTotal / App.data.moneyAvailable) * 100)) || 0

  App.moveProgressBar(percentMoneyLast, App.percentMoneyCurrent)

  if (App.currentItem === 'firstItem') App.currentItem = document.querySelector('.item')
  App.blinkDisplay()

  App.currentItem = null
}

App.moveProgressBar = (startValue, endValue) => {

  startValue = startValue || 0
  endValue = endValue || 0

  App.progressbar.style.width = App.percentMoneyCurrent + '%'

  const id = setInterval(frame, 10)
  let progress = startValue

  function frame() {
    if (startValue < endValue) {
      App.progressbar.querySelector('p').innerHTML = progress + '%'
      progress++
      if (progress > endValue) { clearInterval(id) }
    } else {
      App.progressbar.querySelector('p').innerHTML = progress + '%'
      progress--
      if (progress < endValue) { clearInterval(id) }
    }

    App.displayMoney.classList.remove('progressbar-danger')

    if (progress > 100) {
      App.displayMoney.classList.add('progressbar-danger')
    }
  }
}

App.blinkDisplay = () => {

  let item = App.currentItem
  const display = document.querySelector('#display-value')
  let colorCurrentItem, colorCurrentDisplay

  colorCurrentDisplay = display.style.backgroundColor
  if (item) colorCurrentItem = item.style.backgroundColor

  let id = setTimeout(frame, 300)

  if (item) item.style.backgroundColor = 'rgba(0,100,0,.5)'
  display.style.backgroundColor = 'rgba(0,100,0,.5)'

  function frame() {
    if (item) item.style.backgroundColor = colorCurrentItem
    display.style.backgroundColor = colorCurrentDisplay
  }
}

const isMobile = () => {
  if (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  ) { return true }
  else { return false }
}

App.start()