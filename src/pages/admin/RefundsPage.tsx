import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box
} from '@mui/material';
import { AdminApi } from '../../services/adminApi';
import { RefundStats } from '../../types/admin';

interface RefundDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { transaction_id: number; reason: string; amount?: number }) => void;
    transactionAmount: number;
}

const RefundDialog: React.FC<RefundDialogProps> = ({
    open,
    onClose,
    onSubmit,
    transactionAmount
}) => {
    const [reason, setReason] = useState('');
    const [amount, setAmount] = useState<string>(transactionAmount.toString());

    const handleSubmit = () => {
        onSubmit({
            transaction_id: 0, // À définir selon le contexte
            reason,
            amount: parseFloat(amount)
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Traiter un remboursement</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Montant"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    InputProps={{
                        inputProps: { min: 0, max: transactionAmount }
                    }}
                />
                <TextField
                    margin="dense"
                    label="Raison"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Confirmer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const RefundsPage: React.FC = () => {
    const [refundStats, setRefundStats] = useState<RefundStats[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await AdminApi.getRefundStats({
                    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0]
                });
                setRefundStats(stats);
            } catch (error) {
                console.error('Error fetching refund stats:', error);
            }
        };

        fetchData();
    }, []);

    const handleRefund = async (data: {
        transaction_id: number;
        reason: string;
        amount?: number;
    }) => {
        try {
            await AdminApi.processRefund(data);
            // Rafraîchir les statistiques
            const stats = await AdminApi.getRefundStats({
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
            });
            setRefundStats(stats);
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Gestion des Remboursements
                </Typography>

                {/* Statistiques des remboursements */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Statistiques des remboursements
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type de transaction</TableCell>
                                    <TableCell align="right">Nombre</TableCell>
                                    <TableCell align="right">Montant total</TableCell>
                                    <TableCell align="right">Temps moyen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {refundStats.map((stat) => (
                                    <TableRow key={stat.transaction_type}>
                                        <TableCell>{stat.transaction_type}</TableCell>
                                        <TableCell align="right">{stat.refund_count}</TableCell>
                                        <TableCell align="right">
                                            {stat.refunded_amount.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {Math.round(stat.avg_time_to_refund)} heures
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <RefundDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSubmit={handleRefund}
                    transactionAmount={selectedTransaction?.amount || 0}
                />
            </Paper>
        </Container>
    );
};
