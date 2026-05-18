
"use client";
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddMangaForm from './AddMangaForm';
import { toast } from 'sonner';
import MangaTable from './MangaTable';
import { Manga } from '@/types/manga';

const MangaManagement: React.FC = () => {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'manga'), (snapshot) => {
      const mangaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Manga[];
      setManga(mangaData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteManga = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this manga?')) {
      try {
        await deleteDoc(doc(db, 'manga', id));
        toast.success('Manga deleted successfully');
      } catch (error) {
        toast.error('Failed to delete manga');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manga Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Manga
        </Button>
      </div>

      {isFormOpen && (
        <AddMangaForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            toast.success('Manga added successfully!');
          }}
        />
      )}

      <MangaTable manga={manga} loading={loading} onDelete={handleDeleteManga} />
    </div>
  );
};

export default MangaManagement;
