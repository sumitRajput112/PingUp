import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import {Provider} from 'react-redux'
import { store } from './app/store.js'
import { clerkAppearance } from './configs/clerkAppearance.js'
import { ui } from '@clerk/ui'



createRoot(document.getElementById('root')).render(
    <ClerkProvider appearance={clerkAppearance} ui={ui}>
        <BrowserRouter>
            <Provider store={store}>
                 <App />
            </Provider>  
        </BrowserRouter>
    </ClerkProvider>

)
