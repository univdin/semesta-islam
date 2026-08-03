'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Handshake,
  BadgeCheck,
  Flag,
  ChevronDown,
  Send,
  Reply,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/useToast';

type TargetType = 'EDUCATOR_PROFILE' | 'TOPIC';
type VoteType = 'HELPFUL' | 'AGREE' | 'ENDORSE';

interface CommentAuthor {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface CommentSummary {
  id: string;
  author: CommentAuthor;
  body: string;
  status: string;
  isCorrection: boolean;
  correctionNote: string | null;
  parentId: string | null;
  createdAt: string;
  votes: Record<VoteType, number>;
  viewerVotes: VoteType[];
}

interface QuestionSummary {
  id: string;
  author: CommentAuthor;
  title: string;
  body: string;
  answerCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  votes: Record<VoteType, number>;
  viewerVotes: VoteType[];
}

interface AnswerSummary {
  id: string;
  author: CommentAuthor;
  body: string;
  acceptedAt: string | null;
  createdAt: string;
  votes: Record<VoteType, number>;
  viewerVotes: VoteType[];
}

const VOTE_LABELS: Record<VoteType, string> = {
  HELPFUL: 'Bermanfaat',
  AGREE: 'Setuju',
  ENDORSE: 'Endors',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function AuthorName({ author }: { author: CommentAuthor }) {
  if (author.fullName) {
    return <span className="font-semibold text-gray-800 dark:text-gray-200">{author.fullName}</span>;
  }
  return <span className="font-semibold text-gray-800 dark:text-gray-200">Anggota SEMESTA ISLAM</span>;
}

interface CommunitySectionProps {
  targetType: TargetType;
  targetId: string;
  context?: { topicId?: string; educatorId?: string };
}

export function CommunitySection({ targetType, targetId, context }: CommunitySectionProps) {
  const toast = useToast();
  const [tab, setTab] = useState<'comments' | 'qa'>('comments');

  return (
    <section className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-emerald-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
          Komunitas
        </h2>
        <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setTab('comments')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'comments'
                ? 'bg-[#0F3D2E] text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800'
            }`}
          >
            Diskusi
          </button>
          <button
            onClick={() => setTab('qa')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'qa'
                ? 'bg-[#0F3D2E] text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800'
            }`}
          >
            Tanya Jawab
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Ulasan dan tanda terima di sini adalah sinyal komunitas — bukan pengganti verifikasi Lajnah.
        Konten moderasi dikelola SEMESTA ISLAM sesuai kebijakan tata kelola.
      </p>

      {tab === 'comments' ? (
        <CommentsTab targetType={targetType} targetId={targetId} toastApi={toast} />
      ) : (
        <QaTab context={context} toastApi={toast} />
      )}
    </section>
  );
}

type ToastApi = ReturnType<typeof useToast>;

async function handleResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as { success: boolean; statusCode: number; message?: string; data?: T };
  if (!json.success || res.status >= 400) {
    const err = new Error(json.message ?? 'Terjadi kesalahan.') as Error & { statusCode: number };
    err.statusCode = json.statusCode ?? res.status;
    throw err;
  }
  return json.data as T;
}

function useCurrentIdentity() {
  const [hasIdentity, setHasIdentity] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/v1/community/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => setHasIdentity(json?.success === true))
      .catch(() => setHasIdentity(false));
  }, []);
  return hasIdentity;
}

interface CommentsTabProps {
  targetType: TargetType;
  targetId: string;
  toastApi: ToastApi;
}

