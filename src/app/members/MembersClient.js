'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MembersClient({ initialMembers, departments, session }) {
  const [members, setMembers] = useState(initialMembers);
  const [filterDept, setFilterDept] = useState('all');
  const [search, setSearch] = useState('');

  // States for editing
  const [editingMember, setEditingMember] = useState(null);
  const [editPosition, setEditPosition] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState('member');
  const [isSaving, setIsSaving] = useState(false);

  // Check if current user is Admin or President/VP
  const canEdit = session && (
    session.role === 'admin' ||
    (session.positionTitle && session.positionTitle.includes('นายก'))
  );

  const filteredMembers = members.filter(m => {
    if (filterDept !== 'all' && m.departmentId !== filterDept) return false;
    
    const fullNameTh = `${m.firstNameTh || ''} ${m.lastNameTh || ''}`.toLowerCase();
    const nickname = (m.nickname || '').toLowerCase();
    
    if (search && !fullNameTh.includes(search.toLowerCase()) && !nickname.includes(search.toLowerCase())) return false;
    return true;
  });

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditPosition(member.positionTitle || '');
    setEditDept(member.departmentId || '');
    setEditRole(member.role || 'member');
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionTitle: editPosition,
          departmentId: editDept || null, // if empty string, set to null
          role: editRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update member');
      }

      const updatedMember = await res.json();
      
      // Update local state
      setMembers(prev => prev.map(m => {
        if (m.id === updatedMember.id) {
          const newDept = departments.find(d => d.id === updatedMember.departmentId);
          return { ...updatedMember, department: newDept };
        }
        return m;
      }));

      setEditingMember(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Database สมาชิก</h1>
        <p>รายชื่อสมาชิกสโมสรทั้งหมด {members.length} คน</p>
      </div>

      <div className="card mb-lg">
        <div className="flex items-center gap-md">
          <div className="search-input-wrapper flex-1">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="input" 
              placeholder="ค้นหาชื่อ หรือ ชื่อเล่น..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="all">ทุกฝ่าย</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-auto stagger-children">
        {filteredMembers.map(member => {
          const dept = member.department;
          const initial = member.nickname?.[0] || member.firstNameTh?.[0] || '?';
          const name = `${member.firstNameTh || ''} ${member.lastNameTh || ''}`;
          
          return (
            <Link key={member.id} href={`/members/${member.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="member-card" style={{ position: 'relative', height: '100%' }}>
                {canEdit && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(member); }}
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-primary)',
                      borderRadius: '8px', padding: '6px', cursor: 'pointer',
                      color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10
                    }}
                    title="แก้ไขตำแหน่ง"
                  >
                    ✏️
                  </button>
                )}
                <div className="member-card-avatar" style={{ 
                  background: member.avatarUrl ? `url(${member.avatarUrl}) center/cover` : 'var(--gradient-primary)' 
                }}>
                  {!member.avatarUrl && initial}
                </div>
                <div className="member-card-name">{name}</div>
                <div className="member-card-nickname">({member.nickname})</div>
                
                {dept ? (
                  <div className="mt-sm">
                    <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>
                      {dept.icon} {dept.name}
                    </span>
                  </div>
                ) : (
                  <div className="mt-sm">
                    <span className="dept-tag" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>
                      - ไม่มีฝ่าย -
                    </span>
                  </div>
                )}
                
                <div className="member-card-position">
                  {member.positionTitle || 'สมาชิกทั่วไป'}
                  {member.year && ` • ปี ${member.year}`}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Edit Role Modal */}
      {editingMember && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="mb-0">แก้ไขตำแหน่งและฝ่าย</h3>
              <button onClick={() => setEditingMember(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div className="mb-md p-sm" style={{ background: 'var(--bg-surface)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>สมาชิก</div>
              <div style={{ fontWeight: 600 }}>{editingMember.firstNameTh} {editingMember.lastNameTh} ({editingMember.nickname})</div>
            </div>

            <form onSubmit={handleSaveRole}>
              <div className="input-group mb-sm">
                <label className="input-label">ระดับสิทธิ์ (System Role)</label>
                <select className="select" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="board">👑 สามเหลี่ยม (Board)</option>
                  <option value="od">🎯 OD</option>
                  <option value="head">⭐ ประธานฝ่ายต่างๆ</option>
                  <option value="member">👤 Member ทั่วไป</option>
                  <option value="admin">💻 Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>

              <div className="input-group mb-sm">
                <label className="input-label">ฝ่าย (Department)</label>
                <select className="select" value={editDept} onChange={e => setEditDept(e.target.value)}>
                  <option value="">-- ไม่ระบุฝ่าย --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group mb-md">
                <label className="input-label">ตำแหน่ง (Position Title)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editPosition} 
                  onChange={e => setEditPosition(e.target.value)} 
                  placeholder="เช่น ประธานฝ่าย, สมาชิกทั่วไป"
                />
              </div>

              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingMember(null)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
