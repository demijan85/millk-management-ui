// src/pages/SupplierFormDialog.js
import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box
} from '@mui/material'

export default function SupplierFormDialog({
                                               open,
                                               mode,
                                               initialData,
                                               onClose,
                                               onSave
                                           }) {
    // If editing, populate with initialData; if adding, start empty
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        jmbg: '',
        agricultureNumber: '',
        bankAccount: '',
        street: '',
        city: '',
        country: '',
        zipCode: ''
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            // If adding, reset to empty
            setFormData({
                id: '',
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                jmbg: '',
                agricultureNumber: '',
                bankAccount: '',
                street: '',
                city: '',
                country: '',
                zipCode: ''
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {
        // Call the parent's onSave
        onSave(formData, mode)
    }

    const dialogTitle = mode === 'EDIT' ? 'Edit Supplier' : 'Add New Supplier'

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* ID is only relevant if editing (could be read-only) */}
                    {mode === 'EDIT' && (
                        <TextField
                            label="ID"
                            name="id"
                            value={formData.id}
                            InputProps={{ readOnly: true }}
                        />
                    )}

                    <TextField
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        label="JMBG"
                        name="jmbg"
                        value={formData.jmbg}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Agriculture Number"
                        name="agricultureNumber"
                        value={formData.agricultureNumber}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Bank Account"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                    />
                    <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Zip Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
