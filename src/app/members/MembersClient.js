'use client';
import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, UserPlus, Search, Pencil, X, Lock } from 'lucide-react';
import DepartmentIcon from '@/components/DepartmentIcon';

export default function MembersClient({ initialMembers, departments, session }) {
  const [members, setMembers] = useState(initialMembers);
  const [filterDept, setFilterDept] = useState('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [editingMember, setEditingMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Edit Member Form States
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState('member');
  const [editYear, setEditYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add Member Form States
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [newYear, setNewYear] = useState('1');

  // Yearly Batch Reset State
  const [resetPasswordOption, setResetPasswordOption] = useState('studentId');
  const [customDefaultPassword, setCustomDefaultPassword] = useState('');

  // Check permissions: Admin or Triangle Board or President
  const canEdit = session && (
    session.role === 'admin' ||
    session.role === 'board' ||
    (session.positionTitle && session.positionTitle.includes('นายก'))
  );

  const filteredMembers = members.filter(m => {
    if (filterDept !== 'all' && m.departmentId !== filterDept) return false;
    
    const fullNameTh = `${m.firstNameTh || ''} ${m.lastNameTh || ''}`.toLowerCase();
    const nickname = (m.nickname || '').toLowerCase();
    const studentId = (m.studentId || '').toLowerCase();
    
    if (search) {
      const q = search.toLowerCase();
      if (!fullNameTh.includes(q) && !nickname.includes(q) && !studentId.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFirstName(member.firstNameTh || '');
    setEditLastName(member.lastNameTh || '');
    setEditNickname(member.nickname || '');
    setEditStudentId(member.studentId || '');
    setEditPassword(''); // empty means keep current
    setEditPosition(member.positionTitle || '');
    setEditDept(member.departmentId || '');
    setEditRole(member.role || 'member');
    setEditYear(member.year ? member.year.toString() : '');
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editFirstName.trim() || !editStudentId.trim()) {
      return alert('กรุณาระบุชื่อและรหัสนิสิต');
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstNameTh: editFirstName,
          lastNameTh: editLastName,
          nickname: editNickname,
          studentId: editStudentId,
          password: editPassword,
          positionTitle: editPosition,
          departmentId: editDept || null,
          role: editRole,
          year: editYear ? parseInt(editYear, 10) : null
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update member');
      }

      const updatedMember = await res.json();
      
      setMembers(prev => prev.map(m => {
        if (m.id === updatedMember.id) {
          const newDeptObj = departments.find(d => d.id === updatedMember.departmentId);
          return { ...updatedMember, department: newDeptObj };
        }
        return m;
      }));

      setEditingMember(null);
      alert('บันทึกข้อมูลสมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสมาชิกคนนี้ออกจากระบบ?')) return;

    try {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete member');
      }
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setEditingMember(null);
      alert('ลบสมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newStudentId.trim()) {
      return alert('กรุณาระบุชื่อและรหัสนิสิต');
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstNameTh: newFirstName,
          lastNameTh: newLastName,
          nickname: newNickname,
          studentId: newStudentId,
          password: newPassword,
          positionTitle: newPosition,
          departmentId: newDept || null,
          role: newRole,
          year: parseInt(newYear, 10) || 1
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add member');
      }

      const createdMember = await res.json();
      const createdDeptObj = departments.find(d => d.id === createdMember.departmentId);
      setMembers(prev => [ { ...createdMember, department: createdDeptObj }, ...prev ]);

      // Reset add form
      setNewFirstName('');
      setNewLastName('');
      setNewNickname('');
      setNewStudentId('');
      setNewPassword('');
      setNewPosition('');
      setShowAddModal(false);
      alert('เพิ่มสมาชิกใหม่สำเร็จ!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchResetPasswords = async (e) => {
    e.preventDefault();
    const finalPassword = resetPasswordOption === 'custom' ? customDefaultPassword.trim() : '';
    const confirmMsg = resetPasswordOption === 'custom' 
      ? `คุณต้องการตั้งรหัสผ่านของสมาชิกทุกคนเป็น "${finalPassword}" ใช่หรือไม่?`
      : 'คุณต้องการรีเซ็ตรหัสผ่านของสมาชิกทุกคนเป็น "รหัสนิสิต" ใช่หรือไม่?';

    if (!confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/members/reset-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultPassword: finalPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset passwords');
      }

      const data = await res.json();
      alert(data.message || 'รีเซ็ตรหัสผ่านประจำปีสำเร็จ!');
      setShowResetModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Database สมาชิกสโมสร</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            รายชื่อสมาชิกและระบบจัดการรหัสผ่านผู้ใช้งาน ทั้งหมด {members.length} คน
          </p>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowResetModal(true)} 
              className="btn btn-outline hover-lift flex items-center gap-xs"
              style={{ fontWeight: '700' }}
            >
              <KeyRound size={16} />
              <span>รีเซ็ตรหัสผ่านประจำปี</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn btn-primary hover-lift flex items-center gap-xs"
              style={{ fontWeight: '700' }}
            >
              <UserPlus size={16} />
              <span>เพิ่มสมาชิกใหม่</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="card mb-lg hover-glow">
        <div className="flex items-center gap-md">
          <div className="search-input-wrapper flex-1">
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              className="input" 
              placeholder="ค้นหาชื่อ, ชื่อเล่น หรือ รหัสนิสิต..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">ทุกฝ่าย (All Departments)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Cards Grid */}
      <div className="grid-auto stagger-children">
        {filteredMembers.map(member => {
          const dept = member.department;
          const initial = member.nickname?.[0] || member.firstNameTh?.[0] || '?';
          const name = `${member.firstNameTh || ''} ${member.lastNameTh || ''}`;
          
          return (
            <Link key={member.id} href={`/members/${member.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="member-card hover-lift" style={{ position: 'relative', height: '100%' }}>
                {canEdit && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(member); }}
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-primary)',
                      borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                      color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: '600', zIndex: 10
                    }}
                    title="แก้ไขข้อมูลและตั้งรหัสผ่าน"
                  >
                    <Pencil size={13} /> แก้ไข / รหัสผ่าน
                  </button>
                )}

                <div className="member-card-avatar" style={{ 
                  background: member.avatarUrl ? `url(${member.avatarUrl}) center/cover` : 'var(--gradient-primary)' 
                }}>
                  {!member.avatarUrl && initial}
                </div>

                <div className="member-card-name">{name}</div>
                <div className="member-card-nickname">
                  ({member.nickname || 'ไม่ระบุ'}) • <span className="font-en" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{member.studentId}</span>
                </div>
                
                {dept ? (
                  <div className="mt-sm">
                    <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>
                      <DepartmentIcon department={dept} /> {dept.name}
                    </span>
                  </div>
                ) : (
                  <div className="mt-sm">
                    <span className="dept-tag" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>
                      - ไม่ระบุฝ่าย -
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

      {/* Modal 1: Edit Member & Set Password */}
      {editingMember && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
              <h3 className="mb-0 flex items-center gap-xs">
                <Pencil size={18} />
                <span>แก้ไขข้อมูล & ตั้งรหัสผ่าน</span>
              </h3>
              <button onClick={() => setEditingMember(null)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ชื่อจริง (ไทย)</label>
                  <input type="text" className="input" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">นามสกุล (ไทย)</label>
                  <input type="text" className="input" value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ชื่อเล่น</label>
                  <input type="text" className="input" value={editNickname} onChange={e => setEditNickname(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">รหัสนิสิต (สำหรับ Login)</label>
                  <input type="text" className="input font-en" value={editStudentId} onChange={e => setEditStudentId(e.target.value)} required />
                </div>
              </div>

              {/* Password Setting Section */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label className="input-label flex items-center gap-xs" style={{ color: '#1d4ed8', fontWeight: '700' }}>
                  <KeyRound size={16} />
                  <span>ตั้งรหัสผ่านใหม่ (Set New Password)</span>
                </label>
                <input 
                  type="password" 
                  className="input font-en" 
                  placeholder="พิมพ์เพื่อตั้งรหัสผ่านใหม่ (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)"
                  value={editPassword} 
                  onChange={e => setEditPassword(e.target.value)} 
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  * รหัสผ่านเดิมหากไม่ได้ตั้ง จะเท่ากับ “รหัสนิสิต”
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ฝ่าย (Department)</label>
                  <select className="select" value={editDept} onChange={e => setEditDept(e.target.value)}>
                    <option value="">-- ไม่ระบุฝ่าย --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">ชั้นปี</label>
                  <select className="select" value={editYear} onChange={e => setEditYear(e.target.value)}>
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                    <option value="5">ปี 5ขึ้นไป</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">ตำแหน่ง (Position Title)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editPosition} 
                  onChange={e => setEditPosition(e.target.value)} 
                  placeholder="เช่น ประธานฝ่าย, หัวหน้านิสิตชั้นปีที่ 1, สมาชิก"
                />
                {/* Quick position presets for Head of Students department */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['หัวหน้านิสิตชั้นปีที่ 1', 'หัวหน้านิสิตชั้นปีที่ 2', 'หัวหน้านิสิตชั้นปีที่ 3', 'หัวหน้านิสิตชั้นปีที่ 4'].map(title => (
                    <button
                      type="button"
                      key={title}
                      onClick={() => setEditPosition(title)}
                      style={{
                        background: editPosition === title ? '#7c3aed' : '#f3e8ff',
                        color: editPosition === title ? '#ffffff' : '#6b21a8',
                        border: '1px solid #ddd6fe',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">สิทธิ์การใช้งานระบบ (System Role)</label>
                <select className="select" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="board">สามเหลี่ยม (Board / นายก / อุปนายก)</option>
                  <option value="od">OD</option>
                  <option value="head">ประธานฝ่ายต่างๆ</option>
                  <option value="member">Member สมาชิกทั่วไป</option>
                  <option value="admin">Admin (ผู้ดูแลระบบสูงสุด)</option>
                </select>
              </div>

              <div className="flex justify-between items-center gap-sm mt-md" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                <button 
                  type="button" 
                  onClick={() => handleDeleteMember(editingMember.id)}
                  style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  ลบสมาชิก
                </button>

                <div className="flex gap-sm">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingMember(null)}>ยกเลิก</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Member */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px' }}>
            <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
              <h3 className="mb-0 flex items-center gap-xs">
                <UserPlus size={18} />
                <span>เพิ่มสมาชิกใหม่ในระบบ</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ชื่อจริง (ไทย) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" className="input" placeholder="สมชาย" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">นามสกุล (ไทย)</label>
                  <input type="text" className="input" placeholder="ใจดี" value={newLastName} onChange={e => setNewLastName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ชื่อเล่น</label>
                  <input type="text" className="input" placeholder="ชายน้อย" value={newNickname} onChange={e => setNewNickname(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">รหัสนิสิต (สำหรับ Login) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" className="input font-en" placeholder="65XXXXXXXX" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="input-label flex items-center gap-xs">
                  <KeyRound size={16} />
                  <span>รหัสผ่านเริ่มต้น (Default Password)</span>
                </label>
                <input 
                  type="password" 
                  className="input font-en" 
                  placeholder="ถ้าปล่อยว่าง รหัสผ่านเริ่มต้นจะเท่ากับรหัสนิสิต"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">ฝ่าย (Department)</label>
                  <select className="select" value={newDept} onChange={e => setNewDept(e.target.value)}>
                    <option value="">-- ไม่ระบุฝ่าย --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">ชั้นปี</label>
                  <select className="select" value={newYear} onChange={e => setNewYear(e.target.value)}>
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                    <option value="5">ปี 5ขึ้นไป</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">ตำแหน่ง (Position Title)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="เช่น ประธานฝ่าย, หัวหน้านิสิตชั้นปีที่ 1, สมาชิก" 
                  value={newPosition} 
                  onChange={e => setNewPosition(e.target.value)} 
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['หัวหน้านิสิตชั้นปีที่ 1', 'หัวหน้านิสิตชั้นปีที่ 2', 'หัวหน้านิสิตชั้นปีที่ 3', 'หัวหน้านิสิตชั้นปีที่ 4'].map(title => (
                    <button
                      type="button"
                      key={title}
                      onClick={() => setNewPosition(title)}
                      style={{
                        background: newPosition === title ? '#7c3aed' : '#f3e8ff',
                        color: newPosition === title ? '#ffffff' : '#6b21a8',
                        border: '1px solid #ddd6fe',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">สิทธิ์การใช้งานระบบ</label>
                <select className="select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="board">สามเหลี่ยม (Board)</option>
                  <option value="od">OD</option>
                  <option value="head">ประธานฝ่าย</option>
                  <option value="member">Member ทั่วไป</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm mt-md" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary flex items-center gap-xs" disabled={isSaving}>
                  <UserPlus size={16} />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกสมาชิกใหม่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Batch Reset Passwords for New Year */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
              <h3 className="mb-0 flex items-center gap-xs">
                <KeyRound size={18} />
                <span>รีเซ็ตรหัสผ่านสมาชิกยกชุดประจำปี</span>
              </h3>
              <button onClick={() => setShowResetModal(false)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              สำหรับต้อนรับปีการศึกษาใหม่ เพื่อป้องกันไม่ให้สมาชิกปีเก่าหรือบุคคลภายนอกเข้าถึงระบบ
            </p>

            <form onSubmit={handleBatchResetPasswords} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="resetOpt" 
                    value="studentId" 
                    checked={resetPasswordOption === 'studentId'} 
                    onChange={() => setResetPasswordOption('studentId')} 
                  />
                  <span>รีเซ็ตรหัสผ่านทุกคนให้กลับเป็น <b>“รหัสนิสิต”</b> ของตนเอง</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="resetOpt" 
                    value="custom" 
                    checked={resetPasswordOption === 'custom'} 
                    onChange={() => setResetPasswordOption('custom')} 
                  />
                  <span>ตั้งรหัสผ่านกลางใหม่ให้ทุกคนเหมือนกันหมด</span>
                </label>
              </div>

              {resetPasswordOption === 'custom' && (
                <div>
                  <label className="input-label">ระบุรหัสผ่านกลางประจำปีใหม่</label>
                  <input 
                    type="password" 
                    className="input font-en" 
                    placeholder="เช่น SMO2026! หรือ รหัสผ่านสโม" 
                    value={customDefaultPassword} 
                    onChange={e => setCustomDefaultPassword(e.target.value)} 
                    required 
                  />
                </div>
              )}

              <div className="flex justify-end gap-sm mt-md" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ background: '#ef4444', borderColor: '#dc2626' }}>
                  {isSaving ? 'กำลังรีเซ็ต...' : 'ยืนยันรีเซ็ตรหัสผ่านทุกคน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
