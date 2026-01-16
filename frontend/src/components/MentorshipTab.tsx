
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Search, MessageCircle, Star, CheckCircle, Users, Check, X } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MentorshipTabProps {
    userRole: 'student' | 'mentor' | 'alumni';
}

interface Mentor {
    id: string;
    name: string;
    year: string;
    department: string;
    expertise: string[];
    rating: number;
    studentsHelped: number;
    availability: 'online' | 'busy' | 'offline';
    verified: boolean;
}

export default function MentorshipTab({ userRole }: MentorshipTabProps) {
    const { userProfile } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [studentRequests, setStudentRequests] = useState<any[]>([]);
    const [myConnections, setMyConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Debug logs
    console.log('🎯 MentorshipTab - userRole prop:', userRole);
    console.log('👤 MentorshipTab - userProfile:', userProfile);
    console.log('📝 MentorshipTab - mentors state:', mentors);

    useEffect(() => {
        console.log('⚡ useEffect triggered - userRole:', userRole);
        if (userRole === 'student') {
            console.log('🔍 Calling fetchMentors...');
            fetchMentors();
        } else {
            console.log('📋 Calling fetchStudentRequests...');
            fetchStudentRequests();
        }
        fetchMyConnections();
    }, [userRole]);

    const fetchMentors = async () => {
        try {
            console.log('🔍 Fetching mentors/alumni...');
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .in('role', ['mentor', 'alumni']);

            if (error) {
                console.error('❌ Error fetching mentors:', error);
                throw error;
            }

            console.log('✅ Raw mentors data from Supabase:', data);
            console.log(`📊 Found ${data?.length || 0} mentors/alumni`);

            const transformedMentors: Mentor[] = (data || []).map((user) => ({
                id: user.id,
                name: user.full_name,
                year: `${user.year || 'N/A'} Year`,
                department: user.department,
                expertise: user.areas_of_expertise || [],
                rating: Math.random() * 2 + 3.5,
                studentsHelped: Math.floor(Math.random() * 50 + 5),
                availability: Math.random() > 0.3 ? 'online' : 'busy',
                verified: user.is_verified,
            }));

            console.log('🎯 Transformed mentors:', transformedMentors);
            setMentors(transformedMentors);
        } catch (error) {
            console.error('💥 Error fetching mentors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('mentorship_connections')
                .select(`
                    *,
                    mentee:mentee_id (
                        id, full_name, email, department, year, profile_image
                    )
                `)
                .eq(userRole === 'mentor' ? 'mentor_id' : 'alumni_id', userProfile?.id)
                .eq('status', 'pending');

            if (error) throw error;
            setStudentRequests(data || []);
        } catch (error) {
            console.error('Error fetching student requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyConnections = async () => {
        try {
            const { data, error } = await supabase
                .from('mentorship_connections')
                .select(`
                    *,
                    mentor:mentor_id (id, full_name, department),
                    mentee:mentee_id (id, full_name, department)
                `)
                .eq('status', 'active');

            if (error) throw error;
            setMyConnections(data || []);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    const handleApproveRequest = async (connectionId: string) => {
        try {
            const { error } = await supabase
                .from('mentorship_connections')
                .update({ status: 'active', accepted_at: new Date() })
                .eq('id', connectionId);

            if (error) throw error;
            fetchStudentRequests();
            fetchMyConnections();
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleRejectRequest = async (connectionId: string) => {
        try {
            const { error } = await supabase
                .from('mentorship_connections')
                .update({ status: 'rejected' })
                .eq('id', connectionId);

            if (error) throw error;
            fetchStudentRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const handleConnectWithMentor = async (mentorId: string) => {
        try {
            const { error } = await supabase
                .from('mentorship_connections')
                .insert({
                    mentor_id: mentorId,
                    mentee_id: userProfile?.id,
                    status: 'pending',
                });

            if (error) throw error;
            alert('Connection request sent! Waiting for mentor approval...');
        } catch (error) {
            console.error('Error creating connection:', error);
        }
    };

    // STUDENT VIEW - Find Mentors
    if (userRole === 'student') {
        console.log('📊 Rendering student view. Total mentors:', mentors.length);
        console.log('🔎 Search query:', searchQuery);
        
        const filteredMentors = mentors.filter(
            (mentor) =>
                mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mentor.expertise.some((exp) =>
                    exp.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                mentor.department.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        console.log('✨ Filtered mentors count:', filteredMentors.length);
        console.log('📋 Filtered mentors:', filteredMentors);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Find Mentor */}
                <div className="lg:col-span-2">
                    <Card className="bg-neutral-900 border border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Find Your Mentor
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Connect with verified seniors who are ready to guide you through your academic journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Search className="w-4 h-4 text-gray-400 mt-3" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, department, or expertise..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mentors List */}
                    <Card className="bg-neutral-900 border border-neutral-800">
                        <CardContent className="p-0">
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-4 p-4">
                                    {filteredMentors.length > 0 ? (
                                        filteredMentors.map((mentor) => (
                                            <Card
                                                key={mentor.id}
                                                className={`p-4 cursor-pointer transition-all ${
                                                    selectedMentor?.id === mentor.id
                                                        ? 'bg-indigo-900/40 border-indigo-500/50'
                                                        : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750'
                                                }`}
                                                onClick={() => setSelectedMentor(mentor)}
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500">
                                                        <AvatarFallback className="text-white font-bold">
                                                            {mentor.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white flex items-center gap-1">
                                                            {mentor.name}
                                                            {mentor.verified && (
                                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                            )}
                                                        </h3>
                                                        <p className="text-xs text-gray-400">
                                                            {mentor.year} • {mentor.department}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="border-green-500/30 text-green-300 bg-green-500/10">
                                                        {mentor.availability}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3 h-3 ${
                                                                    i < Math.floor(mentor.rating)
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'text-neutral-600'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-semibold text-amber-400">{mentor.rating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-400 ml-auto">Helped {mentor.studentsHelped}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="bg-purple-500/20 text-purple-200 text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <Button 
                                                    onClick={() => handleConnectWithMentor(mentor.id)}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Connect
                                                </Button>
                                            </Card>
                                        ))
                                    ) : loading ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">Loading mentors...</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">No mentors found</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {mentors.length === 0 
                                                    ? 'No verified mentors available yet.' 
                                                    : 'Try adjusting your search query.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: My Connections */}
                <Card className="bg-neutral-900 border border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-400" />
                            My Mentors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3">
                                {myConnections.length > 0 ? (
                                    myConnections.map((connection) => (
                                        <Card key={connection.id} className="bg-neutral-800 border-neutral-700 p-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500">
                                                    <AvatarFallback className="text-white font-bold text-xs">
                                                        {connection.mentor?.full_name
                                                            ?.split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('') || 'M'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{connection.mentor?.full_name}</p>
                                                    <p className="text-xs text-gray-400">{connection.mentor?.department}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm">No mentors yet</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // MENTOR/ALUMNI VIEW - Student Requests
    return (
        <div className="space-y-6">
            {/* Incoming Requests */}
            <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Student Requests
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Review and approve mentorship requests from students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {studentRequests.length > 0 ? (
                        <div className="space-y-3">
                            {studentRequests.map((request) => (
                                <Card key={request.id} className="bg-neutral-800 border-neutral-700 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500">
                                                <AvatarFallback className="text-white font-bold">
                                                    {request.mentee?.full_name
                                                        ?.split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('') || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-white">{request.mentee?.full_name}</h3>
                                                <p className="text-xs text-gray-400">{request.mentee?.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleApproveRequest(request.id)}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleRejectRequest(request.id)}
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No pending student requests</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Connections */}
            <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        Active Connections
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {myConnections.length > 0 ? (
                        <div className="space-y-3">
                            {myConnections.map((connection) => {
                                const isMentor = userRole === 'mentor';
                                const otherPerson = isMentor ? connection.mentee : connection.mentor;
                                return (
                                    <Card key={connection.id} className="bg-neutral-800 border-neutral-700 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Avatar className="h-10 w-10 bg-gradient-to-br from-fuchsia-500 to-purple-500">
                                                    <AvatarFallback className="text-white font-bold text-sm">
                                                        {otherPerson?.full_name
                                                            ?.split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('') || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-white">{otherPerson?.full_name}</h3>
                                                    <p className="text-xs text-gray-400">{otherPerson?.department}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-500/10">
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                Message
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No active connections yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
