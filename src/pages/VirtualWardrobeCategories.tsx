import fallbackHero from '@/assets/hero-wardrobe.jpg';
import Header from '@/components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, CloudSun, Dumbbell, Footprints, Gem, Mountain, Shirt, ShoppingBag, Sparkles, Sun, Watch } from 'lucide-react';
import React from 'react';
// Attempt to reference the image with spaces using an encoded URL. Fallback provided below if it fails.
const closetBgUrl = new URL('../assets/Modern%20Closet%20with%20Digital%20Avatar.png', import.meta.url).href;

interface CategoryDef {
	id: string;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	gradient: string; // tailwind gradient classes
}

const categories: CategoryDef[] = [
	{ id: 'tops', label: 'Tops', description: 'Shirts, tees & blouses', icon: Shirt, gradient: 'from-fuchsia-500/30 to-pink-500/30' },
	{ id: 'bottoms', label: 'Bottoms', description: 'Jeans, pants & skirts', icon: Footprints, gradient: 'from-indigo-500/30 to-blue-500/30' },
	{ id: 'outerwear', label: 'Outerwear', description: 'Jackets & coats', icon: CloudSun, gradient: 'from-amber-500/30 to-orange-500/30' },
	{ id: 'footwear', label: 'Footwear', description: 'Shoes & sneakers', icon: ShoppingBag, gradient: 'from-cyan-500/30 to-teal-500/30' },
	{ id: 'accessories', label: 'Accessories', description: 'Belts, hats & more', icon: Watch, gradient: 'from-purple-500/30 to-violet-500/30' },
	{ id: 'activewear', label: 'Activewear', description: 'Gym & performance', icon: Dumbbell, gradient: 'from-green-500/30 to-emerald-500/30' },
	{ id: 'formal', label: 'Formal', description: 'Suits & dress wear', icon: Briefcase, gradient: 'from-rose-500/30 to-red-500/30' },
	{ id: 'lounge', label: 'Lounge', description: 'Relax & comfort', icon: Sun, gradient: 'from-yellow-500/30 to-lime-500/30' },
	{ id: 'seasonal', label: 'Seasonal', description: 'Weather specific', icon: Mountain, gradient: 'from-sky-500/30 to-blue-600/30' },
	{ id: 'premium', label: 'Premium', description: 'Luxury items', icon: Gem, gradient: 'from-pink-500/30 to-fuchsia-600/30' },
	{ id: 'styled', label: 'AI Styled', description: 'Smart looks', icon: Sparkles, gradient: 'from-purple-500/30 to-indigo-600/30' },
	{ id: 'all', label: 'All Items', description: 'Browse everything', icon: ShoppingBag, gradient: 'from-slate-500/30 to-gray-600/30' }
];

interface LayoutEntry { x: number; y: number; w: number }

const LAYOUT_STORAGE_KEY = 'vw-category-layout-v1';

// User-refined coordinates (fractions of intrinsic displayed image) provided via edit mode.
const defaultLayout: Record<string, LayoutEntry> = {
	tops: { x: 0.15825873757052275, y: 0.2422701322120048, w: 0.105 },
	bottoms: { x: 0.15391919107810728, y: 0.6368999231411452, w: 0.105 },
	outerwear: { x: 0.3177379919914329, y: 0.23982916053878547, w: 0.105 },
	footwear: { x: 0.6453756352034613, y: 0.6320179177166396, w: 0.105 },
	accessories: { x: 0.3199077859303292, y: 0.07058585834318978, w: 0.105 },
	activewear: { x: 0.6529698519115327, y: 0.24145647498759834, w: 0.105 },
	formal: { x: 0.803227575209232, y: 0.08360456016789386, w: 0.105 },
	lounge: { x: 0.31828043012981266, y: 0.6360862659167388, w: 0.105 },
	seasonal: { x: 0.8086520393637843, y: 0.23738812678749915, w: 0.105 },
	premium: { x: 0.6415785268494256, y: 0.08523189789598187, w: 0.105 },
	styled: { x: 0.8129915444708226, y: 0.6352726086923324, w: 0.105 },
	all: { x: 0.15880117570890254, y: 0.07139951556759622, w: 0.105 }
};

