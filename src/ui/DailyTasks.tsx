import { Check, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "../atlas/context";
import { go } from "../lib/router";
import { dayKey, setDayTasks, useStore } from "../store/store";

export const TASK_NEW = 20;
export const TASK_REVIEW = 10;

/** Words first met today (fallback: every learned word), used to check the sentence. */
export function todaysWords(cards: Record<string, { seen: number }>, words: Map<string, { word: string }>) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const all = Object.entries(cards);
  const today = all.filter(([, c]) => c.seen >= start.getTime());
  return (today.length ? today : all).map(([id]) => words.get(id)?.word).filter((w): w is string => !!w);
}

export function sentenceUses(sentence: string, words: string[]) {
  const s = ` ${sentence.toLowerCase().replace(/[^a-z'-]+/g, " ")} `;
  return words.find((w) => s.includes(` ${w.toLowerCase()} `) || s.includes(` ${w.toLowerCase()}s `) || s.includes(` ${w.toLowerCase()}ed `) || s.includes(` ${w.toLowerCase()}d `));
}

export function DailyTasks({ onLearn, onReview }: { onLearn: () => void; onReview: () => void }) {
  const atlas = useAtlas();
  const progress = useStore((s) => s.progress);
  const day = progress.days[dayKey()];
  const words = useMemo(() => todaysWords(progress.cards, atlas.byId as Map<string, { word: string }>), [progress.cards, atlas]);
  const [draft, setDraft] = useState(day?.tasks?.sentence ?? "");
  const [msg, setMsg] = useState("");

  const learnDone = (day?.n ?? 0) >= TASK_NEW;
  const reviewDone = (day?.r ?? 0) - (day?.n ?? 0) >= TASK_REVIEW;
  const sentenceDone = !!day?.tasks?.sentence;
  const all = learnDone && reviewDone && sentenceDone;
  const doneCount = [learnDone, reviewDone, sentenceDone].filter(Boolean).length;

  const save = () => {
    const t = draft.trim();
    if (t.length < 4) return setMsg("句子太短啦，再多写几个词。");
    const hit = sentenceUses(t, words);
    if (!hit) return setMsg(words.length ? `句子里要用上今天学过的词，比如 ${words.slice(0, 3).join("、")}。` : "先去背几个词，再回来造句。");
    setMsg(`用上了 ${hit}，不错！`);
    const lit = learnDone && reviewDone;
    setDayTasks({ sentence: t, ...(lit ? { star: true } : {}) });
  };
  if (all && !day?.tasks?.star) setTimeout(() => setDayTasks({ star: true }), 0);

  const Item = ({ ok, title, sub, children }: { ok: boolean; title: string; sub: string; children?: React.ReactNode }) => (
    <li className={`dt-item ${ok ? "is-done" : ""}`}>
      <span className="dt-check">{ok ? <Check size={16} /> : null}</span>
      <div className="dt-body">
        <b>{title}</b>
        <small>{sub}</small>
        {children}
      </div>
    </li>
  );

  return (
    <section className="panel daily-tasks" aria-label="每日三件小事">
      <header className="dt-head">
        <h3 className="eyebrow">每日三件小事</h3>
        <span className="dt-count">{doneCount}/3</span>
      </header>
      <ol>
        <Item ok={learnDone} title={`背 ${TASK_NEW} 个新词`} sub={`今天已背 ${Math.min(day?.n ?? 0, TASK_NEW)}/${TASK_NEW}`}>
          {!learnDone && <button className="btn btn-small" onClick={onLearn}>去背词</button>}
        </Item>
        <Item ok={reviewDone} title={`复习 ${TASK_REVIEW} 个旧词/错词`} sub={`错词本里有 ${progress.mistakes.length} 个`}>
          {!reviewDone && (
            <span className="dt-btns">
              <button className="btn btn-small" onClick={onReview}>去复习</button>
              {progress.mistakes.length > 0 && <button className="btn btn-small btn-ghost" onClick={() => go({ page: "practice" })}>练错词</button>}
            </span>
          )}
        </Item>
        <Item ok={sentenceDone} title="用今天的词造一句话" sub={sentenceDone ? `「${day!.tasks!.sentence}」` : "写英文句子，只保存在你的手机里"}>
          {!sentenceDone && (
            <div className="dt-sentence">
              <textarea rows={2} value={draft} maxLength={300} placeholder={words[0] ? `例如用 ${words[0]} 写一句……` : "先背词，再造句"} onChange={(e) => setDraft(e.target.value)} />
              <button className="btn btn-small btn-primary" onClick={save}>保存</button>
            </div>
          )}
          {msg && <small className="dt-msg">{msg}</small>}
        </Item>
      </ol>
      <p className={`dt-star ${all ? "is-lit" : ""}`}>
        <Star size={16} fill={all ? "currentColor" : "none"} /> {all ? "今天的任务星已点亮，去「我的星空」看看。" : "三件都做完，点亮今天的任务星。"}
      </p>
    </section>
  );
}

