import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import {
  Activity, ArrowRight, Award, CalendarDays, Check, ClipboardList, Clock3, FilePlus2, Goal,
  LayoutDashboard, Menu, MoreHorizontal, Pencil, Plus, Search, Shield, Shuffle, Star, Swords,
  Trash2, Trophy, UserCheck, Users, X,
} from 'lucide-react';

type Position = 'Goleiro' | 'Defesa' | 'Meio' | 'Ataque';
type Ratings = { goleiro: number; defesa: number; meio: number; ataque: number };
type Player = { id: string; name: string; nickname: string; position: Position; ratings: Ratings; present: boolean; active: boolean; };
type Team = { id: string; rodadaId: string; name: string; color: string; playerIds: string[] };
type Match = { id: string; date: string; teamA: string; teamB: string; scoreA: number; scoreB: number; goalsA: string[]; goalsB: string[]; assistsA: string[]; assistsB: string[]; bestKeeper: string; };
type PlayerEvent = { id: string; playerId: string; type: 'gol' | 'assistencia' | 'defesa_dificil'; date: string; };
type RepeatType = 'never' | 'weekly' | 'biweekly' | 'monthly';
type Rodada = { id: string; date: string; time: string; location: string; description?: string; repeatType?: RepeatType; repeatUntil?: string; createdAt: string; };

const COLORS = ['#5d8f68', '#3b82f6', '#fbbf24', '#f97316', '#1f2937', '#f5f5f5'];
const COLOR_NAMES: Record<string, string> = { '#5d8f68': 'Verde', '#3b82f6': 'Azul', '#fbbf24': 'Amarelo', '#f97316': 'Laranja', '#1f2937': 'Preto', '#f5f5f5': 'Branco' };
const positions: Position[] = ['Goleiro', 'Defesa', 'Meio', 'Ataque'];
const ratingKeys: (keyof Ratings)[] = ['goleiro', 'defesa', 'meio', 'ataque'];
const ratingLabels: Record<keyof Ratings, string> = { goleiro: 'Gol', defesa: 'Def', meio: 'Mei', ataque: 'Ata' };
const id = () => Math.random().toString(36).slice(2, 9);
const seedPlayers: Player[] = [];
const seedRodadas: Rodada[] = [
  { id: 'r1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '20:00', location: 'Quadra do Zé', description: 'Próxima rodada confirmada', repeatType: 'weekly', repeatUntil: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], createdAt: new Date().toISOString() },
];
const seedMatches: Match[] = [];

function useStored<T>(key: string, initial: T): [T, (value: T | ((old: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

const initials = (name: string) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const overall = (p: Player) => (p.ratings.goleiro + p.ratings.defesa + p.ratings.meio + p.ratings.ataque) / 4;
const formatDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date)).replace('.', '');
const fullDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));

function Stars({ value, onChange, label }: { value: number; onChange?: (value: number) => void; label?: string }) {
  return <div className="flex items-center gap-0.5" aria-label={`${value} de 3 estrelas`}>
    {[1, 2, 3].map((star) => <button type="button" key={star} data-testid={`button-rating-${label ?? 'view'}-${star}`} onClick={() => onChange?.(star === value ? star - 1 : star)} className={`p-0.5 transition-transform hover:scale-110 ${star <= value ? 'text-[#e5a82f]' : 'text-[#cfc9b6]'}`} disabled={!onChange}>
      <Star className="size-3.5" fill="currentColor" strokeWidth={1.5} />
    </button>)}
  </div>;
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d22]/50 p-4 backdrop-blur-sm overflow-y-auto animate-fade" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-xl'} max-h-[90vh] overflow-y-auto rounded-[1.6rem] border bg-card p-5 shadow-2xl sm:p-7 animate-rise my-auto`}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-1 font-display text-[11px] font-bold uppercase tracking-[.2em] text-muted-foreground">Pelada Pro</p><h2 className="font-display text-3xl font-bold uppercase leading-none">{title}</h2></div><button data-testid="button-close-modal" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-5" /></button></div>
      {children}
    </div>
  </div>;
}

function Confirm({ title, text, onClose, onConfirm }: { title: string; text: string; onClose: () => void; onConfirm: () => void }) {
  return <Modal title={title} onClose={onClose}><p className="text-sm leading-6 text-muted-foreground">{text}</p><div className="mt-7 flex justify-end gap-2"><button data-testid="button-cancel-delete" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted">Cancelar</button><button data-testid="button-confirm-delete" onClick={onConfirm} className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground hover:brightness-95">Excluir</button></div></Modal>;
}

function Logo() {
  return <Link href="/" data-testid="link-logo" className="flex items-center gap-2.5">
    <span className="grid size-10 place-items-center rounded-xl bg-[#c8f169] text-[#143b2a] shadow-[3px_3px_0_#143b2a]"><Swords className="size-5" strokeWidth={2.5} /></span>
    <span><strong className="font-display text-2xl font-black uppercase leading-none tracking-tight">Pelada</strong><span className="ml-1 font-display text-2xl font-black uppercase leading-none text-[#c8f169]">Pro</span><small className="block text-[9px] font-bold uppercase tracking-[.19em] text-[#aabeb1]">organiza a rodada</small></span>
  </Link>;
}

