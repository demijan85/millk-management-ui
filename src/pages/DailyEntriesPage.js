import React, { useEffect, useState, useMemo } from 'react'
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'

// =============== Utilities ===============
function getDaysInMonth(year, month) {
    // month is 1-based
    return new Date(year, month, 0).getDate()
}

function makeDateString(year, month, day) {
    // "YYYY-MM-DD"
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
}

function isSameYearMonth(dateStr, year, month) {
    const y = Number(dateStr.slice(0, 4))
    const m = Number(dateStr.slice(5, 7))
    return y === year && m === month
}

function getDefaultPeriod(currentDay) {
    return currentDay <= 15 ? 'FIRST_HALF' : 'SECOND_HALF'
}

function buildYearOptions() {
    const current = new Date().getFullYear()
    const arr = []
    for (let y = current - 2; y <= current + 1; y++) arr.push(y)
    return arr
}

function buildMonthOptions() {
    return [
        { value: 1, label: 'Jan' },
        { value: 2, label: 'Feb' },
        { value: 3, label: 'Mar' },
        { value: 4, label: 'Apr' },
        { value: 5, label: 'May' },
        { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' },
        { value: 8, label: 'Aug' },
        { value: 9, label: 'Sep' },
        { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' },
        { value: 12, label: 'Dec' }
    ]
}

// =============== Cell Editor ===============
const CellInput = React.memo(function CellInput({
                                                    supplierId,
                                                    day,
                                                    initialValue,
                                                    onCellChange,
                                                    hasQuality // if true => highlight or show an icon
                                                }) {
    const [value, setValue] = useState(initialValue || '')

    useEffect(() => {
        setValue(initialValue || '')
    }, [initialValue])

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.target.blur()
        }
    }

    function handleBlur() {
        if (value !== (initialValue || '')) {
            onCellChange(supplierId, day, value)
        }
    }

    // Optional styling if there's a quality measurement for this day
    const cellStyle = {
        width: '50px',
        textAlign: 'center',
        fontSize: '0.8rem',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '2px',
        backgroundColor: hasQuality ? '#fff8cc' : '#fff' // light yellow if hasQuality
    }

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={cellStyle}
            />
            {hasQuality && (
                <InfoIcon
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        fontSize: '0.9rem',
                        color: '#999'
                    }}
                    titleAccess="This day has a quality measurement"
                />
            )}
        </div>
    )
})

