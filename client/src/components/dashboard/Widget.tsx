import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, X, Maximize2, Minimize2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

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
  icon?: React.ReactNode;
  accentColor?: string;
  liveIndicator?: boolean;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 lg:col-span-3",
  full: "col-span-full",
};

const SIZE_LABELS: Record<WidgetSize, string> = {
  small: "S",
  medium: "M",
  large: "L",
  full: "XL",
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
  icon,
  accentColor,
  liveIndicator,
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
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={isEditing}
      className={cn(
        "rounded-2xl border border-border/40 bg-card shadow-xs transition-all duration-200 overflow-hidden",
        sizeClasses[size],
        isDragging && "opacity-60 ring-2 ring-primary shadow-lg z-50 scale-[1.02]",
        isEditing && !isDragging && "ring-1 ring-dashed ring-primary/20 hover:ring-primary/40",
        !isEditing && "hover:shadow-sm",
        className
      )}
      data-testid={`widget-${id}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2.5 min-w-0">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent/60 rounded-lg transition-colors flex-shrink-0"
              data-testid={`widget-drag-${id}`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/60" />
            </button>
          )}
          {icon && (
            <span className={cn("flex-shrink-0", accentColor || "text-muted-foreground")}>
              {icon}
            </span>
          )}
          <h3 className="font-semibold text-[13px] tracking-tight truncate">{title}</h3>
          {liveIndicator && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted/40 rounded-md mr-1">
              {SIZE_LABELS[size]}
            </span>
            <button
              onClick={() => onResize?.(nextSize(size))}
              className="p-1.5 hover:bg-accent/60 rounded-lg transition-colors"
              title={`Resize to ${nextSize(size)}`}
              data-testid={`widget-resize-${id}`}
            >
              {size === "small" || size === "medium" ? (
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground/60" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5 text-muted-foreground/60" />
              )}
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
              title="Remove widget"
              data-testid={`widget-remove-${id}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button className="p-1 hover:bg-accent/40 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/40" />
          </button>
        )}
      </div>
      <div className="p-4 group">{children}</div>
    </motion.div>
  );
}
