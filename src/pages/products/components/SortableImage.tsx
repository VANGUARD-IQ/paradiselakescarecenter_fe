import { Box, Image, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



const SortableImage = ({ id, url, index, onDelete }: { 
    id: string; 
    url: string; 
    index: number;
    onDelete: () => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <Box
        ref={setNodeRef}
        style={style}
        position="relative"
        cursor="move"
        {...attributes}
        {...listeners}
      >
        <Image
          src={url}
          alt={`Product ${index + 1}`}
          width="100%"
          height="auto" 
        />
        <IconButton
          aria-label="Delete image"
          icon={<DeleteIcon />}
          position="absolute"
          top={2}
          right={2}
          onClick={onDelete}
        />
      </Box>
    );
  };

export default SortableImage;