const VirtualWardrobeCategories = () => {
	const imgRef = React.useRef<HTMLImageElement | null>(null);
	const [imgRect, setImgRect] = React.useState<DOMRect | null>(null);
	const initialEdit = React.useMemo(() => {
		try {
			return new URLSearchParams(window.location.search).has('layoutEdit');
		} catch { return false; }
	}, []);
	const [editMode, setEditMode] = React.useState<boolean>(initialEdit);
	const [layout, setLayout] = React.useState<Record<string, LayoutEntry>>(() => {
		try {
			const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
			if (saved) return { ...defaultLayout, ...JSON.parse(saved) };
		} catch { }
		return { ...defaultLayout };
	});
	const [bgColor, setBgColor] = React.useState<string>('#1d120d');
	const [bgGradient, setBgGradient] = React.useState<string>('');
	const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
	const [panelMountKey, setPanelMountKey] = React.useState<number>(0); // used to retrigger animation when switching
	// pagination for semicircle items
	const [pageStart, setPageStart] = React.useState<number>(0);
	const ITEMS_PER_PAGE = 9;
	React.useEffect(() => { setPageStart(0); }, [activeCategory]);

	// Compute which side the semicircle should open on (opposite side of the button cluster)
	const activeSide: 'left' | 'right' | null = React.useMemo(() => {
		if (!activeCategory) return null;
		const pos = layout[activeCategory];
		if (!pos) return null;
		return pos.x < 0.5 ? 'right' : 'left';
	}, [activeCategory, layout]);


	// dragging state
	const dragState = React.useRef<{
		id: string | null;
		offsetX: number; // fraction inside button (0..1) horizontally
		offsetY: number; // fraction inside button vertically
	}>({ id: null, offsetX: 0.5, offsetY: 0.2 });

	const persistLayout = React.useCallback((next: Record<string, LayoutEntry>) => {
		setLayout(next);
		try { localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next)); } catch { }
	}, []);

	const handleSelect = (id: string) => {
		if (editMode) return; // disable in edit mode
		setPanelMountKey(k => k + 1);
		setActiveCategory(prev => prev === id ? null : id);
	};

	// Recalculate image bounding box (used to anchor buttons precisely over racks)
	const measure = React.useCallback(() => {
		if (imgRef.current) {
			const rect = imgRef.current.getBoundingClientRect();
			setImgRect(rect);
		}
	}, []);

	React.useEffect(() => {
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [measure]);

	// Dynamic background color sampling from image (average color)
	const sampleBg = React.useCallback(() => {
		const img = imgRef.current;
		if (!img) return;
		try {
			const canvas = document.createElement('canvas');
			const size = 40;
			canvas.width = size; canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			ctx.drawImage(img, 0, 0, size, size);
			const data = ctx.getImageData(0, 0, size, size).data;
			let r = 0, g = 0, b = 0, count = 0;
			for (let i = 0; i < data.length; i += 4) {
				r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
			}
			r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
			// Darken slightly for contrast
			// Derive palette variants
			const dark = `rgb(${Math.round(r * 0.35)}, ${Math.round(g * 0.28)}, ${Math.round(b * 0.20)})`;
			const mid = `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.45)}, ${Math.round(b * 0.35)})`;
			const light = `rgb(${Math.round(Math.min(255, r * 0.95))}, ${Math.round(Math.min(255, g * 0.85))}, ${Math.round(Math.min(255, b * 0.75))})`;
			setBgColor(mid);
			setBgGradient(`linear-gradient(180deg, ${light} 0%, ${mid} 45%, ${dark} 100%)`);
		} catch { }
	}, []);

	React.useEffect(() => { sampleBg(); }, [imgRect, sampleBg]);

	// Secret keyboard shortcut Shift+Alt+E to toggle edit mode & ESC to close panel
	React.useEffect(() => {
		const keyHandler = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === 'e' && e.shiftKey && e.altKey) setEditMode(m => !m);
			if (e.key === 'Escape') setActiveCategory(null);
		};
		window.addEventListener('keydown', keyHandler);
		return () => window.removeEventListener('keydown', keyHandler);
	}, []);

	// Pointer handlers for drag positioning
	React.useEffect(() => {
		if (!editMode) return;
		const handleMove = (e: PointerEvent) => {
			if (!imgRect) return;
			const currentId = dragState.current.id;
			if (!currentId) return;
			const entry = layout[currentId];
			if (!entry) return;
			const xFracRaw = (e.clientX - imgRect.left) / imgRect.width;
			const yFracRaw = (e.clientY - imgRect.top) / imgRect.height;
			// clamp
			const x = Math.min(0.98, Math.max(0.02, xFracRaw));
			const y = Math.min(0.95, Math.max(0.02, yFracRaw));
			persistLayout({ ...layout, [currentId]: { ...entry, x, y } });
		};
		const handleUp = () => { dragState.current.id = null; };
		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleUp);
		return () => {
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleUp);
		};
	}, [editMode, imgRect, layout, persistLayout]);

	const startDrag = (id: string) => (e: React.PointerEvent) => {
		if (!editMode || !imgRect) return;
		e.preventDefault();
		const entry = layout[id];
		if (!entry) return;
		// compute offset inside button (not used currently for adjustment but stored for extension)
		dragState.current = { id, offsetX: 0.5, offsetY: 0.2 };
	};

	const resetLayout = () => persistLayout({ ...defaultLayout });
	const copyJSON = () => {
		try {
			navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
		} catch { }
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden font-sans" style={{ background: bgGradient || bgColor, transition: 'background 600ms ease' }}>
			{/* Background layers */}
			<div className="absolute inset-0 overflow-hidden flex items-start justify-center">
				{/* Blurred cover layer to extend colors to edges */}
				<div className="absolute inset-0 -z-10">
					<img
						src={closetBgUrl}
						alt="Blur back"
						className="w-full h-full object-cover blur-3xl scale-110 opacity-70"
						style={{ filter: 'brightness(0.75) saturate(1.1)' }}
					/>
					{/* Subtle vignette */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_90%)] pointer-events-none" />
				</div>
				<img
					ref={imgRef}
					src={closetBgUrl}
					onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackHero; }}
					alt="Virtual wardrobe background"
					className="h-full w-auto object-contain pointer-events-none select-none"
					style={{
						filter: 'brightness(0.95)',
						maxWidth: '100%',
						aspectRatio: 'auto'
					}}
					onLoad={measure}
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col min-h-screen">
				<Header />
				{/**
					 * MANUAL LAYOUT COORDINATES
					 * x,y are fractions (0..1) of the image's width/height.
					 * Adjust these numbers so each button sits exactly over a closet box/column.
					 * To fine‑tune: open the page, resize window, tweak values below, save & reload.
					 */}
				<div className="flex-1 w-full relative" aria-label="Category hotspots layer">
					{imgRect && categories.map(cat => {
						const Icon = cat.icon;
						const pos = layout[cat.id];
						if (!pos) return null;
						const boxWidth = pos.w * imgRect.width;
						const leftPx = imgRect.left + pos.x * imgRect.width - boxWidth / 2;
						const topPx = imgRect.top + pos.y * imgRect.height;
						return (
							<button
								key={cat.id}
								onClick={() => !editMode && handleSelect(cat.id)}
								onPointerDown={startDrag(cat.id)}
								className={`absolute group focus:outline-none rounded-sm transition-colors backdrop-blur-[4px] border border-white/10 ${editMode ? 'cursor-move ring-1 ring-pink-400/50' : 'hover:shadow-[0_0_0_1px_rgba(255,255,255,0.25)] focus:ring-2 focus:ring-pink-400/60'} ${activeCategory === cat.id ? 'ring-2 ring-pink-400/70 shadow-lg' : ''}`}
								style={{
									left: `${leftPx}px`,
									top: `${topPx}px`,
									width: `${boxWidth}px`,
									background: editMode ? 'rgba(255,0,122,0.20)' : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 55%)',
									backdropFilter: 'blur(10px) saturate(140%)',
									WebkitBackdropFilter: 'blur(10px) saturate(140%)',
									padding: '0.55rem 0.6rem',
									transition: 'background 240ms, transform 240ms',
									...(activeCategory === cat.id && !editMode ? { background: 'linear-gradient(135deg, rgba(255,170,60,0.35) 0%, rgba(180,60,255,0.25) 55%)', transform: 'translateY(-2px)' } : {})
								}}
							>
								<div className="flex items-center gap-2 mb-0.5 select-none">
									<div className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors shadow-inner ${editMode ? 'bg-pink-500/60' : activeCategory === cat.id ? 'bg-pink-500/70' : 'bg-black/40 group-hover:bg-black/55'}`}>
										<Icon className="w-4 h-4 text-white" />
									</div>
									<h3 className="text-white font-medium tracking-tight text-xs md:text-sm whitespace-nowrap">{cat.label}</h3>
								</div>
								<p className="text-[10px] md:text-[11px] leading-snug text-white/70 pr-1 line-clamp-2 select-none">
									{editMode ? `${pos.x.toFixed(3)}, ${pos.y.toFixed(3)} • drag` : cat.description}
								</p>
							</button>
						);
					})}
					{editMode && imgRect && (
						<div className="absolute left-2 top-2 text-[10px] text-white/70 space-x-2 bg-black/40 px-3 py-1 rounded flex items-center">
							<button onClick={() => setEditMode(false)} className="px-2 py-0.5 bg-pink-600/70 hover:bg-pink-600 text-white rounded text-[11px]">Done</button>
							<button onClick={resetLayout} className="px-2 py-0.5 bg-black/50 hover:bg-black/70 rounded text-white/80">Reset</button>
							<button onClick={copyJSON} className="px-2 py-0.5 bg-black/50 hover:bg-black/70 rounded text-white/80">Copy JSON</button>
							<span className="hidden md:inline">Drag tiles to reposition</span>
						</div>
					)}
					{/* Hidden edit toggle removed from normal UI; use ?layoutEdit=1 or Shift+Alt+E */}
				</div>

				{/* Footer blurb */}
				<div className="px-6 md:px-12 pb-4 text-[10px] text-white/50 flex flex-wrap gap-6 items-center tracking-wide">
					<span>Category view</span>
					<span>Interactive tiles</span>
				</div>
				{editMode && (
					<div className="fixed bottom-3 right-3 w-72 max-h-[60vh] overflow-auto bg-black/60 border border-white/10 rounded p-2 text-[10px] text-white/70 font-mono whitespace-pre">
						{JSON.stringify(layout, null, 2)}
					</div>
				)}

				{/* Semicircle side panel with pagination */}
				<AnimatePresence>
					{activeCategory && activeSide && !editMode && (
						<motion.div
							key={panelMountKey + pageStart + (activeSide === 'right' ? 1 : 2)}
							initial={{ opacity: 0, x: activeSide === 'right' ? 140 : -140, rotate: activeSide === 'right' ? 14 : -14, scale: 0.9 }}
							animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
							exit={{ opacity: 0, x: activeSide === 'right' ? 140 : -140, rotate: activeSide === 'right' ? 16 : -16, scale: 0.9 }}
							transition={{ type: 'spring', stiffness: 200, damping: 24 }}
							className={`pointer-events-auto fixed top-1/2 -translate-y-1/2 ${activeSide === 'right' ? 'right-4 md:right-8' : 'left-4 md:left-8'} z-30`} style={{ width: '480px', height: '620px' }}
							onWheel={(e) => {
								const TOTAL_ITEMS = 28;
								if (e.deltaY > 0) setPageStart(s => Math.min(s + ITEMS_PER_PAGE, Math.max(0, (TOTAL_ITEMS - ITEMS_PER_PAGE))));
								else if (e.deltaY < 0) setPageStart(s => Math.max(0, s - ITEMS_PER_PAGE));
							}}
						>
							{(() => {
								const TOTAL_ITEMS = 28; // placeholder total (keep in sync with onWheel)
								const pageItems = Array.from({ length: Math.min(ITEMS_PER_PAGE, Math.max(0, TOTAL_ITEMS - pageStart)) }, (_, i) => pageStart + i);
								const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
								const currentPage = Math.floor(pageStart / ITEMS_PER_PAGE) + 1;
								return (
									<div className={`relative w-full h-full ${activeSide === 'right' ? 'rounded-l-[310px]' : 'rounded-r-[310px]'} overflow-hidden backdrop-blur-2xl`} style={{
										background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(30,15,5,0.28) 55%, rgba(0,0,0,0.38) 100%)',
										border: '1px solid rgba(255,255,255,0.18)',
										boxShadow: '0 10px 42px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)'
									}}>
										{/* Glow */}
										<div className={`absolute inset-y-0 ${activeSide === 'right' ? 'left-0' : 'right-0'} w-40 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,200,120,0.55)_0%,transparent_65%)] opacity-60 mix-blend-screen`} />
										{/* Close */}
										<button onClick={() => setActiveCategory(null)} className={`absolute top-3 ${activeSide === 'right' ? 'left-3' : 'right-3'} text-[11px] px-2 py-1 rounded-md bg-black/40 hover:bg-black/55 text-white/80 hover:text-white transition`}>Close</button>
										<div className={`absolute top-6 ${activeSide === 'right' ? 'left-24' : 'right-24'} text-white/85 font-semibold tracking-wide uppercase text-xs`}>{activeCategory}</div>
										{/* Page controls */}
										<div className={`absolute bottom-4 flex items-center gap-2 ${activeSide === 'right' ? 'left-20' : 'right-20'}`}>
											<button disabled={pageStart === 0} onClick={() => setPageStart(s => Math.max(0, s - ITEMS_PER_PAGE))} className="px-2 py-1 text-[10px] rounded bg-black/40 disabled:opacity-30 text-white/70 hover:bg-black/55">Prev</button>
											<span className="text-[10px] text-white/50 tracking-wide">{currentPage}/{totalPages}</span>
											<button disabled={pageStart + ITEMS_PER_PAGE >= TOTAL_ITEMS} onClick={() => setPageStart(s => Math.min(s + ITEMS_PER_PAGE, TOTAL_ITEMS - ITEMS_PER_PAGE))} className="px-2 py-1 text-[10px] rounded bg-black/40 disabled:opacity-30 text-white/70 hover:bg-black/55">Next</button>
										</div>
										{/* Arc items */}
										<div className="absolute inset-0">
											{pageItems.map((itemIndex, i) => {
												const total = Math.max(1, pageItems.length - 1);
												const t = total === 0 ? 0 : (i / total);
												const startDeg = -100; const endDeg = 100;
												const angle = startDeg + (endDeg - startDeg) * t;
												const radius = 300;
												const rad = angle * Math.PI / 180;
												const centerX = activeSide === 'right' ? 0 : 480;
												const centerY = 310;
												const x = centerX + (activeSide === 'right' ? 1 : -1) * Math.cos(rad) * radius;
												const y = centerY + Math.sin(rad) * radius;
												return (
													<motion.div
														key={itemIndex}
														initial={{ opacity: 0, scale: 0.6, x: centerX, y: centerY }}
														animate={{ opacity: 1, scale: 1, x, y }}
														exit={{ opacity: 0, scale: 0.5 }}
														transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
														whileHover={{ scale: 1.08 }}
														className={`absolute w-28 h-28 -mt-14 -ml-14 rounded-2xl border border-white/22 backdrop-blur-xl cursor-pointer group overflow-hidden ${activeSide === 'right' ? 'origin-left' : 'origin-right'}`}
														style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.15) 0%, rgba(80,40,120,0.25) 70%)', boxShadow: '0 4px 18px -4px rgba(0,0,0,0.55)' }}
													>
														<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_45%,rgba(255,180,80,0.65),rgba(120,30,255,0.15)_65%,transparent_100%)]" />
														<div className="relative z-10 flex flex-col items-center justify-center h-full text-center gap-1 select-none">
															<span className="text-[11px] font-semibold text-white/90 tracking-wide">Item {itemIndex + 1}</span>
															<span className="text-[10px] text-white/60">{activeCategory}</span>
														</div>
														<div className="absolute inset-0 ring-0 group-hover:ring-2 ring-pink-400/60 rounded-2xl transition-all" />
													</motion.div>
												);
											})}
										</div>
									</div>
								);
							})()}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default VirtualWardrobeCategories;
