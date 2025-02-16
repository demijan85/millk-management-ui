import React from 'react'
import { Typography, Box } from '@mui/material'

export default function Dashboard() {
    return (
        <Box>
            <Typography variant="h4">Dashboard</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Welcome to the dashboard!
            </Typography>
        </Box>
    )
}
