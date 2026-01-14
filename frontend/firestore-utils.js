// firestore-utils.js
// Firebase Firestore utility functions for data fetching and manipulation

import { auth, db } from './firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
    orderBy,
    limit,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('Firestore utils loaded');

// ========================================
// USER FUNCTIONS
// ========================================

/**
 * Fetch current user's profile data
 * @returns {Promise<Object|null>} User document data or null
 */
export async function getUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return {
                id: userSnap.id,
                ...userSnap.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Create or update user profile
 * @param {string} userId 
 * @param {Object} userData 
 */
export async function updateUserProfile(userId, userData) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...userData,
            updatedAt: serverTimestamp()
        });
        console.log('User profile updated');
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

// ========================================
// STUDY LOG FUNCTIONS
// ========================================

/**
 * Get all study logs for current user
 * @param {string} userId 
 * @param {number} limitCount - Max results
 * @returns {Promise<Array>}
 */
export async function getUserStudyLogs(userId, limitCount = 10) {
    try {
        const logsRef = collection(db, 'studyLogs');
        const q = query(
            logsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching study logs:', error);
        return [];
    }
}

/**
 * Add a new study log
 * @param {string} userId 
 * @param {Object} logData 
 */
export async function createStudyLog(userId, logData) {
    try {
        const logsRef = collection(db, 'studyLogs');
        const docRef = await addDoc(logsRef, {
            userId,
            createdAt: serverTimestamp(),
            likes: 0,
            likedBy: [],
            isPublic: logData.isPublic || false,
            ...logData
        });
        
        // Update streak after logging
        await updateStudyStreak(userId);
        
        // Check achievements
        await checkAchievements(userId);
        
        console.log('Study log created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating study log:', error);
        return null;
    }
}

/**
 * Get total study hours for user
 * @param {string} userId 
 * @returns {Promise<number>}
 */
export async function getTotalStudyHours(userId) {
    try {
        const logs = await getUserStudyLogs(userId, 1000);
        const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
        return Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
    } catch (error) {
        console.error('Error calculating total hours:', error);
        return 0;
    }
}

// ========================================
// STREAK FUNCTIONS
// ========================================

/**
 * Get user's current streak data
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export async function getStreakData(userId) {
    try {
        const streakRef = doc(db, 'streaks', userId);
        const streakSnap = await getDoc(streakRef);
        
        if (streakSnap.exists()) {
            return streakSnap.data();
        }
        
        // Initialize if doesn't exist
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastLogDate: null,
            totalHours: 0
        };
    } catch (error) {
        console.error('Error fetching streak data:', error);
        return null;
    }
}

/**
 * Update streak after study log
 * Increments streak if log is from today or yesterday
 * @param {string} userId 
 */
export async function updateStudyStreak(userId) {
    try {
        const streakRef = doc(db, 'streaks', userId);
        const streakSnap = await getDoc(streakRef);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        let streakData = streakSnap.exists() ? streakSnap.data() : {
            currentStreak: 0,
            longestStreak: 0,
            lastLogDate: null,
            totalHours: 0
        };
        
        // Get last log date
        const logs = await getUserStudyLogs(userId, 1);
        const lastLogDate = logs.length > 0 
            ? new Date(logs[0].createdAt.toDate())
            : null;
        
        if (!lastLogDate) {
            return;
        }
        
        lastLogDate.setHours(0, 0, 0, 0);
        const lastLogTime = lastLogDate.getTime();
        const daysDiff = (todayTime - lastLogTime) / (1000 * 60 * 60 * 24);
        
        // Logic to update streak
        if (daysDiff === 0) {
            // Logged today, maintain streak
            streakData.currentStreak = streakData.currentStreak || 1;
        } else if (daysDiff === 1) {
            // Logged yesterday, increment streak
            streakData.currentStreak = (streakData.currentStreak || 0) + 1;
        } else {
            // Reset streak
            streakData.currentStreak = 1;
        }
        
        // Update longest streak
        if (streakData.currentStreak > streakData.longestStreak) {
            streakData.longestStreak = streakData.currentStreak;
        }
        
        // Update total hours
        streakData.totalHours = await getTotalStudyHours(userId);
        streakData.lastLogDate = lastLogDate;
        streakData.updatedAt = serverTimestamp();
        
        await updateDoc(streakRef, streakData);
        console.log('Streak updated:', streakData.currentStreak);
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// ========================================
// MENTOR FUNCTIONS
// ========================================

/**
 * Get list of available mentors
 * @param {number} limitCount 
 * @returns {Promise<Array>}
 */
export async function getAvailableMentors(limitCount = 10) {
    try {
        const mentorsRef = collection(db, 'mentors');
        const q = query(
            mentorsRef,
            where('status', '!=', 'offline'),
            orderBy('status'),
            orderBy('rating', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching mentors:', error);
        return [];
    }
}

/**
 * Search mentors by department and expertise
 * @param {string} department 
 * @param {string} expertise 
 * @returns {Promise<Array>}
 */
export async function searchMentors(department, expertise) {
    try {
        const mentorsRef = collection(db, 'mentors');
        const q = query(
            mentorsRef,
            where('department', '==', department),
            where('expertise', 'array-contains', expertise),
            orderBy('rating', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error searching mentors:', error);
        return [];
    }
}

// ========================================
// CONNECTIONS FUNCTIONS
// ========================================

/**
 * Get user's mentorship connections
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserConnections(userId) {
    try {
        const connectionsRef = collection(db, 'connections');
        const q = query(
            connectionsRef,
            where('studentId', '==', userId),
            where('status', '==', 'connected'),
            orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching connections:', error);
        return [];
    }
}

/**
 * Create a mentorship connection request
 * @param {string} studentId 
 * @param {string} mentorId 
 */
export async function createConnection(studentId, mentorId) {
    try {
        const connectionRef = collection(db, 'connections');
        
        // Get mentor name
        const mentorData = await getUserProfile(mentorId);
        
        const docRef = await addDoc(connectionRef, {
            studentId,
            mentorId,
            mentorName: mentorData?.name || 'Unknown Mentor',
            status: 'pending',
            initiatedBy: 'student',
            unreadCount: 0,
            totalSessions: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log('Connection created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating connection:', error);
        return null;
    }
}

// ========================================
// CATCH-UP PLAN FUNCTIONS
// ========================================

/**
 * Get user's catch-up plans
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getCatchUpPlans(userId) {
    try {
        const plansRef = collection(db, 'catchUpPlans');
        const q = query(
            plansRef,
            where('userId', '==', userId),
            where('status', '==', 'active'),
            orderBy('examDate', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching catch-up plans:', error);
        return [];
    }
}

/**
 * Get roadmap tasks for a plan
 * @param {string} planId 
 * @returns {Promise<Array>}
 */
export async function getRoadmapTasks(planId) {
    try {
        const tasksRef = collection(db, 'roadmapTasks');
        const q = query(
            tasksRef,
            where('planId', '==', planId),
            orderBy('dayNumber', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching roadmap tasks:', error);
        return [];
    }
}

/**
 * Mark roadmap task as completed
 * @param {string} taskId 
 */
export async function completeRoadmapTask(taskId) {
    try {
        const taskRef = doc(db, 'roadmapTasks', taskId);
        await updateDoc(taskRef, {
            isCompleted: true,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Task completed:', taskId);
    } catch (error) {
        console.error('Error completing task:', error);
    }
}

// ========================================
// COMMUNITY FEED FUNCTIONS
// ========================================

/**
 * Get community feed posts (from all users, ordered by date)
 * @param {number} limitCount - Max number of posts to fetch
 * @returns {Promise<Array>}
 */
export async function getCommunityFeed(limitCount = 10) {
    try {
        const feedRef = collection(db, 'studyLogs');
        const q = query(
            feedRef,
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            likes: doc.data().likes || 0,
            isPublic: true
        }));
    } catch (error) {
        console.error('Error fetching community feed:', error);
        return [];
    }
}

/**
 * Get public posts from a specific user
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserPublicPosts(userId) {
    try {
        const postsRef = collection(db, 'studyLogs');
        const q = query(
            postsRef,
            where('userId', '==', userId),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching user public posts:', error);
        return [];
    }
}

/**
 * Like a post (increment likes count)
 * @param {string} postId 
 */
export async function likePost(postId) {
    try {
        const postRef = doc(db, 'studyLogs', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
            const currentLikes = postSnap.data().likes || 0;
            await updateDoc(postRef, {
                likes: currentLikes + 1,
                updatedAt: serverTimestamp()
            });
            console.log('Post liked:', postId);
            return currentLikes + 1;
        }
    } catch (error) {
        console.error('Error liking post:', error);
        return null;
    }
}

/**
 * Unlike a post (decrement likes count)
 * @param {string} postId 
 */
export async function unlikePost(postId) {
    try {
        const postRef = doc(db, 'studyLogs', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
            const currentLikes = Math.max(0, (postSnap.data().likes || 0) - 1);
            await updateDoc(postRef, {
                likes: currentLikes,
                updatedAt: serverTimestamp()
            });
            console.log('Post unliked:', postId);
            return currentLikes;
        }
    } catch (error) {
        console.error('Error unliking post:', error);
        return null;
    }
}

/**
 * Get trending posts (most liked in last 7 days)
 * @param {number} limitCount - Max results
 * @returns {Promise<Array>}
 */
export async function getTrendingPosts(limitCount = 5) {
    try {
        const sevenDaysAgo = Timestamp.fromDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        const feedRef = collection(db, 'studyLogs');
        const q = query(
            feedRef,
            where('isPublic', '==', true),
            where('createdAt', '>=', sevenDaysAgo),
            orderBy('likes', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        return [];
    }
}

// ========================================
// ACHIEVEMENTS FUNCTIONS
// ========================================

/**
 * Get user's achievements
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserAchievements(userId) {
    try {
        const achievementsRef = collection(db, 'achievements');
        const q = query(
            achievementsRef,
            where('userId', '==', userId),
            orderBy('earnedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
}

/**
 * Award achievement to user
 * @param {string} userId 
 * @param {string} type 
 * @param {Object} data 
 */
export async function awardAchievement(userId, type, data = {}) {
    try {
        // Check if already awarded
        const existing = await getUserAchievements(userId);
        if (existing.some(a => a.type === type)) {
            console.log('Achievement already earned:', type);
            return;
        }
        
        const achievementsRef = collection(db, 'achievements');
        const docRef = await addDoc(achievementsRef, {
            userId,
            type,
            data,
            earnedAt: serverTimestamp()
        });
        
        console.log('Achievement awarded:', type);
        return docRef.id;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return null;
    }
}

/**
 * Check and award achievements based on user progress
 * @param {string} userId 
 */
export async function checkAchievements(userId) {
    try {
        const streakData = await getStreakData(userId);
        const logs = await getUserStudyLogs(userId, 100);
        
        // First study log
        if (logs.length === 1) {
            await awardAchievement(userId, 'first_study_log');
        }
        
        // Streak achievements
        if (streakData.currentStreak === 7) {
            await awardAchievement(userId, '7_day_streak');
        }
        if (streakData.currentStreak === 14) {
            await awardAchievement(userId, '14_day_streak');
        }
        
        // Hour milestones
        const totalHours = await getTotalStudyHours(userId);
        if (totalHours >= 100) {
            await awardAchievement(userId, '100_hours');
        }
        
        console.log('Achievement check complete');
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}

// ========================================
// STATS & ANALYTICS
// ========================================

/**
 * Get user dashboard stats
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export async function getDashboardStats(userId) {
    try {
        const [userProfile, streakData, studyLogs, connections, catchUpPlans, achievements] = await Promise.all([
            getUserProfile(userId),
            getStreakData(userId),
            getUserStudyLogs(userId, 100),
            getUserConnections(userId),
            getCatchUpPlans(userId),
            getUserAchievements(userId)
        ]);
        
        const totalHours = studyLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0) / 60;
        
        return {
            userProfile,
            streak: streakData?.currentStreak || 0,
            longestStreak: streakData?.longestStreak || 0,
            totalHours: Math.round(totalHours * 10) / 10,
            studyLogsCount: studyLogs.length,
            connectionsCount: connections.length,
            activePlansCount: catchUpPlans.length,
            achievementsCount: achievements.length,
            recentLogs: studyLogs.slice(0, 5),
            recentAchievements: achievements.slice(0, 3)
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

/**
 * Get weekly study stats
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getWeeklyStats(userId) {
    try {
        const logs = await getUserStudyLogs(userId, 100);
        const weeklyData = {};
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            weeklyData[day] = 0;
        });
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        logs.forEach(log => {
            const logDate = new Date(log.createdAt.toDate());
            if (logDate >= weekAgo) {
                const dayName = days[logDate.getDay()];
                weeklyData[dayName] += log.durationMinutes || 0;
            }
        });
        
        return Object.entries(weeklyData).map(([day, minutes]) => ({
            day,
            hours: Math.round(minutes / 60 * 10) / 10
        }));
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        return [];
    }
}

console.log('Firestore utilities ready');
