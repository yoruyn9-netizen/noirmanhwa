
"use client";
import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Manga } from '@/types/manga';
import { useAuthStore } from '@/store/authStore';
import { X } from 'lucide-react';

interface AddChapterFormProps {
  mangaList: Manga[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddChapterForm: React.FC<AddChapterFormProps> = ({ mangaList, onClose, onSuccess }) => {
  const [selectedManga, setSelectedManga] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManga || !chapterNumber || !pages) {
      toast.error('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const chapterRef = await addDoc(collection(db, 'chapters'), {
        mangaId: selectedManga,
        chapterNumber: Number(chapterNumber),
        title,
        pages: pages.split('\n').filter(url => url.trim() !== ''),
        uploadedAt: serverTimestamp(),
        uploadedBy: user?.uid
      });

      const mangaRef = doc(db, 'manga', selectedManga);
      const selectedMangaData = mangaList.find(m => m.id === selectedManga);
      await updateDoc(mangaRef, { 
          chapterCount: (selectedMangaData?.chapterCount || 0) + 1,
          updatedAt: serverTimestamp()
         });

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add chapter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Add New Chapter</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X />
            </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={setSelectedManga} value={selectedManga}>
            <SelectTrigger>
              <SelectValue placeholder="Select Manga" />
            </SelectTrigger>
            <SelectContent>
              {mangaList.map(manga => (
                <SelectItem key={manga.id} value={manga.id}>{manga.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Chapter Number" onChange={e => setChapterNumber(Number(e.target.value))} required />
          <Input placeholder="Chapter Title (Optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Image URLs (one per line)" value={pages} onChange={(e) => setPages(e.target.value)} required />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Chapter'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapterForm;
