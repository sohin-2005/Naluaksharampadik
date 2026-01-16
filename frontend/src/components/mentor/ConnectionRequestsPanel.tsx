import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Users, Check, X, MessageCircle, Mail, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ConnectionRequest {
  id: string;
  status: string;
  created_at: string;
  message?: string;
  student?: {
    id: string;
    full_name: string;
    email: string;
    department: string;
    year?: number;
    profile_image?: string;
    bio?: string;
  };
  mentee?: {
    id: string;
    full_name: string;
    email: string;
    department: string;
    year?: number;
    profile_image?: string;
    bio?: string;
  };
}

interface ActiveConnection extends ConnectionRequest {
  accepted_at?: string;
}

export default function ConnectionRequestsPanel() {
  const { userProfile } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [activeConnections, setActiveConnections] = useState<ActiveConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isMentor = userProfile?.role === 'mentor';
  const isAlumni = userProfile?.role === 'alumni';

  useEffect(() => {
    if (userProfile?.id && (isMentor || isAlumni)) {
      fetchRequests();
      fetchActiveConnections();
    }
  }, [userProfile, isMentor, isAlumni]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      if (isMentor) {
        // Fetch mentor connection requests
        const { data, error } = await supabase
          .from('mentorship_connections')
          .select(`
            *,
            mentee:mentee_id (
              id, full_name, email, department, year, profile_image, bio
            )
          `)
          .eq('mentor_id', userProfile?.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingRequests(data || []);
      } else if (isAlumni) {
        // Fetch alumni connection requests
        const { data, error } = await supabase
          .from('alumni_connections')
          .select(`
            *,
            student:student_id (
              id, full_name, email, department, year, profile_image, bio
            )
          `)
          .eq('alumni_id', userProfile?.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveConnections = async () => {
    try {
      if (isMentor) {
        const { data, error } = await supabase
          .from('mentorship_connections')
          .select(`
            *,
            mentee:mentee_id (
              id, full_name, email, department, year, profile_image, bio
            )
          `)
          .eq('mentor_id', userProfile?.id)
          .eq('status', 'active')
          .order('accepted_at', { ascending: false });

        if (error) throw error;
        setActiveConnections(data || []);
      } else if (isAlumni) {
        const { data, error } = await supabase
          .from('alumni_connections')
          .select(`
            *,
            student:student_id (
              id, full_name, email, department, year, profile_image, bio
            )
          `)
          .eq('alumni_id', userProfile?.id)
          .eq('status', 'active')
          .order('accepted_at', { ascending: false });

        if (error) throw error;
        setActiveConnections(data || []);
      }
    } catch (error) {
      console.error('Error fetching active connections:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const tableName = isMentor ? 'mentorship_connections' : 'alumni_connections';
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: 'active', 
          accepted_at: new Date().toISOString() 
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh both lists
      await fetchRequests();
      await fetchActiveConnections();
      
      alert('Connection request accepted! ✅');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const tableName = isMentor ? 'mentorship_connections' : 'alumni_connections';
      
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      await fetchRequests();
      alert('Connection request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPersonFromRequest = (request: ConnectionRequest) => {
    return request.mentee || request.student;
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Connection Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                {pendingRequests.length} New
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Review and respond to student connection requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading requests...</p>
            </div>
          ) : pendingRequests.length > 0 ? (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const person = getPersonFromRequest(request);
                  if (!person) return null;

                  return (
                    <Card key={request.id} className="bg-neutral-800 border-neutral-700 p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          {person.profile_image ? (
                            <img
                              src={person.profile_image}
                              alt={person.full_name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <Avatar className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500">
                              <AvatarFallback className="text-white font-bold">
                                {person.full_name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-neutral-800" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {person.full_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                <span>{person.department}</span>
                                {person.year && (
                                  <>
                                    <span>•</span>
                                    <span>Year {person.year}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(request.created_at)}</span>
                            </div>
                          </div>

                          {person.bio && (
                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                              {person.bio}
                            </p>
                          )}

                          {request.message && (
                            <div className="mb-3 p-3 rounded-lg bg-neutral-700/50 border border-neutral-600">
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Introduction Message
                              </p>
                              <p className="text-sm text-gray-300">{request.message}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={processingId === request.id}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              {processingId === request.id ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={processingId === request.id}
                              variant="outline"
                              className="flex-1 border-red-700 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No pending requests</p>
              <p className="text-sm text-gray-500 mt-1">
                You'll see connection requests from students here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Connections */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            Active Connections
            {activeConnections.length > 0 && (
              <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                {activeConnections.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeConnections.length > 0 ? (
            <ScrollArea className="max-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeConnections.map((connection) => {
                  const person = getPersonFromRequest(connection);
                  if (!person) return null;

                  return (
                    <Card
                      key={connection.id}
                      className="bg-neutral-800 border-neutral-700 p-3 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {person.profile_image ? (
                          <img
                            src={person.profile_image}
                            alt={person.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-fuchsia-500 to-purple-500">
                            <AvatarFallback className="text-white font-bold text-sm">
                              {person.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">
                            {person.full_name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {person.department}
                            {person.year && ` • Year ${person.year}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-purple-300 hover:bg-purple-500/10"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No active connections yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Accepted connections will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
