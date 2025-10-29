#!/bin/bash

# Convert Mermaid files to PNG images
# Usage: ./convert-mermaid.sh

IMAGES_DIR="/Users/alexmiller/projects/vanguard-iq-new-real/VanguardiQ-f/src/pages/researchanddesign/images"

echo "Converting Mermaid charts to PNG images..."
echo "Source directory: $IMAGES_DIR"

cd "$IMAGES_DIR"

# Convert each .mmd file to PNG with optimal settings
for mmd_file in *.mmd; do
    if [[ -f "$mmd_file" ]]; then
        png_file="${mmd_file%.mmd}.png"
        echo "Converting $mmd_file to $png_file"
        mmdc -i "$mmd_file" -o "$png_file" -t default -b white --scale 2 --width 1200 --height 800
        if [[ $? -eq 0 ]]; then
            echo "✅ Successfully converted $mmd_file"
        else
            echo "❌ Failed to convert $mmd_file"
        fi
    fi
done

echo ""
echo "Conversion complete!"
echo "Generated PNG files:"
ls -la *.png 2>/dev/null || echo "No PNG files found"