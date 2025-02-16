import React from 'react'
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Box,
    Typography
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import PersonIcon from '@mui/icons-material/Person'

// A fixed width when expanded, smaller width when collapsed
const SIDEBAR_WIDTH_EXPANDED = 200
const SIDEBAR_WIDTH_COLLAPSED = 60

export default function Sidebar({ collapsed, onToggleCollapse }) {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
                    transition: 'width 0.3s',
                    overflowX: 'hidden'
                }
            }}
        >
            {/* Logo Section */}
            <Box
                onClick={onToggleCollapse}
                sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    p: 2,
                    cursor: 'pointer'
                }}
            >
                {collapsed ? (
                    <Typography variant="h6">Logo</Typography>
                ) : (
                    <>
                        <Typography variant="h6">MyCompany</Typography>
                        {/* Alternatively, you can place your brand logo here */}
                    </>
                )}
            </Box>

            {/* Menu Items */}
            <List>
                <SidebarItem
                    icon={<HomeIcon />}
                    text="Dashboard"
                    collapsed={collapsed}
                    to="/"
                />
                <SidebarItem
                    icon={<PersonIcon />}
                    text="Profile"
                    collapsed={collapsed}
                    to="/profile"
                />
                <SidebarItem
                    icon={<PersonIcon />}
                    text="Suppliers"
                    collapsed={collapsed}
                    to="/suppliers"
                />
                <SidebarItem
                    icon={<PersonIcon />}
                    text="Daily Entry"
                    collapsed={collapsed}
                    to="/daily-entry"
                />
            </List>
        </Drawer>
    )
}

/**
 * A single item in the sidebar.
 * If collapsed, we show only the icon,
 * and on hover, we can show a tooltip with the text.
 */
function SidebarItem({ icon, text, collapsed, to }) {
    return (
        <Tooltip title={collapsed ? text : ''} placement="right">
            <ListItemButton
                sx={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 2 : 3
                }}
                onClick={() => {
                    // navigate to route (if using react-router)
                    window.location.href = to
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: collapsed ? 'auto' : 2,
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={text} />}
            </ListItemButton>
        </Tooltip>
    )
}