function CommentsTab({ targetType, targetId, toastApi }: CommentsTabProps) {
  const [comments, setComments] = useState<CommentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [isCorrection, setIsCorrection] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentSummary | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const hasIdentity = useCurrentIdentity();
  const listRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await handleResponse<{ comments: CommentSummary[] }>(
        await fetch(`/api/v1/community/comments?targetType=${targetType}&targetId=${targetId}`, { cache: 'no-store' })
      );
      setComments(data.comments);
    } catch (e) {
      toastApi.error('Gagal memuat diskusi', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId]);

  const submitComment = async () => {
    if (body.trim().length < 2) {
      toastApi.warning('Komentar terlalu pendek');
      return;
    }
    try {
      const data = await handleResponse<{ comment: CommentSummary }>(
        await fetch('/api/v1/community/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
            body: body.trim(),
            isCorrection: isCorrection || undefined,
            correctionNote: isCorrection ? correctionNote.trim() : undefined,
          }),
        })
      );
      toastApi.success('Komentar terkirim');
      setBody('');
      setIsCorrection(false);
      setCorrectionNote('');
      await load();
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      if (err.statusCode === 401) {
        toastApi.info('Silakan masuk untuk berpartisipasi', 'Tanda tangani akun atau pilih identitas demo.');
      } else {
        toastApi.error('Gagal mengirim komentar', err.message);
      }
    }
  };

  const submitReply = async (parent: CommentSummary) => {
    if (replyBody.trim().length < 2) {
      toastApi.warning('Balasan terlalu pendek');
      return;
    }
    try {
      await handleResponse<{ comment: CommentSummary }>(
        await fetch('/api/v1/community/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId, parentId: parent.id, body: replyBody.trim() }),
        })
      );
      toastApi.success('Balasan terkirim');
      setReplyBody('');
      setReplyingTo(null);
      await load();
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      toastApi.error('Gagal membalas', err.message);
    }
  };

  const vote = async (commentId: string, voteType: VoteType, currentlyHas: boolean) => {
    try {
      if (currentlyHas) {
        await handleResponse(
          await fetch('/api/v1/community/votes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetType: 'COMMENT', targetId: commentId, voteType }),
          })
        );
      } else {
        await handleResponse(
          await fetch('/api/v1/community/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetType: 'COMMENT', targetId: commentId, voteType }),
          })
        );
      }
      await load();
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      if (err.statusCode === 401) {
        toastApi.info('Silakan masuk untuk memberikan tanda terima');
      } else {
        toastApi.error('Gagal memberikan tanda terima', err.message);
      }
    }
  };

  const report = async (commentId: string) => {
    const reason = window.prompt('Alasan melaporkan konten ini:');
    if (!reason || reason.trim().length < 3) {
      toastApi.warning('Alasan laporan minimal 3 karakter');
      return;
    }
    try {
      const data = await handleResponse<{ duplicate?: boolean; autoFlagged?: boolean }>(
        await fetch('/api/v1/community/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: 'COMMENT', targetId: commentId, reason: reason.trim() }),
        })
      );
      if (data.autoFlagged) {
        toastApi.success('Laporan diterima', 'Konten telah otomatis ditandai untuk peninjauan moderator.');
      } else {
        toastApi.success(data.duplicate ? 'Anda telah melaporkan konten ini' : 'Laporan terkirim');
      }
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      if (err.statusCode === 401) {
        toastApi.info('Silakan masuk untuk melaporkan konten');
      } else {
        toastApi.error('Gagal melaporkan', err.message);
      }
    }
  };

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <div>
      {hasIdentity === false && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <span>
            Silakan{' '}
            <Link href="/login" className="underline underline-offset-2 font-medium">
              masuk
            </Link>{' '}
            untuk berkomentar, bertanya, atau memberikan tanda terima.
          </span>
        </div>
      )}

      <div ref={listRef} className="space-y-4 max-h-[520px] overflow-y-auto pr-1 mb-5">
        {loading && <p className="text-sm text-gray-500">Memuat diskusi…</p>}
        {!loading && topLevel.length === 0 && (
          <p className="text-sm text-gray-500 py-4">Belum ada komentar. Jadilah yang pertama berdiskusi.</p>
        )}
        {!loading &&
          topLevel.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              replies={repliesOf(c.id)}
              onReply={() => {
                setReplyingTo(replyingTo?.id === c.id ? null : c);
                setReplyBody('');
              }}
              replying={replyingTo?.id === c.id}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              submitReply={() => submitReply(c)}
              onVote={(t) => vote(c.id, t, c.viewerVotes.includes(t))}
              onReport={() => report(c.id)}
            />
          ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitComment();
        }}
        className="border-t border-gray-100 dark:border-gray-800 pt-4"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Tulis komentar atau koreksi (maks 2000 karakter)…"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCorrection}
            onChange={(e) => setIsCorrection(e.target.checked)}
            className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
          />
          Kirim sebagai koreksi terhadap klaim keilmuan (akan ditelaah sebelum menjadi draf klaim)
        </label>
        {isCorrection && (
          <textarea
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            rows={2}
            placeholder="Catatan koreksi (10–1000 karakter): jelaskan ketidaksesuaian dengan sumber…"
            className="w-full rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        )}
        <div className="flex justify-end mt-3">
          <button type="submit" className="btn btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Kirim
          </button>
        </div>
      </form>
    </div>
  );
}

