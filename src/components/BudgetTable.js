'use client';
import { useState } from 'react';
import { autoDetectCategory } from '@/lib/autoCategoryMatcher';
import { ClipboardList, Banknote, Plus, Pencil, Trash2, ExternalLink, Save, X, Sparkles } from 'lucide-react';

const SUB_CATEGORIES = {
  'ค่าตอบแทน': [
    'ค่าวิทยากร',
    'ค่ากรรมการ',
    'ค่าบุคลากร',
    'ค่าตอบแทนอื่นๆ'
  ],
  'ค่าใช้สอย': [
    'ค่าอาหารและเครื่องดื่ม',
    'ค่าสถานที่',
    'ค่าของที่ระลึก',
    'ค่ายานพาหนะ',
    'ค่าจ้างเหมาบริการ',
    'ค่าใช้จ่ายในการจัดฝึกอบรม',
    'ค่าใช้สอยอื่นๆ'
  ],
  'ค่าวัสดุ': [
    'วัสดุสำนักงาน',
    'วัสดุไฟฟ้าและวิทยุ',
    'วัสดุงานบ้านงานครัว',
    'วัสดุก่อสร้าง',
    'วัสดุวิทยาศาสตร์หรือการแพทย์',
    'วัสดุยานพาหนะและขนส่ง',
    'วัสดุเชื้อเพลิง',
    'วัสดุการเกษตร',
    'วัสดุโฆษณาและเผยแพร่',
    'วัสดุเครื่องแต่งกาย',
    'วัสดุกีฬา',
    'วัสดุคอมพิวเตอร์',
    'วัสดุสนาม',
    'วัสดุการศึกษา',
    'วัสดุสำรวจ',
    'วัสดุดนตรี',
    'วัสดุอื่นๆ'
  ],
  'ค่าครุภัณฑ์': [
    'ครุภัณฑ์สำนักงาน',
    'ครุภัณฑ์คอมพิวเตอร์',
    'ครุภัณฑ์การศึกษา',
    'ครุภัณฑ์อื่นๆ'
  ]
};

const DEPARTMENTS = [
  'ฝ่ายทะเบียน',
  'ฝ่ายสวัสดิการ',
  'ฝ่ายประสานวิทยากร',
  'ฝ่ายIBC',
  'ฝ่ายสถานที่',
  'ฝ่ายการเงินและเหรัญญิก',
  'ฝ่ายประชาสัมพันธ์',
  'ฝ่ายอื่นๆ'
];

const DISBURSEMENT_TYPES = [
  'สำรองจ่าย',
  'ยืมเงินสโมสร',
  'จ่ายตรงผู้ขาย',
  'อื่นๆ'
];

