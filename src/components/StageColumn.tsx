import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Franchise, type Stage } from '../types';
import { FranchiseCard } from './FranchiseCard';

interface StageColumnProps {
    id: Stage;
    title: string;
    items: Franchise[];
    expandedCardId: string | null;
    onExpandCard: (id: string | null) => void;
    onInputClick: (id: string) => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({
    id,
    title,
    items,
    expandedCardId,
    onExpandCard,
    onInputClick
}) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col h-full min-w-[200px] bg-slate-50/30 rounded-xl p-2 border border-slate-100 backdrop-blur-[2px]">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-3 mb-2 sticky top-0 z-10">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    {title}
                    <span className="bg-ibk-blue/10 text-ibk-blue text-xs px-2 py-0.5 rounded-full font-medium">
                        {items.length}
                    </span>
                </h3>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 overflow-y-auto no-scrollbar px-1 py-1">
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((franchise) => (
                        <FranchiseCard
                            key={franchise.id}
                            franchise={franchise}
                            isExpanded={expandedCardId === franchise.id}
                            onExpand={onExpandCard}
                            onInputClick={onInputClick}
                        />
                    ))}
                </SortableContext>

                {items.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
};
