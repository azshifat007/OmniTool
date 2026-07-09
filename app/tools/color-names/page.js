'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const COLORS = [
  ['AliceBlue','#F0F8FF'],['AntiqueWhite','#FAEBD7'],['Aqua','#00FFFF'],['Aquamarine','#7FFFD4'],['Azure','#F0FFFF'],
  ['Beige','#F5F5DC'],['Bisque','#FFE4C4'],['Black','#000000'],['BlanchedAlmond','#FFEBCD'],['Blue','#0000FF'],
  ['BlueViolet','#8A2BE2'],['Brown','#A52A2A'],['BurlyWood','#DEB887'],['CadetBlue','#5F9EA0'],['Chartreuse','#7FFF00'],
  ['Chocolate','#D2691E'],['Coral','#FF7F50'],['CornflowerBlue','#6495ED'],['Cornsilk','#FFF8DC'],['Crimson','#DC143C'],
  ['Cyan','#00FFFF'],['DarkBlue','#00008B'],['DarkCyan','#008B8B'],['DarkGoldenRod','#B8860B'],['DarkGray','#A9A9A9'],
  ['DarkGreen','#006400'],['DarkKhaki','#BDB76B'],['DarkMagenta','#8B008B'],['DarkOliveGreen','#556B2F'],['DarkOrange','#FF8C00'],
  ['DarkOrchid','#9932CC'],['DarkRed','#8B0000'],['DarkSalmon','#E9967A'],['DarkSeaGreen','#8FBC8F'],['DarkSlateBlue','#483D8B'],
  ['DarkSlateGray','#2F4F4F'],['DarkTurquoise','#00CED1'],['DarkViolet','#9400D3'],['DeepPink','#FF1493'],['DeepSkyBlue','#00BFFF'],
  ['DimGray','#696969'],['DodgerBlue','#1E90FF'],['FireBrick','#B22222'],['FloralWhite','#FFFAF0'],['ForestGreen','#228B22'],
  ['Fuchsia','#FF00FF'],['Gainsboro','#DCDCDC'],['GhostWhite','#F8F8FF'],['Gold','#FFD700'],['GoldenRod','#DAA520'],
  ['Gray','#808080'],['Green','#008000'],['GreenYellow','#ADFF2F'],['HoneyDew','#F0FFF0'],['HotPink','#FF69B4'],
  ['IndianRed','#CD5C5C'],['Indigo','#4B0082'],['Ivory','#FFFFF0'],['Khaki','#F0E68C'],['Lavender','#E6E6FA'],
  ['LavenderBlush','#FFF0F5'],['LawnGreen','#7CFC00'],['LemonChiffon','#FFFACD'],['LightBlue','#ADD8E6'],['LightCoral','#F08080'],
  ['LightCyan','#E0FFFF'],['LightGoldenRodYellow','#FAFAD2'],['LightGray','#D3D3D3'],['LightGreen','#90EE90'],['LightPink','#FFB6C1'],
  ['LightSalmon','#FFA07A'],['LightSeaGreen','#20B2AA'],['LightSkyBlue','#87CEFA'],['LightSlateGray','#778899'],['LightSteelBlue','#B0C4DE'],
  ['LightYellow','#FFFFE0'],['Lime','#00FF00'],['LimeGreen','#32CD32'],['Linen','#FAF0E6'],['Magenta','#FF00FF'],
  ['Maroon','#800000'],['MediumAquaMarine','#66CDAA'],['MediumBlue','#0000CD'],['MediumOrchid','#BA55D3'],['MediumPurple','#9370DB'],
  ['MediumSeaGreen','#3CB371'],['MediumSlateBlue','#7B68EE'],['MediumSpringGreen','#00FA9A'],['MediumTurquoise','#48D1CC'],['MediumVioletRed','#C71585'],
  ['MidnightBlue','#191970'],['MintCream','#F5FFFA'],['MistyRose','#FFE4E1'],['Moccasin','#FFE4B5'],['NavajoWhite','#FFDEAD'],
  ['Navy','#000080'],['OldLace','#FDF5E6'],['Olive','#808000'],['OliveDrab','#6B8E23'],['Orange','#FFA500'],
  ['OrangeRed','#FF4500'],['Orchid','#DA70D6'],['PaleGoldenRod','#EEE8AA'],['PaleGreen','#98FB98'],['PaleTurquoise','#AFEEEE'],
  ['PaleVioletRed','#DB7093'],['PapayaWhip','#FFEFD5'],['PeachPuff','#FFDAB9'],['Peru','#CD853F'],['Pink','#FFC0CB'],
  ['Plum','#DDA0DD'],['PowderBlue','#B0E0E6'],['Purple','#800080'],['RebeccaPurple','#663399'],['Red','#FF0000'],
  ['RosyBrown','#BC8F8F'],['RoyalBlue','#4169E1'],['SaddleBrown','#8B4513'],['Salmon','#FA8072'],['SandyBrown','#F4A460'],
  ['SeaGreen','#2E8B57'],['SeaShell','#FFF5EE'],['Sienna','#A0522D'],['Silver','#C0C0C0'],['SkyBlue','#87CEEB'],
  ['SlateBlue','#6A5ACD'],['SlateGray','#708090'],['Snow','#FFFAFA'],['SpringGreen','#00FF7F'],['SteelBlue','#4682B4'],
  ['Tan','#D2B48C'],['Teal','#008080'],['Thistle','#D8BFD8'],['Tomato','#FF6347'],['Turquoise','#40E0D0'],
  ['Violet','#EE82EE'],['Wheat','#F5DEB3'],['White','#FFFFFF'],['WhiteSmoke','#F5F5F5'],['Yellow','#FFFF00'],
  ['YellowGreen','#9ACD32'],
];

function luminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  return 0.2126 * (r <= 0.03928 ? r/12.92 : Math.pow((r+0.055)/1.055, 2.4)) + 0.7152 * (g <= 0.03928 ? g/12.92 : Math.pow((g+0.055)/1.055, 2.4)) + 0.0722 * (b <= 0.03928 ? b/12.92 : Math.pow((b+0.055)/1.055, 2.4));
}

async function copy(text) { try { await navigator.clipboard.writeText(text); } catch {} }

export default function ColorNamesPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return COLORS;
    const q = query.toLowerCase();
    return COLORS.filter(([name]) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Color Names</h1>
      </div>
      <GlassCard>
        <div className="p-4">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search color names..."
            className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
        </div>
      </GlassCard>
      <div className="flex items-center justify-between mt-4 mb-2">
        <span className="text-xs text-text-tertiary">{filtered.length} colors</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filtered.map(([name, hex]) => (
          <button key={name} onClick={() => copy(hex)} title={`Click to copy ${hex}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-lg border border-border shrink-0" style={{ backgroundColor: hex }} />
            <div className="text-left min-w-0">
              <div className="text-xs text-text font-medium truncate">{name}</div>
              <div className="text-[10px] text-text-tertiary font-mono">{hex}</div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
