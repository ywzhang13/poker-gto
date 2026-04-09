'use client';

const items = [
  { label: 'Raise', color: '#22C55E' },
  { label: 'Call', color: '#3B82F6' },
  { label: 'Fold', color: '#EF4444' },
  { label: 'All-in', color: '#8B5CF6' },
  { label: 'Mixed', color: '#EAB308' },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: i.color }} />
          <span className="text-[10px] text-[#94A3B8] font-medium">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
