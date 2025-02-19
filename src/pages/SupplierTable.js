import React from 'react'
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton
} from '@mui/material'
import { styled } from '@mui/system'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const TableContainer = styled('div')({
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflowX: 'auto'
})

export default function SupplierTable({ suppliers, onReorder, onDelete, onEdit }) {
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>RB</TableCell>
                        <TableCell>Ime</TableCell>
                        <TableCell>Prezime</TableCell>
                        <TableCell>Telefon</TableCell>
                        {/*<TableCell>Email</TableCell>*/}
                        <TableCell>JMBG</TableCell>
                        {/*<TableCell>Agr. No.</TableCell>*/}
                        <TableCell>Broj racuna u banci</TableCell>
                        <TableCell>Ulica</TableCell>
                        <TableCell>Grad</TableCell>
                        <TableCell>Drzava</TableCell>
                        <TableCell>Pozivni broj</TableCell>
                        <TableCell colSpan={3} align="center">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {suppliers.map((supplier, idx) => (
                        <TableRow key={supplier.id}>
                            <TableCell>{supplier.orderIndex + 1}</TableCell>
                            <TableCell>{supplier.firstName}</TableCell>
                            <TableCell>{supplier.lastName}</TableCell>
                            <TableCell>{supplier.phone}</TableCell>
                            {/*<TableCell>{supplier.email}</TableCell>*/}
                            <TableCell>{supplier.jmbg}</TableCell>
                            {/*<TableCell>{supplier.agricultureNumber}</TableCell>*/}
                            <TableCell>{supplier.bankAccount}</TableCell>
                            <TableCell>{supplier.street}</TableCell>
                            <TableCell>{supplier.city}</TableCell>
                            <TableCell>{supplier.country}</TableCell>
                            <TableCell>{supplier.zipCode}</TableCell>

                            {/* Move Up */}
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={() => onReorder(idx, 'up')}
                                    disabled={idx === 0}
                                >
                                    <ArrowUpwardIcon />
                                </IconButton>
                            </TableCell>

                            {/* Move Down */}
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={() => onReorder(idx, 'down')}
                                    disabled={idx === suppliers.length - 1}
                                >
                                    <ArrowDownwardIcon />
                                </IconButton>
                            </TableCell>

                            {/* Edit & Delete */}
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEdit(supplier)}
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(supplier.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}

                    {suppliers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={15} align="center">
                                No suppliers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
