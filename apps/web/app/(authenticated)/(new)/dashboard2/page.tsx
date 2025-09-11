import React from 'react'
import Sidebar from '../_components/sidebar'
import ChatInterface from '../_components/chat-textbox'

function page() {
    return (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                {/* Main content goes here */}
                <ChatInterface />
            </div>
        </div>
    )
}

export default page