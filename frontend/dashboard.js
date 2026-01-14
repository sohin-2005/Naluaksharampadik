// Dashboard JavaScript - Naalu Aksharam Padikk
// Firebase Authentication & UI Management

import { auth, db } from './firebase-config.js';
import { 
    getDashboardStats, 
    getAvailableMentors, 
    getCatchUpPlans, 
    getRoadmapTasks,
    getStreakData,
    getUserStudyLogs,
    createStudyLog,
    completeRoadmapTask,
    getCommunityFeed,
    getUserProfile,
    getUserAchievements
} from './firestore-utils.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('Dashboard.js loaded successfully');

// ========================================
// AUTHENTICATION STATE MANAGEMENT
// ========================================

/**
 * Initialize authentication state listener
 * Checks if user is logged in and displays appropriate content
 */
function initializeAuthState() {
    console.log('Initializing auth state...');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User authenticated:', user.email);
            // User is authenticated
            await initializeDashboard(user);
        } else {
            // User is not authenticated - show guest view
            console.log('No user found. Showing guest view...');
            // Initialize UI anyway to show structure
            initializeTabNavigation();
            initializeButtonHandlers();
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = 'Guest';
            }
        }
    });
}

/**
 * Initialize dashboard with user data
 * @param {Object} user - Firebase Auth user object
 */
async function initializeDashboard(user) {
    try {
        console.log('Initializing dashboard for user:', user.uid);
        
        // Fetch user profile from Firestore
        const userProfile = await getUserProfile(user.uid);
        
        // Display user name in navbar
        const displayName = userProfile?.name || user.displayName || user.email.split('@')[0];
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = displayName;
            console.log('Set user name to:', displayName);
        }

        // Fetch dashboard stats from Firestore
        const stats = await getDashboardStats(user.uid);
        console.log('Dashboard stats:', stats);
        
        if (stats) {
            // Update streak
            const streakEl = document.getElementById('streakCount');
            if (streakEl) {
                streakEl.textContent = stats.currentStreak || 0;
            }
            
            // Update summary cards
            updateSummaryCards(stats);
            
            // Populate catch-up plans
            await populateCatchUpPlans(user.uid);
            
            // Populate roadmap tasks
            await populateRoadmap(user.uid);
        }

        // Initialize UI components
        initializeTabNavigation();
        initializeButtonHandlers();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error loading dashboard. Please refresh.', 'error');
        // Still initialize UI components even on error
        initializeTabNavigation();
        initializeButtonHandlers();
    }
}

/**
 * Update summary cards with stats data
 */
function updateSummaryCards(stats) {
    try {
        // Active mentors count
        const mentorsEl = document.getElementById('activeMentorsCount');
        if (mentorsEl && stats.connectionsCount !== undefined) {
            mentorsEl.textContent = stats.connectionsCount;
        }
        
        // Study logs count
        const logsEl = document.getElementById('studyLogsCount');
        if (logsEl) {
            logsEl.textContent = stats.studyLogsCount || 0;
        }
        
        // Study logs trend
        const trendEl = document.getElementById('studyLogsTrend');
        if (trendEl) {
            trendEl.textContent = stats.totalHours > 0 
                ? `${stats.totalHours} hours logged` 
                : 'Start logging to track progress';
        }
        
        // Active plans count
        const plansEl = document.getElementById('activePlansCount');
        if (plansEl) {
            plansEl.textContent = stats.activePlansCount || 0;
        }
        
        console.log('Summary cards updated:', stats);
    } catch (error) {
        console.error('Error updating summary cards:', error);
    }
}

/**
 * Populate catch-up plans section
 */
