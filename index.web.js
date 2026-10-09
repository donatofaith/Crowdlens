import React from 'react'
import { createRoot } from 'react-dom/client'
import WebApp from './src/web/WebApp'
import './src/web/web.css'

let rootElement = document.getElementById('root')
if (!rootElement) {
  rootElement = document.createElement('div')
  rootElement.id = 'root'
  document.body.appendChild(rootElement)
}
createRoot(rootElement).render(React.createElement(WebApp))
