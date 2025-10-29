#!/bin/bash

echo "Fixing Products module type issues..."

# Fix ProductView.tsx issues
sed -i '' 's/const oldIndex = editedProduct!\.images/const oldIndex = editedProduct?.images/g' src/pages/products/ProductView.tsx
sed -i '' 's/const newIndex = editedProduct!\.images/const newIndex = editedProduct?.images/g' src/pages/products/ProductView.tsx

# Fix the arrayMove call with proper null checking
sed -i '' 's/const newImages = arrayMove(prev\.images, oldIndex, newIndex);/const newImages = prev.images ? arrayMove(prev.images, oldIndex, newIndex) : [];/g' src/pages/products/ProductView.tsx

# Fix lifeEssentialCategory type issue
sed -i '' 's/lifeEssentialCategory: (e\.target\.value as LifeEssentialCategory) || undefined/lifeEssentialCategory: e.target.value ? (e.target.value as LifeEssentialCategory) : null/g' src/pages/products/ProductView.tsx

# Fix variants spread
sed -i '' 's/\.\.\.prev\.variants,/...(prev.variants || []),/g' src/pages/products/ProductView.tsx

# Fix shipping methods type issues
sed -i '' 's/availableShippingMethods: values as string\[\]/availableShippingMethods: values as ShippingMethod[]/g' src/pages/products/ProductView.tsx

echo "Products module type fixes applied."