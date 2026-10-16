'use client';
import { useMemo, useState } from 'react';
import { Briefcase, Package, Users, Laptop, ListChecks } from 'lucide-react';

const CATEGORIES = [
  { name: 'ค่าใช้สอย', icon: <Briefcase size={16} />, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', headerBg: '#e0f2fe' },
  { name: 'ค่าวัสดุ', icon: <Package size={16} />, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', headerBg: '#ffe4e6' },
  { name: 'ค่าตอบแทน', icon: <Users size={16} />, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', headerBg: '#dcfce7' },
  { name: 'ค่าครุภัณฑ์', icon: <Laptop size={16} />, color: '#d97706', bg: '#fffbeb', border: '#fde68a', headerBg: '#fef3c7' }
];

function thaiBahtText(num) {
  if (isNaN(num) || num === 0) return 'ศูนย์บาทถ้วน';
  num = Math.round(num * 100) / 100;
  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const digits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const [bahtStr, satangStr] = num.toFixed(2).split('.');
  let bahtVal = parseInt(bahtStr, 10);
  let res = '';

  if (bahtVal > 0) {
    let len = bahtStr.length;
    for (let i = 0; i < len; i++) {
      let digit = parseInt(bahtStr[i], 10);
      let pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          res += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          res += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1) {
          res += 'เอ็ด';
        } else {
          res += numbers[digit] + digits[pos];
        }
      }
    }
    res += 'บาท';
  }

  let satangVal = parseInt(satangStr, 10);
  if (satangVal === 0) {
    res += 'ถ้วน';
  } else {
    let len = satangStr.length;
    for (let i = 0; i < len; i++) {
      let digit = parseInt(satangStr[i], 10);
      let pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          res += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          res += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1) {
          res += 'เอ็ด';
        } else {
          res += numbers[digit] + digits[pos];
        }
      }
    }
    res += 'สตางค์';
  }

  return res;
}

