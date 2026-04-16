'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, FileText, UserCircle } from 'lucide-react';

type TaskStatus = 'pending' | 'completed' | 'missed';

interface DailyTask {
    id: string;
    task_name: string;
    category: string;
    scheduled_time: string;
    status: TaskStatus;
    notes?: string;
    completed_by_name?: string;
}

interface PatientProps {
    patientId: string;
    patientName: string;
    roomNumber: string;
}

export default function PatientDailyTasks({ patientId, patientName, roomNumber }: PatientProps) {
    const [tasks, setTasks] = useState<DailyTask[]>([
        { id: '1', task_name: 'Morning Bath', category: 'hygiene', scheduled_time: '07:30', status: 'completed', completed_by_name: 'Maria C.' },
        { id: '2', task_name: 'Administer Metformin', category: 'medication', scheduled_time: '08:00', status: 'pending' },
        { id: '3', task_name: 'Assist with Breakfast', category: 'feeding', scheduled_time: '08:30', status: 'pending' },
    ]);

    const [activeNoteModal, setActiveNoteModal] = useState<string | null>(null);

    const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="w-full">

            {/* Patient Header */}
            <div className="surface-card p-6 shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--color-brand-accent)] rounded-full flex items-center justify-center text-white">
                        <span className="font-heading font-bold text-lg">{patientName.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-[var(--color-brand-primary)]">{patientName}</h1>
                        <p className="text-[var(--color-brand-primary)] opacity-60 font-body text-sm mt-0.5">Room {roomNumber}</p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider opacity-50 mb-1">Today</p>
                    <p className="font-body font-medium text-[var(--color-brand-primary)] text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider opacity-60 mb-3 px-1">Daily Care Plan</h2>

                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`p-4 rounded border flex items-center justify-between transition-colors
              ${task.status === 'completed' ? 'bg-[var(--color-brand-bg)] border-[var(--color-brand-border)] shadow-sm' : 'bg-white border-[var(--color-brand-border)] hover:border-[var(--color-brand-accent)]'}
            `}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => toggleTaskStatus(task.id, task.status)}
                                className="focus:outline-none rounded transition-transform active:scale-95"
                            >
                                {task.status === 'completed' ? (
                                    <div className="w-7 h-7 rounded bg-[var(--color-brand-accent)] flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded border-2 border-[var(--color-brand-border)] hover:border-[var(--color-brand-accent)]" />
                                )}
                            </button>

                            <div className="flex-1">
                                <h3 className={`font-body font-medium text-[16px] mb-0.5 ${task.status === 'completed' ? 'text-[var(--color-brand-primary)] opacity-40 line-through' : 'text-[var(--color-brand-primary)]'}`}>
                                    {task.task_name}
                                </h3>
                                <div className="flex items-center gap-3 text-xs font-body">
                                    <span className="flex items-center gap-1 font-medium text-[var(--color-brand-primary)] opacity-60">
                                        <Clock className="w-3.5 h-3.5" />
                                        {task.scheduled_time}
                                    </span>

                                    {task.status === 'completed' && task.completed_by_name && (
                                        <span className="text-[var(--color-brand-primary)] opacity-40 inline-flex items-center before:content-['•'] before:mr-2">
                                            {task.completed_by_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveNoteModal(task.id)}
                            className="p-2 text-[var(--color-brand-primary)] opacity-40 hover:opacity-100 hover:bg-[var(--color-brand-surface)] rounded transition-all"
                        >
                            <FileText className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {activeNoteModal && (
                <div className="fixed inset-0 bg-[var(--color-brand-primary)]/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="surface-card p-6 w-full max-w-md shadow-xl">
                        <h3 className="font-heading font-bold text-[24px] mb-4 text-[var(--color-brand-primary)]">Add Note</h3>
                        <textarea
                            className="w-full input-classic p-3 h-28 mb-4 font-body text-[16px] resize-none"
                            placeholder="e.g. Patient experienced light nausea..."
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setActiveNoteModal(null)}
                                className="btn-secondary px-4 py-2 text-sm font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setActiveNoteModal(null)}
                                className="btn-primary px-5 py-2 text-sm font-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
