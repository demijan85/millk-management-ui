import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, CssBaseline } from '@mui/material'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function MainLayout() {
    // State to track whether sidebar is collapsed
    const [collapsed, setCollapsed] = useState(false)

    const handleToggleSidebar = () => {
        setCollapsed((prev) => !prev)
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Sidebar collapsed={collapsed} onToggleCollapse={handleToggleSidebar} />
            <Box sx={{ flexGrow: 1 }}>
                <Topbar onToggleSidebar={handleToggleSidebar} />
                {/* The main content area (Outlet from react-router) */}
                <Box component="main" sx={{ p: 2 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}
