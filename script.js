// Global variables
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'caes123'; // Change this password
let studentsData = [];
let currentDate = new Date().toISOString().split('T')[0];
let githubToken = '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';
let repoOwner = 'caes-2014';
let repoName = 'Student-mess';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    initPage();
});

function initPage() {
    const currentPage = window.location.pathname.includes('attendance') ? 'attendance' : 'home';
    
    if (currentPage === 'attendance') {
        initAttendancePage();
    } else {
        initHomePage();
    }
}

function initHomePage() {
    // Menu image upload
    const menuUpload = document.getElementById('menuUpload');
    if (menuUpload) {
        menuUpload.addEventListener('change', handleMenuUpload);
    }

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        setupFeedback();
    }
}

function initAttendancePage() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN');
    
    // Check admin login
    checkAdminLogin();
    
    // Event listeners
    const loginBtn = document.getElementById('loginBtn');
    const closeModal = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const addStudentBtn = document.getElementById('addStudentBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', handleAdminLogin);
    if (closeModal) closeModal.addEventListener('click', closeLoginModal);
    if (saveBtn) saveBtn.addEventListener('click', saveAttendanceData);
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);
    if (addStudentBtn) addStudentBtn.addEventListener('click', addStudent);
}

function checkAdminLogin() {
    const tableContainer = document.getElementById('attendanceTableContainer');
    const loginModal = document.getElementById('loginModal');
    
    if (!isAdminLoggedIn) {
        if (loginModal) loginModal.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
    }
}

function handleAdminLogin() {
    const password = document.getElementById('adminPassword')?.value;
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('attendanceTableContainer').style.display = 'block';
        loadAttendanceData();
        console.log('✅ Admin logged in');
    } else {
        alert('❌ Incorrect password!');
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

async function loadAttendanceData() {
    await loadAttendanceDataEnhanced();
}

function getSampleStudents() {
    return [
        { name: "Rahul Sharma", id: "CAES001", tiffin: false, lunch: true, dinner: true },
        { name: "Priya Patel", id: "CAES002", tiffin: true, lunch: true, dinner: false },
        { name: "Amit Kumar", id: "CAES003", tiffin: false, lunch: false, dinner: true },
        { name: "Sneha Gupta", id: "CAES004", tiffin: true, lunch: true, dinner: true },
        { name: "Vikram Singh", id: "CAES005", tiffin: true, lunch: false, dinner: false },
        { name: "Anjali Rao", id: "CAES006", tiffin: false, lunch: true, dinner: true }
    ];
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    studentsData.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${student.name}</strong></td>
            <td><code>${student.id}</code></td>
            <td><input type="checkbox" ${student.tiffin ? 'checked' : ''} onchange="toggleAttendance(${index}, 'tiffin')"></td>
            <td><input type="checkbox" ${student.lunch ? 'checked' : ''} onchange="toggleAttendance(${index}, 'lunch')"></td>
            <td><input type="checkbox" ${student.dinner ? 'checked' : ''} onchange="toggleAttendance(${index}, 'dinner')"></td>
        `;
        tbody.appendChild(row);
    });

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.disabled = !isAdminLoggedIn;
}

function toggleAttendance(index, meal) {
    if (!isAdminLoggedIn) return;
    
    studentsData[index][meal] = !studentsData[index][meal];
    updateCounts();
    document.getElementById('saveBtn').disabled = false;
    setupAutoSave();
}

function updateCounts() {
    const tiffinCount = studentsData.filter(s => s.tiffin).length;
    const lunchCount = studentsData.filter(s => s.lunch).length;
    const dinnerCount = studentsData.filter(s => s.dinner).length;

    const tiffinEl = document.getElementById('tiffinCount');
    const lunchEl = document.getElementById('lunchCount');
    const dinnerEl = document.getElementById('dinnerCount');
    
    if (tiffinEl) tiffinEl.textContent = tiffinCount;
    if (lunchEl) lunchEl.textContent = lunchCount;
    if (dinnerEl) dinnerEl.textContent = dinnerCount;
}

async function saveAttendanceData() {
    if (!isAdminLoggedIn) {
        alert('Please login as admin first!');
        return;
    }
    
    await saveAttendanceDataWithGitHub();
}

function exportToCSV() {
    const headers = ['Name', 'ID', 'Tiffin', 'Lunch', 'Dinner', 'Date'];
    const csvContent = [
        headers.join(','),
        ...studentsData.map(student => 
            `"${student.name}","${student.id}",${student.tiffin},${student.lunch},${student.dinner},"${currentDate}"`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CAES_Attendance_${currentDate}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function addStudent() {
    if (!isAdminLoggedIn) return;
    
    const name = prompt('Enter student name:');
    const id = prompt('Enter student ID (e.g., CAES007):');
    
    if (name && id && !studentsData.find(s => s.id === id)) {
        studentsData.push({
            name: name.trim(),
            id: id.trim(),
            tiffin: false,
            lunch: false,
            dinner: false
        });
        renderAttendanceTable();
        updateCounts();
        console.log(`✅ Added student: ${name} (${id})`);
    } else if (studentsData.find(s => s.id === id)) {
        alert('❌ Student ID already exists!');
    }
}

// Home page functions
function handleMenuUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('menuImage').src = e.target.result;
            console.log('✅ Menu image updated');
        };
        reader.readAsDataURL(file);
    }
}

function setupFeedback() {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.dataset.rating);
            ratingValue.value = rating;
            
            stars.forEach((s, index) => {
                s.classList.toggle('active', index < rating);
            });
        });
    });

    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const feedback = {
                name: document.getElementById('feedbackName').value,
                message: document.getElementById('feedbackMessage').value,
                rating: document.getElementById('ratingValue').value,
                date: new Date().toLocaleDateString('en-IN')
            };

            // Store in localStorage
            const feedbacks = JSON.parse(localStorage.getItem('caes_feedback') || '[]');
            feedbacks.push(feedback);
            localStorage.setItem('caes_feedback', JSON.stringify(feedbacks));
            
            console.log('📝 Feedback saved:', feedback);
            alert('✅ Thank you for your feedback!');
            this.reset();
            document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        });
    }
}

// 🔥 GITHUB API FUNCTIONS (FULLY WORKING)
async function saveToGitHub(data) {
    let sha = null;
    try {
        sha = await getFileSHA();
    } catch (e) {
        console.log('📄 No existing attendance.json, creating new');
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: `🤖 Update CAES attendance: ${currentDate} (${data.totalStudents} students)`,
            content: content,
            sha: sha
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub Error ${response.status}: ${errorData.message}`);
    }
    
    return await response.json();
}

