import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Clock, Calendar, MapPin, Award, Briefcase, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface MentorProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  year?: number;
  profile_image?: string;
  bio?: string;
  areas_of_expertise?: string[];
  is_verified: boolean;
}

interface AlumniProfile extends MentorProfile {
  current_position?: string;
  company?: string;
}

interface Availability {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function AvailableMentorsPanel() {
  const { userProfile } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [availability, setAvailability] = useState<Record<string, Availability[]>>({});
  const [selectedPerson, setSelectedPerson] = useState<MentorProfile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'mentors' | 'alumni'>('mentors');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'student') {
      fetchMentors();
      fetchAlumni();
      fetchExistingRequests();
    }
  }, [userProfile]);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'mentor')
        .eq('is_verified', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setMentors(data || []);
      
      // Fetch availability for mentors
      if (data && data.length > 0) {
        const mentorIds = data.map(m => m.id);
        const { data: availData } = await supabase
          .from('mentor_availability')
          .select('*')
          .in('mentor_id', mentorIds)
          .eq('is_available', true);

        if (availData) {
          const grouped = availData.reduce((acc, curr) => {
            if (!acc[curr.mentor_id]) acc[curr.mentor_id] = [];
            acc[curr.mentor_id].push(curr);
            return acc;
          }, {} as Record<string, Availability[]>);
          setAvailability(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'alumni')
        .eq('is_verified', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const fetchExistingRequests = async () => {
    if (!userProfile?.id) return;
    
    try {
      // Fetch existing mentor connection requests
      const { data: mentorRequests, error: mentorError } = await supabase
        .from('mentorship_connections')
        .select('mentor_id')
        .eq('mentee_id', userProfile.id)
        .in('status', ['pending', 'active']);

      if (mentorError) {
        console.error('Error fetching mentor requests:', mentorError);
      } else if (mentorRequests) {
        const mentorIds = mentorRequests.map(r => r.mentor_id);
        setSentRequests(prev => {
          const newSet = new Set(prev);
          mentorIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }

      // Fetch existing alumni connection requests
      const { data: alumniRequests, error: alumniError } = await supabase
        .from('alumni_connections')
        .select('alumni_id')
        .eq('student_id', userProfile.id)
        .in('status', ['pending', 'active']);

      if (alumniError) {
        console.error('Error fetching alumni requests:', alumniError);
      } else if (alumniRequests) {
        const alumniIds = alumniRequests.map(r => r.alumni_id);
        setSentRequests(prev => {
          const newSet = new Set(prev);
          alumniIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error fetching existing requests:', error);
    }
  };

  const handleConnect = async () => {
    if (!selectedPerson || !userProfile) {
      console.error('Missing selectedPerson or userProfile', { selectedPerson, userProfile });
      setIsError(true);
      setSuccessMessage('Error: User profile not loaded. Please refresh the page.');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsError(false);
      }, 4000);
      return;
    }

    // Validate that we have valid UUIDs
    if (!selectedPerson.id || !userProfile.id) {
      console.error('Invalid IDs', { selectedPersonId: selectedPerson.id, userProfileId: userProfile.id });
      setIsError(true);
      setSuccessMessage('Error: Invalid user IDs. Please refresh and try again.');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsError(false);
      }, 4000);
      return;
    }

    setIsConnecting(true);
    console.log('🔄 Sending connection request...', {
      selectedPerson: selectedPerson.full_name,
      selectedPersonId: selectedPerson.id,
      role: selectedPerson.role,
      userProfile: userProfile.full_name,
      userId: userProfile.id
    });

    try {
      if (selectedPerson.role === 'mentor') {
        console.log('📤 Inserting into mentorship_connections table...');
        const insertData = {
          mentor_id: selectedPerson.id,
          mentee_id: userProfile.id,
          status: 'pending'
        };
        console.log('Insert data:', insertData);
        
        const { data, error } = await supabase
          .from('mentorship_connections')
          .insert([insertData])
          .select();
        
        if (error) {
          console.error('❌ Mentorship connection error:', error);
          throw error;
        }
        console.log('✅ Mentorship connection created:', data);
      } else {
        console.log('📤 Inserting into alumni_connections table...');
        const insertData = {
          alumni_id: selectedPerson.id,
          student_id: userProfile.id,
          status: 'pending',
          message: connectionMessage || null
        };
        console.log('Insert data:', insertData);
        
        const { data, error } = await supabase
          .from('alumni_connections')
          .insert([insertData])
          .select();
        
        if (error) {
          console.error('❌ Alumni connection error:', error);
          throw error;
        }
        console.log('✅ Alumni connection created:', data);
      }

      // Mark this person as requested
      setSentRequests(prev => new Set(prev).add(selectedPerson.id));
      
      // Show success message
      setIsError(false);
      setSuccessMessage(`Connection request sent successfully to ${selectedPerson.full_name}! They will be notified and can accept your request.`);
      
      setShowDialog(false);
      setConnectionMessage('');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPerson(null);
      }, 5000);
    } catch (error: any) {
      console.error('❌ Error sending connection request:', error);
      
      let errorMessage = 'Failed to send connection request. ';
      
      if (error.code === '23505') {
        errorMessage = 'You have already sent a connection request to this person.';
      } else if (error.code === '23503') {
        errorMessage = 'User profile error. Please complete your profile first.';
      } else if (error.message?.includes('permission') || error.message?.includes('CORS')) {
        errorMessage = 'Permission denied. Please check your network and try again.';
      } else if (error.message?.includes('RLS')) {
        errorMessage = 'Database configuration error. Administrators have been notified.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setIsError(true);
      setSuccessMessage(errorMessage);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsError(false);
      }, 6000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenDialog = (person: MentorProfile) => {
    setSelectedPerson(person);
    setShowDialog(true);
  };

  const renderPersonCard = (person: MentorProfile, isAlumni: boolean = false) => {
    const alumniPerson = person as AlumniProfile;
    const personAvailability = availability[person.id] || [];
    const hasRequestedConnection = sentRequests.has(person.id);

    return (
      <div
        key={person.id}
        className="p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-indigo-500/30 transition-all"
      >
        <div className="flex items-start gap-4">
          {person.profile_image ? (
            <img
              src={person.profile_image}
              alt={person.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white">{person.full_name}</h4>
              {person.is_verified && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {isAlumni && alumniPerson.company && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Briefcase className="w-4 h-4" />
                <span>{alumniPerson.current_position} at {alumniPerson.company}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{person.department}</span>
            </div>

            {person.bio && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{person.bio}</p>
            )}

            {person.areas_of_expertise && person.areas_of_expertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {person.areas_of_expertise.slice(0, 4).map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-300 border-0">
                    {area}
                  </Badge>
                ))}
                {person.areas_of_expertise.length > 4 && (
                  <Badge variant="secondary" className="text-xs bg-neutral-700 text-gray-400 border-0">
                    +{person.areas_of_expertise.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {!isAlumni && personAvailability.length > 0 && (
              <div className="mb-3 p-2 rounded bg-neutral-700/50 border border-neutral-700">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Available Slots
                </p>
                <div className="flex flex-wrap gap-1">
                  {personAvailability.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      <span className="capitalize">{slot.day_of_week}</span>
                      <span className="text-gray-500">
                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              size="sm"
              className={hasRequestedConnection ? "w-full bg-emerald-600 hover:bg-emerald-700" : "w-full bg-indigo-600 hover:bg-indigo-700"}
              onClick={() => handleOpenDialog(person)}
              disabled={hasRequestedConnection}
            >
              {hasRequestedConnection ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Request Sent
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Connect with {person.full_name.split(' ')[0]}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Success/Error Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`${isError ? 'bg-red-900 border-red-500' : 'bg-emerald-900 border-emerald-500'} border text-white px-6 py-4 rounded-lg shadow-lg max-w-md`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 ${isError ? 'text-red-400' : 'text-emerald-400'} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="font-semibold mb-1">{isError ? 'Error' : 'Success!'}</p>
                <p className={`text-sm ${isError ? 'text-red-100' : 'text-emerald-100'}`}>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Connect with Mentors & Alumni
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'mentors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('mentors')}
              className={activeTab === 'mentors' ? 'bg-indigo-600' : 'border-neutral-700'}
            >
              Mentors ({mentors.length})
            </Button>
            <Button
              variant={activeTab === 'alumni' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('alumni')}
              className={activeTab === 'alumni' ? 'bg-purple-600' : 'border-neutral-700'}
            >
              Alumni ({alumni.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {activeTab === 'mentors' && (
              <>
                {mentors.length > 0 ? (
                  mentors.map((mentor) => renderPersonCard(mentor, false))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No mentors available</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'alumni' && (
              <>
                {alumni.length > 0 ? (
                  alumni.map((alum) => renderPersonCard(alum, true))
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No alumni available</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Connect with {selectedPerson?.full_name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Send a connection request to start your mentorship journey
            </DialogDescription>
          </DialogHeader>

          {selectedPerson && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                <div className="flex items-center gap-3 mb-2">
                  {selectedPerson.profile_image ? (
                    <img
                      src={selectedPerson.profile_image}
                      alt={selectedPerson.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{selectedPerson.full_name}</h4>
                    <p className="text-sm text-gray-400">{selectedPerson.department}</p>
                  </div>
                </div>
                {selectedPerson.bio && (
                  <p className="text-sm text-gray-300 mt-2">{selectedPerson.bio}</p>
                )}
              </div>

              {selectedPerson.role === 'alumni' && (
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Introduction Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Introduce yourself and explain why you'd like to connect..."
                    value={connectionMessage}
                    onChange={(e) => setConnectionMessage(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white min-h-[100px]"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowDialog(false);
                    setConnectionMessage('');
                    setSelectedPerson(null);
                  }}
                  variant="outline"
                  className="flex-1 border-neutral-700 hover:bg-neutral-800"
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnect}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
