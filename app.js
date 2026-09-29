/**
 * RESUMECRAFT - Interactive Resume Builder Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Supabase Configuration
  const SUPABASE_URL = 'https://byzzybvdqhpbtidwgukr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5enp5YnZkcWhwYnRpZHdndWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjAxMzEsImV4cCI6MjEwNjIzNjEzMX0.BqQw7j4Fii0LyQxWP27GCVUkOQgk4n-iHnPUQBHGdmg';
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  // Application State
  const state = {
    template: 'colorful', // 'colorful' | 'plain'
    avatarUrl: '',
    zoom: 1.0,
    skills: [],
    experiences: [],
    educations: [],
    projects: [],
    certifications: [],
    currentUser: null,
    pendingActionAfterAuth: null,
    authMode: 'signin' // 'signin' | 'signup'
  };

  // Sample Data for 1-click preview
  const sampleData = {
    fullName: "Alex Morgan",
    jobTitle: "Senior Full-Stack & Cloud Engineer",
    email: "alex.morgan@techcloud.io",
    phone: "+1 (555) 782-9301",
    location: "San Francisco, CA (Open to Remote)",
    website: "https://alexmorgan.dev",
    linkedin: "linkedin.com/in/alexmorgan-dev",
    github: "github.com/alexmorgan-code",
    summary: "High-impact Full-Stack Engineer with 6+ years of experience architecting distributed cloud systems, modern React frontends, and resilient microservices. Proven track record boosting system throughput by 45% and leading cross-functional teams to deliver enterprise-grade web applications.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    skills: [
      "JavaScript (ES6+)", "TypeScript", "React & Next.js", "Node.js", 
      "Python", "PostgreSQL", "Docker & Kubernetes", "AWS (EC2, S3, Lambda)", 
      "GraphQL & REST APIs", "CI/CD & DevOps", "System Architecture", "Tailwind CSS"
    ],
    experiences: [
      {
        id: "exp-1",
        role: "Senior Software Engineer",
        company: "Starlight Cloud Systems",
        location: "San Francisco, CA",
        startDate: "2022",
        endDate: "Present",
        description: "• Architected event-driven microservices processing 12M+ daily requests with 99.99% uptime.\n• Spearheaded migration of legacy monolith to React and GraphQL, reducing bundle sizes by 38%.\n• Mentored 6 junior/mid-level engineers and established strict unit and end-to-end testing standards."
      },
      {
        id: "exp-2",
        role: "Full-Stack Software Engineer",
        company: "Nexus Digital Labs",
        location: "Austin, TX",
        startDate: "2019",
        endDate: "2022",
        description: "• Developed responsive customer-facing portals supporting over 450,000 active monthly users.\n• Implemented secure Stripe payment processing pipelines generating $14M in annual transaction volume.\n• Automated CI/CD pipelines via GitHub Actions, accelerating release cycles from bi-weekly to daily."
      }
    ],
    educations: [
      {
        id: "edu-1",
        degree: "B.S. in Computer Science",
        school: "University of California, Berkeley",
        location: "Berkeley, CA",
        year: "2015 - 2019",
        details: "Graduated with Honors (Magna Cum Laude). Focus on Distributed Systems & Algorithms."
      }
    ],
    projects: [
      {
        id: "proj-1",
        name: "CloudScale Monitoring Engine",
        tech: "Go, React, Docker, Prometheus",
        link: "github.com/alexmorgan/cloudscale",
        description: "Real-time telemetry and metrics visualization dashboard handling 50k metrics/sec with automated alerting."
      },
      {
        id: "proj-2",
        name: "DevSprint AI Assistant",
        tech: "TypeScript, Next.js, OpenAI API, Vector DB",
        link: "devsprint-ai.app",
        description: "Contextual developer productivity assistant helping engineering teams summarize Jira epics and generate code test suites."
      }
    ],
    certifications: [
      {
        id: "cert-1",
        title: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services (2023)"
      },
      {
        id: "cert-2",
        title: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation (CNCF, 2022)"
      }
    ]
  };

  // DOM Elements
  const resumeDoc = document.getElementById('resume-document');
  const templateBtns = document.querySelectorAll('.template-btn');
  const currentTemplateLabel = document.getElementById('current-template-label');
  const generateBtn = document.getElementById('generate-btn');
  const generateBottomBtn = document.getElementById('generate-bottom-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const previewDownloadBtn = document.getElementById('preview-download-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const clearFormBtn = document.getElementById('clear-form-btn');

  // Input Fields
  const fullNameInput = document.getElementById('fullName');
  const jobTitleInput = document.getElementById('jobTitle');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const locationInput = document.getElementById('location');
  const websiteInput = document.getElementById('website');
  const linkedinInput = document.getElementById('linkedin');
  const githubInput = document.getElementById('github');
  const summaryInput = document.getElementById('summary');

  // Photo
  const photoInput = document.getElementById('profile-photo-input');
  const avatarImg = document.getElementById('avatar-img');
  const avatarFallbackIcon = document.getElementById('avatar-fallback-icon');
  const removePhotoBtn = document.getElementById('remove-photo-btn');

  // Dynamic Lists
  const experienceList = document.getElementById('experience-list');
  const educationList = document.getElementById('education-list');
  const projectList = document.getElementById('project-list');
  const certificationsList = document.getElementById('certifications-list');
  const skillsTagCloud = document.getElementById('skills-tag-cloud');
  const skillsInput = document.getElementById('skills-input');
  const addSkillBtn = document.getElementById('add-skill-btn');

  // Add Item Buttons
  const addExpBtn = document.getElementById('add-experience-btn');
  const addEduBtn = document.getElementById('add-education-btn');
  const addProjBtn = document.getElementById('add-project-btn');
  const addCertBtn = document.getElementById('add-cert-btn');

  // Zoom
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const zoomLevelDisplay = document.getElementById('zoom-level');

  // Mobile Tabs
  const tabEdit = document.getElementById('tab-edit');
  const tabPreview = document.getElementById('tab-preview');
  const editorSection = document.getElementById('editor-section');
  const previewSection = document.getElementById('preview-section');

  // Accordion Logic
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('open');
    });
  });

  // Mobile Tabs Switching
  if (tabEdit && tabPreview) {
    tabEdit.addEventListener('click', () => {
      tabEdit.classList.add('active');
      tabPreview.classList.remove('active');
      editorSection.classList.remove('hide-mobile');
      previewSection.classList.add('hide-mobile');
    });

    tabPreview.addEventListener('click', () => {
      tabPreview.classList.add('active');
      tabEdit.classList.remove('active');
      previewSection.classList.remove('hide-mobile');
      editorSection.classList.add('hide-mobile');
    });
  }

  // --- PHOTO UPLOAD ---
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      state.avatarUrl = event.target.result;
      updateAvatarUI();
      renderResume();
      showToast('Profile photo uploaded', 'success');
    };
    reader.readAsDataURL(file);
  });

  removePhotoBtn.addEventListener('click', () => {
    state.avatarUrl = '';
    photoInput.value = '';
    updateAvatarUI();
    renderResume();
    showToast('Profile photo removed', 'info');
  });

  function updateAvatarUI() {
    if (state.avatarUrl) {
      avatarImg.src = state.avatarUrl;
      avatarImg.style.display = 'block';
      avatarFallbackIcon.style.display = 'none';
      removePhotoBtn.style.display = 'inline-block';
    } else {
      avatarImg.src = '';
      avatarImg.style.display = 'none';
      avatarFallbackIcon.style.display = 'block';
      removePhotoBtn.style.display = 'none';
    }
  }

  // --- TEMPLATE SWITCHING ---
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tmpl = btn.getAttribute('data-template');
      setTemplate(tmpl);
    });
  });

  function setTemplate(tmpl) {
    state.template = tmpl;
    templateBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-template') === tmpl);
    });

    resumeDoc.className = `resume-sheet theme-${tmpl}`;
    currentTemplateLabel.textContent = `Template: ${tmpl === 'colorful' ? 'Modern Blue' : 'Classic Plain (B&W)'}`;
    renderResume();
    showToast(`Switched to ${tmpl === 'colorful' ? 'Modern Blue' : 'Classic Plain'} Template!`, 'info');
  }

  // --- SKILLS TAG LOGIC ---
  function addSkill(text) {
    const clean = text.trim();
    if (!clean) return;
    const split = clean.split(',').map(s => s.trim()).filter(Boolean);
    split.forEach(s => {
      if (!state.skills.includes(s)) {
        state.skills.push(s);
      }
    });
    skillsInput.value = '';
    renderSkillsTags();
    renderResume();
  }

  function removeSkill(index) {
    state.skills.splice(index, 1);
    renderSkillsTags();
    renderResume();
  }

  function renderSkillsTags() {
    skillsTagCloud.innerHTML = '';
    if (state.skills.length === 0) {
      skillsTagCloud.innerHTML = '<span style="color: #94a3b8; font-size: 0.76rem; padding: 4px;">No skills added yet. Type above and click Add!</span>';
      return;
    }
    state.skills.forEach((skill, idx) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerHTML = `
        ${escapeHtml(skill)}
        <i class="fa-solid fa-xmark skill-tag-remove" data-idx="${idx}"></i>
      `;
      tag.querySelector('.skill-tag-remove').addEventListener('click', () => removeSkill(idx));
      skillsTagCloud.appendChild(tag);
    });
  }

  addSkillBtn.addEventListener('click', () => addSkill(skillsInput.value));
  skillsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillsInput.value);
    }
  });

  // --- DYNAMIC ITEMS HANDLERS ---
  // 1. Experience
  function createExpCard(data = {}) {
    const id = data.id || 'exp-' + Date.now() + Math.random().toString(36).substr(2, 4);
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.id = id;
    card.innerHTML = `
      <div class="dynamic-card-header">
        <span class="dynamic-card-title"><i class="fa-solid fa-briefcase"></i> Job Experience</span>
        <button type="button" class="card-remove-btn" title="Remove Experience"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group half-width">
          <label>Job Title / Role</label>
          <input type="text" class="exp-role" value="${escapeHtml(data.role || '')}" placeholder="e.g. Frontend Developer">
        </div>
        <div class="form-group half-width">
          <label>Company / Organization</label>
          <input type="text" class="exp-company" value="${escapeHtml(data.company || '')}" placeholder="e.g. Acme Corp">
        </div>
        <div class="form-group half-width">
          <label>Location</label>
          <input type="text" class="exp-location" value="${escapeHtml(data.location || '')}" placeholder="e.g. New York, NY">
        </div>
        <div class="form-group half-width">
          <label>Date Period</label>
          <input type="text" class="exp-dates" value="${escapeHtml(data.startDate && data.endDate ? `${data.startDate} - ${data.endDate}` : data.dates || '')}" placeholder="e.g. 2021 - Present">
        </div>
        <div class="form-group full-width">
          <label>Key Responsibilities & Achievements</label>
          <textarea class="exp-desc" rows="3" placeholder="• Led development of core features...&#10;• Increased system performance by 25%...">${escapeHtml(data.description || '')}</textarea>
        </div>
      </div>
    `;

    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      card.remove();
      renderResume();
    });

    card.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => renderResume());
    });

    return card;
  }

  addExpBtn.addEventListener('click', () => {
    experienceList.appendChild(createExpCard());
    renderResume();
  });

  // 2. Education
  function createEduCard(data = {}) {
    const id = data.id || 'edu-' + Date.now() + Math.random().toString(36).substr(2, 4);
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.id = id;
    card.innerHTML = `
      <div class="dynamic-card-header">
        <span class="dynamic-card-title"><i class="fa-solid fa-graduation-cap"></i> Education Entry</span>
        <button type="button" class="card-remove-btn" title="Remove Education"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group half-width">
          <label>Degree / Certificate</label>
          <input type="text" class="edu-degree" value="${escapeHtml(data.degree || '')}" placeholder="e.g. B.S. in Computer Science">
        </div>
        <div class="form-group half-width">
          <label>Institution / University</label>
          <input type="text" class="edu-school" value="${escapeHtml(data.school || '')}" placeholder="e.g. Harvard University">
        </div>
        <div class="form-group half-width">
          <label>Location</label>
          <input type="text" class="edu-location" value="${escapeHtml(data.location || '')}" placeholder="e.g. Cambridge, MA">
        </div>
        <div class="form-group half-width">
          <label>Graduation Year / Timeline</label>
          <input type="text" class="edu-year" value="${escapeHtml(data.year || '')}" placeholder="e.g. 2018 - 2022">
        </div>
        <div class="form-group full-width">
          <label>Honors / Details (Optional)</label>
          <input type="text" class="edu-details" value="${escapeHtml(data.details || '')}" placeholder="e.g. GPA 3.9/4.0, Magna Cum Laude">
        </div>
      </div>
    `;

    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      card.remove();
      renderResume();
    });

    card.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => renderResume());
    });

    return card;
  }

  addEduBtn.addEventListener('click', () => {
    educationList.appendChild(createEduCard());
    renderResume();
  });

  // 3. Projects
  function createProjCard(data = {}) {
    const id = data.id || 'proj-' + Date.now() + Math.random().toString(36).substr(2, 4);
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.id = id;
    card.innerHTML = `
      <div class="dynamic-card-header">
        <span class="dynamic-card-title"><i class="fa-solid fa-diagram-project"></i> Project</span>
        <button type="button" class="card-remove-btn" title="Remove Project"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group half-width">
          <label>Project Name</label>
          <input type="text" class="proj-name" value="${escapeHtml(data.name || '')}" placeholder="e.g. E-Commerce Platform">
        </div>
        <div class="form-group half-width">
          <label>Link / URL</label>
          <input type="text" class="proj-link" value="${escapeHtml(data.link || '')}" placeholder="e.g. github.com/user/project">
        </div>
        <div class="form-group full-width">
          <label>Technologies Used</label>
          <input type="text" class="proj-tech" value="${escapeHtml(data.tech || '')}" placeholder="e.g. React, Node.js, MongoDB, Docker">
        </div>
        <div class="form-group full-width">
          <label>Description</label>
          <textarea class="proj-desc" rows="2" placeholder="Brief summary of what the project does and your contribution...">${escapeHtml(data.description || '')}</textarea>
        </div>
      </div>
    `;

    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      card.remove();
      renderResume();
    });

    card.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => renderResume());
    });

    return card;
  }

  addProjBtn.addEventListener('click', () => {
    projectList.appendChild(createProjCard());
    renderResume();
  });

  // 4. Certifications
  function createCertCard(data = {}) {
    const id = data.id || 'cert-' + Date.now() + Math.random().toString(36).substr(2, 4);
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.id = id;
    card.innerHTML = `
      <div class="dynamic-card-header">
        <span class="dynamic-card-title"><i class="fa-solid fa-award"></i> Certification</span>
        <button type="button" class="card-remove-btn" title="Remove Certification"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group half-width">
          <label>Certification Name</label>
          <input type="text" class="cert-title" value="${escapeHtml(data.title || '')}" placeholder="e.g. AWS Solutions Architect">
        </div>
        <div class="form-group half-width">
          <label>Issuer / Year</label>
          <input type="text" class="cert-issuer" value="${escapeHtml(data.issuer || '')}" placeholder="e.g. Amazon Web Services (2023)">
        </div>
      </div>
    `;

    card.querySelector('.card-remove-btn').addEventListener('click', () => {
      card.remove();
      renderResume();
    });

    card.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => renderResume());
    });

    return card;
  }

  addCertBtn.addEventListener('click', () => {
    certificationsList.appendChild(createCertCard());
    renderResume();
  });

  // Real-time listener on static form inputs
  [fullNameInput, jobTitleInput, emailInput, phoneInput, locationInput, websiteInput, linkedinInput, githubInput, summaryInput].forEach(elem => {
    elem.addEventListener('input', () => renderResume());
  });

  // --- POPULATE DATA HELPERS ---
  function loadDataIntoUI(data) {
    fullNameInput.value = data.fullName || '';
    jobTitleInput.value = data.jobTitle || '';
    emailInput.value = data.email || '';
    phoneInput.value = data.phone || '';
    locationInput.value = data.location || '';
    websiteInput.value = data.website || '';
    linkedinInput.value = data.linkedin || '';
    githubInput.value = data.github || '';
    summaryInput.value = data.summary || '';

    state.avatarUrl = data.avatarUrl || '';
    updateAvatarUI();

    state.skills = [...(data.skills || [])];
    renderSkillsTags();

    // Experiences
    experienceList.innerHTML = '';
    (data.experiences || []).forEach(exp => {
      experienceList.appendChild(createExpCard(exp));
    });

    // Education
    educationList.innerHTML = '';
    (data.educations || []).forEach(edu => {
      educationList.appendChild(createEduCard(edu));
    });

    // Projects
    projectList.innerHTML = '';
    (data.projects || []).forEach(proj => {
      projectList.appendChild(createProjCard(proj));
    });

    // Certs
    certificationsList.innerHTML = '';
    (data.certifications || []).forEach(cert => {
      certificationsList.appendChild(createCertCard(cert));
    });

    renderResume();
  }

  // Sample data button click
  loadSampleBtn.addEventListener('click', () => {
    loadDataIntoUI(sampleData);
    showToast('Loaded sample resume data!', 'success');
  });

  // Clear form button click
  clearFormBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all resume fields?')) {
      loadDataIntoUI({
        fullName: '', jobTitle: '', email: '', phone: '', location: '',
        website: '', linkedin: '', github: '', summary: '', avatarUrl: '',
        skills: [], experiences: [], educations: [], projects: [], certifications: []
      });
      showToast('Form cleared', 'info');
    }
  });

  // Generate Resume Buttons
  const handleGenerate = () => {
    renderResume();
    showToast('✨ Resume generated and formatted!', 'success');

    // On mobile screens, automatically switch to preview tab so user sees result
    if (window.innerWidth <= 1024 && tabPreview) {
      tabPreview.click();
    }
  };

  generateBtn.addEventListener('click', handleGenerate);
  generateBottomBtn.addEventListener('click', handleGenerate);

  // --- RENDER RESUME DOCUMENT ---
  function renderResume() {
    const name = fullNameInput.value.trim() || 'Your Name';
    const title = jobTitleInput.value.trim() || 'Your Profession / Job Title';
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const loc = locationInput.value.trim();
    const web = websiteInput.value.trim();
    const linkedin = linkedinInput.value.trim();
    const github = githubInput.value.trim();
    const summary = summaryInput.value.trim();

    // Extract dynamic items
    const experiences = [];
    experienceList.querySelectorAll('.dynamic-card').forEach(card => {
      const role = card.querySelector('.exp-role').value.trim();
      const comp = card.querySelector('.exp-company').value.trim();
      const location = card.querySelector('.exp-location').value.trim();
      const dates = card.querySelector('.exp-dates').value.trim();
      const desc = card.querySelector('.exp-desc').value.trim();
      if (role || comp || desc) {
        experiences.push({ role, comp, location, dates, desc });
      }
    });

    const educations = [];
    educationList.querySelectorAll('.dynamic-card').forEach(card => {
      const degree = card.querySelector('.edu-degree').value.trim();
      const school = card.querySelector('.edu-school').value.trim();
      const location = card.querySelector('.edu-location').value.trim();
      const year = card.querySelector('.edu-year').value.trim();
      const details = card.querySelector('.edu-details').value.trim();
      if (degree || school) {
        educations.push({ degree, school, location, year, details });
      }
    });

    const projects = [];
    projectList.querySelectorAll('.dynamic-card').forEach(card => {
      const name = card.querySelector('.proj-name').value.trim();
      const link = card.querySelector('.proj-link').value.trim();
      const tech = card.querySelector('.proj-tech').value.trim();
      const desc = card.querySelector('.proj-desc').value.trim();
      if (name || desc) {
        projects.push({ name, link, tech, desc });
      }
    });

    const certifications = [];
    certificationsList.querySelectorAll('.dynamic-card').forEach(card => {
      const certTitle = card.querySelector('.cert-title').value.trim();
      const issuer = card.querySelector('.cert-issuer').value.trim();
      if (certTitle) {
        certifications.push({ certTitle, issuer });
      }
    });

    // Build contacts markup
    const contactsArr = [];
    if (email) contactsArr.push(`<span class="cv-contact-item"><i class="fa-regular fa-envelope"></i> ${escapeHtml(email)}</span>`);
    if (phone) contactsArr.push(`<span class="cv-contact-item"><i class="fa-solid fa-phone"></i> ${escapeHtml(phone)}</span>`);
    if (loc) contactsArr.push(`<span class="cv-contact-item"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(loc)}</span>`);
    if (web) contactsArr.push(`<span class="cv-contact-item"><i class="fa-solid fa-globe"></i> ${escapeHtml(cleanUrl(web))}</span>`);
    if (linkedin) contactsArr.push(`<span class="cv-contact-item"><i class="fa-brands fa-linkedin"></i> ${escapeHtml(cleanUrl(linkedin))}</span>`);
    if (github) contactsArr.push(`<span class="cv-contact-item"><i class="fa-brands fa-github"></i> ${escapeHtml(cleanUrl(github))}</span>`);

    const avatarHtml = state.avatarUrl ? `<img src="${state.avatarUrl}" class="cv-avatar" alt="${escapeHtml(name)}">` : '';

    // Render HTML based on current template
    let contentHtml = '';

    if (state.template === 'colorful') {
      // Modern Blue Template
      contentHtml = `
        <div class="cv-header">
          ${avatarHtml}
          <div class="cv-header-info">
            <h1 class="cv-name">${escapeHtml(name)}</h1>
            <div class="cv-title">${escapeHtml(title)}</div>
            ${contactsArr.length > 0 ? `<div class="cv-contacts">${contactsArr.join('')}</div>` : ''}
          </div>
        </div>

        <div class="cv-body">
          ${summary ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-user"></i> Professional Summary</div>
              <p class="cv-summary-text">${escapeHtml(summary)}</p>
            </div>
          ` : ''}

          ${experiences.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-briefcase"></i> Work Experience</div>
              ${experiences.map(exp => `
                <div class="cv-item">
                  <div class="cv-item-header">
                    <span class="cv-item-role">${escapeHtml(exp.role || 'Role')}</span>
                    ${exp.dates ? `<span class="cv-item-dates">${escapeHtml(exp.dates)}</span>` : ''}
                  </div>
                  <div class="cv-item-sub">
                    <strong>${escapeHtml(exp.comp || '')}</strong>
                    ${exp.location ? `<span class="cv-item-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(exp.location)}</span>` : ''}
                  </div>
                  ${exp.desc ? `<div class="cv-item-desc">${escapeHtml(exp.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${educations.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-graduation-cap"></i> Education</div>
              ${educations.map(edu => `
                <div class="cv-item">
                  <div class="cv-item-header">
                    <span class="cv-item-role">${escapeHtml(edu.degree || 'Degree')}</span>
                    ${edu.year ? `<span class="cv-item-dates">${escapeHtml(edu.year)}</span>` : ''}
                  </div>
                  <div class="cv-item-sub">
                    <strong>${escapeHtml(edu.school || '')}</strong>
                    ${edu.location ? `<span class="cv-item-location">${escapeHtml(edu.location)}</span>` : ''}
                  </div>
                  ${edu.details ? `<div class="cv-item-desc">${escapeHtml(edu.details)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${projects.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-diagram-project"></i> Key Projects</div>
              <div class="cv-project-grid">
                ${projects.map(proj => `
                  <div class="cv-project-card">
                    <div class="cv-project-name">
                      ${escapeHtml(proj.name)}
                      ${proj.link ? `<a href="${ensureHttp(proj.link)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                    </div>
                    ${proj.tech ? `<div class="cv-project-tech">${escapeHtml(proj.tech)}</div>` : ''}
                    ${proj.desc ? `<div class="cv-project-desc">${escapeHtml(proj.desc)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${state.skills.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-laptop-code"></i> Skills & Expertise</div>
              <div class="cv-skills-grid">
                ${state.skills.map(s => `<span class="cv-skill-badge">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${certifications.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title"><i class="fa-solid fa-award"></i> Certifications & Honors</div>
              ${certifications.map(c => `
                <div class="cv-item" style="padding-left: 0.85rem;">
                  <div class="cv-item-role" style="font-size: 0.86rem;">${escapeHtml(c.certTitle)}</div>
                  ${c.issuer ? `<div class="cv-item-sub" style="margin-bottom:0; font-size: 0.78rem;">${escapeHtml(c.issuer)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Classic Plain Template (Strictly Black & White / ATS Minimal)
      contentHtml = `
        <div class="cv-header">
          ${avatarHtml}
          <h1 class="cv-name">${escapeHtml(name)}</h1>
          <div class="cv-title">${escapeHtml(title)}</div>
          ${contactsArr.length > 0 ? `<div class="cv-contacts">${contactsArr.join('')}</div>` : ''}
        </div>

        <div class="cv-body">
          ${summary ? `
            <div class="cv-section">
              <div class="cv-section-title">Professional Summary</div>
              <p class="cv-summary-text">${escapeHtml(summary)}</p>
            </div>
          ` : ''}

          ${experiences.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Professional Experience</div>
              ${experiences.map(exp => `
                <div class="cv-item">
                  <div class="cv-item-header">
                    <span class="cv-item-role">${escapeHtml(exp.role || 'Role')} — ${escapeHtml(exp.comp || '')}</span>
                    ${exp.dates ? `<span class="cv-item-dates">${escapeHtml(exp.dates)}</span>` : ''}
                  </div>
                  ${exp.location ? `<div class="cv-item-sub">${escapeHtml(exp.location)}</div>` : ''}
                  ${exp.desc ? `<div class="cv-item-desc">${escapeHtml(exp.desc)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${educations.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Education</div>
              ${educations.map(edu => `
                <div class="cv-item">
                  <div class="cv-item-header">
                    <span class="cv-item-role">${escapeHtml(edu.degree || 'Degree')} — ${escapeHtml(edu.school || '')}</span>
                    ${edu.year ? `<span class="cv-item-dates">${escapeHtml(edu.year)}</span>` : ''}
                  </div>
                  ${edu.location || edu.details ? `<div class="cv-item-sub">${[edu.location, edu.details].filter(Boolean).map(escapeHtml).join(' | ')}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${projects.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Key Projects</div>
              <div class="cv-project-grid">
                ${projects.map(proj => `
                  <div class="cv-project-card">
                    <div class="cv-project-name">
                      ${escapeHtml(proj.name)}
                      ${proj.link ? `<span>(${escapeHtml(proj.link)})</span>` : ''}
                    </div>
                    ${proj.tech ? `<div class="cv-project-tech">${escapeHtml(proj.tech)}</div>` : ''}
                    ${proj.desc ? `<div class="cv-project-desc">${escapeHtml(proj.desc)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${state.skills.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Core Competencies & Skills</div>
              <div class="cv-skills-grid">
                ${state.skills.map(s => `<span class="cv-skill-badge">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${certifications.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Certifications & Honors</div>
              ${certifications.map(c => `
                <div class="cv-item">
                  <div class="cv-item-role">${escapeHtml(c.certTitle)} ${c.issuer ? `<span style="font-weight: normal; font-size: 0.85em;">— ${escapeHtml(c.issuer)}</span>` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    resumeDoc.innerHTML = contentHtml;
  }

  // --- SUPABASE AUTHENTICATION & GATED DOWNLOAD ---

  // Auth DOM Elements
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const tabSigninBtn = document.getElementById('tab-signin-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const authAlert = document.getElementById('auth-alert');
  const authForm = document.getElementById('auth-form');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const pwdToggleBtn = document.getElementById('pwd-toggle-btn');
  const pwdToggleIcon = document.getElementById('pwd-toggle-icon');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSubmitText = document.getElementById('auth-submit-text');
  const authSubmitIcon = document.getElementById('auth-submit-icon');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  const authFooterPrompt = document.getElementById('auth-footer-prompt');
  const passwordHint = document.getElementById('password-hint');

  // Header Nav Auth Elements
  const navLoginBtn = document.getElementById('nav-login-btn');
  const userProfileBadge = document.getElementById('user-profile-badge');
  const userInitials = document.getElementById('user-initials');
  const userEmailText = document.getElementById('user-email-text');
  const navSignoutBtn = document.getElementById('nav-signout-btn');
  const saveCloudBtn = document.getElementById('save-cloud-btn');

  // Update Auth Header UI based on login status
  function updateAuthUI(user) {
    state.currentUser = user;
    if (user && user.email) {
      if (navLoginBtn) navLoginBtn.style.display = 'none';
      if (saveCloudBtn) saveCloudBtn.style.display = 'inline-flex';
      if (userProfileBadge) {
        userProfileBadge.style.display = 'flex';
        userEmailText.textContent = user.email;
        userInitials.textContent = user.email.charAt(0).toUpperCase();
      }
    } else {
      if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';
      if (saveCloudBtn) saveCloudBtn.style.display = 'none';
      if (userProfileBadge) userProfileBadge.style.display = 'none';
    }
  }

  // Show Auth Modal
  function showAuthModal(mode = 'signin', alertMessage = '') {
    state.authMode = mode;
    setAuthModeUI(mode);
    if (alertMessage) {
      showAuthAlert(alertMessage, 'info');
    } else {
      clearAuthAlert();
    }
    if (authModal) authModal.style.display = 'flex';
    setTimeout(() => { if (authEmail) authEmail.focus(); }, 100);
  }

  // Hide Auth Modal
  function hideAuthModal() {
    if (authModal) authModal.style.display = 'none';
    clearAuthAlert();
    if (authPassword) authPassword.value = '';
  }

  function setAuthModeUI(mode) {
    state.authMode = mode;
    if (mode === 'signin') {
      tabSigninBtn.classList.add('active');
      tabSignupBtn.classList.remove('active');
      authModalTitle.textContent = 'Sign In to Download';
      authModalSubtitle.textContent = 'ResumeCraft is free to use! Simply sign in or create an account to download your PDF resume.';
      authSubmitText.textContent = 'Sign In & Download PDF';
      authFooterPrompt.innerHTML = `Don't have an account yet? <a href="#" id="switch-to-signup">Sign up for free</a>`;
      passwordHint.style.display = 'none';
    } else {
      tabSignupBtn.classList.add('active');
      tabSigninBtn.classList.remove('active');
      authModalTitle.textContent = 'Create Free Account';
      authModalSubtitle.textContent = '100% Free! Create your account to download unlimited high-resolution resumes.';
      authSubmitText.textContent = 'Create Account & Download PDF';
      authFooterPrompt.innerHTML = `Already have an account? <a href="#" id="switch-to-signin">Sign in</a>`;
      passwordHint.style.display = 'block';
    }

    // Bind link clicks
    const switchSignup = document.getElementById('switch-to-signup');
    if (switchSignup) {
      switchSignup.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthModeUI('signup');
      });
    }
    const switchSignin = document.getElementById('switch-to-signin');
    if (switchSignin) {
      switchSignin.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthModeUI('signin');
      });
    }
  }

  function showAuthAlert(message, type = 'error') {
    if (!authAlert) return;
    authAlert.className = `auth-alert auth-alert-${type}`;
    const icon = type === 'error' ? 'fa-triangle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    authAlert.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    authAlert.style.display = 'flex';
  }

  function clearAuthAlert() {
    if (authAlert) {
      authAlert.style.display = 'none';
      authAlert.innerHTML = '';
    }
  }

  function setAuthLoading(loading) {
    if (!authSubmitBtn) return;
    authSubmitBtn.disabled = loading;
    if (loading) {
      authSubmitIcon.className = 'fa-solid fa-spinner fa-spin';
    } else {
      authSubmitIcon.className = 'fa-solid fa-arrow-right';
    }
  }

  // Password Visibility Toggle
  if (pwdToggleBtn && authPassword) {
    pwdToggleBtn.addEventListener('click', () => {
      const isPassword = authPassword.type === 'password';
      authPassword.type = isPassword ? 'text' : 'password';
      pwdToggleIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  // Tab buttons
  if (tabSigninBtn) tabSigninBtn.addEventListener('click', () => setAuthModeUI('signin'));
  if (tabSignupBtn) tabSignupBtn.addEventListener('click', () => setAuthModeUI('signup'));
  if (authModalClose) authModalClose.addEventListener('click', hideAuthModal);

  // Close modal when clicking on backdrop
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) hideAuthModal();
    });
  }

  // Header Nav Login / Signout buttons
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      state.pendingActionAfterAuth = null;
      showAuthModal('signin');
    });
  }

  if (navSignoutBtn) {
    navSignoutBtn.addEventListener('click', async () => {
      if (supabase) {
        await supabase.auth.signOut();
        updateAuthUI(null);
        showToast('You have signed out successfully', 'info');
      }
    });
  }

  // Submit Sign In / Sign Up
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabase) {
        showToast('Supabase client not initialized', 'error');
        return;
      }

      const email = authEmail.value.trim();
      const password = authPassword.value;

      if (!email || !password) {
        showAuthAlert('Please provide both email and password.');
        return;
      }

      setAuthLoading(true);
      clearAuthAlert();

      try {
        if (state.authMode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          setAuthLoading(false);

          if (error) {
            showAuthAlert(error.message || 'Failed to sign in. Please verify your credentials.');
            return;
          }

          updateAuthUI(data.user);
          hideAuthModal();
          showToast(`Welcome back, ${data.user.email}! 👋`, 'success');

          // If user clicked download before signing in, proceed with download
          if (state.pendingActionAfterAuth === 'download') {
            state.pendingActionAfterAuth = null;
            setTimeout(() => executePDFDownload(), 400);
          }
        } else {
          // Sign Up
          const { data, error } = await supabase.auth.signUp({
            email,
            password
          });
          setAuthLoading(false);

          if (error) {
            showAuthAlert(error.message || 'Sign up failed.');
            return;
          }

          if (data.session?.user || data.user?.confirmed_at) {
            updateAuthUI(data.user);
            hideAuthModal();
            showToast('Account created successfully! 🎉', 'success');

            if (state.pendingActionAfterAuth === 'download') {
              state.pendingActionAfterAuth = null;
              setTimeout(() => executePDFDownload(), 400);
            }
          } else {
            showAuthAlert('Account created! Please check your email to confirm your account, then sign in.', 'success');
          }
        }
      } catch (err) {
        setAuthLoading(false);
        showAuthAlert('Unexpected error. Please try again.');
        console.error('Auth error:', err);
      }
    });
  }

  // Initialize Supabase Auth Session
  if (supabase) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthUI(session?.user || null);
    }).catch(err => console.warn('Supabase getSession warning:', err));

    supabase.auth.onAuthStateChange((event, session) => {
      updateAuthUI(session?.user || null);
    });
  }

  // --- FORM DATA EXTRACTION HELPERS FOR SUPABASE ---
  function extractExperiencesArray() {
    const list = [];
    experienceList.querySelectorAll('.dynamic-card').forEach(card => {
      const role = card.querySelector('.exp-role')?.value.trim() || '';
      const company = card.querySelector('.exp-company')?.value.trim() || '';
      const location = card.querySelector('.exp-location')?.value.trim() || '';
      const dates = card.querySelector('.exp-dates')?.value.trim() || '';
      const description = card.querySelector('.exp-desc')?.value.trim() || '';
      if (role || company || description) {
        list.push({ role, company, location, dates, description });
      }
    });
    return list;
  }

  function extractEducationArray() {
    const list = [];
    educationList.querySelectorAll('.dynamic-card').forEach(card => {
      const degree = card.querySelector('.edu-degree')?.value.trim() || '';
      const school = card.querySelector('.edu-school')?.value.trim() || '';
      const location = card.querySelector('.edu-location')?.value.trim() || '';
      const year = card.querySelector('.edu-year')?.value.trim() || '';
      const details = card.querySelector('.edu-details')?.value.trim() || '';
      if (degree || school) {
        list.push({ degree, school, location, year, details });
      }
    });
    return list;
  }

  function extractProjectsArray() {
    const list = [];
    projectList.querySelectorAll('.dynamic-card').forEach(card => {
      const name = card.querySelector('.proj-name')?.value.trim() || '';
      const link = card.querySelector('.proj-link')?.value.trim() || '';
      const tech = card.querySelector('.proj-tech')?.value.trim() || '';
      const description = card.querySelector('.proj-desc')?.value.trim() || '';
      if (name || description) {
        list.push({ name, link, tech, description });
      }
    });
    return list;
  }

  function extractCertificationsString() {
    const certs = [];
    certificationsList.querySelectorAll('.dynamic-card').forEach(card => {
      const title = card.querySelector('.cert-title')?.value.trim() || '';
      const issuer = card.querySelector('.cert-issuer')?.value.trim() || '';
      if (title) {
        certs.push(issuer ? `${title} (${issuer})` : title);
      }
    });
    return certs.join('; ');
  }

  // Save form data + uploaded PDF URL to Supabase
  async function saveResumeAndPdfToSupabase(user, pdfBlob, filename) {
    if (!supabase || !user) return;
    try {
      showToast('☁️ Saving resume & uploading PDF to Supabase...', 'info');

      // 1. Upload PDF Blob to Supabase Storage bucket 'resumes'
      const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${user.id}/${Date.now()}_${sanitizedName}`;
      let publicPdfUrl = null;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(storagePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(storagePath);
        publicPdfUrl = urlData?.publicUrl || null;
      }

      // 2. Insert complete form record in public.resumes table
      const resumePayload = {
        user_id: user.id,
        full_name: fullNameInput.value.trim() || 'Untitled',
        job_title: jobTitleInput.value.trim() || '',
        email: emailInput.value.trim() || user.email,
        phone: phoneInput.value.trim() || '',
        location: locationInput.value.trim() || '',
        website: websiteInput.value.trim() || '',
        linkedin: linkedinInput.value.trim() || '',
        github: githubInput.value.trim() || '',
        summary: summaryInput.value.trim() || '',
        technical_skills: state.skills.join(', '),
        soft_skills: '',
        certifications: extractCertificationsString(),
        languages: '',
        experiences: extractExperiencesArray(),
        education: extractEducationArray(),
        projects: extractProjectsArray(),
        template_used: state.template === 'colorful' ? 'Modern Blue' : 'Classic Plain (B&W)',
        pdf_url: publicPdfUrl,
        updated_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from('resumes')
        .insert([resumePayload])
        .select();

      if (insertError) {
        console.error('Supabase resumes table insert error:', insertError);
        showToast('PDF downloaded! Note: Database sync error: ' + insertError.message, 'info');
      } else {
        showToast('✅ Saved to Supabase! PDF and all form data backed up.', 'success');
        console.log('Saved resume row in Supabase:', insertData);
      }
    } catch (err) {
      console.error('Failed to save resume to Supabase:', err);
    }
  }

  // Manual save form data to Supabase (without PDF)
  async function saveFormDataToSupabase(user) {
    if (!supabase || !user) return;
    try {
      showToast('☁️ Saving resume data to Supabase...', 'info');

      const resumePayload = {
        user_id: user.id,
        full_name: fullNameInput.value.trim() || 'Untitled',
        job_title: jobTitleInput.value.trim() || '',
        email: emailInput.value.trim() || user.email,
        phone: phoneInput.value.trim() || '',
        location: locationInput.value.trim() || '',
        website: websiteInput.value.trim() || '',
        linkedin: linkedinInput.value.trim() || '',
        github: githubInput.value.trim() || '',
        summary: summaryInput.value.trim() || '',
        technical_skills: state.skills.join(', '),
        soft_skills: '',
        certifications: extractCertificationsString(),
        languages: '',
        experiences: extractExperiencesArray(),
        education: extractEducationArray(),
        projects: extractProjectsArray(),
        template_used: state.template === 'colorful' ? 'Modern Blue' : 'Classic Plain (B&W)',
        updated_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from('resumes')
        .insert([resumePayload])
        .select();

      if (insertError) {
        showToast('Error saving to Supabase: ' + insertError.message, 'error');
      } else {
        showToast('✅ Resume form data saved to Supabase!', 'success');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save to Supabase', 'error');
    }
  }

  // Gatekeeper: Protected Download Handler
  function requestResumeDownload() {
    if (!state.currentUser) {
      // User is not authenticated -> prompt sign up / sign in modal
      state.pendingActionAfterAuth = 'download';
      showAuthModal('signin', 'Free sign in or registration is required to download your PDF resume.');
      return;
    }

    // User is authenticated -> download immediately
    executePDFDownload();
  }

  // Execute PDF generation, local download, and cloud backup
  async function executePDFDownload() {
    const rawName = fullNameInput.value.trim() || 'Resume';
    const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanName}_Resume.pdf`;

    showToast('Generating high-resolution PDF...', 'info');

    if (typeof html2pdf !== 'undefined') {
      const element = document.getElementById('resume-document');
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      try {
        // Generate PDF using html2pdf worker
        const worker = html2pdf().set(opt).from(element);
        const pdf = await worker.toPdf().get('pdf');
        const pdfBlob = pdf.output('blob');

        // 1. Download file to user's local computer
        const blobUrl = URL.createObjectURL(pdfBlob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 8000);

        element.style.transform = originalTransform;
        showToast('PDF downloaded successfully! 🎉', 'success');

        // 2. Upload PDF & Form data to Supabase
        if (state.currentUser) {
          saveResumeAndPdfToSupabase(state.currentUser, pdfBlob, filename);
        }
      } catch (err) {
        console.error('PDF generation error:', err);
        element.style.transform = originalTransform;
        showToast('Opening print dialog for PDF save...', 'info');
        window.print();
      }
    } else {
      window.print();
    }
  }

  // Event Listeners for Downloads & Cloud Save
  downloadPdfBtn.addEventListener('click', requestResumeDownload);
  previewDownloadBtn.addEventListener('click', requestResumeDownload);
  if (saveCloudBtn) {
    saveCloudBtn.addEventListener('click', () => {
      if (state.currentUser) {
        saveFormDataToSupabase(state.currentUser);
      } else {
        state.pendingActionAfterAuth = 'save';
        showAuthModal('signin', 'Sign in to save your resume form to the cloud.');
      }
    });
  }

  printResumeBtn.addEventListener('click', () => {
    if (!state.currentUser) {
      state.pendingActionAfterAuth = 'print';
      showAuthModal('signin', 'Please sign in or create a free account to print or save your resume.');
      return;
    }
    if (state.currentUser) {
      saveFormDataToSupabase(state.currentUser);
    }
    window.print();
  });

  // --- ZOOM CONTROLS ---
  function applyZoom(delta) {
    state.zoom = Math.min(Math.max(0.5, state.zoom + delta), 1.6);
    updateZoomTransform();
  }

  function resetZoom() {
    state.zoom = 1.0;
    updateZoomTransform();
  }

  function updateZoomTransform() {
    resumeDoc.style.transform = `scale(${state.zoom})`;
    zoomLevelDisplay.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  zoomInBtn.addEventListener('click', () => applyZoom(0.1));
  zoomOutBtn.addEventListener('click', () => applyZoom(-0.1));
  zoomResetBtn.addEventListener('click', resetZoom);

  // --- TOAST NOTIFIER ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- UTILITY FUNCTIONS ---
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  function cleanUrl(url) {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  }

  function ensureHttp(url) {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  }

  // Initial Load with Sample Data
  loadDataIntoUI(sampleData);
});
