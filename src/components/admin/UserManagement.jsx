import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Pagination,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

export const UserManagement = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, isLoading } = useQuery(
        ['users', page, search],
        () => fetch(`/api/admin/users?page=${page}&size=10&search=${search}`).then(res => res.json())
    );

    const updateRoleMutation = useMutation(
        (data) => fetch(`/api/admin/users/${data.userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json()),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['users']);
                setAnchorEl(null);
            },
        }
    );

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleRoleChange = (newRole) => {
        if (selectedUser) {
            updateRoleMutation.mutate({
                userId: selectedUser.userId,
                role: newRole,
            });
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Box>
            <Box mb={2}>
                <TextField
                    fullWidth
                    label={t('admin.users.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="outlined"
                    size="small"
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('admin.users.name')}</TableCell>
                            <TableCell>{t('admin.users.email')}</TableCell>
                            <TableCell>{t('admin.users.role')}</TableCell>
                            <TableCell>{t('admin.users.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.content?.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={(e) => handleMenuClick(e, user)}
                                        size="small"
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                    count={data?.totalPages || 1}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleRoleChange('USER')}>
                    {t('admin.users.setUser')}
                </MenuItem>
                <MenuItem onClick={() => handleRoleChange('ADMIN')}>
                    {t('admin.users.setAdmin')}
                </MenuItem>
            </Menu>
        </Box>
    );
}; 