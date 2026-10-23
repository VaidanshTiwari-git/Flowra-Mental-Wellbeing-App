import React, { useState, useEffect } from 'react';
import { BookItem, ThemeMode } from '../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  Star,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  Bookmark,
  Library,
  Zap,
  BookMarked,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoal: string;
  themeMode?: ThemeMode;
}

export type BookStatus = 'want_to_read' | 'reading' | 'read' | 'none';

export const BookSectionModal: React.FC<BookSectionModalProps> = ({
  isOpen,
  onClose,
  userGoal,
  themeMode = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBookDetail, setSelectedBookDetail] = useState<BookItem | null>(null);
  const [userBookStatuses, setUserBookStatuses] = useState<Record<string, BookStatus>>({});

  const categories = ['All', 'Focus & Habits', 'DSA & Tech', 'Mindset & Wealth', 'Psychology', 'Leadership'];

  // Load saved book statuses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowra_user_book_statuses');
      if (saved) {
        setUserBookStatuses(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading book statuses:', e);
    }
  }, []);

  const handleUpdateBookStatus = (bookId: string, status: BookStatus) => {
    setUserBookStatuses((prev) => {
      const updated = { ...prev, [bookId]: status };
      try {
        localStorage.setItem('flowra_user_book_statuses', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving book status:', e);
      }
      return updated;
    });

    if (status === 'read' || status === 'reading') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  // Debounced auto search when user types in search bar
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const performSearch = async (queryToSearch: string) => {
    const cleanQuery = queryToSearch.trim() || userGoal || 'Atomic Habits';
    setIsLoading(true);

    try {
      // Direct call to Google Books API with maxResults 24 for expansive book sanctuary catalog
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        cleanQuery
      )}&maxResults=24&orderBy=relevance`;

      const response = await fetch(googleBooksUrl);
      if (!response.ok) {
        throw new Error(`Google Books API response status: ${response.status}`);
      }

      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const mappedBooks: BookItem[] = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          const rawCover =
            info.imageLinks?.thumbnail ||
            info.imageLinks?.smallThumbnail ||
            info.imageLinks?.medium ||
            '';
          // Ensure https protocol for image thumbnails
          const secureCover = rawCover.replace(/^http:\/\//i, 'https://');
          const publishedYear = info.publishedDate ? parseInt(info.publishedDate.substring(0, 4), 10) || 2022 : 2022;
          const authors = info.authors?.join(', ') || 'Various Authors';
          const description = info.description || info.subtitle || 'A high-impact guide on mastery and mental models.';
          const rating = info.averageRating || (4.5 + ((item.id?.charCodeAt(0) || 0) % 5) * 0.1).toFixed(1);
          const pageCount = info.pageCount || 260;
          const readingMinutes = Math.round(pageCount * 1.3);

          return {
            id: item.id || `gb-${Math.random()}`,
            title: info.title || 'Mastery Book',
            author: authors,
            publishedYear,
            coverUrl: secureCover,
            description,
            archiveUrl: info.previewLink || `https://books.google.com/books?id=${item.id}`,
            openLibraryUrl: info.infoLink || `https://openlibrary.org/search?q=${encodeURIComponent(info.title || '')}`,
            rating: Number(rating),
            readingMinutes,
            suggestedAction: `Apply 1 core insight from "${info.title || 'this book'}" to your daily focus block.`,
            keyPrinciples: [
              '1% compounding daily growth',
              'Active retrieval & recall practice',
              'Ruthless elimination of noise',
              'Deep uninterrupted immersion',
            ],
          };
        });

        setBooks(mappedBooks);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.warn('Google Books API fallback active:', err);
      // Fallback curate list
      setBooks([
        {
          id: 'b-atomic',
          title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
          author: 'James Clear',
          publishedYear: 2018,
          coverUrl: 'https://covers.openlibrary.org/b/id/12843477-M.jpg',
          description: 'A transformative framework for making small changes that compound into remarkable outcomes.',
          archiveUrl: 'https://archive.org/search?query=Atomic+Habits+James+Clear',
          openLibraryUrl: 'https://openlibrary.org/search?q=Atomic+Habits',
          rating: 4.9,
          readingMinutes: 240,
          suggestedAction: 'Apply the 2-Minute Rule to your Flowra morning study timetable.',
          keyPrinciples: ['Make it Obvious', 'Make it Attractive', 'Make it Easy', 'Make it Satisfying'],
        },
        {
          id: 'b-deepwork',
          title: 'Deep Work: Rules for Focused Success in a Distracted World',
          author: 'Cal Newport',
          publishedYear: 2016,
          coverUrl: 'https://covers.openlibrary.org/b/id/12539704-M.jpg',
          description: 'Master the superpower of deep, distraction-free concentration in an increasingly fragmented world.',
          archiveUrl: 'https://archive.org/search?query=Deep+Work+Cal+Newport',
          openLibraryUrl: 'https://openlibrary.org/search?q=Deep+Work',
          rating: 4.8,
          readingMinutes: 280,
          suggestedAction: 'Schedule a 90-minute monastic deep work sprint for today.',
          keyPrinciples: ['Monastic focus blocks', 'Quit shallow algorithmic feeds', 'Embrace boredom', 'Drain the shallows'],
        },
        {
          id: 'b-psychology-money',
          title: 'The Psychology of Money',
          author: 'Morgan Housel',
          publishedYear: 2020,
          coverUrl: 'https://covers.openlibrary.org/b/id/10593438-M.jpg',
          description: 'Timeless lessons on wealth, greed, and happiness exploring how behavior matters more than raw intelligence.',
          archiveUrl: 'https://archive.org/search?query=Psychology+of+Money+Morgan+Housel',
          openLibraryUrl: 'https://openlibrary.org/search?q=Psychology+of+Money',
          rating: 4.9,
          readingMinutes: 220,
          suggestedAction: 'Treat your daily focus as compound interest in your mental capital.',
          keyPrinciples: ['Compounding returns', 'Freedom over status', 'Room for error', 'Sedentary patience'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      performSearch(userGoal || 'Atomic Habits');
    }
  }, [isOpen, userGoal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col overflow-hidden ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F17] border-amber-500/30 text-white shadow-[0_0_50px_rgba(245,158,11,0.1)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Flowra Book Sanctuary</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Google Books API
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Search global literature • Track reading states • Extract daily action steps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar with Instant Google Books query */}
        <div className="mt-4 flex flex-col gap-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performSearch(searchQuery);
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search any book title, author, or topic (e.g., 'Atomic Habits', 'Deep Work', 'Clean Code')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-zinc-900/90 border border-zinc-700 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  const q = cat === 'All' ? (userGoal || 'Atomic Habits') : cat;
                  setSearchQuery(q);
                  performSearch(q);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-black shadow-sm font-bold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books List Grid */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
              <p className="text-xs font-medium">Fetching literature from Google Books API...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-8 h-8 text-zinc-600" />
              <p>No books found matching your query. Try searching for "Atomic Habits", "Deep Work", or "Algorithms".</p>
            </div>
          ) : (
            books.map((book) => {
              const currentStatus = userBookStatuses[book.id] || 'none';
              return (
                <div
                  key={book.id}
                  className="p-4 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-lg group"
                >
                  <div className="flex gap-3.5">
                    {/* Book Cover with Fallback */}
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded-xl shadow-md border border-zinc-700/50 shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-28 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center text-zinc-500 p-2 text-center shrink-0">
                        <BookOpen className="w-6 h-6 mb-1 text-amber-400/60" />
                        <span className="text-[9px] font-bold leading-tight line-clamp-2">Flowra Library</span>
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-xs sm:text-sm font-extrabold text-white line-clamp-2">
                            {book.title}
                          </h3>
                        </div>

                        <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          by {book.author} ({book.publishedYear})
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/40">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" /> {book.rating}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> ~{book.readingMinutes}m
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedBookDetail(book)}
                          className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-bold underline underline-offset-2 cursor-pointer"
                        >
                          <Info className="w-3 h-3 text-amber-400" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reading Status Selector & Library Action Row */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 font-semibold mr-1">Status:</span>
                      <button
                        onClick={() =>
                          handleUpdateBookStatus(
                            book.id,
                            currentStatus === 'reading' ? 'none' : 'reading'
                          )
                        }
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          currentStatus === 'reading'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {currentStatus === 'reading' ? '📖 Reading' : 'Reading'}
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateBookStatus(
                            book.id,
                            currentStatus === 'read' ? 'none' : 'read'
                          )
                        }
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          currentStatus === 'read'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {currentStatus === 'read' ? '✓ Finished' : 'Read'}
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateBookStatus(
                            book.id,
                            currentStatus === 'want_to_read' ? 'none' : 'want_to_read'
                          )
                        }
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          currentStatus === 'want_to_read'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {currentStatus === 'want_to_read' ? '★ Saved' : 'Save'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {book.archiveUrl && (
                        <a
                          href={book.archiveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Google Books</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Book Modal Drawer */}
        {selectedBookDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0A0E17] border border-amber-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Book Deep-Dive</h3>
                    <p className="text-[10px] text-zinc-400">Flowra Synthesized Summary</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBookDetail(null)}
                  className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3">
                {selectedBookDetail.coverUrl && (
                  <img
                    src={selectedBookDetail.coverUrl}
                    alt={selectedBookDetail.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-zinc-700/50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{selectedBookDetail.title}</h4>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">by {selectedBookDetail.author}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {selectedBookDetail.rating}
                    </span>
                    <span>•</span>
                    <span>{selectedBookDetail.publishedYear}</span>
                    <span>•</span>
                    <span>~{selectedBookDetail.readingMinutes} mins</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-300 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 max-h-40 overflow-y-auto leading-relaxed">
                {selectedBookDetail.description}
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daily Actionable Challenge:</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{selectedBookDetail.suggestedAction}</p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => {
                    handleUpdateBookStatus(selectedBookDetail.id, 'reading');
                    setSelectedBookDetail(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Mark as Currently Reading 📖
                </button>
                <button
                  onClick={() => setSelectedBookDetail(null)}
                  className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
