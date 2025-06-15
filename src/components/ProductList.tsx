import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useLicenseStore } from '../store/licenseStore';
import { ProductType } from '../types';

const ProductList: React.FC = () => {
  const { products, addProduct, removeProduct } = useLicenseStore();

  const handleAddProduct = (productType: ProductType) => {
    addProduct(productType);
  };

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
        Products
      </Typography>
      
      {/* Add Product Buttons */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.values(ProductType).map((productType) => (
          <Button
            key={productType}
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleAddProduct(productType)}
            sx={{ textTransform: 'none' }}
          >
            {productType}
          </Button>
        ))}
      </Box>
      
      {/* Product List */}
      <List dense>
        {products.map((product) => (
          <ListItem
            key={product.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              bgcolor: product.parentId ? 'action.hover' : 'background.paper'
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleRemoveProduct(product.id)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {product.product}
                  </Typography>
                  {product.parentId && (
                    <Chip label="Add-on" size="small" color="secondary" />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="caption" display="block">
                    Seats: {product.seats} | Version: {product.yearMonth || 'Not set'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {product.isPermanent ? 'Permanent' : 
                     product.endDate ? `Until: ${product.endDate.toLocaleDateString()}` : 'No end date'}
                  </Typography>
                  {product.notes && (
                    <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                      Notes: {product.notes}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {products.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No products added yet. Click a button above to add a product.
        </Typography>
      )}
    </Box>
  );
};

export default ProductList;