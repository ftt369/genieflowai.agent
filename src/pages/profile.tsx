import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/database';
import { UserProfile } from '@/types/user';
import { useThemeStore } from '@/stores/theme/themeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Loader2, Upload, Camera, Save, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/config/services';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { profile: themeProfile } = useThemeStore();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    bio: '',
    location: '',
    company: '',
    job_title: '',
    website: '',
    timezone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        website: profile.website || '',
        timezone: profile.timezone || '',
      });
    }
  }, [profile]);
  
  // Cleanup avatar preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      // Handle avatar upload if changed
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileName = `avatar-${user.id}-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            upsert: true,
          });
          
        if (error) throw error;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrlData.publicUrl;
      }
      
      // Update profile
      const success = await updateUserProfile(user.id, {
        ...formData,
        avatar_url: avatarUrl,
      });
      
      if (success) {
        showToast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
          variant: "success"
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'GA';
  };

  // Check if we're using the Spiral theme profile
  const isSpiralStyle = themeProfile === 'spiral';

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to sign in to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className={cn(
        "text-3xl font-bold mb-8",
        isSpiralStyle ? "text-blue-900" : ""
      )}>
        My Profile
      </h1>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-6">
              <Avatar className="w-32 h-32 border-4 border-muted">
                <AvatarImage 
                  src={avatarPreview || profile?.avatar_url || ''} 
                  alt={formData.full_name || user.email} 
                />
                <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className={cn(
                  "absolute bottom-0 right-0 p-2 rounded-full cursor-pointer",
                  isSpiralStyle ? "bg-blue-900 text-white" : "bg-primary text-primary-foreground"
                )}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Upload avatar</span>
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="sr-only" 
                onChange={handleAvatarChange} 
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Supported formats: JPEG, PNG</p>
              <p className="text-sm text-muted-foreground">Maximum size: 2MB</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="Your job title"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone || ''}
                      onChange={handleSelectChange}
                    >
                      <option value="" disabled>Select timezone</option>
                      <option value="UTC-12:00">UTC-12:00</option>
                      <option value="UTC-11:00">UTC-11:00</option>
                      <option value="UTC-10:00">UTC-10:00</option>
                      <option value="UTC-09:00">UTC-09:00</option>
                      <option value="UTC-08:00">UTC-08:00 (PST)</option>
                      <option value="UTC-07:00">UTC-07:00 (MST)</option>
                      <option value="UTC-06:00">UTC-06:00 (CST)</option>
                      <option value="UTC-05:00">UTC-05:00 (EST)</option>
                      <option value="UTC-04:00">UTC-04:00</option>
                      <option value="UTC-03:00">UTC-03:00</option>
                      <option value="UTC-02:00">UTC-02:00</option>
                      <option value="UTC-01:00">UTC-01:00</option>
                      <option value="UTC+00:00">UTC+00:00</option>
                      <option value="UTC+01:00">UTC+01:00</option>
                      <option value="UTC+02:00">UTC+02:00</option>
                      <option value="UTC+03:00">UTC+03:00</option>
                      <option value="UTC+04:00">UTC+04:00</option>
                      <option value="UTC+05:00">UTC+05:00</option>
                      <option value="UTC+05:30">UTC+05:30 (IST)</option>
                      <option value="UTC+06:00">UTC+06:00</option>
                      <option value="UTC+07:00">UTC+07:00</option>
                      <option value="UTC+08:00">UTC+08:00</option>
                      <option value="UTC+09:00">UTC+09:00</option>
                      <option value="UTC+10:00">UTC+10:00</option>
                      <option value="UTC+11:00">UTC+11:00</option>
                      <option value="UTC+12:00">UTC+12:00</option>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className={cn(
                  "w-full",
                  isSpiralStyle && "bg-blue-900 hover:bg-blue-800 text-white"
                )}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving changes
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 