import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, X, Settings2, Maximize2, Minimize2 } from "lucide-react";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: WidgetSize;
  visible: boolean;
}

interface WidgetProps {
  id: string;
  title: string;
  size: WidgetSize;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  children: React.ReactNode;
  className?: string;
  isEditing?: boolean;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 lg:col-span-3",
  full: "col-span-full",
};

export function Widget({
  id,
  title,
  size,
  onRemove,
  onResize,
  children,
  className,
  isEditing = false,
}: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const nextSize = (current: WidgetSize): WidgetSize => {
    const sizes: WidgetSize[] = ["small", "medium", "large", "full"];
    const idx = sizes.indexOf(current);
    return sizes[(idx + 1) % sizes.length];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border bg-card/60 backdrop-blur transition-all",
        sizeClasses[size],
        isDragging && "opacity-50 ring-2 ring-primary shadow-lg z-50",
        isEditing && "ring-1 ring-dashed ring-border",
        className
      )}
      data-testid={`widget-${id}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded-md transition-colors"
              data-testid={`widget-drag-${id}`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onResize?.(nextSize(size))}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
              title="Resize widget"
              data-testid={`widget-resize-${id}`}
            >
              {size === "small" || size === "medium" ? (
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
              title="Remove widget"
              data-testid={`widget-remove-${id}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
