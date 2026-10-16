import {
  BookOpen,
  Building2,
  CircleDollarSign,
  Crown,
  Dumbbell,
  Handshake,
  HeartPulse,
  Megaphone,
  NotebookPen,
  Palette,
} from 'lucide-react';

function renderDepartmentIcon(department, iconProps) {
  const context = `${department?.slug || ''} ${department?.name || ''}`.toLowerCase();

  if (context.includes('นายก') || context.includes('president') || context.includes('board')) return <Crown {...iconProps} />;
  if (context.includes('เลขานุการ') || context.includes('secretar')) return <NotebookPen {...iconProps} />;
  if (context.includes('เหรัญญิก') || context.includes('treasur') || context.includes('finance')) return <CircleDollarSign {...iconProps} />;
  if (context.includes('นิสิตสัมพันธ์') || context.includes('relation')) return <Handshake {...iconProps} />;
  if (context.includes('เชียร์') || context.includes('ประชาสัมพันธ์') || context.includes('cheer') || context.includes('public')) return <Megaphone {...iconProps} />;
  if (context.includes('วิชาการ') || context.includes('academic')) return <BookOpen {...iconProps} />;
  if (context.includes('ศิลป') || context.includes('art')) return <Palette {...iconProps} />;
  if (context.includes('กีฬา') || context.includes('sport')) return <Dumbbell {...iconProps} />;
  if (context.includes('สวัสดิการ') || context.includes('welfare')) return <HeartPulse {...iconProps} />;
  return <Building2 {...iconProps} />;
}

export default function DepartmentIcon({ department, size = 14, ...props }) {
  return renderDepartmentIcon(department, {
    'aria-hidden': true,
    size,
    strokeWidth: 1.8,
    ...props,
  });
}
