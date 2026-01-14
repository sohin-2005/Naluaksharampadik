// Firebase Data Initialization Script
// Run this in your browser console or as a Node.js script to populate Firestore

import { auth, db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    setDoc,
    doc,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('Starting Firebase data initialization...');

/**
 * Initialize all Firestore collections with sample data
 */
export async function initializeFirebaseData() {
    try {
        const userId = auth.currentUser?.uid || 'test-user-id';
        console.log('Using user ID:', userId);

        // Create sample mentor documents
        await createMentors();
        
        // Create user profile
        await createUserProfile(userId);
        
        // Create study logs
        await createStudyLogs(userId);
        
        // Create streak data
        await createStreak(userId);
        
        // Create catch-up plans
        const planId = await createCatchUpPlans(userId);
        
        // Create roadmap tasks for the plan
        if (planId) {
            await createRoadmapTasks(planId);
        }
        
        // Create connections
        await createConnections(userId);
        
        // Create achievements
        await createAchievements(userId);

        console.log('✅ Firebase data initialization complete!');
        alert('✅ Firebase has been populated with sample data!\n\nRefresh your dashboard to see the data.');
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Create mentor documents
 */
async function createMentors() {
    try {
        const mentorsData = [
            {
                name: 'Arjun Krishnan',
                year: 'Final Year',
                department: 'Computer Science',
                expertise: ['Data Structures', 'Algorithms', 'Web Development'],
                rating: 4.8,
                status: 'online',
                verified: true,
                studentsHelped: 23,
                bio: 'Passionate about helping students ace their exams. Expert in algorithms.',
                availableHours: 20,
                createdAt: serverTimestamp()
            },
            {
                name: 'Priya Sharma',
                year: '3rd Year',
                department: 'Electronics',
                expertise: ['Digital Electronics', 'Microprocessors', 'Circuit Design'],
                rating: 4.9,
                status: 'online',
                verified: true,
                studentsHelped: 31,
                bio: 'Electronics specialist. Happy to help with any circuit concepts.',
                availableHours: 25,
                createdAt: serverTimestamp()
            },
            {
                name: 'Rahul Menon',
                year: 'Final Year',
                department: 'Mechanical',
                expertise: ['Thermodynamics', 'Fluid Mechanics', 'CAD'],
                rating: 4.7,
                status: 'busy',
                verified: true,
                studentsHelped: 18,
                bio: 'Mechanical engineering mentor with industry experience.',
                availableHours: 15,
                createdAt: serverTimestamp()
            },
            {
                name: 'Sneha Patel',
                year: 'Final Year',
                department: 'Computer Science',
                expertise: ['Web Development', 'React', 'Node.js'],
                rating: 4.9,
                status: 'online',
                verified: true,
                studentsHelped: 28,
                bio: 'Full-stack developer. Loves teaching web technologies.',
                availableHours: 18,
                createdAt: serverTimestamp()
            }
        ];

        const mentorsRef = collection(db, 'mentors');
        for (const mentorData of mentorsData) {
            await addDoc(mentorsRef, mentorData);
        }
        console.log('✅ Created 4 mentors');
    } catch (error) {
        console.error('Error creating mentors:', error);
    }
}

/**
 * Create user profile
 */
async function createUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            name: 'Rahul Verma',
            email: auth.currentUser?.email || 'student@example.com',
            year: '2nd Year',
            department: 'Computer Science',
            totalStudyHours: 5220,
            currentStreak: 5,
            role: 'student',
            bio: 'Passionate about algorithms and web development.',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('✅ Created user profile for:', userId);
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}

/**
 * Create study logs
 */
async function createStudyLogs(userId) {
    try {
        const logsData = [
            {
                userId,
                subject: 'Data Structures',
                topic: 'Binary Trees Implementation',
                duration: 90,
                description: 'Completed binary tree implementation and practiced traversal algorithms.',
                isPublic: true,
                likes: 12,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24))
            },
            {
                userId,
                subject: 'Digital Electronics',
                topic: 'Flip Flops',
                duration: 60,
                description: 'Studied SR, JK, and D flip-flops. Made truth tables and timing diagrams.',
                isPublic: true,
                likes: 8,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 48))
            },
            {
                userId,
                subject: 'Web Development',
                topic: 'React Hooks',
                duration: 120,
                description: 'Deep dive into useState, useEffect, and custom hooks in React.',
                isPublic: true,
                likes: 15,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 72))
            },
            {
                userId,
                subject: 'Algorithms',
                topic: 'Sorting Algorithms',
                duration: 75,
                description: 'Compared Quick Sort, Merge Sort, and Heap Sort. Analyzed time complexity.',
                isPublic: true,
                likes: 20,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 96))
            },
            {
                userId,
                subject: 'Database Systems',
                topic: 'SQL Queries',
                duration: 85,
                description: 'Practiced JOIN operations, subqueries, and indexing.',
                isPublic: true,
                likes: 10,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 120))
            }
        ];

        const logsRef = collection(db, 'studyLogs');
        for (const logData of logsData) {
            await addDoc(logsRef, logData);
        }
        console.log('✅ Created 5 study logs');
    } catch (error) {
        console.error('Error creating study logs:', error);
    }
}