export default function MPSummaryView({ items = [], activityTitle = '' }) {
  const [copied, setCopied] = useState(false);

  const plannedItems = useMemo(() => {
    return items.filter(i => i.type === 'planned');
  }, [items]);

  const summaryData = useMemo(() => {
    const mainTotals = {
      'ค่าใช้สอย': 0,
      'ค่าวัสดุ': 0,
      'ค่าตอบแทน': 0,
      'ค่าครุภัณฑ์': 0
    };
    const subTotals = {};

    plannedItems.forEach(item => {
      const val = item.total || 0;
      const cat = item.category || 'ค่าวัสดุ';
      const sub = item.subCategory || 'อื่นๆ';

      if (mainTotals[cat] !== undefined) {
        mainTotals[cat] += val;
      }

      if (!subTotals[cat]) subTotals[cat] = {};
      if (!subTotals[cat][sub]) subTotals[cat][sub] = 0;
      subTotals[cat][sub] += val;
    });

    const grandTotal = Object.values(mainTotals).reduce((a, b) => a + b, 0);

    return {
      mainTotals,
      subTotals,
      grandTotal
    };
  }, [plannedItems]);

  const formatPrice = (val) => `${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const proposalStructure = useMemo(() => {
    const result = [];
    let catCounter = 1;

    CATEGORIES.forEach(catObj => {
      const catName = catObj.name;
      const subMap = summaryData.subTotals[catName] || {};
      const activeSubs = Object.entries(subMap).filter(([_, val]) => val > 0);
      const mainTotal = summaryData.mainTotals[catName] || 0;

      if (activeSubs.length > 0) {
        result.push({
          num: catCounter,
          catName,
          catObj,
          mainTotal,
          subs: activeSubs.map(([subName, val], idx) => ({
            subNum: `${catCounter}.${idx + 1}`,
            subName: subName.startsWith('ค่า') || subName.startsWith('วัสดุ') || subName.startsWith('ครุภัณฑ์')
              ? subName
              : `ค่า${subName}`,
            val
          }))
        });
        catCounter++;
      }
    });

    return result;
  }, [summaryData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div className="card hover-glow" style={{
        background: 'var(--bg-surface)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{
          background: 'var(--bg-surface-hover)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListChecks size={20} style={{ color: 'var(--blue-600)' }} />
            <span>งบประมาณที่ใช้ในการดำเนินงาน (จำแนกตามหมวดรายจ่าย)</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
            สรุปงบประมาณแบบแยกหมวดหมู่และช่องรายการ สำหรับนำไปใส่ในเล่มอนุมัติโครงการ
          </p>
        </div>

        {proposalStructure.length > 0 ? (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'var(--bg-surface)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontWeight: '800', textAlign: 'left', borderBottom: '1px solid var(--border-primary)' }}>
                  <th style={{ padding: '12px 16px', width: '90px', borderRight: '1px solid var(--border-primary)', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ padding: '12px 16px', borderRight: '1px solid var(--border-primary)' }}>หมวดรายจ่าย / รายการย่อย</th>
                  <th style={{ padding: '12px 16px', width: '200px', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {proposalStructure.map(cat => (
                  <tr key={cat.num} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td colSpan={3} style={{ padding: 0 }}>
                      <div style={{ width: '100%' }}>
                        <div style={{
                          background: cat.catObj.headerBg,
                          padding: '12px 16px',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          fontWeight: '800',
                          color: cat.catObj.color,
                          borderBottom: '1px solid var(--border-primary)',
                          borderTop: cat.num > 1 ? '1px solid var(--border-primary)' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {cat.catObj.icon}
                            <span>{cat.num}. {cat.catName}</span>
                          </div>
                          <div style={{ fontSize: '15px' }}>
                            รวมหมวดนี้: ฿{formatPrice(cat.mainTotal)}
                          </div>
                        </div>

                        {cat.subs.map(sub => (
                          <div 
                            key={sub.subNum}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '90px 1fr 200px',
                              borderBottom: '1px solid var(--border-secondary)',
                              background: 'var(--bg-surface)',
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <div style={{
                              padding: '12px 16px',
                              borderRight: '1px solid var(--border-secondary)',
                              textAlign: 'center',
                              fontWeight: '700',
                              color: 'var(--text-tertiary)',
                              fontSize: '13px'
                            }}>
                              {sub.subNum}
                            </div>

                            <div style={{
                              padding: '12px 16px',
                              borderRight: '1px solid var(--border-secondary)',
                              fontWeight: '600',
                              color: 'var(--text-primary)'
                            }}>
                              {sub.subName}
                            </div>

                            <div style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              fontWeight: '800',
                              color: 'var(--text-primary)'
                            }} className="font-en">
                              {formatPrice(sub.val)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr style={{ background: 'var(--bg-surface-hover)', borderTop: '2px solid var(--border-primary)' }}>
                  <td colSpan={2} style={{ padding: '16px 20px', fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', borderRight: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>รวมงบประมาณทั้งสิ้น (Grand Total)</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                        ({thaiBahtText(summaryData.grandTotal)})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '800', fontSize: '20px', color: 'var(--blue-600)', background: 'var(--blue-50)' }} className="font-en">
                    ฿{formatPrice(summaryData.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
            ยังไม่มีข้อมูลรายการงบประมาณ กรุณากรอกข้อมูลในแท็บ <b>Detailed MP</b> ก่อน
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {CATEGORIES.map(catObj => {
          const mainTotal = summaryData.mainTotals[catObj.name] || 0;
          const pct = summaryData.grandTotal > 0 ? Math.round((mainTotal / summaryData.grandTotal) * 100) : 0;

          return (
            <div
              key={catObj.name}
              className="hover-lift"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${catObj.border}`,
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="flex items-center gap-xs" style={{ fontSize: '14px', fontWeight: '700', color: catObj.color }}>
                  {catObj.icon} <span>{catObj.name}</span>
                </span>
                <span style={{ fontSize: '12px', background: catObj.bg, color: catObj.color, padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 0 0' }}>
                ฿{formatPrice(mainTotal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
