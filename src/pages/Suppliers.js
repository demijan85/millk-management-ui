import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SupplierTable from './SupplierTable'
import SupplierFormDialog from './SupplierFormDialog'

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter by city
    const [selectedCity, setSelectedCity] = useState('')
    const [allCities, setAllCities] = useState([])

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState(null) // 'ADD' or 'EDIT'
    const [currentSupplier, setCurrentSupplier] = useState(null) // data for editing

    useEffect(() => {
        fetchSuppliers()
    }, [])

    // ---------------------------
    // 1) Fetch suppliers
    // ---------------------------
    const fetchSuppliers = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/suppliers')
            const data = await response.json()
            data.sort((a, b) => a.id - b.id) // sort by ID ascending
            setSuppliers(data)

            // Collect distinct cities
            const uniqueCities = [...new Set(data.map((s) => s.city || ''))]
            setAllCities(uniqueCities.sort())
        } catch (err) {
            console.error('Failed to fetch suppliers:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // ---------------------------
    // 2) Filter suppliers by city
    // ---------------------------
    const filteredSuppliers = selectedCity
        ? suppliers.filter((s) => s.city === selectedCity)
        : suppliers

    // ---------------------------
    // 3) Reorder rows (move up/down)
    // ---------------------------
    const handleReorder = (index, direction) => {
        const newSuppliers = [...suppliers]

        if (direction === 'up' && index > 0) {
            ;[newSuppliers[index - 1], newSuppliers[index]] = [
                newSuppliers[index],
                newSuppliers[index - 1]
            ]
        } else if (direction === 'down' && index < newSuppliers.length - 1) {
            ;[newSuppliers[index + 1], newSuppliers[index]] = [
                newSuppliers[index],
                newSuppliers[index + 1]
            ]
        } else {
            return
        }

        setSuppliers(newSuppliers)
        // Optionally: call an API to save new order
    }

    // ---------------------------
    // 4) Delete (invalidate)
    // ---------------------------
    const handleDelete = async (supplierId) => {
        try {
            await fetch(`http://localhost:8080/api/suppliers/${supplierId}`, {
                method: 'DELETE'
            })
            fetchSuppliers()
        } catch (err) {
            console.error('Error invalidating supplier:', err)
        }
    }

    // ---------------------------
    // 5) ADD: open dialog
    // ---------------------------
    const openAddDialog = () => {
        setDialogMode('ADD')
        setCurrentSupplier(null) // clear current data
        setDialogOpen(true)
    }

    // ---------------------------
    // 6) EDIT: open dialog
    // ---------------------------
    const openEditDialog = (supplier) => {
        setDialogMode('EDIT')
        setCurrentSupplier(supplier) // pass existing data
        setDialogOpen(true)
    }

    // ---------------------------
    // 7) Close dialog
    // ---------------------------
    const closeDialog = () => {
        setDialogOpen(false)
    }

    // ---------------------------
    // 8) Save (Add or Edit)
    // ---------------------------
    const handleSaveSupplier = async (supplierData, mode) => {
        try {
            if (mode === 'ADD') {
                // POST
                await fetch('http://localhost:8080/api/suppliers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(supplierData)
                })
            } else if (mode === 'EDIT') {
                // PUT /suppliers/:id
                await fetch(`http://localhost:8080/api/suppliers/${supplierData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(supplierData)
                })
            }
            // Refresh
            await fetchSuppliers()
        } catch (err) {
            console.error('Error saving supplier:', err)
        } finally {
            setDialogOpen(false)
        }
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* Header + "Add" Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Suppliers</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                >
                    Add New Supplier
                </Button>
            </Box>

            {/* Filter by City */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Filter by City</InputLabel>
                    <Select
                        label="Filter by City"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        {allCities.map((city) => (
                            <MenuItem key={city} value={city}>
                                {city}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Table or Loading */}
            {isLoading ? (
                <Typography>Loading...</Typography>
            ) : (
                <SupplierTable
                    suppliers={filteredSuppliers}
                    onReorder={handleReorder}
                    onDelete={handleDelete}
                    onEdit={openEditDialog}
                />
            )}

            {/* Dialog for Add / Edit */}
            <SupplierFormDialog
                open={dialogOpen}
                mode={dialogMode}
                initialData={currentSupplier}
                onClose={closeDialog}
                onSave={handleSaveSupplier}
            />
        </Box>
    )
}