interface CommentThreadProps {
  comment: CommentSummary;
  replies: CommentSummary[];
  onReply: () => void;
  replying: boolean;
  replyBody: string;
  setReplyBody: (v: string) => void;
  submitReply: () => void;
  onVote: (t: VoteType) => void;
  onReport: () => void;
}

function CommentThread({
  comment,
  replies,
  onReply,
  replying,
  replyBody,
  setReplyBody,
  submitReply,
  onVote,
  onReport,
}: CommentThreadProps) {
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#0F3D2E]/10 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 overflow-hidden">
          {comment.author.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#0F3D2E] dark:text-emerald-300 font-bold text-sm">
              {(comment.author.fullName?.[0] ?? 'A').toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AuthorName author={comment.author} />
            <span className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</span>
            {comment.isCorrection && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Koreksi
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.body}</p>
          {comment.isCorrection && comment.correctionNote && (
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-lg p-2">
              <span className="font-semibold">Catatan koreksi: </span>
              {comment.correctionNote}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {(Object.keys(VOTE_LABELS) as VoteType[]).map((t) => {
              const active = comment.viewerVotes.includes(t);
              const count = comment.votes[t] ?? 0;
              const Icon = t === 'HELPFUL' ? ThumbsUp : t === 'AGREE' ? Handshake : BadgeCheck;
              return (
                <button
                  key={t}
                  onClick={() => onVote(t)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                  }`}
                  title={VOTE_LABELS[t]}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {count > 0 ? count : ''}
                </button>
              );
            })}
            <button onClick={onReply} className="inline-flex items-center gap-1 hover:text-emerald-700">
              <Reply className="w-3.5 h-3.5" /> Balas
            </button>
            <button onClick={onReport} className="inline-flex items-center gap-1 text-red-400 hover:text-red-600">
              <Flag className="w-3.5 h-3.5" /> Laporkan
            </button>
          </div>
          {replying && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitReply();
              }}
              className="mt-3 flex items-start gap-2"
            >
              <input
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Tulis balasan…"
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              <button type="submit" className="btn btn-primary text-xs px-3 py-2 inline-flex items-center gap-1">
                <Send className="w-3 h-3" /> Kirim
              </button>
            </form>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="bg-white/60 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <AuthorName author={r.author} />
                <span className="text-[11px] text-gray-400">{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{r.body}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {(Object.keys(VOTE_LABELS) as VoteType[]).map((t) => {
                  const active = r.viewerVotes.includes(t);
                  const count = r.votes[t] ?? 0;
                  const Icon = t === 'HELPFUL' ? ThumbsUp : t === 'AGREE' ? Handshake : BadgeCheck;
                  return (
                    <button
                      key={t}
                      onClick={() => (active ? removeVoteByTarget('COMMENT', r.id, t) : castVoteByTarget('COMMENT', r.id, t)).then(() => window.location.reload())}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                      }`}
                      title={VOTE_LABELS[t]}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const reason = window.prompt('Alasan melaporkan konten ini:');
                    if (reason && reason.trim().length >= 3) {
                      reportTarget('COMMENT', r.id, reason.trim())
                        .then(() => window.location.reload())
                        .catch(() => undefined);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-600"
                >
                  <Flag className="w-3.5 h-3.5" /> Laporkan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function castVoteByTarget(targetType: string, targetId: string, voteType: VoteType) {
  return fetch('/api/v1/community/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId, voteType }),
  });
}

async function removeVoteByTarget(targetType: string, targetId: string, voteType: VoteType) {
  return fetch('/api/v1/community/votes', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId, voteType }),
  });
}

async function reportTarget(targetType: string, targetId: string, reason: string) {
  return fetch('/api/v1/community/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId, reason }),
  });
}

interface QaTabProps {
  context?: { topicId?: string; educatorId?: string };
  toastApi: ToastApi;
}

function QaTab({ context, toastApi }: QaTabProps) {
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [qBody, setQBody] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const hasIdentity = useCurrentIdentity();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (context?.educatorId) params.set('educatorId', context.educatorId);
      if (context?.topicId) params.set('topicId', context.topicId);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await handleResponse<{ questions: QuestionSummary[] }>(
        await fetch(`/api/v1/community/questions${qs}`, { cache: 'no-store' })
      );
      setQuestions(data.questions);
    } catch (e) {
      toastApi.error('Gagal memuat pertanyaan', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.educatorId, context?.topicId]);

  const ask = async () => {
    if (title.trim().length < 5 || qBody.trim().length < 10) {
      toastApi.warning('Judul minimal 5 karakter, isi minimal 10 karakter');
      return;
    }
    try {
      const data = await handleResponse<{ question: QuestionSummary }>(
        await fetch('/api/v1/community/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            body: qBody.trim(),
            educatorId: context?.educatorId,
            topicId: context?.topicId,
          }),
        })
      );
      toastApi.success('Pertanyaan terkirim');
      setTitle('');
      setQBody('');
      setOpenId(data.question.id);
      await load();
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      if (err.statusCode === 401) {
        toastApi.info('Silakan masuk untuk bertanya');
      } else {
        toastApi.error('Gagal mengirim pertanyaan', err.message);
      }
    }
  };

  return (
    <div>
      {hasIdentity === false && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <span>
            Silakan{' '}
            <Link href="/login" className="underline underline-offset-2 font-medium">
              masuk
            </Link>{' '}
            untuk bertanya atau menjawab.
          </span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="mb-5 border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-white/50 dark:bg-gray-900/50"
      >
        <h3 className="text-sm font-semibold text-[#0F3D2E] dark:text-emerald-100 flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" /> Ajukan Pertanyaan
        </h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul pertanyaan (5–300 karakter)"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />
        <textarea
          value={qBody}
          onChange={(e) => setQBody(e.target.value)}
          rows={2}
          placeholder="Detail pertanyaan (10–5000 karakter)…"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />
        <div className="flex justify-end mt-2">
          <button type="submit" className="btn btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Ajukan
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-sm text-gray-500">Memuat pertanyaan…</p>}
        {!loading && questions.length === 0 && (
          <p className="text-sm text-gray-500 py-3">Belum ada pertanyaan untuk konteks ini.</p>
        )}
        {!loading &&
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              open={openId === q.id}
              onToggle={() => setOpenId(openId === q.id ? null : q.id)}
              toastApi={toastApi}
            />
          ))}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionSummary;
  open: boolean;
  onToggle: () => void;
  toastApi: ToastApi;
}