export default function BudgetTable({ items, type, onAddItem, onUpdateItem, onDeleteItem }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deptName, setDeptName] = useState('ฝ่ายทะเบียน');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ค่าวัสดุ');
  const [subCategory, setSubCategory] = useState('วัสดุสำนักงาน');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('ชิ้น');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [refUrl, setRefUrl] = useState('');
  const [billDate, setBillDate] = useState('');
  const [disbursementType, setDisbursementType] = useState('สำรองจ่าย');
  const [createdByName, setCreatedByName] = useState('');
  const [note, setNote] = useState('');
  const [detectedTag, setDetectedTag] = useState(null);

  const [editDeptName, setEditDeptName] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('ค่าวัสดุ');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState('ชิ้น');
  const [editPricePerUnit, setEditPricePerUnit] = useState(0);
  const [editRefUrl, setEditRefUrl] = useState('');
  const [editBillDate, setEditBillDate] = useState('');
  const [editDisbursementType, setEditDisbursementType] = useState('สำรองจ่าย');
  const [editCreatedByName, setEditCreatedByName] = useState('');
  const [editNote, setEditNote] = useState('');

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditDeptName(item.deptName || 'ฝ่ายทะเบียน');
    setEditName(item.name || '');
    setEditCategory(item.category || 'ค่าวัสดุ');
    setEditSubCategory(item.subCategory || '');
    setEditQuantity(item.quantity || 1);
    setEditUnit(item.unit || 'ชิ้น');
    setEditPricePerUnit(item.pricePerUnit || 0);
    setEditRefUrl(item.refUrl || '');
    setEditBillDate(item.billDate || '');
    setEditDisbursementType(item.disbursementType || 'สำรองจ่าย');
    setEditCreatedByName(item.createdByName || '');
    setEditNote(item.note || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    const q = parseFloat(editQuantity) || 1;
    const p = parseFloat(editPricePerUnit) || 0;
    
    await onUpdateItem({
      id,
      deptName: editDeptName,
      name: editName,
      category: editCategory,
      subCategory: editSubCategory,
      quantity: q,
      unit: editUnit,
      pricePerUnit: p,
      total: q * p,
      refUrl: editRefUrl || null,
      billDate: editBillDate || null,
      disbursementType: editDisbursementType,
      createdByName: editCreatedByName || null,
      note: editNote || null,
    });
    setEditingId(null);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    
    const matched = autoDetectCategory(val);
    if (matched) {
      setCategory(matched.category);
      setSubCategory(matched.subCategory);
      setDetectedTag(matched);
    } else {
      setDetectedTag(null);
    }
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const availableSubs = SUB_CATEGORIES[newCat] || [];
    setSubCategory(availableSubs[0] || '');
  };

  const handleEditCategoryChange = (e) => {
    const newCat = e.target.value;
    setEditCategory(newCat);
    const availableSubs = SUB_CATEGORIES[newCat] || [];
    setEditSubCategory(availableSubs[0] || '');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const q = parseFloat(quantity) || 1;
    const p = parseFloat(pricePerUnit) || 0;

    await onAddItem({
      deptName,
      name: name.trim(),
      category,
      subCategory,
      quantity: q,
      unit: unit.trim() || 'ชิ้น',
      pricePerUnit: p,
      total: q * p,
      refUrl: refUrl.trim() || null,
      billDate: billDate.trim() || null,
      disbursementType,
      createdByName: createdByName.trim() || null,
      note: note.trim() || null,
      type: type || 'planned'
    });

    setName('');
    setQuantity(1);
    setPricePerUnit(0);
    setRefUrl('');
    setBillDate('');
    setCreatedByName('');
    setNote('');
    setDetectedTag(null);
    setIsAdding(false);
  };

  const handleToggleReceived = async (item) => {
    await onUpdateItem({
      id: item.id,
      isReceived: !item.isReceived
    });
  };

  const getCategoryStyle = (cat) => {
    if (cat === 'ค่าตอบแทน') return { bg: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-200)' };
    if (cat === 'ค่าใช้สอย') return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.2)' };
    if (cat === 'ค่าวัสดุ') return { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.2)' };
    return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' };
  };

  const formatPrice = (val) => `฿${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="card hover-glow" style={{ background: '#ffffff', border: '1px solid var(--border-primary)', padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'planned' ? <ClipboardList size={20} style={{ color: 'var(--blue-600)' }} /> : <Banknote size={20} style={{ color: 'var(--color-success)' }} />}
            <span>{type === 'planned' ? 'Detailed MP (รายการแผนงบประมาณ)' : 'Cost Tracking (ติดตามรายจ่ายจริง)'}</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
            {type === 'planned' 
              ? 'กรอกรายการที่วางแผนจะใช้ แยกตามฝ่าย หมวดหลัก หมวดย่อย และสถานะการได้รับสินค้า'
              : 'บันทึกรายจ่ายจริงที่เกิดขึ้น ยอดในบิล วันที่ในบิล ระบบเบิกจ่าย และผู้กรอก'
            }
          </p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn btn-primary btn-sm flex items-center gap-xs hover-scale"
          >
            <Plus size={16} />
            <span>เพิ่มรายการใหม่</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-lg animate-fade-in" style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed var(--blue-400)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}>
          {type === 'planned' && (
            <div className="input-group">
              <label className="input-label">ฝ่ายที่จัด/รับผิดชอบ</label>
              <select className="input" value={deptName} onChange={e => setDeptName(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">ชื่อรายการ <span style={{ color: 'red' }}>*</span></label>
            <input type="text" className="input" placeholder="เช่น ค่ากระดาษ A4" value={name} onChange={handleNameChange} required />
            {detectedTag && (
              <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>อัตโนมัติ: {detectedTag.category} › {detectedTag.subCategory}</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">หมวดหลัก</label>
            <select className="input" value={category} onChange={handleCategoryChange}>
              <option value="ค่าตอบแทน">ค่าตอบแทน</option>
              <option value="ค่าใช้สอย">ค่าใช้สอย</option>
              <option value="ค่าวัสดุ">ค่าวัสดุ</option>
              <option value="ค่าครุภัณฑ์">ค่าครุภัณฑ์</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">หมวดย่อย</label>
            <select className="input" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
              {(SUB_CATEGORIES[category] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="input-group">
              <label className="input-label">จำนวน</label>
              <input type="number" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" />
            </div>
            <div className="input-group">
              <label className="input-label">หน่วย</label>
              <input type="text" className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="ชิ้น/คน" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">ราคาต่อหน่วย (บาท)</label>
            <input type="number" step="any" className="input" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required min="0" />
          </div>

          {type === 'planned' ? (
            <div className="input-group">
              <label className="input-label">Ref Link สินค้า (ถ้ามี)</label>
              <input type="url" className="input font-en" placeholder="https://..." value={refUrl} onChange={e => setRefUrl(e.target.value)} />
            </div>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">วันที่ในบิล</label>
                <input type="date" className="input" value={billDate} onChange={e => setBillDate(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">การเบิกจ่าย</label>
                <select className="input" value={disbursementType} onChange={e => setDisbursementType(e.target.value)}>
                  {DISBURSEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">ผู้กรอก/ผู้เบิก</label>
                <input type="text" className="input" placeholder="ชื่อผู้เบิก..." value={createdByName} onChange={e => setCreatedByName(e.target.value)} />
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">หมายเหตุ</label>
            <input type="text" className="input" placeholder="เพิ่มเติม..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary btn-sm">ยกเลิก</button>
            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-xs">
              <Save size={14} />
              <span>บันทึกรายการ</span>
            </button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {type === 'planned' ? (
                <>
                  <th>ฝ่าย</th>
                  <th>รายการ</th>
                  <th className="text-right">จำนวน</th>
                  <th>หน่วย</th>
                  <th className="text-right">ราคา/หน่วย</th>
                  <th className="text-right">รวม (บาท)</th>
                  <th>หมวดหลัก</th>
                  <th>หมวดย่อย</th>
                  <th>Ref Link</th>
                  <th className="text-center">ได้รับพัสดุ</th>
                  <th className="text-center">จัดการ</th>
                </>
              ) : (
                <>
                  <th>#</th>
                  <th>รายการ (รายจ่ายจริง)</th>
                  <th className="text-right">ยอดรวมจริง</th>
                  <th>วันที่ในบิล</th>
                  <th>หมวดหลัก</th>
                  <th>หมวดย่อย</th>
                  <th>ระบบเบิกจ่าย</th>
                  <th>ผู้กรอก</th>
                  <th>หมายเหตุ</th>
                  <th className="text-center">จัดการ</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const catStyle = getCategoryStyle(item.category);
              const isEditing = editingId === item.id;

              if (isEditing) {
                return (
                  <tr key={item.id} style={{ background: '#f1f5f9' }}>
                    {type === 'planned' ? (
                      <>
                        <td>
                          <select className="input" value={editDeptName} onChange={e => setEditDeptName(e.target.value)} style={{ padding: '4px' }}>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td>
                          <input type="number" className="input" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} style={{ padding: '4px', width: '60px' }} />
                        </td>
                        <td>
                          <input type="text" className="input" value={editUnit} onChange={e => setEditUnit(e.target.value)} style={{ padding: '4px', width: '60px' }} />
                        </td>
                        <td>
                          <input type="number" step="any" className="input" value={editPricePerUnit} onChange={e => setEditPricePerUnit(e.target.value)} style={{ padding: '4px', width: '80px' }} />
                        </td>
                        <td className="text-right font-bold">{formatPrice((parseFloat(editQuantity)||0)*(parseFloat(editPricePerUnit)||0))}</td>
                        <td>
                          <select className="input" value={editCategory} onChange={handleEditCategoryChange} style={{ padding: '4px' }}>
                            <option value="ค่าตอบแทน">ค่าตอบแทน</option>
                            <option value="ค่าใช้สอย">ค่าใช้สอย</option>
                            <option value="ค่าวัสดุ">ค่าวัสดุ</option>
                            <option value="ค่าครุภัณฑ์">ค่าครุภัณฑ์</option>
                          </select>
                        </td>
                        <td>
                          <select className="input" value={editSubCategory} onChange={e => setEditSubCategory(e.target.value)} style={{ padding: '4px' }}>
                            {(SUB_CATEGORIES[editCategory] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="text" className="input font-en" value={editRefUrl} onChange={e => setEditRefUrl(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td className="text-center">-</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleSaveEdit(item.id)} className="btn btn-sm btn-primary" style={{ padding: '4px 8px' }}><Save size={14} /></button>
                            <button onClick={cancelEdit} className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }}><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-en text-tertiary">{idx + 1}</td>
                        <td>
                          <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td>
                          <input type="number" step="any" className="input" value={editPricePerUnit} onChange={e => setEditPricePerUnit(e.target.value)} style={{ padding: '4px', width: '90px' }} />
                        </td>
                        <td>
                          <input type="date" className="input" value={editBillDate} onChange={e => setEditBillDate(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td>
                          <select className="input" value={editCategory} onChange={handleEditCategoryChange} style={{ padding: '4px' }}>
                            <option value="ค่าตอบแทน">ค่าตอบแทน</option>
                            <option value="ค่าใช้สอย">ค่าใช้สอย</option>
                            <option value="ค่าวัสดุ">ค่าวัสดุ</option>
                            <option value="ค่าครุภัณฑ์">ค่าครุภัณฑ์</option>
                          </select>
                        </td>
                        <td>
                          <select className="input" value={editSubCategory} onChange={e => setEditSubCategory(e.target.value)} style={{ padding: '4px' }}>
                            {(SUB_CATEGORIES[editCategory] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="input" value={editDisbursementType} onChange={e => setEditDisbursementType(e.target.value)} style={{ padding: '4px' }}>
                            {DISBURSEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="text" className="input" value={editCreatedByName} onChange={e => setEditCreatedByName(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td>
                          <input type="text" className="input" value={editNote} onChange={e => setEditNote(e.target.value)} style={{ padding: '4px' }} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleSaveEdit(item.id)} className="btn btn-sm btn-primary" style={{ padding: '4px 8px' }}><Save size={14} /></button>
                            <button onClick={cancelEdit} className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }}><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              }

              return (
                <tr key={item.id} style={{ opacity: item.isReceived && type === 'planned' ? 0.6 : 1 }}>
                  {type === 'planned' ? (
                    <>
                      <td style={{ fontSize: '12px', fontWeight: '600', color: 'var(--blue-600)' }}>
                        {item.deptName || 'ฝ่ายทั่วไป'}
                      </td>
                      <td className="font-medium" style={{ textDecoration: item.isReceived ? 'line-through' : 'none' }}>
                        {item.name}
                      </td>
                      <td className="text-right font-en">{item.quantity}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{item.unit}</td>
                      <td className="text-right font-en">{formatPrice(item.pricePerUnit)}</td>
                      <td className="text-right font-bold font-en">{formatPrice(item.total)}</td>
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
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.subCategory || '-'}</td>
                      <td>
                        {item.refUrl ? (
                          <a href={item.refUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs" style={{ color: 'var(--blue-500)', fontSize: '12px' }}>
                            <ExternalLink size={12} /> Link สินค้า
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={item.isReceived} 
                          onChange={() => handleToggleReceived(item)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-en text-tertiary" style={{ width: '40px' }}>{idx + 1}</td>
                      <td className="font-medium">{item.name}</td>
                      <td className="text-right font-bold font-en text-success">{formatPrice(item.total)}</td>
                      <td className="font-en text-sm">{item.billDate || '-'}</td>
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
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.subCategory || '-'}</td>
                      <td>
                        <span style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.disbursementType || 'สำรองจ่าย'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{item.createdByName || '-'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.note || '-'}</td>
                    </>
                  )}

                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(item)} className="btn btn-sm btn-outline" style={{ padding: '4px 8px', minWidth: 'auto' }}><Pencil size={13} /></button>
                      <button onClick={() => { if(confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) onDeleteItem(item.id); }} className="btn btn-sm btn-outline" style={{ padding: '4px 8px', minWidth: 'auto', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={type === 'planned' ? 11 : 10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                  {type === 'planned' ? 'ยังไม่มีรายการแผนงบประมาณ (Detailed MP)' : 'ยังไม่มีรายการบันทึกรายจ่ายจริง (Cost Tracking)'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
