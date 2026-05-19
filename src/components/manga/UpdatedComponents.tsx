
import { Manga } from "@/src/types/manga";
import Link from "next/link";

// Using a basic fetch here, but in a real app, you'd use SWR or React Query
async function getManga(): Promise<Manga[]> {
  const res = await fetch('/api/manga', { next: { revalidate: 300, tags: ['manga'] } });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
  return res.json();
}

export default async function MangaList() {
  const mangaList = await getManga();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {mangaList.map((manga) => (
        <Link href={`/manga/${manga.id}`} key={manga.id}>
          <div className="border rounded-lg overflow-hidden">
            <img src={manga.coverUrl} alt={manga.title} className="w-full h-auto" />
            <div className="p-2">
              <h3 className="font-bold truncate">{manga.title}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function getChapters(mangaId: string) {
    const res = await fetch(`/api/chapter?id=${mangaId}`, { next: { revalidate: 300, tags: ['chapters'] } });
    if (!res.ok) {
        throw new Error('Failed to fetch chapters');
    }
    return res.json();
}

export async function ChapterListComponent({ mangaId }: { mangaId: string }) {
    const chapters = await getChapters(mangaId);

    return (
        <div>
            {chapters.map((chapter: any) => (
                <Link href={`/reader/${mangaId}/${chapter.id}`} key={chapter.id}>
                    <div className="p-2 border-b">
                        Chapter {chapter.attributes.chapter}: {chapter.attributes.title}
                    </div>
                </Link>
            ))}
        </div>
    );
}

async function getImages(chapterId: string) {
    const res = await fetch(`/api/image?chapterId=${chapterId}`, { next: { revalidate: 86400, tags: ['images'] } });
    if (!res.ok) {
        throw new Error('Failed to fetch images');
    }
    return res.json();
}

export async function Reader({ chapterId }: { chapterId: string }) {
    const images = await getImages(chapterId);

    return (
        <div className="flex flex-col items-center">
            {images.highQuality.map((url: string, index: number) => (
                <img key={index} src={url} alt={`Page ${index + 1}`} className="max-w-full" />
            ))}
        </div>
    );
}
