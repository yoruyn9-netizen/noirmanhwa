
"use client";
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GenreSelector from '../manga/GenreSelector';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface AddMangaFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMangaForm: React.FC<AddMangaFormProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [genres, setGenres] = useState<string[]>([]);
  const [type, setType] = useState<'manga' | 'manhwa' | 'manhua'>('manga');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !status || !type || genres.length === 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'manga'), {
        title,
        coverImage,
        author,
        synopsis,
        status,
        genres,
        type,
        chapterCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add manga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Manga</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Cover Image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
          <Input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          <Textarea placeholder="Synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
          <Select onValueChange={(value: 'ongoing' | 'completed') => setStatus(value)} defaultValue={status}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: 'manga' | 'manhwa' | 'manhua') => setType(value)} defaultValue={type}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manga">Manga</SelectItem>
              <SelectItem value="manhwa">Manhwa</SelectItem>
              <SelectItem value="manhua">Manhua</SelectItem>
            </SelectContent>
          </Select>
          <GenreSelector selectedGenres={genres} onChange={setGenres} />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Manga'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMangaForm;
