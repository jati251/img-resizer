import { useState, useRef, useEffect } from "react";
import { Download, Ruler, Grid3X3, Brush, ChevronDown, FilePlus, Image as ImageIcon, Trash2, Eye, EyeOff, Maximize, HelpCircle } from "lucide-react";

interface TopbarProps {
  onExport: () => void;
  onNew?: () => void;
  onClearAll?: () => void;
  onResetZoom?: () => void;
  showGuidelines?: boolean;
  onToggleGuidelines?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onExport, 
  onNew,
  onClearAll,
  onResetZoom,
  showGuidelines = true, 
  onToggleGuidelines,
  showGrid = true,
  onToggleGrid
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Design', icon: <FilePlus size={14} />, onClick: onNew },
        { label: 'Export Design', icon: <Download size={14} />, onClick: onExport, shortcut: '⌘E' },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Clear Canvas', icon: <Trash2 size={14} />, onClick: onClearAll },
      ]
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: showGuidelines ? 'Hide Rulers' : 'Show Rulers', icon: showGuidelines ? <EyeOff size={14} /> : <Eye size={14} />, onClick: onToggleGuidelines, shortcut: '⇧R' },
        { label: showGrid ? 'Hide Grid' : 'Show Grid', icon: <Grid3X3 size={14} />, onClick: onToggleGrid, shortcut: '⌘G' },
        { label: 'Reset View', icon: <Maximize size={14} />, onClick: onResetZoom, shortcut: '⌘0' },
      ]
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Kuwas Guide', icon: <HelpCircle size={14} />, onClick: () => alert('Coming Soon!') },
        { label: 'About Studio', icon: <Brush size={14} />, onClick: () => alert('Kuwas v2.0 - High Performance Design Tool') },
      ]
    }
  ];

  return (
    <header className="h-14 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-4 z-[100] shrink-0">
      <div className="flex items-center gap-6" ref={menuRef}>
        <div className="flex items-center gap-3 pr-2 border-r border-zinc-800/50 mr-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Brush size={16} />
          </div>
          <div className="flex flex-col -space-y-1 hidden sm:flex">
            <h1 className="text-sm font-black tracking-tighter text-zinc-100 uppercase italic leading-none">Kuwas</h1>
            <span className="text-[8px] text-zinc-500 font-medium uppercase tracking-[0.2em] pl-0.5">Studio</span>
          </div>
        </div>

        <nav className="flex items-center">
          {menus.map((menu) => (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                onMouseEnter={() => activeMenu && setActiveMenu(menu.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeMenu === menu.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {menu.label}
              </button>
              
              {activeMenu === menu.id && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-[110]">
                  <div className="p-1.5">
                    {menu.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { item.onClick?.(); setActiveMenu(null); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-zinc-500 group-hover:text-white transition-colors">{item.icon}</span>
                          {item.label}
                        </div>
                        {item.shortcut && <span className="text-[9px] text-zinc-600 group-hover:text-blue-100 font-mono">{item.shortcut}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex justify-center px-4">
         <div className="px-4 py-1.5 bg-zinc-950/50 border border-zinc-800/50 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Untitled Masterpiece</span>
         </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Download size={14} /> Export
        </button>
      </div>
    </header>
  );
};
