import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Container
} from '@mui/material';
import MonitoringDashboard from '../../components/admin/MonitoringDashboard';
import AlertsManager from '../../components/admin/AlertsManager';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`monitoring-tabpanel-${index}`}
            aria-labelledby={`monitoring-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MonitoringPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth={false}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="monitoring tabs"
                >
                    <Tab label="Tableau de Bord" />
                    <Tab label="Gestion des Alertes" />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <MonitoringDashboard />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <AlertsManager />
            </TabPanel>
        </Container>
    );
};

export default MonitoringPage;
