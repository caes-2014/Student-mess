// Global variables
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'caes123'; // Change this password
let studentsData = [];
let currentDate = new Date().toISOString().split('T')[0];
let githubToken = 'YOUR_GITHUB_TOKEN'; // Set your GitHub token here
let repoOwner = 'YOUR_USERNAME'; // Your GitHub username
let repoName = 'YOUR_REPO_NAME'; // Your repo name

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

    // Load attendance data
    loadAttendanceData();

    // Event listeners
    document.getElementById('loginBtn')?.addEventListener('click', handleAdminLogin);
    document.getElementById('closeModal')?.addEventListener('click', closeLoginModal);
    document.getElementById('saveBtn')?.addEventListener('click', saveAttendanceData);
    document.getElementById('exportBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('addStudentBtn')?.addEventListener('click', addStudent);
}

function checkAdminLogin() {
    const tableContainer = document.getElementById('attendanceTableContainer');
    const loginModal = document.getElementById('loginModal');

    if (!isAdminLoggedIn) {
        loginModal.style.display = 'block';
        tableContainer.style.display = 'none';
    }
}

function handleAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('attendanceTableContainer').style.display = 'block';
        loadAttendanceData();
    } else {
        alert('Incorrect password!');
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

async function loadAttendanceData() {
    try {
        // For demo, load sample data. Replace with GitHub API call
        studentsData = getSampleStudents();
        renderAttendanceTable();
        updateCounts();
    } catch (error) {
        console.error('Error loading data:', error);
        studentsData = getSampleStudents();
        renderAttendanceTable();
    }
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
    tbody.innerHTML = '';

    studentsData.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td><input type="checkbox" ${student.tiffin ? 'checked' : ''} onchange="toggleAttendance(${index}, 'tiffin')" ${!isAdminLoggedIn ? 'disabled' : ''}></td>
            <td><input type="checkbox" ${student.lunch ? 'checked' : ''} onchange="toggleAttendance(${index}, 'lunch')" ${!isAdminLoggedIn ? 'disabled' : ''}></td>
            <td><input type="checkbox" ${student.dinner ? 'checked' : ''} onchange="toggleAttendance(${index}, 'dinner')" ${!isAdminLoggedIn ? 'disabled' : ''}></td>
        `;
        tbody.appendChild(row);
    });

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = !isAdminLoggedIn;
}

function toggleAttendance(index, meal) {
    if (!isAdminLoggedIn) return;

    studentsData[index][meal] = !studentsData[index][meal];
    updateCounts();
    document.getElementById('saveBtn').disabled = false;
}

function updateCounts() {
    const tiffinCount = studentsData.filter(s => s.tiffin).length;
    const lunchCount = studentsData.filter(s => s.lunch).length;
    const dinnerCount = studentsData.filter(s => s.dinner).length;

    document.getElementById('tiffinCount').textContent = tiffinCount;
    document.getElementById('lunchCount').textContent = lunchCount;
    document.getElementById('dinnerCount').textContent = dinnerCount;
}

async function saveAttendanceData() {
    if (!isAdminLoggedIn) return;

    try {
        const data = {
            date: currentDate,
            students: studentsData
        };

        // TODO: Save to GitHub API
        console.log('Saving data:', data);

        // Simulate save
        document.getElementById('saveBtn').disabled = true;
        document.getElementById('saveBtn').textContent = '✅ SAVED!';
        setTimeout(() => {
            document.getElementById('saveBtn').textContent = '💾 SAVE ATTENDANCE';
        }, 2000);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Check console for details.');
    }
}

function exportToCSV() {
    const headers = ['Name', 'ID', 'Tiffin', 'Lunch', 'Dinner'];
    const csvContent = [
        headers.join(','),
        ...studentsData.map(student =>
            `${student.name},${student.id},${student.tiffin},${student.lunch},${student.dinner}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${currentDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function addStudent() {
    if (!isAdminLoggedIn) return;

    const name = prompt('Enter student name:');
    const id = prompt('Enter student ID:');

    if (name && id) {
        studentsData.push({
            name: name.trim(),
            id: id.trim(),
            tiffin: false,
            lunch: false,
            dinner: false
        });
        renderAttendanceTable();
        updateCounts();
    }
}

// Home page functions
function handleMenuUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('menuImage').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function setupFeedback() {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = this.dataset.rating;
            ratingValue.value = rating;

            stars.forEach((s, index) => {
                s.classList.toggle('active', index < rating);
            });
        });
    });

    document.getElementById('feedbackForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const feedback = {
            name: document.getElementById('feedbackName').value,
            message: document.getElementById('feedbackMessage').value,
            rating: document.getElementById('ratingValue').value,
            date: new Date().toLocaleDateString()
        };

        console.log('Feedback submitted:', feedback);
        alert('Thank you for your feedback!');
        this.reset();
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    });
}

