/**
 * SEMESTA ISLAM — Engine Logika Web App Interaktif
 * Memfasilitasi Sistem Direktori, Verifikasi Kredensial 4-Lapis,
 * Multi-Step Booking Inquiry, dan Portal Pendaftaran Pendidik Mandiri.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Data Entitas Kanonikal (Berdasarkan 03_ERD.md & 02_PRD.md) ---
    const educatorsData = [
        {
            id: 'edu-01',
            name: 'Ustadz DR. Ahmad Al-Hafiz, M.A.',
            title: 'Pakar Fiqh Muamalah & Tahsin Sanad',
            location: 'Jakarta Selatan',
            rating: 4.9,
            reviewsCount: 128,
            expertise: ["Tahsin & Qira'ah", 'Fiqh Muamalah', 'Hadits'],
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            verified: true,
            method: 'Tatap Muka & Online',
            institution: 'Al-Azhar Cairo Alumni / IIQ Jakarta',
            sanadDetails: "Sanad Qira'ah Sab'ah jalur Syatibiyyah terhubung hingga Rasulullah SAW via Syaikh Al-Azhar.",
            bio: 'Pengajar senior bidang Fiqh Ekonomi Islam & Tahsin Al-Qur\'an bersanad riwayat Hafsh \'an \'Ashim dengan pengalaman mengajar > 15 tahun.',
            reviews: [
                { author: 'Keluarga Bpk. Hendra (Jakarta)', rating: 5, comment: 'Bimbingan sangat teliti, makhraj huruf anak-anak kami berkembang pesat dalam 2 bulan.' },
                { author: 'Ibu Rahmawati (Depok)', rating: 5, comment: 'Penyampaian Fiqh Muamalah sangat relevan dengan transaksi bisnis modern.' }
            ]
        },
        {
            id: 'edu-02',
            name: 'Ustadzah Fatimah Azzahra, S.Ag.',
            title: 'Pembimbing Al-Qur\'an Anak & Keluarga',
            location: 'Bandung',
            rating: 5.0,
            reviewsCount: 94,
            expertise: ["Tahsin & Qira'ah", 'Aqidah & Akhlaq'],
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
            verified: true,
            method: 'Tatap Muka / Privat',
            institution: 'Pesantren Tahfidz Al-Qur\'an Bandung',
            sanadDetails: "Ijazah Tahfidz 30 Juz & Sertifikasi Pengajaran Metode Talaqqi Anak.",
            bio: 'Spesialis metode talaqqi anak usia dini dan bimbingan akhlak keluarga Rabbani dengan pendekatan keibuan yang hangat.',
            reviews: [
                { author: 'Ibu Dewi (Bandung)', rating: 5, comment: 'Anak saya usia 6 tahun jadi sangat senang belajar mengaji setiap sore.' }
            ]
        },
        {
            id: 'edu-03',
            name: 'Ustadz Muhammad Syarif, Lc.',
            title: 'Pengajar Bahasa Arab & Nahwu Sharaf',
            location: 'Surabaya',
            rating: 4.8,
            reviewsCount: 76,
            expertise: ['Bahasa Arab', 'Kajian Kitab Kuning'],
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
            verified: true,
            method: 'Online (Kelas Intensif)',
            institution: 'LIPIA Jakarta / Universitas Islam Madinah',
            sanadDetails: 'Ijazah Kelulusan Fakultas Bahasa Arab UIM Madinah (Kultum & Lughah).',
            bio: 'Metode cepat memahami Bahasa Arab Al-Qur\'an untuk kalangan profesional, akademisi, dan mahasiswa.',
            reviews: [
                { author: 'Ahmad Ridwan (Surabaya)', rating: 4.8, comment: 'Penjelasan kaidah Nahwu mudah dicerna untuk pemula tanpa latar belakang pesantren.' }
            ]
        },
        {
            id: 'edu-04',
            name: 'Ustadz Abdullah Faqih, M.Pd.',
            title: 'Konsultan Pendidikan Islam & Parenting',
            location: 'Yogyakarta',
            rating: 4.9,
            reviewsCount: 110,
            expertise: ['Parenting Islam', 'Aqidah & Akhlaq'],
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
            verified: true,
            method: 'Tatap Muka & Online',
            institution: 'Magister Pendidikan Islam UIN Sunan Kalijaga',
            sanadDetails: 'Sertifikasi Konselor Pendidikan Islam & Parenting Rabbani.',
            bio: 'Praktisi pendidikan karakter Rabbani dan pendampingan keluarga muda Muslim dalam mendidik anak di era digital.',
            reviews: [
                { author: 'Keluarga dr. Aris (Yogyakarta)', rating: 5, comment: 'Sangat membimbing dalam menyusun kurikulum pendidikan karakter anak di rumah.' }
            ]
        }
    ];

    const coursesData = [
        {
            id: 'crs-01',
            title: 'Kelas Tahsin Bersanad & Mutqin Al-Qur\'an',
            category: "Tahsin & Qira'ah",
            desc: 'Bimbingan pengucapan makhorijul huruf dan hukum tajwid secara fasih berstandar ijazah.',
            duration: '12 Pertemuan (Online / Private)',
            instructor: 'Ustadz DR. Ahmad Al-Hafiz'
        },
        {
            id: 'crs-02',
            title: 'Dasar-Dasar Fiqh Muamalah Kontemporer',
            category: 'Fiqh Muamalah',
            desc: 'Memahami akad syariah, kehalalan transaksi finansial modern, dan kaidah bisnis Islam.',
            duration: '8 Pertemuan (Webinar & Diskusi)',
            instructor: 'Ustadz DR. Ahmad Al-Hafiz'
        },
        {
            id: 'crs-03',
            title: 'Bahasa Arab Qur\'ani untuk Pemula',
            category: 'Bahasa Arab',
            desc: 'Kuasai kosakata Al-Qur\'an dan tata bahasa dasar untuk menambah kekhusyu\'an shalat.',
            duration: '16 Pertemuan (Intensif)',
            instructor: 'Ustadz Muhammad Syarif, Lc.'
        }
    ];

    // --- DOM Reference ---
    const educatorGrid = document.getElementById('educator-grid');
    const courseGrid = document.getElementById('course-grid');
    const searchInput = document.getElementById('search-query');
    const tagChips = document.querySelectorAll('.tag-chip');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Bottom Sheet Controls
    const sheetOverlay = document.getElementById('bottom-sheet-overlay');
    const sheetBody = document.getElementById('sheet-body');
    const btnOpenFilter = document.getElementById('btn-open-filter');
    const btnRequestVerification = document.getElementById('btn-request-verification');
    const btnInquiryTop = document.getElementById('btn-inquiry-top');

    let currentCategoryFilter = 'all';
    let currentMethodFilter = 'all';
    let currentSort = 'rating';

    // --- Umpan Balik Taktil (Haptic Vibrations) ---
    function triggerHaptic() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    // --- Manajemen Tema (Dark/Light) ---
    const savedTheme = localStorage.getItem('semesta_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        triggerHaptic();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('semesta_theme', newTheme);
    });

    // --- Bottom Sheet Controller System ---
    function openSheet(contentHTML) {
        sheetBody.innerHTML = contentHTML;
        sheetOverlay.classList.remove('hidden');
        void sheetOverlay.offsetWidth; // Force reflow
        sheetOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
        sheetOverlay.classList.remove('active');
        setTimeout(() => {
            sheetOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 250);
    }

    sheetOverlay.addEventListener('click', (e) => {
        if (e.target === sheetOverlay) {
            closeSheet();
        }
    });

    // --- Rendering Kartu Pendidik ---
    function renderEducators(data) {
        educatorGrid.innerHTML = '';

        if (data.length === 0) {
            educatorGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <p style="font-weight: 600; color: var(--text-secondary);">Tidak ada pendidik yang cocok dengan kriteria filter.</p>
                    <button class="btn btn-secondary" id="btn-reset-filters" style="margin-top: 0.85rem; font-size: 0.8rem;">Reset Filter</button>
                </div>
            `;
            document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
                currentCategoryFilter = 'all';
                currentMethodFilter = 'all';
                searchInput.value = '';
                tagChips.forEach(c => c.classList.remove('active'));
                tagChips[0].classList.add('active');
                filterEducators();
            });
            return;
        }

        data.forEach(edu => {
            const card = document.createElement('div');
            card.className = 'educator-card';
            card.innerHTML = `
                <div class="card-top">
                    <div class="avatar-wrapper">
                        <img src="${edu.avatar}" alt="${edu.name}" class="avatar-img" loading="lazy">
                        ${edu.verified ? `
                            <div class="verified-badge-icon" title="Terverifikasi Kredensial 4-Lapis SEMESTA ISLAM">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                        ` : ''}
                    </div>
                    <div class="educator-info">
                        <h3>${edu.name}</h3>
                        <p class="educator-title">${edu.title}</p>
                        <div class="location-tag">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>${edu.location} (${edu.method})</span>
                        </div>
                    </div>
                </div>

                <div class="expertise-chips">
                    ${edu.expertise.map(exp => `<span class="exp-chip">${exp}</span>`).join('')}
                </div>

                <div class="card-footer">
                    <div class="rating-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>${edu.rating}</span>
                        <span style="font-weight: 400; color: var(--text-muted);">(${edu.reviewsCount})</span>
                    </div>
                    <button class="btn btn-secondary btn-detail-trigger" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                        Lihat Profil & Sanad
                    </button>
                </div>
            `;

            card.querySelector('.btn-detail-trigger').addEventListener('click', () => {
                triggerHaptic();
                openEducatorDetailSheet(edu);
            });

            educatorGrid.appendChild(card);
        });
    }

    // --- Rendering Kartu Kursus/Program ---
    function renderCourses(data) {
        courseGrid.innerHTML = '';
        data.forEach(crs => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="course-img-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div class="course-body">
                    <span class="course-category">${crs.category}</span>
                    <h3 class="course-title">${crs.title}</h3>
                    <p class="course-desc">${crs.desc}</p>
                    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.775rem; color: var(--text-muted);">${crs.duration}</span>
                        <button class="btn btn-primary btn-inquire-course" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Ajukan Inkuiri</button>
                    </div>
                </div>
            `;
            card.querySelector('.btn-inquire-course').addEventListener('click', () => {
                triggerHaptic();
                openMultiStepBookingSheet(crs.title, crs.instructor);
            });
            courseGrid.appendChild(card);
        });
    }

    // --- Logika Filter & Search ---
    function filterEducators() {
        const query = searchInput.value.toLowerCase().trim();
        let filtered = educatorsData.filter(edu => {
            const matchesCategory = currentCategoryFilter === 'all' || edu.expertise.includes(currentCategoryFilter);
            const matchesMethod = currentMethodFilter === 'all' || edu.method.toLowerCase().includes(currentMethodFilter.toLowerCase());
            const matchesQuery = edu.name.toLowerCase().includes(query) ||
                                 edu.title.toLowerCase().includes(query) ||
                                 edu.location.toLowerCase().includes(query) ||
                                 edu.expertise.some(e => e.toLowerCase().includes(query));
            return matchesCategory && matchesMethod && matchesQuery;
        });

        // Sorting
        if (currentSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (currentSort === 'reviews') {
            filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
        }

        renderEducators(filtered);
    }

    searchInput.addEventListener('input', filterEducators);

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            triggerHaptic();
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategoryFilter = chip.getAttribute('data-category');
            filterEducators();
        });
    });

    // --- Tabbed Profile Sheet Pendidik ---
    function openEducatorDetailSheet(edu) {
        const html = `
            <div style="text-align: center; margin-bottom: 1.25rem;">
                <img src="${edu.avatar}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent-gold); margin-bottom: 0.5rem;">
                <h2 style="font-size: 1.35rem; margin-bottom: 0.2rem;">${edu.name}</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">${edu.title}</p>
                <div style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 0.5rem;">
                    <span class="exp-chip">${edu.institution}</span>
                    <span class="exp-chip" style="background: var(--accent-gold-light); color: #09271D;">★ ${edu.rating} (${edu.reviewsCount} Ulasan)</span>
                </div>
            </div>

            <!-- Tab Buttons -->
            <div style="display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;">
                <button id="tab-btn-bio" class="nav-link active" style="flex: 1; text-align: center; border: none; background: none; cursor: pointer;">Profil & Bio</button>
                <button id="tab-btn-sanad" class="nav-link" style="flex: 1; text-align: center; border: none; background: none; cursor: pointer;">Sanad & Kredensial</button>
                <button id="tab-btn-reviews" class="nav-link" style="flex: 1; text-align: center; border: none; background: none; cursor: pointer;">Ulasan (${edu.reviews.length})</button>
            </div>

            <!-- Tab Contents -->
            <div id="tab-content-container" style="min-height: 140px; margin-bottom: 1.25rem;">
                <div id="tab-bio" class="tab-pane">
                    <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.6;">${edu.bio}</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.75rem;">📍 Lokasi Pengajaran: <strong>${edu.location}</strong> (${edu.method})</p>
                </div>
                <div id="tab-sanad" class="tab-pane" style="display: none;">
                    <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--border-color-gold); padding: 1rem; border-radius: var(--radius-md);">
                        <h4 style="font-size: 0.85rem; color: var(--accent-gold-hover); margin-bottom: 0.3rem;">KREDENSIAL TERVERIFIKASI</h4>
                        <p style="font-size: 0.875rem; color: var(--text-primary); font-weight: 500;">${edu.sanadDetails}</p>
                    </div>
                </div>
                <div id="tab-reviews" class="tab-pane" style="display: none;">
                    ${edu.reviews.map(r => `
                        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600;">
                                <span>${r.author}</span>
                                <span style="color: var(--accent-gold-hover);">★ ${r.rating}.0</span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">"${r.comment}"</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-primary" id="btn-sheet-book-now" style="flex: 1;">Jadwalkan Bimbingan</button>
                <button class="btn btn-secondary" onclick="document.querySelector('.sheet-overlay').click()">Tutup</button>
            </div>
        `;
        openSheet(html);

        // Tab Switching Mechanics
        const tabBio = document.getElementById('tab-bio');
        const tabSanad = document.getElementById('tab-sanad');
        const tabReviews = document.getElementById('tab-reviews');
        const btnBio = document.getElementById('tab-btn-bio');
        const btnSanad = document.getElementById('tab-btn-sanad');
        const btnReviews = document.getElementById('tab-btn-reviews');

        function switchTab(activeBtn, showPane) {
            triggerHaptic();
            [btnBio, btnSanad, btnReviews].forEach(b => b.classList.remove('active'));
            [tabBio, tabSanad, tabReviews].forEach(p => p.style.display = 'none');
            activeBtn.classList.add('active');
            showPane.style.display = 'block';
        }

        btnBio.addEventListener('click', () => switchTab(btnBio, tabBio));
        btnSanad.addEventListener('click', () => switchTab(btnSanad, tabSanad));
        btnReviews.addEventListener('click', () => switchTab(btnReviews, tabReviews));

        document.getElementById('btn-sheet-book-now')?.addEventListener('click', () => {
            openMultiStepBookingSheet(`Bimbingan Belajar: ${edu.name}`, edu.name);
        });
    }

    // --- Multi-Step Booking & Inquiry Sheet ---
    function openMultiStepBookingSheet(title, instructorName) {
        let currentStep = 1;
        const bookingData = { title, instructorName, method: 'Online', name: '', phone: '', note: '' };

        function renderStep() {
            let bodyHTML = '';
            if (currentStep === 1) {
                bodyHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.15rem;">Langkah 1/3: Kebutuhan Belajar</h3>
                        <span class="exp-chip">Step 1</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Program: <strong>${title}</strong></p>

                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Pilih Metode Pembelajaran</label>
                        <select id="step-method" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                            <option value="Online (Webinar/Privat)">Online (Webinar / Privat Zoom)</option>
                            <option value="Tatap Muka Privat (Ke Rumah)">Tatap Muka Privat (Ke Rumah)</option>
                            <option value="Tatap Muka Kelompok / Majelis">Tatap Muka Kelompok / Majelis</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.25rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Catatan Jadwal / Hari Pilihan</label>
                        <input type="text" id="step-schedule" placeholder="Misal: Sabtu & Minggu Pagi" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                    </div>

                    <button class="btn btn-primary" id="btn-next-step-1" style="width: 100%;">Lanjut ke Data Pembelajar →</button>
                `;
            } else if (currentStep === 2) {
                bodyHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.15rem;">Langkah 2/3: Data Kontak Pembelajar</h3>
                        <span class="exp-chip">Step 2</span>
                    </div>

                    <div style="margin-bottom: 0.85rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Nama Lengkap Pembelajar / Orang Tua</label>
                        <input type="text" id="step-name" value="${bookingData.name}" placeholder="Ahmad Subagyo" required style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                    </div>

                    <div style="margin-bottom: 1.25rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Nomor WhatsApp Kontak</label>
                        <input type="tel" id="step-phone" value="${bookingData.phone}" placeholder="08123456789" required style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" id="btn-prev-step-2" style="flex: 1;">← Kembali</button>
                        <button class="btn btn-primary" id="btn-next-step-2" style="flex: 2;">Tinjau Inkuiri →</button>
                    </div>
                `;
            } else if (currentStep === 3) {
                bodyHTML = `
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: var(--badge-bg); color: var(--success-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3 style="font-size: 1.2rem;">Konfirmasi Ringkasan Inkuiri</h3>
                        <p style="font-size: 0.825rem; color: var(--text-secondary);">Silakan periksa data Anda sebelum terhubung dengan tim SEMESTA ISLAM.</p>
                    </div>

                    <div style="background: var(--bg-cream); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1.25rem; border: 1px solid var(--border-color);">
                        <p><strong>Program / Pendidik:</strong> ${bookingData.title}</p>
                        <p><strong>Metode:</strong> ${bookingData.method}</p>
                        <p><strong>Nama Pemohon:</strong> ${bookingData.name}</p>
                        <p><strong>Kontak WA:</strong> ${bookingData.phone}</p>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" id="btn-prev-step-3" style="flex: 1;">← Ubah</button>
                        <button class="btn btn-gold" id="btn-submit-inquiry" style="flex: 2;">Kirim Inkuiri Resmi</button>
                    </div>
                `;
            }

            sheetBody.innerHTML = bodyHTML;

            // Bind Step Event Listeners
            if (currentStep === 1) {
                document.getElementById('btn-next-step-1').addEventListener('click', () => {
                    triggerHaptic();
                    bookingData.method = document.getElementById('step-method').value;
                    currentStep = 2;
                    renderStep();
                });
            } else if (currentStep === 2) {
                document.getElementById('btn-prev-step-2').addEventListener('click', () => {
                    triggerHaptic();
                    currentStep = 1;
                    renderStep();
                });
                document.getElementById('btn-next-step-2').addEventListener('click', () => {
                    const name = document.getElementById('step-name').value.trim();
                    const phone = document.getElementById('step-phone').value.trim();
                    if (!name || !phone) {
                        alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
                        return;
                    }
                    triggerHaptic();
                    bookingData.name = name;
                    bookingData.phone = phone;
                    currentStep = 3;
                    renderStep();
                });
            } else if (currentStep === 3) {
                document.getElementById('btn-prev-step-3').addEventListener('click', () => {
                    triggerHaptic();
                    currentStep = 2;
                    renderStep();
                });
                document.getElementById('btn-submit-inquiry').addEventListener('click', () => {
                    triggerHaptic();
                    alert(`Jazaakallahu khayran, ${bookingData.name}! Inkuiri bimbingan Anda telah tercatat secara resmi di platform SEMESTA ISLAM.`);
                    closeSheet();
                });
            }
        }

        renderStep();
        sheetOverlay.classList.remove('hidden');
        void sheetOverlay.offsetWidth;
        sheetOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // --- Portal Pendaftaran Mandiri Ustaz / Pendidik ---
    function openEducatorRegistrationSheet() {
        const html = `
            <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem;">Pendaftaran Profil Pendidik Baru</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Bergabunglah dengan ekosistem pendidik Islam terakreditasi dan terverifikasi 4-lapis.</p>

            <form onsubmit="event.preventDefault(); triggerHaptic(); alert('Pendaftaran berhasil diajukan! Tim Verifikasi SEMESTA ISLAM akan menghubungi Anda untuk tahap validasi ijazah & sanad.'); document.querySelector('.sheet-overlay').click();">
                <div style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Nama Lengkap & Gelar Keilmuan</label>
                    <input type="text" required placeholder="Ustadz / Ustadzah..." style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Bidang Keahlian Utama</label>
                    <input type="text" required placeholder="Tahsin, Fiqh, Bahasa Arab, Aqidah..." style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Lembaga Almamater / Sanad Utama</label>
                    <input type="text" required placeholder="Nama Pesantren / Universitas / Muqri Sanad" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                </div>
                <div style="margin-bottom: 1.25rem;">
                    <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Nomor Kontak WhatsApp / HP</label>
                    <input type="tel" required placeholder="08xxxxxxxxxx" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                </div>
                <button type="submit" class="btn btn-gold" style="width: 100%;">Kirim Berkas Pendaftaran</button>
            </form>
        `;
        openSheet(html);
    }

    // --- Filter Sheet Drawer ---
    btnOpenFilter.addEventListener('click', () => {
        triggerHaptic();
        const html = `
            <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Filter Direktori Lanjutan</h3>

            <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Metode Pengajaran</label>
                <select id="filter-method-select" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                    <option value="all" ${currentMethodFilter === 'all' ? 'selected' : ''}>Semua Metode (Online & Tatap Muka)</option>
                    <option value="Online" ${currentMethodFilter === 'Online' ? 'selected' : ''}>Online (Webinar / Zoom)</option>
                    <option value="Tatap Muka" ${currentMethodFilter === 'Tatap Muka' ? 'selected' : ''}>Tatap Muka / Privat</option>
                </select>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Urutkan Berdasarkan</label>
                <select id="filter-sort-select" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                    <option value="rating" ${currentSort === 'rating' ? 'selected' : ''}>Rating Tertinggi</option>
                    <option value="reviews" ${currentSort === 'reviews' ? 'selected' : ''}>Jumlah Ulasan Terbanyak</option>
                </select>
            </div>

            <button class="btn btn-gold" id="btn-apply-advanced-filter" style="width: 100%;">Terapkan Filter & Urutan</button>
        `;
        openSheet(html);

        document.getElementById('btn-apply-advanced-filter').addEventListener('click', () => {
            triggerHaptic();
            currentMethodFilter = document.getElementById('filter-method-select').value;
            currentSort = document.getElementById('filter-sort-select').value;
            filterEducators();
            closeSheet();
        });
    });

    btnRequestVerification?.addEventListener('click', () => {
        triggerHaptic();
        openEducatorRegistrationSheet();
    });

    btnInquiryTop?.addEventListener('click', () => {
        triggerHaptic();
        openEducatorRegistrationSheet();
    });

    // Active Navigation Highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item');

    window.addEventListener('scroll', () => {
        let current = 'hero';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const target = link.getAttribute('data-target');
            if ((target === 'home' && current === 'hero') || target === current) {
                link.classList.add('active');
            }
        });
    });

    // Initial Renders
    renderEducators(educatorsData);
    renderCourses(coursesData);
});
