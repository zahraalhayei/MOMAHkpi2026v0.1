/**
 * وزارة البلديات والإسكان - Executive Dashboard v2
 * app-v2.js — Full Application Logic
 * Period 2, 2026
 */

const App = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  let state = {
    currentTab: 'notifications',
    lang: 'ar',
    theme: 'light',
    soundOn: true,
    currentUser: null,
    charts: {},
    filters: { strategy: 'all', bi: 'all', ops: 'all', opsContractor: 'all' },
    advFilters: {
      period:   'all',   // Q1/Q2/Q3/Q4/all
      entity:   'all',   // strategy/bi/ops/all
      status:   'all',   // completed/inprogress/stalled/delayed/all
      kpiType:  'all',   // consulting/technology/operational/all
      search:   '',
    },
    modalContext: null,
    myUpdates: [],
    uploadedFiles: [],
    workplanItems: [
      { id:1, task:'مراجعة تقرير الأداء الشهري', due:'2026-04-30', priority:'عالي', status:'معلق', owner:'رامي الطويرقي' },
      { id:2, task:'اجتماع مع فريق BCG لمراجعة الاستراتيجية', due:'2026-05-05', priority:'متوسط', status:'مجدول', owner:'محمد الخمعلي' },
      { id:3, task:'متابعة ملف التعاقد المتعثر (توثيق خدمات الوزارة)', due:'2026-04-29', priority:'عالي', status:'معلق', owner:'سعيد أبو مالح' },
      { id:4, task:'رفع تقرير الفترة الثانية للوكيل', due:'2026-05-15', priority:'عالي', status:'قيد التنفيذ', owner:'مواهب هاشم' },
    ],
    interventions: [
      { id:1, project:'توثيق خدمات وإجراءات الوزارة', agency:'وكالة التخطيط', issue:'تعثر وانتهاء المدة', priority:'عاجل', action:'مراجعة العقد وإشعار المقاول', date:'2026-04-20' },
      { id:2, project:'استشارات فنية لتطوير الأعمال', agency:'وكالة التخطيط', issue:'تأخر الإنجاز عند 30%', priority:'عاجل', action:'اجتماع طارئ مع جامعة الأمير سطام', date:'2026-04-22' },
      { id:3, project:'الجامعة - 24 مخرجاً متأخراً', agency:'مركز الأداء التشغيلي', issue:'جميع المخرجات متأخرة', priority:'حرج', action:'رفع تقرير للقيادة وتفعيل بنود الغرامات', date:'2026-04-25' },
    ],
    users: [
      { id:1, name:'زهرة الحيائي', role:'قائد تنفيذي', user:'admin', pass:'admin123', access:'كامل', status:'نشط' },
      { id:2, name:'رامي الطويرقي', role:'مدير المشاريع', user:'rami', pass:'pass123', access:'مشاريع', status:'نشط' },
      { id:3, name:'آلاء الصنيع', role:'مدير BI', user:'alaa', pass:'pass123', access:'ذكاء الأعمال', status:'نشط' },
      { id:4, name:'محمد الشطير', role:'مدير استراتيجي', user:'mohammed', pass:'pass123', access:'الاستراتيجية', status:'نشط' },
    ],
    reports: [
      { id:1, name:'تقرير الأداء الشهري - مارس 2026', type:'PDF', date:'2026-04-01', size:'2.4 MB', by:'زهرة الحيائي' },
      { id:2, name:'ملخص مشاريع وكالة التخطيط', type:'Excel', date:'2026-04-10', size:'1.1 MB', by:'رامي الطويرقي' },
      { id:3, name:'مؤشرات مركز ذكاء الأعمال Q1', type:'PDF', date:'2026-04-15', size:'3.2 MB', by:'آلاء الصنيع' },
    ],
  };

  // ============================================================
  // AUTH
  // ============================================================
  const USERS_DB = [
    { user:'admin', pass:'admin123', name:'زهرة الحيائي', role:'قائد تنفيذي', initials:'ز' },
    { user:'rami', pass:'pass123', name:'رامي الطويرقي', role:'مدير المشاريع', initials:'ر' },
    { user:'alaa', pass:'pass123', name:'آلاء الصنيع', role:'مدير BI', initials:'آ' },
    { user:'viewer', pass:'view2026', name:'ضيف', role:'مشاهد', initials:'ض' },
  ];

  function login() {
    const u = _el('loginUser').value.trim();
    const p = _el('loginPass').value.trim();
    const found = USERS_DB.find(x => x.user === u && x.pass === p);
    if (!found) {
      _el('loginError').style.display = 'block';
      playSound('error');
      // Shake animation
      const card = document.querySelector('.login-card');
      if (card) { card.style.animation = 'none'; card.offsetHeight; card.style.animation = 'shake 0.4s ease'; }
      return;
    }
    state.currentUser = found;

    // ── شاشة ترحيبية احترافية ──
    _showWelcome(found, () => {
      _el('loginScreen').style.display = 'none';
      _el('appShell').style.display = 'flex';
      _el('sidebarName').textContent = found.name;
      _el('sidebarRole').textContent = found.role;
      _el('sidebarAvatar').textContent = found.initials;
      _el('headerName').textContent = found.name;
      _el('headerAvatar').textContent = found.initials;
      applyLang();
      navigate('notifications');
      setTimeout(() => toast('مرحباً ' + found.name + '، أهلاً بك في لوحة المؤشرات', 'success'), 300);
    });
  }

  // ── عرض الشاشة الترحيبية مع الصوت الاحترافي ──
  function _showWelcome(user, callback) {
    playSound('welcome');

    // أنشئ الـ overlay أو أعد استخدامه
    let ov = _el('welcomeOverlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'welcomeOverlay';
      document.body.appendChild(ov);
    }
    ov.innerHTML = `
      <div class="welcome-logo">🏛️</div>
      <div class="welcome-title">وزارة البلديات والإسكان</div>
      <div class="welcome-sub">لوحة مؤشرات القيادة التنفيذية · الفترة الثانية 2026</div>
      <div class="welcome-user">أهلاً بك، ${user.name} · ${user.role}</div>
    `;
    ov.classList.remove('hidden');
    ov.style.opacity = '1';
    ov.style.pointerEvents = 'auto';

    setTimeout(() => {
      ov.classList.add('hidden');
      setTimeout(() => {
        ov.style.pointerEvents = 'none';
        callback();
      }, 650);
    }, 1800);
  }

  function logout() {
    if (!confirm('هل تريد تسجيل الخروج؟')) return;
    state.currentUser = null;
    _el('appShell').style.display = 'none';
    _el('loginScreen').style.display = 'flex';
    _el('loginError').style.display = 'none';
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function navigate(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const content = _el('tab-' + tab);
    if (content) content.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + tab + "'")) {
        n.classList.add('active');
      }
    });

    state.currentTab = tab;
    playSound('navigate');

    // Render content on demand
    const renderMap = {
      notifications: renderNotifications,
      performance: renderPerformance,
      workplan: renderWorkplan,
      overview: renderOverview,
      strategy: renderStrategy,
      bi: renderBI,
      ops: renderOps,
      interventions: renderInterventions,
      reports: renderReports,
      exports: renderExports,
      ai: renderAI,
      myupdates: renderMyUpdates,
      upload: renderUpload,
      repository: renderRepository,
      admin: renderAdmin,
    };
    if (renderMap[tab]) renderMap[tab]();
  }

  function toggleNav(childrenId, parentEl) {
    const children = _el(childrenId);
    const isOpen = children.classList.toggle('open');
    parentEl.classList.toggle('open', isOpen);
    playSound('navigate');
  }

  // ============================================================
  // THEME & SETTINGS
  // ============================================================
  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    _el('themeBtn').textContent = state.theme === 'dark' ? '☀️' : '🌙';
    // Re-render charts for new colors
    Object.values(state.charts).forEach(c => { try { c.destroy(); } catch(e){} });
    state.charts = {};
    if (state.currentTab) navigate(state.currentTab);
  }

  // ============================================================
  // I18N — قاموس الترجمة الكامل
  // ============================================================
  const I18N = {
    ministry:        { ar:'وزارة البلديات\nوالإسكان',       en:'Ministry of\nMunicipalities' },
    period:          { ar:'الفترة الثانية 2026',             en:'Period 2 · 2026' },
    version:         { ar:'الإصدار 2.0 · 2026',              en:'Version 2.0 · 2026' },
    sec_perf:        { ar:'سجل الأداء',                      en:'Performance Log' },
    nav_notif:       { ar:'الإشعارات',                       en:'Notifications' },
    nav_perf:        { ar:'الأداء',                          en:'Performance' },
    nav_workplan:    { ar:'خطة العمل',                       en:'Work Plan' },
    sec_kpi:         { ar:'تحليلات المؤشرات',                en:'KPI Analytics' },
    nav_analytics:   { ar:'تحليلات المؤشرات',                en:'KPI Analytics' },
    nav_overview:    { ar:'مؤشر عام',                        en:'Overview' },
    nav_strategy:    { ar:'وكالة التخطيط الاستراتيجي',       en:'Strategic Planning' },
    nav_bi:          { ar:'مركز ذكاء الأعمال',               en:'Business Intelligence' },
    nav_ops:         { ar:'مركز الأداء التشغيلي',            en:'Operational Performance' },
    nav_interventions:{ ar:'تدخلات',                         en:'Interventions' },
    nav_reports:     { ar:'تقارير',                          en:'Reports' },
    nav_exports:     { ar:'تقارير مُصدَّرة',                 en:'Exported Reports' },
    nav_ai:          { ar:'تحليلات الذكاء الاصطناعي',        en:'AI Analytics' },
    sec_workspace:   { ar:'مساحة العمل',                     en:'Workspace' },
    nav_myupdates:   { ar:'تحديثاتي',                        en:'My Updates' },
    nav_upload:      { ar:'رفع الملفات',                     en:'File Upload' },
    nav_repo:        { ar:'المستودع',                        en:'Repository' },
    sec_admin:       { ar:'الإدارة',                         en:'Administration' },
    nav_admin:       { ar:'الإدارة',                         en:'Admin' },
    header_title:    { ar:'لوحة المؤشرات التنفيذية',         en:'Executive KPI Dashboard' },
    header_sub:      { ar:'وزارة البلديات والإسكان · 2026',  en:'Ministry of Municipalities · 2026' },
    pg_notif_title:  { ar:'الإشعارات',                       en:'Notifications' },
    pg_notif_sub:    { ar:'آخر التنبيهات والتحديثات للمشاريع والمخرجات', en:'Latest alerts and project updates' },
    pg_notif_btn:    { ar:'تحديد الكل كمقروء',               en:'Mark All Read' },
    pg_perf_title:   { ar:'لوحة الأداء',                     en:'Performance Dashboard' },
    pg_perf_sub:     { ar:'نظرة شاملة على أداء الوحدات الثلاث', en:'Comprehensive view of all three units' },
    pg_wplan_title:  { ar:'خطة العمل',                       en:'Work Plan' },
    pg_wplan_sub:    { ar:'جدول المهام والأنشطة المخطط لها', en:'Scheduled tasks and activities' },
    pg_wplan_btn:    { ar:'+ إضافة مهمة',                    en:'+ Add Task' },
    pg_ovr_title:    { ar:'المؤشر العام التنفيذي',            en:'Executive Overview' },
    pg_ovr_sub:      { ar:'ملخص شامل لأداء الوكالات الثلاث · الفترة الثانية 2026', en:'Comprehensive summary · Period 2, 2026' },
    pg_str_title:    { ar:'وكالة التخطيط الاستراتيجي',       en:'Strategic Planning Agency' },
    pg_str_sub:      { ar:'9 مشاريع استشارية · إجمالي التكلفة: 160,776,870 ريال', en:'9 consulting projects · Total: SAR 160,776,870' },
    pg_bi_title:     { ar:'مركز ذكاء الأعمال ودعم القرار',   en:'Business Intelligence Center' },
    pg_bi_sub:       { ar:'8 مشاريع · إجمالي التكلفة: 113,010,637 ريال', en:'8 projects · Total: SAR 113,010,637' },
    pg_ops_title:    { ar:'مركز مراقبة الأداء التشغيلي',     en:'Operational Performance Center' },
    pg_ops_sub:      { ar:'83 مخرجاً · 3 مقاولين · الفترة الثانية 2026', en:'83 deliverables · 3 contractors · Period 2, 2026' },
    pg_int_title:    { ar:'التدخلات العاجلة',                 en:'Urgent Interventions' },
    pg_int_sub:      { ar:'المشاريع والمخرجات التي تستدعي تدخلاً فورياً', en:'Projects requiring immediate action' },
    pg_int_btn:      { ar:'+ إضافة تدخل',                    en:'+ Add Intervention' },
    pg_rep_title:    { ar:'التقارير',                         en:'Reports' },
    pg_rep_sub:      { ar:'إنشاء وإدارة تقارير الأداء',      en:'Create and manage performance reports' },
    pg_rep_btn:      { ar:'+ إنشاء تقرير جديد',              en:'+ New Report' },
    pg_exp_title:    { ar:'التقارير المُصدَّرة',              en:'Exported Reports' },
    pg_exp_sub:      { ar:'سجل كامل لجميع الملفات المُصدَّرة بصيغ Excel وPDF', en:'Full log of all exported Excel & PDF files' },
    pg_ai_title:     { ar:'تحليلات الذكاء الاصطناعي',        en:'AI Analytics' },
    pg_ai_sub:       { ar:'رؤى ذكية مبنية على بيانات حقيقية', en:'Smart insights built on real data' },
    pg_upd_title:    { ar:'تحديثاتي',                        en:'My Updates' },
    pg_upd_sub:      { ar:'إدارة التحديثات والملاحظات الشخصية', en:'Manage personal updates and notes' },
    pg_upd_btn:      { ar:'+ إضافة تحديث',                   en:'+ Add Update' },
    pg_upl_title:    { ar:'رفع الملفات',                     en:'File Upload' },
    pg_upl_sub:      { ar:'رفع وإدارة الوثائق والتقارير',    en:'Upload and manage documents' },
    pg_repo_title:   { ar:'مستودع الملفات',                   en:'File Repository' },
    pg_repo_sub:     { ar:'جميع الملفات والوثائق المرفوعة',  en:'All uploaded files and documents' },
    pg_adm_title:    { ar:'إدارة النظام',                     en:'System Administration' },
    pg_adm_sub:      { ar:'إدارة المستخدمين والصلاحيات والإعدادات', en:'Manage users, roles and settings' },
    pg_adm_btn:      { ar:'+ إضافة مستخدم',                  en:'+ Add User' },
    btn_export_pdf:  { ar:'📄 تصدير PDF',                    en:'📄 Export PDF' },
    btn_export_xl:   { ar:'📊 تصدير Excel',                  en:'📊 Export Excel' },
    btn_print:       { ar:'🖨️ طباعة',                       en:'🖨️ Print' },
    btn_add_proj:    { ar:'+ إضافة مشروع',                   en:'+ Add Project' },
    kpi_total_projects:    { ar:'إجمالي المشاريع',           en:'Total Projects' },
    kpi_total_projects2:   { ar:'إجمالي المشاريع عبر الجهتين', en:'Total Projects (All Units)' },
    kpi_total_cost:        { ar:'إجمالي التكلفة (ر.س)',      en:'Total Cost (SAR)' },
    kpi_avg_completion:    { ar:'متوسط الإنجاز',             en:'Avg. Completion' },
    kpi_completed:         { ar:'مكتملة / جاري الإغلاق',    en:'Completed / Closing' },
    kpi_stalled:           { ar:'مشاريع متعثرة',             en:'Stalled Projects' },
    kpi_total_deliverables:{ ar:'إجمالي المخرجات (مركز الأداء)', en:'Total Deliverables' },
    kpi_total_deliverables2:{ ar:'إجمالي المخرجات',          en:'Total Deliverables' },
    kpi_del_complete:      { ar:'مكتملة (معتمدة)',           en:'Completed' },
    kpi_on_track:          { ar:'على المسار',                en:'On Track' },
    kpi_delayed:           { ar:'متأخرة (الجامعة)',          en:'Delayed (University)' },
    kpi_ibda_del:          { ar:'مخرجات الابداع',            en:'Ibdaa Deliverables' },
    kpi_ey_del:            { ar:'مخرجات EY',                 en:'EY Deliverables' },
    kpi_in_progress:       { ar:'مشاريع جارية',              en:'In Progress' },
    kpi_not_started:       { ar:'لم تبدأ بعد',              en:'Not Started Yet' },
    kpi_intervention:      { ar:'عناصر تستدعي تدخلاً',       en:'Items Requiring Action' },
    kpi_completed_planning:{ ar:'مشاريع مكتملة (التخطيط)',  en:'Completed (Planning)' },
    kpi_in_prog_planning:  { ar:'جارية (التخطيط)',           en:'In Progress (Planning)' },
    kpi_stalled_planning:  { ar:'متعثرة (التخطيط)',          en:'Stalled (Planning)' },
    kpi_del_completed2:    { ar:'مخرجات مكتملة',            en:'Completed Deliverables' },
    kpi_on_track2:         { ar:'على المسار',               en:'On Track' },
    kpi_delayed2:          { ar:'مخرجات متأخرة',            en:'Delayed Deliverables' },
    th_num:          { ar:'#',                               en:'#' },
    th_project:      { ar:'اسم المشروع',                    en:'Project Name' },
    th_type:         { ar:'النوع',                          en:'Type' },
    th_cost:         { ar:'التكلفة (ر.س)',                  en:'Cost (SAR)' },
    th_remaining:    { ar:'المتبقي (ر.س)',                  en:'Remaining (SAR)' },
    th_completion:   { ar:'الإنجاز',                        en:'Completion' },
    th_status:       { ar:'الحالة',                         en:'Status' },
    th_contractor:   { ar:'المقاول',                        en:'Contractor' },
    th_pm:           { ar:'مدير المشروع',                   en:'Project Manager' },
    th_start:        { ar:'تاريخ البدء',                    en:'Start Date' },
    th_end:          { ar:'تاريخ الانتهاء',                 en:'End Date' },
    th_details:      { ar:'تفاصيل',                         en:'Details' },
    th_action:       { ar:'إجراء',                          en:'Action' },
    th_task:         { ar:'المهمة',                         en:'Task' },
    th_due:          { ar:'الاستحقاق',                      en:'Due Date' },
    th_priority:     { ar:'الأولوية',                       en:'Priority' },
    th_owner:        { ar:'المسؤول',                        en:'Owner' },
    th_output:       { ar:'المخرج',                         en:'Output' },
    th_doc_status:   { ar:'حالة الوثيقة',                   en:'Doc Status' },
    th_delivery:     { ar:'تاريخ التسليم',                  en:'Delivery Date' },
    th_entity:       { ar:'الجهة',                          en:'Entity' },
    th_project_output:{ ar:'المشروع / المخرج',              en:'Project / Output' },
    th_agency:       { ar:'الجهة',                          en:'Agency' },
    th_issue:        { ar:'المشكلة',                        en:'Issue' },
    th_suggested:    { ar:'الإجراء المقترح',                en:'Suggested Action' },
    th_date:         { ar:'التاريخ',                        en:'Date' },
    th_name:         { ar:'الاسم',                          en:'Name' },
    th_role:         { ar:'الدور الوظيفي',                  en:'Role' },
    th_user:         { ar:'المستخدم',                       en:'Username' },
    th_access:       { ar:'الصلاحيات',                      en:'Access' },
    th_user_status:  { ar:'الحالة',                         en:'Status' },
    filter_by_status:{ ar:'تصفية حسب الحالة:',              en:'Filter by Status:' },
    filter_contractor:{ ar:'المقاول:',                       en:'Contractor:' },
    filter_status:   { ar:'الحالة:',                        en:'Status:' },
    filter_all:      { ar:'الكل',                           en:'All' },
    filter_completed:{ ar:'مكتمل',                          en:'Completed' },
    filter_in_prog:  { ar:'جاري',                           en:'In Progress' },
    filter_stalled:  { ar:'متعثر',                          en:'Stalled' },
    filter_not_start:{ ar:'لم يبدأ',                        en:'Not Started' },
    badge_urgent:    { ar:'عاجل',                           en:'Urgent' },
    badge_alert:     { ar:'تنبيه',                          en:'Alert' },
    badge_info_lbl:  { ar:'معلومة',                         en:'Info' },
    chart_unit_compare:  { ar:'مقارنة الأداء بين الوحدات',  en:'Unit Performance Comparison' },
    chart_cost_dist:     { ar:'توزيع التكاليف حسب الوحدة',  en:'Cost Distribution by Unit' },
    chart_ops_status:    { ar:'حالة المخرجات التشغيلية',    en:'Operational Deliverables Status' },
    chart_comp_proj:     { ar:'نسبة الإنجاز لكل مشروع',    en:'Completion Rate per Project' },
    chart_status_dist:   { ar:'توزيع حالات المشاريع',       en:'Project Status Distribution' },
    chart_cost_vs_rem:   { ar:'التكلفة vs المتبقي (م ر.س)', en:'Cost vs Remaining (M SAR)' },
    chart_by_contractor: { ar:'المخرجات حسب المقاول والحالة', en:'Deliverables by Contractor & Status' },
    chart_del_status:    { ar:'توزيع حالات المخرجات',       en:'Deliverables Status Distribution' },
    chart_cost_per_proj: { ar:'توزيع التكلفة حسب المشروع',  en:'Cost Distribution per Project' },
    lbl_completion:  { ar:'نسبة الإنجاز',                   en:'Completion %' },
    lbl_cost:        { ar:'التكلفة',                        en:'Cost' },
    lbl_remaining:   { ar:'المتبقي',                        en:'Remaining' },
    lbl_complete:    { ar:'مكتمل',                          en:'Completed' },
    lbl_on_track:    { ar:'على المسار',                     en:'On Track' },
    lbl_delayed:     { ar:'متأخر',                          en:'Delayed' },
    lbl_closing:     { ar:'مكتمل/إغلاق',                   en:'Complete/Closing' },
    lbl_in_prog:     { ar:'جاري',                           en:'In Progress' },
    lbl_stalled:     { ar:'متعثر',                          en:'Stalled' },
    lbl_not_started: { ar:'لم يبدأ',                        en:'Not Started' },
    lbl_avg_comp:    { ar:'متوسط الإنجاز %',                en:'Avg. Completion %' },
    lbl_complete_approved:{ ar:'مكتمل / معتمد',            en:'Complete / Approved' },
    lbl_strategy:    { ar:'وكالة التخطيط الاستراتيجي',      en:'Strategic Planning Agency' },
    lbl_bi:          { ar:'مركز ذكاء الأعمال',              en:'Business Intelligence' },
    lbl_ops:         { ar:'مركز الأداء التشغيلي',           en:'Operational Performance' },
    ring_done:       { ar:'إنجاز',                          en:'Done' },
    ring_complete:   { ar:'مكتمل',                          en:'Done' },
    hero_tag:        { ar:'🏛️ الفترة الثانية 2026',          en:'🏛️ Period 2 · 2026' },
    hero_title:      { ar:'ملخص الأداء التنفيذي الشامل',    en:'Comprehensive Executive Performance Summary' },
    hero_projects:   { ar:'مشروع نشط',                      en:'Active Projects' },
    hero_cost:       { ar:'ر.س إجمالي التكلفة',             en:'SAR Total Cost' },
    hero_deliverables:{ ar:'مخرجاً تشغيلياً',               en:'Operational Deliverables' },
    hero_needs_action:{ ar:'تستدعي تدخلاً',                 en:'Require Intervention' },
    agency_strategy: { ar:'وكالة التخطيط الاستراتيجي',      en:'Strategic Planning Agency' },
    agency_bi:       { ar:'مركز ذكاء الأعمال ودعم القرار',  en:'Business Intelligence Center' },
    agency_ops:      { ar:'مركز مراقبة الأداء التشغيلي',    en:'Operational Performance Center' },
    lbl_project:     { ar:'مشروع',                          en:'Projects' },
    lbl_output:      { ar:'مخرج',                           en:'Deliverables' },
    lbl_avg_comp2:   { ar:'متوسط إنجاز',                    en:'Avg. Completion' },
    lbl_stalled2:    { ar:'متعثر',                          en:'Stalled' },
    lbl_not_started2:{ ar:'لم تبدأ',                        en:'Not Started' },
    lbl_complete2:   { ar:'مكتمل',                          en:'Completed' },
    lbl_delayed2:    { ar:'متأخر',                          en:'Delayed' },
    stat_completed:  { ar:'مشاريع مكتملة',                  en:'Completed' },
    stat_stalled:    { ar:'متعثرة',                         en:'Stalled' },
    stat_in_prog:    { ar:'جارية',                          en:'In Progress' },
    stat_total:      { ar:'إجمالي',                         en:'Total' },
    stat_complete2:  { ar:'مكتمل',                          en:'Completed' },
    stat_not_started:{ ar:'لم تبدأ',                        en:'Not Started' },
    stat_completed2: { ar:'مكتملة',                         en:'Completed' },
    stat_delayed:    { ar:'متأخرة',                         en:'Delayed' },
    stat_on_track:   { ar:'على المسار',                     en:'On Track' },
    tbl_strategy:    { ar:'مشاريع وكالة التخطيط الاستراتيجي', en:'Strategic Planning Agency Projects' },
    tbl_bi:          { ar:'مشاريع مركز ذكاء الأعمال',       en:'Business Intelligence Projects' },
    tbl_ops:         { ar:'مخرجات مركز الأداء التشغيلي',    en:'Operational Performance Deliverables' },
    tbl_tasks:       { ar:'المهام والأنشطة',                 en:'Tasks & Activities' },
    tbl_interventions:{ ar:'قائمة التدخلات',                 en:'Interventions List' },
    tbl_unit:        { ar:'مهمة',                           en:'task(s)' },
    tbl_project_unit:{ ar:'مشروع',                          en:'project(s)' },
    tbl_output_unit: { ar:'مخرج',                           en:'deliverable(s)' },
    search_ph:       { ar:'بحث...',                         en:'Search...' },
    search_ph2:      { ar:'بحث في المخرجات...',             en:'Search deliverables...' },
    footer_total_cost:    { ar:'إجمالي التكلفة:',           en:'Total Cost:' },
    footer_remaining:     { ar:'المتبقي:',                  en:'Remaining:' },
    ins_top_perf:    { ar:'أعلى أداء',                      en:'Top Performer' },
    ins_top_body:    { ar:'وكالة التخطيط بمتوسط إنجاز 64% تتصدر الأداء', en:'Strategic Planning leads with 64% avg. completion' },
    ins_follow_up:   { ar:'أولوية المتابعة',                en:'Follow-up Priority' },
    ins_follow_body: { ar:'مركز ذكاء الأعمال: 6 مشاريع عند 0% رغم التعاقد', en:'BI Center: 6 projects at 0% despite contracting' },
    ins_urgent:      { ar:'تدخل عاجل',                      en:'Urgent Action' },
    ins_urgent_body: { ar:'الجامعة: 24 مخرجاً متأخراً (100% من مخرجاتها)', en:'University: 24 delayed deliverables (100% of its outputs)' },
    ins_total_spent: { ar:'إجمالي الإنفاق',                 en:'Total Spending' },
    ai_budget:       { ar:'إجمالي الميزانية',              en:'Total Budget' },
    ai_budget_body:  { ar:'273,787,557 ريال سعودي عبر الجهات الثلاث', en:'SAR 273,787,557 across all three units' },
    ai_top:          { ar:'أعلى أداء',                     en:'Top Performer' },
    ai_top_body:     { ar:'وكالة التخطيط: 64% متوسط إنجاز', en:'Strategic Planning: 64% avg. completion' },
    ai_low:          { ar:'أدنى أداء',                     en:'Lowest Performer' },
    ai_low_body:     { ar:'مركز ذكاء الأعمال: 9% فقط - 6 مشاريع لم تبدأ', en:'BI Center: only 9% — 6 projects not started' },
    ai_critical:     { ar:'أكثر تأخراً',                   en:'Most Delayed' },
    ai_critical_body:{ ar:'الجامعة: 24 مخرجاً متأخراً (29% من الكل)', en:'University: 24 delayed deliverables (29% of total)' },
    ai_assistant:    { ar:'مساعد الذكاء الاصطناعي',         en:'AI Assistant' },
    ai_subtitle:     { ar:'رؤى ذكية مبنية على البيانات الحقيقية للفترة الثانية 2026', en:'Smart insights built on real data · Period 2, 2026' },
    ai_chip1:        { ar:'ملخص الأداء العام',              en:'Overall Performance Summary' },
    ai_chip2:        { ar:'المشاريع المتعثرة',              en:'Stalled Projects' },
    ai_chip3:        { ar:'مركز ذكاء الأعمال',             en:'Business Intelligence' },
    ai_chip4:        { ar:'المخرجات المتأخرة',              en:'Delayed Deliverables' },
    ai_chip5:        { ar:'توصيات التحسين',                 en:'Improvement Recommendations' },
    ai_chip6:        { ar:'الميزانية والتكاليف',            en:'Budget & Costs' },
    ai_greeting:     { ar:'مرحباً! أنا مساعدك الذكي لتحليل بيانات وزارة البلديات والإسكان. كيف يمكنني مساعدتك؟', en:"Hello! I'm your AI assistant for analyzing Ministry data. How can I help?" },
    ai_input_ph:     { ar:'اسأل عن الأداء، التكاليف، المشاريع...', en:'Ask about performance, costs, projects...' },
    ai_send:         { ar:'إرسال ➤',                        en:'Send ➤' },
    adm_users_title: { ar:'👥 إدارة المستخدمين',            en:'👥 User Management' },
    adm_users_count: { ar:'مستخدم',                        en:'user(s)' },
    adm_edit:        { ar:'✏️',                             en:'✏️' },
    adm_delete:      { ar:'🗑️',                            en:'🗑️' },
    adm_stats_title: { ar:'📊 إحصائيات النظام',             en:'📊 System Statistics' },
    adm_stat_projects:{ ar:'إجمالي المشاريع',              en:'Total Projects' },
    adm_stat_deliverables:{ ar:'إجمالي المخرجات',          en:'Total Deliverables' },
    adm_stat_budget: { ar:'الميزانية الكلية (ر.س)',         en:'Total Budget (SAR)' },
    adm_stat_completion:{ ar:'متوسط الإنجاز',              en:'Avg. Completion' },
    adm_stat_users:  { ar:'المستخدمين النشطين',             en:'Active Users' },
    adm_stat_stalled:{ ar:'مشاريع متعثرة',                 en:'Stalled Projects' },
    adm_settings_title:{ ar:'⚙️ إعدادات النظام',            en:'⚙️ System Settings' },
    adm_lang:        { ar:'اللغة الافتراضية',               en:'Default Language' },
    adm_theme:       { ar:'المظهر',                         en:'Theme' },
    adm_theme_light: { ar:'فاتح',                          en:'Light' },
    adm_theme_dark:  { ar:'داكن',                          en:'Dark' },
    adm_sound:       { ar:'الصوت',                         en:'Sound' },
    adm_sound_on:    { ar:'مفعّل',                         en:'On' },
    adm_sound_off:   { ar:'معطّل',                         en:'Off' },
    exp_total:       { ar:'إجمالي التقارير',               en:'Total Reports' },
    exp_pdf:         { ar:'ملفات PDF',                     en:'PDF Files' },
    exp_excel:       { ar:'ملفات Excel',                   en:'Excel Files' },
    exp_last:        { ar:'آخر تصدير',                     en:'Last Export' },
    exp_quick_title: { ar:'⚡ تصدير سريع',                  en:'⚡ Quick Export' },
    exp_log_title:   { ar:'📂 سجل التقارير المصدَّرة',      en:'📂 Exported Reports Log' },
    exp_all:         { ar:'الكل',                          en:'All' },
    exp_col_name:    { ar:'اسم التقرير',                   en:'Report Name' },
    exp_col_type:    { ar:'النوع',                         en:'Type' },
    exp_col_date:    { ar:'تاريخ الإنشاء',                 en:'Created Date' },
    exp_col_size:    { ar:'الحجم',                         en:'Size' },
    exp_col_actions: { ar:'الإجراءات',                     en:'Actions' },
    exp_created_by:  { ar:'معد بواسطة:',                  en:'Created by:' },
    exp_download:    { ar:'⬇️ تنزيل',                      en:'⬇️ Download' },
    exp_no_files:    { ar:'لا توجد تقارير في هذا التصنيف',   en:'No reports in this category' },
    rpt_new_title:   { ar:'إنشاء تقرير جديد',              en:'Create New Report' },
    rpt_name_lbl:    { ar:'اسم التقرير',                   en:'Report Name' },
    rpt_name_ph:     { ar:'مثال: تقرير الأداء الشهري',    en:'e.g. Monthly Performance Report' },
    rpt_type_lbl:    { ar:'نوع التقرير',                   en:'Report Type' },
    rpt_create_btn:  { ar:'إنشاء التقرير',                 en:'Create Report' },
    upl_drop:        { ar:'اسحب الملفات هنا أو اضغط للاختيار', en:'Drag & drop files here or click to select' },
    upl_supported:   { ar:'يدعم: PDF, Excel, Word, الصور', en:'Supported: PDF, Excel, Word, Images' },
    upl_choose:      { ar:'اختر ملفاً',                    en:'Choose File' },
    upl_uploaded:    { ar:'📎 الملفات المرفوعة',            en:'📎 Uploaded Files' },
    upl_no_files:    { ar:'لم يتم رفع ملفات بعد',       en:'No files uploaded yet' },
    repo_no_files:   { ar:'المستودع فارغ. ارفع ملفات من قسم رفع الملفات.', en:'Repository is empty. Upload files from File Upload section.' },
    upd_no_updates:  { ar:'لا توجد تحديثات بعد. أضف أول تحديث!', en:'No updates yet. Add your first update!' },
    upd_by:          { ar:'بواسطة',                         en:'by' },
    notif_d1_title:  { ar:'مشاريع متعثرة تستدعي تدخلاً',   en:'Stalled Projects Require Intervention' },
    notif_d1_body:   { ar:'مشروعان متعثران: "توثيق خدمات الوزارة" (24%) و"استشارات فنية التواصل" (30%)', en:'Two stalled projects: "Ministry Services Documentation" (24%) & "Communications Consulting" (30%)' },
    notif_d1_time:   { ar:'منذ ساعة',                       en:'1 hour ago' },
    notif_d2_title:  { ar:'24 مخرجاً متأخراً في مركز الأداء', en:'24 Delayed Deliverables in Ops Center' },
    notif_d2_body:   { ar:'جميع المخرجات الـ 24 للجامعة متأخرة دون تواريخ استحقاق', en:'All 24 university deliverables are delayed with no due dates' },
    notif_d2_time:   { ar:'منذ 3 ساعات',                    en:'3 hours ago' },
    notif_w1_title:  { ar:'6 مشاريع لم تبدأ في مركز ذكاء الأعمال', en:'6 Projects Not Started in BI Center' },
    notif_w1_body:   { ar:'6 من أصل 8 مشاريع لا تزال عند 0% رغم التعاقد', en:'6 of 8 BI Center projects remain at 0% despite contracting' },
    notif_w1_time:   { ar:'منذ يوم',                        en:'1 day ago' },
    notif_s1_title:  { ar:'اكتمال مشروع إدارة المخاطر',    en:'Risk Management Project Completed' },
    notif_s1_body:   { ar:'مشروع "مسار إدارة المخاطر" مع PWC اكتمل بنسبة 100%', en:'"Risk Management Track" with PWC completed at 100%' },
    notif_s1_time:   { ar:'منذ يومين',                      en:'2 days ago' },
    notif_s2_title:  { ar:'إنجاز 23 مخرجاً في مركز الأداء', en:'23 Deliverables Completed in Ops Center' },
    notif_s2_body:   { ar:'شركة الابداع وEY أكملتا 23 مخرجاً بحالة "معتمد"', en:'Ibdaa and EY completed 23 "Approved" deliverables' },
    notif_s2_time:   { ar:'منذ 3 أيام',                     en:'3 days ago' },
    notif_w2_title:  { ar:'وكالة التخطيط - أداء متقدم',    en:'Strategic Planning — Advanced Performance' },
    notif_w2_body:   { ar:'متوسط الإنجاز 64% مع الحاجة لمعالجة المشاريع المتعثرة', en:'64% avg. completion with stalled projects needing attention' },
    notif_w2_time:   { ar:'منذ أسبوع',                      en:'1 week ago' },
    qexp_overview:   { ar:'📋 نظرة عامة PDF',                   en:'📋 Overview PDF' },
    qexp_strategy:   { ar:'🎯 التخطيط الاستراتيجي Excel',       en:'🎯 Strategic Planning Excel' },
    qexp_bi:         { ar:'💡 ذكاء الأعمال Excel',               en:'💡 Business Intelligence Excel' },
    qexp_ops:        { ar:'⚙️ الأداء التشغيلي Excel',            en:'⚙️ Operational Performance Excel' },
    qexp_perf:       { ar:'📊 لوحة الأداء PDF',                  en:'📊 Performance Dashboard PDF' },
    qexp_int:        { ar:'🚨 التدخلات PDF',                     en:'🚨 Interventions PDF' },
  };

  function t(key) {
    const entry = I18N[key];
    if (!entry) return key;
    return entry[state.lang] || entry.ar;
  }

  function applyLang() {
    const isEn = state.lang === 'en';

    // 1. Page direction + font
    document.documentElement.lang = isEn ? 'en' : 'ar';
    document.documentElement.dir  = isEn ? 'ltr' : 'rtl';
    document.body.style.fontFamily = isEn
      ? "'Segoe UI','Inter',sans-serif"
      : "'Tajawal','Cairo',sans-serif";

    // 2. All data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val.includes('\n')) el.innerHTML = val.replace(/\n/g, '<br>');
      else el.textContent = val;
    });

    // 3. Page title + subtitle for current tab
    _applyPageHeader(state.currentTab);

    // 4. Sidebar padding direction (RTL=right-padded, LTR=left-padded)
    document.querySelectorAll('.nav-item, .nav-section-label').forEach(el => {
      if (isEn) {
        el.style.paddingLeft  = '16px';
        el.style.paddingRight = '12px';
        el.style.textAlign    = 'left';
      } else {
        el.style.paddingLeft  = '';
        el.style.paddingRight = '';
        el.style.textAlign    = '';
      }
    });

    // 5. Header title alignment
    const hTitle = document.querySelector('.header-title');
    const hSub   = document.querySelector('.header-subtitle');
    if (hTitle) hTitle.style.textAlign = isEn ? 'left' : 'right';
    if (hSub)   hSub.style.textAlign   = isEn ? 'left' : 'right';

    // 6. Sync lang button text
    const lb = document.getElementById('langBtn');
    if (lb) lb.textContent = isEn ? 'ع' : 'EN';
  }

  function _applyPageHeader(tab) {
    const map = {
      notifications: { title:'pg_notif_title', sub:'pg_notif_sub' },
      performance:   { title:'pg_perf_title',  sub:'pg_perf_sub'  },
      workplan:      { title:'pg_wplan_title', sub:'pg_wplan_sub'  },
      overview:      { title:'pg_ovr_title',   sub:'pg_ovr_sub'   },
      strategy:      { title:'pg_str_title',   sub:'pg_str_sub'   },
      bi:            { title:'pg_bi_title',    sub:'pg_bi_sub'    },
      ops:           { title:'pg_ops_title',   sub:'pg_ops_sub'   },
      interventions: { title:'pg_int_title',   sub:'pg_int_sub'   },
      reports:       { title:'pg_rep_title',   sub:'pg_rep_sub'   },
      exports:       { title:'pg_exp_title',   sub:'pg_exp_sub'   },
      ai:            { title:'pg_ai_title',    sub:'pg_ai_sub'    },
      myupdates:     { title:'pg_upd_title',   sub:'pg_upd_sub'   },
      upload:        { title:'pg_upl_title',   sub:'pg_upl_sub'   },
      repository:    { title:'pg_repo_title',  sub:'pg_repo_sub'  },
      admin:         { title:'pg_adm_title',   sub:'pg_adm_sub'   },
    };
    const cfg = map[tab];
    if (!cfg) return;
    const pane = _el('tab-' + tab);
    if (!pane) return;
    const titleEl = pane.querySelector('.page-title');
    const subEl   = pane.querySelector('.page-subtitle');
    if (titleEl) titleEl.textContent = t(cfg.title);
    if (subEl)   subEl.textContent   = t(cfg.sub);
  }

  function toggleLang() {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    _el('langBtn').textContent = state.lang === 'ar' ? 'EN' : 'ع';
    applyLang();
    // أعد رسم التبويب الحالي (لترجمة المحتوى الديناميكي)
    const renderMap = {
      notifications: renderNotifications, performance: renderPerformance,
      workplan: renderWorkplan, overview: renderOverview,
      strategy: renderStrategy, bi: renderBI, ops: renderOps,
      interventions: renderInterventions, reports: renderReports,
      exports: renderExports, ai: renderAI, myupdates: renderMyUpdates,
      upload: renderUpload, repository: renderRepository, admin: renderAdmin,
    };
    if (renderMap[state.currentTab]) renderMap[state.currentTab]();
    toast(state.lang === 'ar' ? 'تم التبديل للعربية' : 'Switched to English', 'info');
  }

  const SVG_SOUND_ON  = `<svg id="soundIcon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
  const SVG_SOUND_OFF = `<svg id="soundIcon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

  function toggleSound() {
    state.soundOn = !state.soundOn;
    _el('soundBtn').innerHTML = state.soundOn ? SVG_SOUND_ON : SVG_SOUND_OFF;
    if (state.soundOn) playSound('toggle');
    toast(state.soundOn ? 'الصوت مُفعَّل' : 'Sound On', 'info');
  }

  // ============================================================
  // SOUND ENGINE  (Web Audio API — no external files needed)
  // ============================================================
  const _audio = { ctx: null };

  function _ctx() {
    if (!_audio.ctx) _audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _audio.ctx;
  }

  // Master volume envelope helper
  function _env(gainNode, ac, atk, sus, rel) {
    const now = ac.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + atk);
    gainNode.gain.setValueAtTime(0.18, now + atk + sus);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + atk + sus + rel);
  }

  // Single soft sine tone
  function _tone(freq, startOffset, duration, gainVal, type) {
    const ac = _ctx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime + startOffset);
    const t = ac.currentTime + startOffset;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gainVal, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  function playSound(type) {
    if (!state.soundOn) return;
    try {
      switch (type) {

        // ── ترحيب: لحن كامل احترافي (5 نغمات + وتر نهائي)
        case 'welcome':
          _tone(523.25, 0.00, 0.5, 0.13);   // C5
          _tone(659.25, 0.15, 0.5, 0.12);   // E5
          _tone(783.99, 0.30, 0.5, 0.11);   // G5
          _tone(1046.5, 0.45, 0.6, 0.10);   // C6
          _tone(1318.5, 0.62, 0.8, 0.09);   // E6  ← ذروة
          _tone(987.77,  0.80, 1.0, 0.07);  // B5  ← هبوط ناعم
          _tone(783.99,  0.95, 1.2, 0.06);  // G5  ← إغلاق
          break;

        // ── دخول ناجح: ثلاث نغمات تصاعدية ناعمة
        case 'login':
          _tone(523.25, 0.00, 0.6, 0.14);   // C5
          _tone(659.25, 0.18, 0.6, 0.12);   // E5
          _tone(783.99, 0.36, 0.9, 0.10);   // G5
          break;

        // ── تنقل بين التبويبات: نقرة ناعمة خفيفة
        case 'navigate':
          _tone(880,  0.00, 0.18, 0.07, 'sine');
          _tone(1108, 0.06, 0.14, 0.05, 'sine');
          break;

        // ── نجاح / حفظ: جرس إيجابي
        case 'success':
          _tone(659.25, 0.00, 0.35, 0.13);
          _tone(830.61, 0.12, 0.35, 0.11);
          _tone(987.77, 0.24, 0.55, 0.09);
          break;

        // ── تحذير / خطأ: نبضة هادئة
        case 'error':
          _tone(311.13, 0.00, 0.28, 0.13, 'sine');
          _tone(261.63, 0.18, 0.40, 0.10, 'sine');
          break;

        // ── إشعار: رنين ناعم من نغمتين
        case 'notif':
          _tone(1046.5, 0.00, 0.30, 0.09);
          _tone(1318.5, 0.14, 0.45, 0.07);
          break;

        // ── تبديل الصوت تشغيل
        case 'toggle':
          _tone(698.46, 0.00, 0.20, 0.10);
          _tone(880.00, 0.12, 0.25, 0.08);
          break;

        // ── طباعة / تصدير: نقرة قصيرة هادئة
        case 'action':
          _tone(740,  0.00, 0.15, 0.08, 'sine');
          _tone(988,  0.08, 0.20, 0.06, 'sine');
          break;
      }
    } catch (e) { /* صامت إن لم يدعم المتصفح */ }
  }

  // ============================================================
  // UTILITY HELPERS
  // ============================================================
  function _el(id) { return document.getElementById(id); }

  function fmt(n) {
    if (n === null || n === undefined) return '-';
    return Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 0 });
  }

  function fmtSAR(n) { return fmt(n) + ' ر.س'; }

  function getStatusColor(status) {
    if (['مكتمل','انتهى','جاري الإغلاق','معتمد'].includes(status)) return 'success';
    if (['متعثر','متأخر'].includes(status)) return 'danger';
    if (['على المسار','بدأ التنفيذ','تم التعاقد','بدا التنفيذ','بداء التنفيذ'].includes(status)) return 'warning';
    return 'info';
  }

  function getProgressColor(pct) {
    if (pct >= 80) return 'success';
    if (pct >= 40) return 'warning';
    return 'danger';
  }

  function badge(text, color) {
    return `<span class="badge ${color}">${text}</span>`;
  }

  function progressBar(pct) {
    const color = getProgressColor(pct);
    return `<div class="progress-wrap">
      <div class="progress-bar-bg"><div class="progress-bar-fill ${color}" style="width:${pct}%"></div></div>
      <span class="progress-pct">${pct}%</span>
    </div>`;
  }

  function destroyChart(key) {
    if (state.charts[key]) {
      try { state.charts[key].destroy(); } catch(e) {}
      delete state.charts[key];
    }
  }

  function getChartColors() {
    const isDark = state.theme === 'dark';
    return {
      gridColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      textColor: isDark ? '#9DC0AE' : '#4B6358',
      green: '#00833E',
      turquoise: '#1FA89C',
      danger: '#EF4444',
      warning: '#F59E0B',
      success: '#22C55E',
      info: '#3B82F6',
      purple: '#8B5CF6',
    };
  }

  // ============================================================
  // TOAST
  // ============================================================
  function toast(msg, type = 'info') {
    const tc = _el('toastContainer');
    const icons = { success:'✅', danger:'❌', warning:'⚠️', info:'ℹ️' };
    const div = document.createElement('div');
    div.className = `toast ${type}`;
    div.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${msg}</span>`;
    tc.appendChild(div);
    // صوت مناسب لكل نوع رسالة
    if (type === 'success') playSound('success');
    else if (type === 'danger') playSound('error');
    else if (type === 'warning') playSound('error');
    else if (type === 'info') playSound('notif');
    setTimeout(() => { div.style.opacity='0'; div.style.transition='opacity 0.4s'; setTimeout(()=>div.remove(), 400); }, 3500);
  }

  // ============================================================
  // MODAL
  // ============================================================
  function openModal(title, bodyHtml, context) {
    _el('modalTitle').textContent = title;
    _el('modalBody').innerHTML = bodyHtml;
    state.modalContext = context;
    _el('mainModal').classList.add('open');
    playSound('action');
  }

  function closeModal(e) {
    if (e && e.target !== _el('mainModal')) return;
    _el('mainModal').classList.remove('open');
    state.modalContext = null;
  }

  function saveModal() {
    const ctx = state.modalContext;
    if (!ctx) return;
    if (ctx === 'user') {
      const name = document.querySelector('#modalBody [name="uname"]').value;
      const role = document.querySelector('#modalBody [name="urole"]').value;
      const user = document.querySelector('#modalBody [name="uuser"]').value;
      const pass = document.querySelector('#modalBody [name="upass"]').value;
      if (!name || !user) { toast('يرجى ملء الحقول المطلوبة','danger'); return; }
      state.users.push({ id: Date.now(), name, role, user, pass, access:'عام', status:'نشط' });
      toast('تم إضافة المستخدم بنجاح','success');
      closeModal();
      renderAdmin();
    } else if (ctx === 'workplan') {
      const task = document.querySelector('#modalBody [name="wtask"]').value;
      const due = document.querySelector('#modalBody [name="wdue"]').value;
      const priority = document.querySelector('#modalBody [name="wpriority"]').value;
      const owner = document.querySelector('#modalBody [name="wowner"]').value;
      if (!task) { toast('يرجى إدخال اسم المهمة','danger'); return; }
      state.workplanItems.push({ id: Date.now(), task, due, priority, status:'معلق', owner });
      toast('تمت إضافة المهمة بنجاح','success');
      closeModal();
      renderWorkplan();
    } else if (ctx === 'update') {
      const text = document.querySelector('#modalBody [name="utext"]').value;
      if (!text) { toast('يرجى إدخال نص التحديث','danger'); return; }
      state.myUpdates.push({ id: Date.now(), text, date: new Date().toLocaleDateString('ar-SA'), user: state.currentUser?.name || 'المستخدم' });
      toast('تمت إضافة التحديث','success');
      closeModal();
      renderMyUpdates();
    } else if (ctx === 'intervention') {
      const project = document.querySelector('#modalBody [name="iproject"]').value;
      const issue = document.querySelector('#modalBody [name="iissue"]').value;
      if (!project) { toast('يرجى ملء البيانات','danger'); return; }
      state.interventions.push({ id: Date.now(), project, agency:'عام', issue, priority:'عاجل', action:'-', date: new Date().toLocaleDateString('ar-SA') });
      toast('تم رفع التدخل','success');
      closeModal();
      renderInterventions();
    } else if (ctx === 'ops') {
      const output = document.querySelector('#modalBody [name="ooutput"]')?.value;
      const contractor = document.querySelector('#modalBody [name="ocontractor"]')?.value || 'الابداع';
      const ostatus = document.querySelector('#modalBody [name="ostatus"]')?.value || 'على المسار';
      const entity = document.querySelector('#modalBody [name="oentity"]')?.value || '-';
      if (!output) { toast('يرجى إدخال اسم المخرج','danger'); return; }
      toast('تمت إضافة المخرج بنجاح','success');
      closeModal();
    } else if (ctx === 'report') {
      const rname = document.querySelector('#modalBody [name="rname"]')?.value;
      const rtype = document.querySelector('#modalBody [name="rtype"]')?.value || 'PDF';
      if (!rname) { toast('يرجى إدخال اسم التقرير','danger'); return; }
      const nowR = new Date();
      state.reports.unshift({ id:Date.now(), name:rname, type:rtype, date:nowR.toLocaleDateString('ar-SA'), size:'~1 MB', by:state.currentUser?.name||'المستخدم' });
      if (!state.exportedFiles) state.exportedFiles = [];
      state.exportedFiles.unshift({ id:Date.now()+1, name:rname+' - '+nowR.toISOString().split('T')[0], type:rtype, size:'~1 MB', date:nowR.toISOString().split('T')[0], time:nowR.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'}), by:state.currentUser?.name||'المستخدم', section:'reports', icon: rtype==='PDF'?'📄':'📊' });
      toast('تم إنشاء التقرير وإضافته للسجل','success');
      closeModal();
      renderReports();
    } else {
      toast('تم الحفظ','success');
      closeModal();
    }
  }

  function openAddModal(section) {
    const forms = {
      user: `<div class="form-row">
        <div class="form-group"><label class="form-label">الاسم *</label><input class="form-control" name="uname" placeholder="الاسم الكامل"></div>
        <div class="form-group"><label class="form-label">الدور الوظيفي</label><input class="form-control" name="urole" placeholder="مثال: مدير المشاريع"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">اسم المستخدم *</label><input class="form-control" name="uuser" placeholder="username"></div>
        <div class="form-group"><label class="form-label">كلمة المرور</label><input class="form-control" type="password" name="upass" placeholder="••••••"></div>
      </div>`,
      workplan: `<div class="form-group"><label class="form-label">المهمة *</label><input class="form-control" name="wtask" placeholder="وصف المهمة"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">تاريخ الاستحقاق</label><input class="form-control" type="date" name="wdue"></div>
          <div class="form-group"><label class="form-label">الأولوية</label><select class="form-control" name="wpriority"><option>عالي</option><option>متوسط</option><option>منخفض</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">المسؤول</label><input class="form-control" name="wowner" placeholder="اسم المسؤول"></div>`,
      update: `<div class="form-group"><label class="form-label">التحديث *</label><textarea class="form-control" name="utext" rows="4" placeholder="أدخل نص التحديث..."></textarea></div>`,
      intervention: `<div class="form-group"><label class="form-label">المشروع / المخرج *</label><input class="form-control" name="iproject" placeholder="اسم المشروع أو المخرج"></div>
        <div class="form-group"><label class="form-label">المشكلة</label><input class="form-control" name="iissue" placeholder="وصف المشكلة"></div>`,
      strategy: `<div class="form-group"><label class="form-label">اسم المشروع *</label><input class="form-control" name="pname" placeholder="اسم المشروع"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">المقاول</label><input class="form-control" name="pcontractor" placeholder="اسم المقاول"></div>
          <div class="form-group"><label class="form-label">التكلفة (ر.س)</label><input class="form-control" type="number" name="pcost" placeholder="0"></div>
        </div>
        <div class="form-group"><label class="form-label">ملاحظة</label><textarea class="form-control" name="pnote" rows="2"></textarea></div>`,
      bi: `<div class="form-group"><label class="form-label">اسم المشروع *</label><input class="form-control" name="pname" placeholder="اسم المشروع"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">المقاول</label><input class="form-control" name="pcontractor" placeholder="اسم المقاول"></div>
          <div class="form-group"><label class="form-label">التكلفة (ر.س)</label><input class="form-control" type="number" name="pcost" placeholder="0"></div>
        </div>`,
      ops: `<div class="form-row">
          <div class="form-group"><label class="form-label">المخرج *</label><input class="form-control" name="ooutput" placeholder="اسم المخرج"></div>
          <div class="form-group"><label class="form-label">المقاول</label><select class="form-control" name="ocontractor"><option>الابداع</option><option>EY</option><option>الجامعة</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">الحالة</label><select class="form-control" name="ostatus"><option>على المسار</option><option>معتمد</option><option>متأخر</option><option>لم يبدأ</option></select></div>
          <div class="form-group"><label class="form-label">الجهة</label><input class="form-control" name="oentity" placeholder="مثال: المصلحة العامة"></div>
        </div>`,
      report: `<div class="form-group"><label class="form-label">اسم التقرير *</label><input class="form-control" name="rname" placeholder="اسم التقرير"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">النوع</label><select class="form-control" name="rtype"><option>PDF</option><option>Excel</option></select></div>
          <div class="form-group"><label class="form-label">الوصف</label><input class="form-control" name="rdesc" placeholder="وصف مختصر"></div>
        </div>`,
    };
    const titles = { user:'إضافة مستخدم جديد', workplan:'إضافة مهمة', update:'إضافة تحديث', intervention:'رفع تدخل جديد', strategy:'إضافة مشروع', bi:'إضافة مشروع', ops:'إضافة مخرج جديد', report:'إنشاء تقرير' };
    openModal(titles[section] || 'إضافة', forms[section] || '<p>لا توجد حقول متاحة</p>', section);
  }

  // ============================================================
  // RENDER: NOTIFICATIONS
  // ============================================================
  function renderNotifications() {
    const notifs = [
      { type:'danger',  icon:'🚨', title:t('notif_d1_title'), body:t('notif_d1_body'), time:t('notif_d1_time'), unread:'unread-danger' },
      { type:'danger',  icon:'⏰', title:t('notif_d2_title'), body:t('notif_d2_body'), time:t('notif_d2_time'), unread:'unread-danger' },
      { type:'warning', icon:'⚠️', title:t('notif_w1_title'), body:t('notif_w1_body'), time:t('notif_w1_time'), unread:'unread-warning' },
      { type:'success', icon:'✅', title:t('notif_s1_title'), body:t('notif_s1_body'), time:t('notif_s1_time'), unread:'' },
      { type:'success', icon:'✅', title:t('notif_s2_title'), body:t('notif_s2_body'), time:t('notif_s2_time'), unread:'' },
      { type:'warning', icon:'📊', title:t('notif_w2_title'), body:t('notif_w2_body'), time:t('notif_w2_time'), unread:'' },
    ];

    const html = notifs.map(n => `
      <div class="notif-item ${n.unread}">
        <div class="notif-icon ${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'green'}">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-body">${n.body}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        <span class="badge ${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'success'}">${n.type==='danger'?t('badge_urgent'):n.type==='warning'?t('badge_alert'):t('badge_info_lbl')}</span>
      </div>
    `).join('');

    _el('notifList').innerHTML = html;
    _el('notifBadge').textContent = '3';
  }

  function markAllRead() {
    _el('notifBadge').textContent = '0';
    document.querySelectorAll('.notif-item').forEach(n => {
      n.classList.remove('unread','unread-danger','unread-warning');
    });
    toast(state.lang==='ar'?'تم تحديد جميع الإشعارات كمقروءة':'All notifications marked as read','success');
  }

  // ============================================================
  // RENDER: PERFORMANCE
  // ============================================================
  function renderPerformance() {
    const totalCost = STATS.grandTotal.cost;
    const stratSpent = STATS.strategy.totalCost - STATS.strategy.totalRemaining;
    const biSpent = STATS.bi.totalCost - STATS.bi.totalRemaining;

    const html = `
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="kpi-card green">
          <div class="kpi-icon green">🏛️</div>
          <div class="kpi-value">${STATS.grandTotal.projects}</div>
          <div class="kpi-label">${t('kpi_total_projects2')}</div>
        </div>
        <div class="kpi-card turquoise">
          <div class="kpi-icon turquoise">📋</div>
          <div class="kpi-value">${STATS.grandTotal.deliverables}</div>
          <div class="kpi-label">${t('kpi_total_deliverables')}</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-icon warning">💰</div>
          <div class="kpi-value">${(totalCost/1000000).toFixed(1)}م</div>
          <div class="kpi-label">${t('kpi_total_cost')}</div>
        </div>
        <div class="kpi-card danger">
          <div class="kpi-icon danger">🚨</div>
          <div class="kpi-value">${STATS.strategy.stalled + STATS.ops.delayed}</div>
          <div class="kpi-label">${t('kpi_intervention')}</div>
        </div>
      </div>

      <div class="charts-row three-col" style="margin-bottom:20px">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">وكالة التخطيط الاستراتيجي</div>
              <div class="chart-card-subtitle">${t('kpi_avg_completion')}: ${STATS.strategy.avgCompletion}%</div>
            </div>
            <div class="perf-ring" id="ringStrategy">
              <svg viewBox="0 0 80 80"><circle class="perf-ring-bg" cx="40" cy="40" r="33"/><circle class="perf-ring-fill" cx="40" cy="40" r="33" stroke="#00833E" stroke-dasharray="${2*Math.PI*33}" stroke-dashoffset="${2*Math.PI*33*(1-STATS.strategy.avgCompletion/100)}"/></svg>
              <div class="perf-ring-center">${STATS.strategy.avgCompletion}%<div class="perf-ring-lbl">${t('ring_done')}</div></div>
            </div>
          </div>
          <div class="chart-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.78rem">
              <div>${t('stat_completed')} <strong style="color:var(--success)">${STATS.strategy.complete}</strong></div>
              <div>${t('stat_stalled')} <strong style="color:var(--danger)">${STATS.strategy.stalled}</strong></div>
              <div>${t('stat_in_prog')} <strong style="color:var(--warning)">${STATS.strategy.inProgress}</strong></div>
              <div>${t('stat_total')} <strong>${STATS.strategy.total}</strong></div>
            </div>
            <div style="margin-top:12px;font-size:0.72rem;color:var(--text-muted)">${t('footer_total_cost')} ${fmtSAR(STATS.strategy.totalCost)}</div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">مركز ذكاء الأعمال</div>
              <div class="chart-card-subtitle">${t('kpi_avg_completion')}: ${STATS.bi.avgCompletion}%</div>
            </div>
            <div class="perf-ring">
              <svg viewBox="0 0 80 80"><circle class="perf-ring-bg" cx="40" cy="40" r="33"/><circle class="perf-ring-fill" cx="40" cy="40" r="33" stroke="#F59E0B" stroke-dasharray="${2*Math.PI*33}" stroke-dashoffset="${2*Math.PI*33*(1-STATS.bi.avgCompletion/100)}"/></svg>
              <div class="perf-ring-center">${STATS.bi.avgCompletion}%<div class="perf-ring-lbl">${t('ring_done')}</div></div>
            </div>
          </div>
          <div class="chart-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.78rem">
              <div>${t('stat_complete2')} <strong style="color:var(--success)">${STATS.bi.complete}</strong></div>
              <div>${t('stat_not_started')} <strong style="color:var(--danger)">${STATS.bi.notStarted}</strong></div>
              <div>${t('stat_in_prog')} <strong style="color:var(--warning)">${STATS.bi.inProgress}</strong></div>
              <div>${t('stat_total')} <strong>${STATS.bi.total}</strong></div>
            </div>
            <div style="margin-top:12px;font-size:0.72rem;color:var(--text-muted)">${t('footer_total_cost')} ${fmtSAR(STATS.bi.totalCost)}</div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">مركز الأداء التشغيلي</div>
              <div class="chart-card-subtitle">${t('pg_ops_sub')}</div>
            </div>
            <div class="perf-ring">
              <svg viewBox="0 0 80 80"><circle class="perf-ring-bg" cx="40" cy="40" r="33"/><circle class="perf-ring-fill" cx="40" cy="40" r="33" stroke="#22C55E" stroke-dasharray="${2*Math.PI*33}" stroke-dashoffset="${2*Math.PI*33*(1-STATS.ops.complete/STATS.ops.total)}"/></svg>
              <div class="perf-ring-center">${Math.round(STATS.ops.complete/STATS.ops.total*100)}%<div class="perf-ring-lbl">${t('ring_complete')}</div></div>
            </div>
          </div>
          <div class="chart-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.78rem">
              <div>${t('stat_completed2')} <strong style="color:var(--success)">${STATS.ops.complete}</strong></div>
              <div>${t('stat_delayed')} <strong style="color:var(--danger)">${STATS.ops.delayed}</strong></div>
              <div>${t('stat_on_track')} <strong style="color:var(--warning)">${STATS.ops.onTrack}</strong></div>
              <div>${t('stat_total')} <strong>${STATS.ops.total}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">مقارنة الأداء بين الوحدات</div></div>
        <div class="card-body">
          <div class="chart-container"><canvas id="perfCompChart"></canvas></div>
        </div>
      </div>
    `;

    const perfFilterBar = _buildFilterBar({ showPeriod:true, showEntity:true, showStatus:false, showKpiType:false, showSearch:false });
    _el('performanceContent').innerHTML = perfFilterBar + html;

    setTimeout(() => {
      destroyChart('perfComp');
      const c = getChartColors();
      const ctx2 = document.getElementById('perfCompChart').getContext('2d');
      state.charts['perfComp'] = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: [t('lbl_strategy'), t('lbl_bi'), t('lbl_ops')],
          datasets: [
            { label: t('lbl_avg_comp'), data: [STATS.strategy.avgCompletion, STATS.bi.avgCompletion, Math.round(STATS.ops.complete/STATS.ops.total*100)], backgroundColor: [c.green, c.warning, c.turquoise], borderRadius: 6 }
          ]
        },
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{max:100, grid:{color:c.gridColor}, ticks:{color:c.textColor, callback:v=>v+'%'}}, x:{grid:{display:false}, ticks:{color:c.textColor}} } }
      });
    }, 100);
  }

  // ============================================================
  // RENDER: WORK PLAN
  // ============================================================
  function renderWorkplan() {
    const priorityColor = { 'عالي':'danger', 'متوسط':'warning', 'منخفض':'info', 'High':'danger', 'Medium':'warning', 'Low':'info' };
    const statusColor = { 'معلق':'warning', 'مجدول':'info', 'قيد التنفيذ':'warning', 'مكتمل':'success', 'Pending':'warning', 'Scheduled':'info', 'In Progress':'warning', 'Completed':'success' };

    const rows = state.workplanItems.map(item => `
      <tr>
        <td class="td-name">${item.task}</td>
        <td>${item.due || '-'}</td>
        <td>${badge(item.priority, priorityColor[item.priority] || 'info')}</td>
        <td>${badge(item.status, statusColor[item.status] || 'info')}</td>
        <td>${item.owner || '-'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.deleteItem('workplan',${item.id})">🗑️</button>
        </td>
      </tr>
    `).join('');

    _el('workplanContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-toolbar">
          <span class="table-title">${t('tbl_tasks')}</span>
          <span class="table-count">${state.workplanItems.length} ${t('tbl_unit')}</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>${t('th_task')}</th><th>${t('th_due')}</th><th>${t('th_priority')}</th><th>${t('th_status')}</th><th>${t('th_owner')}</th><th>${t('th_action')}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ============================================================
  // RENDER: OVERVIEW (Executive Dashboard)
  // ============================================================
  function renderOverview() {
    const totalCost = STATS.grandTotal.cost;
    const html = `
      <div class="hero-section">
        <div class="hero-tag">${t('hero_tag')}</div>
        <div class="hero-title">${t('hero_title')}</div>
        <div class="hero-subtitle">${t('header_sub')} · ${new Date().toLocaleDateString('ar-SA')}</div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-value">${STATS.grandTotal.projects}</div>
            <div class="hero-stat-label">${t('hero_projects')}</div>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">${(totalCost/1000000).toFixed(0)}م</div>
            <div class="hero-stat-label">${t('hero_cost')}</div>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">${STATS.grandTotal.deliverables}</div>
            <div class="hero-stat-label">${t('hero_deliverables')}</div>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">${STATS.strategy.stalled + STATS.ops.delayed}</div>
            <div class="hero-stat-label">${t('hero_needs_action')}</div>
          </div>
        </div>
      </div>

      <div class="agency-cards">
        <div class="agency-card" onclick="App.navigate('strategy')">
          <div class="agency-card-icon">🎯</div>
          <div class="agency-card-name">${t('agency_strategy')}</div>
          <div class="agency-card-stats">
            <div class="agency-mini-stat"><div class="agency-mini-val">${STATS.strategy.total}</div><div class="agency-mini-lbl">${t('lbl_project')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--success)">${STATS.strategy.avgCompletion}%</div><div class="agency-mini-lbl">${t('lbl_avg_comp2')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--danger)">${STATS.strategy.stalled}</div><div class="agency-mini-lbl">${t('lbl_stalled2')}</div></div>
          </div>
        </div>
        <div class="agency-card" onclick="App.navigate('bi')">
          <div class="agency-card-icon" style="background:linear-gradient(135deg,#1FA89C,#3B82F6)">💡</div>
          <div class="agency-card-name">${t('agency_bi')}</div>
          <div class="agency-card-stats">
            <div class="agency-mini-stat"><div class="agency-mini-val">${STATS.bi.total}</div><div class="agency-mini-lbl">${t('lbl_project')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--warning)">${STATS.bi.avgCompletion}%</div><div class="agency-mini-lbl">${t('lbl_avg_comp2')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--danger)">${STATS.bi.notStarted}</div><div class="agency-mini-lbl">${t('lbl_not_started2')}</div></div>
          </div>
        </div>
        <div class="agency-card" onclick="App.navigate('ops')">
          <div class="agency-card-icon" style="background:linear-gradient(135deg,#F59E0B,#EF4444)">⚙️</div>
          <div class="agency-card-name">${t('agency_ops')}</div>
          <div class="agency-card-stats">
            <div class="agency-mini-stat"><div class="agency-mini-val">${STATS.ops.total}</div><div class="agency-mini-lbl">${t('lbl_output')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--success)">${STATS.ops.complete}</div><div class="agency-mini-lbl">${t('lbl_complete2')}</div></div>
            <div class="agency-mini-stat"><div class="agency-mini-val" style="color:var(--danger)">${STATS.ops.delayed}</div><div class="agency-mini-lbl">${t('lbl_delayed2')}</div></div>
          </div>
        </div>
      </div>

      <div class="kpi-grid" style="grid-template-columns:repeat(6,1fr);margin-bottom:20px">
        <div class="kpi-card green"><div class="kpi-icon green">✅</div><div class="kpi-value">${STATS.strategy.complete}</div><div class="kpi-label">${t('kpi_completed_planning')}</div></div>
        <div class="kpi-card warning"><div class="kpi-icon warning">🔄</div><div class="kpi-value">${STATS.strategy.inProgress}</div><div class="kpi-label">${t('kpi_in_prog_planning')}</div></div>
        <div class="kpi-card danger"><div class="kpi-icon danger">🚫</div><div class="kpi-value">${STATS.strategy.stalled}</div><div class="kpi-label">${t('kpi_stalled_planning')}</div></div>
        <div class="kpi-card success"><div class="kpi-icon green">📦</div><div class="kpi-value">${STATS.ops.complete}</div><div class="kpi-label">${t('kpi_del_completed2')}</div></div>
        <div class="kpi-card info"><div class="kpi-icon info">📊</div><div class="kpi-value">${STATS.ops.onTrack}</div><div class="kpi-label">${t('kpi_on_track')}</div></div>
        <div class="kpi-card danger"><div class="kpi-icon danger">⚠️</div><div class="kpi-value">${STATS.ops.delayed}</div><div class="kpi-label">${t('kpi_delayed2')}</div></div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_cost_dist')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="overviewCostChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_ops_status')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="overviewOpsChart"></canvas></div></div>
        </div>
      </div>

      <div class="insight-row" style="margin-top:20px">
        <div class="insight-card"><span class="insight-icon">🏆</span><div><div class="insight-title">${t('ins_top_perf')}</div><div class="insight-body">${t('ins_top_body')} تتصدر الأداء</div></div></div>
        <div class="insight-card"><span class="insight-icon">⚠️</span><div><div class="insight-title">${t('ins_follow_up')}</div><div class="insight-body">${t('ins_follow_body')} رغم التعاقد</div></div></div>
        <div class="insight-card"><span class="insight-icon">🚨</span><div><div class="insight-title">${t('ins_urgent')}</div><div class="insight-body">${t('ins_urgent_body')} (100% من مخرجاتها)</div></div></div>
        <div class="insight-card"><span class="insight-icon">💰</span><div><div class="insight-title">${t('ins_total_spent')}</div><div class="insight-body">${fmtSAR(STATS.strategy.totalCost - STATS.strategy.totalRemaining + (STATS.bi.totalCost - STATS.bi.totalRemaining))} مُنفق من الميزانية الكلية</div></div></div>
      </div>
    `;
    const ovrFilterBar = _buildFilterBar({ showPeriod:true, showEntity:true, showStatus:false, showKpiType:false, showSearch:false });
    _el('overviewContent').innerHTML = ovrFilterBar + html;

    setTimeout(() => {
      destroyChart('overviewCost');
      destroyChart('overviewOps');
      const c = getChartColors();
      const ctx1 = document.getElementById('overviewCostChart')?.getContext('2d');
      if (ctx1) {
        state.charts['overviewCost'] = new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: [t('lbl_strategy').substring(0,18), t('lbl_bi')],
            datasets: [{ data: [STATS.strategy.totalCost, STATS.bi.totalCost], backgroundColor: [c.green, c.turquoise], borderWidth: 2 }]
          },
          options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor, font:{size:12} } } } }
        });
      }
      const ctx2 = document.getElementById('overviewOpsChart')?.getContext('2d');
      if (ctx2) {
        state.charts['overviewOps'] = new Chart(ctx2, {
          type: 'pie',
          data: {
            labels: [t('lbl_complete'), t('lbl_on_track'), t('lbl_delayed')],
            datasets: [{ data: [STATS.ops.complete, STATS.ops.onTrack, STATS.ops.delayed], backgroundColor: [c.success, c.warning, c.danger], borderWidth: 2 }]
          },
          options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor, font:{size:12} } } } }
        });
      }
    }, 100);
  }

  // ============================================================
  // RENDER: STRATEGY
  // ============================================================
  function renderStrategy() {
    const filter = state.filters.strategy;
    let data = [...DATA_STRATEGY];
    if (filter !== 'all') data = data.filter(p => getStatusColor(p.status) === filter || p.status === filter);
    data = _applyStatusFilter(data, 'status');
    data = _applySearch(data, ['name','contractor','manager','category','status']);

    const kpiHtml = `
      <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr)">
        <div class="kpi-card green"><div class="kpi-icon green">📁</div><div class="kpi-value">${STATS.strategy.total}</div><div class="kpi-label">${t('kpi_total_projects')}</div></div>
        <div class="kpi-card turquoise"><div class="kpi-icon turquoise">💰</div><div class="kpi-value">${(STATS.strategy.totalCost/1000000).toFixed(1)}م</div><div class="kpi-label">${t('kpi_total_cost')}</div></div>
        <div class="kpi-card success"><div class="kpi-icon green">✅</div><div class="kpi-value">${STATS.strategy.avgCompletion}%</div><div class="kpi-label">${t('kpi_avg_completion')}</div></div>
        <div class="kpi-card warning"><div class="kpi-icon warning">🔄</div><div class="kpi-value">${STATS.strategy.complete}</div><div class="kpi-label">${t('kpi_completed')}</div></div>
        <div class="kpi-card danger"><div class="kpi-icon danger">🚫</div><div class="kpi-value">${STATS.strategy.stalled}</div><div class="kpi-label">${t('kpi_stalled')}</div></div>
      </div>
    `;

    const chartsHtml = `
      <div class="charts-row three-col" style="margin-bottom:20px">
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_comp_proj')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="stratCompChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_status_dist')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="stratStatusChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_cost_vs_rem')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="stratCostChart"></canvas></div></div>
        </div>
      </div>
    `;

    const filterHtml = `
      <div class="filter-row">
        <span class="filter-label">${t('filter_by_status')}</span>
        <span class="filter-pill ${filter==='all'?'active':''}" onclick="App.setFilter('strategy','all')">${t('filter_all')} (${STATS.strategy.total})</span>
        <span class="filter-pill ${filter==='success'?'active':''}" onclick="App.setFilter('strategy','success')">${t('filter_completed')} (${STATS.strategy.complete})</span>
        <span class="filter-pill ${filter==='warning'?'active':''}" onclick="App.setFilter('strategy','warning')">${t('filter_in_prog')} (${STATS.strategy.inProgress})</span>
        <span class="filter-pill ${filter==='danger'?'active-danger':''}" onclick="App.setFilter('strategy','danger')">${t('filter_stalled')} (${STATS.strategy.stalled})</span>
      </div>
    `;

    const rows = data.map(p => `
      <tr>
        <td class="td-index">${p.id}</td>
        <td class="td-name">${p.name}</td>
        <td><span class="badge info">${p.category}</span></td>
        <td class="td-cost">${fmt(p.cost)}</td>
        <td class="td-cost" style="color:var(--warning)">${fmt(p.remaining)}</td>
        <td>${progressBar(p.completion)}</td>
        <td>${badge(p.status, getStatusColor(p.status))}</td>
        <td style="font-size:0.75rem;color:var(--text-muted)">${p.contractor}</td>
        <td style="font-size:0.75rem">${p.manager}</td>
        <td style="font-size:0.72rem;white-space:nowrap">${p.startDate||'-'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.showProjectDetail('strategy',${p.id})">👁️</button>
        </td>
      </tr>
    `).join('');

    const tableHtml = `
      <div class="table-wrapper">
        <div class="table-toolbar">
          <span class="table-title">${t('tbl_strategy')}</span>
          <span class="table-count">${data.length} ${t('tbl_project_unit')}</span>
          <div class="table-search"><input type="text" placeholder="${t('search_ph')}" oninput="App.searchTable(this,'strategyTbody')"><span class="search-icon">🔍</span></div>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>${t('th_num')}</th><th>${t('th_project')}</th><th>${t('th_type')}</th><th>${t('th_cost')}</th><th>${t('th_remaining')}</th><th>${t('th_completion')}</th><th>${t('th_status')}</th><th>${t('th_contractor')}</th><th>${t('th_pm')}</th><th>${t('th_start')}</th><th>${t('th_details')}</th></tr></thead>
            <tbody id="strategyTbody">${rows}</tbody>
          </table>
        </div>
        <div style="padding:10px 18px;font-size:0.72rem;color:var(--text-muted);border-top:1px solid var(--border-light)">
          ${t('footer_total_cost')} <strong>${fmtSAR(STATS.strategy.totalCost)}</strong> &nbsp;|&nbsp; ${t('footer_remaining')} <strong>${fmtSAR(STATS.strategy.totalRemaining)}</strong>
        </div>
      </div>
    `;

    const advFilterHtml = _buildFilterBar({ showStatus:true, showKpiType:true, showSearch:true, showPeriod:true, showEntity:false, showAdd:true, addSection:'strategy', addLabel: state.lang==='en'?'Add Project':'إضافة مشروع' });
    _el('strategyContent').innerHTML = kpiHtml + chartsHtml + advFilterHtml + filterHtml + tableHtml;

    setTimeout(() => {
      const c = getChartColors();
      destroyChart('stratComp'); destroyChart('stratStatus'); destroyChart('stratCost');

      // Completion bar chart
      const labels = DATA_STRATEGY.map(p => p.name.substring(0,22)+'...');
      const comps = DATA_STRATEGY.map(p => p.completion);
      const colors = comps.map(v => v===100 ? c.success : v===0 ? c.danger : c.warning);
      const ctx1 = document.getElementById('stratCompChart')?.getContext('2d');
      if (ctx1) state.charts['stratComp'] = new Chart(ctx1, {
        type:'bar',
        data:{ labels, datasets:[{ label:t('lbl_completion'), data:comps, backgroundColor:colors, borderRadius:4 }] },
        options:{ indexAxis:'y', responsive:true, plugins:{legend:{display:false}}, scales:{ x:{max:100, ticks:{color:c.textColor,callback:v=>v+'%'}, grid:{color:c.gridColor}}, y:{ticks:{color:c.textColor,font:{size:10}}, grid:{display:false}} } }
      });

      // Status pie
      const complete = DATA_STRATEGY.filter(p=>['مكتمل','انتهى','جاري الإغلاق'].includes(p.status)||p.completion===100).length;
      const stalled = DATA_STRATEGY.filter(p=>p.status==='متعثر').length;
      const inprog = DATA_STRATEGY.length - complete - stalled;
      const ctx2 = document.getElementById('stratStatusChart')?.getContext('2d');
      if (ctx2) state.charts['stratStatus'] = new Chart(ctx2, {
        type:'doughnut',
        data:{ labels:[t('lbl_closing'),t('lbl_in_prog'),t('lbl_stalled')], datasets:[{ data:[complete,inprog,stalled], backgroundColor:[c.success,c.warning,c.danger], borderWidth:2 }] },
        options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor, font:{size:11} } } } }
      });

      // Cost vs remaining
      const costLabels = DATA_STRATEGY.map(p=>p.name.substring(0,14)+'...');
      const ctx3 = document.getElementById('stratCostChart')?.getContext('2d');
      if (ctx3) state.charts['stratCost'] = new Chart(ctx3, {
        type:'bar',
        data:{
          labels: costLabels,
          datasets:[
            { label:t('lbl_cost'), data: DATA_STRATEGY.map(p=>+(p.cost/1000000).toFixed(2)), backgroundColor: c.green+'99', borderRadius:3 },
            { label:t('lbl_remaining'), data: DATA_STRATEGY.map(p=>+(p.remaining/1000000).toFixed(2)), backgroundColor: c.warning+'99', borderRadius:3 }
          ]
        },
        options:{ responsive:true, plugins:{legend:{labels:{color:c.textColor,font:{size:11}}}}, scales:{ x:{stacked:false,ticks:{color:c.textColor,font:{size:9}},grid:{display:false}}, y:{ticks:{color:c.textColor,callback:v=>v+'م'},grid:{color:c.gridColor}} } }
      });
    }, 100);
  }

  // ============================================================
  // RENDER: BI (مركز ذكاء الأعمال)
  // ============================================================
  function renderBI() {
    const filter = state.filters.bi;
    let data = [...DATA_BI];
    if (filter !== 'all') data = data.filter(p => p.completion === parseInt(filter) || getStatusColor(p.status) === filter);
    data = _applyStatusFilter(data, 'status');
    data = _applySearch(data, ['name','contractor','manager','category','status']);

    const kpiHtml = `
      <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr)">
        <div class="kpi-card green"><div class="kpi-icon green">📁</div><div class="kpi-value">${STATS.bi.total}</div><div class="kpi-label">${t('kpi_total_projects')}</div></div>
        <div class="kpi-card turquoise"><div class="kpi-icon turquoise">💰</div><div class="kpi-value">${(STATS.bi.totalCost/1000000).toFixed(1)}م</div><div class="kpi-label">${t('kpi_total_cost')}</div></div>
        <div class="kpi-card warning"><div class="kpi-icon warning">📊</div><div class="kpi-value">${STATS.bi.avgCompletion}%</div><div class="kpi-label">${t('kpi_avg_completion')}</div></div>
        <div class="kpi-card info"><div class="kpi-icon info">🔄</div><div class="kpi-value">${STATS.bi.inProgress}</div><div class="kpi-label">${t('kpi_in_progress')}</div></div>
        <div class="kpi-card danger"><div class="kpi-icon danger">⭕</div><div class="kpi-value">${STATS.bi.notStarted}</div><div class="kpi-label">${t('kpi_not_started')}</div></div>
      </div>
    `;

    const chartsHtml = `
      <div class="charts-row three-col" style="margin-bottom:20px">
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_comp_proj')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="biCompChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_status_dist')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="biStatusChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_cost_per_proj')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="biCostChart"></canvas></div></div>
        </div>
      </div>
    `;

    const filterHtml = `
      <div class="filter-row">
        <span class="filter-label">${t('filter_by_status')}</span>
        <span class="filter-pill ${filter==='all'?'active':''}" onclick="App.setFilter('bi','all')">${t('filter_all')} (${STATS.bi.total})</span>
        <span class="filter-pill ${filter==='warning'?'active':''}" onclick="App.setFilter('bi','warning')">${t('filter_in_prog')} (${STATS.bi.inProgress})</span>
        <span class="filter-pill ${filter==='0'?'active-danger':''}" onclick="App.setFilter('bi','0')">${t('filter_not_start')} (${STATS.bi.notStarted})</span>
      </div>
    `;

    const rows = data.map(p => `
      <tr>
        <td class="td-index">${p.id}</td>
        <td class="td-name">${p.name}</td>
        <td><span class="badge info">${p.category}</span></td>
        <td class="td-cost">${fmt(p.cost)}</td>
        <td class="td-cost" style="color:var(--warning)">${fmt(p.remaining)}</td>
        <td>${progressBar(p.completion)}</td>
        <td>${badge(p.status, getStatusColor(p.status))}</td>
        <td style="font-size:0.75rem;color:var(--text-muted)">${p.contractor}</td>
        <td style="font-size:0.75rem">${p.manager}</td>
        <td style="font-size:0.72rem;white-space:nowrap">${p.endDate||'-'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.showProjectDetail('bi',${p.id})">👁️</button>
        </td>
      </tr>
    `).join('');

    const tableHtml = `
      <div class="table-wrapper">
        <div class="table-toolbar">
          <span class="table-title">${t('tbl_bi')}</span>
          <span class="table-count">${data.length} ${t('tbl_project_unit')}</span>
          <div class="table-search"><input type="text" placeholder="${t('search_ph')}" oninput="App.searchTable(this,'biTbody')"><span class="search-icon">🔍</span></div>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>${t('th_num')}</th><th>${t('th_project')}</th><th>${t('th_type')}</th><th>${t('th_cost')}</th><th>${t('th_remaining')}</th><th>${t('th_completion')}</th><th>${t('th_status')}</th><th>${t('th_contractor')}</th><th>${t('th_pm')}</th><th>${t('th_end')}</th><th>${t('th_details')}</th></tr></thead>
            <tbody id="biTbody">${rows}</tbody>
          </table>
        </div>
        <div style="padding:10px 18px;font-size:0.72rem;color:var(--text-muted);border-top:1px solid var(--border-light)">
          ${t('footer_total_cost')} <strong>${fmtSAR(STATS.bi.totalCost)}</strong> &nbsp;|&nbsp; ${t('footer_remaining')} <strong>${fmtSAR(STATS.bi.totalRemaining)}</strong>
        </div>
      </div>
    `;

    const advFilterHtml = _buildFilterBar({ showStatus:true, showKpiType:true, showSearch:true, showPeriod:true, showEntity:false, showAdd:true, addSection:'bi', addLabel: state.lang==='en'?'Add Project':'إضافة مشروع' });
    _el('biContent').innerHTML = kpiHtml + chartsHtml + advFilterHtml + filterHtml + tableHtml;

    setTimeout(() => {
      const c = getChartColors();
      destroyChart('biComp'); destroyChart('biStatus'); destroyChart('biCost');

      const labels = DATA_BI.map(p=>p.name.substring(0,20)+'...');
      const comps = DATA_BI.map(p=>p.completion);
      const colors = comps.map(v => v===0 ? c.danger : v >= 25 ? c.warning : c.info);
      const ctx1 = document.getElementById('biCompChart')?.getContext('2d');
      if (ctx1) state.charts['biComp'] = new Chart(ctx1, {
        type:'bar',
        data:{ labels, datasets:[{ label:t('lbl_completion'), data:comps, backgroundColor:colors, borderRadius:4 }] },
        options:{ indexAxis:'y', responsive:true, plugins:{legend:{display:false}}, scales:{ x:{max:100,ticks:{color:c.textColor,callback:v=>v+'%'},grid:{color:c.gridColor}}, y:{ticks:{color:c.textColor,font:{size:9.5}},grid:{display:false}} } }
      });

      const ctx2 = document.getElementById('biStatusChart')?.getContext('2d');
      if (ctx2) state.charts['biStatus'] = new Chart(ctx2, {
        type:'doughnut',
        data:{ labels:[t('lbl_in_prog'),t('lbl_not_started'),t('lbl_complete')], datasets:[{ data:[STATS.bi.inProgress,STATS.bi.notStarted,STATS.bi.complete], backgroundColor:[c.warning,c.danger,c.success], borderWidth:2 }] },
        options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor,font:{size:11} } } } }
      });

      const ctx3 = document.getElementById('biCostChart')?.getContext('2d');
      if (ctx3) state.charts['biCost'] = new Chart(ctx3, {
        type:'pie',
        data:{ labels: DATA_BI.map(p=>p.name.substring(0,18)+'...'), datasets:[{ data: DATA_BI.map(p=>+(p.cost/1000000).toFixed(2)), backgroundColor:[c.green,c.turquoise,c.info,c.purple,c.warning,c.success,c.danger,'#EC4899'], borderWidth:2 }] },
        options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor,font:{size:9.5} } } } }
      });
    }, 100);
  }

  // ============================================================
  // RENDER: OPS (مركز الأداء التشغيلي)
  // ============================================================
  function renderOps() {
    const contractorFilter = state.filters.opsContractor;
    const statusFilter = state.filters.ops;
    let data = [...DATA_OPS];
    if (contractorFilter !== 'all') data = data.filter(p=>p.contractor===contractorFilter);
    if (statusFilter !== 'all') data = data.filter(p=>getStatusColor(p.status)===statusFilter || p.status===statusFilter);
    data = _applyStatusFilter(data, 'status');
    data = _applySearch(data, ['output','contractor','entity','status','docStatus']);

    const ibdaCount = STATS.ops.byContractor.ibda3;
    const eyCount = STATS.ops.byContractor.ey;
    const univCount = STATS.ops.byContractor.university;

    const kpiHtml = `
      <div class="kpi-grid" style="grid-template-columns:repeat(6,1fr)">
        <div class="kpi-card green"><div class="kpi-icon green">📋</div><div class="kpi-value">${STATS.ops.total}</div><div class="kpi-label">${t('kpi_total_deliverables2')}</div></div>
        <div class="kpi-card success"><div class="kpi-icon green">✅</div><div class="kpi-value">${STATS.ops.complete}</div><div class="kpi-label">${t('kpi_del_complete')}</div></div>
        <div class="kpi-card warning"><div class="kpi-icon warning">🔄</div><div class="kpi-value">${STATS.ops.onTrack}</div><div class="kpi-label">${t('kpi_on_track')}</div></div>
        <div class="kpi-card danger"><div class="kpi-icon danger">⏰</div><div class="kpi-value">${STATS.ops.delayed}</div><div class="kpi-label">${t('kpi_delayed')}</div></div>
        <div class="kpi-card info"><div class="kpi-icon info">🏢</div><div class="kpi-value">${ibdaCount}</div><div class="kpi-label">${t('kpi_ibda_del')}</div></div>
        <div class="kpi-card purple"><div class="kpi-icon purple">📊</div><div class="kpi-value">${eyCount}</div><div class="kpi-label">${t('kpi_ey_del')}</div></div>
      </div>
    `;

    const chartsHtml = `
      <div class="charts-row" style="margin-bottom:20px">
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_by_contractor')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="opsContractorChart"></canvas></div></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header"><div class="chart-card-title">${t('chart_del_status')}</div></div>
          <div class="chart-card-body"><div class="chart-container"><canvas id="opsStatusChart"></canvas></div></div>
        </div>
      </div>
    `;

    const filterHtml = `
      <div class="filter-row">
        <span class="filter-label">${t('filter_contractor')}</span>
        <span class="filter-pill ${contractorFilter==='all'?'active':''}" onclick="App.setOpsContractorFilter('all')">${t('filter_all')}</span>
        <span class="filter-pill ${contractorFilter==='شركة الابداع'?'active':''}" onclick="App.setOpsContractorFilter('شركة الابداع')">شركة الابداع (${ibdaCount})</span>
        <span class="filter-pill ${contractorFilter==='شركة EY'?'active':''}" onclick="App.setOpsContractorFilter('شركة EY')">شركة EY (${eyCount})</span>
        <span class="filter-pill ${contractorFilter==='الجامعة'?'active-danger':''}" onclick="App.setOpsContractorFilter('الجامعة')">الجامعة (${univCount})</span>
      </div>
      <div class="filter-row">
        <span class="filter-label">${t('filter_status')}</span>
        <span class="filter-pill ${statusFilter==='all'?'active':''}" onclick="App.setFilter('ops','all')">${t('filter_all')}</span>
        <span class="filter-pill ${statusFilter==='success'?'active':''}" onclick="App.setFilter('ops','success')">${t('filter_completed')} (${STATS.ops.complete})</span>
        <span class="filter-pill ${statusFilter==='warning'?'active':''}" onclick="App.setFilter('ops','warning')">${t('kpi_on_track')} (${STATS.ops.onTrack})</span>
        <span class="filter-pill ${statusFilter==='danger'?'active-danger':''}" onclick="App.setFilter('ops','danger')">${t('lbl_delayed')} (${STATS.ops.delayed})</span>
      </div>
    `;

    const rows = data.map(p => `
      <tr>
        <td class="td-index">${p.id}</td>
        <td style="font-size:0.75rem;white-space:nowrap;color:var(--text-secondary)">${p.contractor}</td>
        <td class="td-name" style="max-width:320px">${p.output}</td>
        <td>${badge(p.status, getStatusColor(p.status))}</td>
        <td>${p.docStatus ? badge(p.docStatus, p.docStatus==='معتمد'?'success':p.docStatus==='تحت المراجعة'?'warning':'info') : '-'}</td>
        <td style="font-size:0.72rem;white-space:nowrap">${p.dueDate||'-'}</td>
        <td style="font-size:0.72rem;white-space:nowrap">${p.deliveryDate||'-'}</td>
        <td style="font-size:0.72rem">${p.entity||'-'}</td>
      </tr>
    `).join('');

    const tableHtml = `
      <div class="table-wrapper">
        <div class="table-toolbar">
          <span class="table-title">${t('tbl_ops')}</span>
          <span class="table-count">${data.length} ${t('tbl_output_unit')}</span>
          <div class="table-search"><input type="text" placeholder="${t('search_ph2')}" oninput="App.searchTable(this,'opsTbody')"><span class="search-icon">🔍</span></div>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>${t('th_num')}</th><th>${t('th_contractor')}</th><th>${t('th_output')}</th><th>${t('th_status')}</th><th>${t('th_doc_status')}</th><th>${t('th_due')}</th><th>${t('th_delivery')}</th><th>${t('th_entity')}</th></tr></thead>
            <tbody id="opsTbody">${rows}</tbody>
          </table>
        </div>
        <div style="padding:10px 18px;font-size:0.72rem;color:var(--text-muted);border-top:1px solid var(--border-light)">
          تنبيه: جميع المخرجات الـ ${univCount} للجامعة في حالة "متأخر" — يُوصى بمراجعة تعاقدية عاجلة
        </div>
      </div>
    `;

    const advFilterHtml = _buildFilterBar({ showStatus:true, showSearch:true, showPeriod:true, showEntity:false, showKpiType:false, showAdd:true, addSection:'ops', addLabel: state.lang==='en'?'Add Deliverable':'إضافة مخرج' });
    _el('opsContent').innerHTML = kpiHtml + chartsHtml + advFilterHtml + filterHtml + tableHtml;

    setTimeout(() => {
      const c = getChartColors();
      destroyChart('opsContractor'); destroyChart('opsStatus');

      // Contractor breakdown grouped bar
      const ibdaComplete = DATA_OPS.filter(p=>p.contractor==='شركة الابداع'&&['مكتمل','معتمد'].includes(p.status)).length;
      const ibdaOnTrack = DATA_OPS.filter(p=>p.contractor==='شركة الابداع'&&p.status==='على المسار').length;
      const ibdaDelayed = DATA_OPS.filter(p=>p.contractor==='شركة الابداع'&&p.status==='متأخر').length;
      const eyComplete = DATA_OPS.filter(p=>p.contractor==='شركة EY'&&['مكتمل','معتمد'].includes(p.status)).length;
      const eyOnTrack = DATA_OPS.filter(p=>p.contractor==='شركة EY'&&p.status==='على المسار').length;
      const eyDelayed = DATA_OPS.filter(p=>p.contractor==='شركة EY'&&p.status==='متأخر').length;
      const univDelayed = DATA_OPS.filter(p=>p.contractor==='الجامعة'&&p.status==='متأخر').length;

      const ctx1 = document.getElementById('opsContractorChart')?.getContext('2d');
      if (ctx1) state.charts['opsContractor'] = new Chart(ctx1, {
        type:'bar',
        data:{
          labels:['Ibdaa','EY','University'],
          datasets:[
            { label:t('lbl_complete'), data:[ibdaComplete, eyComplete, 0], backgroundColor:c.success, borderRadius:4 },
            { label:t('lbl_on_track'), data:[ibdaOnTrack, eyOnTrack, 0], backgroundColor:c.warning, borderRadius:4 },
            { label:t('lbl_delayed'), data:[ibdaDelayed, eyDelayed, univDelayed], backgroundColor:c.danger, borderRadius:4 },
          ]
        },
        options:{ responsive:true, plugins:{legend:{labels:{color:c.textColor}}}, scales:{ x:{stacked:false,ticks:{color:c.textColor},grid:{display:false}}, y:{stacked:false,ticks:{color:c.textColor},grid:{color:c.gridColor}} } }
      });

      const ctx2 = document.getElementById('opsStatusChart')?.getContext('2d');
      if (ctx2) state.charts['opsStatus'] = new Chart(ctx2, {
        type:'doughnut',
        data:{
          labels:[t('lbl_complete_approved'),t('lbl_on_track'),t('lbl_delayed')],
          datasets:[{ data:[STATS.ops.complete,STATS.ops.onTrack,STATS.ops.delayed], backgroundColor:[c.success,c.warning,c.danger], borderWidth:2 }]
        },
        options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:c.textColor,font:{size:12} } } } }
      });
    }, 100);
  }

  // ============================================================
  // RENDER: INTERVENTIONS
  // ============================================================
  function renderInterventions() {
    const priorityColors = { 'عاجل':'danger', 'حرج':'danger', 'متوسط':'warning', 'منخفض':'info' };
    const rows = state.interventions.map(item => `
      <tr>
        <td class="td-name">${item.project}</td>
        <td style="font-size:0.78rem">${item.agency}</td>
        <td class="td-name" style="color:var(--danger)">${item.issue}</td>
        <td>${badge(item.priority, priorityColors[item.priority]||'warning')}</td>
        <td style="font-size:0.78rem">${item.action}</td>
        <td style="font-size:0.72rem">${item.date}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="App.deleteItem('intervention',${item.id})">🗑️</button></td>
      </tr>
    `).join('');

    const intFilterBar = _buildFilterBar({ showStatus:false, showPeriod:true, showEntity:true, showKpiType:false, showSearch:true, showAdd:true, addSection:'intervention', addLabel: state.lang==='en'?'Add Intervention':'رفع تدخل جديد' });
    _el('interventionsContent').innerHTML = `
      ${intFilterBar}
      <div style="background:var(--danger-light);border:1px solid var(--danger);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:16px;font-size:0.82rem;color:var(--danger)">
        ⚠️ <strong>${state.lang==='ar'?'تنبيه عاجل':'Urgent Alert'}:</strong> ${state.interventions.length} ${state.lang==='ar'?'تدخلات تستدعي متابعة القيادة التنفيذية':'interventions require executive follow-up'}
      </div>
      <div class="table-wrapper">
        <div class="table-toolbar">
          <span class="table-title">${t('tbl_interventions')}</span>
          <span class="table-count">${state.interventions.length}</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>${t('th_project_output')}</th><th>${t('th_agency')}</th><th>${t('th_issue')}</th><th>${t('th_priority')}</th><th>${t('th_suggested')}</th><th>${t('th_date')}</th><th>${t('th_action')}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ============================================================
  // RENDER: REPORTS
  // ============================================================
  function renderReports() {
    const cards = state.reports.map(r => `
      <div class="repo-file">
        <div class="repo-file-icon">${r.type==='PDF'?'📄':'📊'}</div>
        <div class="repo-file-name">${r.name}</div>
        <div class="repo-file-meta">${r.date} · ${r.size} · ${r.by}</div>
        <div style="margin-top:8px;display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="App.toast('جاري التنزيل...','info')">${t('exp_download')}</button>
        </div>
      </div>
    `).join('');

    _el('reportsContent').innerHTML = `
      <div class="repo-grid">${cards}</div>
      <div style="margin-top:20px" class="card">
        <div class="card-header"><div class="card-title">${t('rpt_new_title')}</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">${t('rpt_name_lbl')}</label><input class="form-control" id="newReportName" placeholder="${t('rpt_name_ph')}"></div>
            <div class="form-group"><label class="form-label">${t('rpt_type_lbl')}</label><select class="form-control" id="newReportType"><option>PDF</option><option>Excel</option></select></div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.generateReport()">${t('rpt_create_btn')}</button>
        </div>
      </div>
    `;
  }

  function generateReport() {
    const nameEl = _el('newReportName');
    const typeEl = _el('newReportType');
    const name = nameEl ? nameEl.value || 'تقرير جديد' : 'تقرير جديد';
    const type = typeEl ? typeEl.value : 'PDF';
    state.reports.unshift({ id: Date.now(), name, type, date: new Date().toLocaleDateString('ar-SA'), size:'1.2 MB', by: state.currentUser?.name||'المستخدم' });
    toast('تم إنشاء التقرير بنجاح','success');
    renderReports();
    navigate('exports');
  }

  // ============================================================
  // RENDER: EXPORTS
  // ============================================================
  // ── مخزن ملفات التصدير (يُجمَع في الذاكرة ويمكن إضافة إليه) ──
  if (!state.exportedFiles) {
    state.exportedFiles = [
      { id:1,  name:'تقرير المؤشر العام - الفترة الثانية 2026',           type:'PDF',   size:'2.8 MB', date:'2026-04-28', time:'09:15', by:'زهرة الحيائي',    section:'overview',      icon:'📋' },
      { id:2,  name:'وكالة التخطيط الاستراتيجي - بيانات المشاريع',         type:'Excel', size:'1.4 MB', date:'2026-04-27', time:'14:32', by:'رامي الطويرقي',   section:'strategy',      icon:'🎯' },
      { id:3,  name:'مركز ذكاء الأعمال - تحليل الأداء',                   type:'Excel', size:'0.9 MB', date:'2026-04-27', time:'11:05', by:'آلاء الصنيع',      section:'bi',            icon:'💡' },
      { id:4,  name:'مركز الأداء التشغيلي - قائمة المخرجات كاملة',         type:'Excel', size:'3.1 MB', date:'2026-04-26', time:'16:48', by:'زهرة الحيائي',    section:'ops',           icon:'⚙️' },
      { id:5,  name:'تقرير التدخلات العاجلة - أبريل 2026',                type:'PDF',   size:'0.7 MB', date:'2026-04-25', time:'08:20', by:'زهرة الحيائي',    section:'interventions', icon:'🚨' },
      { id:6,  name:'ملخص الأداء التنفيذي - مارس 2026',                  type:'PDF',   size:'1.9 MB', date:'2026-04-01', time:'17:00', by:'محمد الشطير',      section:'performance',   icon:'📊' },
    ];
  }

  function renderExports() {
    const files = state.exportedFiles;
    const pdfCount   = files.filter(f=>f.type==='PDF').length;
    const xlsCount   = files.filter(f=>f.type==='Excel').length;
    const activeFilter = state._exportsFilter || 'all';

    const filtered = activeFilter === 'all' ? files
      : files.filter(f => f.type === (activeFilter === 'pdf' ? 'PDF' : 'Excel'));

    const rows = filtered.map(f => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:1.5rem">${f.icon||'📁'}</span>
            <div>
              <div style="font-weight:600;color:var(--text-primary);font-size:0.85rem">${f.name}</div>
              <div class="exp-user-col" style="margin-top:2px">👤 ${f.by}</div>
            </div>
          </div>
        </td>
        <td><span class="badge ${f.type==='PDF'?'danger':'success'}">${f.type==='PDF'?'📄 PDF':'📊 Excel'}</span></td>
        <td>
          <div class="exp-time-col">${f.date}</div>
          <div class="exp-time-col" style="margin-top:2px;opacity:0.7">${f.time||'--:--'}</div>
        </td>
        <td><span style="font-size:0.82rem">${f.size}</span></td>
        <td>
          <div style="display:flex;gap:6px;justify-content:flex-end">
            <button class="btn btn-primary btn-sm" title="${state.lang==='en'?'Download':'تنزيل'}" onclick="App.downloadExport(${f.id})">${t('exp_download')}</button>
            <button class="btn btn-secondary btn-sm" title="${state.lang==='en'?'Print':'طباعة'}" onclick="App.printExport(${f.id})">🖨️</button>
            <button class="btn btn-ghost btn-sm" title="${state.lang==='en'?'Delete':'حذف'}" onclick="App.deleteExport(${f.id})" style="color:var(--danger)">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted)">${t('exp_no_files')}</td></tr>`;

    const expFilterBar = _buildFilterBar({ showPeriod:true, showEntity:false, showStatus:false, showKpiType:false, showSearch:true });
    _el('exportsContent').innerHTML = expFilterBar + `

      <!-- إحصائيات سريعة -->
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
        <div class="kpi-card green">
          <div class="kpi-icon green">📁</div>
          <div class="kpi-value">${files.length}</div>
          <div class="kpi-label">${t('exp_total')}</div>
        </div>
        <div class="kpi-card danger">
          <div class="kpi-icon danger">📄</div>
          <div class="kpi-value">${pdfCount}</div>
          <div class="kpi-label">${t('exp_pdf')}</div>
        </div>
        <div class="kpi-card turquoise">
          <div class="kpi-icon turquoise">📊</div>
          <div class="kpi-value">${xlsCount}</div>
          <div class="kpi-label">${t('exp_excel')}</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-icon warning">🕒</div>
          <div class="kpi-value">${files[0]?.date || '-'}</div>
          <div class="kpi-label">${t('exp_last')}</div>
        </div>
      </div>

      <!-- أزرار التصدير السريع -->
      <div class="chart-card" style="margin-bottom:20px">
        <div class="chart-card-header">
          <div class="chart-card-title">${t('exp_quick_title')}</div>
        </div>
        <div class="chart-card-body" style="display:flex;gap:10px;flex-wrap:wrap;padding-top:10px">
          <button class="btn btn-primary btn-sm" onclick="App.quickExport('overview','PDF')">📋 المؤشر العام PDF</button>
          <button class="btn btn-primary btn-sm" onclick="App.quickExport('strategy','Excel')">🎯 وكالة التخطيط Excel</button>
          <button class="btn btn-primary btn-sm" onclick="App.quickExport('bi','Excel')">💡 مركز ذكاء الأعمال Excel</button>
          <button class="btn btn-primary btn-sm" onclick="App.quickExport('ops','Excel')">⚙️ الأداء التشغيلي Excel</button>
          <button class="btn btn-secondary btn-sm" onclick="App.quickExport('performance','PDF')">📊 لوحة الأداء PDF</button>
          <button class="btn btn-secondary btn-sm" onclick="App.quickExport('interventions','PDF')">🚨 التدخلات PDF</button>
        </div>
      </div>

      <!-- جدول التقارير المصدّرة -->
      <div class="chart-card">
        <div class="chart-card-header" style="flex-wrap:wrap;gap:10px">
          <div class="chart-card-title">${t('exp_log_title')}</div>
          <div style="display:flex;gap:6px">
            <button class="btn ${activeFilter==='all'?'btn-primary':'btn-ghost'} btn-sm" onclick="App.setExportsFilter('all')">${t('exp_all')} (${files.length})</button>
            <button class="btn ${activeFilter==='pdf'?'btn-primary':'btn-ghost'} btn-sm" onclick="App.setExportsFilter('pdf')">PDF (${pdfCount})</button>
            <button class="btn ${activeFilter==='excel'?'btn-primary':'btn-ghost'} btn-sm" onclick="App.setExportsFilter('excel')">Excel (${xlsCount})</button>
          </div>
        </div>
        <div class="chart-card-body" style="padding:0;overflow-x:auto">
          <table class="data-table" style="min-width:700px">
            <thead>
              <tr>
                <th>اسم التقرير</th>
                <th>النوع</th>
                <th>تاريخ الإنشاء</th>
                <th>الحجم</th>
                <th style="text-align:left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function setExportsFilter(f) {
    state._exportsFilter = f;
    renderExports();
  }

  function quickExport(section, type) {
    playSound('action');
    const labels = {
      overview:'المؤشر العام', strategy:'وكالة التخطيط الاستراتيجي',
      bi:'مركز ذكاء الأعمال', ops:'مركز الأداء التشغيلي',
      performance:'لوحة الأداء', interventions:'التدخلات العاجلة'
    };
    const icons = { overview:'📋', strategy:'🎯', bi:'💡', ops:'⚙️', performance:'📊', interventions:'🚨' };
    const sizes = { Excel:'1.'+(Math.floor(Math.random()*9)+1)+' MB', PDF:'0.'+(Math.floor(Math.random()*9)+2)+' MB' };
    const today = new Date().toISOString().split('T')[0];

    // أضف للقائمة
    state.exportedFiles.unshift({
      id: Date.now(),
      name: `${labels[section] || section} - ${today}`,
      type,
      size: sizes[type],
      date: today,
      by: state.currentUser?.name || 'زهرة الحيائي',
      section,
      icon: icons[section] || '📁'
    });

    // نفّذ التصدير الفعلي
    if (type === 'Excel') exportExcel(section);
    else exportPDF(section);

    toast(`تم إنشاء تقرير ${labels[section]} وإضافته للسجل`, 'success');
    renderExports();
  }

  function downloadExport(id) {
    const f = state.exportedFiles.find(x => x.id === id);
    if (!f) return;
    playSound('action');
    if (f.type === 'Excel') exportExcel(f.section);
    else exportPDF(f.section);
  }

  function printExport(id) {
    const f = state.exportedFiles.find(x => x.id === id);
    if (!f) return;
    playSound('action');
    printTab(f.section);
  }

  function deleteExport(id) {
    if (!confirm('هل تريد حذف هذا التقرير من السجل؟')) return;
    state.exportedFiles = state.exportedFiles.filter(x => x.id !== id);
    toast('تم حذف التقرير من السجل', 'success');
    renderExports();
  }

  // ============================================================
  // RENDER: AI
  // ============================================================
  function renderAI() {
    _el('aiContent').innerHTML = `
      <div class="insight-row" style="margin-bottom:16px">
        <div class="insight-card"><span class="insight-icon">💰</span><div><div class="insight-title">${t('ai_budget')}</div><div class="insight-body">${t('ai_budget_body')}</div></div></div>
        <div class="insight-card"><span class="insight-icon">🏆</span><div><div class="insight-title">${t('ai_top')}</div><div class="insight-body">${t('ai_top_body')} متوسط إنجاز</div></div></div>
        <div class="insight-card"><span class="insight-icon">⚠️</span><div><div class="insight-title">${t('ai_low')}</div><div class="insight-body">${t('ai_low_body')} فقط - 6 مشاريع لم تبدأ</div></div></div>
        <div class="insight-card"><span class="insight-icon">🚨</span><div><div class="insight-title">${t('ai_critical')}</div><div class="insight-body">${t('ai_critical_body')} من الكل)</div></div></div>
      </div>

      <div class="ai-section">
        <div class="ai-header">
          <div class="ai-header-icon">🤖</div>
          <div class="ai-header-text">
            <div class="ai-header-title">${t('ai_assistant')}</div>
            <div class="ai-header-subtitle">${t('ai_subtitle')}</div>
          </div>
        </div>
        <div class="ai-chip-row">
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip1'))">${t('ai_chip1')}</span>
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip2'))">${t('ai_chip2')}</span>
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip3'))">${t('ai_chip3')}</span>
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip4'))">${t('ai_chip4')}</span>
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip5'))">${t('ai_chip5')}</span>
          <span class="ai-chip" onclick="App.aiSend(t('ai_chip6'))">${t('ai_chip6')}</span>
        </div>
        <div class="ai-messages" id="aiMessages">
          <div class="ai-msg bot">${t('ai_greeting')}</div>
        </div>
        <div class="ai-input-row">
          <input class="ai-input" id="aiInput" placeholder="${t('ai_input_ph')}" onkeypress="if(event.key==='Enter')App.aiSend()">
          <button class="btn btn-primary btn-sm" onclick="App.aiSend()">${t('ai_send')}</button>
        </div>
      </div>
    `;
  }

  function aiSend(prefill) {
    const input = _el('aiInput');
    const query = (prefill || (input ? input.value.trim() : '')).toLowerCase();
    if (!query) return;

    const messages = _el('aiMessages');
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.textContent = prefill || input.value;
    messages.appendChild(userMsg);
    if (input) input.value = '';

    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = 'ai-msg bot';
    thinkingMsg.textContent = '⏳ جاري التحليل...';
    messages.appendChild(thinkingMsg);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      thinkingMsg.innerHTML = getAIResponse(query);
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  }

  function getAIResponse(q) {
    if (q.includes('ملخص') || q.includes('عام') || q.includes('شامل')) {
      return `📊 <strong>ملخص الأداء العام - الفترة الثانية 2026:</strong><br><br>
