import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Droppable({ id, children, className }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
      {/* <p>Drag me or click the button below:</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleConnect();
        }}
      >
        Click Me
      </button> */}
    </div>
  );
}
