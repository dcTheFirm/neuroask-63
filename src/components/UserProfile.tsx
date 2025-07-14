import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Settings, LogOut, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  user: any;
  onBack: () => void;
  onLogout?: () => void;
}

export const UserProfile = ({ user, onBack, onLogout }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    industry: user?.industry || '',
    level: user?.level || '',
    preferredType: user?.preferredType || ''
  });
  const [interviewConfig, setInterviewConfig] = useState({
    industry: user?.interviewConfig?.industry || 'Software Engineering',
    level: user?.interviewConfig?.level || 'Mid Level',
    type: user?.interviewConfig?.type || 'Technical',
    duration: user?.interviewConfig?.duration || '30 minutes'
  });
  const { toast } = useToast();

  // Load existing profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Load account info
      const { data: accountData } = await supabase
        .from('account_stuff')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (accountData) {
        setProfileData({
          name: accountData.full_name || '',
          email: accountData.email || '',
          industry: accountData.preferred_industries?.[0] || '',
          level: accountData.experience_level || '',
          preferredType: ''
        });
      }

      // Load profile configuration (interview settings)
      const { data: profileConfig } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_default', true)
        .single();

      if (profileConfig) {
        setInterviewConfig({
          industry: profileConfig.company_type || 'Software Engineering',
          level: profileConfig.experience_level || 'Mid Level',
          type: profileConfig.interview_type || 'Technical',
          duration: `${profileConfig.duration_minutes || 30} minutes`
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const industries = [
    "Software Engineering", "Marketing", "Finance", "Healthcare", 
    "Sales", "Consulting", "Data Science", "Design", "Operations", "HR"
  ];

  const levels = ["Entry Level", "Mid Level", "Senior Level", "Executive"];
  const types = ["Behavioral", "Technical", "Mixed"];

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update account_stuff table
      const { error: accountError } = await supabase
        .from('account_stuff')
        .upsert({
          user_id: currentUser.id,
          full_name: profileData.name,
          email: profileData.email,
          experience_level: profileData.level,
          preferred_industries: profileData.industry ? [profileData.industry] : []
        });

      if (accountError) throw accountError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Parse duration to get minutes
      const durationMinutes = parseInt(interviewConfig.duration.replace(' minutes', ''));

      // Update or insert profile configuration
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.id,
          name: 'Default Configuration',
          company_type: interviewConfig.industry,
          experience_level: interviewConfig.level,
          interview_type: interviewConfig.type.toLowerCase(),
          duration_minutes: durationMinutes,
          is_default: true
        });

      if (profileError) throw profileError;

      toast({
        title: "Interview Configuration Updated",
        description: "Your interview preferences have been successfully updated.",
      });
      setIsEditingConfig(false);
    } catch (error) {
      console.error('Error saving interview configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update interview configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden page-enter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 text-reveal">User Profile</h1>
                <p className="text-white/80 text-reveal">Manage your account and interview preferences</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-white">
                        <User className="h-5 w-5 mr-2" />
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Update your personal information and preferences
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Full Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Email</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Industry</Label>
                    <Select 
                      value={profileData.industry} 
                      onValueChange={(value) => setProfileData({...profileData, industry: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry} className="text-white hover:bg-white/10">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Experience Level</Label>
                      <Select 
                        value={profileData.level} 
                        onValueChange={(value) => setProfileData({...profileData, level: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {levels.map((level) => (
                            <SelectItem key={level} value={level} className="text-white hover:bg-white/10">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Preferred Interview Type</Label>
                      <Select 
                        value={profileData.preferredType} 
                        onValueChange={(value) => setProfileData({...profileData, preferredType: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select interview type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {types.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interview Configuration */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-white">
                        <Settings className="h-5 w-5 mr-2" />
                        Interview Configuration
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Update your default interview settings
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsEditingConfig(!isEditingConfig)}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isEditingConfig ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Default Industry</Label>
                      <Select 
                        value={interviewConfig.industry} 
                        onValueChange={(value) => setInterviewConfig({...interviewConfig, industry: value})}
                        disabled={!isEditingConfig}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry} className="text-white hover:bg-white/10">
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Default Level</Label>
                      <Select 
                        value={interviewConfig.level} 
                        onValueChange={(value) => setInterviewConfig({...interviewConfig, level: value})}
                        disabled={!isEditingConfig}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {levels.map((level) => (
                            <SelectItem key={level} value={level} className="text-white hover:bg-white/10">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Default Type</Label>
                      <Select 
                        value={interviewConfig.type} 
                        onValueChange={(value) => setInterviewConfig({...interviewConfig, type: value})}
                        disabled={!isEditingConfig}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {types.map((type) => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Default Duration</Label>
                      <Select 
                        value={interviewConfig.duration} 
                        onValueChange={(value) => setInterviewConfig({...interviewConfig, duration: value})}
                        disabled={!isEditingConfig}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm disabled:opacity-60">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                          {["15 minutes", "30 minutes", "45 minutes", "60 minutes"].map((duration) => (
                            <SelectItem key={duration} value={duration} className="text-white hover:bg-white/10">
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditingConfig && (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleSaveConfig}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        {loading ? "Saving..." : "Save Configuration"}
                      </Button>
                      <Button 
                        onClick={() => setIsEditingConfig(false)}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Stats */}
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30 hover:from-blue-500/25 hover:to-cyan-500/25 transition-all duration-300 card-entrance">
                <CardHeader>
                  <CardTitle className="text-black">Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/80">Sessions Completed:</span>
                    <span className="font-bold text-black">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/80">Average Score:</span>
                    <span className="font-bold text-black">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/80">Hours Practiced:</span>
                    <span className="font-bold text-black">12.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/80">Member Since:</span>
                    <span className="font-bold text-black">Jan 2024</span>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 hover:from-purple-500/25 hover:to-pink-500/25 transition-all duration-300 scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center text-black">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    Notification Preferences
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    Privacy Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    Data Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