// GitHub API Functions (Uncomment and configure for production)
async function saveToGitHub(data) {
    const content = btoa(JSON.stringify(data, null, 2)); // Base64 encode
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Update attendance for ${currentDate}`,
            content: content,
            sha: await getFileSHA() // Get current file SHA for updates
        })
    });

    return response.json();
}

async function loadFromGitHub() {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json?ref=main`, {
        headers: {
            'Authorization': `token ${githubToken}`
        }
    });
    const data = await response.json();
    return JSON.parse(atob(data.content));
}

async function getFileSHA() {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.json?ref=main`, {
        headers: {
            'Authorization': `token ${githubToken}`
        }
    });
    const data = await response.json();
    return data.sha;
}

// Enhanced save function with GitHub integration
async function saveAttendanceDataWithGitHub() {
    if (!isAdminLoggedIn || !githubToken || githubToken === 'YOUR_GITHUB_TOKEN') {
        alert('Please configure GitHub token in script.js first!');
        return;
    }

    try {
        const data = {
            date: currentDate,
            totalStudents: studentsData.length,
            tiffinCount: studentsData.filter(s => s.tiffin).length,
            lunchCount: studentsData.filter(s => s.lunch).length,
            dinnerCount: studentsData.filter(s => s.dinner).length,
            students: studentsData
        };

        await saveToGitHub(data);

        // UI feedback
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.textContent = '✅ SAVED TO GITHUB!';
        saveBtn.style.background = 'linear-gradient(45deg, #4caf50, #81c784)';

        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 SAVE ATTENDANCE';
            saveBtn.style.background = '';
        }, 3000);

    } catch (error) {
        console.error('GitHub save error:', error);
        alert('Error saving to GitHub. Using local storage as backup.');
        localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(studentsData));
    }
}

// Enhanced load function with GitHub + fallback
async function loadAttendanceDataEnhanced() {
    try {
        if (githubToken && githubToken !== 'YOUR_GITHUB_TOKEN') {
            const data = await loadFromGitHub();
            if (data && data.date === currentDate) {
                studentsData = data.students || [];
            } else {
                studentsData = getSampleStudents();
            }
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem(`attendance_${currentDate}`);
            studentsData = saved ? JSON.parse(saved) : getSampleStudents();
        }
    } catch (error) {
        console.error('Load error:', error);
        studentsData = getSampleStudents();
    }

    renderAttendanceTable();
    updateCounts();
}

// Local storage backup functions
function saveToLocalStorage() {
    localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(studentsData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(`attendance_${currentDate}`);
    return saved ? JSON.parse(saved) : null;
}

// Auto-save every 30 seconds when changes made
let autoSaveTimer;
function setupAutoSave() {
    clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
        if (isAdminLoggedIn && studentsData.length > 0) {
            saveToLocalStorage();
        }
    }, 30000);
}

// Initialize PWA-like features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle (for future enhancement)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// Export monthly report function
function exportMonthlyReport() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthReports = [];

    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().split('T')[0].slice(0, 7);
        const saved = localStorage.getItem(`attendance_${monthKey}`);
        if (saved) {
            const data = JSON.parse(saved);
            monthReports.push({
                month: months[date.getMonth()],
                total: data.length,
                tiffin: data.filter(s => s.tiffin).length,
                lunch: data.filter(s => s.lunch).length,
                dinner: data.filter(s => s.dinner).length
            });
        }
    }

    console.table(monthReports);
    alert('Monthly report logged to console!');
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update counts with debouncing
window.updateCountsDebounced = debounce(updateCounts, 100);

// Global error handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Global error:', msg, url, lineNo, columnNo, error);
    return false;
};

// Page visibility API for auto-save
document.addEventListener('visibilitychange', function () {
    if (!document.hidden && isAdminLoggedIn) {
        loadAttendanceDataEnhanced();
    }
});

// Replace the basic functions with enhanced versions
const originalSave = saveAttendanceData;
saveAttendanceData = async function () {
    await saveAttendanceDataWithGitHub();
    setupAutoSave();
};

const originalLoad = loadAttendanceData;
loadAttendanceData = loadAttendanceDataEnhanced;

const originalToggle = toggleAttendance;
toggleAttendance = function (index, meal) {
    originalToggle(index, meal);
    setupAutoSave();
    document.getElementById('saveBtn').disabled = false;
};

// Initialize enhanced features
setupAutoSave();

// Make functions globally accessible for inline event handlers
window.toggleAttendance = toggleAttendance;
window.saveAttendanceData = saveAttendanceData;
window.exportToCSV = exportToCSV;
window.addStudent = addStudent;
window.exportMonthlyReport = exportMonthlyReport;