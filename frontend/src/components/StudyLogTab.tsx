import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import {
  Plus,
  Flame,
  TrendingUp,
  Clock,
  BookOpen,
  ThumbsUp,
  Paperclip,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StudyLogTabProps {
  currentStreak: number;
  setCurrentStreak: (streak: number) => void;
}

interface StudyLog {
  id: string;
  subject: string;
  duration_minutes: number;
  notes: string;
  date: Date;
  created_at?: string;
  likes: number;
  attachments?: { name: string; url: string; type: string }[];
}

export function StudyLogTab({
  currentStreak,
  setCurrentStreak,
}: StudyLogTabProps) {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchStudyLogs();
    }
  }, [userProfile]);

  const fetchStudyLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('study_logs')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: StudyLog[] =
        data?.map((log: any) => ({
          id: log.id,
          subject: log.subject,
          duration_minutes: log.duration_minutes,
          notes: log.notes ?? '',
          date: new Date(log.date || log.created_at),
          created_at: log.created_at,
          likes: 0,
          attachments: log.attachments || [],
        })) || [];

      setLogs(formatted);
    } catch (err) {
      console.error('Error fetching study logs:', err);
    }
  };

  const totalHours =
    logs.reduce((sum, log) => sum + log.duration_minutes, 0) / 60;

  const thisWeekLogs = logs.filter(
    (log) =>
      Date.now() - log.date.getTime() <
      7 * 24 * 60 * 60 * 1000
  ).length;

  const handleAddLog = async () => {
    if (!subject || !duration || !userProfile?.id) return;

    setLoading(true);
    setUploadingFiles(true);
    try {
      // Upload files to Supabase Storage
      const uploadedFiles: { name: string; url: string; type: string }[] = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userProfile.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('study-attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue; // Skip this file but continue with others
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('study-attachments')
          .getPublicUrl(fileName);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type
        });
      }

      setUploadingFiles(false);

      // Insert study log with attachments
      const { data, error } = await supabase
        .from('study_logs')
        .insert([
          {
            user_id: userProfile.id,
            subject,
            duration_minutes: Number(duration),
            notes: notes || null,
            date: new Date().toISOString().split('T')[0],
            attachments: uploadedFiles,
          },
        ])
        .select();

      if (error) throw error;

      const newLog = data[0];

      setLogs((prev) => [
        {
          id: newLog.id,
          subject: newLog.subject,
          duration_minutes: newLog.duration_minutes,
          notes: newLog.notes ?? '',
          date: new Date(),
          created_at: newLog.created_at,
          likes: 0,
          attachments: newLog.attachments || [],
        },
        ...prev,
      ]);

      setCurrentStreak(currentStreak + 1);
      setIsDialogOpen(false);
      setSubject('');
      setDuration('');
      setNotes('');
      setSelectedFiles([]);
      
      alert('Study log saved successfully!');
    } catch (err) {
      console.error(err);
      alert(`Failed to save study log: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleLike = (id: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? { ...log, likes: log.likes + 1 }
          : log
      )
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex gap-3">
            <Flame className="text-orange-500" />
            <div>
              <p className="text-sm">Current Streak</p>
              <p className="text-xl font-bold">{currentStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-3">
            <Clock className="text-blue-500" />
            <div>
              <p className="text-sm">Total Hours</p>
              <p className="text-xl font-bold">
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex gap-3">
            <TrendingUp className="text-purple-500" />
            <div>
              <p className="text-sm">This Week</p>
              <p className="text-xl font-bold">
                {thisWeekLogs} logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle className="flex gap-2">
              <BookOpen /> My Study Logs
            </CardTitle>
            <CardDescription>
              Your daily accountability tracker
            </CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Add Log
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Study Session</DialogTitle>
                <DialogDescription>
                  Keep your streak alive 🔥
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your study session..."
                  />
                </div>

                <div>
                  <Label>Attachments (PDFs, Images, etc.)</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <Paperclip className="size-5 text-gray-500" />
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="size-4" />
                              <span className="truncate max-w-[200px]">{file.name}</span>
                              <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAddLog}
                  disabled={loading || uploadingFiles}
                  className="w-full"
                >
                  {uploadingFiles ? 'Uploading files...' : loading ? 'Saving...' : 'Save Log'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="bg-neutral-900/50 border-neutral-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-lg">{log.subject}</h4>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        {log.duration_minutes} min
                      </Badge>
                    </div>

                    <p className="text-xs text-neutral-400">
                      {log.date.toLocaleString()}
                    </p>

                    {log.notes && (
                      <div className="mt-2 p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                          {log.notes}
                        </p>
                      </div>
                    )}

                    {log.attachments && log.attachments.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs text-neutral-400 font-medium">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {log.attachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-md hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                            >
                              <FileText className="size-3.5" />
                              <span className="max-w-[150px] truncate">{file.name}</span>
                              <Download className="size-3.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-neutral-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(log.id)}
                        className="text-neutral-400 hover:text-pink-400 hover:bg-pink-500/10"
                      >
                        <ThumbsUp className="mr-1.5 size-4" />
                        {log.likes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
