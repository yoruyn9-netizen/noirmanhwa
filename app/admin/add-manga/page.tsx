"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookPlus, UploadCloud, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// NOTE: These are placeholders. You would replace them with your actual backend functions.
// e.g., import { addMangaToFirestore, uploadMangaCover } from '@/lib/firebase';

const AddMangaPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [currentGenre, setCurrentGenre] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ',' || e.key === 'Enter') && currentGenre.trim()) {
      e.preventDefault();
      const newGenre = currentGenre.trim().toLowerCase();
      if (!genres.includes(newGenre)) {
        setGenres([...genres, newGenre]);
      }
      setCurrentGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !status || !coverFile) {
      toast({
        title: "Missing Fields",
        description: "Title, Status, and Cover Image are required.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    
    try {
      // Placeholder for actual API call logic
      console.log("Submitting manga:", { title, author, description, status, genres, coverFile });
      // 1. Upload cover image to a service like Cloudinary or Firebase Storage
      // const coverURL = await uploadMangaCover(coverFile);
      
      // 2. Save the manga data (including the coverURL) to your database
      // await addMangaToFirestore({ title, author, description, status, genres, coverURL });

      // Simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Success!",
        description: `"${title}" has been successfully added.`,
        variant: "default",
      });
      
      router.push('/admin'); // Redirect to admin dashboard after success
    } catch (error) {
      console.error("Failed to add manga:", error);
      toast({
        title: "Submission Error",
        description: "An error occurred while adding the manga. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Client-side role check for UI feedback
  if (user?.role !== 'admin' && user?.role !== 'owner') {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white p-4 text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-neutral-400">You do not have the required privileges to access this page.</p>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <BookPlus className="w-8 h-8 text-accent" />
            Add New Manga
          </h1>
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">
            Expand the digital library with a new title.
          </p>
        </header>
        
        <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Title</label>
                <Input required placeholder="e.g., Solo Leveling" value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Author</label>
                <Input placeholder="e.g., Chugong" value={author} onChange={e => setAuthor(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Cover Image</label>
               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-white/20 rounded-2xl hover:border-accent transition-all">
                {coverPreview ? (
                    <div className="relative group">
                        <img src={coverPreview} alt="Cover preview" className="mx-auto h-40 rounded-lg object-contain" />
                        <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                           <X className="w-4 h-4"/>
                        </button>
                    </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-neutral-500" />
                    <div className="flex text-sm text-neutral-500">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent-hover">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp"/>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-neutral-600">PNG, JPG, WEBP</p>
                  </div>
                )}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Description</label>
              <Textarea placeholder="A brief synopsis of the manga..." value={description} onChange={e => setDescription(e.target.value)} className="bg-white/5 border-white/10 min-h-[120px]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Status</label>
                    <Select onValueChange={setStatus} value={status}>
                        <SelectTrigger required className="w-full bg-white/5 border-white/10">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="hiatus">Hiatus</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Genres (comma to add)</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg min-h-[40px]">
                        {genres.map((genre) => (
                          <span key={genre} className="flex items-center gap-1.5 bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded-full capitalize">
                            {genre}
                            <button type="button" onClick={() => removeGenre(genre)}>
                                <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <Input 
                            placeholder="Add genre..."
                            value={currentGenre} 
                            onChange={e => setCurrentGenre(e.target.value)} 
                            onKeyDown={handleGenreKeyDown}
                            className="flex-1 bg-transparent border-none focus:ring-0 h-auto p-0"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Button type="submit" disabled={isLoading} className="w-full py-6 bg-accent text-black rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <BookPlus className="w-5 h-5" />
                    Add Manga to Library
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrap with auth and role check. This Higher-Order Component will handle redirection if the user is not authenticated.
export default RequireAuth(AddMangaPage);
