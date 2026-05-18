
"use client";
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {    Command,    CommandEmpty,    CommandGroup,    CommandInput,    CommandItem,} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 
  'Martial Arts', 'School Life', 'Sports', 'Psychological'
];

interface GenreSelectorProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenres, onChange }) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (currentValue: string) => {
    const newGenres = selectedGenres.includes(currentValue)
      ? selectedGenres.filter(g => g !== currentValue)
      : [...selectedGenres, currentValue];
    onChange(newGenres);
    setOpen(false);
  }

  return (
    <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedGenres.length > 0 ? selectedGenres.join(", ") : "Select genres..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search genre..." />
                    <CommandEmpty>No genre found.</CommandEmpty>
                    <CommandGroup>
                        {genres.map((genre) => (
                            <CommandItem
                                key={genre}
                                value={genre}
                                onSelect={handleSelect}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {genre}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
        <div className="flex flex-wrap gap-2">
            {selectedGenres.map(genre => (
                <div key={genre} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                    {genre}
                    <button onClick={() => onChange(selectedGenres.filter(g => g !== genre))}>x</button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default GenreSelector;
