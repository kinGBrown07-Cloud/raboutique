import React from 'react';
import { Grid } from '@mui/material';
import { ListingCard } from './ListingCard';
import type { Listing } from '../../types';

interface ListingGridProps {
  listings: Listing[];
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <Grid container spacing={3}>
      {listings.map((listing) => (
        <Grid item xs={12} sm={6} md={4} key={listing.id}>
          <ListingCard listing={listing} />
        </Grid>
      ))}
    </Grid>
  );
}