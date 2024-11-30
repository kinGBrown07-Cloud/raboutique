import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
} from '@mui/material';

export const ListingSkeleton: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton 
        variant="rectangular" 
        height={200}
        animation="wave"
      />
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        <Skeleton variant="text" width="80%" height={32} animation="wave" />
        
        <Box sx={{ mb: 1 }}>
          <Skeleton variant="text" width="100%" animation="wave" />
          <Skeleton variant="text" width="90%" animation="wave" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant="rounded" width={80} height={24} animation="wave" />
          <Skeleton variant="rounded" width={80} height={24} animation="wave" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="text" width={100} height={32} animation="wave" />
          <Skeleton variant="text" width={60} animation="wave" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
        </Box>
      </CardContent>
    </Card>
  );
};