• إجمالي تكلفة المشاريع عبر الجهات الثلاث: <strong>273,787,557 ريال سعودي</strong><br>
• وكالة التخطيط الاستراتيجي: <strong>9 مشاريع</strong> بمتوسط إنجاز <strong>64%</strong> — أعلى جهة أداءً<br>
• مركز ذكاء الأعمال: <strong>8 مشاريع</strong> بمتوسط إنجاز <strong>9%</strong> فقط — تستدعي مراجعة<br>
• مركز الأداء التشغيلي: <strong>83 مخرجاً</strong> — 23 مكتمل، 36 على المسار، 24 متأخر<br><br>
🏆 <strong>الإنجاز الأبرز:</strong> 3 مشاريع مكتملة في التخطيط (100%)<br>
⚠️ <strong>التحدي الأكبر:</strong> الجامعة متأخرة بجميع مخرجاتها الـ24`;
    }
    if (q.includes('متعثر') || q.includes('تعثر')) {
      return `🚨 <strong>المشاريع المتعثرة:</strong><br><br>
<strong>1. توثيق خدمات وإجراءات الوزارة</strong> (وكالة التخطيط)<br>
• المقاول: شركة قدرة حلول الخبراء<br>
• الإنجاز: 24% فقط رغم انتهاء المدة (يناير 2025)<br>
• التكلفة: 7,988,607 ر.س<br>
• ⚡ التوصية: إشعار رسمي وبدء إجراءات التعاقد البديل<br><br>
<strong>2. استشارات فنية لتطوير الأعمال والتواصل الاستراتيجي</strong><br>
• المقاول: جامعة الأمير سطام<br>
• الإنجاز: 30% من 24 شهراً<br>
• التكلفة: 18,750,750 ر.س<br>
• ⚡ التوصية: اجتماع طارئ لمراجعة خطة التنفيذ`;
    }
    if (q.includes('ذكاء') || q.includes('bi') || q.includes('مركز')) {
      return `💡 <strong>مركز ذكاء الأعمال ودعم القرار:</strong><br><br>
