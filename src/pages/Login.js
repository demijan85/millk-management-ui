import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import {data, useNavigate} from 'react-router-dom'
import { Box, TextField, Button, Typography } from '@mui/material'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async () => {
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            // If login is successful, Supabase automatically stores your session info.
            // Optionally store your own token in localStorage:
            localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))

            // Redirect to dashboard (or "/" if your route is set up that way)
            navigate('/')
        }
    }

    return (
        <Box
            sx={{
                maxWidth: 400,
                margin: '100px auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Typography variant="h5" textAlign="center">Login</Typography>
            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" onClick={handleLogin}>Login</Button>
        </Box>
    )
}
