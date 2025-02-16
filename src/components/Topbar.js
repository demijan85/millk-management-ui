import React from 'react'
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import UserMenu from './UserMenu'
import MenuIcon from '@mui/icons-material/Menu'

export default function Topbar({ onToggleSidebar }) {
    return (
        <AppBar position="static" sx={{ zIndex: 1201 /* above the Drawer */ }}>
            <Toolbar>
                <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={onToggleSidebar}>
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Zlatarka - zlatna kap u moru mleka!
                </Typography>

                {/* User menu on the right side */}
                <Box>
                    <UserMenu />
                </Box>
            </Toolbar>
        </AppBar>
    )
}
