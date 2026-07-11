import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id";

interface LecturerComment {
  name: string;
  quote: string;
  src: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultEnglish?: string) => string;
  lecturerComments: LecturerComment[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Complete Translation Dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Tabs
    "nav.brand": "KKN PROJECT",
    "nav.campus": "GROUP 063 UMY",
    "nav.home": "HOME",
    "nav.kkn_workspace": "KKN WORKSPACE",
    "nav.team_voices": "TEAM VOICES",
    "nav.about": "ABOUT PROJECT",
    "nav.ingress": "Ingest Data",
    "nav.dashboard": "Performance",
    "nav.analytics": "Analytics",
    "nav.predict": "Predict",
    "nav.history": "History",
    "nav.workflow": "Workflow",
    "nav.ethics": "Ethics",
    "nav.twin": "Digital Twin",

    // Action buttons & state
    "btn.load": "Load Workbook",
    "btn.train": "Train AutoML",
    "btn.learn": "Learn AI Lab",
    "btn.start_predict": "Start Prediction",
    "btn.upload_dataset": "Upload Dataset",
    "btn.view_workflow": "View ML Workflow",
    "btn.clear_history": "Clear History",
    "btn.delete": "Delete",
    "btn.kkn_workspace": "Open KKN Workspace",
    "btn.about_project": "About Project",
    "btn.ai_education": "AI Education",

    // Hero Section
    "hero.badge": "KKN PROJECT GROUP 063",
    "hero.title_part1": "KKN PERSYARIKATAN",
    "hero.title_part2": "MUHAMMADIYAH 063",
    "hero.title_part3": "UNITED IN SERVICE. DRIVEN BY IMPACT.",
    "hero.subtitle": "KKN Project is an integrated digital workspace for KKN Persyarikatan Muhammadiyah Group 063, Universitas Muhammadiyah Yogyakarta. It brings attendance, program planning, financial administration, reporting, documentation, and daily coordination into one connected system, strengthening solidarity, accountability, and meaningful community impact throughout the KKN journey.",
    "hero.chip_header": "ALGORITHM IMPLEMENTATION & COGNITION SPACES",
    "globe.hud_title": "3D GEOGRAPHIC TELEMETRY CONTROL",
    "globe.hud_subtitle": "PORTAL PERSYARIKATAN SYSTEM v2.0 // ACTIVE COBE CORE",
    "globe.theme_label": "GLOBE COLOR THEME",
    "globe.speed_label": "SPIN VELOCITY CONTROL",
    "globe.spawner_title": "DEPLOY NEW KKN OUTPOST IN REAL-TIME",
    "globe.district_select": "1. SELECT DISTRICT REGION",
    "globe.label_input": "2. ENTER TEAM/POSKO LABEL",
    "globe.pulse_size": "PULSE INTENSITY SIZE",
    "globe.log_idle": "System idle. Awaiting tactical outpost configuration inputs...",
    "globe.node_count": "TOTAL ACTIVE CORE NODES",

    // Robot Background Section
    "background.badge": "Program Studi Teknik Mesin UMY • Akreditasi Unggul",
    "background.title": "ACADEMIC BACKGROUND OF MECHANICAL ENGINEERING UMY",
    "background.subtitle": "Breaking engineering boundaries by synergizing traditional mechanics, industrial automation, and smart data processing based on Artificial Intelligence.",
    "background.tab_profile": "Profile Summary",
    "background.tab_lab": "Laboratories",
    "background.tab_research": "Research Areas",
    "background.profile_title": "Bridging Experimental Theory with Modern Computational Science",
    "background.mission_tag": "Core Mission",
    "background.mission_title": "International Standards Curriculum",
    "background.mission_desc": "Adapting parameters periodically to nurture superior graduates specializing in mechanical design, ecofriendly energy conversion, innovative materials, and industrial robotics.",
    "background.ai_tag": "Digital Integration",
    "background.ai_title": "Artificial Intelligence Synergies",
    "background.ai_desc": "Through elective courses and direct research, students build smart predictive models mapping material mechanical stress and mechanical rotational vibration diagnostics.",
    "background.quote_desc": "\"Mechanical Engineering undergraduate studies are fully supported by high-spec laboratories inside the green and modern UMY Engineering Faculty Complex.\"",
    "background.system_status": "DATA ENGINE STATE",
    "background.status_active": "● ACTIVE ONLINE",
    "background.g6_lab_title": "State-of-the-Art Labs in G6 Building UMY",
    "background.research_title": "Harmonizing Structural Engineering and High-Performance Computation",
    "background.campus_location": "UMY Integrated Campus, Yogyakarta",
    "background.dept_footer": "ENGINEERING DEPARTMENT INFRASTRUCTURE • FT-UMY",
    "background.department_vision": "The Mechanical Engineering Department at UMY is committed to producing professionals with international competency, entrepreneurial spirit founded on noble Islamic values, and robust mastery of industry 4.0 digitalization.",

    // About/Academic Section
    "academic.research_badge": "KKN PROJECT OVERVIEW",
    "academic.title": "INTEGRATED KKN WORKSPACE & GROUP PROFILE",
    "academic.subtitle": "KKN Project is a centralized digital workspace developed for PersyarikatanMu-063 to support structured coordination, attendance management, financial administration, program planning, reporting, documentation, and collaborative execution throughout the KKN implementation period.",
    "about.tab1": "GROUP PROFILE",
    "about.tab2": "WORKSPACE SCOPE",
    "about.tab3": "CORE VALUES",
    "about.cert_researcher": "KKN GROUP PROFILE",
    "about.sub_campus": "KKN Period",
    "about.course_dept": "Total Members",
    "about.academic_focus": "Main Focus",
    "about.active_nodes": "GROUP INFORMATION",
    "about.thesis_title": "DIGITAL WORKSPACE FOR COORDINATION, ADMINISTRATION, AND COLLABORATIVE KKN IMPLEMENTATION",
    "about.thesis_subtitle": "PersyarikatanMu-063 | Universitas Muhammadiyah Yogyakarta",
    "about.map_title": "KKN LOCATION COORDINATE HD SATELLITE MAP",
    "about.map_label": "LOKASI KKN GROUP 063",
    "about.directions": "GET DIRECTIONS",
    "about.contact_title": "DEVELOPER INTERACTIVE CONNECT",
    "about.contact_desc": "Connect directly with ADMINISTRATOR for code validation, academic review, and engineering enquiries:",
    "about.institutional_nodes": "UNIVERSITAS MUHAMMADIYAH NODES",
    "about.umy_website": "Official UMY Website",
    "about.krs_portal": "Academic KRS Portal",
    "about.brand_core": "KKN PROJECT SUMMARY",
    "about.focus_label": "GROUP IDENTITY",
    "about.focus_value": "PERSYARIKATANMU-063",
    "about.integrity_label": "WORKSPACE STATUS",
    "about.integrity_value": "FULLY COORDINATED SYSTEM",
    "about.abstract_part1": "KKN Project is designed as an integrated workspace that helps PersyarikatanMu-063 manage group activities in a more structured, transparent, and accountable way. The platform connects attendance tracking, work program planning, financial administration, reporting, documentation, and daily coordination in one digital environment.",
    "about.abstract_part2": "By centralizing operational information into one system, KKN Project supports stronger teamwork, clearer responsibilities, more effective collaboration, and better continuity in the implementation of community-oriented programs throughout the KKN period.",

    // Tab 2 Extra Translations
    "about.tab2.left_badge": "WORKSPACE OVERVIEW",
    "about.tab2.left_title": "KKN PROJECT MODULES",
    "about.tab2.left_strip_lbl": "SYSTEM STATUS",
    "about.tab2.left_strip_val": "INTEGRATED MODULES",
    "about.tab2.left_subline": "One connected workspace for all essential KKN operations",
    "about.tab2.left_table_title": "SYSTEM COVERAGE",
    "about.tab2.row1_val": "Meetings, field activities, and member participation",
    "about.tab2.row2_val": "Planning, progress tracking, and follow-up actions",
    "about.tab2.row3_val": "Cash flow, activity expenses, and financial documentation",
    "about.tab2.row4_val": "Daily notes, weekly summaries, and structured reporting",
    "about.tab2.left_footer": "KKN PROJECT MODULE CORE",
    "about.tab2.right_badge": "WORKSPACE SCOPE",
    "about.tab2.right_title": "ONE PLATFORM FOR MULTIPLE OPERATIONAL NEEDS",
    "about.tab2.right_subtitle": "Integrated system for structured KKN execution",
    "about.tab2.right_p1": "KKN Project provides a centralized workspace where all key KKN functions can be managed in a more coordinated and accessible way. The system helps members monitor attendance, organize work programs, manage finance, prepare reports, and maintain documentation without relying on scattered manual records.",
    "about.tab2.right_p2": "With a connected digital workflow, PersyarikatanMu-063 can reduce administrative fragmentation, improve internal communication, and strengthen the continuity of each activity from planning to reporting.",
    "about.tab2.right_lbl_left": "MODULE COVERAGE",
    "about.tab2.right_val_left": "ATTENDANCE • PROKER • FINANCE",
    "about.tab2.right_lbl_right": "OPERATIONAL VALUE",
    "about.tab2.right_val_right": "STRUCTURED AND ACCOUNTABLE",

    // Tab 3 Extra Translations
    "about.tab3.left_badge": "TEAM VALUES",
    "about.tab3.left_title": "PERSYARIKATANMU-063",
    "about.tab3.left_strip_lbl": "GROUP CHARACTER",
    "about.tab3.left_strip_val": "SOLID • COMMITTED • RESPONSIBLE",
    "about.tab3.left_subline": "Shared principles that guide the team throughout the KKN journey",
    "about.tab3.left_table_title": "CORE PRINCIPLES",
    "about.tab3.row1_lbl": "Solidarity",
    "about.tab3.row1_val": "Working together with mutual support and shared purpose",
    "about.tab3.row2_lbl": "Commitment",
    "about.tab3.row2_val": "Carrying out responsibilities with discipline and consistency",
    "about.tab3.row3_lbl": "Responsibility",
    "about.tab3.row3_val": "Ensuring every task and contribution is accountable",
    "about.tab3.row4_lbl": "Impact",
    "about.tab3.row4_val": "Creating meaningful value for the community",
    "about.tab3.left_footer": "GROUP VALUE SYSTEM",
    "about.tab3.right_badge": "CORE VALUES",
    "about.tab3.right_title": "SOLIDARITY, COMMITMENT, AND RESPONSIBLE ACTION",
    "about.tab3.right_subtitle": "Foundational principles of PersyarikatanMu-063",
    "about.tab3.right_p1": "The strength of PersyarikatanMu-063 lies not only in shared tasks, but in the spirit of solidarity that connects every member. KKN Project reflects this spirit by providing a common space where responsibilities, ideas, and progress can be managed collectively.",
    "about.tab3.right_p2": "Commitment and responsibility remain central to every activity carried out by the team. Through disciplined coordination and accountable implementation, PersyarikatanMu-063 seeks to create meaningful community impact while strengthening collaboration and organizational maturity.",
    "about.tab3.right_lbl_left": "TEAM FOUNDATION",
    "about.tab3.right_val_left": "SOLIDARITY AND COMMITMENT",
    "about.tab3.right_lbl_right": "MISSION ORIENTATION",
    "about.tab3.right_val_right": "COMMUNITY IMPACT",
    "workflow.badge": "System Blueprints",
    "workflow.title": "System Operational Workflow",
    "workflow.subtitle": "A modular step-by-step schematic breaking down how MechAutoML AI processes raw material spreadsheets into high-accuracy, deployable predictive engineering models.",
    "workflow.step1.title": "Dataset Upload",
    "workflow.step2.title": "Dataset Preview",
    "workflow.step3.title": "Feature & Target Selection",
    "workflow.step4.title": "Data Preprocessing",
    "workflow.step5.title": "Model Training",
    "workflow.step6.title": "Model Evaluation",
    "workflow.step7.title": "Visual Analytics",
    "workflow.step8.title": "History & CSV Export",
    "workflow.step1.desc": "Users stream engineering spreadsheets in CSV or XLSX format containing empirical testing data logs.",
    "workflow.step2.desc": "Automatic structural mapping triggers to determine cell counts, categories, and null distributions.",
    "workflow.step3.desc": "Students define separate training variables (X) and designate a continuous numeric prediction target (Y).",
    "workflow.step4.desc": "Automatic mean cell imputations and string category label encoders are established to secure mathematical integrity.",
    "workflow.step5.desc": "MECH AI's ML engine trains Extra Trees, Oblivious CatBoost, and loss-regularized XGBoost regressors on 80% splits.",
    "workflow.step6.desc": "Calculations resolve R², MAE, RMSE, and MAPE scores on the withheld 20% validation splits.",
    "workflow.step7.desc": "The system plots interactive scatter charts, horizontal contribution weights, and residual frequency curves.",
    "workflow.step8.desc": "Predictions cache to local storage where they are searched, removed, or compiled into a downloadable CSV sheet.",
    "workflow.methodology.badge": "Validation & Methodology Summary",
    "workflow.methodology.text": "The processing architecture establishes a fully structured pipeline aligned with the CRISP-DM methodology. Raw data parsed via our client file-worker is clean-partitioned using seed replication vectors corresponding to institutional research guidelines. This deterministic consistency allows team members and academic panels to audit metrics iteratively with 100% mathematical reproducibility.",
    "ethics.title": "Ethical Reflections & Technical Limitations",
    "ethics.subtitle": "A core academic breakdown concerning the limits, security risks, responsibilities, and guidelines of deploying Artificial Intelligence algorithms into physical mechanical systems.",
    "ethics.p1.title": "Dependency on Empirical Quality",
    "ethics.p1.desc": "AI prediction models are fully dependent on the quality, size, and relevance of the uploaded dataset. Garbage in, garbage out - if empirical readings lack physical precision, machine predictions will fail correspondingly.",
    "ethics.p2.title": "Statistical Probability, Not Absolute Truth",
    "ethics.p2.desc": "Machine learning models generate statistical estimates based on learned data patterns, not absolute laws of physics. They lack intrinsic awareness of material thermodynamics or structural fluid formulas and must not be treated as absolute facts.",
    "ethics.p3.title": "Theory & Experimental Validation",
    "ethics.p3.desc": "Prediction outputs must always be validated using standard engineering theory (such as stress calculations, finite element analysis, or Hooke's laws), physical laboratory testing, or expert academic inspection.",
    "ethics.p4.title": "Mitigation of Statistical Bias",
    "ethics.p4.desc": "Poor-quality datasets, highly unskewed bounds, or narrow test vectors will generate highly biased models. It is the researcher's responsibility to balance input profiles to prevent misleading estimations.",
    "ethics.p5.title": "Decision Support, Not Decision Maker",
    "ethics.p5.desc": "MechAutoML AI must act strictly as a learning tool and auxiliary decision-support module, never as the single source for critical manufacturing, aerospace, or structural structural structural components design decisions.",
    "ethics.p6.title": "Data Confidentiality & Privacy",
    "ethics.p6.desc": "Avoid uploading proprietary or sensitive industrial trial datasets. All operations are processed locally in-browser to protect basic privacy, but academic boundaries demand careful file sharing.",
    "ethics.signoff.title": "STUDENT & RESEARCH STATEMENT OF RESPONSIBILITY",
    "ethics.signoff.desc": "\"As engineering students and practitioners, human oversight represents the final safeguard. AI tools provide powerful statistical calculations, but expert physical reasoning and peer-reviewed mechanical laws remain the absolute pillars of professional engineering excellence.\"",
    "ethics.signoff.meta": "ADMINISTRATOR | Created by KKN Group 063",
    "upload.pipeline_badge": "Interactive Machine Construction Pipeline",
    "upload.workspace_title": "MechAutoML Center",
    "upload.workspace_desc": "High-fidelity machine learning platform for advanced engineering diagnostics. Drop your datasets, configure regression features, train models, and export analytics with ease.",
    "upload.ingested_workspace": "Ingested Workspace",
    "upload.rows": "rows",
    "upload.properties": "properties",
    "upload.ingest_data": "Ingest Data",
    "upload.define_matrices": "Define Matrices",
    "upload.model_selection": "Model Selection",
    "upload.ai_compiler": "AI Compiler",
    "upload.preview_data": "Preview Data",
    "upload.ingesting_workbook": "Ingesting Workbook Dataset",
    "upload.running_diagnostic": "Running AI Diagnostic Parsing",
    "upload.analyzing_variables": "Analyzing dataset variables, measuring sparse matrices, and indexing engineering parameters...",
    "upload.ingest_deck_title": "Workbook Ingest Deck (Supports xlsx, csv, zip)",
    "upload.registry_title": "Active Telemetry Repository Decks",
    "upload.registry_desc": "Click a sheet card to set it as active preview. Pick multiple sheets to execute synthetic data merges.",
    "upload.worksheets_loaded": "worksheets loaded",
    "fu.drop_title": "Drop your CSV, Excel, or ZIP files here",
    "fu.drop_subtitle": "Fully supports automated imputer parsing · Max {size} per dataset",
    "fu.ingest_button": "Ingest worksheets",
    "fu.active_session": "Active Session Inbound files",
    "fu.search_placeholder": "Search ingest queue...",
    "fu.deregister_selected": "Deregister Selected",
    "fu.table_header_pipeline": "Worksheet Pipeline",
    "fu.table_header_subtype": "Subtype",
    "fu.table_header_size": "Bytes Size",
    "fu.table_header_operations": "Operations",
    "fu.selected_count": "{selected} of {total} loaded files selected",

    // Faculty Notes Section
    "faculty.badge": "KKN MEMBER QUOTES",
    "faculty.title": "Voices of PersyarikatanMu-063",
    "faculty.subtitle": "Inspiring words from the members of PersyarikatanMu-063, reflecting solidarity, responsibility, teamwork, and the shared spirit of community service throughout the KKN journey.",
    "lecturer.comment": "MEMBER QUOTE",
    "lecturer.num": "MEMBER",
    "lecturer.title_badge": "KKN MEMBER",
    "lecturer.tip": "CLICK ANY CARD TO VIEW MEMBER QUOTE",
    "lecturer.status": "KKN MEMBER",
    "lecturer.dismiss": "CLOSE",

    // Course branding
    "footer.course": "KKN PERSYARIKATAN MUHAMMADIYAH 063",
    "footer.institution": "UNIVERSITAS MUHAMMADIYAH YOGYAKARTA",
    "footer.creator": "KKN GROUP 063",

    // Sub Navigation buttons
    "subnav.ingest": "Spreadsheet Ingest",
    "subnav.settings": "Feature Selection Settings",
    "subnav.automl": "Core AutoML Training",
    "subnav.dashboard_title": "Performance Dashboard",
    "subnav.analytics_title": "High-Rigor Visual Analytics",

    // Labs names
    "lab.comp": "Computer & Graphic Expert Lab",
    "lab.comp_desc": "CAD/CAM/CAE simulations and machine design optimization powered by HPC and AI integration.",
    "lab.cnc": "CNC & Manufacturing Automation Lab",
    "lab.cnc_desc": "Provides precision hands-on with CNC lathes, high-speed milling, and automated toolpath programming.",
    "lab.energy": "Energy Conversion & Fundamental Phenom Lab",
    "lab.energy_desc": "Studies fluid dynamics, convective heat transfer, turbines, and thermal combustion engines.",
    "lab.material": "Engineering Materials & Metallurgy Lab",
    "lab.material_desc": "Focuses on metal hardness, tensile strength, microstructural metallography, and heat treatment.",

    // Research pillars
    "riset.title1": "Mechanical Informatics",
    "riset.text1": "Integration of Machine Learning optimization algorithms (Extra Trees, CatBoost, XGBoost) to predict CNC cutter tool wear coefficients, metal corrosion rate indexes, and fluid system thermal efficiencies.",
    "riset.title2": "Advanced Manufacturing",
    "riset.text2": "In-depth study of autonomous control mechanisms, high-speed metal cutting parameters optimization, and integration of digital twin interfaces to advance national machine fabrication.",
    "riset.title3": "Sustainable Materials",
    "riset.text3": "Design, dynamic fatigue testing, and characterization of local green composite layers for automotive components, aerospace structures, and eco-friendly biomedical implants.",
    
    // Core capabilities
    "cap.title": "Integrated Machine Learning Core Capabilities",
    "cap.desc": "Every analytical coordinate is mapped of physical measurement, attribute matrix dependency, selection boundaries, and metric loss residual.",

    // Alerts and Wizard Step 4 keys
    "alert.step_locked": "Step is locked. Please complete the previous steps sequentially first.",
    "alert.load_workbook": "Please load a mechanical engineering workbook spreadsheet before proceeding.",
    "alert.define_features": "Define predictor features (X) and target variable (Y) before proceeding.",
    "alert.select_model": "Select at least one machine learning model before compiling.",
    "btn.open_evaluation": "Open Evaluation Panel",
    "warning.title": "Pre-compiler Diagnostic Notification",

    // Education section keys (en)
    "edu.center_badge": "MECH-AI ACADEMIC STUDY CENTER",
    "edu.header_title_gradient": "ACADEMIC KNOWLEDGE SUITE",
    "edu.header_subtitle": "Learn the core foundations of artificial intelligence science, AutoML algorithm workflows in Mechanical Engineering, and the journey of intelligent computing technologies.",
    "edu.tab_basics": "AI Basics",
    "edu.tab_system": "How AI Works",
    "edu.tab_evolution": "AI Evolution",
    "edu.tab_sandbox": "Sandbox Simulation",
    "edu.basics_pre": "LEARNING CORE MATERIAL",
    "edu.basics_title": "MAIN CONCEPTS IN ARTIFICIAL INTELLIGENCE",
    "edu.basics_subtitle": "Here is an explanation of four epistemological basic pillars for applied artificial intelligence in engineering fields.",
    "edu.system_pre": "PIPELINE EXECUTION FLOW",
    "edu.system_title": "HOW DOES AN AI SYSTEM READ DATA & OPERATE?",
    "edu.system_subtitle": "Here is the lifecycle workflow from binary spreadsheet inputs up to precision predictions inside MechAutoML.",
    "edu.phase_prefix": "Phase",
    "edu.synthesis_title": "AutoML Model Synthesis & Smart Predictions",
    "edu.synthesis_subtitle": "Mech-AI technology leverages iterative grids where Extra Trees estimations are serially refined by dynamic XGBoost engines, preventing single-algorithm dependencies.",
    "edu.evolution_pre": "CHRONOLOGY TIMELINE",
    "edu.evolution_title": "HISTORY AND EVOLVING PHASES OF AI THROUGH THE YEARS",
    "edu.evolution_subtitle": "Here is the timeline trace of artificial intelligence evolution from automata logic theories up to automated machine learning (AutoML) systems.",
    "edu.sandbox_pre": "INTERACTIVE SIMULATION",
    "edu.sandbox_title": "STUDENT CORNER: INTERACTIVE PREDICTOR SANDBOX",
    "edu.sandbox_subtitle": "Use the controls below to simulate how dataset quality and model parameter layers affect weighting quality and ML prediction accuracy.",
    "edu.sandbox_lbl_manipulate": "3D NEUMORPHIC HARDWARE DECK AUTOMATED MODEL TUNING",
    "edu.param_cleanliness": "DATASET PURITY INDEX",
    "edu.param_cleanliness_desc": "Reduces outliers, standard error deviation of feature attributes.",
    "edu.param_complexity": "ESTIMATORS TREE DEPTH (MAX_DEPTH)",
    "edu.param_complexity_desc": "Configures complex layers split boundaries to lock non-linear weight bounds.",
    "edu.param_normalization": "NORMALIZATION / SCALING INDEX (MinMax)",
    "edu.param_normalization_desc": "Aligns numeric ranges of attributes to keep convergence paths stable.",
    "edu.lbl_sel_algo": "CHOOSE MODEL ALGORITHM BASE",
    "edu.gauge_title": "FINAL MODEL PREDICTIVE ESTIMATION",
    "edu.lbl_outlier": "Outlier Variance Estimation",
    "edu.lbl_convergence": "Model Convergence Steps",
    "edu.lbl_optimality": "Accuracy Bounds",
    "edu.status_optimal": "HIGHLY OPTIMAL",
    "edu.status_suboptimal": "SUBOPTIMAL (DATA NOISE)",
    "edu.sandbox_lesson": "Increasing model tree depth on noisy data causes overfitting (high variance). Clean preprocessing calibration (Purity > 80%) remains the key to real-world deployment accuracy.",
    "edu.card1_topic": "Teori Automata",
    "edu.card1_title": "1. Representasi Fitur",
    "edu.card1_desc": "Features representation from binary codes up to physical stress attributes mapping.",
    "edu.card1_badge": "Fisika Cerdas",
    "edu.card1_sub": "LAB TEKNIK",
    "edu.card2_topic": "Matematika Sistem",
    "edu.card2_title": "2. Fungsi Kerugian (Loss)",
    "edu.card2_desc": "Measuring mathematical boundary deviations and model residuals using dynamic MAE and RMSE.",
    "edu.card2_badge": "Akurasi Statistik",
    "edu.card2_sub": "UMY MESIN",
    "edu.card3_topic": "Etika Komputasi",
    "edu.card3_title": "3. Validasi Otonom",
    "edu.card3_desc": "Multi-model stacked ensembles designed for scientific rigor and unbiased predictive computations.",
    "edu.card3_badge": "KKN Group 063 Core",

    // Footer section keys (en)
    "footer.excellence": "UNITED IN COMMUNITY SERVICE",
    "footer.menu.workspace": "KKN Project Workspace",
    "footer.menu.training": "Work Program Platform",
    "footer.menu.umy_web": "UMY Official Website",
    "footer.menu.umy_mesin": "KKN UMY Portal",
    "footer.copyright": "© 2026 KKN GROUP 063. ALL RIGHTS RESERVED.",
    "footer.designed_by": "Designed for Community Impact by",

    // Gallery section keys (en)
    "gallery.badge": "VISUAL DIARY",
    "gallery.subtitle_sub": "A Journey Through Visual Stories",
    "gallery.heading_accent": "Stories",
    "gallery.description": "Every single photo holds a story of dedication, laughter, and solidarity during our community service. Click any photo to read the full story behind that moment.",
    "gallery.helper_text": "Click any photo to reveal event date & details",
    "gallery.photo1.title": "Program Work Socialization",
    "gallery.photo1.desc": "Presentation of KKN Group 063 work program plans to community leaders and residents to align empowerment goals.",
    "gallery.photo2.title": "Digital MSME Empowerment",
    "gallery.photo2.desc": "Assisting local micro-business owners in digitalizing payment systems (QRIS) and online marketing techniques.",
    "gallery.photo3.title": "Nutrition & Stunting Education",
    "gallery.photo3.desc": "Collaboration with the village Posyandu to socialize stunting prevention and demonstrate balanced healthy cooking.",
    "gallery.photo4.title": "Study Group & Creative Arts",
    "gallery.photo4.desc": "Fun study sessions, creative crafts, and coaching local children to express themselves through paint and handmade arts.",
    "gallery.photo5.title": "Farewell & Intimacy Night",
    "gallery.photo5.desc": "A warm closing ceremony with all villagers, filled with cultural arts performances, souvenir distributions, and prayers.",
    "gallery.photo6.title": "Environmental Clean-Up",
    "gallery.photo6.desc": "Collaboration with youth community to clean village sewers, plant local herbs, and paint environmental safety signboards.",
    "gallery.photo7.title": "Digital Literacy for Kids",
    "gallery.photo7.desc": "Teaching basic computational thinking, secure internet browsing, and simple office productivity tools to primary school students.",
    "gallery.photo8.title": "Village Admin Mapping",
    "gallery.photo8.desc": "Compiling demographic and spatial data to produce high-resolution geographic blueprints and administrative boundary maps for the village office.",
    "gallery.photo9.title": "Modern Agriculture Workshop",
    "gallery.photo9.desc": "Introducing innovative hydroponic systems and organic liquid fertilizers to local farmers to optimize crop yield in limited yards.",
    "gallery.photo10.title": "Cultural Heritage Preservation",
    "gallery.photo10.desc": "Compiling a documentary booklet of village history, folk songs, and traditional dance performances to preserve local heritage for upcoming generations.",
    "gallery.photo11.title": "Health Screening & Check-up",
    "gallery.photo11.desc": "Conducting free blood pressure, blood sugar, and health check-ups for elderly residents to promote active wellness.",
    "gallery.photo12.title": "Youth Creative Workshop",
    "gallery.photo12.desc": "Organizing creative painting and public speaking training with local youth to build confidence and artistic talent."
  },
  id: {
    // Nav & Tabs
    "nav.brand": "KKN PROJECT",
    "nav.brand_sub": "GROUP 063 UMY",
    "nav.campus": "GROUP 063 UMY",
    "nav.home": "BERANDA",
    "nav.kkn_workspace": "RUANG KERJA KKN",
    "nav.team_voices": "SUARA TIM",
    "nav.about": "TENTANG PROYEK",
    "nav.ingress": "Unggah Data",
    "nav.dashboard": "Performa",
    "nav.analytics": "Analisis",
    "nav.predict": "Prediksi",
    "nav.history": "Riwayat",
    "nav.workflow": "Alur Kerja",
    "nav.ethics": "Etika",
    "nav.twin": "Digital Twin",

    // Action buttons & state
    "btn.load": "Muat Spreadsheet",
    "btn.train": "Latih AutoML",
    "btn.learn": "Lab Virtual AI",
    "btn.start_predict": "Mulai Prediksi",
    "btn.upload_dataset": "Unggah Dataset",
    "btn.view_workflow": "Lihat Alur Kerja",
    "btn.clear_history": "Hapus Riwayat",
    "btn.delete": "Hapus",
    "btn.kkn_workspace": "Buka Workspace KKN",
    "btn.about_project": "Tentang Proyek",
    "btn.ai_education": "Edukasi AI",

    // Hero Section
    "hero.badge": "KKN PROJECT GROUP 063",
    "hero.title_part1": "KKN PERSYARIKATAN",
    "hero.title_part2": "MUHAMMADIYAH 063",
    "hero.title_part3": "UNITED IN SERVICE. DRIVEN BY IMPACT.",
    "hero.subtitle": "KKN Project is an integrated digital workspace for KKN Persyarikatan Muhammadiyah Group 063, Universitas Muhammadiyah Yogyakarta. It brings attendance, program planning, financial administration, reporting, documentation, and daily coordination into one connected system, strengthening solidarity, accountability, and meaningful community impact throughout the KKN journey.",
    "hero.chip_header": "ALGORITMA & RUANG KOMPUTASI YANG DIIMPLEMENTASIKAN",
    "globe.hud_title": "KONTROL TELEMETRI GEOGRAFIS 3D",
    "globe.hud_subtitle": "SISTEM PORTAL PERSYARIKATAN v2.0 // COBE CORE AKTIF",
    "globe.theme_label": "TEMA WARNA GLOBE",
    "globe.speed_label": "KONTROL KECEPATAN ROTASI",
    "globe.spawner_title": "SEBARKAN POSKO KKN BARU SECARA REAL-TIME",
    "globe.district_select": "1. PILIH WILAYAH KABUPATEN",
    "globe.label_input": "2. MASUKKAN LABEL TIM/POSKO",
    "globe.pulse_size": "UKURAN INTENSITAS DENYUT",
    "globe.log_idle": "Sistem siaga. Menunggu masukan konfigurasi posko taktis...",
    "globe.node_count": "TOTAL NODE INTI AKTIF",

    // Robot Background Section
    "background.badge": "Program Studi Teknik Mesin UMY • Akreditasi Unggul",
    "background.title": "LATAR BELAKANG AKADEMIK TEKNIK MESIN UMY",
    "background.subtitle": "Menerobos batas rekayasa teknik dengan mensinergikan ilmu mekanika tradisional, otomasi manufaktur industri, dan pemrosesan data cerdas berbasis kecerdasan buatan (Artificial Intelligence).",
    "background.tab_profile": "Profil Ringkas",
    "background.tab_lab": "Laboratorium",
    "background.tab_research": "Bidang Riset",
    "background.profile_title": "Menghubungkan Teori Eksperimen dengan Sains Komputasi Modern",
    "background.mission_tag": "Misi Utama",
    "background.mission_title": "Kurikulum Berstandar Internasional",
    "background.mission_desc": "Mengadaptasi sains teknik secara berkala untuk menempa lulusan unggul dalam spesialisasi desain mekanis, konversi energi ramah lingkungan, komposit inovatif, dan robotika manufaktur.",
    "background.ai_tag": "Integrasi Digital",
    "background.ai_title": "Sinergi Kecerdasan Buatan",
    "background.ai_desc": "Melalui kurikulum khusus dan tugas akhir rekayasa, mahasiswa dipersiapkan merancang model prediktif cerdas yang memetakan tegangan fisik material dan deteksi kerusakan rotor mesin.",
    "background.quote_desc": "\"Studi S1 Teknik Mesin UMY didukung penuh oleh infrastruktur laboratorium berspesifikasi tinggi di dalam kompleks Fakultas Teknik UMY yang asri dan modern.\"",
    "background.system_status": "STATUS MESIN DATA",
    "background.status_active": "● AKTIF ONLINE",
    "background.g6_lab_title": "Fasilitas Laboratorium Modern Gedung G6 UMY",
    "background.research_title": "Sinergi Konstruksi Fisik Teknik dan Komputasi Berperforma Tinggi",
    "background.campus_location": "Sinduadi/Kampus Terpadu UMY, Yogyakarta",
    "background.dept_footer": "INFRASTRUKTUR TEKNIK JURUSAN MESIN • FT-UMY",
    "background.department_vision": "Prodi Teknik Mesin UMY bertekad menghasilkan profesional yang memiliki kompetensi internasional, berjiwa wirausaha berlandaskan nilai-nilai luhur keislaman, serta menguasai digitalisasi industri 4.0 secara kokoh.",

    // About/Academic Section
    "academic.research_badge": "IKHTISAR PROYEK KKN",
    "academic.title": "WORKSPACE KKN TERPADU & PROFIL KELOMPOK",
    "academic.subtitle": "KKN Project adalah ruang kerja digital terpusat yang dikembangkan untuk PersyarikatanMu-063 guna mendukung koordinasi terstruktur, pengelolaan absensi, administrasi keuangan, perencanaan program, pelaporan, dokumentasi, dan eksekusi kolaboratif selama periode pelaksanaan KKN.",
    "about.tab1": "PROFIL KELOMPOK",
    "about.tab2": "CAKUPAN WORKSPACE",
    "about.tab3": "NILAI UTAMA",
    "about.cert_researcher": "PROFIL KELOMPOK KKN",
    "about.sub_campus": "Periode KKN",
    "about.course_dept": "Total Anggota",
    "about.academic_focus": "Fokus Utama",
    "about.active_nodes": "INFORMASI KELOMPOK",
    "about.thesis_title": "WORKSPACE DIGITAL UNTUK KOORDINASI, ADMINISTRASI, DAN PELAKSANAAN KKN KOLABORATIF",
    "about.thesis_subtitle": "PersyarikatanMu-063 | Universitas Muhammadiyah Yogyakarta",
    "about.map_title": "PETA SATELIT HD KOORDINAT LOKASI KKN",
    "about.map_label": "LOKASI KKN GROUP 063",
    "about.directions": "PETUNJUK ARAH",
    "about.contact_title": "HUBUNGI PENGEMBANG SECARA INTERAKTIF",
    "about.contact_desc": "Hubungi langsung ADMINISTRATOR untuk validasi kode, tinjauan akademis, dan pertanyaan teknik:",
    "about.institutional_nodes": "NODE UNIVERSITAS MUHAMMADIYAH",
    "about.umy_website": "Situs Resmi UMY",
    "about.krs_portal": "Portal KRS Akademik",
    "about.brand_core": "RINGKASAN PROYEK KKN",
    "about.focus_label": "IDENTITAS KELOMPOK",
    "about.focus_value": "PERSYARIKATANMU-063",
    "about.integrity_label": "STATUS WORKSPACE",
    "about.integrity_value": "SISTEM TERKOORDINASI PENUH",
    "about.abstract_part1": "KKN Project dirancang sebagai ruang kerja terintegrasi yang membantu PersyarikatanMu-063 mengelola aktivitas kelompok secara lebih terstruktur, transparan, dan akuntabel. Platform ini menghubungkan pelacakan absensi, perencanaan program kerja, administrasi keuangan, pelaporan, dokumentasi, dan koordinasi harian dalam satu lingkungan digital.",
    "about.abstract_part2": "Dengan memusatkan informasi operasional ke dalam satu sistem, KKN Project mendukung kerja tim yang lebih kuat, tanggung jawab yang lebih jelas, kolaborasi yang lebih efektif, dan keberlanjutan yang lebih baik dalam pelaksanaan program kerja berorientasi masyarakat selama periode KKN.",

    // Tab 2 Extra Translations (ID)
    "about.tab2.left_badge": "IKHTISAR WORKSPACE",
    "about.tab2.left_title": "MODUL KKN PROJECT",
    "about.tab2.left_strip_lbl": "STATUS SISTEM",
    "about.tab2.left_strip_val": "MODUL TERINTEGRASI",
    "about.tab2.left_subline": "Satu ruang kerja terhubung untuk semua operasi KKN yang penting",
    "about.tab2.left_table_title": "CAKUPAN SISTEM",
    "about.tab2.row1_val": "Rapat, kegiatan lapangan, dan partisipasi anggota",
    "about.tab2.row2_val": "Perencanaan, pelacakan kemajuan, dan tindakan lanjut",
    "about.tab2.row3_val": "Arus kas, pengeluaran kegiatan, dan dokumentasi keuangan",
    "about.tab2.row4_val": "Catatan harian, ringkasan mingguan, dan pelaporan terstruktur",
    "about.tab2.left_footer": "MODUL INTI KKN PROJECT",
    "about.tab2.right_badge": "CAKUPAN WORKSPACE",
    "about.tab2.right_title": "SATU PLATFORM UNTUK BERBAGAI KEBUTUHAN OPERASIONAL",
    "about.tab2.right_subtitle": "Sistem terintegrasi untuk pelaksanaan KKN yang terstruktur",
    "about.tab2.right_p1": "KKN Project menyediakan ruang kerja terpusat di mana semua fungsi utama KKN dapat dikelola dengan cara yang lebih terkoordinasi dan mudah diakses. Sistem ini membantu anggota memantau kehadiran, mengatur program kerja, mengelola keuangan, menyusun laporan, dan memelihara dokumentasi tanpa bergantung pada catatan manual yang tersebar.",
    "about.tab2.right_p2": "Dengan alur kerja digital yang terhubung, PersyarikatanMu-063 dapat mengurangi fragmentasi administratif, meningkatkan komunikasi internal, dan memperkuat keberlanjutan setiap kegiatan dari perencanaan hingga pelaporan.",
    "about.tab2.right_lbl_left": "CAKUPAN MODUL",
    "about.tab2.right_val_left": "KEHADIRAN • PROKER • KEUANGAN",
    "about.tab2.right_lbl_right": "NILAI OPERASIONAL",
    "about.tab2.right_val_right": "TERSTRUKTUR DAN AKUNTABEL",

    // Tab 3 Extra Translations (ID)
    "about.tab3.left_badge": "NILAI TIM",
    "about.tab3.left_title": "PERSYARIKATANMU-063",
    "about.tab3.left_strip_lbl": "KARAKTER KELOMPOK",
    "about.tab3.left_strip_val": "SOLID • KOMIT • BERTANGGUNG JAWAB",
    "about.tab3.left_subline": "Prinsip bersama yang memandu tim sepanjang perjalanan KKN",
    "about.tab3.left_table_title": "PRINSIP UTAMA",
    "about.tab3.row1_lbl": "Solidaritas",
    "about.tab3.row1_val": "Bekerja bersama dengan dukungan timbal balik dan tujuan bersama",
    "about.tab3.row2_lbl": "Komitmen",
    "about.tab3.row2_val": "Menjalankan tanggung jawab dengan disiplin dan konsistensi",
    "about.tab3.row3_lbl": "Tanggung Jawab",
    "about.tab3.row3_val": "Memastikan setiap tugas dan kontribusi dapat dipertanggungjawabkan",
    "about.tab3.row4_lbl": "Dampak",
    "about.tab3.row4_val": "Menciptakan nilai yang berarti bagi masyarakat",
    "about.tab3.left_footer": "SISTEM NILAI KELOMPOK",
    "about.tab3.right_badge": "NILAI UTAMA",
    "about.tab3.right_title": "SOLIDARITAS, KOMITMEN, DAN TINDAKAN BERTANGGUNG JAWAB",
    "about.tab3.right_subtitle": "Prinsip dasar PersyarikatanMu-063",
    "about.tab3.right_p1": "Kekuatan PersyarikatanMu-063 tidak hanya terletak pada tugas bersama, tetapi pada semangat solidaritas yang menghubungkan setiap anggota. KKN Project mencerminkan semangat ini dengan menyediakan ruang bersama di mana tanggung jawab, ide, dan kemajuan dapat dikelola secara kolektif.",
    "about.tab3.right_p2": "Komitmen dan tanggung jawab tetap menjadi pusat dari setiap kegiatan yang dilakukan oleh tim. Melalui koordinasi yang disiplin dan pelaksanaan yang akuntabel, PersyarikatanMu-063 berusaha menciptakan dampak masyarakat yang berarti sambil memperkuat kolaborasi dan kematangan organisasi.",
    "about.tab3.right_lbl_left": "PONDASI TIM",
    "about.tab3.right_val_left": "SOLIDARITAS DAN KOMITMEN",
    "about.tab3.right_lbl_right": "ORIENTASI MISI",
    "about.tab3.right_val_right": "DAMPAK MASYARAKAT",
    "workflow.badge": "Cetak Biru Sistem",
    "workflow.title": "Alur Kerja Operasional Sistem",
    "workflow.subtitle": "Skema langkah-demi-langkah modular yang merinci bagaimana MechAutoML AI memproses spreadsheet bahan mentah menjadi model teknik prediktif yang siap digunakan dengan akurasi tinggi.",
    "workflow.step1.title": "Unggah Dataset",
    "workflow.step2.title": "Pratinjau Dataset",
    "workflow.step3.title": "Seleksi Fitur & Target",
    "workflow.step4.title": "Pra-pemrosesan Data",
    "workflow.step5.title": "Pelatihan Model",
    "workflow.step6.title": "Evaluasi Model",
    "workflow.step7.title": "Analitik Visual",
    "workflow.step8.title": "Riwayat & Ekspor CSV",
    "workflow.step1.desc": "Pengguna mengalirkan spreadsheet teknik dalam format CSV atau XLSX yang berisi log data pengujian empiris ilmiah.",
    "workflow.step2.desc": "Pemetaan struktural otomatis dipicu untuk menentukan jumlah sel, kategori, dan distribusi nilai kosong (null).",
    "workflow.step3.desc": "Mahasiswa menentukan variabel pelatihan terpisah (X) dan menetapkan target prediksi numerik kontinu (Y).",
    "workflow.step4.desc": "Imputasi sel rata-rata otomatis dan penyandi label kategori string ditetapkan untuk mengamankan integritas matematis.",
    "workflow.step5.desc": "Mesin ML MECH AI melatih regressor Extra Trees, Oblivious CatBoost, dan XGBoost yang teregularisasi pada pembagian data 80%.",
    "workflow.step6.desc": "Perhitungan matematika menghasilkan nilai R², MAE, RMSE, dan MAPE pada data validasi 20% yang disimpan.",
    "workflow.step7.desc": "Sistem memetakan bagan sebar interaktif, bobot kontribusi fitur horizontal, dan kurva distribusi galat linear.",
    "workflow.step8.desc": "Prediksi disimpan di penyimpanan lokal, sehingga dapat dicari, dihapus, atau dikompilasi menjadi lembar CSV yang diunduh.",
    "workflow.methodology.badge": "Ringkasan Validasi & Metodologi",
    "workflow.methodology.text": "Arsitektur pemrosesan menetapkan jaringan pipa terstruktur penuh yang selaras dengan metodologi CRISP-DM. Data mentah yang diuraikan melalui pekerja berkas klien dipartisi secara bersih menggunakan vektor replikasi benih yang sesuai dengan pedoman riset institusional. Konsistensi deterministik ini memungkinkan anggota kelompok dan dewan riset mengaudit metrik secara berulang dengan 100% reproduksibilitas matematis.",
    "ethics.title": "Refleksi Etis & Batasan Teknis",
    "ethics.subtitle": "Analisis akademis inti mengenai batasan, risiko keamanan, tanggung jawab, dan pedoman penerapan algoritma Kecerdasan Buatan ke dalam sistem mekanis fisik.",
    "ethics.p1.title": "Ketergantungan pada Kualitas Empiris",
    "ethics.p1.desc": "Model prediksi AI sepenuhnya bergantung pada kualitas, ukuran, dan relevansi dataset yang diunggah. Garbage in, garbage out - jika pembacaan empiris tidak memiliki presisi fisis, prediksi mesin akan gagal.",
    "ethics.p2.title": "Probabilitas Statistik, Bukan Kebenaran Mutlak",
    "ethics.p2.desc": "Model machine learning menghasilkan estimasi statistik berdasarkan pola data yang dipelajari, bukan hukum fisika mutlak. Mereka tidak memiliki kesadaran fisis tentang termodinamika material atau formula cairan struktural dan tidak boleh diperlakukan sebagai fakta mutlak.",
    "ethics.p3.title": "Validasi Teoretis & Eksperimental",
    "ethics.p3.desc": "Hasil prediksi harus selalu divalidasi menggunakan teori teknik standar (seperti perhitungan tegangan, analisis elemen hingga, atau hukum Hooke), pengujian laboratorium fisik, atau inspeksi akademis ahli.",
    "ethics.p4.title": "Mitigasi Bias Statistik",
    "ethics.p4.desc": "Dataset berkualitas buruk, batas yang sangat miring, atau vektor uji yang sempit akan menghasilkan model yang sangat bias. Peneliti bertanggung jawab untuk menyeimbangkan profil masukan guna mencegah estimasi yang menyesatkan.",
    "ethics.p5.title": "Pendukung Keputusan, Bukan Pengambil Keputusan",
    "ethics.p5.desc": "MechAutoML AI harus bertindak murni sebagai alat pembelajaran dan modul pendukung keputusan pembantu, bukan sebagai satu-satunya sumber keputusan desain komponen struktural, manufaktur kritis, atau kedirgantaraan.",
    "ethics.p6.title": "Kerahasiaan Data & Privasi",
    "ethics.p6.desc": "Hindari mengunggah dataset eksperimen industri yang sensitif atau berhak milik. Semua operasi diproses secara lokal di dalam browser untuk melindungi privasi dasar, namun batasan akademis menuntut berbagi berkas secara hati-hati.",
    "ethics.signoff.title": "PERNYATAAN TANGGUNG JAWAB MAHASISWA & PENELITIAN",
    "ethics.signoff.desc": "\"Sebagai mahasiswa dan praktisi teknik, pengawasan manusia merupakan pengaman akhir. Alat AI menyediakan perhitungan statistik yang kuat, tetapi penalaran fisik yang ahli dan hukum mekanika yang ditinjau oleh rekan sejawat tetap menjadi pilar mutlak dari keunggulan rekayasa teknik profesional.\"",
    "ethics.signoff.meta": "ADMINISTRATOR | Dibuat oleh KKN Group 063",
    "upload.pipeline_badge": "Saluran Konstruksi Mesin Interaktif",
    "upload.workspace_title": "MechAutoML Center",
    "upload.workspace_desc": "Platform machine learning presisi tinggi untuk diagnostik teknik modern. Unggah berkas data Anda, atur parameter fitur, latih estimator otomatis, dan ekspor lembar analisis dengan mudah.",
    "upload.ingested_workspace": "Ruang Kerja Terunggah",
    "upload.rows": "baris",
    "upload.properties": "properti",
    "upload.ingest_data": "Asupan Data",
    "upload.define_matrices": "Tentukan Matriks",
    "upload.model_selection": "Seleksi Model",
    "upload.ai_compiler": "Kompilator AI",
    "upload.preview_data": "Pratinjau Data",
    "upload.ingesting_workbook": "Mengimpor Dataset Lembar Kerja",
    "upload.running_diagnostic": "Menjalankan Penguraian Diagnostik AI",
    "upload.analyzing_variables": "Menganalisis variabel dataset, mengukur matriks jarang, dan mengindeks parameter teknik...",
    "upload.ingest_deck_title": "Dek Unggah Spreadsheet (Mendukung xlsx, csv, zip)",
    "upload.registry_title": "Dek Repositori Telemetri Kerja Aktif",
    "upload.registry_desc": "Klik kartu lembar untuk menjadikannya pratinjau aktif. Pilih beberapa lembar untuk menjalankan penggabungan data sintetis.",
    "upload.worksheets_loaded": "lembar kerja dimuat",
    "fu.drop_title": "Letakkan file CSV, Excel, atau ZIP Anda di sini",
    "fu.drop_subtitle": "Mendukung penuh penguraian data otomatis · Maks {size} per dataset",
    "fu.ingest_button": "Asup lembar kerja",
    "fu.active_session": "Berkas Masuk Sesi Aktif",
    "fu.search_placeholder": "Cari antrean asupan...",
    "fu.deregister_selected": "Hapus Pendaftar Terpilih",
    "fu.table_header_pipeline": "Saluran Lembar Kerja",
    "fu.table_header_subtype": "Subtipe",
    "fu.table_header_size": "Ukuran Byte",
    "fu.table_header_operations": "Operasi",
    "fu.selected_count": "{selected} dari {total} berkas termuat dipilih",

    // Faculty Notes Section
    "faculty.badge": "KUTIPAN ANGGOTA KKN",
    "faculty.title": "Suara PersyarikatanMu-063",
    "faculty.subtitle": "Kata-kata inspiratif dari anggota PersyarikatanMu-063, mencerminkan solidaritas, tanggung jawab, kerja sama tim, dan semangat pengabdian masyarakat selama perjalanan KKN.",
    "lecturer.comment": "KUTIPAN ANGGOTA",
    "lecturer.num": "ANGGOTA",
    "lecturer.title_badge": "ANGGOTA KKN",
    "lecturer.tip": "KLIK KARTU UNTUK MELIHAT KUTIPAN ANGGOTA",
    "lecturer.status": "ANGGOTA KKN",
    "lecturer.dismiss": "TUTUP",

    // Course branding
    "footer.course": "KKN PERSYARIKATAN MUHAMMADIYAH 063",
    "footer.institution": "UNIVERSITAS MUHAMMADIYAH YOGYAKARTA",
    "footer.creator": "KKN GROUP 063",

    // Sub Navigation buttons
    "subnav.ingest": "Asupan Data Spreadsheet",
    "subnav.settings": "Pengaturan Seleksi Fitur",
    "subnav.automl": "Pelatihan AutoML Utama",
    "subnav.dashboard_title": "Dasbor Kinerja Model",
    "subnav.analytics_title": "Analitik Visual Presisi",

    // Labs names
    "lab.comp": "Laboratorium Komputer & Gambar Keahlian",
    "lab.comp_desc": "Simulasi CAD/CAM/CAE dan optimasi desain mesin berbasis HPC serta integrasi algoritma kecerdasan buatan.",
    "lab.cnc": "Laboratorium CNC & Otomasi Manufaktur",
    "lab.cnc_desc": "Praktikum presisi mesin bubut CNC, milling berkecepatan tinggi, dan pemrograman program perkakas otomatis.",
    "lab.energy": "Laboratorium Konvensi Energi & Fenomena Dasar",
    "lab.energy_desc": "Eksperimen dinamika fluida, perpindahan panas konvektif, turbin, pompa, dan kalibrasi motor bakar.",
    "lab.material": "Laboratorium Material Teknik & Metalurgi",
    "lab.material_desc": "Fokus pada pengujian kekerasan logam, kekuatan tarik, pemeriksaan metalografi, dan perlakuan panas.",

    // Research pillars
    "riset.title1": "Informatika Mekanika",
    "riset.text1": "Integrasi algoritma optimasi machine learning (Extra Trees, CatBoost, XGBoost) guna memprediksi keausan pahat potong CNC, laju korosi logam, dan efisiensi termal sistem energi.",
    "riset.title2": "Advanced Manufacturing",
    "riset.text2": "Riset mendalam otomasi kendali otonom perkakas, optimasi pemesinan cutting kecepatan tinggi, dan integrasi kembaran digital (digital twin) untuk menunjang manufaktur mesin nasional.",
    "riset.title3": "Material Berkelanjutan",
    "riset.text3": "Desain, pengujian kekuatan lelah dinamis, dan karakterisasi material komposit serat alam hayati lokal untuk komponen otomotif, struktur dirgantara, dan implan biomedis ramah lingkungan.",
    
    // Core capabilities
    "cap.title": "Kemampuan Utama Pemelajaran Mesin Terintegrasi",
    "cap.desc": "Setiap koordinat analitis dipetakan secara matematis berdasarkan pengukuran fisik nyata, dependensi matriks atribut, batasan model, dan galat residual.",

    // Alerts and Wizard Step 4 keys
    "alert.step_locked": "Langkah terkunci. Silakan selesaikan langkah sebelumnya secara berurutan terlebih dahulu.",
    "alert.load_workbook": "Silakan muat spreadsheet lembar kerja teknik mesin sebelum melanjutkan.",
    "alert.define_features": "Tentukan fitur prediktor (X) dan variabel target (Y) sebelum melanjutkan.",
    "alert.select_model": "Pilih minimal satu model machine learning sebelum melakukan kompilasi.",
    "btn.open_evaluation": "Buka Panel Evaluasi",
    "warning.title": "Notifikasi Diagnostik Pra-Kompilasi",

    // Education section keys (id)
    "edu.center_badge": "PUSAT STUDI AKADEMIK MECH-AI",
    "edu.header_title_gradient": "SUITE PENGETAHUAN AKADEMIK",
    "edu.header_subtitle": "Pelajari landasan inti ilmu kecerdasan buatan, alur algoritma AutoML di Teknik Mesin, dan perjalanan teknologi komputasi cerdas.",
    "edu.tab_basics": "Dasar AI",
    "edu.tab_system": "Cara Kerja AI",
    "edu.tab_evolution": "Evolusi AI",
    "edu.tab_sandbox": "Simulasi Sandbox",
    "edu.basics_pre": "MATERI PEMBELAJARAN INTI",
    "edu.basics_title": "KONSEP UTAMA DALAM KECERDASAN BUATAN",
    "edu.basics_subtitle": "Berikut penjelasan mengenai empat pilar epistemologi dasar untuk penerapan kecerdasan buatan dalam bidang teknik.",
    "edu.system_pre": "ALUR EKSEKUSI WORKFLOW",
    "edu.system_title": "BAGAIMANA SISTEM AI MEMBACA DATA & BEROPERASI?",
    "edu.system_subtitle": "Berikut adalah alur siklus hidup proses mulai dari asupan spreadsheet biner hingga prediksi presisi tinggi dalam MechAutoML.",
    "edu.phase_prefix": "Tahap",
    "edu.synthesis_title": "Sintesis Model AutoML & Prediksi Cerdas",
    "edu.synthesis_subtitle": "Teknologi Mech-AI memanfaatkan iterasi bertingkat di mana estimasi Extra Trees dimurnikan secara serial oleh mesin XGBoost dinamis untuk mencegah ketergantungan pada algoritme tunggal.",
    "edu.evolution_pre": "KRONOLOGI SEJARAH",
    "edu.evolution_title": "SEJARAH DAN TAHAP EVOLUSI KECERDASAN BUATAN DARI TAHUN KE TAHUN",
    "edu.evolution_subtitle": "Berikut adalah runutan evolusi kecerdasan buatan mulai dari teori mesin automata logis hingga sistem automated machine learning (AutoML) modern.",
    "edu.sandbox_pre": "SIMULASI INTERAKTIF",
    "edu.sandbox_title": "SUDUT MAHASISWA: SANDBOX PREDIKTOR INTERAKTIF",
    "edu.sandbox_subtitle": "Gunakan kontrol di bawah untuk mensimulasikan bagaimana kualitas dataset dan parameter model memengaruhi bobot performa dan akurasi prediksi ML.",
    "edu.sandbox_lbl_manipulate": "TUNING MODEL DEK PERANGKAT KERAS NEUMORPHIC 3D OTOMATIS",
    "edu.param_cleanliness": "INDEKS KEMURNIAN DATASET",
    "edu.param_cleanliness_desc": "Mengurangi outlier, deviasi standar kesalahan dari atribut fitur.",
    "edu.param_complexity": "KEDALAMAN POHON ESTIMATOR (MAX_DEPTH)",
    "edu.param_complexity_desc": "Mengonfigurasi batas pembagian lapisan kompleks untuk mengunci bobot non-linear.",
    "edu.param_normalization": "INDEKS NORMALISASI / SKALA (MinMax)",
    "edu.param_normalization_desc": "Menyelaraskan jangkauan numerik fitur agar jalur konvergensi stabil.",
    "edu.lbl_sel_algo": "PILIH METODE ALGORITMA DASAR",
    "edu.gauge_title": "ESTIMASI PREDIKSI MODEL AKHIR",
    "edu.lbl_outlier": "Estimasi Variansi Outlier",
    "edu.lbl_convergence": "Tahapan Konvergensi Model",
    "edu.lbl_optimality": "Batas Akurasi Estimasi",
    "edu.status_optimal": "SANGAT OPTIMAL",
    "edu.status_suboptimal": "SUBOPTIMAL (DERAU DATA)",
    "edu.sandbox_lesson": "Meningkatkan kedalaman pohon pada data berderau menyebabkan overfitting (variansi tinggi). Kalibrasi pra-pemrosesan yang bersih (Purity > 80%) menjadi kunci akurasi implementasi dunia nyata.",
    "edu.card1_topic": "Teori Automata",
    "edu.card1_title": "1. Representasi Fitur",
    "edu.card1_desc": "Cara representasi angka biner menjadi nilai kontinu dari karakteristik fisik logam presisi.",
    "edu.card1_badge": "Fisika Cerdas",
    "edu.card1_sub": "LAB TEKNIK",
    "edu.card2_topic": "Matematika Sistem",
    "edu.card2_title": "2. Fungsi Kerugian (Loss)",
    "edu.card2_desc": "Mengukur besarnya deviasi antara nilai prediksi model AI dengan data sesungguhnya menggunakan MAE/RMSE.",
    "edu.card2_badge": "Akurasi Statistik",
    "edu.card2_sub": "UMY MESIN",
    "edu.card3_topic": "Etika Komputasi",
    "edu.card3_title": "3. Validasi Otonom",
    "edu.card3_desc": "Kombinasi model dalam ensemble ditujukan untuk mendistribusikan simpangan secara rata demi integritas keputusan akademik.",
    "edu.card3_badge": "Teras KKN Group 063",

    // Footer section keys (id)
    "footer.excellence": "PENGABDIAN MASYARAKAT TERPADU",
    "footer.menu.workspace": "Ruang Kerja Proyek KKN",
    "footer.menu.training": "Platform Program Kerja",
    "footer.menu.umy_web": "Situs Web Resmi UMY",
    "footer.menu.umy_mesin": "Portal KKN UMY",
    "footer.copyright": "© 2026 KKN GROUP 063. HAK CIPTA DILINDUNGI PENUH.",
    "footer.designed_by": "Dirancang untuk Dampak Masyarakat oleh",

    // Gallery section keys (id)
    "gallery.badge": "CATATAN VISUAL",
    "gallery.subtitle_sub": "Menyusuri Kisah Lewat Gambar",
    "gallery.heading_accent": "Kenangan",
    "gallery.description": "Setiap lembar gambar menyimpan kisah perjuangan, tawa, dan rasa kebersamaan kami selama mengabdi di masyarakat. Klik gambar untuk membaca cerita lengkap dibalik momen tersebut.",
    "gallery.helper_text": "Klik foto untuk melihat tanggal acara & detail cerita",
    "gallery.photo1.title": "Sosialisasi Program Kerja",
    "gallery.photo1.desc": "Pemaparan rencana program kerja KKN kelompok 063 kepada para tokoh masyarakat dan warga dusun untuk menyelaraskan tujuan pemberdayaan.",
    "gallery.photo2.title": "Pemberdayaan UMKM Digital",
    "gallery.photo2.desc": "Pendampingan pelaku usaha mikro kecil menengah setempat dalam digitalisasi sistem pembayaran (QRIS) serta teknik pemasaran online.",
    "gallery.photo3.title": "Penyuluhan Gizi & Stunting",
    "gallery.photo3.desc": "Kolaborasi bersama Posyandu mengadakan sosialisasi pencegahan stunting dan demo memasak makanan bergizi seimbang untuk balita.",
    "gallery.photo4.title": "Bimbingan Belajar & Seni",
    "gallery.photo4.desc": "Sesi bimbingan belajar menyenangkan, prakarya kreatif, dan melatih anak-anak dusun mengekspresikan diri lewat lukisan dan kerajinan tangan.",
    "gallery.photo5.title": "Malam Keakraban & Pelepasan",
    "gallery.photo5.desc": "Malam penutupan yang hangat bersama seluruh warga desa, diisi dengan pertunjukan seni, pembagian kenang-kenangan, dan doa bersama.",
    "gallery.photo6.title": "Gotong Royong Kebersihan Lingkungan",
    "gallery.photo6.desc": "Kolaborasi bersama pemuda desa untuk membersihkan saluran air, menanam tanaman obat keluarga (TOGA), dan mengecat papan himbauan lingkungan.",
    "gallery.photo7.title": "Literasi Digital Anak Bangsa",
    "gallery.photo7.desc": "Edukasi pengenalan dasar komputer, berselancar internet sehat dan aman, serta penggunaan aplikasi perkantoran sederhana bagi siswa sekolah dasar.",
    "gallery.photo8.title": "Pemetaan Administrasi Desa",
    "gallery.photo8.desc": "Penyusunan peta batas wilayah administratif desa serta visualisasi data demografi penduduk berbasis digital untuk efisiensi administrasi desa.",
    "gallery.photo9.title": "Pelatihan Pertanian Modern",
    "gallery.photo9.desc": "Sosialisasi metode hidroponik sederhana dan pembuatan pupuk organik cair bersama kelompok tani untuk memaksimalkan hasil kebun warga.",
    "gallery.photo10.title": "Pelestarian Budaya Lokal",
    "gallery.photo10.desc": "Pendokumentasian sejarah dusun, lagu rakyat, serta kesenian tari tradisional dalam bentuk buklet digital guna melestarikan warisan leluhur.",
    "gallery.photo11.title": "Pemeriksaan Kesehatan Gratis",
    "gallery.photo11.desc": "Penyelenggaraan cek tensi, gula darah, dan konsultasi kesehatan gratis bagi warga lansia guna meningkatkan kesadaran hidup sehat.",
    "gallery.photo12.title": "Lokakarya Kreatif Kepemudaan",
    "gallery.photo12.desc": "Menyelenggarakan pelatihan melukis kreatif dan public speaking bersama remaja dusun untuk melatih kepercayaan diri dan bakat seni."
  }
};