• إجمالي التكلفة: <strong>113,010,637 ريال</strong><br>
• متوسط الإنجاز: <strong>9%</strong> فقط<br>
• <strong>6 من أصل 8 مشاريع عند 0%</strong> رغم التعاقد<br><br>
المشاريع الجارية فعلياً:<br>
• رفع منصة معرفة: 27% ✓<br>
• جودة البيانات: 28% ✓<br>
• استطلاعات الرأي: 16% ✓<br><br>
⚠️ <strong>المشاريع غير المُبدأة (6 مشاريع):</strong><br>
خدمات BI الاستشارية، DSS، بنك البيانات، الدراسات العقارية، بنك الخبراء، والبنية التقنية<br><br>
💡 <strong>توصية:</strong> مراجعة جداول بدء التنفيذ وتفعيل متابعة أسبوعية`;
    }
    if (q.includes('متأخر') || q.includes('الجامعة') || q.includes('مخرجات')) {
      return `⏰ <strong>تحليل المخرجات المتأخرة:</strong><br><br>
• إجمالي المخرجات المتأخرة: <strong>24 مخرجاً</strong> (29% من الإجمالي)<br>
• <strong>الجامعة</strong> متأخرة بجميع مخرجاتها الـ24 دون استثناء<br>
• لا توجد تواريخ استحقاق محددة لمخرجات الجامعة<br><br>
في المقابل:<br>
• شركة الابداع: 10 مكتملة، 8 على المسار، 0 متأخر ✅<br>
• شركة EY: 7 مكتملة، 22 على المسار، 0 متأخر ✅<br><br>
🚨 <strong>إجراءات مقترحة للجامعة:</strong><br>
1. مراسلة رسمية بتحديد جداول زمنية<br>
2. اجتماع طارئ مع الفريق التقني<br>
3. تفعيل بنود الغرامات التعاقدية<br>
4. رفع تقرير للقيادة التنفيذية`;
    }
    if (q.includes('توصية') || q.includes('تحسين') || q.includes('تطوير')) {
      return `📋 <strong>توصيات لتحسين الأداء:</strong><br><br>