async function populateCatchUpPlans(userId) {
    try {
        const plans = await getCatchUpPlans(userId);
        const container = document.getElementById('plansContainer');
        
        if (!container) return;
        
        if (plans.length === 0) {
            container.innerHTML = '<p class="empty-state">No active catch-up plans yet. Create one to get started!</p>';
            return;
        }
        
        container.innerHTML = '';
        
        plans.forEach(plan => {
            const daysLeft = calculateDaysLeft(plan.examDate);
            const planHTML = `
                <div class="study-plan-card">
                    <div class="plan-header">
                        <div class="plan-info">
                            <h3 class="plan-subject">${escapeHtml(plan.subject)}</h3>
                            <span class="difficulty-badge ${plan.difficulty}">${plan.difficulty}</span>
                        </div>
                        <div class="plan-meta">
                            <div class="plan-dates">
                                <p><strong>Exam Date:</strong> ${formatDate(plan.examDate)}</p>
                                <p><strong>Days Left:</strong> <span class="days-left">${daysLeft}</span></p>
                            </div>
                            <div class="plan-mentor">
                                <p><strong>Progress:</strong> ${plan.progressPercent || 0}%</p>
                            </div>
                        </div>
                    </div>

                    <div class="progress-section">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span class="progress-percentage">${plan.progressPercent || 0}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${plan.progressPercent || 0}%"></div>
                        </div>
                    </div>

                    <div class="plan-actions">
                        <button class="action-btn primary" onclick="viewPlanDetails('${plan.id}')">Continue Learning</button>
                        <button class="action-btn secondary" onclick="viewPlanDetails('${plan.id}')">View Plan Details</button>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', planHTML);
        });
        
        console.log('Catch-up plans populated:', plans.length);
    } catch (error) {
        console.error('Error populating catch-up plans:', error);
    }
}

/**
 * Populate roadmap tasks
 */
async function populateRoadmap(userId) {
    try {
        const plans = await getCatchUpPlans(userId);
        const container = document.getElementById('roadmapContainer');
        
        if (!container) return;
        
        if (plans.length === 0) {
            container.innerHTML = '<p class="empty-state">No active roadmap. Start a catch-up plan to see daily tasks!</p>';
            return;
        }
        
        // Get tasks from first plan
        const firstPlan = plans[0];
        const tasks = await getRoadmapTasks(firstPlan.id);
        
        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">No tasks in roadmap yet.</p>';
            return;
        }
        
        container.innerHTML = '';
        
        tasks.forEach(task => {
            const statusClass = task.isCompleted ? 'completed' : 'pending';
            const completedDate = task.completedAt ? formatDate(task.completedAt) : 'Coming soon';
            const displayDate = task.isCompleted 
                ? `Completed on ${completedDate}` 
                : `Day ${task.dayNumber}`;
            
            const taskHTML = `
                <div class="roadmap-item ${statusClass}">
                    <div class="roadmap-checkbox" onclick="toggleTask('${task.id}', this)">
                        ${task.isCompleted ? '<span class="check-mark">✓</span>' : '<span class="empty-circle"></span>'}
                    </div>
                    <div class="roadmap-content">
                        <p class="roadmap-day">${escapeHtml(task.title)}</p>
                        <p class="roadmap-date">${displayDate}</p>
                        ${task.description ? `<p class="roadmap-description">${escapeHtml(task.description)}</p>` : ''}
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', taskHTML);
        });
        
        console.log('Roadmap populated:', tasks.length);
    } catch (error) {
        console.error('Error populating roadmap:', error);
    }
}

/**
 * Calculate days left until exam date
 */
function calculateDaysLeft(examDate) {
    try {
        const exam = new Date(examDate);
        const today = new Date();
        const diffTime = exam - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    } catch (error) {
        return 0;
    }
}

/**
 * Format date for display
 */
function formatDate(date) {
    try {
        if (typeof date === 'object' && date.toDate) {
            date = date.toDate();
        }
        return new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (error) {
        return 'N/A';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Toggle task completion status (for UI)
 */
async function toggleTask(taskId, element) {
    try {
        const taskItem = element.closest('.roadmap-item');
        taskItem.classList.toggle('completed');
        
        // Update in Firestore
        await completeRoadmapTask(taskId);
        showNotification('Task marked as completed! 🎉', 'success');
    } catch (error) {
        console.error('Error toggling task:', error);
        showNotification('Error updating task', 'error');
    }
}

/**
 * View plan details (placeholder)
 */
function viewPlanDetails(planId) {
    showNotification('Opening plan details...', 'info');
    console.log('View plan:', planId);
}

/**
 * Global functions for onclick handlers
 */
window.toggleTask = toggleTask;
window.viewPlanDetails = viewPlanDetails;

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================

/**
 * Handle user logout
 */
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

// ========================================
// TAB NAVIGATION
// ========================================

/**
 * Initialize tab navigation functionality
 */
function initializeTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');

            // Get tab name and update content if needed
            const tabName = button.getAttribute('data-tab');
            console.log('Switched to tab:', tabName);

            // Future: Load tab-specific content here
            // loadTabContent(tabName);
        });
    });
}

// ========================================
// TAB NAVIGATION
// ========================================

/**
 * Initialize tab switching functionality
 */
function initializeTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Initializing tabs. Found', tabButtons.length, 'buttons and', tabContents.length, 'content sections');

    tabButtons.forEach(button => {
        // Remove any existing listeners first
        button.removeEventListener('click', handleTabClick);
        // Add fresh listener
        button.addEventListener('click', handleTabClick);
    });
}

/**
 * Handle tab click event
 */
function handleTabClick(event) {
    const button = event.currentTarget;
    const tabName = button.getAttribute('data-tab');
    
    console.log('Tab clicked:', tabName);

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Hide all tab contents
    tabContents.forEach(content => {
        content.style.display = 'none';
    });

    // Remove active class from all buttons
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        console.log('Showing tab:', `tab-${tabName}`);
    }

    // Add active class to clicked button
    button.classList.add('active');

    // Load tab-specific data
    loadTabData(tabName);
}

/**
 * Load data for specific tab
 */
async function loadTabData(tabName) {
    try {
        const user = auth.currentUser;
        
        if (tabName === 'mentorship') {
            console.log('Loading mentorship data...');
            await populateMentors();
            if (user) {
                await populateConnections();
            }
        } else if (tabName === 'study-log') {
            console.log('Loading study log data...');
            if (user) {
                await populateStudyLogs();
                await populateCommunityFeed();
            }
        } else if (tabName === 'profile') {
            console.log('Loading profile data...');
            if (user) {
                await populateProfile();
            }
        }
    } catch (error) {
        console.error('Error loading tab data:', error);
        showNotification('Error loading tab data', 'error');
    }
}

// ========================================
// MENTORSHIP SECTION
// ========================================

/**
 * Populate mentors list
 */
async function populateMentors() {
    try {
        const mentors = await getAvailableMentors(10);
        const container = document.getElementById('mentorsContainer');

        if (!container) return;

        if (!mentors || mentors.length === 0) {
            container.innerHTML = '<p class="empty-state">No mentors available at the moment.</p>';
            return;
        }

        container.innerHTML = mentors.map(mentor => `
            <div class="mentor-card">
                <div class="mentor-header">
                    <div class="mentor-avatar">${mentor.name?.charAt(0) || 'M'}</div>
                    <div class="mentor-info">
                        <h3 class="mentor-name">${escapeHtml(mentor.name || 'Anonymous')}</h3>
                        <p class="mentor-meta">${escapeHtml(mentor.year || '')} • ${escapeHtml(mentor.department || '')}</p>
                        <div class="mentor-badges">
                            <span class="badge verified">✓ Verified</span>
                            <span class="badge ${mentor.status === 'online' ? 'online' : 'busy'}">${mentor.status || 'offline'}</span>
                        </div>
                    </div>
                    <div class="mentor-rating">
                        <span class="rating-stars">⭐ ${(mentor.rating || 4.8).toFixed(1)}</span>
                    </div>
                </div>
                <div class="mentor-expertise">
                    ${(mentor.expertise || []).slice(0, 3).map(exp => 
                        `<span class="expertise-tag">${escapeHtml(exp)}</span>`
                    ).join('')}
                </div>
                <p class="mentor-bio">${escapeHtml(mentor.bio || 'Passionate about helping students succeed')}</p>
                <p class="mentor-stats">Helped ${mentor.studentsHelped || 0} students</p>
                <button class="action-btn primary mentor-connect" data-mentor-id="${mentor.id}">
                    💬 Connect
                </button>
            </div>
        `).join('');

        // Add event listeners to connect buttons
        document.querySelectorAll('.mentor-connect').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const mentorId = e.target.getAttribute('data-mentor-id');
                showNotification('Connection request sent!', 'success');
                console.log('Connecting to mentor:', mentorId);
            });
        });
    } catch (error) {
        console.error('Error populating mentors:', error);
        const container = document.getElementById('mentorsContainer');
        if (container) {
            container.innerHTML = '<p class="empty-state">Error loading mentors.</p>';
        }
    }
}

/**
 * Populate user connections (mentors/partners)
 */
