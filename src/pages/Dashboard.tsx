import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent
} from '@dnd-kit/core';

import { DashboardLayout } from '../components/DashboardLayout';
import { StageColumn } from '../components/StageColumn';
import { TimelineModal } from '../components/TimelineModal';
import { FranchiseCard } from '../components/FranchiseCard';
import { initialData } from '../data';
import { type Franchise, type Stage } from '../types';
import { Plus, CreditCard, Banknote, Landmark } from 'lucide-react';

const STAGES: Stage[] = [
  'Proposal', 'Field Meeting', 'Contract Review', 'Signing', 'Integration', 'Join'
];

export default function Dashboard() {
  const [data, setData] = useState<Franchise[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeFranchise = data.find(f => f.id === activeId);
  const selectedFranchise = data.find(f => f.id === selectedFranchiseId);

  // Stats Calculation
  const stats = {
    Card: data.filter(f => f.serviceTypes.includes('Card')).length,
    Loan: data.filter(f => f.serviceTypes.includes('Loan')).length,
    VirtualAccount: data.filter(f => f.serviceTypes.includes('VirtualAccount')).length
  };

  const currentFranchiseCount = data.length;

  // Actions
  const handleAddNew = () => {
    const newId = (Date.now()).toString();
    const newFranchise: Franchise = {
      id: newId,
      rank: currentFranchiseCount + 1,
      name: 'New Brand',
      storeCount: 0,
      status: 'Proposal',
      history: [],
      serviceTypes: []
    };
    setData([newFranchise, ...data]);
    setExpandedCardId(newId);
  };

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeFranchise = data.find(f => f.id === activeId);
    const overFranchise = data.find(f => f.id === overId);

    // If over a column directly (empty column case)
    if (STAGES.includes(overId as Stage) && activeFranchise && activeFranchise.status !== overId) {
      setData(prev => prev.map(f =>
        f.id === activeId ? { ...f, status: overId as Stage } : f
      ));
      return;
    }

    if (!activeFranchise || !overFranchise || activeFranchise.status === overFranchise.status) return;

    // Moving between different lists (stages)
    setData(prev => {
      return prev.map(f => {
        if (f.id === activeId) return { ...f, status: overFranchise.status };
        return f;
      });
    });
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  // Interaction Handlers
  const handleInputClick = (id: string) => {
    setSelectedFranchiseId(id);
    setModalOpen(true);
  };

  const handleUpdateFranchise = (updated: Franchise) => {
    setData(prev => prev.map(f => f.id === updated.id ? updated : f));
    // Optional: Close modal after save
    // setModalOpen(false); 
  };

  const handleDeleteFranchise = (id: string) => {
    setData(prev => prev.filter(f => f.id !== id));
    setModalOpen(false);
    setSelectedFranchiseId(null);
  };

  return (
    <DashboardLayout>
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-4 bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg text-orange-700 border border-orange-100">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-semibold">카드형: {stats.Card}개</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg text-green-700 border border-green-100">
            <Banknote className="w-4 h-4" />
            <span className="text-xs font-semibold">대출형: {stats.Loan}개</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
            <Landmark className="w-4 h-4" />
            <span className="text-xs font-semibold">가상계좌형: {stats.VirtualAccount}개</span>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-ibk-navy text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-lg shadow-ibk-navy/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">브랜드 신규 등록</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-6 gap-3 h-[calc(100vh-180px)]">
          {STAGES.map(stage => (
            <StageColumn
              key={stage}
              id={stage}
              title={stage}
              items={data.filter(f => f.status === stage).sort((a, b) => a.rank - b.rank)}
              expandedCardId={expandedCardId}
              onExpandCard={setExpandedCardId}
              onInputClick={handleInputClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeFranchise ? (
            <FranchiseCard
              franchise={activeFranchise}
              isExpanded={false}
              onExpand={() => { }}
              onInputClick={() => { }}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Timeline Modal */}
      {selectedFranchise && (
        <TimelineModal
          franchise={selectedFranchise}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdate={handleUpdateFranchise}
          onDelete={handleDeleteFranchise}
        />
      )}
    </DashboardLayout>
  );
}