/**
 * Create streak data
 */
async function createStreak(userId) {
    try {
        const streakRef = doc(db, 'streaks', userId);
        await setDoc(streakRef, {
            currentStreak: 5,
            longestStreak: 12,
            totalHours: 5220,
            lastLogDate: serverTimestamp(),
            totalLogsCount: 45,
            updatedAt: serverTimestamp()
        });
        console.log('✅ Created streak data');
    } catch (error) {
        console.error('Error creating streak:', error);
    }
}

/**
 * Create catch-up plans
 */
async function createCatchUpPlans(userId) {
    try {
        const plansData = [
            {
                userId,
                subject: 'Data Structures',
                examDate: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)),
                progress: 85,
                difficulty: 'medium',
                status: 'active',
                description: 'Master all data structures before semester exam.',
                createdAt: serverTimestamp()
            },
            {
                userId,
                subject: 'Web Development',
                examDate: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)),
                progress: 62,
                difficulty: 'medium',
                status: 'active',
                description: 'Complete full-stack web development course and projects.',
                createdAt: serverTimestamp()
            },
            {
                userId,
                subject: 'Database Systems',
                examDate: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
                progress: 45,
                difficulty: 'hard',
                status: 'active',
                description: 'Learn SQL, normalization, and database design patterns.',
                createdAt: serverTimestamp()
            }
        ];

        const plansRef = collection(db, 'catchUpPlans');
        let planId = null;
        
        for (const planData of plansData) {
            const docRef = await addDoc(plansRef, planData);
            if (!planId) planId = docRef.id;
        }
        
        console.log('✅ Created 3 catch-up plans');
        return planId;
    } catch (error) {
        console.error('Error creating plans:', error);
        return null;
    }
}

/**
 * Create roadmap tasks
 */
async function createRoadmapTasks(planId) {
    try {
        const tasksData = [
            { dayNumber: 1, title: 'Arrays Fundamentals', estimatedHours: 4 },
            { dayNumber: 2, title: 'Linked Lists', estimatedHours: 5 },
            { dayNumber: 3, title: 'Stacks & Queues', estimatedHours: 4 },
            { dayNumber: 4, title: 'Trees Introduction', estimatedHours: 5 },
            { dayNumber: 5, title: 'Binary Trees', estimatedHours: 6 },
            { dayNumber: 6, title: 'BST & AVL Trees', estimatedHours: 5 },
            { dayNumber: 7, title: 'Graphs Basics', estimatedHours: 4 },
            { dayNumber: 8, title: 'Graph Traversals', estimatedHours: 5 },
            { dayNumber: 9, title: 'Sorting Algorithms', estimatedHours: 6 },
            { dayNumber: 10, title: 'Searching & Hashing', estimatedHours: 4 }
        ];

        const tasksRef = collection(db, 'roadmapTasks');
        
        for (const taskData of tasksData) {
            await addDoc(tasksRef, {
                planId,
                ...taskData,
                isCompleted: taskData.dayNumber <= 3, // First 3 days completed
                completedAt: taskData.dayNumber <= 3 ? serverTimestamp() : null,
                description: `Complete ${taskData.title} module and practice problems.`,
                createdAt: serverTimestamp()
            });
        }
        
        console.log('✅ Created 10 roadmap tasks');
    } catch (error) {
        console.error('Error creating roadmap tasks:', error);
    }
}

/**
 * Create connections (mentor relationships)
 */
async function createConnections(userId) {
    try {
        // Get first mentor ID (you'll need to update this with actual mentor IDs from your collection)
        const connectionsData = [
            {
                mentorId: 'mentor-1', // Replace with actual mentor ID
                studentId: userId,
                status: 'active',
                lastMessage: 'Sure, I can help you with that algorithm!',
                unreadCount: 2,
                createdAt: serverTimestamp()
            },
            {
                mentorId: 'mentor-2', // Replace with actual mentor ID
                studentId: userId,
                status: 'active',
                lastMessage: 'Thanks for the notes!',
                unreadCount: 0,
                createdAt: serverTimestamp()
            }
        ];

        const connectionsRef = collection(db, 'connections');
        for (const connData of connectionsData) {
            await addDoc(connectionsRef, connData);
        }
        console.log('✅ Created 2 connections');
    } catch (error) {
        console.error('Error creating connections:', error);
    }
}

/**
 * Create achievements
 */
async function createAchievements(userId) {
    try {
        const achievementsData = [
            {
                userId,
                type: '7-day-streak',
                earnedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)),
                data: { progressValue: 100 }
            },
            {
                userId,
                type: 'first-log',
                earnedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)),
                data: { progressValue: 100 }
            },
            {
                userId,
                type: 'helpful-mentor',
                earnedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)),
                data: { progressValue: 100 }
            }
        ];

        const achievementsRef = collection(db, 'achievements');
        for (const achievementData of achievementsData) {
            await addDoc(achievementsRef, achievementData);
        }
        console.log('✅ Created 3 achievements');
    } catch (error) {
        console.error('Error creating achievements:', error);
    }
}

// Export for use in HTML
window.initializeFirebaseData = initializeFirebaseData;