const navItems = [
  { href: '/', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/rodadas', label: 'Rodadas', icon: CalendarDays },
  { href: '/jogadores', label: 'Jogadores', icon: Users },
  { href: '/times', label: 'Times', icon: Shield },
  { href: '/sorteio', label: 'Sorteio', icon: Shuffle },
  { href: '/live-scoring', label: 'Live Scoring', icon: Activity },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
];

function Shell({ children, rodadas = [] }: { children: ReactNode; rodadas?: Rodada[] }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const nextRodada = rodadas.length > 0 ? rodadas.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] : null;
  const nextRodadaDate = nextRodada ? new Date(nextRodada.date) : null;
  const nextRodadaDayName = nextRodadaDate ? new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(nextRodadaDate).split(',')[0].charAt(0).toUpperCase() + new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(nextRodadaDate).split(',')[0].slice(1) : 'A agendar';
  return <div className="texture min-h-[100dvh] bg-background">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#143b2a] px-5 py-7 text-[#f5f1e5] lg:flex">
      <Logo />
      <div className="mt-14"><p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#8eaa99]">Organização</p><nav className="space-y-1.5">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${location === href ? 'bg-[#c8f169] text-[#143b2a]' : 'text-[#b7cabb] hover:bg-[#204f38] hover:text-[#f5f1e5]'}`}><Icon className="size-[18px]" strokeWidth={location === href ? 2.5 : 1.8} /><span>{label}</span>{location === href && <ArrowRight className="ml-auto size-4" />}</Link>)}</nav></div>
      <div className="mt-auto rounded-2xl border border-[#3d674d] bg-[#1c4933] p-4">{nextRodada ? <><p className="flex items-center gap-2 text-xs font-bold text-[#c8f169]"><Activity className="size-4" /> Próxima rodada</p><p className="mt-3 font-display text-2xl font-bold uppercase">{nextRodadaDayName} · {nextRodada.time}</p><p className="mt-1 text-xs text-[#a7c0ad]">{nextRodada.location}</p><Link href="/sorteio" data-testid="link-sidebar-draw" className="mt-4 flex items-center justify-between rounded-lg bg-[#c8f169] px-3 py-2 text-xs font-black uppercase text-[#143b2a]">Montar times <ArrowRight className="size-3.5" /></Link></> : <><p className="flex items-center gap-2 text-xs font-bold text-[#a7c0ad]"><Activity className="size-4" /> Nenhuma rodada</p><p className="mt-3 text-xs text-[#a7c0ad]">Crie uma rodada pra começar</p><Link href="/rodadas" data-testid="link-sidebar-rodadas" className="mt-4 flex items-center justify-between rounded-lg bg-[#c8f169] px-3 py-2 text-xs font-black uppercase text-[#143b2a]">Criar rodada <ArrowRight className="size-3.5" /></Link></> }</div>
    </aside>
    <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b bg-background/90 px-5 backdrop-blur lg:hidden"><button data-testid="button-open-menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-muted"><Menu className="size-5" /></button><Logo /><span className="size-9" /></header>
    {menuOpen && <div className="fixed inset-0 z-50 bg-[#102d22]/50 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}><aside className="h-full w-[280px] bg-[#143b2a] p-6 text-[#f5f1e5]" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Logo /><button data-testid="button-close-menu" onClick={() => setMenuOpen(false)} className="text-[#c8f169]"><X /></button></div><nav className="mt-12 space-y-1.5">{navItems.map(({ href, label, icon: Icon }) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${location === href ? 'bg-[#c8f169] text-[#143b2a]' : 'text-[#b7cabb]'}`}><Icon className="size-[18px]" />{label}</Link>)}</nav></aside></div>}
    <main className="pb-24 lg:ml-[248px] lg:pb-8"><div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-center justify-around border-t bg-card/95 px-2 backdrop-blur lg:hidden">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-mobile-nav-${label}`} className={`flex min-w-0 flex-col items-center gap-1 px-2 py-2 text-[10px] font-bold ${location === href ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="size-[19px]" /><span className="truncate">{label.split(' ')[0]}</span></Link>)}</nav>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: ReactNode; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[.2em] text-[#708d78]"><span className="size-2 rounded-full bg-[#f97316]" />{eyebrow}</p><h1 className="font-display text-5xl font-black uppercase leading-[.86] tracking-tight sm:text-6xl">{title}</h1>{description && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function Button({ children, onClick, variant = 'primary', icon: Icon, testId, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'outline' | 'danger'; icon?: typeof Plus; testId?: string; type?: 'button' | 'submit' }) {
  const styles = { primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-[3px_3px_0_#c8f169]', soft: 'bg-secondary text-secondary-foreground hover:brightness-95', outline: 'border bg-card text-foreground hover:bg-muted', danger: 'bg-destructive text-destructive-foreground hover:brightness-95' };
  return <button type={type} onClick={onClick} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0 ${styles[variant]}`}>{Icon && <Icon className="size-4" />}{children}</button>;
}

function StatCard({ label, value, hint, icon: Icon, accent, href }: { label: string; value: string | number; hint: string; icon: typeof Users; accent: string; href?: string }) {
  const [, setLocation] = useLocation();
  const card = <div className={`rounded-2xl border bg-card p-5 shadow-sm ${href ? 'cursor-pointer hover:border-foreground hover:shadow-md transition-all' : ''}`} onClick={() => href && setLocation(href)}><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${accent}`}><Icon className="size-5" /></span><MoreHorizontal className="size-5 text-muted-foreground" /></div><p className="mt-5 font-display text-4xl font-black">{value}</p><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
  return card;
}

function Dashboard({ players, teams, matches, setPlayers, rodada, setActiveRodadaId, rodadas }: { players: Player[]; teams: Team[]; matches: Match[]; setPlayers: (value: Player[] | ((old: Player[]) => Player[])) => void; rodada?: Rodada; setActiveRodadaId: (id: string) => void; rodadas: Rodada[] }) {
  const [, setLocation] = useLocation();
  const present = players.filter((p) => p.present);
  
  // Calcular rankings
  const scorerCounts = new Map<string, number>(); matches.forEach((m) => [...m.goalsA, ...m.goalsB].forEach((p) => scorerCounts.set(p, (scorerCounts.get(p) ?? 0) + 1)));
  const assistCounts = new Map<string, number>(); matches.forEach((m) => [...(m.assistsA || []), ...(m.assistsB || [])].forEach((p) => assistCounts.set(p, (assistCounts.get(p) ?? 0) + 1)));
  const keeperCounts = new Map<string, number>(); matches.forEach((m) => { if (m.bestKeeper) keeperCounts.set(m.bestKeeper, (keeperCounts.get(m.bestKeeper) ?? 0) + 1); });
  
  const topScorer = players.map((p) => ({ player: p, count: scorerCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count)[0];
  const topAssist = players.map((p) => ({ player: p, count: assistCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count)[0];
  const topKeeper = players.map((p) => ({ player: p, count: keeperCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count)[0];
  
  const rodadaDate = rodada ? new Date(rodada.date) : null;
  const rodadaDayName = rodadaDate ? new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(rodadaDate).split(',')[0] : 'Aguardando';
  
  return <div className="animate-rise">
    <PageHeading eyebrow={rodada ? `${rodadaDayName.toUpperCase()}, ${rodada.time} · ${rodada.location}` : 'selecione uma rodada'} title={rodada ? <>A rodada está<br /><span className="text-[#f97316]">pronta.</span></> : <>Nenhuma rodada<br /><span className="text-[#f97316]">selecionada.</span></>} description={rodada ? 'Confira a presença e deixe o sorteio fazer o trabalho pesado.' : 'Selecione uma rodada em "Rodadas" para começar.'} action={rodada ? <Button icon={Shuffle} onClick={() => setLocation('/sorteio')} testId="button-dashboard-draw">Montar times</Button> : <Button icon={CalendarDays} onClick={() => setLocation('/rodadas')} testId="button-dashboard-rodadas">Ir para rodadas</Button>} />
    {rodada && <section className="relative mb-6 overflow-hidden rounded-[1.6rem] bg-[#1d5037] p-6 text-[#f5f1e5] shadow-sm sm:p-8"><div className="absolute -right-10 -top-16 size-56 rounded-full border-[28px] border-[#376b4d]/50" /><div className="absolute -bottom-24 right-24 size-64 rounded-full border border-[#c8f169]/20" /><div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#c8f169]"><CalendarDays className="size-4" /> Rodada ativa</div><h2 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">{fullDate(rodada.date)}</h2><p className="mt-2 text-sm text-[#b6cdb9]">{rodada.time} · {rodada.location}{rodada.description ? ` · ${rodada.description}` : ''}</p></div><div className="flex items-center gap-3 rounded-2xl bg-[#153f2c] px-5 py-4 cursor-pointer hover:bg-[#1a4d35] transition" onClick={() => setLocation('/jogadores')} title="Ir para Jogadores"><div className="grid size-12 place-items-center rounded-full bg-[#c8f169] text-[#143b2a]"><Users className="size-5" /></div><div><p className="font-display text-3xl font-black leading-none">{present.length}<span className="text-[#8eaa99]">/{players.length}</span></p><p className="mt-1 text-xs text-[#b6cdb9]">confirmados</p></div></div></div></section>}
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Jogadores" value={players.length} hint={`${present.length} presentes na rodada`} icon={Users} accent="bg-[#d9f3a1] text-[#456b31]" href="/rodadas" /><StatCard label="Times ativos" value={teams.length} hint="sorteados nesta rodada" icon={Shield} accent="bg-[#f9d995] text-[#835d1b]" href="/times" /><StatCard label="Rankings" value={matches.length} hint="histórico total" icon={Trophy} accent="bg-[#f7c9bf] text-[#a34839]" href="/rankings" /><StatCard label="Quem vem jogar" value={present.length} hint={`de ${players.length} confirmados`} icon={Users} accent="bg-[#d7d3f0] text-[#59558c]" href="/jogadores" /></div>
    {matches.length > 0 && <section className="rounded-2xl border bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-muted-foreground">Top de cada ranking</p><h3 className="mt-1 font-display text-2xl font-black uppercase">Destaques</h3></div><Link href="/live-scoring" data-testid="link-dashboard-live-scoring" className="text-xs font-bold text-[#487b4f] hover:underline">Live Scoring <ArrowRight className="ml-1 inline size-3" /></Link></div><div className="grid gap-4 sm:grid-cols-3">{topScorer && <div className="flex items-center gap-3 rounded-lg bg-[#f8d0c8]/30 p-4"><div className="flex flex-col gap-2 flex-1"><p className="text-[10px] font-bold uppercase text-muted-foreground">🏆 Artilheiro</p><p className="text-xs font-bold">{topScorer.player.nickname}</p><p className="text-[11px] font-black text-[#f97316]">{topScorer.count} gols</p></div></div>}{topAssist && <div className="flex items-center gap-3 rounded-lg bg-[#f9d995]/30 p-4"><div className="flex flex-col gap-2 flex-1"><p className="text-[10px] font-bold uppercase text-muted-foreground">🎯 Assistência</p><p className="text-xs font-bold">{topAssist.player.nickname}</p><p className="text-[11px] font-black text-[#f97316]">{topAssist.count} assistências</p></div></div>}{topKeeper && <div className="flex items-center gap-3 rounded-lg bg-[#d9f3a1]/30 p-4"><div className="flex flex-col gap-2 flex-1"><p className="text-[10px] font-bold uppercase text-muted-foreground">🛡️ Melhor goleiro</p><p className="text-xs font-bold">{topKeeper.player.nickname}</p><p className="text-[11px] font-black text-[#f97316]">{topKeeper.count} destaques</p></div></div>}</div></section>}
  </div>;
}

function PlayerForm({ player, teams, onSave, onClose }: { player?: Player; teams: Team[]; onSave: (player: Player) => void; onClose: () => void }) {
  const [name, setName] = useState(player?.name ?? '');
  const [nickname, setNickname] = useState(player?.nickname ?? '');
  const [position, setPosition] = useState<Position>(player?.position ?? 'Meio');
  const [active, setActive] = useState(player?.active ?? true);
  const [ratings, setRatings] = useState<Ratings>(player?.ratings ?? { goleiro: 0, defesa: 1, meio: 1, ataque: 1 });
  return <Modal title={player ? 'Editar jogador' : 'Novo jogador'} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; onSave({ id: player?.id ?? id(), name: name.trim(), nickname: nickname.trim() || name.trim().split(' ')[0], position, ratings, present: player?.present ?? false, active }); onClose(); }} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label">Nome completo</span><input autoFocus required data-testid="input-player-name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Ex.: Rafael Santos" /></label><label><span className="field-label">Como é chamado?</span><input data-testid="input-player-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="field-input" placeholder="Ex.: Rafa" /></label><label className="sm:col-span-2"><span className="field-label">Posição principal</span><select data-testid="select-player-position" value={position} onChange={(e) => setPosition(e.target.value as Position)} className="field-input">{positions.map((item) => <option key={item}>{item}</option>)}</select></label><label className="sm:col-span-2"><span className="field-label">Status</span><div className="flex items-center gap-2"><input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" /><label htmlFor="active" className="text-sm font-semibold">{active ? '✅ Ativo' : '❌ Inativo'}</label></div></label></div><div className="rounded-xl bg-muted/60 p-4"><p className="mb-3 text-xs font-black uppercase tracking-[.14em]">Avaliação técnica</p><div className="grid grid-cols-2 gap-4">{ratingKeys.map((key) => <div key={key} className="flex items-center justify-between"><span className="text-sm font-semibold">{key[0].toUpperCase() + key.slice(1)}</span><Stars label={key} value={ratings[key]} onChange={(value) => setRatings((old) => ({ ...old, [key]: value }))} /></div>)}</div><p className="mt-3 text-[11px] text-muted-foreground">Toque nas estrelas para ajustar de 0 a 3. Será incluído no sorteio normalmente.</p></div><div className="flex justify-end gap-2 border-t pt-5"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" icon={Check} testId="button-save-player">Salvar jogador</Button></div></form></Modal>;
}

function PlayersPage({ players, setPlayers, teams }: { players: Player[]; setPlayers: (value: Player[] | ((old: Player[]) => Player[])) => void; teams: Team[] }) {
  const [search, setSearch] = useState(''); const [modal, setModal] = useState<'new' | Player | null>(null); const [remove, setRemove] = useState<Player | null>(null);
  const filtered = players.filter((player) => `${player.name} ${player.nickname}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="animate-rise"><PageHeading eyebrow={`${players.length} cadastrados · ${players.filter((p) => p.present).length} presentes · ${players.filter(p => p.active).length} ativos`} title="Jogadores" description="O elenco da rodada, com presença e avaliação para o sorteio nunca ficar injusto." action={<Button icon={Plus} onClick={() => setModal('new')} testId="button-new-player">Novo jogador</Button>} /><div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" /><input data-testid="input-search-players" value={search} onChange={(e) => setSearch(e.target.value)} className="field-input pl-3 pr-9" placeholder="Buscar por nome ou apelido..." /></label><div className="flex items-center gap-2 rounded-xl border bg-card px-3 text-xs font-bold text-muted-foreground"><UserCheck className="size-4 text-[#56845d]" /> Presença atualizada na hora</div></div><div className="overflow-hidden rounded-2xl border bg-card">{filtered.length ? <div className="divide-y">{filtered.map((player) => <div key={player.id} data-testid={`row-player-${player.id}`} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6"><span className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${player.present ? 'bg-[#d9f3a1] text-[#456b31]' : 'bg-muted text-muted-foreground'}`}>{initials(player.name)}</span><div className="min-w-[150px] flex-1"><p className="font-bold">{player.nickname || player.name} {!player.active && <span className="text-xs text-muted-foreground">(inativo)</span>}</p><p className="text-xs text-muted-foreground">{player.name} · {player.position}</p></div><span className="hidden rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase text-muted-foreground sm:inline-flex">{player.position}</span><div className="hidden gap-3 md:flex">{ratingKeys.map((key) => <div key={key} className="text-center"><p className="text-[9px] font-black uppercase text-muted-foreground">{ratingLabels[key]}</p><Stars value={player.ratings[key]} /></div>)}</div><button data-testid={`button-presence-${player.id}`} onClick={() => setPlayers((old) => old.map((item) => item.id === player.id ? { ...item, present: !item.present } : item))} className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase transition-colors ${player.present ? 'bg-[#e3f4bb] text-[#47764e]' : 'bg-muted text-muted-foreground'}`}>{player.present ? 'Presente' : 'Marcar presença'}</button><div className="flex gap-1 border-l pl-2"><button data-testid={`button-toggle-active-${player.id}`} onClick={() => setPlayers((old) => old.map((item) => item.id === player.id ? { ...item, active: !item.active } : item))} className={`rounded-lg p-2 transition-colors ${player.active ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'bg-[#fce0db] text-destructive'}`} title={player.active ? 'Desativar' : 'Ativar'}>{player.active ? '✓' : '✕'}</button><button data-testid={`button-edit-player-${player.id}`} onClick={() => setModal(player)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-4" /></button><button data-testid={`button-delete-player-${player.id}`} onClick={() => setRemove(player)} className="rounded-lg p-2 text-muted-foreground hover:bg-[#fce0db] hover:text-destructive"><Trash2 className="size-4" /></button></div></div>)}</div> : <EmptyState icon={Users} title="Nenhum jogador por aqui" text={search ? 'Tente outro nome ou cadastre um novo jogador.' : 'Cadastre o primeiro jogador da sua pelada.'} action={!search ? <Button icon={Plus} onClick={() => setModal('new')}>Adicionar jogador</Button> : undefined} />}</div>{modal && <PlayerForm player={modal === 'new' ? undefined : modal} teams={teams} onClose={() => setModal(null)} onSave={(value) => setPlayers((old) => old.some((item) => item.id === value.id) ? old.map((item) => item.id === value.id ? value : item) : [...old, value])} />}{remove && <Confirm title="Excluir jogador?" text={`${remove.nickname || remove.name} será removido do elenco. O histórico de partidas continua intacto.`} onClose={() => setRemove(null)} onConfirm={() => { setPlayers((old) => old.filter((item) => item.id !== remove.id)); setRemove(null); }} />}</div>;
}

const extractBaseName = (fullName: string) => {
  let name = fullName;
  // Remove qualquer cor conhecida do final (repetidamente pra limpar concatenações)
  let changed = true;
  while (changed) {
    changed = false;
    for (const colorName of Object.values(COLOR_NAMES)) {
      if (name.endsWith(' ' + colorName)) {
        name = name.slice(0, -(colorName.length + 1));
        changed = true;
        break;
      }
    }
  }
  return name || 'Time';
};

function TeamForm({ team, players, activeRodadaId, onSave, onClose }: { team?: Team; players?: Player[]; activeRodadaId?: string; onSave: (team: Team) => void; onClose: () => void }) {
  const [name, setName] = useState(team?.name ? extractBaseName(team.name) : ''); 
  const [color, setColor] = useState(team?.color ?? COLORS[0]); 
  const [playerIds, setPlayerIds] = useState(team?.playerIds ?? []);
  
  return <Modal title={team ? 'Editar time' : 'Novo time'} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (!activeRodadaId) return; const fullName = name.trim() ? `${name.trim()} ${COLOR_NAMES[color]}` : `Time ${COLOR_NAMES[color]}`; onSave({ id: team?.id ?? id(), rodadaId: team?.rodadaId ?? activeRodadaId, name: fullName, color, playerIds }); onClose(); }} className="space-y-5"><label><span className="field-label">Nome do time</span><input autoFocus data-testid="input-team-name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Ex.: Time A" /></label><div><span className="field-label">Cor do colete <span className="text-xs text-muted-foreground">({COLOR_NAMES[color]})</span></span><div className="mt-2 flex flex-wrap gap-3">{COLORS.map((item) => <div key={item} className="flex flex-col items-center gap-1"><button type="button" data-testid={`button-color-${item}`} onClick={() => setColor(item)} className={`size-9 rounded-full border-4 transition-transform hover:scale-110 ${color === item ? 'border-foreground scale-110' : 'border-gray-300'}`} style={{ backgroundColor: item, color: item === '#f5f5f5' ? '#000' : '#fff' }} /><span className="text-[10px] font-semibold text-muted-foreground text-center">{COLOR_NAMES[item]}</span></div>)}</div></div>{players && <label><span className="field-label">Jogadores ({playerIds.length})</span><div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-card p-3">{players.map((player) => <label key={player.id} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={playerIds.includes(player.id)} onChange={(e) => setPlayerIds(e.target.checked ? [...playerIds, player.id] : playerIds.filter((id) => id !== player.id))} className="size-4" /><span className="text-sm">{player.nickname || player.name}</span><span className="text-xs text-muted-foreground">{player.position}</span></label>)}</div></label>}<div className="flex justify-end gap-2 border-t pt-5"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" icon={Check} testId="button-save-team">Salvar time</Button></div></form></Modal>;
}

function TeamsPage({ teams, players, setTeams, activeRodadaId }: { teams: Team[]; players: Player[]; setTeams: (value: Team[] | ((old: Team[]) => Team[])) => void; activeRodadaId: string }) {
  const [modal, setModal] = useState<'new' | Team | null>(null); 
  const [remove, setRemove] = useState<Team | null>(null);
  const teamPlayers = (team: Team) => team.playerIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[];
  const getTextColor = (bgColor: string) => (bgColor === '#f5f5f5' || bgColor === '#fbbf24') ? '#000' : '#fff';
  
  return <div className="animate-rise"><PageHeading eyebrow={`${teams.length} times nesta rodada`} title="Times" description="Veja e edite os jogadores sorteados em cada time." action={teams.length > 0 ? undefined : <Button icon={Shuffle} href="/sorteio" testId="button-go-to-draw">Fazer sorteio</Button>} />{teams.length > 0 ? <div className="space-y-6">{teams.map((team) => <div key={team.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: team.color }}><div><h3 className="font-display text-2xl font-black uppercase" style={{ color: getTextColor(team.color) }}>{team.name}</h3><p className="mt-1 text-sm" style={{ color: getTextColor(team.color) }}>{teamPlayers(team).length} jogadores</p></div><div className="flex gap-2"><button data-testid={`button-edit-team-${team.id}`} onClick={() => setModal(team)} className="rounded-lg p-2" style={{ color: getTextColor(team.color) }}><Pencil className="size-4" /></button><button data-testid={`button-delete-team-${team.id}`} onClick={() => setRemove(team)} className="rounded-lg p-2" style={{ color: getTextColor(team.color) }}><Trash2 className="size-4" /></button></div></div><div className="divide-y px-6"><div className="py-0">{teamPlayers(team).map((player, index) => <div key={player.id} className="flex items-center gap-3 py-3"><span className="text-xs font-bold text-muted-foreground">0{index + 1}</span><span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-black">{initials(player.name)}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{player.nickname || player.name}</p><p className="text-xs text-muted-foreground">{player.position}</p></div></div>)}</div></div></div>)}</div> : <div className="sm:col-span-2 xl:col-span-3"><EmptyState icon={Shuffle} title="Nenhum time nesta rodada" text="Faça o sorteio para criar os times automaticamente." action={<Button icon={Shuffle} href="/sorteio" testId="button-go-to-draw">Ir para sorteio</Button>} /></div>}{modal && <TeamForm team={modal === 'new' ? undefined : modal} players={players} activeRodadaId={activeRodadaId} onClose={() => setModal(null)} onSave={(value) => setTeams((old) => old.some((item) => item.id === value.id) ? old.map((item) => item.id === value.id ? value : item) : [...old, value])} />}{remove && <Confirm title="Excluir time?" text={`${remove.name} será removido da rodada.`} onClose={() => setRemove(null)} onConfirm={() => { setTeams((old) => old.filter((item) => item.id !== remove.id)); setRemove(null); }} />}</div>;
}

function EmptyState({ icon: Icon, title, text, action }: { icon: typeof Users; title: string; text: string; action?: ReactNode }) {
  return <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-6" /></span><h3 className="font-display text-2xl font-black uppercase">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function DrawPage({ players, teams, setTeams, setMatches, activeRodadaId }: { players: Player[]; teams: Team[]; setTeams: (value: Team[] | ((old: Team[]) => Team[])) => void; setMatches: (value: Match[] | ((old: Match[]) => Match[])) => void; activeRodadaId: string }) {
  const [selected, setSelected] = useState<string[]>(players.filter((p) => p.present).map((p) => p.id)); const [teamSize, setTeamSize] = useState(5); const [draw, setDraw] = useState<{ a: Player[]; b: Player[]; reserves: Player[] } | null>(null); const [drawError, setDrawError] = useState(''); const [matchModal, setMatchModal] = useState(false); const [showAll, setShowAll] = useState(false);
  const toggle = (playerId: string) => { setSelected((old) => old.includes(playerId) ? old.filter((item) => item !== playerId) : [...old, playerId]); setDraw(null); setDrawError(''); };
  const makeDraw = () => { const required = teamSize * 2; if (selected.length < required) { setDraw(null); setDrawError(`Você selecionou ${selected.length} jogador(es). Para ${teamSize} por time, selecione pelo menos ${required}.`); return; } setDrawError(''); const shuffled = players.filter((p) => selected.includes(p.id)).sort(() => Math.random() - .5); const pool = shuffled.slice(0, required).sort((a, b) => overall(b) - overall(a)); const reserves = shuffled.slice(required); const a: Player[] = []; const b: Player[] = []; pool.forEach((player, index) => (index % 2 === 0 ? a : b).push(player)); setDraw({ a, b, reserves }); };
  const saveTeams = () => { if (!draw) return; const colorA = '#f97316'; const colorB = '#5d8f68'; setTeams((old) => [...old.filter((t) => t.rodadaId !== activeRodadaId), { id: id(), rodadaId: activeRodadaId, name: `Time ${COLOR_NAMES[colorA]}`, color: colorA, playerIds: draw.a.map((p) => p.id) }, { id: id(), rodadaId: activeRodadaId, name: `Time ${COLOR_NAMES[colorB]}`, color: colorB, playerIds: draw.b.map((p) => p.id) }]); };
  return <div className="animate-rise">
    <PageHeading eyebrow="equilíbrio antes do apito" title="Sorteio" description="Marque quem está na quadra. O Pelada Pro distribui a força sem deixar a resenha de lado." action={<Button icon={Shuffle} onClick={makeDraw} testId="button-draw-top">Sortear times</Button>} />
    <div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-muted-foreground">Lista da rodada</p><h2 className="font-display text-2xl font-black uppercase">{selected.length} selecionados</h2></div>
          <label className="w-32 shrink-0"><span className="field-label">Por time</span><input data-testid="input-draw-team-size" type="number" min="1" value={teamSize} onChange={(e) => { setTeamSize(Math.max(1, Number(e.target.value) || 1)); setDraw(null); setDrawError(''); }} className="field-input" /></label>
        </div>
        <div className="mb-4 flex items-center justify-between rounded-xl bg-[#edf7d4] px-3 py-2 text-xs font-bold text-[#47764e]"><span>Necessários para o jogo</span><span>{teamSize * 2} jogadores</span></div>
        <div className="mb-5 flex items-center justify-between"><p className="text-xs text-muted-foreground">Os excedentes ficam como reserva.</p><button data-testid="button-toggle-all-players" onClick={() => setSelected(selected.length === players.length ? [] : players.map((p) => p.id))} className="text-xs font-bold text-[#487b4f] hover:underline">{selected.length === players.length ? 'Limpar todos' : 'Marcar todos'}</button></div>
        <div className="space-y-1">{(showAll ? players : players.filter((p) => p.present)).map((player) => <button data-testid={`button-select-player-${player.id}`} key={player.id} onClick={() => toggle(player.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected.includes(player.id) ? 'bg-[#edf7d4]' : 'hover:bg-muted'}`}><span className={`grid size-8 place-items-center rounded-full text-[10px] font-black ${selected.includes(player.id) ? 'bg-[#c8f169] text-[#456b31]' : 'bg-muted text-muted-foreground'}`}>{selected.includes(player.id) ? <Check className="size-4" /> : initials(player.name)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{player.nickname}</strong><small className="text-xs text-muted-foreground">{player.position}</small></span><span className="text-xs font-bold text-muted-foreground">{overall(player).toFixed(1)}</span></button>)}{!players.filter((p) => p.present).length && <EmptyState icon={UserCheck} title="Ninguém confirmado" text="Marque jogadores na área Jogadores para começar." />}</div>
        {players.some((p) => !p.present) && <button data-testid="button-show-all-draw" onClick={() => setShowAll(!showAll)} className="mt-4 w-full border-t pt-4 text-xs font-bold text-muted-foreground hover:text-foreground">{showAll ? 'Mostrar apenas presentes' : `Adicionar pendentes (${players.filter((p) => !p.present).length})`}</button>}
        {drawError && <p className="mt-4 rounded-xl bg-[#fce0db] px-3 py-2 text-xs font-bold text-[#a34839]">{drawError}</p>}
        <div className="mt-5"><Button icon={Shuffle} onClick={makeDraw} testId="button-draw-main">Sortear {teamSize} × {teamSize}</Button></div>
      </section>
      <section>{draw ? <div className="animate-rise"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-muted-foreground">Resultado equilibrado</p><h2 className="font-display text-2xl font-black uppercase">Que comece o jogo</h2></div><button data-testid="button-redraw" onClick={makeDraw} className="flex items-center gap-1.5 text-xs font-bold text-[#487b4f] hover:underline"><Shuffle className="size-3.5" /> Sortear de novo</button></div><div className="grid gap-3 sm:grid-cols-2"><TeamColumn title="Time A" color="#f97316" players={draw.a} /><TeamColumn title="Time B" color="#5d8f68" players={draw.b} /></div>{draw.reserves.length > 0 && <div className="mt-3 rounded-2xl border border-dashed bg-card p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">Banco de reservas · {draw.reserves.length}</p><div className="mt-3 flex flex-wrap gap-2">{draw.reserves.map((player) => <span key={player.id} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">{player.nickname}</span>)}</div></div>}<div className="mt-4 flex items-center justify-between rounded-2xl bg-[#e7efd2] p-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#66806a]">Média dos times</p><p className="mt-1 text-xs text-[#54705b]">Considerando as 4 habilidades</p></div><div className="flex gap-5 text-right"><div><p className="font-display text-2xl font-black text-[#f97316]">{draw.a.length ? (draw.a.reduce((sum, p) => sum + overall(p), 0) / draw.a.length).toFixed(1) : '0.0'}</p><p className="text-[10px] font-bold uppercase text-[#66806a]">Time A</p></div><div><p className="font-display text-2xl font-black text-[#4e8160]">{draw.b.length ? (draw.b.reduce((sum, p) => sum + overall(p), 0) / draw.b.length).toFixed(1) : '0.0'}</p><p className="text-[10px] font-bold uppercase text-[#66806a]">Time B</p></div></div></div><div className="flex gap-2"><Button icon={Shield} onClick={saveTeams} testId="button-save-teams">Salvar times</Button><Button icon={FilePlus2} onClick={() => setMatchModal(true)} testId="button-register-match">Registrar resultado</Button></div></div> : <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 text-center"><span className="mb-5 grid size-16 place-items-center rounded-2xl bg-[#d9f3a1] text-[#456b31]"><Shuffle className="size-7" /></span><h2 className="font-display text-3xl font-black uppercase">Seu próximo time está aqui</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Marque os presentes e escolha quantos jogadores cabem em cada time.</p></div>}</section>
    </div>
    {matchModal && draw && <MatchForm draw={draw} players={players} onClose={() => setMatchModal(false)} onSave={(match) => { setMatches((old) => [match, ...old]); setMatchModal(false); }} />}
  </div>;
}

function TeamColumn({ title, color, players }: { title: string; color: string; players: Player[] }) {
  return <div className="overflow-hidden rounded-2xl border bg-card"><div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: color }}><span className="font-display text-xl font-black uppercase">{title}</span><span className="text-xs font-bold">{players.length} jogadores</span></div><div className="divide-y px-4">{players.map((player, index) => <div key={player.id} className="flex items-center gap-3 py-3"><span className="font-display text-lg font-bold text-muted-foreground">0{index + 1}</span><span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-black">{initials(player.name)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{player.nickname}</p><p className="text-[10px] uppercase text-muted-foreground">{player.position}</p></div><span className="font-display font-bold text-muted-foreground">{overall(player).toFixed(1)}</span></div>)}{!players.length && <p className="py-8 text-center text-xs text-muted-foreground">Sem jogadores</p>}</div></div>;
}

function MatchForm({ draw, players, onClose, onSave }: { draw: { a: Player[]; b: Player[] }; players: Player[]; onClose: () => void; onSave: (match: Match) => void }) {
  const [scoreA, setScoreA] = useState('0'); const [scoreB, setScoreB] = useState('0'); const [goalsA, setGoalsA] = useState<string[]>([]); const [goalsB, setGoalsB] = useState<string[]>([]); const [keeper, setKeeper] = useState('');
  const changeGoals = (side: 'a' | 'b', count: number) => { const setter = side === 'a' ? setGoalsA : setGoalsB; const current = side === 'a' ? goalsA : goalsB; const team = side === 'a' ? draw.a : draw.b; setter(Array.from({ length: count }, (_, index) => current[index] ?? team[0]?.id ?? '')); };
  const addGoal = (side: 'a' | 'b', index: number, value: string) => (side === 'a' ? setGoalsA : setGoalsB)((old) => old.map((item, i) => i === index ? value : item));
  return <Modal title="Registrar resultado" wide onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave({ id: id(), date: new Date().toISOString(), teamA: 'Time A', teamB: 'Time B', scoreA: Number(scoreA), scoreB: Number(scoreB), goalsA, goalsB, bestKeeper: keeper }); }} className="space-y-5"><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 rounded-2xl bg-muted/60 p-4"><label><span className="field-label">Time A</span><input type="number" min="0" data-testid="input-score-a" value={scoreA} onChange={(e) => { setScoreA(e.target.value); changeGoals('a', Number(e.target.value)); }} className="score-input" /></label><span className="pb-3 font-display text-2xl font-black text-muted-foreground">×</span><label><span className="field-label">Time B</span><input type="number" min="0" data-testid="input-score-b" value={scoreB} onChange={(e) => { setScoreB(e.target.value); changeGoals('b', Number(e.target.value)); }} className="score-input" /></label></div><div className="grid gap-5 sm:grid-cols-2"><GoalInputs title="Gols do Time A" goals={goalsA} players={draw.a} onChange={(index, value) => addGoal('a', index, value)} /><GoalInputs title="Gols do Time B" goals={goalsB} players={draw.b} onChange={(index, value) => addGoal('b', index, value)} /></div><label><span className="field-label">Melhor goleiro da partida</span><select data-testid="select-best-keeper" value={keeper} onChange={(e) => setKeeper(e.target.value)} className="field-input"><option value="">Selecione quem fechou o gol</option>{players.filter((player) => player.position === 'Goleiro' || draw.a.concat(draw.b).some((item) => item.id === player.id)).map((player) => <option key={player.id} value={player.id}>{player.nickname} · {player.position}</option>)}</select></label><div className="flex justify-end gap-2 border-t pt-5"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" icon={Check} testId="button-save-match">Salvar partida</Button></div></form></Modal>;
}

function GoalInputs({ title, goals, players, onChange }: { title: string; goals: string[]; players: Player[]; onChange: (index: number, value: string) => void }) {
  return <div><p className="field-label">{title} <span className="font-normal text-muted-foreground">({goals.length})</span></p>{goals.length ? <div className="space-y-2">{goals.map((goal, index) => <select data-testid={`select-goal-${title}-${index}`} key={`${title}-${index}`} value={goal} onChange={(e) => onChange(index, e.target.value)} className="field-input"><option value="">Autor do gol</option>{players.map((player) => <option key={player.id} value={player.id}>{player.nickname}</option>)}</select>)}</div> : <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">Informe o placar para adicionar autores.</div>}</div>;
}

function LiveScoringPage({ players, playerEvents, setPlayerEvents }: { players: Player[]; playerEvents: PlayerEvent[]; setPlayerEvents: (value: PlayerEvent[] | ((old: PlayerEvent[]) => PlayerEvent[])) => void }) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [eventType, setEventType] = useState<'gol' | 'assistencia' | 'defesa_dificil'>('gol');
  
  const activePlayers = players.filter(p => p.active);
  
  const handleAddEvent = () => {
    if (!selectedPlayer) {
      alert('Selecione um jogador');
      return;
    }
    
    const event: PlayerEvent = {
      id: id(),
      playerId: selectedPlayer,
      type: eventType,
      date: new Date().toISOString().split('T')[0],
    };
    
    setPlayerEvents(old => [event, ...old]);
    setSelectedPlayer('');
    setEventType('gol');
  };
  
  const handleDeleteEvent = (eventId: string) => {
    setPlayerEvents(old => old.filter(e => e.id !== eventId));
  };
  
  const eventCounts = new Map<string, { gol: number; assistencia: number; defesa_dificil: number }>();
  activePlayers.forEach(p => {
    eventCounts.set(p.id, { gol: 0, assistencia: 0, defesa_dificil: 0 });
  });
  
  playerEvents.forEach(e => {
    const counts = eventCounts.get(e.playerId);
    if (counts) {
      counts[e.type]++;
    }
  });
  
  return <div className="animate-rise">
    <PageHeading eyebrow="registro de eventos" title="Live Scoring" description="Cadastre gols, assistências e defesas difíceis dos jogadores." />
    
    <div className="mb-6 rounded-2xl border bg-card p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.18em]">Cadastro de Eventos</p>
      <div className="space-y-4">
        <div>
          <label className="field-label">Jogador</label>
          <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="field-input">
            <option value="">Selecione um jogador...</option>
            {activePlayers.map(p => <option key={p.id} value={p.id}>{p.nickname || p.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="field-label">Tipo de Evento</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { value: 'gol', label: '⚽ Gol', color: 'bg-[#f8d0c8]' },
              { value: 'assistencia', label: '🎯 Assistência', color: 'bg-[#f9d995]' },
              { value: 'defesa_dificil', label: '🛡️ Defesa Difícil', color: 'bg-[#d9f3a1]' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setEventType(opt.value as any)}
                className={`rounded-lg p-3 text-xs font-bold transition ${eventType === opt.value ? `${opt.color} border-2 border-[#f97316]` : `${opt.color}/30 hover:${opt.color}/50`}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={handleAddEvent} className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2.5 font-bold hover:brightness-110">
          Registrar Evento
        </button>
      </div>
    </div>
    
    <div className="rounded-2xl border bg-card p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.18em]">Eventos Registrados</p>
      {playerEvents.length > 0 ? (
        <div className="space-y-2">
          {playerEvents.map(event => {
            const player = players.find(p => p.id === event.playerId);
            const emoji = event.type === 'gol' ? '⚽' : event.type === 'assistencia' ? '🎯' : '🛡️';
            const label = event.type === 'gol' ? 'Gol' : event.type === 'assistencia' ? 'Assistência' : 'Defesa Difícil';
            return (
              <div key={event.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold">{player?.nickname || player?.name}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteEvent(event.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda</p>
      )}
    </div>
    
    <div className="mt-6 rounded-2xl border bg-card p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.18em]">Resumo por Jogador</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activePlayers.map(player => {
          const counts = eventCounts.get(player.id);
          const total = (counts?.gol ?? 0) + (counts?.assistencia ?? 0) + (counts?.defesa_dificil ?? 0);
          return total > 0 ? (
            <div key={player.id} className="rounded-lg border bg-muted/30 p-4">
              <p className="font-bold text-sm mb-2">{player.nickname || player.name}</p>
              <div className="space-y-1 text-xs">
                {(counts?.gol ?? 0) > 0 && <p>⚽ {counts.gol} gol{counts.gol > 1 ? 's' : ''}</p>}
                {(counts?.assistencia ?? 0) > 0 && <p>🎯 {counts.assistencia} assistência{counts.assistencia > 1 ? 's' : ''}</p>}
                {(counts?.defesa_dificil ?? 0) > 0 && <p>🛡️ {counts.defesa_dificil} defesa{counts.defesa_dificil > 1 ? 's' : ''}</p>}
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  </div>;
}

function RankingsPage({ players, playerEvents }: { players: Player[]; playerEvents: PlayerEvent[] }) {
  // Calcular rankings a partir de playerEvents
  const golCounts = new Map<string, number>();
  const assistCounts = new Map<string, number>();
  const defensaCounts = new Map<string, number>();
  
  playerEvents.forEach(e => {
    if (e.type === 'gol') golCounts.set(e.playerId, (golCounts.get(e.playerId) ?? 0) + 1);
    if (e.type === 'assistencia') assistCounts.set(e.playerId, (assistCounts.get(e.playerId) ?? 0) + 1);
    if (e.type === 'defesa_dificil') defensaCounts.set(e.playerId, (defensaCounts.get(e.playerId) ?? 0) + 1);
  });
  
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const scorers = players.map((p) => ({ player: p, count: golCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count);
  const assists = players.map((p) => ({ player: p, count: assistCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count);
  const defesas = players.map((p) => ({ player: p, count: defensaCounts.get(p.id) ?? 0 })).sort((a, b) => b.count - a.count);
  
  return <div className="animate-rise"><PageHeading eyebrow="números que contam a história" title="Rankings" description="Gols, assistências e defesas difíceis baseado no Live Scoring." action={<div className="flex rounded-xl border bg-card p-1">{(['week', 'month', 'year'] as const).map((item) => <button key={item} data-testid={`button-period-${item}`} onClick={() => setPeriod(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${period === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{item === 'week' ? 'Semana' : item === 'month' ? 'Mês' : 'Ano'}</button>)}</div>} /><div className="grid gap-6 lg:grid-cols-3"><RankingCard title="Artilheiros" subtitle="Quem mais fez gols" icon={Goal} color="bg-[#f8d0c8] text-[#a34839]" items={scorers} suffix="gols" /><RankingCard title="Assistência para gol" subtitle="Quem mais criou oportunidades" icon={Swords} color="bg-[#f9d995] text-[#835d1b]" items={assists} suffix="assistências" /><RankingCard title="Defesas Difíceis" subtitle="Melhor defesa" icon={Shield} color="bg-[#d9f3a1] text-[#456b31]" items={defesas} suffix="defesas" /></div></div>;
}

function RankingCard({ title, subtitle, icon: Icon, color, items, suffix, keeper = false }: { title: string; subtitle: string; icon: typeof Goal; color: string; items: { player: Player; count: number }[]; suffix: string; keeper?: boolean }) {
  return <section className="overflow-hidden rounded-2xl border bg-card"><div className="flex items-center gap-3 border-b p-5"><span className={`grid size-11 place-items-center rounded-xl ${color}`}><Icon className="size-5" /></span><div><h2 className="font-display text-2xl font-black uppercase">{title}</h2><p className="text-xs text-muted-foreground">{subtitle}</p></div></div>{items.length ? <div className="divide-y">{items.slice(0, 8).map((item, index) => <div data-testid={`row-ranking-${keeper ? 'keeper' : 'scorer'}-${item.player.id}`} key={item.player.id} className="flex items-center gap-3 px-5 py-3.5"><span className={`font-display text-2xl font-black ${index === 0 ? 'text-[#c08c2d]' : 'text-muted-foreground'}`}>{String(index + 1).padStart(2, '0')}</span><span className="grid size-9 place-items-center rounded-full bg-muted text-[10px] font-black">{initials(item.player.name)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.player.nickname}</p><p className="text-xs text-muted-foreground">{item.player.position}</p></div><div className="text-right"><p className="font-display text-2xl font-black">{item.count}</p><p className="text-[10px] font-bold uppercase text-muted-foreground">{suffix}</p></div>{index === 0 && item.count > 0 && <Award className="size-5 text-[#c08c2d]" />}</div>)}</div> : <EmptyState icon={Trophy} title="Sem números ainda" text="Registre partidas para este ranking ganhar vida." />}</section>;
}

function RodasPage({ rodadas, setRodadas, activeRodadaId, setActiveRodadaId }: { rodadas: Rodada[]; setRodadas: (value: Rodada[] | ((old: Rodada[]) => Rodada[])) => void; activeRodadaId: string; setActiveRodadaId: (value: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (rodada: Omit<Rodada, 'id' | 'createdAt'>) => {
    if (editingId) {
      setRodadas((old) => old.map((r) => r.id === editingId ? { ...rodada, id: editingId, createdAt: new Date().toISOString() } : r));
      setEditingId(null);
    } else {
      setRodadas((old) => [{ ...rodada, id: id(), createdAt: new Date().toISOString() }, ...old]);
    }
    setShowForm(false);
  };

  const handleDelete = (rodadaId: string) => {
    setRodadas((old) => old.filter((r) => r.id !== rodadaId));
  };

  const editing = editingId ? rodadas.find((r) => r.id === editingId) : null;

  const repeatLabels: Record<RepeatType, string> = { never: 'Única', weekly: 'Semanal', biweekly: 'Quinzenal', monthly: 'Mensal' };

  return <div className="animate-rise"><PageHeading eyebrow="agendamento" title="Rodadas" description="Crie, gerencie e selecione a rodada ativa." action={<Button icon={Plus} onClick={() => { setEditingId(null); setShowForm(true); }} testId="button-new-rodada">Criar rodada</Button>} /><div className="grid gap-4">{rodadas.map((rodada) => <div key={rodada.id} data-testid={`card-rodada-${rodada.id}`} className={`group rounded-2xl border p-5 transition cursor-pointer ${activeRodadaId === rodada.id ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'}`} onClick={() => setActiveRodadaId(rodada.id)}><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><CalendarDays className="size-4 text-muted-foreground flex-shrink-0" /><span className="font-display text-sm font-bold text-foreground">{fullDate(rodada.date)} às {rodada.time}</span>{activeRodadaId === rodada.id && <span className="ml-2 text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">ATIVA</span>}</div><p className="font-display text-xl font-black uppercase mb-1">{rodada.location}</p>{rodada.description && <p className="text-sm text-muted-foreground mb-3">{rodada.description}</p>}{rodada.repeatType && <div className="inline-block rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{repeatLabels[rodada.repeatType]} {rodada.repeatUntil ? `até ${fullDate(rodada.repeatUntil)}` : ''}</div>}</div><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}><button data-testid={`button-edit-rodada-${rodada.id}`} onClick={() => { setEditingId(rodada.id); setShowForm(true); }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"><Pencil className="size-4" /></button><button data-testid={`button-delete-rodada-${rodada.id}`} onClick={() => handleDelete(rodada.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"><Trash2 className="size-4" /></button></div></div></div>)}{!rodadas.length && <EmptyState icon={CalendarDays} title="Sem rodadas agendadas" text="Crie sua primeira rodada para começar a organizar as partidas." />}</div>{showForm && <RodadaForm initialData={editing} onClose={() => { setShowForm(false); setEditingId(null); }} onSave={handleSave} />}</div>;
}

function RodadaForm({ initialData, onClose, onSave }: { initialData?: Rodada | null; onClose: () => void; onSave: (rodada: Omit<Rodada, 'id' | 'createdAt'>) => void }) {
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return new Date(Date.now() + 86400000).toISOString().split('T')[0];
    // Garante que temos apenas YYYY-MM-DD
    return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  };
  
  const [date, setDate] = useState(formatDateForInput(initialData?.date));
  const [time, setTime] = useState(initialData?.time ?? '20:00');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [repeatType, setRepeatType] = useState<RepeatType>(initialData?.repeatType ?? 'never');
  const [repeatUntil, setRepeatUntil] = useState(formatDateForInput(initialData?.repeatUntil));

  return <Modal title={initialData ? 'Editar rodada' : 'Nova rodada'} onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSave({ date, time, location, description, repeatType: repeatType === 'never' ? undefined : repeatType, repeatUntil: repeatUntil || undefined }); }} className="space-y-4"><label><span className="field-label">Data</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" required /></label><label><span className="field-label">Horário</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input" required /></label><label><span className="field-label">Local</span><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Quadra do Zé" className="field-input" required /></label><label><span className="field-label">Descrição (opcional)</span><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Próxima rodada confirmada" className="field-input" /></label><label><span className="field-label">Repetir</span><select value={repeatType} onChange={(e) => setRepeatType(e.target.value as RepeatType)} className="field-input"><option value="never">Única (não repetir)</option><option value="weekly">Semanal</option><option value="biweekly">Quinzenal</option><option value="monthly">Mensal</option></select></label>{repeatType !== 'never' && <label><span className="field-label">Repetir até (opcional)</span><input type="date" value={repeatUntil} onChange={(e) => setRepeatUntil(e.target.value)} className="field-input" /></label>}<div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" icon={Check}>{initialData ? 'Atualizar' : 'Criar'}</Button></div></form></Modal>;
}

function AppContent() {
  const [players, setPlayers] = useStored<Player[]>('pelada-pro-players', seedPlayers);
  const [teams, setTeams] = useStored<Team[]>('pelada-pro-teams', []);
  const [matches, setMatches] = useStored<Match[]>('pelada-pro-matches', seedMatches);
  const [playerEvents, setPlayerEvents] = useStored<PlayerEvent[]>('pelada-pro-player-events', []);
  const [rodadas, setRodadas] = useStored<Rodada[]>('pelada-pro-rodadas', seedRodadas);
  const [activeRodadaId, setActiveRodadaId] = useStored<string>('pelada-pro-active-rodada', seedRodadas[0]?.id ?? '');
  
  // Limpar times com cores inválidas ou nomes concatenados
  useEffect(() => {
    const validTeams = teams.filter(t => COLORS.includes(t.color));
    const cleanedTeams = validTeams.map(t => ({
      ...t,
      name: extractBaseName(t.name) + ' ' + COLOR_NAMES[t.color]
    }));
    if (cleanedTeams.length !== teams.length || JSON.stringify(cleanedTeams) !== JSON.stringify(teams)) {
      setTeams(cleanedTeams);
    }
  }, []);
  
  const activeRodada = rodadas.find((r) => r.id === activeRodadaId);
  const activeTeams = teams.filter((t) => t.rodadaId === activeRodadaId);
  
  return <Shell rodadas={rodadas}><Switch><Route path="/" component={() => <Dashboard players={players} teams={activeTeams} matches={matches} setPlayers={setPlayers} rodada={activeRodada} setActiveRodadaId={setActiveRodadaId} rodadas={rodadas} />} /><Route path="/rodadas" component={() => <RodasPage rodadas={rodadas} setRodadas={setRodadas} activeRodadaId={activeRodadaId} setActiveRodadaId={setActiveRodadaId} />} /><Route path="/jogadores" component={() => <PlayersPage players={players} setPlayers={setPlayers} />} /><Route path="/times" component={() => <TeamsPage teams={activeTeams} players={players} setTeams={setTeams} activeRodadaId={activeRodadaId} />} /><Route path="/sorteio" component={() => <DrawPage players={players} teams={activeTeams} setTeams={setTeams} setMatches={setMatches} activeRodadaId={activeRodadaId} />} /><Route path="/live-scoring" component={() => <LiveScoringPage players={players} playerEvents={playerEvents} setPlayerEvents={setPlayerEvents} />} /><Route path="/rankings" component={() => <RankingsPage players={players} playerEvents={playerEvents} />} /><Route><NotFound /></Route></Switch></Shell>;
}

function NotFound() {
  return <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center"><span className="font-display text-8xl font-black text-[#f97316]">404</span><h1 className="font-display text-3xl font-black uppercase">Essa bola saiu</h1><p className="mt-2 text-sm text-muted-foreground">A página que você procura não está na súmula.</p><Link href="/" data-testid="link-back-home" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_#c8f169]">Voltar para a visão geral</Link></div>;
}

export default function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppContent /></WouterRouter>;
}