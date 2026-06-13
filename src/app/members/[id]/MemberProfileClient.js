'use client';
import Link from 'next/link';

export default function MemberProfileClient({ member, session }) {
  const dept = member.department;
  const initial = member.nickname?.[0] || member.firstNameTh?.[0] || '?';
  const fullNameTh = `${member.prefix || ''}${member.firstNameTh || ''} ${member.lastNameTh || ''}`;
  const fullNameEn = `${member.firstNameEn || ''} ${member.lastNameEn || ''}`;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-md">
        <Link href="/members" className="btn btn-ghost btn-sm px-0">
          ← กลับหน้ารายชื่อสมาชิก
        </Link>
      </div>

      <div className="card mb-lg" style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', padding: 'var(--space-xl)' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: 'var(--radius-full)',
          background: member.avatarUrl ? `url(${member.avatarUrl}) center/cover` : 'var(--gradient-primary)', 
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px', fontWeight: 'bold', flexShrink: 0,
          boxShadow: 'var(--shadow-glow)'
        }}>
          {!member.avatarUrl && initial}
        </div>
        <div>
          <h1 className="mb-xs" style={{ fontSize: '32px' }}>{fullNameTh}</h1>
          <div className="font-en text-secondary mb-sm" style={{ fontSize: '18px' }}>{fullNameEn} ({member.nickname})</div>
          <div className="flex gap-sm flex-wrap items-center">
            {dept && (
              <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color, fontSize: '14px', padding: '4px 12px' }}>
                {dept.icon} {dept.name}
              </span>
            )}
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              {member.positionTitle || 'สมาชิกทั่วไป'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-2 stagger-children">
        {/* ข้อมูลเบื้องต้น */}
        <div className="card">
          <h3 className="mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>👤 ข้อมูลเบื้องต้น (Basic Info)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', lineHeight: '1.6' }}>
            <div className="text-secondary">รหัสนิสิต:</div>
            <div className="font-en font-medium">{member.studentId || '-'}</div>
            
            <div className="text-secondary">ชั้นปี:</div>
            <div className="font-en">{member.year ? `ปี ${member.year}` : '-'}</div>
            
            <div className="text-secondary">หลักสูตร:</div>
            <div>{member.major || '-'}</div>
            
            <div className="text-secondary">กลุ่ม (Group):</div>
            <div className="font-en">{member.group || '-'}</div>

            <div className="text-secondary">เลขบัตรปชช:</div>
            <div className="font-en">{member.nationalId || '-'}</div>

            <div className="text-secondary">วันเกิด:</div>
            <div className="font-en">{member.birthday ? new Date(member.birthday).toLocaleDateString('th-TH') : '-'}</div>

            <div className="text-secondary">ศาสนา:</div>
            <div>{member.religion || '-'}</div>
          </div>
        </div>

        {/* ข้อมูลสุขภาพ */}
        <div className="card">
          <h3 className="mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>🏥 ข้อมูลสุขภาพ (Health & Medical)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', lineHeight: '1.6' }}>
            <div className="text-secondary">กรุ๊ปเลือด:</div>
            <div className="font-en font-bold text-danger">{member.bloodGroup || '-'}</div>
            
            <div className="text-secondary">สิ่งที่แพ้:</div>
            <div style={{ color: member.allergies ? 'var(--color-warning)' : 'inherit' }}>
              {member.allergies || '-'}
            </div>
            
            <div className="text-secondary">โรคประจำตัว:</div>
            <div style={{ color: member.medicalCondition ? 'var(--color-danger)' : 'inherit' }}>
              {member.medicalCondition || '-'}
            </div>
          </div>
        </div>

        {/* ข้อมูลการติดต่อ */}
        <div className="card">
          <h3 className="mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>📞 การติดต่อ (Contact Info)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', lineHeight: '1.6' }}>
            <div className="text-secondary">เบอร์โทรศัพท์:</div>
            <div className="font-en">{member.phone || '-'}</div>
            
            <div className="text-secondary">อีเมล:</div>
            <div className="font-en">{member.email || '-'}</div>
            
            <div className="text-secondary">Line ID:</div>
            <div className="font-en text-success">{member.lineId || '-'}</div>
            
            <div className="text-secondary">Instagram:</div>
            <div className="font-en text-primary">{member.instagram || '-'}</div>

            <div className="text-secondary">ที่อยู่ปัจจุบัน:</div>
            <div>{member.address || '-'}</div>
          </div>
        </div>

        {/* ข้อมูลเพิ่มเติม */}
        <div className="card">
          <h3 className="mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>✨ ข้อมูลอื่นๆ (Additional Info)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', lineHeight: '1.6' }}>
            <div className="text-secondary">ไซส์เสื้อ:</div>
            <div className="font-en font-medium">{member.shirtSize || '-'}</div>
            
            <div className="text-secondary">MBTI:</div>
            <div className="font-en">{member.mbti || '-'}</div>
            
            <div className="text-secondary">E-Color:</div>
            <div className="font-en">{member.eColor || '-'}</div>
            
            <div className="text-secondary">สิทธิ์ในระบบ:</div>
            <div className="font-en">
              <span style={{ 
                background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' 
              }}>
                {member.role}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
