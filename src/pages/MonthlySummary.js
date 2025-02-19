import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Paper
} from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'
import API_BASE_URL from '../apiConfig'

export default function MonthlySummary() {
    // -----------------------------
    // 1. State for filters
    // -----------------------------
    const [year, setYear] = useState(2025)
    const [month, setMonth] = useState(2)
    const [city, setCity] = useState('')
    const [period, setPeriod] = useState('all')

    // -----------------------------
    // 2. State for data/loading
    // -----------------------------
    const [summaries, setSummaries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // -----------------------------
    // 3. Fetch data from API
    // -----------------------------
    const fetchData = async () => {
        setIsLoading(true)
        setError(null)

        // Build query string
        let url = `${API_BASE_URL}/api/summaries/monthly?year=${year}&month=${month}&period=${period}`
        if (city) {
            url += `&city=${encodeURIComponent(city)}`
        }

        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch monthly summaries')
            }
            const data = await response.json()
            setSummaries(data)
        } catch (err) {
            setError(err.message)
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // -----------------------------
    // 4. UseEffect to load data when filters change
    // -----------------------------
    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month, city, period])

    // -----------------------------
    // 5. Download logic (placeholders)
    // -----------------------------
    const handleDownloadXlsx = async () => {
        try {
            const url = `${API_BASE_URL}/api/summaries/monthly/export?year=${year}&month=${month}&city=${city}&period=${period}`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Export failed.')
            }
            const blob = await response.blob()
            // Create a link and trigger download
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', `monthly_summary_${year}_${month}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export error:', err)
        }
    }

    const handleDownloadReceipts = async () => {
        try {
            const url = `${API_BASE_URL}/api/summaries/monthly/receipts?year=${year}&month=${month}&city=${city}&period=${period}`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Export failed.')
            }
            const blob = await response.blob()
            // Create a link and trigger download
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', `receipts_${year}_${month}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export error:', err)
        }
    }

    // -----------------------------
    // 6. Render
    // -----------------------------
    return (
        <Box sx={{ p: 2 }}>
            {/* Title */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}
            >
                <Typography variant="h5">Monthly Summary</Typography>

                {/* Action buttons (download icons) */}
                <Box>
                    <IconButton onClick={handleDownloadXlsx} sx={{ mr: 1 }}>
                        <GetAppIcon />
                    </IconButton>
                    <IconButton onClick={handleDownloadReceipts}>
                        <GetAppIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Filters */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap', // just in case window is narrow
                    mb: 2
                }}
            >
                {/* Year Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        label="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {/* You can generate dynamic year options or manually list them */}
                        <MenuItem value={2023}>2023</MenuItem>
                        <MenuItem value={2024}>2024</MenuItem>
                        <MenuItem value={2025}>2025</MenuItem>
                    </Select>
                </FormControl>

                {/* Month Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        label="Month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        {/* 1..12 */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Period Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                        label="Period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <MenuItem value="first">first</MenuItem>
                        <MenuItem value="second">second</MenuItem>
                        <MenuItem value="all">all</MenuItem>
                    </Select>
                </FormControl>

                {/* City Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>City</InputLabel>
                    <Select
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        {/* If you want to populate city options dynamically,
                you might fetch distinct city names from the server */}
                        <MenuItem value="Sjenica">Sjenica</MenuItem>
                        <MenuItem value="Komarani">Komarani</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Error Handling */}
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {/* Table or Loading */}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <Paper>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>RB</TableCell>
                                <TableCell>Prezime</TableCell>
                                <TableCell>Ime</TableCell>
                                <TableCell>Količina (L)</TableCell>
                                <TableCell>mm</TableCell>
                                <TableCell>Cena po mm</TableCell>
                                <TableCell>Cena za količinu</TableCell>
                                <TableCell>PDV (%)</TableCell>
                                <TableCell>Cena sa PDV-om (din)</TableCell>
                                <TableCell>Stimulacija (din)</TableCell>
                                <TableCell>Ukupan iznos (din)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summaries.map((item, index) => (
                                <TableRow key={`${item.supplierId}-${index}`}>
                                    <TableCell>{item.serialNum}</TableCell>
                                    <TableCell>{item.lastName}</TableCell>
                                    <TableCell>{item.firstName}</TableCell>
                                    <TableCell>{item.qty}</TableCell>
                                    <TableCell>{item.fatPct.toFixed(1)}</TableCell>
                                    <TableCell>{item.pricePerFatPct}</TableCell>
                                    <TableCell>{item.pricePerQty.toFixed(2)}</TableCell>
                                    <TableCell>{item.taxPercentage.toFixed(2)}</TableCell>
                                    <TableCell>{item.priceWithTax.toFixed(2)}</TableCell>
                                    <TableCell>{item.stimulation}</TableCell>
                                    <TableCell>{item.totalAmount.toFixed(1)}</TableCell>
                                </TableRow>
                            ))}

                            {summaries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Box>
    )
}
