import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Dans une version production, implémenter le vrai upload vers un service de stockage
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      onImagesChange([...images, ...imageUrls].slice(0, maxImages));
    }
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        {images.map((url, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveImage(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.paper',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        ))}

        {images.length < maxImages && (
          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloudUpload sx={{ fontSize: 40, color: 'action.active', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Cliquez pour ajouter
            </Typography>
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
            />
          </Box>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {images.length} / {maxImages} images
      </Typography>
    </Box>
  );
};
