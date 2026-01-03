import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import { CATEGORIES, type Category, type CategoryNoAll } from "@/types/note";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const PER_PAGE = 8;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const first = slug[0];

  if (!first || !CATEGORIES.includes(first as Category)) {
    return {
      title: "NoteHub - Not Found",
    };
  }

  const tag = first as Category;

  return {
    title: `NoteHub - ${tag}`,
    description: `Browse notes filtered by category: ${tag}.`,
    openGraph: {
      title: `NoteHub - ${tag}`,
      url: `https://08-zustand-phi-three.vercel.app/notes/filter/${tag}`,
      images: [{ url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg" }],
    },
  };
}



type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;

  const firstParam = slug[0];
  const tag = CATEGORIES.find(c => c.toLowerCase() === firstParam?.toLowerCase()) as Category;

  if (!tag) notFound();

  const category: CategoryNoAll | undefined =
    tag === "All" ? undefined : (tag as CategoryNoAll);

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: [
      "notes",
      { page: 1, perPage: PER_PAGE, search: "", tag: category ?? null },
    ],
    queryFn: () => fetchNotes(1, PER_PAGE, undefined, category),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      {}
      <NotesClient tag={category} />
    </HydrationBoundary>
  );
}
