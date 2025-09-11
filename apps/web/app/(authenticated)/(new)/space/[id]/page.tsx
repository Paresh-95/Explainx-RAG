"use client"
import React from 'react'
import Sidebar from '../../_components/sidebar'
import SpaceCreator from '../../_components/space-creator'

function page() {
    return (
        <div className='flex h-screen overflow-hidden'>
            <Sidebar />
            <div className='flex-1 flex flex-col'>
                {/* Full Width Space Creator Container */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="w-full h-full">
                        <SpaceCreator />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page