async function populateConnections() {
    try {
        const container = document.getElementById('connectionsContainer');
        if (!container) return;

        // Mock connections data - replace with real data from Firestore
        const connections = [
            {
                id: '1',
                name: 'Arjun Krishnan',
                department: 'Computer Science',
                message: 'Sure, I can help you with that algorithm!',
                unread: 2
            },
            {
                id: '2',
                name: 'Aditya Kumar',
                department: 'Computer Science',
                message: 'Thanks for the notes!',
                unread: 0
            }
        ];

        if (connections.length === 0) {
            container.innerHTML = '<p class="empty-state">No connections yet. Find a mentor above!</p>';
            return;
        }

        container.innerHTML = connections.map(conn => `
            <div class="connection-card">
                <div class="connection-avatar">${conn.name.charAt(0)}</div>
                <div class="connection-info">
                    <h4 class="connection-name">${escapeHtml(conn.name)}</h4>
                    <p class="connection-dept">${escapeHtml(conn.department)}</p>
                    <p class="connection-msg">${escapeHtml(conn.message)}</p>
                </div>
                <div class="connection-actions">
                    ${conn.unread > 0 ? `<span class="unread-badge">${conn.unread}</span>` : ''}
                    <button class="action-btn primary">Message</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error populating connections:', error);
    }
}

// ========================================
// STUDY LOG & COMMUNITY SECTION
// ========================================

/**
 * Populate study logs
 */
async function populateStudyLogs() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const logs = await getUserStudyLogs(user.uid, 5);
        const container = document.getElementById('studyLogsContainer');

        if (!container) return;

        if (!logs || logs.length === 0) {
            container.innerHTML = '<p class="empty-state">No study logs yet. Add your first one to start tracking!</p>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="study-log-item">
                <div class="log-header">
                    <h4 class="log-subject">${escapeHtml(log.subject || 'Subject')}</h4>
                    <span class="log-duration">⏱️ ${log.duration || 0} min</span>
                </div>
                <p class="log-topic">${escapeHtml(log.topic || 'No description')}</p>
                <p class="log-date">${formatDate(log.createdAt)}</p>
                <div class="log-footer">
                    <span class="log-likes">👍 ${log.likes || 0}</span>
                    ${log.isPublic ? '<span class="badge">Public</span>' : '<span class="badge">Private</span>'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error populating study logs:', error);
    }
}

/**
 * Populate community feed
 */
async function populateCommunityFeed() {
    try {
        const container = document.getElementById('communityFeedContainer');
        if (!container) return;

        const posts = await getCommunityFeed(5);

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="empty-state">No public posts in the community yet.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="feed-post">
                <div class="post-header">
                    <div class="post-avatar">${post.userId?.charAt(0) || 'U'}</div>
                    <div class="post-info">
                        <h4 class="post-author">${escapeHtml(post.subject || 'Study Session')}</h4>
                        <p class="post-date">${formatDate(post.createdAt)}</p>
                    </div>
                </div>
                <p class="post-content">${escapeHtml(post.topic || post.description || 'Shared a study log')}</p>
                <div class="post-stats">
                    <span class="post-duration">⏱️ ${post.duration || 0} min</span>
                    <button class="like-btn" data-post-id="${post.id}">👍 ${post.likes || 0}</button>
                </div>
            </div>
        `).join('');

        // Add like button listeners
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                showNotification('Post liked! 👍', 'success');
            });
        });
    } catch (error) {
        console.error('Error populating community feed:', error);
        const container = document.getElementById('communityFeedContainer');
        if (container) {
            container.innerHTML = '<p class="empty-state">Error loading community feed.</p>';
        }
    }
}

// ========================================
// PROFILE SECTION
// ========================================

/**
 * Populate user profile
 */
async function populateProfile() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch user data
        const profile = await getUserProfile(user.uid);
        const streak = await getStreakData(user.uid);

        // Update avatar
        const avatar = document.getElementById('profileAvatar');
        if (avatar && profile?.name) {
            avatar.textContent = profile.name.charAt(0).toUpperCase();
        }

        // Update profile info
        if (document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = profile?.name || 'User';
        }
        if (document.getElementById('profileMeta')) {
            const year = profile?.year || 'Year';
            const dept = profile?.department || 'Department';
            document.getElementById('profileMeta').textContent = `${year} • ${dept}`;
        }

        // Update stats
        if (document.getElementById('profileStudyLogs')) {
            const logs = await getUserStudyLogs(user.uid);
            document.getElementById('profileStudyLogs').textContent = logs?.length || 0;
        }
        if (document.getElementById('profileStreak') && streak) {
            document.getElementById('profileStreak').textContent = `${streak.currentStreak || 0} days`;
        }
        if (document.getElementById('profileHours') && profile) {
            const hours = Math.round((profile.totalStudyHours || 0) / 60);
            document.getElementById('profileHours').textContent = `${hours}h`;
        }

        // Populate achievements
        await populateAchievements(user.uid);
    } catch (error) {
        console.error('Error populating profile:', error);
    }
}

