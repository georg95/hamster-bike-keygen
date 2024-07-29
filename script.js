// ==UserScript==
// @name        Hamster bike keygen
// @version     1.1
// @homepageURL https://github.com/georg95/hamster-bike-keygen/blob/main/README.md
// @downloadURL https://georg95.github.io/hamster-bike-keygen/script.js
// @author      georg95
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceURL
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// @resource    BACKGROUND https://georg95.github.io/hamster-bike-keygen/keygen_bg.jpg
// @resource    MUSIC https://georg95.github.io/hamster-bike-keygen/ICU%20-%20CrackMe%20v0.2.mp3
// @noframes
// ==/UserScript==

const APP_TOKEN = 'd28721be-fd2d-4b45-869e-9f253b554e50'
const PROMO_ID = '43e35910-c168-4634-ad4f-52fd764a843f'

const DEBUG_MODE = false
const EVENTS_DELAY = DEBUG_MODE ? 350 : 20000

addButton()

function addButton() {
  const btn = document.createElement('button')
  btn.style.width = '100px'
  btn.style.height = '100px'
  btn.onclick = start
  btn.style.position = 'absolute'
  btn.style.zIndex = 99999999
  btn.style.top = '10px'
  btn.style.right = '10px'
  btn.innerText = '🚲'
  btn.style.fontSize = '64px'
  document.body.appendChild(btn)
}

function initProgress(keyText) {
  const delays = 6
  const progressPerDelay = 20
  let totalProgress = progressPerDelay * delays
  let emojiFlip = false
  keyText.innerText = `${emojiFlip ? '⏳' : '⌛'}0%`
  let curProgress = 0
  async function progressDelay(unexpected) {
    if (unexpected) {
      totalProgress += progressPerDelay
    }
    const delay = EVENTS_DELAY * delayRandom()
    const delayInterval = delay / progressPerDelay
    for (let i = 0; i < progressPerDelay; i++) {
      keyText.innerText = `${emojiFlip ? '⏳' : '⌛'}${Math.round(curProgress / totalProgress * 100)}%`
      curProgress++
      emojiFlip = !emojiFlip
      await sleep(delayInterval)
    }
  }

  return progressDelay
}

async function start() {
  const CLIENT_ID = localStorage.getItem('3dRaceClientID') || generateClientId()
  localStorage.setItem('3dRaceClientID', CLIENT_ID)
  console.log('clientId', CLIENT_ID)
  const { keyText, copyBtn, nextBtn, buttons } = createLayout()

  const keyTextOriginalSize = keyText.style.fontSize
  nextBtn.onclick = () => {
    keyText.style.fontSize = keyTextOriginalSize
    keygen().catch(onKeygenFail)
    buttons.removeChild(nextBtn)
  }
  async function keygen() {
    const token = await login(CLIENT_ID)
    const progressDelay = initProgress(keyText)
    console.log('login, token:', token)
    for (let i = 0; i < 7; i++) {
      await progressDelay(i >= 5)
      const hasCode = await emulateProgess(token)
      console.log('emulate progress...', hasCode)
      if (hasCode) {
        break
      }
    }
    await progressDelay()
    const key = await generateKey(token)
    console.log('key:', key)
    keyText.innerText = key
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(key)
      const copyBtnDefaultText = copyBtn.innerText
      copyBtn.innerText = '✅'
      setTimeout(() => copyBtn.innerText = copyBtnDefaultText, 1500)
    }

    buttons.innerHTML = ''
    buttons.appendChild(copyBtn)
    buttons.appendChild(nextBtn)
  }
  function onKeygenFail(e) {
    keyText.style.fontSize = '12px'
    keyText.innerText = e.toString()
    buttons.innerHTML = ''
    buttons.appendChild(nextBtn)
  }
  await keygen().catch(onKeygenFail)
}

