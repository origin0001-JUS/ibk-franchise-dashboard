import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, FileText, CreditCard, Banknote, Landmark } from 'lucide-react';
import { type Franchise, type ServiceType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface FranchiseCardProps {
    franchise: Franchise;
    isExpanded: boolean;
    onExpand: (id: string | null) => void;
    onInputClick: (id: string) => void;
}

const ServiceIcon: React.FC<{ type: ServiceType }> = ({ type }) => {
    switch (type) {
        case 'Card': return <CreditCard className="w-3 h-3 text-orange-600" />;
        case 'Loan': return <Banknote className="w-3 h-3 text-green-600" />;
        case 'VirtualAccount': return <Landmark className="w-3 h-3 text-blue-600" />;
    }
};

const ServiceBadge: React.FC<{ type: ServiceType }> = ({ type }) => {
    const styles = {
        Card: 'bg-orange-50 text-orange-700 border-orange-200',
        Loan: 'bg-green-50 text-green-700 border-green-200',
        VirtualAccount: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    const labels = {
        Card: '카드',
        Loan: '대출',
        VirtualAccount: '가상계좌'
    };

    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${styles[type]}`}>
            <ServiceIcon type={type} />
            {labels[type]}
        </span>
    );
};

export const FranchiseCard: React.FC<FranchiseCardProps> = ({
    franchise,
    isExpanded,
    onExpand,
    onInputClick
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: franchise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onExpand(isExpanded ? null : franchise.id)}
            className={`
        relative bg-glass-white backdrop-blur-sm border border-glass-border p-3 rounded-xl mb-2 cursor-pointer 
        transition-all duration-200 hover:shadow-lg hover:border-white/80 group
        ${isExpanded ? 'ring-2 ring-ibk-blue/20 bg-white' : ''}
      `}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${franchise.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        #{franchise.rank}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">{franchise.name}</span>
                </div>

                <button
                    className="text-slate-400 hover:text-slate-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Menu action
                    }}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
                {franchise.serviceTypes.map(type => (
                    <ServiceBadge key={type} type={type} />
                ))}
                {franchise.serviceTypes.length === 0 && (
                    <span className="text-[10px] text-slate-400 px-1">서비스 미선택</span>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100/50">
                <div>
                    <span className="text-slate-400 mr-1">가맹점</span>
                    <span className="font-semibold text-slate-700">{franchise.storeCount.toLocaleString()}개</span>
                </div>
                {franchise.revenue && (
                    <div>
                        <span className="text-slate-400 mr-1">매출</span>
                        <span className="font-semibold text-slate-700">{franchise.revenue.toLocaleString()}억</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2 pt-2 border-t border-slate-100"
                    >
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInputClick(franchise.id);
                                }}
                                className="flex-1 bg-ibk-navy text-white text-xs py-1.5 rounded hover:bg-blue-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <Calendar className="w-3 h-3" />
                                <span>상세 정보 및 히스토리</span>
                            </button>
                        </div>

                        {franchise.history.length > 0 && (
                            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span className="truncate flex-1">
                                    {franchise.history[franchise.history.length - 1].date}: {franchise.history[franchise.history.length - 1].content}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
