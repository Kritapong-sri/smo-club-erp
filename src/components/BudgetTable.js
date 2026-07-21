'use client';
import { useState } from 'react';

export default function BudgetTable({ items, type, onAddItem, onUpdateItem, onDeleteItem }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ค่าใช้สอย');
  const [subCategory, setSubCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('ชิ้น');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [note, setNote] = useState('');

  // Edit states
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('ค่าใช้สอย');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState('ชิ้น');
  const [editPricePerUnit, setEditPricePerUnit] = useState(0);
  const [editNote, setEditNote] = useState('');

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name || '');
    setEditCategory(item.category || 'ค่าใช้สอย');
    setEditSubCategory(item.subCategory || '');
    setEditQuantity(item.quantity || 1);
    setEditUnit(item.unit || 'ชิ้น');
    setEditPricePerUnit(item.pricePerUnit || 0);
    setEditNote(item.note || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return alert('กรุณาระบุชื่อรายการ');
    
    await onUpdateItem({
      id,
      name: editName,
      category: editCategory,
      subCategory: editSubCategory,
      quantity: parseFloat(editQuantity) || 1,
      unit: editUnit,
      pricePerUnit: parseFloat(editPricePerUnit) || 0,
      note: editNote
    });
    setEditingId(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('กรุณาระบุชื่อรายการ');

    await onAddItem({
      type,
      name,
      category,
      subCategory,
      quantity: parseFloat(quantity) || 1,
      unit,
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      note
    });

    // Reset form
    setName('');
    setSubCategory('');
    setQuantity(1);
    setUnit('ชิ้น');
    setPricePerUnit(0);
    setNote('');
    setIsAdding(false);
  };

  const handleToggleReceived = async (item) => {
    await onUpdateItem({
      id: item.id,
      isReceived: !item.isReceived
    });
  };

  // Color mappings for category tags
  const getCategoryStyle = (cat) => {
    if (cat === 'ค่าตอบแทน') return { bg: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-200)' };
    if (cat === 'ค่าใช้สอย') return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.2)' };
    if (cat === 'ค่าวัสดุ') return { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)' };
    return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' };
  };

  const formatPrice = (val) => `฿${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>
          {type === 'planned' ? '📋 รายการแผนงบประมาณ (Money Plan)' : '💰 รายการรายจ่ายจริง (Tracking Cost)'}
        </h3>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn btn-primary btn-sm"
          >
            ➕ เพิ่มรายการด้วยตนเอง
          </button>
        )}
      </div>

      {/* Add Item Form (Inline) */}
      {isAdding && (
        <form onSubmit={handleAdd} className="mb-lg animate-fade-in" style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-accent)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>ชื่อรายการ</label>
            <input type="text" className="input" placeholder="ตัวอย่าง: ค่าอาหารกลางวันวิทยากร" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>หมวดหมู่หลัก</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="ค่าตอบแทน">ค่าตอบแทน</option>
              <option value="ค่าใช้สอย">ค่าใช้สอย</option>
              <option value="ค่าวัสดุ">ค่าวัสดุ</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>หมวดย่อย (ถ้ามี)</label>
            <input type="text" className="input" placeholder="เช่น ค่าอาหาร, ค่าของที่ระลึก" value={subCategory} onChange={e => setSubCategory(e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>จำนวน</label>
            <input type="number" step="any" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} min="0.01" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>หน่วย</label>
            <input type="text" className="input" placeholder="คน, กล่อง, ชุด" value={unit} onChange={e => setUnit(e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>ราคาต่อหน่วย</label>
            <input type="number" step="any" className="input" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} min="0" required />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>หมายเหตุ</label>
            <input type="text" className="input" placeholder="หมายเหตุเพิ่มเติม" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAdding(false)}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary btn-sm">บันทึกรายการ</button>
          </div>
        </form>
      )}

      {/* Items Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {type === 'planned' && <th style={{ width: '40px' }}>รับของ</th>}
              <th>รายการ</th>
              <th>หมวดหมู่</th>
              <th>หมวดย่อย</th>
              <th className="text-right">จำนวน</th>
              <th>หน่วย</th>
              <th className="text-right">ราคา/หน่วย</th>
              <th className="text-right">ยอดรวม</th>
              <th>หมายเหตุ</th>
              <th style={{ width: '100px' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isEditing = editingId === item.id;
              const catStyle = getCategoryStyle(item.category);

              if (isEditing) {
                return (
                  <tr key={item.id} style={{ background: 'rgba(14, 165, 233, 0.05)' }}>
                    {type === 'planned' && <td></td>}
                    <td>
                      <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '4px 8px' }} />
                    </td>
                    <td>
                      <select className="input" value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ padding: '4px 8px' }}>
                        <option value="ค่าตอบแทน">ค่าตอบแทน</option>
                        <option value="ค่าใช้สอย">ค่าใช้สอย</option>
                        <option value="ค่าวัสดุ">ค่าวัสดุ</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" className="input" value={editSubCategory} onChange={e => setEditSubCategory(e.target.value)} style={{ padding: '4px 8px' }} />
                    </td>
                    <td>
                      <input type="number" step="any" className="input text-right" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} style={{ padding: '4px 8px', width: '70px' }} />
                    </td>
                    <td>
                      <input type="text" className="input" value={editUnit} onChange={e => setEditUnit(e.target.value)} style={{ padding: '4px 8px', width: '60px' }} />
                    </td>
                    <td>
                      <input type="number" step="any" className="input text-right" value={editPricePerUnit} onChange={e => setEditPricePerUnit(e.target.value)} style={{ padding: '4px 8px', width: '90px' }} />
                    </td>
                    <td className="text-right font-bold font-en">
                      {formatPrice((parseFloat(editQuantity) || 0) * (parseFloat(editPricePerUnit) || 0))}
                    </td>
                    <td>
                      <input type="text" className="input" value={editNote} onChange={e => setEditNote(e.target.value)} style={{ padding: '4px 8px' }} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleSaveEdit(item.id)} className="btn btn-sm" style={{ padding: '4px 8px', backgroundColor: 'var(--color-success)', color: 'white' }}>💾</button>
                        <button onClick={cancelEdit} className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id} style={{ opacity: item.isReceived && type === 'planned' ? 0.6 : 1 }}>
                  {type === 'planned' && (
                    <td>
                      <input 
                        type="checkbox" 
                        checked={item.isReceived} 
                        onChange={() => handleToggleReceived(item)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                  )}
                  <td className="font-medium" style={{ textDecoration: item.isReceived && type === 'planned' ? 'line-through' : 'none' }}>
                    {item.name}
                  </td>
                  <td>
                    <span 
                      className="dept-tag" 
                      style={{ 
                        backgroundColor: catStyle.bg, 
                        color: catStyle.color, 
                        borderColor: catStyle.color,
                        fontSize: '11px',
                        padding: '2px 6px'
                      }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.subCategory || '-'}</td>
                  <td className="text-right font-en">{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td className="text-right font-en">{formatPrice(item.pricePerUnit)}</td>
                  <td className="text-right font-bold font-en">{formatPrice(item.total)}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.note}>
                    {item.note || '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(item)} className="btn btn-sm btn-outline" style={{ padding: '4px 8px', minWidth: 'auto' }}>✏️</button>
                      <button onClick={() => { if(confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) onDeleteItem(item.id); }} className="btn btn-sm btn-outline" style={{ padding: '4px 8px', minWidth: 'auto', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={type === 'planned' ? 10 : 9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                  ไม่มีข้อมูลค่าใช้จ่ายสำหรับประเภทนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
