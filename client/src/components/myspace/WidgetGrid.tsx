import { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { KpiStrip } from "./KpiStrip";
import { NextActionsList } from "./NextActionsList";
import { RecentTradesRow } from "./RecentTradesRow";
import { TradeTable } from "./TradeTable";
import { TradePassportWidget } from "./widgets/TradePassportWidget";
import { NetworkWidget } from "./widgets/NetworkWidget";
import { PaymentsWidget } from "./widgets/PaymentsWidget";
import { type WidgetId } from "./widgetRegistry";

function renderWidget(id: WidgetId) {
  switch (id) {
    case "kpi-strip":
      return <KpiStrip />;
    case "next-actions":
      return <NextActionsList />;
    case "recent-trades":
      return <RecentTradesRow />;
    case "trade-table":
      return <TradeTable />;
    case "trade-passport":
      return <TradePassportWidget />;
    case "network":
      return <NetworkWidget />;
    case "payments":
      return <PaymentsWidget />;
    default:
      return null;
  }
}

const HALF_WIDGETS: WidgetId[] = [
  "next-actions",
  "recent-trades",
  "trade-passport",
  "network",
  "payments",
];

type SortableWidgetProps = {
  id: WidgetId;
  onRemove: (id: WidgetId) => void;
};

function SortableWidget({ id, onRemove }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      data-testid={`widget-${id}`}
    >
      {/* Drag handle + remove controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          {...attributes}
          {...listeners}
          className="w-6 h-6 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          data-testid={`widget-drag-${id}`}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
        </button>
        <button
          onClick={() => onRemove(id)}
          className="w-6 h-6 rounded-lg bg-muted/60 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
          aria-label="Remove widget"
          data-testid={`widget-remove-${id}`}
        >
          <X className="w-3.5 h-3.5 text-muted-foreground/60" />
        </button>
      </div>
      {renderWidget(id)}
    </div>
  );
}

type Props = {
  widgetOrder: WidgetId[];
  onReorder: (newOrder: WidgetId[]) => void;
  onRemove: (id: WidgetId) => void;
};

export function WidgetGrid({ widgetOrder, onReorder, onRemove }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as WidgetId);
      const newIndex = widgetOrder.indexOf(over.id as WidgetId);
      onReorder(arrayMove(widgetOrder, oldIndex, newIndex));
    }
  }

  // Group half-width widgets into pairs for layout
  const rendered: React.ReactNode[] = [];
  let i = 0;
  while (i < widgetOrder.length) {
    const id = widgetOrder[i];
    const isHalf = HALF_WIDGETS.includes(id);
    const nextId = widgetOrder[i + 1];
    const nextIsHalf = nextId && HALF_WIDGETS.includes(nextId);

    if (isHalf && nextIsHalf) {
      rendered.push(
        <div key={`pair-${id}-${nextId}`} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SortableWidget id={id} onRemove={onRemove} />
          <SortableWidget id={nextId} onRemove={onRemove} />
        </div>
      );
      i += 2;
    } else {
      rendered.push(<SortableWidget key={id} id={id} onRemove={onRemove} />);
      i += 1;
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-5" data-testid="widget-grid">
          {rendered}
        </div>
      </SortableContext>
    </DndContext>
  );
}
