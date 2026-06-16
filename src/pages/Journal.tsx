import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import type { JournalEntry } from '@/types';

export default function Journal() {
  const navigate = useNavigate();
  const { journals, deleteJournal } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [locationKeyword, setLocationKeyword] = useState('');
  const journalRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getMonthKey = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    journals.forEach(journal => {
      monthSet.add(getMonthKey(journal.date));
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [journals]);

  const filteredJournals = useMemo(() => {
    let result = journals;

    if (selectedMonth) {
      result = result.filter(journal => getMonthKey(journal.date) === selectedMonth);
    }

    if (locationKeyword.trim()) {
      const keyword = locationKeyword.trim().toLowerCase();
      result = result.filter(journal =>
        journal.location && journal.location.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [journals, selectedMonth, locationKeyword]);

  const journalsByMonth = useMemo(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    filteredJournals.forEach(journal => {
      const monthKey = getMonthKey(journal.date);
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(journal);
    });
    return grouped;
  }, [filteredJournals]);

  const scrollToMonth = (monthKey: string) => {
    setSelectedMonth(monthKey === selectedMonth ? null : monthKey);
    if (monthKey !== selectedMonth) {
      setTimeout(() => {
        const element = journalRefs.current[monthKey];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const clearFilters = () => {
    setSelectedMonth(null);
    setLocationKeyword('');
  };

  const hasFilters = selectedMonth !== null || locationKeyword.trim() !== '';

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return (
    <div className="min-h-screen">
      <PageHeader
        title="本地纪念册"
        subtitle="记录旅途的美好时光"
        emoji="📔"
        rightAction={
          <button
            onClick={() => navigate('/journal/new')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="container max-w-lg mx-auto px-4 py-6">
        {journals.length === 0 ? (
          <div className="card-paper p-10 text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-soft">📔</div>
            <h3 className="hand-title text-2xl mb-2">开始记录吧</h3>
            <p className="text-amber-700/70 mb-6">
              还没有日记<br />
              点击右上角 + 创建你的第一篇旅行日记
            </p>
            <button
              onClick={() => navigate('/journal/new')}
              className="btn-primary"
            >
              创建日记
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                <input
                  type="text"
                  placeholder="搜索地点关键词..."
                  value={locationKeyword}
                  onChange={(e) => setLocationKeyword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-amber-200 bg-white/70 backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-200 placeholder:text-amber-400/60"
                />
                {locationKeyword && (
                  <button
                    onClick={() => setLocationKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-amber-600" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {availableMonths.map(monthKey => {
                  const count = journals.filter(j => getMonthKey(j.date) === monthKey).length;
                  const isActive = selectedMonth === monthKey;
                  return (
                    <button
                      key={monthKey}
                      onClick={() => scrollToMonth(monthKey)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        isActive
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                          : 'bg-white/70 text-amber-700 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      {formatMonthLabel(monthKey)}
                      <span className={`ml-1.5 text-xs ${isActive ? 'text-amber-100' : 'text-amber-500'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
                {selectedMonth && (
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="flex-shrink-0 px-3 py-2 rounded-full text-sm text-amber-600 hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    清除月份
                  </button>
                )}
              </div>

              {hasFilters && (
                <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm text-amber-700">
                    筛选结果：{filteredJournals.length} 篇日记
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    清除全部筛选
                  </button>
                </div>
              )}
            </div>

            {filteredJournals.length === 0 ? (
              <div className="card-paper p-10 text-center animate-fade-in">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="hand-title text-2xl mb-2">没有找到匹配的日记</h3>
                <p className="text-amber-700/70 mb-6">
                  {selectedMonth && locationKeyword
                    ? `${formatMonthLabel(selectedMonth)} 没有包含"${locationKeyword}"的日记`
                    : selectedMonth
                    ? `${formatMonthLabel(selectedMonth)} 还没有日记`
                    : `没有包含"${locationKeyword}"的日记`}
                  <br />
                  试试调整筛选条件
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  清除筛选条件
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(journalsByMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([monthKey, monthJournals]) => (
                    <div
                      key={monthKey}
                      ref={(el) => { journalRefs.current[monthKey] = el; }}
                      className="space-y-4"
                    >
                      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-gradient-to-b from-amber-50/95 to-amber-50/80 backdrop-blur-sm">
                        <h2 className="hand-title text-lg text-amber-700 flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span>
                          {formatMonthLabel(monthKey)}
                          <span className="text-sm font-normal text-amber-500">
                            ({monthJournals.length}篇)
                          </span>
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {monthJournals.map((journal, index) => (
                          <div
                            key={journal.id}
                            className="card-paper card-paper-hover overflow-hidden animate-slide-up cursor-pointer"
                            style={{ animationDelay: `${index * 80}ms` }}
                            onClick={() => navigate(`/journal/${journal.id}`)}
                          >
                            {journal.photos.length > 0 && (
                              <div className="h-40 overflow-hidden">
                                <img
                                  src={journal.photos[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="hand-title text-xl truncate">
                                    {journal.title || '无标题日记'}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-amber-700/70 mt-1">
                                    <span>{formatDate(journal.date)}</span>
                                    {journal.location && (
                                      <>
                                        <span>·</span>
                                        <span className="truncate flex items-center gap-1">
                                          <MapPin className="w-3 h-3 inline" />
                                          {locationKeyword && journal.location.toLowerCase().includes(locationKeyword.toLowerCase()) ? (
                                            <>
                                              {journal.location.split(new RegExp(`(${escapeRegExp(locationKeyword)})`, 'i')).map((part, i) =>
                                                part.toLowerCase() === locationKeyword.toLowerCase() ? (
                                                  <mark key={i} className="bg-amber-200 rounded px-0.5">
                                                    {part}
                                                  </mark>
                                                ) : (
                                                  <span key={i}>{part}</span>
                                                )
                                              )}
                                            </>
                                          ) : (
                                            journal.location
                                          )}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/journal/${journal.id}`);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-100 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4 text-amber-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('确定要删除这篇日记吗？')) {
                                        deleteJournal(journal.id);
                                      }
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-amber-800/80 text-sm line-clamp-2 leading-relaxed">
                                {journal.content || '还没有内容...'}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-3">
                                {journal.photos.length > 0 && (
                                  <span className="text-xs text-amber-700/60 flex items-center gap-1">
                                    📷 {journal.photos.length}张照片
                                  </span>
                                )}
                                {journal.stickers.length > 0 && (
                                  <span className="text-xs text-amber-700/60 flex items-center gap-1">
                                    {journal.stickers.slice(0, 3).map(s => s.type).join(' ')}
                                    {journal.stickers.length > 3 && ` +${journal.stickers.length - 3}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="text-center mt-8 text-amber-700/60 animate-fade-in">
              <p className="text-sm">
                {hasFilters
                  ? `筛选后 ${filteredJournals.length} 篇 / 共 ${journals.length} 篇旅行日记`
                  : `共 ${journals.length} 篇旅行日记`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
