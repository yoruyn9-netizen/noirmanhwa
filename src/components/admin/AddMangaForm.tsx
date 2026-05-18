'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/lib/firestore'; // Assuming you have a firestore instance initialized
import { useToast } from '@/hooks/use-toast';

const AddMangaForm = ({ setModalOpen }) => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [genres, setGenres] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !coverImage || !author || !synopsis || !genres) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, "manga"), {
        title,
        coverImage,
        author,
        synopsis,
        status,
        genres: genres.split(',').map(g => g.trim()),
        createdAt: new Date(),
      });
      toast({ title: "Success", description: "New title added successfully!" });
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-neutral-900 border-white/10"
      />
      <Input
        placeholder="Cover Image URL"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        className="bg-neutral-900 border-white/10"
      />
      <Input
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="bg-neutral-900 border-white/10"
      />
      <Textarea
        placeholder="Synopsis"
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
        className="bg-neutral-900 border-white/10"
      />
      <Select onValueChange={setStatus} defaultValue={status}>
        <SelectTrigger className="w-full bg-neutral-900 border-white/10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-[#0a0a0f] text-white">
          <SelectItem value="Ongoing">Ongoing</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Hiatus">Hiatus</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Genres (comma-separated)"
        value={genres}
        onChange={(e) => setGenres(e.target.value)}
        className="bg-neutral-900 border-white/10"
      />
      <Button type="submit" className="bg-primary hover:bg-primary/80 text-white">Submit</Button>
    </form>
  );
};

export default AddMangaForm;
