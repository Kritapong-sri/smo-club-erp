const statusLabels = {
  draft: 'ร่าง',
  pending_treasurer: 'รอตรวจงบ',
  pending_executive: 'รออนุมัติ',
  revision: 'แก้ไข',
  approved: 'อนุมัติแล้ว',
  completed: 'เสร็จสิ้น',
  pending: 'รออนุมัติ',
  confirmed: 'ยืนยันแล้ว'
};

export default function StatusBadge({ status }) {
  const label = statusLabels[status] || status;
  
  return (
    <span className={`status-badge ${status}`}>
      {label}
    </span>
  );
}
