
"use client";
import React from 'react';
import { Manga } from '@/types/manga';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MangaTableProps {
  manga: Manga[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const MangaTable: React.FC<MangaTableProps> = ({ manga, loading, onDelete }) => {
  if (loading) return <p>Loading...</p>;
  if (manga.length === 0) return <p>No manga found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cover</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Author</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead>Genres</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {manga.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <img src={m.coverImage} alt={m.title} className="h-16 w-12 object-cover rounded-md" />
            </TableCell>
            <TableCell className="font-medium">{m.title}</TableCell>
            <TableCell className="hidden md:table-cell">{m.author}</TableCell>
            <TableCell className="hidden md:table-cell">
                <Badge variant={m.status === 'ongoing' ? 'default' : 'secondary'}>{m.status}</Badge>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {m.genres.slice(0, 2).map(g => <Badge key={g} variant="outline">{g}</Badge>)}
                    {m.genres.length > 2 && <Badge variant="outline">+{m.genres.length - 2}</Badge>}
                </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { /* Implement edit functionality */ }}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(m.id)} className="text-red-500">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MangaTable;
