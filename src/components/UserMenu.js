import React, { useState } from 'react'
import { Menu, MenuItem, IconButton, Avatar } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function UserMenu() {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState(null)

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        handleMenuClose()
        await supabase.auth.signOut()
        // Clear any local auth tokens if stored
        localStorage.removeItem('supabase.auth.token')
        // Redirect to login
        navigate('/login')
    }

    return (
        <>
            <IconButton onClick={handleMenuOpen} size="large" color="inherit">
                <Avatar>
                    {/* You can place the user’s first letter or an icon */}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem disabled>My Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}
