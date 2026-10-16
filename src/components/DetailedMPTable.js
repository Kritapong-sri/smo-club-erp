'use client';
import { useState, useMemo } from 'react';
import { autoDetectCategory } from '@/lib/autoCategoryMatcher';
import {
  Gem,
  Building2,
  Package,
  Search,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  ClipboardList,
  Sparkles,
  Save,
  X
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'ค่าตอบแทน',
  'ค่าใช้สอย',
  'ค่าวัสดุ',
  'ค่าครุภัณฑ์'
];

const SUB_CATEGORY_MAP = {
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

const PRESET_DEPTS = [
  'ฝ่ายทะเบียน',
  'ฝ่ายสวัสดิการ',
  'ฝ่ายประสาน',
  'ฝ่ายIBC',
  'ฝ่ายสถานที่',
  'ฝ่ายประชาสัมพันธ์',
  'ฝ่ายเหรัญญิก',
];

export default function DetailedMPTable({ items = [], onAddItem, onUpdateItem, onDeleteItem, canEdit, onOpenImportModal }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const [deptName, setDeptName] = useState('ฝ่ายทะเบียน');
  const [customDept, setCustomDept] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('ชิ้น');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [category, setCategory] = useState('ค่าวัสดุ');
  const [subCategory, setSubCategory] = useState(SUB_CATEGORY_MAP['ค่าวัสดุ'][0]);
  const [refUrl, setRefUrl] = useState('');
  const [note, setNote] = useState('');
  const [detectedTag, setDetectedTag] = useState(null);

  const handleNameInputChange = (val) => {
    setName(val);
    const match = autoDetectCategory(val);
    if (match) {
      setCategory(match.category);
      setSubCategory(match.subCategory);
      setDetectedTag(match);
    } else {
      setDetectedTag(null);
    }
  };

  const stats = useMemo(() => {
    const total = items.reduce((sum, i) => sum + (i.total || 0), 0);
    const receivedCount = items.filter(i => i.isReceived).length;
    const depts = new Set(items.map(i => i.deptName || 'ทั่วไป'));
    return {
      total,
      totalCount: items.length,
      receivedCount,
      deptCount: depts.size
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchDept = selectedDeptFilter === 'all' || (item.deptName || 'ทั่วไป') === selectedDeptFilter;
      if (!matchDept) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const iName = (item.name || '').toLowerCase();
      const iDept = (item.deptName || '').toLowerCase();
      const iCat = (item.category || '').toLowerCase();
      const iSub = (item.subCategory || '').toLowerCase();

      return iName.includes(q) || iDept.includes(q) || iCat.includes(q) || iSub.includes(q);
    });
  }, [items, selectedDeptFilter, searchTerm]);

  const groupedByDept = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const d = item.deptName || 'ทั่วไป (Unassigned)';
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const subs = SUB_CATEGORY_MAP[newCat] || [];
    setSubCategory(subs[0] || '');
  };

  const resetForm = () => {
    setEditingItem(null);
    setDeptName('ฝ่ายทะเบียน');
    setCustomDept('');
    setName('');
    setQuantity(1);
    setUnit('ชิ้น');
    setPricePerUnit(0);
    setCategory('ค่าวัสดุ');
    setSubCategory(SUB_CATEGORY_MAP['ค่าวัสดุ'][0]);
    setRefUrl('');
    setNote('');
    setDetectedTag(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    if (PRESET_DEPTS.includes(item.deptName)) {
      setDeptName(item.deptName);
      setCustomDept('');
    } else {
      setDeptName('other');
      setCustomDept(item.deptName || '');
    }

    setName(item.name || '');
    setQuantity(item.quantity || 1);
    setUnit(item.unit || 'ชิ้น');
    setPricePerUnit(item.pricePerUnit || item.price_per_unit || 0);

    const cat = item.category || 'ค่าวัสดุ';
    setCategory(cat);

    const subs = SUB_CATEGORY_MAP[cat] || [];
    setSubCategory(item.subCategory || subs[0] || '');

    setRefUrl(item.refUrl || '');
    setNote(item.note || '');
    setDetectedTag(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDept = deptName === 'other' ? (customDept.trim() || 'ทั่วไป') : deptName;

    const itemData = {
      deptName: finalDept,
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: unit.trim() || 'ชิ้น',
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      total: (parseFloat(quantity) || 1) * (parseFloat(pricePerUnit) || 0),
      category,
      subCategory,
      refUrl: refUrl.trim() || null,
      note: note.trim() || null,
      type: 'planned'
    };

    if (editingItem) {
      await onUpdateItem({ id: editingItem.id, ...itemData });
    } else {
      await onAddItem(itemData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleToggleReceived = async (item) => {
    await onUpdateItem({
      id: item.id,
      isReceived: !item.isReceived
    });
  };

  const formatPrice = (val) => `฿${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getCategoryTheme = (cat) => {
    if (cat === 'ค่าตอบแทน') return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    if (cat === 'ค่าใช้สอย') return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
    if (cat === 'ค่าวัสดุ') return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
    if (cat === 'ค่าครุภัณฑ์') return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="hover-lift" style={{
          background: 'var(--gradient-primary)',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>งบวางแผนรวม (Detailed MP)</span>
            <Gem size={22} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0', letterSpacing: '-0.5px' }}>
            {formatPrice(stats.total)}
          </div>
          <div style={{ fontSize: '12px', opacity: '0.8' }}>
            จากทั้งหมด {stats.totalCount} รายการในแผน
          </div>
        </div>

        <div className="hover-lift" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>ฝ่ายที่จัดวางแผนงบ</span>
            <div style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', padding: '6px', borderRadius: '10px', display: 'flex' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '12px 0 4px 0' }}>
            {stats.deptCount} <span style={{ fontSize: '16px', color: 'var(--text-tertiary)', fontWeight: '500' }}>ฝ่าย</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            แยกตามภารกิจของฝ่าย
          </div>
        </div>

        <div className="hover-lift" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>ได้รับสินค้า/พัสดุแล้ว</span>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '10px', display: 'flex' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', margin: '12px 0 4px 0' }}>
            {stats.receivedCount} <span style={{ fontSize: '16px', color: 'var(--text-tertiary)', fontWeight: '500' }}>/ {stats.totalCount}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            ความก้าวหน้าการจัดซื้อ: {stats.totalCount > 0 ? Math.round((stats.receivedCount / stats.totalCount) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        padding: '16px 20px',
        borderRadius: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-input-wrapper" style={{ minWidth: '220px', flex: 1 }}>
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="input"
              placeholder="ค้นหารายการ / ฝ่าย / หมวด..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>

          <select
            className="input"
            value={selectedDeptFilter}
            onChange={e => setSelectedDeptFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px', fontSize: '13px' }}
          >
            <option value="all">ทุกฝ่าย ({items.length} รายการ)</option>
            {Array.from(new Set(items.map(i => i.deptName || 'ทั่วไป'))).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="btn btn-secondary flex items-center gap-xs"
                style={{ borderRadius: '10px', fontWeight: '700' }}
              >
                <span>นำเข้าจาก Excel/CSV</span>
              </button>
            )}
            <button
              onClick={openAddForm}
              className="btn btn-primary flex items-center gap-xs hover-scale"
              style={{
                padding: '10px 20px',
                fontWeight: '700',
                fontSize: '14px',
                borderRadius: '10px'
              }}
            >
              <Plus size={18} />
              <span>เพิ่มรายการงบประมาณ</span>
            </button>
          </div>
        )}
      </div>

      {Object.keys(groupedByDept).length > 0 ? (
        Object.entries(groupedByDept).map(([dept, deptItems]) => {
          const deptTotal = deptItems.reduce((sum, i) => sum + (i.total || 0), 0);
          const deptReceived = deptItems.filter(i => i.isReceived).length;

          return (
            <div
              key={dept}
              className="hover-glow"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{
                background: 'var(--bg-surface-hover)',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: dept.includes('หัวหน้านิสิต') ? '#7c3aed' : 'var(--blue-600)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '14px',
                    padding: '6px 14px',
                    borderRadius: '8px'
                  }}>
                    {dept}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                    ({deptItems.length} รายการ • รับสินค้าแล้ว {deptReceived}/{deptItems.length})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>รวมฝ่ายนี้:</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--blue-600)' }}>
                    {formatPrice(deptTotal)}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0 8px 8px 8px' }}>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <th style={{ padding: '12px', textAlign: 'center', width: '50px', fontSize: '12px' }}>#</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '60px', fontSize: '12px' }}>พัสดุ</th>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '180px', fontSize: '12px' }}>รายการ</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '70px', fontSize: '12px' }}>จำนวน</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '70px', fontSize: '12px' }}>หน่วย</th>
                        <th style={{ padding: '12px', textAlign: 'right', minWidth: '110px', fontSize: '12px' }}>ราคา/หน่วย</th>
                        <th style={{ padding: '12px', textAlign: 'right', minWidth: '120px', fontSize: '12px' }}>รวม (บาท)</th>
                        <th style={{ padding: '12px', textAlign: 'center', minWidth: '110px', fontSize: '12px' }}>หมวดหลัก</th>
                        <th style={{ padding: '12px', textAlign: 'left', minWidth: '130px', fontSize: '12px' }}>หมวดย่อย</th>
                        <th style={{ padding: '12px', textAlign: 'center', width: '90px', fontSize: '12px' }}>Ref Link</th>
                        {canEdit && <th style={{ padding: '12px', textAlign: 'center', width: '100px', fontSize: '12px' }}>การกระทำ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {deptItems.map((item, idx) => {
                        const theme = getCategoryTheme(item.category);
                        return (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: '1px solid var(--border-secondary)',
                              background: item.isReceived ? 'rgba(220, 252, 231, 0.3)' : 'transparent',
                              transition: 'background 0.15s'
                            }}
                          >
                            <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                              {idx + 1}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!item.isReceived}
                                onChange={() => canEdit && handleToggleReceived(item)}
                                disabled={!canEdit}
                                style={{ width: '16px', height: '16px', cursor: canEdit ? 'pointer' : 'default', accentColor: '#16a34a' }}
                                title={item.isReceived ? 'ได้รับสินค้าแล้ว (คลิกเพื่อยกเลิก)' : 'ยังไม่ได้รับสินค้า (คลิกเพื่อทำเครื่องหมาย)'}
                              />
                            </td>

                            <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                                {item.name}
                              </div>
                              {item.note && (
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                  {item.note}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
                              {item.quantity}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              {item.unit}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px' }}>
                              {formatPrice(item.pricePerUnit || item.price_per_unit)}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--blue-600)', fontFamily: 'monospace', fontSize: '14px' }}>
                              {formatPrice(item.total)}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{
                                background: theme.bg,
                                color: theme.color,
                                border: `1px solid ${theme.border}`,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'inline-block'
                              }}>
                                {item.category}
                              </span>
                            </td>

                            <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                              {item.subCategory || '-'}
                            </td>

                            <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {item.refUrl ? (
                                <a
                                  href={item.refUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-outline flex items-center gap-xs justify-center"
                                  style={{ textDecoration: 'none', fontSize: '11px' }}
                                >
                                  <ExternalLink size={12} /> ลิงก์
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                              )}
                            </td>

                            {canEdit && (
                              <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => openEditForm(item)}
                                    className="btn btn-xs btn-secondary"
                                    title="แก้ไข"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => { if (confirm('ยืนยันลบรายการนี้?')) onDeleteItem(item.id); }}
                                    className="btn btn-xs btn-danger"
                                    title="ลบ"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px dashed var(--border-primary)',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <ClipboardList size={48} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>ยังไม่มีรายการงบประมาณ (Detailed MP)</h3>
          <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>เริ่มต้นโดยกดปุ่มด้านล่างเพื่อเพิ่มรายการงบประมาณของฝ่ายคุณ</p>
          {canEdit && (
            <button onClick={openAddForm} className="btn btn-primary hover-scale flex items-center gap-xs" style={{ padding: '10px 24px', fontWeight: '700', margin: '0 auto' }}>
              <Plus size={16} />
              <span>เพิ่มรายการงบประมาณใหม่</span>
            </button>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content card animate-fade-in" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-primary)' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingItem ? <Pencil size={20} /> : <Plus size={20} />}
                  <span>{editingItem ? 'แก้ไขรายการงบประมาณ' : 'เพิ่มรายการงบประมาณ (Detailed MP)'}</span>
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                  กรอกข้อมูลรายการงบประมาณของแต่ละฝ่าย
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm px-xs"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  1. ฝ่ายที่จัด/รับผิดชอบ <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {PRESET_DEPTS.map(d => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => { setDeptName(d); setCustomDept(''); }}
                      style={{
                        border: deptName === d ? '2px solid var(--blue-600)' : '1px solid var(--border-primary)',
                        background: deptName === d ? 'var(--blue-50)' : 'var(--bg-surface)',
                        color: deptName === d ? 'var(--blue-600)' : 'var(--text-primary)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setDeptName('other')}
                    style={{
                      border: deptName === 'other' ? '2px solid var(--blue-600)' : '1px solid var(--border-primary)',
                      background: deptName === 'other' ? 'var(--blue-50)' : 'var(--bg-surface)',
                      color: deptName === 'other' ? 'var(--blue-600)' : 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    กำหนดฝ่ายเอง...
                  </button>
                </div>

                {deptName === 'other' && (
                  <input
                    type="text"
                    className="input"
                    placeholder="พิมพ์ชื่อฝ่ายของคุณเอง เช่น ฝ่ายวิชาการ, ฝ่ายกราฟิก"
                    value={customDept}
                    onChange={e => setCustomDept(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  2. ชื่อรายการค่าใช้จ่าย <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="เช่น กระดาษ A4, หมึกพิมพ์, ปลั๊กไฟ, ลูกฟุตบอล, ค่าอาหารว่าง"
                  value={name}
                  onChange={e => handleNameInputChange(e.target.value)}
                  required
                />

                {detectedTag && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#047857',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: '600'
                  }} className="animate-fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      <span>ตรวจพบหมวดหมู่อัตโนมัติ:</span>
                      <span style={{ background: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        {detectedTag.category} &rarr; {detectedTag.subCategory}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#065f46' }}>(พบคำว่า “{detectedTag.matchedKeyword}”)</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    จำนวน <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="input"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="0.01"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    หน่วย
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="แผ่น, กล่อง, คน, ใบ"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    ราคาต่อหน่วย (บาท) <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="input"
                    value={pricePerUnit}
                    onChange={e => setPricePerUnit(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue-700)' }}>รวม (Auto Calculated):</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--blue-600)' }}>
                  {formatPrice((parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0))}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    3. หมวดหลัก <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <select className="input" value={category} onChange={e => handleCategoryChange(e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    4. หมวดย่อย <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <select className="input" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                    {(SUB_CATEGORY_MAP[category] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  5. Ref Link สินค้า (หากสั่งซื้อออนไลน์)
                </label>
                <input
                  type="url"
                  className="input font-en"
                  placeholder="https://shopee.co.th/... หรือ https://..."
                  value={refUrl}
                  onChange={e => setRefUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  6. หมายเหตุเพิ่มเติม
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="เช่น สั่งซื้อล่วงหน้า 3 วัน"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-xs" style={{ fontWeight: '700', padding: '10px 24px' }}>
                  <Save size={16} />
                  <span>บันทึกรายการ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
