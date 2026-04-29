// MOMAH KPIs 2026 - Application Logic (V4 - Professional Government Sidebar)
const App = (function () {
  // Default users seeded if no users exist in localStorage
  const DEFAULT_USERS = [
    { username: 'admin', email: 'admin@momah.gov.sa', password: 'momah2026', name: 'زهره الحيائي', role: 'admin' },
    { username: 'user',  email: 'user@momah.gov.sa',  password: '123456',    name: 'مستخدم النظام', role: 'viewer' },
  ];

  function getUsers() {
    try {
      const stored = JSON.parse(localStorage.getItem('momah_users') || 'null');
      if (stored && Array.isArray(stored)) return stored;
    } catch (e) {}
    localStorage.setItem('momah_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS.slice();
  }
  function saveUsers(users) { localStorage.setItem('momah_users', JSON.stringify(users)); }
  function findUser(usernameOrEmail) {
    return getUsers().find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
  }

  const PALETTE = ['#00563F','#00833E','#4FA76A','#5FCFC4','#1FA89C','#B6E3C6','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];

  // Active filtered data per tab
  const STATE = {
    bi: null,
    ops: null,
    strategy: null,
    charts: {},
    soundOn: true,
    currentModalTab: null,
    theme: 'light',
    lang: 'ar',
  };

  // ================== I18N ==================
  const I18N = {
    ar: {
      appTitle: 'لوحة مؤشرات قطاع التخطيط والتطوير',
      appSubtitle: 'وزارة البلديات والإسكان · الفترة الثانية 2026',
      dashboardManager: 'مدير اللوحة',
      logout: 'تسجيل الخروج',
      support: 'الدعم الفني',
      supportTitle: 'الدعم الفني',
      supportDesc: 'للاستفسارات والدعم الفني، يرجى التواصل مع فريق الدعم عبر البريد الإلكتروني التالي:',
      supportEmail: 'البريد الإلكتروني',
      supportHours: 'أوقات الدعم: الأحد - الخميس · 8:00 ص - 4:00 م',
      sendEmail: 'إرسال بريد إلكتروني',
      close: 'إغلاق',
      sectionPerformance: 'سجل الأداء',
      sectionWorkspace: 'مساحة العمل',
      sectionAdmin: 'الإدارة',
      navNotifications: 'الإشعارات',
      navPerformance: 'الأداء',
      navWorkplan: 'خطة العمل',
      navKpiAnalytics: 'تحليلات المؤشرات',
      navInterventions: 'التدخلات',
      navReports: 'التقارير',
      navExportedReports: 'التقارير المصدّرة',
      navAiAnalytics: 'تحليلات الذكاء الاصطناعي',
      navMyUpdates: 'تحديثاتي',
      navFileUpload: 'رفع الملفات الذكي',
      navRepository: 'المستودع',
      navAdmin: 'الإدارة',
      emptyPageMsg: 'هذا القسم قيد التطوير',
      sidebarSection: 'المؤشرات',
      tabOverview: 'مؤشر عام',
      tabBi: 'مركز ذكاء الأعمال ودعم القرار',
      tabOps: 'مركز مراقبة الأداء التشغيلي',
      tabStrategy: 'وكالة التخطيط الاستراتيجي',
      overviewTitle: 'المؤشر العام - نظرة شاملة',
      overviewAllEntities: 'جميع الجهات',
      entityBi: 'ذكاء الأعمال',
      entityOps: 'الأداء التشغيلي',
      entityStrategy: 'التخطيط الاستراتيجي',
      chartEntityDist: 'توزيع المشاريع حسب الجهة',
      chartEntityAvg: 'متوسط الإنجاز حسب الجهة',
      filterTitle: 'عناصر التحكم والفلاتر',
      periodLabel: 'الفترة الزمنية',
      periodAll: 'عرض الكل',
      periodDay: 'يومي',
      periodMonth: 'شهري',
      periodYear: 'سنوي',
      fromDate: 'من تاريخ',
      toDate: 'إلى تاريخ',
      enableCompare: 'تفعيل المقارنة',
      cmpFrom: 'مقارنة - من',
      cmpTo: 'مقارنة - إلى',
      all: 'الكل',
      apply: 'تطبيق',
      reset: 'إعادة تعيين',
      btnAdd: '+ إضافة',
      btnExcel: 'تصدير Excel',
      btnPdf: 'تصدير PDF',
      btnPrint: 'طباعة',
      kpiTotal: 'إجمالي المشاريع',
      kpiAvg: 'متوسط نسبة الإنجاز',
      kpiCost: 'إجمالي التكلفة',
      kpiLate: 'مشاريع متأخرة',
      kpiSubFiltered: 'بعد تطبيق الفلاتر',
      kpiSubAvg: 'للمشاريع المعروضة',
      kpiSubCost: 'ريال سعودي',
      kpiSubAction: 'بحاجة لإجراء',
      opsTotal: 'إجمالي المخرجات',
      opsDone: 'مكتمل',
      opsSubDone: 'مخرجات مسلَّمة',
      opsTrack: 'على المسار',
      opsSubTrack: 'قيد التنفيذ',
      opsLate: 'متأخر',
      compareTitle: 'مقارنة بالفترة السابقة',
      currentVsPrev: 'الحالية / السابقة',
      modalAddTitle: 'إضافة سجل جديد',
      save: 'حفظ',
      cancel: 'إلغاء',
      chartCat: 'توزيع المشاريع حسب التصنيف',
      chartProgress: 'نسبة الإنجاز الفعلي حسب المشروع',
      chartOpsStatus: 'توزيع حالات المخرجات',
      chartOpsEntity: 'المخرجات حسب الجهة المسندة',
      tableTitleBi: 'تفاصيل مشاريع مركز ذكاء الأعمال ودعم القرار',
      tableTitleOps: 'تفاصيل مشاريع مركز مراقبة الأداء التشغيلي',
      tableTitleStrategy: 'تفاصيل مشاريع وكالة التخطيط الاستراتيجي',
      noData: 'لا توجد بيانات',
      userMgmtShort: 'المستخدمون',
      userMgmtTitle: 'إدارة المستخدمين والصلاحيات',
      addNewUser: 'إضافة مستخدم جديد',
      fullName: 'الاسم الكامل',
      username: 'اسم المستخدم',
      emailAddress: 'البريد الإلكتروني',
      userRole: 'الصلاحية',
      roleViewer: 'مشاهد (قراءة فقط)',
      roleEditor: 'محرر (قراءة وكتابة)',
      roleAdmin: 'مدير (تحكم كامل)',
      createUser: 'إنشاء المستخدم',
      usersList: 'قائمة المستخدمين',
      thName: 'الاسم',
      thEmail: 'البريد الإلكتروني',
      thRole: 'الصلاحية',
      thActions: 'إجراءات',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',
      soundOn: 'الصوت',
      soundOff: 'الصوت (مكتم)',
      langAr: 'العربية',
      langEn: 'English',
    },
    en: {
      appTitle: 'Planning & Development Sector KPIs Dashboard',
      appSubtitle: 'Ministry of Municipalities and Housing · Q2 2026',
      dashboardManager: 'Dashboard Manager',
      logout: 'Logout',
      support: 'Technical Support',
      supportTitle: 'Technical Support',
      supportDesc: 'For inquiries and technical support, please contact the support team via the following email:',
      supportEmail: 'Email Address',
      supportHours: 'Support Hours: Sunday - Thursday · 8:00 AM - 4:00 PM',
      sendEmail: 'Send Email',
      close: 'Close',
      sectionPerformance: 'PERFORMANCE LOG',
      sectionWorkspace: 'WORKSPACE',
      sectionAdmin: 'ADMINISTRATION',
      navNotifications: 'Notifications',
      navPerformance: 'Performance',
      navWorkplan: 'Work Plan',
      navKpiAnalytics: 'KPI Analytics',
      navInterventions: 'Interventions',
      navReports: 'Reports',
      navExportedReports: 'Exported Reports',
      navAiAnalytics: 'AI-Powered Analytics',
      navMyUpdates: 'My Updates',
      navFileUpload: 'Smart File Upload',
      navRepository: 'Repository',
      navAdmin: 'Administration',
      emptyPageMsg: 'This section is under development',
      sidebarSection: 'INDICATORS',
      tabOverview: 'General Indicator',
      tabBi: 'Business Intelligence & Decision Support Center',
      tabOps: 'Operations Performance Monitoring Center',
      tabStrategy: 'Strategic Planning Agency',
      overviewTitle: 'General Indicator - Overview',
      overviewAllEntities: 'All Entities',
      entityBi: 'Business Intelligence',
      entityOps: 'Operations Performance',
      entityStrategy: 'Strategic Planning',
      chartEntityDist: 'Projects Distribution by Entity',
      chartEntityAvg: 'Average Completion by Entity',
      filterTitle: 'Controls & Filters',
      periodLabel: 'Time Period',
      periodAll: 'Show All',
      periodDay: 'Daily',
      periodMonth: 'Monthly',
      periodYear: 'Yearly',
      fromDate: 'From Date',
      toDate: 'To Date',
      enableCompare: 'Compare Periods',
      cmpFrom: 'Compare - From',
      cmpTo: 'Compare - To',
      all: 'All',
      apply: 'Apply',
      reset: 'Reset',
      btnAdd: '+ Add',
      btnExcel: 'Export Excel',
      btnPdf: 'Export PDF',
      btnPrint: 'Print',
      kpiTotal: 'Total Projects',
      kpiAvg: 'Average Completion',
      kpiCost: 'Total Cost',
      kpiLate: 'Delayed Projects',
      kpiSubFiltered: 'After applying filters',
      kpiSubAvg: 'For displayed projects',
      kpiSubCost: 'Saudi Riyal',
      kpiSubAction: 'Action needed',
      opsTotal: 'Total Deliverables',
      opsDone: 'Completed',
      opsSubDone: 'Delivered outputs',
      opsTrack: 'On Track',
      opsSubTrack: 'In progress',
      opsLate: 'Delayed',
      compareTitle: 'Compared to Previous Period',
      currentVsPrev: 'Current / Previous',
      modalAddTitle: 'Add New Record',
      save: 'Save',
      cancel: 'Cancel',
      chartCat: 'Projects Distribution by Category',
      chartProgress: 'Actual Completion Rate by Project',
      chartOpsStatus: 'Deliverables Status Distribution',
      chartOpsEntity: 'Deliverables by Assigned Entity',
      tableTitleBi: 'Business Intelligence Center Projects Details',
      tableTitleOps: 'Operations Performance Center Projects Details',
      tableTitleStrategy: 'Strategic Planning Agency Projects Details',
      noData: 'No data available',
      userMgmtShort: 'Users',
      userMgmtTitle: 'User Management & Permissions',
      addNewUser: 'Add New User',
      fullName: 'Full Name',
      username: 'Username',
      emailAddress: 'Email Address',
      userRole: 'Role',
      roleViewer: 'Viewer (Read Only)',
      roleEditor: 'Editor (Read & Write)',
      roleAdmin: 'Admin (Full Control)',
      createUser: 'Create User',
      usersList: 'Users List',
      thName: 'Name',
      thEmail: 'Email',
      thRole: 'Role',
      thActions: 'Actions',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      soundOn: 'Sound',
      soundOff: 'Sound (Muted)',
      langAr: 'العربية',
      langEn: 'English',
    },
  };

  function t(key) { return I18N[STATE.lang][key] || key; }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (I18N[STATE.lang][k]) el.textContent = I18N[STATE.lang][k];
    });
    document.documentElement.lang = STATE.lang;
    document.documentElement.dir = STATE.lang === 'ar' ? 'rtl' : 'ltr';
    // Update dynamic sidebar labels
    updateSidebarLabels();
  }

  function updateSidebarLabels() {
    const langLabel = document.getElementById('langLabel');
    if (langLabel) langLabel.textContent = STATE.lang === 'ar' ? 'English' : 'العربية';
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) themeLabel.textContent = STATE.theme === 'dark' ? t('lightMode') : t('darkMode');
    const soundLabel = document.getElementById('soundLabel');
    if (soundLabel) soundLabel.textContent = STATE.soundOn ? t('soundOn') : t('soundOff');
  }

  const TAB_TITLES = {
    overview: 'المؤشر العام',
    bi: 'مركز ذكاء الأعمال ودعم القرار',
    ops: 'مركز مراقبة الأداء التشغيلي',
    strategy: 'وكالة التخطيط الاستراتيجي',
  };

  // Date columns per tab (used for time filtering)
  const DATE_COL = {
    bi: 'تاريخ البدء',
    ops: 'تاريخ الاستحقاق',
    strategy: 'تاريخ البدء',
  };
  const CATEGORY_COL = {
    bi: 'تصنيف',
    ops: 'الجهة المسندة',
    strategy: 'تصنيف',
  };
  const STATUS_COL = {
    bi: 'تحديث الحالة التعاقدية',
    ops: 'الحالة',
    strategy: 'تحديث الحالة التعاقدية',
  };

  // ================== AUTH ==================
  function login(usernameOrEmail, password) {
    const u = findUser(usernameOrEmail);
    if (u && u.password === password) {
      sessionStorage.setItem('momah_user', JSON.stringify({
        username: u.username, email: u.email, name: u.name, role: u.role
      }));
      return true;
    }
    return false;
  }
  function logout() { sessionStorage.removeItem('momah_user'); window.location.href = 'index.html'; }
  function getCurrentUser() { try { return JSON.parse(sessionStorage.getItem('momah_user')); } catch (e) { return null; } }
  function requireAuth() { const u = getCurrentUser(); if (!u) { window.location.href = 'index.html'; return null; } return u; }

  // ================== STORAGE ==================
  function loadStored() {
    try {
      const stored = JSON.parse(localStorage.getItem('momah_data') || '{}');
      ['bi','ops','strategy'].forEach(k => {
        if (Array.isArray(stored[k])) MOCK_DATA[k] = stored[k];
      });
    } catch (e) {}
  }
  function persist() {
    try { localStorage.setItem('momah_data', JSON.stringify(MOCK_DATA)); } catch (e) {}
  }

  // ================== HELPERS ==================
  function statusBadge(status) {
    const map = {
      'مكتمل':'badge-success','معتمدة':'badge-success',
      'على المسار':'badge-info','قيد التنفيذ':'badge-info','قيد المراجعة':'badge-warning',
      'متأخر':'badge-danger','مرفوضة':'badge-danger',
      'بدء حديث':'badge-warning','مرحلة الترسية':'badge-warning',
    };
    const cls = map[status] || 'badge-info';
    return `<span class="badge ${cls}">${status}</span>`;
  }
  function progressCell(pct) {
    const v = parseInt(pct, 10) || 0;
    return `<div class="progress"><div class="progress-bar" style="width:${v}%"></div></div><span class="progress-text">${v}%</span>`;
  }
  function parseCost(val) { if (val == null) return 0; return parseFloat(String(val).replace(/[^\d.]/g, '')) || 0; }
  function formatNumber(n) { return n.toLocaleString('en-US'); }
  function parseDate(s) { if (!s || s === '-') return null; const d = new Date(s); return isNaN(d) ? null : d; }
  function inRange(dateStr, from, to) {
    const d = parseDate(dateStr); if (!d) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  function getActive(tab) { return STATE[tab] || MOCK_DATA[tab]; }

  function tableMeta(tab) {
    if (tab === 'bi' || tab === 'strategy') {
      return { statusCols: ['تحديث الحالة التعاقدية'], progressCols: ['نسبة الإنجاز الفعلي'] };
    }
    return { statusCols: ['الحالة','حالة الوثائق'], progressCols: [] };
  }

  // ================== TABLE RENDER ==================
  function renderTable(tableId, data, options = {}) {
    const table = document.getElementById(tableId);
    if (!table) return;
    if (!data || data.length === 0) { table.innerHTML = `<thead><tr><th>${t('noData')}</th></tr></thead>`; return; }

    const tab = options.tab;
    const me = getCurrentUser();
    const canWrite = me && (me.role === 'admin' || me.role === 'editor');
    const headers = Object.keys(data[0]);
    const statusCols = options.statusCols || [];
    const progressCols = options.progressCols || [];

    let html = '<thead><tr>';
    headers.forEach((h, i) => html += `<th data-col="${i}">${h}</th>`);
    if (canWrite) html += `<th class="no-print">${STATE.lang === 'ar' ? 'إجراءات' : 'Actions'}</th>`;
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
      html += '<tr>';
      headers.forEach(h => {
        let v = row[h];
        if (statusCols.includes(h)) v = statusBadge(v);
        else if (progressCols.includes(h)) v = progressCell(v);
        html += `<td>${v ?? '-'}</td>`;
      });
      if (canWrite) {
        html += `<td class="no-print" style="white-space:nowrap;">
          <button class="btn-row-action edit" data-edit="${tab}" data-idx="${idx}" title="${STATE.lang==='ar'?'تعديل':'Edit'}">✏️</button>
          <button class="btn-row-action delete" data-delete="${tab}" data-idx="${idx}" title="${STATE.lang==='ar'?'حذف':'Delete'}">🗑️</button>
        </td>`;
      }
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;

    table.querySelectorAll('th').forEach((th, idx) => {
      th.addEventListener('click', () => sortTable(table, idx));
    });
    table.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openEditModal(btn.dataset.edit, parseInt(btn.dataset.idx, 10));
      });
    });
    table.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const t2 = btn.dataset.delete, idx = parseInt(btn.dataset.idx, 10);
        const msg = STATE.lang === 'ar' ? 'هل أنت متأكدة من حذف هذا السجل؟' : 'Are you sure you want to delete this record?';
        if (confirm(msg)) {
          const target = STATE[t2] || MOCK_DATA[t2];
          const row = target[idx];
          MOCK_DATA[t2] = MOCK_DATA[t2].filter(r => r !== row);
          if (STATE[t2]) STATE[t2] = STATE[t2].filter(r => r !== row);
          persist();
          renderTab(t2);
        }
      });
    });
  }

  function sortTable(table, colIdx) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const asc = table.dataset.sortDir !== 'asc';
    rows.sort((a, b) => {
      const A = a.cells[colIdx].innerText.trim();
      const B = b.cells[colIdx].innerText.trim();
      const nA = parseFloat(A.replace(/[^\d.-]/g, ''));
      const nB = parseFloat(B.replace(/[^\d.-]/g, ''));
      if (!isNaN(nA) && !isNaN(nB)) return asc ? nA - nB : nB - nA;
      return asc ? A.localeCompare(B, 'ar') : B.localeCompare(A, 'ar');
    });
    rows.forEach(r => tbody.appendChild(r));
    table.dataset.sortDir = asc ? 'asc' : 'desc';
  }

  // ================== CHARTS ==================
  function destroyChart(id) { if (STATE.charts[id]) { STATE.charts[id].destroy(); delete STATE.charts[id]; } }

  function makePie(canvasId, labels, values) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    STATE.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: PALETTE, borderWidth: 2, borderColor: '#fff' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tajawal', size: 11 }, padding: 10 } } },
      },
    });
  }
  function makeBar(canvasId, labels, values, label) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    STATE.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: label || '', data: values, backgroundColor: '#00833E', borderRadius: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { font: { family: 'Tajawal' } } },
          y: { ticks: { font: { family: 'Tajawal', size: 11 } } },
        },
      },
    });
  }

  function groupCount(arr, key) {
    const m = {}; arr.forEach(r => { const k = r[key] || 'غير محدد'; m[k] = (m[k] || 0) + 1; });
    return m;
  }

  // ================== TABS (Agency Sidebar) ==================
  function initTabs() {
    // Expandable KPI Analytics parent
    const kpiParent = document.getElementById('kpiParent');
    const kpiSubItems = document.getElementById('kpiSubItems');
    if (kpiParent && kpiSubItems) {
      // Start expanded
      kpiSubItems.classList.add('show');
      kpiParent.addEventListener('click', () => {
        kpiParent.classList.toggle('expanded');
        kpiSubItems.classList.toggle('show');
      });
    }

    // All tab buttons (including sub-items and new placeholder tabs)
    document.querySelectorAll('.agency-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.agency-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const tabEl = document.getElementById('tab-' + tabId);
        if (tabEl) tabEl.classList.add('active');
        if (tabId === 'overview') renderOverview();
        // Render extra sections on tab switch
        if (extraTabRenderers[tabId]) extraTabRenderers[tabId]();
        // Also render existing tabs
        if (['bi','ops','strategy'].includes(tabId)) renderTab(tabId);
      });
    });
  }

  // ================== OVERVIEW (General Indicator) ==================
  function renderOverview() {
    const container = document.getElementById('kpi-overview');
    if (!container) return;

    const biData = MOCK_DATA.bi;
    const opsData = MOCK_DATA.ops;
    const strData = MOCK_DATA.strategy;

    const biStrAll = [...biData, ...strData];
    const totalAll = biData.length + opsData.length + strData.length;

    const avgCompletion = biStrAll.length
      ? Math.round(biStrAll.reduce((s,r) => s + (parseInt(r['نسبة الإنجاز الفعلي'],10)||0), 0) / biStrAll.length)
      : 0;

    const totalCost = biStrAll.reduce((s,r) => s + parseCost(r['التكلفة']), 0);

    const lateBI = biData.filter(r => r['تحديث الحالة التعاقدية'] === 'متأخر').length;
    const lateStr = strData.filter(r => r['تحديث الحالة التعاقدية'] === 'متأخر').length;
    const lateOps = opsData.filter(r => r['الحالة'] === 'متأخر').length;
    const totalLate = lateBI + lateStr + lateOps;

    const doneOps = opsData.filter(r => r['الحالة'] === 'مكتمل').length;

    const cards = [
      { cls:'', label: t('kpiTotal'), value: totalAll, sub: t('overviewAllEntities') },
      { cls:'turquoise', label: t('kpiAvg'), value: avgCompletion+'%', sub: t('kpiSubAvg') },
      { cls:'dark', label: t('kpiCost'), value: formatNumber(totalCost), sub: t('kpiSubCost') },
      { cls:'danger', label: t('kpiLate'), value: totalLate, sub: t('kpiSubAction') },
      { cls:'warning', label: t('opsDone'), value: doneOps, sub: t('opsSubDone') },
    ];

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.cls}">
        <span class="kpi-label">${c.label}</span>
        <span class="kpi-value">${c.value}</span>
        <span class="kpi-sub">${c.sub}</span>
      </div>
    `).join('');

    // Charts
    const entityLabels = [t('entityBi'), t('entityOps'), t('entityStrategy')];
    const entityCounts = [biData.length, opsData.length, strData.length];
    makePie('overviewPie', entityLabels, entityCounts);

    const avgBI = biData.length ? Math.round(biData.reduce((s,r)=>s+(parseInt(r['نسبة الإنجاز الفعلي'],10)||0),0)/biData.length) : 0;
    const avgStr = strData.length ? Math.round(strData.reduce((s,r)=>s+(parseInt(r['نسبة الإنجاز الفعلي'],10)||0),0)/strData.length) : 0;
    const opsCompletionRate = opsData.length ? Math.round((doneOps / opsData.length) * 100) : 0;
    makeBar('overviewBar', entityLabels, [avgBI, opsCompletionRate, avgStr], t('kpiAvg'));
  }

  // ================== KPI CARDS ==================
  function renderKPIs(tab) {
    const data = getActive(tab);
    const container = document.getElementById('kpi-' + tab);
    if (!container) return;

    let cards = [];
    if (tab === 'bi' || tab === 'strategy') {
      const total = data.length;
      const avg = total ? Math.round(data.reduce((s,r)=>s+(parseInt(r['نسبة الإنجاز الفعلي'],10)||0),0)/total) : 0;
      const cost = data.reduce((s,r)=>s+parseCost(r['التكلفة']),0);
      const late = data.filter(r => r['تحديث الحالة التعاقدية'] === 'متأخر').length;
      cards = [
        { cls:'', label:t('kpiTotal'), value: total, sub:t('kpiSubFiltered') },
        { cls:'turquoise', label:t('kpiAvg'), value: avg+'%', sub:t('kpiSubAvg') },
        { cls:'dark', label:t('kpiCost'), value: formatNumber(cost), sub:t('kpiSubCost') },
        { cls:'danger', label:t('kpiLate'), value: late, sub:t('kpiSubAction') },
      ];
    } else {
      const total = data.length;
      const done = data.filter(r => r['الحالة'] === 'مكتمل').length;
      const onTrack = data.filter(r => r['الحالة'] === 'على المسار').length;
      const late = data.filter(r => r['الحالة'] === 'متأخر').length;
      cards = [
        { cls:'', label:t('opsTotal'), value: total, sub:t('kpiSubFiltered') },
        { cls:'turquoise', label:t('opsDone'), value: done, sub:t('opsSubDone') },
        { cls:'dark', label:t('opsTrack'), value: onTrack, sub:t('opsSubTrack') },
        { cls:'danger', label:t('opsLate'), value: late, sub:t('kpiSubAction') },
      ];
    }

    container.innerHTML = cards.map(c => `
      <div class="kpi-card ${c.cls}">
        <span class="kpi-label">${c.label}</span>
        <span class="kpi-value">${c.value}</span>
        <span class="kpi-sub">${c.sub}</span>
      </div>
    `).join('');

    // Comparison cards if compare enabled
    const cmp = STATE['cmp_'+tab];
    if (cmp) {
      const compEl = document.createElement('div');
      compEl.className = 'kpi-card warning';
      compEl.innerHTML = `
        <span class="kpi-label">${t('compareTitle')}</span>
        <span class="kpi-value">${cmp.currentTotal} / ${cmp.prevTotal}</span>
        <span class="kpi-sub">${t('currentVsPrev')}</span>
        <span class="kpi-delta ${cmp.delta>=0?'up':'down'}">${cmp.delta>=0?'▲':'▼'} ${Math.abs(cmp.delta)}%</span>
      `;
      container.appendChild(compEl);
    }
  }

  // ================== RENDER TAB ==================
  function renderTab(tab) {
    const data = getActive(tab);
    const meta = tableMeta(tab);

    renderKPIs(tab);

    meta.tab = tab;
    if (tab === 'bi') {
      renderTable('biTable', data, meta);
      const cat = groupCount(data, 'تصنيف');
      makePie('biPie', Object.keys(cat), Object.values(cat));
      makeBar('biBar', data.map(r=>r['مدير المشروع']), data.map(r=>parseInt(r['نسبة الإنجاز الفعلي'],10)||0), t('chartProgress'));
    } else if (tab === 'ops') {
      renderTable('opsTable', data, meta);
      const status = groupCount(data, 'الحالة');
      makePie('opsPie', Object.keys(status), Object.values(status));
      const ent = groupCount(data, 'الجهة المسندة');
      makeBar('opsBar', Object.keys(ent), Object.values(ent), t('chartOpsEntity'));
    } else if (tab === 'strategy') {
      renderTable('strTable', data, meta);
      const cat = groupCount(data, 'تصنيف');
      makePie('strPie', Object.keys(cat), Object.values(cat));
      makeBar('strBar', data.map(r=>r['مدير المشروع']), data.map(r=>parseInt(r['نسبة الإنجاز الفعلي'],10)||0), t('chartProgress'));
    }
    applyPermissions();
  }

  // ================== FILTERS (Inline) ==================
  function buildFilterPanel(tab) {
    const panel = document.querySelector(`.inline-filters[data-panel="${tab}"]`);
    if (!panel) return;
    const cats = [...new Set(MOCK_DATA[tab].map(r => r[CATEGORY_COL[tab]]).filter(Boolean))];
    const stats = [...new Set(MOCK_DATA[tab].map(r => r[STATUS_COL[tab]]).filter(Boolean))];

    panel.innerHTML = `
      <div class="filter-group">
        <label>${t('periodLabel')}</label>
        <select data-filter="period">
          <option value="all">${t('periodAll')}</option>
          <option value="day">${t('periodDay')}</option>
          <option value="month">${t('periodMonth')}</option>
          <option value="year">${t('periodYear')}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>${t('fromDate')}</label>
        <input type="date" data-filter="from">
      </div>
      <div class="filter-group">
        <label>${t('toDate')}</label>
        <input type="date" data-filter="to">
      </div>
      <div class="filter-group">
        <label>${CATEGORY_COL[tab]}</label>
        <select data-filter="category">
          <option value="">${t('all')}</option>
          ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>${STATUS_COL[tab]}</label>
        <select data-filter="status">
          <option value="">${t('all')}</option>
          ${stats.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group checkbox-group">
        <label><input type="checkbox" data-filter="cmp"> ${t('enableCompare')}</label>
      </div>
      <div class="filter-actions">
        <button class="btn-primary" data-filter="apply">${t('apply')}</button>
        <button class="btn-secondary" data-filter="reset">${t('reset')}</button>
      </div>
      <div class="compare-row">
        <div class="filter-group">
          <label>${t('cmpFrom')}</label>
          <input type="date" data-filter="cmpFrom">
        </div>
        <div class="filter-group">
          <label>${t('cmpTo')}</label>
          <input type="date" data-filter="cmpTo">
        </div>
      </div>
    `;

    panel.querySelector('[data-filter="cmp"]').addEventListener('change', e => {
      panel.querySelector('.compare-row').classList.toggle('show', e.target.checked);
    });
    panel.querySelector('[data-filter="apply"]').addEventListener('click', () => applyFilters(tab));
    panel.querySelector('[data-filter="reset"]').addEventListener('click', () => resetFilters(tab));
  }

  function applyFilters(tab) {
    const panel = document.querySelector(`.inline-filters[data-panel="${tab}"]`);
    const period = panel.querySelector('[data-filter="period"]').value;
    let from = parseDate(panel.querySelector('[data-filter="from"]').value);
    let to   = parseDate(panel.querySelector('[data-filter="to"]').value);
    const category = panel.querySelector('[data-filter="category"]').value;
    const status = panel.querySelector('[data-filter="status"]').value;
    const cmp = panel.querySelector('[data-filter="cmp"]').checked;
    const cmpFrom = parseDate(panel.querySelector('[data-filter="cmpFrom"]').value);
    const cmpTo = parseDate(panel.querySelector('[data-filter="cmpTo"]').value);

    if (period !== 'all' && !from && !to) {
      const now = new Date();
      to = now;
      from = new Date(now);
      if (period === 'day') from.setDate(now.getDate() - 1);
      if (period === 'month') from.setMonth(now.getMonth() - 1);
      if (period === 'year') from.setFullYear(now.getFullYear() - 1);
    }

    const dateCol = DATE_COL[tab];
    const filtered = MOCK_DATA[tab].filter(r => {
      if (category && r[CATEGORY_COL[tab]] !== category) return false;
      if (status && r[STATUS_COL[tab]] !== status) return false;
      if (!inRange(r[dateCol], from, to)) return false;
      return true;
    });

    STATE[tab] = filtered;

    if (cmp && cmpFrom && cmpTo) {
      const prev = MOCK_DATA[tab].filter(r => inRange(r[dateCol], cmpFrom, cmpTo));
      const delta = prev.length ? Math.round(((filtered.length - prev.length) / prev.length) * 100) : 0;
      STATE['cmp_' + tab] = { currentTotal: filtered.length, prevTotal: prev.length, delta };
    } else {
      STATE['cmp_' + tab] = null;
    }

    renderTab(tab);
  }

  function resetFilters(tab) {
    const panel = document.querySelector(`.inline-filters[data-panel="${tab}"]`);
    panel.querySelectorAll('input,select').forEach(el => {
      if (el.type === 'checkbox') el.checked = false;
      else el.value = el.tagName === 'SELECT' ? (el.options[0]?.value || '') : '';
    });
    const cmpRow = panel.querySelector('.compare-row');
    if (cmpRow) cmpRow.classList.remove('show');
    STATE[tab] = null;
    STATE['cmp_' + tab] = null;
    renderTab(tab);
  }

  // ================== ADD / EDIT MODAL ==================
  function openAddModal(tab) {
    STATE.currentModalTab = tab;
    STATE.editIndex = null;
    STATE.editRow = null;
    const modal = document.getElementById('addModal');
    document.getElementById('modalTitle').textContent = `${t('modalAddTitle')} - ${TAB_TITLES[tab]}`;
    const form = document.getElementById('addForm');
    const headers = Object.keys(MOCK_DATA[tab][0] || {});
    form.innerHTML = headers.map(h => {
      const isDate = h.includes('تاريخ');
      const isNum = h.includes('نسبة');
      const type = isDate ? 'date' : (isNum ? 'number' : 'text');
      return `<div class="form-group">
        <label>${h}</label>
        <input type="${type}" name="${h}" ${isNum ? 'min="0" max="100"' : ''}>
      </div>`;
    }).join('');
    modal.classList.add('show');
  }
  function openEditModal(tab, idx) {
    STATE.currentModalTab = tab;
    const data = STATE[tab] || MOCK_DATA[tab];
    const row = data[idx];
    if (!row) return;
    STATE.editRow = row;
    const modal = document.getElementById('addModal');
    document.getElementById('modalTitle').textContent = (STATE.lang === 'ar' ? 'تعديل سجل - ' : 'Edit Record - ') + TAB_TITLES[tab];
    const form = document.getElementById('addForm');
    const headers = Object.keys(row);
    form.innerHTML = headers.map(h => {
      const isDate = h.includes('تاريخ');
      const isNum = h.includes('نسبة');
      const type = isDate ? 'date' : (isNum ? 'number' : 'text');
      const val = (row[h] ?? '').toString().replace(/"/g, '&quot;');
      return `<div class="form-group">
        <label>${h}</label>
        <input type="${type}" name="${h}" value="${val === '-' ? '' : val}" ${isNum ? 'min="0" max="100"' : ''}>
      </div>`;
    }).join('');
    modal.classList.add('show');
  }
  function closeModal() {
    document.getElementById('addModal').classList.remove('show');
    STATE.editRow = null;
  }
  function saveModal() {
    const tab = STATE.currentModalTab;
    if (!tab) return;
    const form = document.getElementById('addForm');
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (el.name) data[el.name] = el.value || '-';
    });
    if (STATE.editRow) {
      Object.assign(STATE.editRow, data);
    } else {
      MOCK_DATA[tab].push(data);
    }
    persist();
    STATE[tab] = null;
    buildFilterPanel(tab);
    renderTab(tab);
    closeModal();
  }

  // ================== EXPORT ==================
  function exportExcel(tab) {
    const data = getActive(tab);
    const ws = XLSX.utils.json_to_sheet(data);
    if (!ws['!cols']) ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 18 }));
    ws['!rtl'] = true;
    const wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(wb, ws, TAB_TITLES[tab].slice(0, 28));
    const fname = `MOMAH_${tab}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fname);
  }
  function printTab(tab) {
    document.querySelectorAll('.agency-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
    setTimeout(() => window.print(), 200);
  }

  // ================== HOVER SOUND ==================
  let _audioCtx = null;
  function playHover() {
    if (!STATE.soundOn) return;
    try {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = _audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }
  function attachHoverSounds() {
    const sel = '.agency-btn, .sidebar-ctrl, .btn-action, .btn-primary, .btn-secondary, .btn-icon, .kpi-card';
    document.body.addEventListener('mouseover', e => {
      const t = e.target.closest(sel);
      if (t && !t._hoverArmed) {
        t._hoverArmed = true;
        playHover();
        setTimeout(() => { t._hoverArmed = false; }, 300);
      }
    });
  }

  // ================== USER AVATAR ==================
  function initUserAvatar(user) {
    const avatarEl = document.getElementById('userAvatar');
    const name = user.name || user.username || '';
    if (avatarEl) {
      const chars = name.trim().split(/\s+/);
      let initials = '';
      if (chars.length >= 2) {
        initials = chars[0].charAt(0) + chars[1].charAt(0);
      } else {
        initials = name.substring(0, 2);
      }
      avatarEl.textContent = initials.toUpperCase();
    }
    // Show the user's role label based on their role
    const roleEl = document.querySelector('.user-role');
    if (roleEl) {
      const roleLabels = {
        ar: { admin: 'مدير', editor: 'محرر', viewer: 'مشاهد' },
        en: { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' },
      };
      const lang = STATE.lang || 'ar';
      roleEl.textContent = (roleLabels[lang] && roleLabels[lang][user.role]) || user.role;
      roleEl.removeAttribute('data-i18n');
    }
  }

  // ================== THEME ==================
  function initTheme() {
    const stored = localStorage.getItem('momah_theme') || 'light';
    STATE.theme = stored;
    document.documentElement.setAttribute('data-theme', stored);
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const update = () => {
      if (themeIcon) {
        themeIcon.innerHTML = STATE.theme === 'dark'
          ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      }
      if (themeLabel) themeLabel.textContent = STATE.theme === 'dark' ? t('lightMode') : t('darkMode');
    };
    update();
    btn.addEventListener('click', () => {
      STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', STATE.theme);
      localStorage.setItem('momah_theme', STATE.theme);
      update();
      ['bi','ops','strategy'].forEach(renderTab);
      renderOverview();
    });
  }

  // ================== LANGUAGE ==================
  function initLang() {
    const stored = localStorage.getItem('momah_lang') || 'ar';
    STATE.lang = stored;
    applyTranslations();
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      STATE.lang = STATE.lang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('momah_lang', STATE.lang);
      applyTranslations();
      const me = getCurrentUser();
      if (me) initUserAvatar(me);
      ['bi','ops','strategy'].forEach(tab => { buildFilterPanel(tab); renderTab(tab); });
      renderOverview();
    });
  }

  // ================== SUPPORT ==================
  function initSupport() {
    const btn = document.getElementById('supportBtn');
    const modal = document.getElementById('supportModal');
    if (!btn || !modal) return;
    btn.addEventListener('click', () => modal.classList.add('show'));
    document.getElementById('supportClose').addEventListener('click', () => modal.classList.remove('show'));
    document.getElementById('supportCancel').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
  }

  // ================== USER MANAGEMENT ==================
  function generatePassword(len = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let pwd = '';
    for (let i = 0; i < len; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  }

  function openUserMgmt() {
    const modal = document.getElementById('userMgmtModal');
    if (!modal) return;
    renderUsersList();
    modal.classList.add('show');
  }
  function closeUserMgmt() { document.getElementById('userMgmtModal').classList.remove('show'); }

  function renderUsersList() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const users = getUsers();
    const me = getCurrentUser();
    const roleLabels = { admin: STATE.lang === 'ar' ? 'مدير (تحكم كامل)' : 'Admin (Full Control)',
                         editor: STATE.lang === 'ar' ? 'محرر (قراءة وكتابة)' : 'Editor (Read & Write)',
                         viewer: STATE.lang === 'ar' ? 'مشاهد (قراءة فقط)' : 'Viewer (Read Only)' };
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td style="direction:ltr">${u.email}</td>
        <td>
          <select data-user-role="${u.username}" ${u.username === me.username ? 'disabled' : ''}>
            <option value="admin"  ${u.role==='admin'?'selected':''}>${roleLabels.admin}</option>
            <option value="editor" ${u.role==='editor'?'selected':''}>${roleLabels.editor}</option>
            <option value="viewer" ${u.role==='viewer'?'selected':''}>${roleLabels.viewer}</option>
          </select>
        </td>
        <td>
          <button class="btn-action" data-user-delete="${u.username}" ${u.username === me.username ? 'disabled style="opacity:.4"' : ''}>
            ${STATE.lang === 'ar' ? 'حذف' : 'Delete'}
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-user-role]').forEach(sel => {
      sel.addEventListener('change', e => {
        const username = e.target.getAttribute('data-user-role');
        const users = getUsers();
        const u = users.find(x => x.username === username);
        if (u) { u.role = e.target.value; saveUsers(users); }
      });
    });
    tbody.querySelectorAll('[data-user-delete]').forEach(btn => {
      btn.addEventListener('click', e => {
        const username = e.target.getAttribute('data-user-delete');
        const msg = STATE.lang === 'ar' ? `هل تريد حذف المستخدم ${username}؟` : `Delete user ${username}?`;
        if (confirm(msg)) {
          saveUsers(getUsers().filter(u => u.username !== username));
          renderUsersList();
        }
      });
    });
  }

  function addNewUser(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.fullname.value.trim();
    const email = form.email.value.trim();
    const username = form.username.value.trim();
    const role = form.role.value;
    if (!name || !email || !username) return;

    const users = getUsers();
    if (users.some(u => u.username === username || u.email === email)) {
      alert(STATE.lang === 'ar' ? 'اسم المستخدم أو البريد موجود مسبقاً' : 'Username or email already exists');
      return;
    }
    const password = generatePassword(10);
    users.push({ username, email, name, password, role });
    saveUsers(users);
    renderUsersList();
    form.reset();

    const subject = encodeURIComponent('بيانات الدخول - لوحة مؤشرات MOMAH');
    const body = encodeURIComponent(
`مرحباً ${name},

تم إنشاء حسابك في لوحة مؤشرات وزارة البلديات والإسكان.

اسم المستخدم: ${username}
البريد الإلكتروني: ${email}
كلمة المرور: ${password}
الصلاحية: ${role}

للدعم الفني: zalhayei@momah.gov.sa`
    );
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    const result = document.getElementById('newUserResult');
    if (result) {
      result.innerHTML = `
        <div style="background:var(--green-soft);padding:14px;border-radius:10px;margin-top:12px;">
          <strong style="color:var(--green-dark);display:block;margin-bottom:8px;">
            ${STATE.lang === 'ar' ? '✓ تم إنشاء المستخدم. كلمة المرور المؤقتة:' : '✓ User created. Temporary password:'}
          </strong>
          <code style="display:block;background:#fff;padding:10px;border-radius:6px;font-size:16px;direction:ltr;text-align:center;font-weight:800;color:var(--green-dark);">${password}</code>
          <a href="${mailtoLink}" class="btn-primary" style="display:block;margin-top:10px;text-align:center;text-decoration:none;">
            ${STATE.lang === 'ar' ? '📧 إرسال البيانات بالبريد' : '📧 Send Credentials by Email'}
          </a>
          <p style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center;">
            ${STATE.lang === 'ar' ? 'سيفتح برنامج البريد الافتراضي لإرسال الرسالة' : 'Your default email client will open to send the message'}
          </p>
        </div>
      `;
    }
  }

  function initUserMgmt() {
    const me = getCurrentUser();
    if (!me) return;
    const btn = document.getElementById('userMgmtBtn');
    if (!btn) return;
    if (me.role !== 'admin') { btn.style.display = 'none'; return; }
    btn.addEventListener('click', openUserMgmt);
    const closeBtn = document.getElementById('userMgmtClose');
    if (closeBtn) closeBtn.addEventListener('click', closeUserMgmt);
    const form = document.getElementById('addUserForm');
    if (form) form.addEventListener('submit', addNewUser);
  }

  // ================== PERMISSIONS ==================
  function applyPermissions() {
    const me = getCurrentUser();
    if (!me) return;
    const canWrite = me.role === 'admin' || me.role === 'editor';
    document.querySelectorAll('.btn-action.add').forEach(btn => {
      btn.style.display = canWrite ? '' : 'none';
    });
  }

  function initSoundToggle() {
    const stored = localStorage.getItem('momah_sound');
    if (stored !== null) STATE.soundOn = stored === '1';
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    const soundIcon = document.getElementById('soundIcon');
    const soundLabel = document.getElementById('soundLabel');
    const update = () => {
      if (soundIcon) {
        soundIcon.innerHTML = STATE.soundOn
          ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'
          : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      }
      if (soundLabel) soundLabel.textContent = STATE.soundOn ? t('soundOn') : t('soundOff');
    };
    update();
    btn.addEventListener('click', () => {
      STATE.soundOn = !STATE.soundOn;
      localStorage.setItem('momah_sound', STATE.soundOn ? '1' : '0');
      update();
      if (STATE.soundOn) playHover();
    });
  }

  // ================== TOOLBAR EVENTS ==================
  function initToolbarEvents() {
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('.btn-action');
      if (!btn) return;
      const action = btn.dataset.action;
      const tab = btn.dataset.tab;
      if (action === 'add') openAddModal(tab);
      else if (action === 'excel') exportExcel(tab);
      else if (action === 'pdf' || action === 'print') printTab(tab);
    });

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('modalSave').addEventListener('click', saveModal);
    document.getElementById('addModal').addEventListener('click', e => {
      if (e.target.id === 'addModal') closeModal();
    });
  }

  // ================== INIT ==================
  function initDashboard() {
    const user = requireAuth(); if (!user) return;
    document.getElementById('userName').textContent = user.name;

    loadStored();
    loadStoredExtra();
    initUserAvatar(user);
    initTheme();
    initLang();
    initSupport();
    initUserMgmt();
    initTabs();
    initSoundToggle();
    initToolbarEvents();
    attachHoverSounds();

    ['bi','ops','strategy'].forEach(tab => {
      buildFilterPanel(tab);
      renderTab(tab);
    });
    renderOverview();
    applyPermissions();
  }

  // ================== EXTRA DATA STORAGE ==================
  function loadStoredExtra() {
    try {
      const stored = JSON.parse(localStorage.getItem('momah_extra') || '{}');
      Object.keys(stored).forEach(k => {
        if (Array.isArray(stored[k]) && EXTRA_DATA[k]) EXTRA_DATA[k] = stored[k];
      });
    } catch (e) {}
  }
  function persistExtra() {
    try { localStorage.setItem('momah_extra', JSON.stringify(EXTRA_DATA)); } catch (e) {}
  }

  // ================== NOTIFICATIONS ==================
  function renderNotifications() {
    const el = document.getElementById('notificationsList');
    if (!el) return;
    const data = EXTRA_DATA.notifications;
    const iconMap = { success: '✅', danger: '🔴', warning: '⚠️', info: 'ℹ️' };
    el.innerHTML = data.map((n, i) => `
      <div class="module-list-item ${n.read ? '' : 'unread'}">
        <div class="module-list-icon ${n.type}">${iconMap[n.type] || 'ℹ️'}</div>
        <div class="module-list-body">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
          <div class="module-list-meta"><span>${n.date}</span></div>
        </div>
        <div class="module-list-actions">
          ${!n.read ? `<button onclick="App.markRead(${i})" title="تعيين كمقروء">👁️</button>` : ''}
          <button onclick="App.deleteExtraItem('notifications',${i})" title="حذف">🗑️</button>
        </div>
      </div>
    `).join('') || `<p style="text-align:center;color:var(--text-muted);padding:30px;">لا توجد إشعارات</p>`;
  }

  function markRead(idx) {
    if (EXTRA_DATA.notifications[idx]) {
      EXTRA_DATA.notifications[idx].read = true;
      persistExtra();
      renderNotifications();
    }
  }

  // ================== PERFORMANCE ==================
  function renderPerformance() {
    const container = document.getElementById('kpi-perf');
    const data = EXTRA_DATA.performance;
    if (container) {
      const total = data.length;
      const green = data.filter(r => r.rag === 'green').length;
      const grey = data.filter(r => r.rag === 'grey').length;
      const red = data.filter(r => r.rag === 'red').length;
      container.innerHTML = [
        { cls: '', label: 'إجمالي المؤشرات', value: total, sub: 'جميع المؤشرات' },
        { cls: 'turquoise', label: 'أخضر', value: green, sub: 'على المسار' },
        { cls: 'warning', label: 'رمادي', value: grey, sub: 'لم يبدأ' },
        { cls: 'danger', label: 'أحمر', value: red, sub: 'متأخر' },
      ].map(c => `
        <div class="kpi-card ${c.cls}">
          <span class="kpi-label">${c.label}</span>
          <span class="kpi-value">${c.value}</span>
          <span class="kpi-sub">${c.sub}</span>
        </div>
      `).join('');
    }

    const tableData = data.map(r => ({
      'الكود': r.code,
      'المؤشر': r.name,
      'النوع': r.type,
      'المستهدف': r.target,
      'الفعلي': r.actual,
      'الحالة': `<span class="rag-dot ${r.rag}"></span> ${r.rag === 'green' ? 'أخضر' : r.rag === 'red' ? 'أحمر' : 'رمادي'}`,
      'القطاع': r.sector,
    }));
    renderExtraTable('perfTable', tableData, 'performance');
  }

  // ================== WORKPLAN ==================
  function renderWorkplan() {
    const data = EXTRA_DATA.workplan;
    const tableData = data.map(r => ({
      'المهمة': r.task,
      'المسؤول': r.assignee,
      'الحالة': statusBadge(r.status),
      'تاريخ الاستحقاق': r.dueDate,
      'الأولوية': r.priority,
    }));
    renderExtraTable('workplanTable', tableData, 'workplan');
  }

  // ================== INTERVENTIONS ==================
  function renderInterventions(filter) {
    const container = document.getElementById('kpi-interventions');
    const filtersEl = document.getElementById('interventionFilters');
    const listEl = document.getElementById('interventionsList');
    const data = EXTRA_DATA.interventions;

    if (container) {
      const total = data.length;
      const open = data.filter(r => r.status === 'open').length;
      const inProg = data.filter(r => r.status === 'in_progress').length;
      const resolved = data.filter(r => r.status === 'resolved').length;
      container.innerHTML = [
        { cls: '', label: 'إجمالي التدخلات', value: total, sub: 'جميع التدخلات' },
        { cls: 'danger', label: 'مفتوح', value: open, sub: 'بحاجة لإجراء' },
        { cls: 'warning', label: 'قيد المعالجة', value: inProg, sub: 'جاري العمل' },
        { cls: 'turquoise', label: 'تم الحل', value: resolved, sub: 'مغلقة' },
      ].map(c => `
        <div class="kpi-card ${c.cls}">
          <span class="kpi-label">${c.label}</span>
          <span class="kpi-value">${c.value}</span>
          <span class="kpi-sub">${c.sub}</span>
        </div>
      `).join('');
    }

    if (filtersEl) {
      const statuses = ['الكل', 'مفتوح', 'قيد المعالجة', 'تم الحل'];
      const statusMap = { 'الكل': null, 'مفتوح': 'open', 'قيد المعالجة': 'in_progress', 'تم الحل': 'resolved' };
      filtersEl.innerHTML = statuses.map(s =>
        `<button class="filter-pill ${(!filter && s === 'الكل') || statusMap[s] === filter ? 'active' : ''}" onclick="App.filterInterventions('${statusMap[s] || ''}')">${s}</button>`
      ).join('');
    }

    if (listEl) {
      const filtered = filter ? data.filter(r => r.status === filter) : data;
      const priorityLabels = { critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض' };
      const statusLabels = { open: 'مفتوح', in_progress: 'قيد المعالجة', resolved: 'تم الحل' };
      listEl.innerHTML = filtered.map((r, i) => {
        const realIdx = data.indexOf(r);
        return `
        <div class="module-card priority-${r.priority}">
          <div class="module-card-header">
            <h4>${r.title}</h4>
            <span class="badge ${r.priority === 'critical' ? 'badge-danger' : r.priority === 'high' ? 'badge-warning' : 'badge-info'}">${priorityLabels[r.priority]}</span>
          </div>
          <p>${r.description}</p>
          <div class="module-card-footer">
            <span>${r.sector} · ${r.date} · ${statusLabels[r.status]}</span>
            <div class="card-actions">
              <button onclick="App.deleteExtraItem('interventions',${realIdx})">🗑️</button>
            </div>
          </div>
        </div>`;
      }).join('') || `<p style="text-align:center;color:var(--text-muted);padding:30px;">لا توجد تدخلات</p>`;
    }
  }

  function filterInterventions(status) {
    renderInterventions(status || null);
  }

  // ================== REPORTS ==================
  function renderReports() {
    const data = EXTRA_DATA.reports;
    const tableData = data.map(r => ({
      'العنوان': r.title,
      'النوع': r.type === 'quarterly' ? 'ربعي' : r.type === 'monthly' ? 'شهري' : 'سنوي',
      'التصنيف': r.category,
      'التاريخ': r.date,
      'المؤلف': r.author,
      'الحالة': statusBadge(r.status),
    }));
    renderExtraTable('reportsTable', tableData, 'reports');
  }

  // ================== EXPORTED REPORTS ==================
  function renderExportedReports() {
    const data = EXTRA_DATA.exportedReports;
    const tableData = data.map(r => ({
      'اسم الملف': r.filename,
      'الصيغة': r.format,
      'الحجم': r.size,
      'التاريخ': r.date,
      'صدّره': r.exportedBy,
    }));
    renderExtraTable('exportedTable', tableData, 'exportedReports');
  }

  // ================== MY UPDATES ==================
  function renderMyUpdates() {
    const el = document.getElementById('myUpdatesList');
    if (!el) return;
    const data = EXTRA_DATA.myUpdates;
    const iconMap = { 'أضاف': '📝', 'أنشأ': '➕', 'صدّر': '📄', 'حدّث': '🔄' };
    el.innerHTML = data.map((u, i) => {
      const iconKey = Object.keys(iconMap).find(k => u.action.includes(k)) || '';
      return `
      <div class="module-list-item">
        <div class="module-list-icon info">${iconMap[iconKey] || '📋'}</div>
        <div class="module-list-body">
          <h4>${u.action}: ${u.target}</h4>
          <p>${u.value !== '-' ? 'القيمة: ' + u.value : ''}</p>
          <div class="module-list-meta"><span>${u.date}</span><span>${u.user}</span></div>
        </div>
        <div class="module-list-actions">
          <button onclick="App.deleteExtraItem('myUpdates',${i})" title="حذف">🗑️</button>
        </div>
      </div>`;
    }).join('') || `<p style="text-align:center;color:var(--text-muted);padding:30px;">لا توجد تحديثات</p>`;
  }

  // ================== REPOSITORY ==================
  function renderRepository(filter) {
    const filtersEl = document.getElementById('repoFilters');
    const listEl = document.getElementById('repositoryList');
    const data = EXTRA_DATA.repository;

    if (filtersEl) {
      const cats = ['الكل', 'ربعي', 'مؤسسي', 'سنوي'];
      const catMap = { 'الكل': null, 'ربعي': 'quarterly', 'مؤسسي': 'corporate', 'سنوي': 'annual' };
      filtersEl.innerHTML = cats.map(c =>
        `<button class="filter-pill ${(!filter && c === 'الكل') || catMap[c] === filter ? 'active' : ''}" onclick="App.filterRepository('${catMap[c] || ''}')">${c}</button>`
      ).join('');
    }

    if (listEl) {
      const filtered = filter ? data.filter(r => r.category === filter) : data;
      const catLabels = { quarterly: 'ربعي', corporate: 'مؤسسي', annual: 'سنوي' };
      listEl.innerHTML = filtered.map(r => {
        const realIdx = data.indexOf(r);
        return `
        <div class="module-card">
          <div class="module-card-header">
            <h4>${r.title}</h4>
            <span class="badge badge-info">${catLabels[r.category] || r.category}</span>
          </div>
          <p>${r.description}</p>
          <div class="module-card-footer">
            <span>${r.filename} · ${r.date} · ${r.tag}</span>
            <div class="card-actions">
              <button onclick="App.deleteExtraItem('repository',${realIdx})">🗑️</button>
            </div>
          </div>
        </div>`;
      }).join('') || `<p style="text-align:center;color:var(--text-muted);padding:30px;">لا توجد وثائق</p>`;
    }
  }

  function filterRepository(cat) {
    renderRepository(cat || null);
  }

  // ================== ADMIN ==================
  function renderAdmin() {
    const container = document.getElementById('kpi-admin');
    if (!container) return;
    const users = getUsers();
    const totalUsers = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const editors = users.filter(u => u.role === 'editor').length;
    const viewers = users.filter(u => u.role === 'viewer').length;
    container.innerHTML = [
      { cls: '', label: 'إجمالي المستخدمين', value: totalUsers, sub: 'حسابات نشطة' },
      { cls: 'danger', label: 'مدراء', value: admins, sub: 'تحكم كامل' },
      { cls: 'warning', label: 'محررون', value: editors, sub: 'قراءة وكتابة' },
      { cls: 'turquoise', label: 'مشاهدون', value: viewers, sub: 'قراءة فقط' },
    ].map(c => `
      <div class="kpi-card ${c.cls}">
        <span class="kpi-label">${c.label}</span>
        <span class="kpi-value">${c.value}</span>
        <span class="kpi-sub">${c.sub}</span>
      </div>
    `).join('');
  }

  // ================== EXTRA TABLE RENDERER ==================
  function renderExtraTable(tableId, data, section) {
    const table = document.getElementById(tableId);
    if (!table || !data || data.length === 0) {
      if (table) table.innerHTML = `<thead><tr><th>${t('noData')}</th></tr></thead>`;
      return;
    }
    const me = getCurrentUser();
    const canWrite = me && (me.role === 'admin' || me.role === 'editor');
    const headers = Object.keys(data[0]);
    let html = '<thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    if (canWrite) html += `<th class="no-print">${STATE.lang === 'ar' ? 'إجراءات' : 'Actions'}</th>`;
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
      html += '<tr>';
      headers.forEach(h => html += `<td>${row[h] ?? '-'}</td>`);
      if (canWrite) {
        html += `<td class="no-print"><button class="btn-row-action delete" onclick="App.deleteExtraItem('${section}',${idx})" title="حذف">🗑️</button></td>`;
      }
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;

    table.querySelectorAll('th').forEach((th, idx) => {
      th.addEventListener('click', () => sortTable(table, idx));
    });
  }

  // ================== ADD / DELETE EXTRA ITEMS ==================
  function addExtraItem(section) {
    const templates = {
      performance: { id: Date.now(), name: '', code: 'KPI-NEW', type: 'خدمي بالقطاع', target: '', actual: '-', rag: 'grey', sector: '', components: 0 },
      workplan: { id: Date.now(), task: '', assignee: '', status: 'لم يبدأ', dueDate: '', priority: 'متوسط' },
      interventions: { id: Date.now(), title: '', description: '', priority: 'medium', status: 'open', sector: '', date: new Date().toISOString().slice(0, 10) },
      reports: { id: Date.now(), title: '', type: 'monthly', category: '', date: new Date().toISOString().slice(0, 10), author: '', status: 'مسودة' },
      repository: { id: Date.now(), title: '', description: '', filename: '', category: 'quarterly', tag: 'FY2026', date: new Date().toISOString().slice(0, 10) },
    };
    const template = templates[section];
    if (!template) return;

    // Build a simple prompt form
    const fields = Object.keys(template).filter(k => k !== 'id');
    const modal = document.getElementById('addModal');
    const form = document.getElementById('addForm');
    document.getElementById('modalTitle').textContent = STATE.lang === 'ar' ? 'إضافة سجل جديد' : 'Add New Record';

    const fieldLabels = {
      name: 'اسم المؤشر', code: 'الكود', type: 'النوع', target: 'المستهدف', actual: 'الفعلي',
      rag: 'الحالة (green/red/grey)', sector: 'القطاع', components: 'المكونات',
      task: 'المهمة', assignee: 'المسؤول', status: 'الحالة', dueDate: 'تاريخ الاستحقاق', priority: 'الأولوية',
      title: 'العنوان', description: 'الوصف', date: 'التاريخ', author: 'المؤلف',
      category: 'التصنيف', filename: 'اسم الملف', tag: 'الوسم', format: 'الصيغة', size: 'الحجم',
    };

    form.innerHTML = fields.map(f => {
      const isDate = f.toLowerCase().includes('date');
      return `<div class="form-group">
        <label>${fieldLabels[f] || f}</label>
        <input type="${isDate ? 'date' : 'text'}" name="${f}" value="${template[f] === '-' || typeof template[f] === 'number' && template[f] === 0 ? '' : (template[f] || '')}">
      </div>`;
    }).join('');

    STATE.currentModalTab = null;
    STATE._extraSection = section;
    modal.classList.add('show');
  }

  function deleteExtraItem(section, idx) {
    const msg = STATE.lang === 'ar' ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?';
    if (!confirm(msg)) return;
    EXTRA_DATA[section].splice(idx, 1);
    persistExtra();
    renderExtraSection(section);
  }

  function renderExtraSection(section) {
    const renderers = {
      notifications: renderNotifications,
      performance: renderPerformance,
      workplan: renderWorkplan,
      interventions: renderInterventions,
      reports: renderReports,
      exportedReports: renderExportedReports,
      myUpdates: renderMyUpdates,
      repository: renderRepository,
      admin: renderAdmin,
    };
    if (renderers[section]) renderers[section]();
  }

  // ================== AI CHAT ==================
  function aiSend() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    // Get or create messages container
    let msgContainer = document.querySelector('.ai-messages');
    if (!msgContainer) {
      const chatBox = document.querySelector('.ai-chat-box');
      if (!chatBox) return;
      const msgsDiv = document.createElement('div');
      msgsDiv.className = 'ai-messages';
      chatBox.insertBefore(msgsDiv, chatBox.querySelector('.ai-input-row'));
      msgContainer = msgsDiv;
    }

    // Add user message
    msgContainer.innerHTML += `<div class="ai-msg user">${text}</div>`;

    // Simulate AI response
    const responses = [
      'تم استلام طلبك. سيتم تحديث المؤشر قريباً.',
      'جاري تحليل البيانات المطلوبة...',
      'تم تحديث القيمة بنجاح في النظام.',
      'أقترح مراجعة مؤشرات القطاع التجاري - هناك تأخر ملحوظ.',
      'بناءً على البيانات الحالية، نسبة الإنجاز العامة 62% وهي أقل من المستهدف.',
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      msgContainer.innerHTML += `<div class="ai-msg bot">${reply}</div>`;
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 600);

    input.value = '';
  }

  // ================== OVERRIDE SAVE MODAL FOR EXTRA SECTIONS ==================
  const _origSaveModal = saveModal;
  saveModal = function() {
    if (STATE._extraSection) {
      const section = STATE._extraSection;
      const form = document.getElementById('addForm');
      const newItem = { id: Date.now() };
      Array.from(form.elements).forEach(el => {
        if (el.name) {
          let val = el.value || '-';
          if (el.name === 'components') val = parseInt(val, 10) || 0;
          newItem[el.name] = val;
        }
      });
      EXTRA_DATA[section].push(newItem);
      persistExtra();
      renderExtraSection(section);
      STATE._extraSection = null;
      document.getElementById('addModal').classList.remove('show');
      return;
    }
    _origSaveModal();
  };

  // ================== RENDER ALL EXTRA SECTIONS ON TAB SWITCH ==================
  const extraTabRenderers = {
    'notifications': renderNotifications,
    'performance': renderPerformance,
    'workplan': renderWorkplan,
    'interventions': renderInterventions,
    'reports': renderReports,
    'exported-reports': renderExportedReports,
    'my-updates': renderMyUpdates,
    'repository': renderRepository,
    'admin': renderAdmin,
  };

  return { login, logout, getCurrentUser, initDashboard, addExtraItem, deleteExtraItem, aiSend, markRead, filterInterventions, filterRepository };
})();
