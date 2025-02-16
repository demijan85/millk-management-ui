import React from 'react'
import { Typography, Box } from '@mui/material'

export default function Profile() {
    return (
        <Box>
            <Typography variant="h4">Profile</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Welcome to the profile!
            </Typography>
        </Box>
    )
}