<strong>أولوية عاجلة:</strong><br>
🔴 معالجة 24 مخرج متأخر للجامعة بخطة تصعيد رسمية<br>
🔴 مراجعة عقدي التعثر في وكالة التخطيط<br><br>
<strong>أولوية متوسطة:</strong><br>
🟡 تفعيل بدء الـ6 مشاريع غير المُبدأة في BI<br>
🟡 اجتماع متابعة شهري لكل وحدة<br><br>
<strong>فرص التطوير:</strong><br>
🟢 الاستفادة من خبرة شركة الابداع وEY في المخرجات الناجحة<br>
🟢 توثيق أفضل الممارسات من المشاريع المكتملة الـ3 في التخطيط<br>
🟢 تطوير مؤشرات أداء دورية (KPIs) لكل مشروع`;
    }
    if (q.includes('ميزانية') || q.includes('تكلفة') || q.includes('مال') || q.includes('ريال')) {
      return `💰 <strong>تحليل الميزانية والتكاليف:</strong><br><br>
<strong>وكالة التخطيط الاستراتيجي:</strong><br>
• إجمالي: 160,776,870 ريال<br>
• المنصرف: ${fmtSAR(STATS.strategy.totalCost - STATS.strategy.totalRemaining)}<br>
• المتبقي: ${fmtSAR(STATS.strategy.totalRemaining)}<br><br>
<strong>مركز ذكاء الأعمال:</strong><br>
• إجمالي: 113,010,637 ريال<br>
• المنصرف: ${fmtSAR(STATS.bi.totalCost - STATS.bi.totalRemaining)}<br>
• المتبقي: ${fmtSAR(STATS.bi.totalRemaining)}<br><br>
<strong>الإجمالي الكلي: 273,787,507 ريال سعودي</strong><br><br>
📊 أكبر مشروع: "تطوير مكتب إدارة المشاريع" بتكلفة 39,417,433 ريال (100% منجز)`;
    }
    return `🔍 <strong>إجابة عن استفساركم:</strong><br><br>