export default function DailyEntriesPage() {
    // ------------- FILTERS -------------
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [period, setPeriod] = useState(getDefaultPeriod(now.getDate()))

    // ------------- DATA -------------
    const [suppliers, setSuppliers] = useState([])
    const [dailyEntries, setDailyEntries] = useState([]) // server data
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // ------------- CHANGES -------------
    // For a bulk save, we store all changed cells here.
    const [changes, setChanges] = useState({})

    // ------------- QUALITY DIALOG -------------
    const [qualityDialogOpen, setQualityDialogOpen] = useState(false)
    const [qualitySupplier, setQualitySupplier] = useState(null)
    const [qualityEntries, setQualityEntries] = useState([])

    useEffect(() => {
        fetchData(year, month)
    }, [year, month])

    async function fetchData(y, m) {
        setLoading(true)
        setError(null)
        try {
            const [supRes, dailyRes] = await Promise.all([
                fetch('http://localhost:8080/api/suppliers'),
                fetch(`http://localhost:8080/api/daily-entries?year=${y}&month=${m}`)
            ])
            if (!supRes.ok) throw new Error('Failed to fetch suppliers')
            if (!dailyRes.ok) throw new Error('Failed to fetch daily entries')

            const supData = await supRes.json()
            const dailyData = await dailyRes.json()

            setSuppliers(supData)
            setDailyEntries(dailyData)
            setChanges({})
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Days to show (period-based)
    const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month])
    const daysToShow = useMemo(() => {
        if (period === 'FIRST_HALF') {
            return [...Array(Math.min(15, daysInMonth))].map((_, i) => i + 1)
        } else if (period === 'SECOND_HALF') {
            const arr = []
            for (let d = 16; d <= daysInMonth; d++) arr.push(d)
            return arr
        } else {
            return [...Array(daysInMonth)].map((_, i) => i + 1)
        }
    }, [daysInMonth, period])

    // Original quantity from dailyEntries
    function getOriginalQty(supplierId, day) {
        const dateStr = makeDateString(year, month, day)
        const entry = dailyEntries.find(
            (e) => e.supplierId === supplierId && e.date === dateStr
        )
        return entry?.qty ?? 0
    }

    // Effective cell value (changes override original)
    function getCellValue(supplierId, day) {
        const changedVal = changes[supplierId]?.[day]
        if (changedVal !== undefined) {
            return parseFloat(changedVal) || 0
        }
        return getOriginalQty(supplierId, day)
    }

    // Mark a cell changed
    function handleCellChange(supplierId, day, newValue) {
        setChanges((prev) => ({
            ...prev,
            [supplierId]: {
                ...(prev[supplierId] || {}),
                [day]: newValue
            }
        }))
    }

    // Row totals, column totals, grand total
    const { rowTotals, columnTotals, grandTotal } = useMemo(() => {
        const rowTotals = {}
        const columnTotals = {}
        let grandTotal = 0

        for (let sup of suppliers) {
            let rowSum = 0
            for (let day of daysToShow) {
                const val = getCellValue(sup.id, day)
                rowSum += val
                columnTotals[day] = (columnTotals[day] || 0) + val
            }
            rowTotals[sup.id] = rowSum
            grandTotal += rowSum
        }

        return { rowTotals, columnTotals, grandTotal }
        // eslint-disable-next-line
    }, [suppliers, dailyEntries, changes, daysToShow])

    // Average Quality per row (for selected days only)
    function getAverageFatPct(supplierId) {
        const relevantDays = new Set(daysToShow)
        const arr = dailyEntries.filter((e) => {
            if (e.supplierId !== supplierId || e.fatPct == null) return false
            const dayNum = Number(e.date.slice(-2))
            return relevantDays.has(dayNum)
        })
        if (arr.length === 0) return ''
        const sum = arr.reduce((acc, e) => acc + e.fatPct, 0)
        const avg = sum / arr.length
        return avg.toFixed(2)
    }

    // Whether there's quality in a given cell
    function hasQuality(supplierId, day) {
        const dateStr = makeDateString(year, month, day)
        return dailyEntries.some(
            (e) => e.supplierId === supplierId && e.date === dateStr && e.fatPct != null
        )
    }

    // Bulk Save
    async function handleBulkSave() {
        // Build array of changes
        const upserts = []
        for (const supIdStr of Object.keys(changes)) {
            const supId = parseInt(supIdStr, 10)
            for (const dayStr of Object.keys(changes[supIdStr])) {
                const newVal = parseFloat(changes[supIdStr][dayStr]) || 0
                const dayNum = parseInt(dayStr, 10)
                const originalVal = getOriginalQty(supId, dayNum)
                if (newVal !== originalVal) {
                    upserts.push({
                        date: makeDateString(year, month, dayNum),
                        qty: newVal,
                        supplierId: supId
                    })
                }
            }
        }

        if (upserts.length === 0) {
            alert('No changes to save!')
            return
        }

        try {
            await fetch('http://localhost:8080/api/daily-entries/bulk-upsert', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(upserts)
            })
            await fetchData(year, month)
            alert('Saved successfully!')
        } catch (err) {
            console.error('Bulk save error:', err)
            alert('Failed to save changes.')
        }
    }

    // Discard Changes
    function handleDiscardChanges() {
        setChanges({})
    }

    // Should we show Save/Discard?
    const hasAnyChanges = useMemo(() => {
        // If any supplier has at least one changed day
        return Object.keys(changes).some((supId) => {
            return Object.keys(changes[supId]).length > 0
        })
    }, [changes])

    // Quality dialog
    function openQualityDialog(supplier) {
        setQualitySupplier(supplier)
        const filtered = dailyEntries
            .filter(
                (e) =>
                    e.supplierId === supplier.id &&
                    isSameYearMonth(e.date, year, month) &&
                    e.fatPct != null
            )
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((f) => ({ id: f.id, date: f.date, fatPct: f.fatPct }))
        setQualityEntries(filtered)
        setQualityDialogOpen(true)
    }

    function closeQualityDialog() {
        setQualityDialogOpen(false)
        setQualitySupplier(null)
        setQualityEntries([])
    }

    function handleAddQualityEntry() {
        const firstDay = daysToShow[0] || 1
        setQualityEntries((prev) => [
            ...prev,
            { id: null, date: makeDateString(year, month, firstDay), fatPct: 3.2 }
        ])
    }

    function handleQualityChange(idx, field, val) {
        setQualityEntries((prev) => {
            const copy = [...prev]
            copy[idx] = { ...copy[idx], [field]: val }
            return copy
        })
    }

    function handleRemoveQualityEntry(idx) {
        setQualityEntries((prev) => prev.filter((_, i) => i !== idx))
    }

    async function handleSaveQuality() {
        if (!qualitySupplier) return

        const existingFatPct = dailyEntries.filter(
            (e) =>
                e.supplierId === qualitySupplier.id &&
                isSameYearMonth(e.date, year, month) &&
                e.fatPct != null
        )
        const existingIds = new Set(existingFatPct.map((x) => x.id))
        const finalIds = new Set(qualityEntries.filter((q) => q.id).map((q) => q.id))
        const removedIds = [...existingIds].filter((id) => !finalIds.has(id))

        try {
            // delete removed
            for (let rid of removedIds) {
                await fetch(`http://localhost:8080/api/daily-entries/${rid}`, {
                    method: 'DELETE'
                })
            }
            // upsert
            for (let q of qualityEntries) {
                const body = {
                    id: q.id,
                    date: q.date,
                    supplierId: qualitySupplier.id,
                    fatPct: parseFloat(q.fatPct) || 0
                }
                await fetch('http://localhost:8080/api/daily-entries/upsert', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
        } catch (err) {
            console.error('Saving quality error:', err)
        }
        await fetchData(year, month)
        closeQualityDialog()
    }

    // Render
    if (loading) return <Box p={2}>Loading...</Box>
    if (error) return <Box p={2} color="red">Error: {error}</Box>

    return (
        <Box p={1}>
            <Typography variant="h6" mb={1}>
                Monthly Milk Collection
            </Typography>

            {/* Filters & Buttons */}
            <Box display="flex" gap={2} mb={1} alignItems="center">
                <FormControl size="small">
                    <InputLabel>Year</InputLabel>
                    <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                        {buildYearOptions().map((y) => (
                            <MenuItem key={y} value={y}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small">
                    <InputLabel>Month</InputLabel>
                    <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                        {buildMonthOptions().map((m) => (
                            <MenuItem key={m.value} value={m.value}>
                                {m.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                        <MenuItem value="FIRST_HALF">First Half</MenuItem>
                        <MenuItem value="SECOND_HALF">Second Half</MenuItem>
                        <MenuItem value="FULL">Full Month</MenuItem>
                    </Select>
                </FormControl>

                {/* Only show Save/Discard if we have changes */}
                {hasAnyChanges && (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={handleBulkSave}
                        >
                            Save All
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<ClearIcon />}
                            onClick={handleDiscardChanges}
                        >
                            Discard
                        </Button>
                    </>
                )}
            </Box>

            {/* Main Table */}
            <Table size="small" sx={{ '& th, & td': { padding: '4px' } }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Supplier</TableCell>
                        {daysToShow.map((day) => (
                            <TableCell key={day} align="center" sx={{ minWidth: '50px' }}>
                                {day}
                            </TableCell>
                        ))}
                        <TableCell align="right" sx={{ minWidth: '60px' }}>
                            Row Total
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: '60px' }}>
                            Avg Fat%
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: '80px' }}>
                            Quality
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {suppliers.map((sup) => {
                        const rowTotal = rowTotals[sup.id] || 0
                        const avgFat = getAverageFatPct(sup.id)
                        return (
                            <TableRow key={sup.id}>
                                <TableCell>
                                    {sup.firstName} {sup.lastName}
                                </TableCell>
                                {daysToShow.map((day) => {
                                    const originalVal = getOriginalQty(sup.id, day).toString() || ''
                                    const changedVal = changes[sup.id]?.[day]
                                    const displayVal = changedVal !== undefined ? changedVal : originalVal
                                    const cellHasQuality = hasQuality(sup.id, day)
                                    return (
                                        <TableCell key={day} align="center">
                                            <CellInput
                                                supplierId={sup.id}
                                                day={day}
                                                initialValue={displayVal}
                                                onCellChange={handleCellChange}
                                                hasQuality={cellHasQuality}
                                            />
                                        </TableCell>
                                    )
                                })}
                                {/* Row total */}
                                <TableCell align="right" style={{ fontWeight: 'bold' }}>
                                    {rowTotal.toFixed(2)}
                                </TableCell>
                                {/* Average Quality */}
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>
                                    {avgFat}
                                </TableCell>
                                {/* Edit Quality */}
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => openQualityDialog(sup)}
                                    >
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {suppliers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={daysToShow.length + 3} align="center">
                                No suppliers found.
                            </TableCell>
                        </TableRow>
                    )}
                    {/* Totals row */}
                    {suppliers.length > 0 && (
                        <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                            <TableCell style={{ fontWeight: 'bold' }}>Column Totals</TableCell>
                            {daysToShow.map((day) => (
                                <TableCell key={day} align="center" style={{ fontWeight: 'bold' }}>
                                    {columnTotals[day]?.toFixed(2) ?? '0.00'}
                                </TableCell>
                            ))}
                            {/* Grand total */}
                            <TableCell align="right" style={{ fontWeight: 'bold' }}>
                                {grandTotal.toFixed(2)}
                            </TableCell>
                            {/* no average in totals row */}
                            <TableCell />
                            <TableCell />
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* QUALITY DIALOG */}
            {qualityDialogOpen && qualitySupplier && (
                <Dialog
                    open={qualityDialogOpen}
                    onClose={closeQualityDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Edit Quality for {qualitySupplier.firstName} {qualitySupplier.lastName}
                    </DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            {qualityEntries.map((qe, idx) => (
                                <Box key={idx} display="flex" gap={2} alignItems="center">
                                    <TextField
                                        type="date"
                                        label="Date"
                                        size="small"
                                        value={qe.date}
                                        onChange={(e) => handleQualityChange(idx, 'date', e.target.value)}
                                        sx={{ width: '150px' }}
                                    />
                                    <TextField
                                        label="Fat %"
                                        size="small"
                                        type="number"
                                        value={qe.fatPct}
                                        onChange={(e) => handleQualityChange(idx, 'fatPct', e.target.value)}
                                        sx={{ width: '80px' }}
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveQualityEntry(idx)}
                                    >
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button variant="outlined" onClick={handleAddQualityEntry}>
                                Add Entry
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeQualityDialog}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveQuality}>Save</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    )
}