function createLayout() {
  document.body.innerHTML = ''

  const container = document.createElement('div')

  container.style.display = 'flex'
  container.style.fontFamily = 'monospace'
  container.style.alignItems = 'flex-end'
  container.style.boxSizing = 'border-box'
  container.style.position = 'absolute'
  container.style.top = '0px'
  container.style.right = '0px'
  container.style.margin = '0'
  container.style.padding = '0'
  const layoutWidth = Math.min(window.innerWidth, 768)
  const layoutHeight = Math.min(window.innerHeight, 768)
  container.style.width = `${layoutWidth}px`
  container.style.height = `${layoutHeight}px`
  container.style.background = 'url('+GM_getResourceURL('BACKGROUND')+')'
  container.style.backgroundPosition = 'center'
  container.style.backgroundSize = 'cover'

  const overlay = document.createElement('div')

  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.style.width = '100%'
  overlay.style.margin = '0'
  overlay.style.padding = '0 0 30px 0'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.background = 'rgba(0, 0, 0, 0.6)'
  overlay.style.backgroundSize = 'cover'

  const keyText = document.createElement('div')
  keyText.style.margin = '20px 0'
  keyText.style.padding = '0'
  keyText.style.background = 'none'
  keyText.innerText = '⏳⏳⏳'
  keyText.style.color = 'white'
  keyText.style.fontSize = `${Math.min(Math.floor(layoutWidth / 16))}px`

  const buttons = document.createElement('div')
  buttons.style.background = 'none'
  buttons.style.display = 'flex'
  buttons.style.margin = '0'
  buttons.style.padding = '0'

  const copyBtn = document.createElement('button')
  copyBtn.style.width = '50px'
  copyBtn.style.height = '50px'
  copyBtn.style.fontSize = '25px'
  copyBtn.style.marginRight = '20px'
  copyBtn.innerText = '📋'

  const nextBtn = document.createElement('button')
  nextBtn.style.width = '50px'
  nextBtn.style.height = '50px'
  nextBtn.style.fontSize = '25px'
  nextBtn.innerText = '↻'

  const musicBtn = document.createElement('button')
  musicBtn.style.width = '40px'
  musicBtn.style.height = '40px'
  musicBtn.style.position = 'absolute'
  musicBtn.style.zIndex = 99999999
  musicBtn.style.top = '10px'
  musicBtn.style.right = '10px'
  musicBtn.style.border = 'none'
  musicBtn.style.background = 'none'
  musicBtn.style.fontSize = '32px'

  overlay.appendChild(keyText)
  overlay.appendChild(buttons)
  container.appendChild(musicBtn)
  container.appendChild(overlay)
  document.body.appendChild(container)
  try {
    const audio = new Audio(GM_getResourceURL('MUSIC'))
    audio.loop = true
    function switchAudio() {
      if (audio.paused) {
        musicBtn.innerText = '🔊'
        audio.play()
        GM_setValue('sound', true)
      } else {
        musicBtn.innerText = '🔇'
        audio.pause()
        GM_setValue('sound', false)
      }
    }

    const soundOn = GM_getValue('sound', true)
    musicBtn.innerText = soundOn ? '🔊' : '🔇'
    if (soundOn) {
      switchAudio()
    }
    musicBtn.onclick = switchAudio
  } catch(e) {
    console.error(e)
  }
  return { keyText, copyBtn, nextBtn, buttons }
}


function delayRandom() {
  return (Math.random()/3 + 1)
}

async function login(clientId) {
    if(!clientId) { throw new Error('no client id') }
    if (DEBUG_MODE) {
      return 'd28721be-fd2d-4b45-869e-9f253b554e50:deviceid:1722266117413-8779883520062908680:8B5BnSuEV2W:1722266117478'
    }
    const { clientToken } = await vmFetch('https://api.gamepromo.io/promo/login-client', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io'
        },
        method: 'POST',
        body: {
            appToken: APP_TOKEN,
            clientId: clientId,
            clientOrigin: 'deviceid'
        }
    })
    return clientToken
}

const attempts = {}
async function emulateProgess(clientToken) {
    if(!clientToken) { throw new Error('no access token') }
    if (DEBUG_MODE) {
      attempts[clientToken] = (attempts[clientToken] || 0) + 1
      return attempts[clientToken] >= 5
    }
    const { hasCode } = await vmFetch('https://api.gamepromo.io/promo/register-event', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        body: {
            promoId: PROMO_ID,
            eventId: crypto.randomUUID(),
            eventOrigin: 'undefined'
        }
    })
    return hasCode
}

async function generateKey(clientToken) {
    if (DEBUG_MODE) {
      if (attempts[clientToken] >= 5) {
        return 'BIKE-3YD-5ZA6-3VJA-Y77'
      } else {
        return ''
      }
    }
    const { promoCode } = await vmFetch('https://api.gamepromo.io/promo/create-code', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        body: {
            promoId: PROMO_ID
        }
    })
    return promoCode
}

async function vmFetch(url, options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method,
      url: url,
      headers: options.headers,
      data: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      responseType: 'json',
      onload: response => {
        try {
          console.log(response.responseText)
          resolve(JSON.parse(response.responseText))
        } catch(e) {reject(e)}
      },
      onerror: response => {
        reject(response)
      },
    })
  })
}
async function sleep(ms) {
    return new Promise(res => setTimeout(res, ms))
}
function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}
