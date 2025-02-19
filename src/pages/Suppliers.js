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
import API_BASE_URL from "../apiConfig";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedCity, setSelectedCity] = useState('')
    const [allCities, setAllCities] = useState([])

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState(null) // 'ADD' or 'EDIT'
    const [currentSupplier, setCurrentSupplier] = useState(null)

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/suppliers`)
            let data = await response.json()

            // Sort suppliers by orderIndex ascending (or fallback by id if orderIndex is missing)
            data.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))

            setSuppliers(data)

            const uniqueCities = [...new Set(data.map((s) => s.city || ''))]
            setAllCities(uniqueCities.sort())
        } catch (err) {
            console.error('Failed to fetch suppliers:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Filter suppliers by city
    const filteredSuppliers = selectedCity
        ? suppliers.filter((s) => s.city === selectedCity)
        : suppliers

    // --------------------------------------------
    // 3) Reorder in the local state only
    // --------------------------------------------
    const handleReorder = (index, direction) => {
        setSuppliers((prevSuppliers) => {
            const newSuppliers = [...prevSuppliers]

            if (direction === 'up' && index > 0) {
                const temp = newSuppliers[index]
                newSuppliers[index] = newSuppliers[index - 1]
                newSuppliers[index - 1] = temp
            } else if (direction === 'down' && index < newSuppliers.length - 1) {
                const temp = newSuppliers[index]
                newSuppliers[index] = newSuppliers[index + 1]
                newSuppliers[index + 1] = temp
            }

            return newSuppliers
        })
    }

    // --------------------------------------------
    // 4) "Save Order" - bulk update to server
    // --------------------------------------------
    const handleSaveOrder = async () => {
        // Create a minimal payload with { id, orderIndex }
        const reorderPayload = suppliers.map((s, idx) => ({
            id: s.id,
            orderIndex: idx // or idx+1, depending on how you want to store it
        }))

        try {
            await fetch(`${API_BASE_URL}/api/suppliers/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reorderPayload)
            })

            // Optionally refetch
            await fetchSuppliers()
        } catch (err) {
            console.error('Failed to save new order:', err)
        }
    }

    // ... The rest of your CRUD (delete, add, edit, etc.) ...
    const handleDelete = async (supplierId) => {
        try {
            await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
                method: 'DELETE',
            })
            fetchSuppliers()
        } catch (err) {
            console.error('Error invalidating supplier:', err)
        }
    }

    const openAddDialog = () => {
        setDialogMode('ADD')
        setCurrentSupplier(null)
        setDialogOpen(true)
    }

    const openEditDialog = (supplier) => {
        setDialogMode('EDIT')
        setCurrentSupplier(supplier)
        setDialogOpen(true)
    }

    const closeDialog = () => {
        setDialogOpen(false)
    }

    const handleSaveSupplier = async (supplierData, mode) => {
        try {
            if (mode === 'ADD') {
                await fetch(`${API_BASE_URL}/api/suppliers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(supplierData)
                })
            } else if (mode === 'EDIT') {
                await fetch(`${API_BASE_URL}/api/suppliers/${supplierData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(supplierData)
                })
            }
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
                <Typography variant="h5">Poljoprivrednici</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                >
                    Dodaj novog
                </Button>
            </Box>

            {/* Filter by City */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Grad</InputLabel>
                    <Select
                        label="Grad"
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

                {/* "Save Order" button, visible if suppliers exist */}
                {suppliers.length > 1 && (
                    <Button
                        variant="outlined"
                        sx={{ ml: 2 }}
                        onClick={handleSaveOrder}
                    >
                        Sačuvaj redosled
                    </Button>
                )}
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
