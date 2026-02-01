import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, CreditCard, Banknote, Landmark, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import type { Franchise, TimelineEvent, ServiceType } from '../types';

interface TimelineModalProps {
    franchise: Franchise;
    isOpen: boolean;
    onClose: () => void;
    // Legacy onSubmit allows compatibility if needed, but we focus on onUpdate
    onSubmit?: (content: string, type: any) => void;
    onUpdate: (updatedFranchise: Franchise) => void;
    onDelete: (id: string) => void;
}

const ServiceTypeCheckbox: React.FC<{
    type: ServiceType;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ReactNode;
}> = ({ label, checked, onChange, icon }) => (
    <label className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
        ${checked
            ? 'bg-ibk-blue/5 border-ibk-blue text-ibk-blue'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}
    `}>
        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </label>
);

export const TimelineModal: React.FC<TimelineModalProps> = ({
    franchise,
    isOpen,
    onClose,
    onUpdate,
    onDelete
}) => {
    // Local state for form editing
    const [editedFranchise, setEditedFranchise] = useState<Franchise>(franchise);
    const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

    // New History Item State
    const [isAddingLog, setIsAddingLog] = useState(false);
    const [newLogContent, setNewLogContent] = useState('');
    const [newLogType, setNewLogType] = useState<'Contact' | 'Meeting' | 'File' | 'Note'>('Note');

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setEditedFranchise(franchise);
        // Reset all form state when franchise changes or modal opens
        setNewLogContent('');
        setNewLogType('Note');
        setSelectedFile(null);
        setIsAddingLog(false);
        setIsUploading(false);
    }, [franchise, isOpen]);

    if (!isOpen) return null;

    const handleSaveInfo = () => {
        onUpdate(editedFranchise);
        onClose();
    };

    const toggleServiceType = (type: ServiceType, checked: boolean) => {
        const current = new Set(editedFranchise.serviceTypes);
        if (checked) current.add(type);
        else current.delete(type);
        setEditedFranchise({ ...editedFranchise, serviceTypes: Array.from(current) });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Preset content name
            setNewLogContent(`${e.target.files[0].name} 업로드 완료`);
        }
    };

    const handleAddLog = async () => {
        if (!newLogContent.trim() && !selectedFile) return;

        let fileUrl = '';
        let finalContent = newLogContent;

        if (newLogType === 'File' && selectedFile) {
            setIsUploading(true);
            try {
                const storageRef = ref(storage, `franchise-docs/${franchise.id}/${Date.now()}_${selectedFile.name}`);
                const snapshot = await uploadBytes(storageRef, selectedFile);
                fileUrl = await getDownloadURL(snapshot.ref);
                finalContent = `${selectedFile.name}`;
            } catch (error: any) {
                console.error("Upload failed", error);
                const errorMessage = error.code === 'storage/unauthorized'
                    ? "업로드 권한이 없습니다. Firebase Console에서 Storage 규칙을 확인해주세요."
                    : `파일 업로드 실패: ${error.message}`;
                alert(errorMessage);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const newEvent: TimelineEvent = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            type: newLogType,
            content: finalContent,
            createdBy: 'Me',
            files: fileUrl ? [fileUrl] : []
        };

        const updatedHistory = [newEvent, ...editedFranchise.history];
        const updatedFranchise = { ...editedFranchise, history: updatedHistory };

        setEditedFranchise(updatedFranchise);
        onUpdate(updatedFranchise);

        // Reset form
        setNewLogContent('');
        setSelectedFile(null);
        setIsAddingLog(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ibk-navy rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md mb-[-2px]">
                            {editedFranchise.name.substring(0, 1)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{editedFranchise.name}</h2>
                            <p className="text-xs text-slate-500">현재 단계: <span className="text-ibk-blue font-semibold">{editedFranchise.status}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 px-6 pt-2">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'info' ? 'text-ibk-navy' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            기본 정보 (Basic Info)
                            {activeTab === 'info' && (
                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ibk-navy" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-ibk-navy' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            진행 이력 (History)
                            {activeTab === 'history' && (
                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ibk-navy" />
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                        {activeTab === 'info' ? (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-ibk-blue rounded-full"></span>
                                        필수 정보
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">브랜드명</label>
                                            <input
                                                type="text"
                                                value={editedFranchise.name}
                                                onChange={(e) => setEditedFranchise({ ...editedFranchise, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ibk-blue/20 focus:border-ibk-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">가맹점 수 (개)</label>
                                            <input
                                                type="number"
                                                value={editedFranchise.storeCount}
                                                onChange={(e) => setEditedFranchise({ ...editedFranchise, storeCount: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ibk-blue/20 focus:border-ibk-blue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">연매출 (억원)</label>
                                            <input
                                                type="number"
                                                value={editedFranchise.revenue || ''}
                                                placeholder="0"
                                                onChange={(e) => setEditedFranchise({ ...editedFranchise, revenue: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ibk-blue/20 focus:border-ibk-blue"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                        서비스 도입 형태 (복수 선택 가능)
                                    </h3>
                                    <div className="flex gap-3">
                                        <ServiceTypeCheckbox
                                            type="Card"
                                            label="카드형"
                                            checked={editedFranchise.serviceTypes.includes('Card')}
                                            onChange={(c) => toggleServiceType('Card', c)}
                                            icon={<CreditCard className="w-4 h-4" />}
                                        />
                                        <ServiceTypeCheckbox
                                            type="Loan"
                                            label="대출형"
                                            checked={editedFranchise.serviceTypes.includes('Loan')}
                                            onChange={(c) => toggleServiceType('Loan', c)}
                                            icon={<Banknote className="w-4 h-4" />}
                                        />
                                        <ServiceTypeCheckbox
                                            type="VirtualAccount"
                                            label="가상계좌형"
                                            checked={editedFranchise.serviceTypes.includes('VirtualAccount')}
                                            onChange={(c) => toggleServiceType('VirtualAccount', c)}
                                            icon={<Landmark className="w-4 h-4" />}
                                        />
                                    </div>
                                </section>

                                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-orange-400 rounded-full"></span>
                                        특이사항 (Memo)
                                    </h3>
                                    <textarea
                                        value={editedFranchise.memo || ''}
                                        onChange={(e) => setEditedFranchise({ ...editedFranchise, memo: e.target.value })}
                                        className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ibk-blue/20 focus:border-ibk-blue resize-none"
                                        placeholder="영업 관련 특이사항을 입력하세요."
                                    />
                                </section>

                                <div className="flex justify-between pt-4 border-t border-slate-100 mt-8">
                                    <button
                                        onClick={() => {
                                            if (window.confirm('정말로 이 브랜드를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
                                                onDelete(editedFranchise.id);
                                            }
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        브랜드 삭제
                                    </button>

                                    <button
                                        onClick={handleSaveInfo}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-ibk-navy text-white rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/10 active:scale-95"
                                    >
                                        <Save className="w-4 h-4" />
                                        저장하기
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-700 text-sm">진행 이력 ({editedFranchise.history.length})</h3>
                                    <button
                                        onClick={() => setIsAddingLog(!isAddingLog)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-ibk-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        새 기록 추가
                                    </button>
                                </div>

                                {isAddingLog && (
                                    <div className="p-4 bg-blue-50/30 border-b border-blue-100 animate-in slide-in-from-top-2">
                                        <div className="flex gap-2 mb-2 items-center">
                                            <select
                                                value={newLogType}
                                                onChange={(e: any) => setNewLogType(e.target.value)}
                                                className="text-xs border border-slate-200 rounded px-2 py-1.5"
                                            >
                                                <option value="Note">메모 (Note)</option>
                                                <option value="Meeting">미팅 (Meeting)</option>
                                                <option value="Contact">연락 (Contact)</option>
                                                <option value="File">파일 (File)</option>
                                            </select>

                                            {newLogType === 'File' ? (
                                                <input
                                                    type="file"
                                                    onChange={handleFileSelect}
                                                    className="flex-1 text-xs border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-ibk-blue bg-white"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={newLogContent}
                                                    onChange={(e) => setNewLogContent(e.target.value)}
                                                    placeholder="내용을 입력하세요..."
                                                    className="flex-1 text-sm border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-ibk-blue"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
                                                />
                                            )}

                                            <button
                                                onClick={handleAddLog}
                                                disabled={isUploading}
                                                className={`bg-ibk-blue text-white px-3 py-1.5 rounded text-xs font-bold ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {isUploading ? '업로드 중...' : '등록'}
                                            </button>
                                        </div>
                                        {/* File Input Help Text */}
                                        {newLogType === 'File' && (
                                            <p className="text-[10px] text-slate-400 pl-1 mt-1">
                                                * 파일을 선택 후 '등록'을 누르면 자동으로 업로드됩니다.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold w-32">Date</th>
                                                <th className="px-4 py-3 font-semibold w-24">Type</th>
                                                <th className="px-4 py-3 font-semibold">Content</th>
                                                <th className="px-4 py-3 font-semibold w-24">Writer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {editedFranchise.history.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-xs">
                                                        기록된 이력이 없습니다.
                                                    </td>
                                                </tr>
                                            ) : (
                                                editedFranchise.history.map((event) => (
                                                    <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{event.date}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`
                                                        px-2 py-0.5 rounded text-[10px] font-bold border
                                                        ${event.type === 'Meeting' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                                                        ${event.type === 'Contact' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                                        ${event.type === 'Note' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                                                        ${event.type === 'File' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                                                    `}>
                                                                {event.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-700">
                                                            {event.content}
                                                            {event.files && event.files.length > 0 && (
                                                                <div className="flex gap-1 mt-1">
                                                                    {event.files.map((url, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1 hover:bg-ibk-blue/10 hover:text-ibk-blue transition-colors"
                                                                        >
                                                                            <FileText className="w-3 h-3" />
                                                                            {/* If URL contains encoded char like %20, straightforward; ideally we store name separately but this works for MVP */}
                                                                            파일 열기
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 text-xs flex items-center gap-1.5">
                                                            <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                                {event.createdBy.substring(0, 1)}
                                                            </div>
                                                            {event.createdBy}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
