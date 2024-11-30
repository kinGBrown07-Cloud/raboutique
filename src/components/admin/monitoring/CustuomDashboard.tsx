import React, { useState, useEffect } from 'react';
import { Grid, Paper, Button, Typography, Box, IconButton } from '@mui/material';
import { GridLayout, Responsive, WidthProvider } from 'react-grid-layout';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
    id: number;
    type: 'chart' | 'counter' | 'alert';
    title: string;
    metric: string;
    layout: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

interface Dashboard {
    id: number;
    name: string;
    widgets: Widget[];
}

const CustomDashboard: React.FC = () => {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
    const [widgetData, setWidgetData] = useState<Record<number, any>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Charger les tableaux de bord
        fetchDashboards();
        
        // Établir la connexion WebSocket
        const websocket = new WebSocket('ws://localhost:3000');
        websocket.onmessage = handleWebSocketMessage;
        setWs(websocket);

        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, []);

    const fetchDashboards = async () => {
        try {
            const response = await axios.get('/api/monitoring/dashboards');
            setDashboards(response.data);
            if (response.data.length > 0) {
                setCurrentDashboard(response.data[0]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des tableaux de bord:', error);
        }
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'metric_update') {
            updateWidgetData(data.widgetId, data.value);
        }
    };

    const updateWidgetData = (widgetId: number, newData: any) => {
        setWidgetData(prev => ({
            ...prev,
            [widgetId]: newData
        }));
    };

    const handleLayoutChange = async (layout: any) => {
        if (!currentDashboard || !isEditing) return;

        const updatedWidgets = currentDashboard.widgets.map(widget => {
            const newLayout = layout.find((l: any) => l.i === widget.id.toString());
            return {
                ...widget,
                layout: {
                    x: newLayout.x,
                    y: newLayout.y,
                    w: newLayout.w,
                    h: newLayout.h
                }
            };
        });

        try {
            await axios.put(`/api/monitoring/dashboards/${currentDashboard.id}`, {
                ...currentDashboard,
                widgets: updatedWidgets
            });
            setCurrentDashboard(prev => prev ? { ...prev, widgets: updatedWidgets } : null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du layout:', error);
        }
    };

    const renderWidget = (widget: Widget) => {
        const data = widgetData[widget.id];

        switch (widget.type) {
            case 'chart':
                return (
                    <Paper style={{ height: '100%', padding: '10px' }}>
                        <Typography variant="h6">{widget.title}</Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                );
            case 'counter':
                return (
                    <Paper style={{ height: '100%', padding: '10px', textAlign: 'center' }}>
                        <Typography variant="h6">{widget.title}</Typography>
                        <Typography variant="h3">{data?.value || 0}</Typography>
                    </Paper>
                );
            case 'alert':
                return (
                    <Paper style={{ height: '100%', padding: '10px' }}>
                        <Typography variant="h6">{widget.title}</Typography>
                        <Box>
                            {data?.alerts?.map((alert: any, index: number) => (
                                <Typography key={index} color={alert.severity}>
                                    {alert.message}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                );
            default:
                return null;
        }
    };

    if (!currentDashboard) {
        return (
            <Box p={3}>
                <Typography variant="h5">Aucun tableau de bord disponible</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {/* TODO: Implémenter la création de tableau de bord */}}
                >
                    Créer un tableau de bord
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">{currentDashboard.name}</Typography>
                <Box>
                    <IconButton onClick={() => setIsEditing(!isEditing)}>
                        <EditIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {/* TODO: Implémenter l'ajout de widget */}}
                        style={{ marginLeft: '10px' }}
                    >
                        Ajouter un widget
                    </Button>
                </Box>
            </Box>

            <ResponsiveGridLayout
                className="layout"
                layouts={{
                    lg: currentDashboard.widgets.map(widget => ({
                        ...widget.layout,
                        i: widget.id.toString()
                    }))
                }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                onLayoutChange={handleLayoutChange}
                isDraggable={isEditing}
                isResizable={isEditing}
            >
                {currentDashboard.widgets.map(widget => (
                    <div key={widget.id.toString()}>
                        {renderWidget(widget)}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </Box>
    );
};

export default CustomDashboard;