function QuestionCard({ question, open, onToggle, toastApi }: QuestionCardProps) {
  const [answers, setAnswers] = useState<AnswerSummary[] | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerBody, setAnswerBody] = useState('');
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/community/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => setViewerUserId(json?.success === true ? (json.data?.userId ?? null) : null))
      .catch(() => setViewerUserId(null));
  }, []);

  const openAnswers = async () => {
    if (answers !== null) return;
    setLoadingAnswers(true);
    try {
      const data = await handleResponse<{ question: QuestionSummary; answers: AnswerSummary[] }>(
        await fetch(`/api/v1/community/questions/${question.id}`, { cache: 'no-store' })
      );
      setAnswers(data.answers);
    } catch (e) {
      toastApi.error('Gagal memuat jawaban', (e as Error).message);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const submitAnswer = async () => {
    if (answerBody.trim().length < 10) {
      toastApi.warning('Jawaban minimal 10 karakter');
      return;
    }
    try {
      await handleResponse<{ answer: AnswerSummary }>(
        await fetch(`/api/v1/community/questions/${question.id}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: answerBody.trim() }),
        })
      );
      toastApi.success('Jawaban terkirim');
      setAnswerBody('');
      const data = await handleResponse<{ answers: AnswerSummary[] }>(
        await fetch(`/api/v1/community/questions/${question.id}`, { cache: 'no-store' })
      );
      setAnswers(data.answers);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      toastApi.error(err.statusCode === 401 ? 'Silakan masuk untuk menjawab' : 'Gagal mengirim jawaban', err.message);
    }
  };

  const accept = async (answerId: string) => {
    try {
      const data = await handleResponse<{ xpAwarded?: boolean }>(
        await fetch(`/api/v1/community/answers/${answerId}/accept`, { method: 'PUT' })
      );
      toastApi.success(data.xpAwarded ? 'Jawaban diterima — apresiasi syi\'ar diberikan' : 'Jawaban diterima');
      const detail = await handleResponse<{ answers: AnswerSummary[] }>(
        await fetch(`/api/v1/community/questions/${question.id}`, { cache: 'no-store' })
      );
      setAnswers(detail.answers);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      toastApi.error('Gagal menerima jawaban', err.message);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{question.title}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {question.author.fullName ?? 'Anggota'} · {formatDate(question.createdAt)}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {question.hasAcceptedAnswer && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            {question.answerCount} jawaban
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </div>
        {open && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">{question.body}</p>}
      </button>

      {open && (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <button onClick={openAnswers} className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mb-3">
            {loadingAnswers ? 'Memuat jawaban…' : answers === null ? 'Lihat jawaban' : `${answers.length} jawaban`}
          </button>

          {answers !== null && (
            <div className="space-y-3">
              {answers.length === 0 && <p className="text-sm text-gray-500">Belum ada jawaban. Jadilah yang pertama menjawab.</p>}
              {answers.map((a) => {
                const isAccepted = Boolean(a.acceptedAt);
                const canAccept = viewerUserId === question.author.id && !isAccepted;
                return (
                  <div
                    key={a.id}
                    className={`rounded-xl p-3 border ${
                      isAccepted
                        ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <AuthorName author={a.author} />
                      <span className="text-[11px] text-gray-400">{formatDate(a.createdAt)}</span>
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Jawaban terbaik
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5 whitespace-pre-wrap">{a.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {(Object.keys(VOTE_LABELS) as VoteType[]).map((t) => {
                        const active = a.viewerVotes.includes(t);
                        const count = a.votes[t] ?? 0;
                        return (
                          <button
                            key={t}
                            onClick={async () => {
                              try {
                                if (active) await removeVoteByTarget('ANSWER', a.id, t);
                                else await castVoteByTarget('ANSWER', a.id, t);
                                const detail = await handleResponse<{ answers: AnswerSummary[] }>(
                                  await fetch(`/api/v1/community/questions/${question.id}`, { cache: 'no-store' })
                                );
                                setAnswers(detail.answers);
                              } catch (err) {
                                toastApi.error('Gagal memberikan tanda terima', (err as Error).message);
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                              active
                                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                            }`}
                            title={VOTE_LABELS[t]}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {count > 0 ? count : ''}
                          </button>
                        );
                      })}
                      {canAccept && (
                        <button
                          onClick={() => accept(a.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" /> Terima jawaban
                        </button>
                      )}
                      {a.acceptedAt && viewerUserId === question.author.id && (
                        <button
                          onClick={async () => {
                            try {
                              await handleResponse(
                                await fetch(`/api/v1/community/answers/${a.id}/accept`, { method: 'DELETE' })
                              );
                              toastApi.success('Penerimaan jawaban dicabut');
                              const detail = await handleResponse<{ answers: AnswerSummary[] }>(
                                await fetch(`/api/v1/community/questions/${question.id}`, { cache: 'no-store' })
                              );
                              setAnswers(detail.answers);
                            } catch (err) {
                              toastApi.error('Gagal mencabut', (err as Error).message);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" /> Cabut
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAnswer();
                }}
                className="flex items-start gap-2 mt-2"
              >
                <textarea
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  rows={2}
                  placeholder="Tulis jawaban Anda (min 10 karakter)…"
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <button type="submit" className="btn btn-primary text-xs px-3 py-2 inline-flex items-center gap-1 shrink-0">
                  <Send className="w-3 h-3" /> Jawab
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