/**
 * Populate user achievements
 */
async function populateAchievements(userId) {
    try {
        const achievements = await getUserAchievements(userId);
        const container = document.getElementById('achievementsContainer');

        if (!container) return;

        const achievementTypes = {
            '7-day-streak': { emoji: '🔥', name: '7-Day Streak', earned: achievements?.some(a => a.type === '7-day-streak') },
            'first-log': { emoji: '📚', name: 'First Study Log', earned: achievements?.some(a => a.type === 'first-log') },
            'helpful-mentor': { emoji: '⭐', name: 'Helpful Mentor', earned: achievements?.some(a => a.type === 'helpful-mentor') },
            '30-day-streak': { emoji: '💪', name: '30-Day Streak', earned: achievements?.some(a => a.type === '30-day-streak') },
            '100-hours': { emoji: '🏆', name: '100 Hours Logged', earned: achievements?.some(a => a.type === '100-hours') },
            'community-champion': { emoji: '🥇', name: 'Community Champion', earned: achievements?.some(a => a.type === 'community-champion') }
        };

        container.innerHTML = Object.entries(achievementTypes).map(([key, achievement]) => `
            <div class="achievement-badge ${achievement.earned ? 'earned' : 'locked'}">
                <div class="achievement-icon">${achievement.emoji}</div>
                <div class="achievement-name">${achievement.name}</div>
                ${achievement.earned ? '<div class="achievement-status">Earned</div>' : '<div class="achievement-status">Locked</div>'}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error populating achievements:', error);
    }
}

// ========================================
// BUTTON HANDLERS
// ========================================

/**
 * Initialize button event handlers
 */
function initializeButtonHandlers() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Study plan action buttons (specific selectors)
    const planActionButtons = document.querySelectorAll('.study-plan-card .action-btn');
    planActionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const isSecondary = button.classList.contains('secondary');
            const planCard = button.closest('.study-plan-card');
            const subject = planCard ? planCard.querySelector('.plan-subject').textContent : 'Subject';

            if (isSecondary) {
                showNotification(`Viewing details for: ${subject}`, 'info');
                console.log(`Viewing details for: ${subject}`);
            } else {
                showNotification(`Started learning: ${subject}`, 'success');
                console.log(`Continuing learning for: ${subject}`);
            }
        });
    });

    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showNotification('Edit profile feature coming soon!', 'info');
        });
    }

    // Add log button
    const addLogBtn = document.getElementById('addLogBtn');
    if (addLogBtn) {
        addLogBtn.addEventListener('click', () => {
            showNotification('Add study log form coming soon!', 'info');
        });
    }
}


/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// ANIMATIONS & VISUAL EFFECTS
// ========================================

/**
 * Initialize scroll animations
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.card, .study-plan-card, .roadmap-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format date to readable format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Calculate days remaining until a given date
 * @param {Date} targetDate - Target date
 * @returns {number} Days remaining
 */
function calculateDaysRemaining(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const timeDifference = target - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
}

// ========================================
// DYNAMIC CONTENT LOADING
// ========================================

/**
 * Load and display user's catch-up plans from Firestore
 * (Future enhancement)
 */
async function loadCatchUpPlans(userId) {
    try {
        // Future: Fetch plans from Firestore
        // const plansRef = collection(db, 'users', userId, 'plans');
        // const querySnapshot = await getDocs(plansRef);
        // Update UI with fetched plans
        console.log('Loading catch-up plans for user:', userId);
    } catch (error) {
        console.error('Error loading plans:', error);
    }
}

/**
 * Load and display user's roadmap items from Firestore
 * (Future enhancement)
 */
async function loadRoadmapItems(userId) {
    try {
        // Future: Fetch roadmap items from Firestore
        // const roadmapRef = collection(db, 'users', userId, 'roadmap');
        // const querySnapshot = await getDocs(roadmapRef);
        // Update UI with fetched items
        console.log('Loading roadmap items for user:', userId);
    } catch (error) {
        console.error('Error loading roadmap:', error);
    }
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize dashboard when DOM is loaded
 */
function initializeDashboardPage() {
    // Check authentication state
    initializeAuthState();

    // Initialize animations
    initializeScrollAnimations();

    // Log initialization complete
    console.log('Dashboard initialized successfully');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboardPage);
} else {
    initializeDashboardPage();
}

// ========================================
// ERROR HANDLING
// ========================================

/**
 * Global error handler for uncaught exceptions
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});

/**
 * Handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
