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
    Paper,
    CircularProgress
} from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'
import API_BASE_URL from '../apiConfig'

export default function QuarterlySummary() {
    // -------------------------------------
    // 1) Filters: year & quarter
    // -------------------------------------
    const [year, setYear] = useState(2025)
    const [quarter, setQuarter] = useState(1)

    // -------------------------------------
    // 2) Data state
    // -------------------------------------
    const [summaries, setSummaries] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // -------------------------------------
    // 3) Fetch data from /summaries/quarterly
    // -------------------------------------
    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/summaries/quarterly?year=${year}&quarter=${quarter}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch quarterly summaries')
            }
            const data = await response.json()
            setSummaries(data)
        } catch (err) {
            setError(err.message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Trigger fetch whenever year/quarter changes
    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, quarter])

    // -------------------------------------
    // 4) Handle XLSX Export (placeholder)
    // -------------------------------------
    const handleExportXlsx = async () => {
        try {
            const url = `${API_BASE_URL}/api/summaries/quarterly/export?year=${year}&quarter=${quarter}`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Export failed.')
            }
            const blob = await response.blob()
            // Create a link and trigger download
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', `quarterly_summary_${year}_${quarter}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export error:', err)
        }
    }

    // -------------------------------------
    // 5) Calculate footer totals
    // -------------------------------------
    const totalQty = summaries.reduce((acc, cur) => acc + (cur.qty || 0), 0)
    const totalCows = summaries.reduce((acc, cur) => acc + (cur.cows || 0), 0)
    const totalPremiumPerL = summaries.reduce((acc, cur) => acc + (cur.premiumPerL || 0), 0)
    const totalPremium = summaries.reduce((acc, cur) => acc + (cur.totalPremium || 0), 0)

    // -------------------------------------
    // 6) Render
    // -------------------------------------
    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}
            >
                <Typography variant="h5">Quarterly Summary</Typography>

                {/* Icon to Export XLSX */}
                <IconButton onClick={handleExportXlsx}>
                    <GetAppIcon />
                </IconButton>
            </Box>

            {/* Filters: Year, Quarter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        label="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <MenuItem value={2023}>2023</MenuItem>
                        <MenuItem value={2024}>2024</MenuItem>
                        <MenuItem value={2025}>2025</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Quarter</InputLabel>
                    <Select
                        label="Quarter"
                        value={quarter}
                        onChange={(e) => setQuarter(e.target.value)}
                    >
                        <MenuItem value={1}>Q1</MenuItem>
                        <MenuItem value={2}>Q2</MenuItem>
                        <MenuItem value={3}>Q3</MenuItem>
                        <MenuItem value={4}>Q4</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Error or Loading indicator */}
            {error && <Typography color="error">{error}</Typography>}
            {loading ? (
                <CircularProgress />
            ) : (
                <Paper>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>RB</TableCell>
                                <TableCell>Prezime</TableCell>
                                <TableCell>Ime</TableCell>
                                <TableCell>Količina</TableCell>
                                <TableCell>Broj krava</TableCell>
                                <TableCell>Premija</TableCell>
                                <TableCell>Ukupan iznos premije</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {summaries.map((row, idx) => (
                                <TableRow key={row.supplierId || idx}>
                                    <TableCell>{row.serialNum}</TableCell>
                                    <TableCell>{row.lastName}</TableCell>
                                    <TableCell>{row.firstName}</TableCell>
                                    <TableCell>{row.qty}</TableCell>
                                    <TableCell>{row.cows}</TableCell>
                                    <TableCell>{row.premiumPerL}</TableCell>
                                    <TableCell>{row.totalPremium}</TableCell>
                                </TableRow>
                            ))}

                            {summaries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Footer Row with Totals */}
                            {summaries.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                        Totals:
                                    </TableCell>

                                    {/* totalQty */}
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {totalQty.toFixed(2)}
                                    </TableCell>

                                    {/* totalCows */}
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {totalCows}
                                    </TableCell>

                                    {/* totalPremiumPerL (sum) */}
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {totalPremiumPerL.toFixed(2)}
                                    </TableCell>

                                    {/* totalPremium */}
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {totalPremium.toFixed(2)}
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