const LECTURER_COMMENTS_DATA = {
  id: [
    {
      name: "Ananda Nur Daffa Zain",
      quote: "Kerja sama tim yang hebat dimulai dengan tanggung jawab, tumbuh melalui komitmen, dan menciptakan dampak melalui tindakan.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Ananda_Nur_Daffa_Zain_bjqskz.jpg"
    },
    {
      name: "Syafito Denova",
      quote: "Solidaritas bukan hanya tentang tetap bersama, tetapi tentang bergerak maju dengan tujuan yang sama.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Syafito_Denova_v7hg3i.jpg"
    },
    {
      name: "Reyval Filzah Padatu",
      quote: "Setiap kontribusi kecil menjadi berarti ketika dilakukan dengan tulus untuk masyarakat.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Reyval_Filzah_Padatu_tgx2es.jpg"
    },
    {
      name: "Praditha Ameliya Syaharani",
      quote: "KKN bukan hanya tentang menyelesaikan program, tetapi tentang belajar melayani dengan empati dan tujuan.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Praditha_Ameliya_Syaharani_s3sr6i.jpg"
    },
    {
      name: "Himawan Panuntun",
      quote: "Komitmen mengubah perencanaan menjadi kemajuan, dan kerja sama tim mengubah kemajuan menjadi dampak nyata.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Himawan_Panuntun_zsqmmq.jpg"
    },
    {
      name: "Zafirotut Thoyyibah",
      quote: "Bekerja bersama dengan disiplin dan kepedulian adalah fondasi dari pengabdian masyarakat yang berarti.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Zafirotut_Thoyyibah_svrusn.jpg"
    },
    {
      name: "Dian Wahyu Saputro",
      quote: "Tanggung jawab adalah kekuatan yang menjaga setiap misi kolektif bergerak ke arah yang benar.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Dian_Wahyu_Saputro_tpjoag.jpg"
    },
    {
      name: "Diana Puspita Sari",
      quote: "Dampak dimulai ketika pengetahuan, ketulusan, dan kerja sama memenuhi kebutuhan masyarakat.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Diana_Puspita_Sari_ly75za.jpg"
    },
    {
      name: "Muhammad Damar Hasta Putra",
      quote: "Semangat KKN hidup dalam setiap upaya untuk berkontribusi, berkolaborasi, dan tumbuh bersama.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Muhammad_Damar_Hasta_Putra_l04kzh.jpg"
    },
    {
      name: "Olivia Salsabila Zahra",
      quote: "KKN mengajarkan kita bahwa pengabdian, persatuan, dan konsistensi dapat menciptakan nilai abadi bagi orang lain.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Olivia_Salsabila_Zahra_pqsuus.jpg"
    }
  ],
  en: [
    {
      name: "Ananda Nur Daffa Zain",
      quote: "Great teamwork begins with responsibility, grows through commitment, and creates impact through action.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Ananda_Nur_Daffa_Zain_bjqskz.jpg"
    },
    {
      name: "Syafito Denova",
      quote: "Solidarity is not only about staying together, but about moving forward with the same purpose.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Syafito_Denova_v7hg3i.jpg"
    },
    {
      name: "Reyval Filzah Padatu",
      quote: "Every small contribution becomes meaningful when it is done sincerely for the community.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Reyval_Filzah_Padatu_tgx2es.jpg"
    },
    {
      name: "Praditha Ameliya Syaharani",
      quote: "KKN is not only about completing programs, but about learning to serve with empathy and purpose.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Praditha_Ameliya_Syaharani_s3sr6i.jpg"
    },
    {
      name: "Himawan Panuntun",
      quote: "Commitment turns planning into progress, and teamwork turns progress into real impact.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Himawan_Panuntun_zsqmmq.jpg"
    },
    {
      name: "Zafirotut Thoyyibah",
      quote: "Working together with discipline and care is the foundation of meaningful community service.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Zafirotut_Thoyyibah_svrusn.jpg"
    },
    {
      name: "Dian Wahyu Saputro",
      quote: "Responsibility is the strength that keeps every collective mission moving in the right direction.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Dian_Wahyu_Saputro_tpjoag.jpg"
    },
    {
      name: "Diana Puspita Sari",
      quote: "Impact begins when knowledge, sincerity, and cooperation meet the needs of the community.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Diana_Puspita_Sari_ly75za.jpg"
    },
    {
      name: "Muhammad Damar Hasta Putra",
      quote: "The spirit of KKN lives in every effort to contribute, collaborate, and grow together.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Muhammad_Damar_Hasta_Putra_l04kzh.jpg"
    },
    {
      name: "Olivia Salsabila Zahra",
      quote: "KKN teaches us that service, unity, and consistency can create lasting value for others.",
      src: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Olivia_Salsabila_Zahra_pqsuus.jpg"
    }
  ]
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("mechautoml_language");
      if (stored === "en" || stored === "id") return stored;
    } catch (e) {}
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("mechautoml_language", lang);
    } catch (e) {}
  };

  const t = (key: string, defaultEnglish?: string): string => {
    const translation = translations[language]?.[key];
    if (translation) return translation;
    
    // Fallback logic
    if (language === "en") {
      return defaultEnglish || key;
    } else {
      // Find translated key or map logically if missing in explicit dict
      const idStr = translations["id"]?.[key];
      if (idStr) return idStr;
      return defaultEnglish || key;
    }
  };

  const lecturerComments = LECTURER_COMMENTS_DATA[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, lecturerComments }}>
      {children}
    </LanguageContext.Provider>
  );
};