async function loadFromGitHub() {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json?ref=main`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Load failed: ${response.status}`);
    }

    const fileData = await response.json();
    return JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
}

async function getFileSHA() {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json?ref=main`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        return null;
    }

    const fileData = await response.json();
    return fileData.sha;
}

// 🚀 MAIN SAVE FUNCTION (GitHub + LocalStorage)
async function saveAttendanceDataWithGitHub() {
    const data = {
        date: currentDate,
        totalStudents: studentsData.length,
        tiffinCount: studentsData.filter(s => s.tiffin).length,
        lunchCount: studentsData.filter(s => s.lunch).length,
        dinnerCount: studentsData.filter(s => s.dinner).length,
        lastUpdated: new Date().toISOString(),
        students: studentsData
    };

    // Always save locally first
    localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(studentsData));

    // Try GitHub sync
    if (githubToken && githubToken.length > 20) {
        try {
            await saveToGitHub(data);
            showSaveFeedback('✅ SAVED TO GITHUB CLOUD!');
            console.log('☁️ Synced to GitHub:', data);
        } catch (error) {
            console.error('GitHub sync failed:', error);
            showSaveFeedback('💾 Saved Locally');
        }
    } else {
        showSaveFeedback('💾 Saved Locally');
    }
}

// Enhanced load with multiple fallbacks
async function loadAttendanceDataEnhanced() {
    try {
        // 1. Try GitHub first
        if (githubToken && githubToken.length > 20) {
            try {
                const githubData = await loadFromGitHub();
                if (githubData.date === currentDate) {
                    studentsData = githubData.students || [];
                    console.log('✅ Loaded from GitHub');
                    renderAttendanceTable();
                    updateCounts();
                    return;
                }
            } catch (e) {
                console.log('GitHub unavailable, trying local...');
            }
        }

        // 2. Try localStorage
        const localData = localStorage.getItem(`attendance_${currentDate}`);
        if (localData) {
            studentsData = JSON.parse(localData);
            console.log('✅ Loaded from localStorage');
        } else {
            // 3. Sample data
            studentsData = getSampleStudents();
            console.log('📝 Loaded sample data');
        }

        renderAttendanceTable();
        updateCounts();

    } catch (error) {
        console.error('Load error:', error);
        studentsData = getSampleStudents();
        renderAttendanceTable();
    }
}

function showSaveFeedback(message) {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) return;
    
    const originalText = '💾 SAVE ATTENDANCE';
    saveBtn.disabled = true;
    saveBtn.textContent = message;
    saveBtn.style.background = 'linear-gradient(45deg, #4caf50, #81c784)';
    
    setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 3000);
}

// Auto-save every 30 seconds
let autoSaveTimer;
function setupAutoSave() {
    clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
        if (isAdminLoggedIn && studentsData.length > 0) {
            localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(studentsData));
        }
    }, 30000);
}

// Global functions for inline handlers
window.toggleAttendance = toggleAttendance;
window.saveAttendanceData = saveAttendanceData;
window.exportToCSV = exportToCSV;
window.addStudent = addStudent;

// Initialize
setupAutoSave();
console.log('🚀 CAES Students Mess - Fully Loaded!');
console.log(`📅 Today: ${currentDate}`);
console.log(`☁️ GitHub: ${repoOwner}/${repoName}`);