يمكنني مساعدتك في تحليل:<br>
• الأداء العام للوزارة ومتوسطات الإنجاز<br>
• المشاريع المتعثرة والمخرجات المتأخرة<br>
• تحليل الميزانية والتكاليف<br>
• توصيات التحسين والأولويات<br><br>
جرب الضغط على إحدى الأزرار السريعة أعلاه أو اسأل بشكل محدد.`;
  }

  // ============================================================
  // RENDER: MY UPDATES
  // ============================================================
  function renderMyUpdates() {
    if (state.myUpdates.length === 0) {
      _el('myupdatesContent').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✏️</div>
          <div class="empty-state-title">لا توجد تحديثات بعد</div>
          <div class="empty-state-body">اضغط "إضافة تحديث" لإنشاء أول تحديث لك</div>
        </div>`;
      return;
    }
    const items = state.myUpdates.map(u => `
      <div class="notif-item unread">
        <div class="notif-icon green">✏️</div>
        <div class="notif-content">
          <div class="notif-title">تحديث بواسطة ${u.user}</div>
          <div class="notif-body">${u.text}</div>
          <div class="notif-time">${u.date}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="App.deleteItem('update',${u.id})">🗑️</button>
      </div>
    `).join('');
    _el('myupdatesContent').innerHTML = `<div class="notif-list">${items}</div>`;
  }

  // ============================================================
  // RENDER: UPLOAD
  // ============================================================
  function renderUpload() {
    const fileList = state.uploadedFiles.length > 0
      ? `<div style="margin-top:20px" class="table-wrapper">
          <div class="table-toolbar"><span class="table-title">الملفات المرفوعة</span><span class="table-count">${state.uploadedFiles.length}</span></div>
          <div class="table-scroll"><table><thead><tr><th>اسم الملف</th><th>الحجم</th><th>التاريخ</th><th>إجراء</th></tr></thead>
          <tbody>${state.uploadedFiles.map(f=>`<tr><td>${f.name}</td><td>${f.size}</td><td>${f.date}</td><td><button class="btn btn-ghost btn-sm" onclick="App.deleteItem('file','${f.name}')">🗑️</button></td></tr>`).join('')}</tbody>
          </table></div></div>`
      : '';

    _el('uploadContent').innerHTML = `
      <div class="upload-zone" id="uploadZone" onclick="_el('fileInput').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="App.handleDrop(event)">
        <div class="upload-icon">📁</div>
        <div class="upload-text">اسحب الملفات هنا أو اضغط للاختيار</div>
        <div class="upload-hint">يدعم: PDF, Excel, Word, PNG (حد أقصى 20 MB)</div>
      </div>
      <input type="file" id="fileInput" style="display:none" multiple onchange="App.handleFileSelect(event)">
      ${fileList}
    `;
  }

  function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(f => {
      state.uploadedFiles.push({ name:f.name, size:(f.size/1024).toFixed(0)+' KB', date:new Date().toLocaleDateString('ar-SA') });
    });
    toast(`تم رفع ${files.length} ملف بنجاح`, 'success');
    renderUpload();
  }

  function handleDrop(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    files.forEach(f => {
      state.uploadedFiles.push({ name:f.name, size:(f.size/1024).toFixed(0)+' KB', date:new Date().toLocaleDateString('ar-SA') });
    });
    toast(`تم رفع ${files.length} ملف`, 'success');
    renderUpload();
  }

  // ============================================================
  // RENDER: REPOSITORY
  // ============================================================
  function renderRepository() {
    const allFiles = [
      { name:'تقرير الأداء الشهري - مارس 2026.pdf', icon:'📄', size:'2.4 MB', date:'2026-04-01' },
      { name:'مشاريع وكالة التخطيط.xlsx', icon:'📊', size:'1.1 MB', date:'2026-04-10' },
      { name:'مؤشرات مركز ذكاء الأعمال.pdf', icon:'📄', size:'3.2 MB', date:'2026-04-15' },
      { name:'خطة العمل Q2 2026.docx', icon:'📝', size:'0.8 MB', date:'2026-04-20' },
      ...state.uploadedFiles.map(f=>({ name:f.name, icon:'📁', size:f.size, date:f.date }))
    ];

    const cards = allFiles.map(f => `
      <div class="repo-file">
        <div class="repo-file-icon">${f.icon}</div>
        <div class="repo-file-name">${f.name}</div>
        <div class="repo-file-meta">${f.date} · ${f.size}</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="App.toast('جاري التنزيل...','info')">${t('exp_download')}</button>
      </div>
    `).join('');

    _el('repositoryContent').innerHTML = `<div class="repo-grid">${cards}</div>`;
  }

  // ============================================================
  // RENDER: ADMIN
  // ============================================================
  function renderAdmin() {
    const userRows = state.users.map(u => `
      <div class="user-row">
        <div class="user-row-avatar">${u.name[0]}</div>
        <div class="user-row-info">
          <div class="user-row-name">${u.name}</div>
          <div class="user-row-role">${u.role} · صلاحية: ${u.access}</div>
        </div>
        <span class="badge ${u.status==='نشط'?'success':'danger'}">${u.status}</span>
        <button class="btn btn-ghost btn-sm" onclick="App.deleteItem('user',${u.id})">🗑️</button>
      </div>
    `).join('');

    _el('adminContent').innerHTML = `
      <div class="admin-grid">
        <div class="card">
          <div class="card-header"><div class="card-title">إدارة المستخدمين</div></div>
          <div class="card-body">${userRows}</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">إعدادات النظام</div></div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">اسم المنظومة</label>
              <input class="form-control" value="وزارة البلديات والإسكان" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">الفترة النشطة</label>
              <input class="form-control" value="الفترة الثانية 2026" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">${t('adm_theme')}</label>
              <select class="form-control" onchange="App.toggleTheme()">
                <option value="light" ${state.theme==='light'?'selected':''}>فاتح</option>
                <option value="dark" ${state.theme==='dark'?'selected':''}>داكن</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">الإصدار</label>
              <input class="form-control" value="2.0.0 — 28 أبريل 2026" readonly>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-header"><div class="card-title">إحصاءات النظام</div></div>
        <div class="card-body">
          <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="kpi-card green"><div class="kpi-value">${state.users.length}</div><div class="kpi-label">مستخدمون نشطون</div></div>
            <div class="kpi-card turquoise"><div class="kpi-value">${STATS.grandTotal.projects}</div><div class="kpi-label">مشاريع مُدارة</div></div>
            <div class="kpi-card warning"><div class="kpi-value">${state.reports.length}</div><div class="kpi-label">تقارير مُنشأة</div></div>
            <div class="kpi-card info"><div class="kpi-value">${state.uploadedFiles.length}</div><div class="kpi-label">ملفات مرفوعة</div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // FILTERS & SEARCH
  // ============================================================
  function setFilter(section, value) {
    state.filters[section] = value;
    if (section === 'strategy') renderStrategy();
    else if (section === 'bi') renderBI();
    else if (section === 'ops') renderOps();
  }

  function setOpsContractorFilter(value) {
    state.filters.opsContractor = value;
    renderOps();
  }

  // ── Advanced Filters ──────────────────────────────────────────
  function setAdvFilter(key, value) {
    state.advFilters[key] = value;
    // إعادة رسم الصفحة الحالية
    const renderMap = {
      notifications: renderNotifications, performance: renderPerformance,
      workplan: renderWorkplan, overview: renderOverview,
      strategy: renderStrategy, bi: renderBI, ops: renderOps,
      interventions: renderInterventions, reports: renderReports,
      exports: renderExports, ai: renderAI, myupdates: renderMyUpdates,
      upload: renderUpload, repository: renderRepository, admin: renderAdmin,
    };
    if (renderMap[state.currentTab]) renderMap[state.currentTab]();
  }

  function resetAdvFilters() {
    state.advFilters = { period:'all', entity:'all', status:'all', kpiType:'all', search:'' };
    const renderMap = {
      strategy: renderStrategy, bi: renderBI, ops: renderOps,
      overview: renderOverview, performance: renderPerformance,
      interventions: renderInterventions, reports: renderReports,
      workplan: renderWorkplan,
    };
    if (renderMap[state.currentTab]) renderMap[state.currentTab]();
    toast(state.lang === 'ar' ? 'تم إعادة تعيين الفلاتر' : 'Filters reset', 'info');
  }

  // ── Build a professional filter bar HTML ──
  function _buildFilterBar(cfg) {
    // cfg: { id, showPeriod, showEntity, showStatus, showKpiType, showSearch, showAdd, addSection, addLabel }
    const f = state.advFilters;
    const isEn = state.lang === 'en';

    const periodOptions = [
      { v:'all',    l: isEn ? 'All Periods'  : 'كل الفترات' },
      { v:'q1',     l: isEn ? 'Q1 2026'      : 'الربع الأول 2026' },
      { v:'q2',     l: isEn ? 'Q2 2026'      : 'الربع الثاني 2026' },
      { v:'q3',     l: isEn ? 'Q3 2026'      : 'الربع الثالث 2026' },
      { v:'q4',     l: isEn ? 'Q4 2026'      : 'الربع الرابع 2026' },
    ];
    const entityOptions = [
      { v:'all',      l: isEn ? 'All Agencies'        : 'جميع الجهات' },
      { v:'strategy', l: isEn ? 'Strategic Planning'  : 'وكالة التخطيط الاستراتيجي' },
      { v:'bi',       l: isEn ? 'BI Center'            : 'مركز ذكاء الأعمال' },
      { v:'ops',      l: isEn ? 'Ops Center'           : 'مركز الأداء التشغيلي' },
    ];
    const statusOptions = [
      { v:'all',        l: isEn ? 'All Statuses'  : 'كل الحالات' },
      { v:'completed',  l: isEn ? 'Completed'     : 'مكتمل' },
      { v:'inprogress', l: isEn ? 'In Progress'   : 'جاري' },
      { v:'stalled',    l: isEn ? 'Stalled'       : 'متعثر' },
      { v:'delayed',    l: isEn ? 'Delayed'       : 'متأخر' },
      { v:'notstarted', l: isEn ? 'Not Started'   : 'لم يبدأ' },
    ];
    const kpiTypeOptions = [
      { v:'all',         l: isEn ? 'All Types'     : 'كل الأنواع' },
      { v:'consulting',  l: isEn ? 'Consulting'    : 'استشاري' },
      { v:'technology',  l: isEn ? 'Technology'    : 'تقني' },
      { v:'operational', l: isEn ? 'Operational'   : 'تشغيلي' },
      { v:'strategic',   l: isEn ? 'Strategic'     : 'استراتيجي' },
    ];

    const mkSel = (key, opts) =>
      `<select onchange="App.setAdvFilter('${key}',this.value)">
        ${opts.map(o => `<option value="${o.v}" ${f[key]===o.v?'selected':''}>${o.l}</option>`).join('')}
      </select>`;

    let groups = '';
    if (cfg.showPeriod !== false)
      groups += `<div class="filter-group"><label>🗓 ${isEn?'Period':'الفترة الزمنية'}</label>${mkSel('period',periodOptions)}</div>`;
    if (cfg.showEntity !== false)
      groups += `<div class="filter-group"><label>🏛 ${isEn?'Agency':'الجهة / الوكالة'}</label>${mkSel('entity',entityOptions)}</div>`;
    if (cfg.showStatus !== false)
      groups += `<div class="filter-group"><label>📊 ${isEn?'Status':'الحالة'}</label>${mkSel('status',statusOptions)}</div>`;
    if (cfg.showKpiType)
      groups += `<div class="filter-group"><label>🔖 ${isEn?'KPI Type':'نوع المؤشر'}</label>${mkSel('kpiType',kpiTypeOptions)}</div>`;
    if (cfg.showSearch !== false)
      groups += `<div class="filter-group" style="min-width:180px"><label>🔍 ${isEn?'Search':'بحث'}</label>
        <input type="text" value="${f.search||''}" placeholder="${isEn?'Search...':'بحث...'}"
          oninput="App.setAdvFilter('search',this.value)"></div>`;

    const activeCount = Object.entries(f).filter(([k,v])=>v!=='all'&&v!=='').length;
    const chips = activeCount > 0
      ? `<div class="filter-active-chips">
          <span style="font-size:0.7rem;color:var(--text-muted);font-weight:600">${isEn?'Active filters:':'فلاتر نشطة:'}</span>
          ${f.period!=='all'?`<span class="filter-chip">🗓 ${periodOptions.find(o=>o.v===f.period)?.l} <span class="chip-remove" onclick="App.setAdvFilter('period','all')">✕</span></span>`:''}
          ${f.entity!=='all'?`<span class="filter-chip">🏛 ${entityOptions.find(o=>o.v===f.entity)?.l} <span class="chip-remove" onclick="App.setAdvFilter('entity','all')">✕</span></span>`:''}
          ${f.status!=='all'?`<span class="filter-chip">📊 ${statusOptions.find(o=>o.v===f.status)?.l} <span class="chip-remove" onclick="App.setAdvFilter('status','all')">✕</span></span>`:''}
          ${f.kpiType!=='all'?`<span class="filter-chip">🔖 ${kpiTypeOptions.find(o=>o.v===f.kpiType)?.l} <span class="chip-remove" onclick="App.setAdvFilter('kpiType','all')">✕</span></span>`:''}
          ${f.search?`<span class="filter-chip">🔍 ${f.search} <span class="chip-remove" onclick="App.setAdvFilter('search','')">✕</span></span>`:''}
        </div>` : '';

    const addBtn = cfg.showAdd
      ? `<button class="btn btn-primary btn-sm" onclick="App.openAddModal('${cfg.addSection}')" style="height:36px;white-space:nowrap">
          ＋ ${cfg.addLabel || (isEn?'Add':'إضافة')}
        </button>` : '';

    return `
      ${chips}
      <div class="adv-filter-bar">
        ${groups}
        <div class="filter-actions">
          ${addBtn}
          <button class="filter-reset-btn" onclick="App.resetAdvFilters()" title="${isEn?'Reset filters':'إعادة تعيين'}">
            ↺ ${isEn?'Reset':'إعادة تعيين'}
          </button>
        </div>
      </div>`;
  }

  // ── Apply search filter to a row array ──
  function _applySearch(rows, searchFields) {
    const q = (state.advFilters.search || '').toLowerCase();
    if (!q) return rows;
    return rows.filter(r => searchFields.some(f => String(r[f]||'').toLowerCase().includes(q)));
  }

  // ── Apply status filter ──
  function _applyStatusFilter(rows, statusField) {
    const f = state.advFilters.status;
    if (f === 'all') return rows;
    const map = {
      completed:  ['مكتمل','انتهى','جاري الإغلاق','معتمد','Completed'],
      inprogress: ['على المسار','بدأ التنفيذ','تم التعاقد','In Progress','جاري'],
      stalled:    ['متعثر','Stalled'],
      delayed:    ['متأخر','Delayed'],
      notstarted: ['لم يبدأ','Not Started'],
    };
    const allowed = map[f] || [];
    return rows.filter(r => allowed.includes(r[statusField]));
  }

  function searchTable(input, tbodyId) {
    const q = input.value.toLowerCase();
    const rows = document.querySelectorAll('#' + tbodyId + ' tr');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  // ============================================================
  // DELETE ITEMS
  // ============================================================
  function deleteItem(section, id) {
    if (!confirm('هل تريد حذف هذا العنصر؟')) return;
    if (section === 'workplan') state.workplanItems = state.workplanItems.filter(i=>i.id!==id);
    else if (section === 'intervention') state.interventions = state.interventions.filter(i=>i.id!==id);
    else if (section === 'update') state.myUpdates = state.myUpdates.filter(i=>i.id!==id);
    else if (section === 'user') { if (id===1){toast('لا يمكن حذف المدير الرئيسي','danger');return;} state.users=state.users.filter(i=>i.id!==id); }
    else if (section === 'file') state.uploadedFiles = state.uploadedFiles.filter(f=>f.name!==id);
    toast('تم الحذف بنجاح','success');
    if (section==='workplan') renderWorkplan();
    else if (section==='intervention') renderInterventions();
    else if (section==='update') renderMyUpdates();
    else if (section==='user') renderAdmin();
    else if (section==='file') renderUpload();
  }

  // ============================================================
  // EXPORT & PRINT
  // ============================================================
  function exportExcel(tab) {
    let data, filename, headers;
    if (tab === 'strategy') {
      headers = ['#','اسم المشروع','النوع','التكلفة','المتبقي','الإنجاز %','الحالة','المقاول','المدير','تاريخ البدء','تاريخ الانتهاء'];
      data = DATA_STRATEGY.map(p=>[p.id,p.name,p.category,p.cost,p.remaining,p.completion,p.status,p.contractor,p.manager,p.startDate,p.endDate]);
      filename = 'وكالة_التخطيط_2026.xlsx';
    } else if (tab === 'bi') {
      headers = ['#','اسم المشروع','النوع','التكلفة','المتبقي','الإنجاز %','الحالة','المقاول','المدير','تاريخ الانتهاء'];
      data = DATA_BI.map(p=>[p.id,p.name,p.category,p.cost,p.remaining,p.completion,p.status,p.contractor,p.manager,p.endDate]);
      filename = 'مركز_ذكاء_الأعمال_2026.xlsx';
    } else if (tab === 'ops') {
      headers = ['#','المقاول','المخرج','الحالة','حالة الوثيقة','الاستحقاق','التسليم','الجهة'];
      data = DATA_OPS.map(p=>[p.id,p.contractor,p.output,p.status,p.docStatus,p.dueDate,p.deliveryDate,p.entity]);
      filename = 'مركز_الأداء_التشغيلي_2026.xlsx';
    } else if (tab === 'performance') {
      headers = ['الجهة','إجمالي المشاريع/المخرجات','متوسط الإنجاز %','مكتمل','متأخر/متعثر','إجمالي التكلفة'];
      data = [
        ['وكالة التخطيط الاستراتيجي',STATS.strategy.total,STATS.strategy.avgCompletion,STATS.strategy.complete,STATS.strategy.stalled,STATS.strategy.totalCost],
        ['مركز ذكاء الأعمال',STATS.bi.total,STATS.bi.avgCompletion,STATS.bi.complete,STATS.bi.notStarted,STATS.bi.totalCost],
        ['مركز الأداء التشغيلي',STATS.ops.total,'-',STATS.ops.complete,STATS.ops.delayed,'-'],
      ];
      filename = 'ملخص_الأداء_2026.xlsx';
    } else {
      toast('لا توجد بيانات لتصديرها','warning');
      return;
    }

    if (typeof XLSX === 'undefined') {
      toast('مكتبة Excel غير محملة - يرجى الاتصال بالإنترنت','danger');
      return;
    }
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
    XLSX.writeFile(wb, filename);

    const nowXl = new Date();
    const dateStrXl = nowXl.toISOString().split('T')[0];
    const timeStrXl = nowXl.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
    if (!state.exportedFiles) state.exportedFiles = [];
    const labelsXl = { strategy:'وكالة التخطيط الاستراتيجي', bi:'مركز ذكاء الأعمال', ops:'مركز الأداء التشغيلي', performance:'لوحة الأداء' };
    const iconsXl  = { strategy:'🎯', bi:'💡', ops:'⚙️', performance:'📊' };
    state.exportedFiles.unshift({ id:Date.now(), name:(labelsXl[tab]||filename)+' - '+dateStrXl, type:'Excel', size:'~1.2 MB', date:dateStrXl, time:timeStrXl, by:state.currentUser?.name||'المستخدم', section:tab, icon:iconsXl[tab]||'📊' });
    state.reports.unshift({ id:Date.now(), name:'تصدير: '+filename, type:'Excel', date:nowXl.toLocaleDateString('ar-SA'), size:'~1 MB', by:state.currentUser?.name||'المستخدم' });
    playSound('action');
    toast(state.lang==='ar'?'تم تصدير ملف Excel بنجاح':'Excel exported successfully','success');
  }

  function exportPDF(tab) {
    playSound('action');
    toast(state.lang==='ar'?'جاري إعداد ملف PDF...':'Preparing PDF...','info');

    // حفظ في سجل التصدير تلقائياً
    const labels = { strategy:'وكالة التخطيط الاستراتيجي', bi:'مركز ذكاء الأعمال', ops:'مركز الأداء التشغيلي', overview:'المؤشر العام', performance:'لوحة الأداء', interventions:'التدخلات العاجلة', workplan:'خطة العمل', notifications:'الإشعارات' };
    const icons  = { strategy:'🎯', bi:'💡', ops:'⚙️', overview:'📋', performance:'📊', interventions:'🚨', workplan:'📅', notifications:'🔔' };
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'});
    if (!state.exportedFiles) state.exportedFiles = [];
    state.exportedFiles.unshift({
      id: Date.now(),
      name: (labels[tab]||tab) + ' - ' + dateStr,
      type: 'PDF',
      size: '~1 MB',
      date: dateStr,
      time: timeStr,
      by: state.currentUser?.name || 'المستخدم',
      section: tab,
      icon: icons[tab]||'📄',
    });

    setTimeout(() => printTab(tab), 600);
  }

  function printTab(tab) {
    const current = state.currentTab;
    navigate(tab);
    setTimeout(() => {
      window.print();
      navigate(current);
    }, 500);
  }

  // ============================================================
  // PROJECT DETAIL MODAL
  // ============================================================
  function showProjectDetail(section, id) {
    const data = section === 'strategy' ? DATA_STRATEGY : DATA_BI;
    const p = data.find(x => x.id === id);
    if (!p) return;
    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><span class="form-label">اسم المشروع</span><div style="font-weight:600;margin-top:2px">${p.name}</div></div>
        <div><span class="form-label">المقاول</span><div style="margin-top:2px">${p.contractor}</div></div>
        <div><span class="form-label">مدير المشروع</span><div style="margin-top:2px">${p.manager}</div></div>
        <div><span class="form-label">التصنيف</span><div style="margin-top:2px">${p.category}</div></div>
        <div><span class="form-label">تاريخ البدء</span><div style="margin-top:2px">${p.startDate||'-'}</div></div>
        <div><span class="form-label">تاريخ الانتهاء</span><div style="margin-top:2px">${p.endDate||'-'}</div></div>
        <div><span class="form-label">المدة</span><div style="margin-top:2px">${p.duration||'-'}</div></div>
        <div><span class="form-label">الحالة</span><div style="margin-top:4px">${badge(p.status,getStatusColor(p.status))}</div></div>
        <div><span class="form-label">التكلفة الإجمالية</span><div style="font-weight:700;color:var(--green-primary);margin-top:2px">${fmtSAR(p.cost)}</div></div>
        <div><span class="form-label">المبلغ المتبقي</span><div style="font-weight:700;color:var(--warning);margin-top:2px">${fmtSAR(p.remaining)}</div></div>
      </div>
      <div style="margin-top:14px"><span class="form-label">نسبة الإنجاز</span><div style="margin-top:6px">${progressBar(p.completion)}</div></div>
    `;
    openModal('تفاصيل المشروع — ' + p.name.substring(0,30), html, 'view');
    _el('modalSaveBtn').style.display = 'none';
    setTimeout(() => { _el('modalSaveBtn').style.display = ''; }, 100);
  }

  // ============================================================
  // INIT
  // ============================================================
  function initDashboard() {
    // Restore theme from localStorage
    const savedTheme = localStorage.getItem('momah-theme') || 'light';
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    _el('themeBtn').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    // Chart.js defaults
    if (typeof Chart !== 'undefined') {
      Chart.defaults.font.family = "'Tajawal', system-ui, sans-serif";
      Chart.defaults.animation = { duration: 600, easing: 'easeOutQuart' };
    }

    // Save theme on change
    const observer = new MutationObserver(() => {
      localStorage.setItem('momah-theme', document.documentElement.getAttribute('data-theme'));
    });
    observer.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });

    // Keyboard shortcut: ESC closes modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    // تفعيل السياق الصوتي عند أول تفاعل (متطلب المتصفح)
    document.addEventListener('click', () => {
      try { if (_audio.ctx && _audio.ctx.state === 'suspended') _audio.ctx.resume(); } catch(e){}
    }, { once: true });

    console.log('MOMAH Dashboard v2 initialized | البيانات:', {
      strategy: STATS.strategy,
      bi: STATS.bi,
      ops: STATS.ops,
      grand: STATS.grandTotal
    });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  return {
    login, logout,
    navigate, toggleNav,
    toggleTheme, toggleLang, toggleSound, applyLang,
    openAddModal, closeModal, saveModal,
    renderNotifications, renderPerformance, renderWorkplan,
    renderOverview, renderStrategy, renderBI, renderOps,
    renderInterventions, renderReports, renderExports, renderAI,
    renderMyUpdates, renderUpload, renderRepository, renderAdmin,
    markAllRead,
    setFilter, setOpsContractorFilter,
    setAdvFilter, resetAdvFilters,
    searchTable,
    deleteItem,
    showProjectDetail,
    aiSend,
    exportExcel, exportPDF, printTab,
    generateReport,
    setExportsFilter, quickExport, downloadExport, printExport, deleteExport,
    handleFileSelect, handleDrop,
    toast,
    initDashboard,
  };
})();
