"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddMangaForm from './AddMangaForm';
import { PlusCircle } from 'lucide-react';

const MangaManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/80">
              <PlusCircle className="w-4 h-4" />
              Add New Title
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Manga/Manhwa</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new title to the database.
              </DialogDescription>
            </DialogHeader>
            <AddMangaForm setModalOpen={setIsModalOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {/* TODO: Add a grid to display existing manga here */}
    </div>
  );
};

export default MangaManagement;
