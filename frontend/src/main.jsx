import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1A1A27',
                        color: '#F8F8FF',
                        border: '1px solid rgba(108, 53, 222, 0.3)',
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.9rem',
                    },
                    success: {
                        iconTheme: { primary: '#10B981', secondary: '#1A1A27' }
                    },
                    error: {
                        iconTheme: { primary: '#EF4444', secondary: '#1A1A27' }
                    }
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
)
