
import React from 'react';
import { FeedbackEntry, FamilyMember } from '../types';
import { FEEDBACK_CATEGORIES } from '../constants';
import Avatar from './Avatar';

interface FeedbackCardProps {
  entry: FeedbackEntry;
  members: FamilyMember[];
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ entry, members }) => {
  const fromMember = members.find(m => m.id === entry.fromId);
  const toMember = members.find(m => m.id === entry.toId);
  const category = FEEDBACK_CATEGORIES[entry.type];

  if (!fromMember || !toMember) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex -space-x-3">
          <Avatar src={fromMember.avatar} name={fromMember.name} size="sm" />
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-400 z-10">
            ➔
          </div>
          <Avatar src={toMember.avatar} name={toMember.name} size="sm" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800">
              {fromMember.name} <span className="font-normal text-slate-500">to</span> {toMember.name}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.color}`}>
              {category.icon} {category.label}
            </span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {entry.content}
          </p>
          <div className="mt-3 text-[10px] text-slate-400 font-medium">
            {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
