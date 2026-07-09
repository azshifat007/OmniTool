'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const EMOJIS = [
  ['😀','Grinning Face','smile happy'],['😃','Grinning Face Big Eyes','smile happy'],['😄','Grinning Face Smiling Eyes','smile happy'],['😁','Beaming Face Smiling Eyes','smile happy'],['😅','Grinning Face Sweat','smile sweat'],['😂','Face Tears of Joy','laugh tears'],['🤣','Rolling Floor Laughing','lol rofl'],['😊','Smiling Face Smiling Eyes','blush happy'],['😇','Smiling Face Halo','angel holy'],['🙂','Slightly Smiling Face','polite smile'],['😉','Winking Face','flirt joke'],['😍','Heart Eyes','love crush'],['🥰','Smiling Face Hearts','love adore'],['😘','Face Blowing Kiss','kiss love'],['😋','Face Savoring Food','yummy delicious'],['😛','Face Tongue','playful'],['😜','Winking Tongue','joke silly'],['🤗','Hugging Face','hugs'],['🤔','Thinking Face','think consider'],['🤐','Zipper Mouth','sealed secret'],['😐','Neutral Face','neutral meh'],['😑','Expressionless Face','blank'],['😶','Face Without Mouth','silent mute'],['😒','Unamused Face','roll eyes'],['🙄','Rolling Eyes','eyeroll'],['😬','Grimacing Face','nervous awkward'],['😮','Face Open Mouth','surprised'],['😲','Astonished Face','amazed shocked'],['😳','Flushed Face','embarrassed'],['🥺','Pleading Face','begging mercy'],['😢','Crying Face','sad tear'],['😭','Loudly Crying','sob cry'],['😤','Steam From Nose','frustrated mad'],['😠','Angry Face','mad angry'],['🤬','Face with Symbols','curse swear'],['😈','Smiling Horns','devil evil'],['💀','Skull','death danger'],['💩','Pile of Poo','poop crap'],['🤡','Clown Face','circus clown'],['👻','Ghost','halloween'],['👽','Alien','extraterrestrial'],['🤖','Robot Face','bot ai robot'],['👍','Thumbs Up','like good yes'],['👎','Thumbs Down','dislike bad no'],['👊','Fist','punch fist'],['✊','Raised Fist','power solidarity'],['👋','Waving Hand','wave hello goodbye'],['✋','Raised Hand','hand stop'],['✌','Victory Hand','peace v'],['🤞','Crossed Fingers','luck hope'],['🤘','Horns','rock metal'],['🤙','Call Me Hand','call phone'],['👆','Index Up','up point'],['👇','Index Down','down point'],['👈','Index Left','left point'],['👉','Index Right','right point'],['👏','Clapping Hands','applause congrats'],['🙌','Raising Hands','celebrate hooray'],['🎉','Party Popper','celebration party'],['🎊','Confetti Ball','party congratulations'],['🎈','Balloon','birthday party'],['🎁','Wrapped Gift','present birthday'],['🎂','Birthday Cake','birthday cake'],['🍕','Pizza','food pizza italian'],['🍔','Hamburger','food burger'],['🌮','Taco','food mexican'],['🍣','Sushi','food japanese'],['🍜','Steaming Bowl','noodles ramen'],['☕','Hot Beverage','coffee tea drink'],['🍺','Beer Mug','beer drink'],['🍻','Clinking Mugs','cheers beer'],['🥂','Clinking Glasses','cheers toast'],['❤','Red Heart','love heart'],['💖','Sparkling Heart','love sparkle'],['💜','Purple Heart','love purple'],['💙','Blue Heart','love blue'],['💚','Green Heart','love green'],['💛','Yellow Heart','love yellow'],['🧡','Orange Heart','love orange'],['💔','Broken Heart','heartbreak sad'],['💯','Hundred Points','perfect 100'],['🔥','Fire','hot lit awesome'],['✨','Sparkles','shiny magic'],['⭐','Star','star favorite'],['🌟','Glowing Star','star shining'],['🌈','Rainbow','colorful gay pride'],['☀','Sun','sunshine weather'],['🌙','Crescent Moon','moon night'],['🌍','Globe Europe-Africa','earth world'],['🌎','Globe Americas','earth world'],['🌏','Globe Asia-Australia','earth world'],['⚡','High Voltage','lightning zap'],['❄','Snowflake','snow cold winter'],['🌊','Water Wave','ocean sea wave'],['🌸','Cherry Blossom','flower spring'],['🌺','Hibiscus','flower hawaii'],['🌻','Sunflower','flower yellow'],['🌹','Rose','flower love'],['🍀','Four Leaf Clover','lucky clover'],['🐶','Dog Face','dog pet'],['🐱','Cat Face','cat pet'],['🐼','Panda','panda bear'],['🐸','Frog Face','frog'],['🐧','Penguin','penguin'],['🦄','Unicorn','unicorn fantasy'],['🦋','Butterfly','butterfly pretty'],['🐞','Lady Beetle','ladybug luck'],['🌵','Cactus','cactus desert'],['🎵','Musical Note','music song'],['🎶','Musical Notes','music sound'],['🎤','Microphone','mic sing'],['🎧','Headphone','headphones music'],['🎸','Guitar','music rock'],['🎹','Keyboard','piano music'],['🎻','Violin','music classical'],['🎮','Video Game','game controller'],['🎲','Game Die','dice boardgame'],['🎯','Bullseye','target goal hit'],['🏀','Basketball','sports hoop'],['⚽','Soccer Ball','sports football'],['⚾','Baseball','sports bat'],['🎾','Tennis','sports racket'],['🚗','Car','vehicle automobile'],['✈','Airplane','flight travel'],['🚀','Rocket','space launch'],['🚲','Bicycle','bike cycle'],['⌚','Watch','watch time'],['📱','Mobile Phone','iphone smartphone'],['💻','Laptop','computer macbook'],['⌨','Keyboard','typing keyboard'],['📷','Camera','photo picture'],['🔒','Locked','lock secure'],['🔓','Unlocked','unlock open'],['🔑','Key','key password'],['🛡','Shield','shield protect'],['💡','Light Bulb','idea light'],['📚','Books','books library'],['📝','Memo','note memo'],['✂','Scissors','scissors cut'],['🔗','Link','link hyperlink'],['📎','Paperclip','attachment clip'],['📍','Pin','pin location'],['♻','Recycling','recycle green'],['💳','Credit Card','card payment'],['💰','Money Bag','money cash'],['💵','Dollar','dollar money'],['💪','Flexed Biceps','strong muscle'],['💬','Speech Balloon','chat bubble'],['💭','Thought Balloon','thought think'],['🔋','Battery','battery power'],['💉','Syringe','injection vaccine'],['💊','Pill','pill medicine'],['🔬','Microscope','microscope science'],['🔭','Telescope','telescope space'],['🧪','Test Tube','science chemistry'],['🔮','Crystal Ball','fortune magic'],['🎨','Artist Palette','art paint design'],['🏆','Trophy','award winner'],['🏅','Sports Medal','medal award'],['🏠','House','home building'],['🏢','Office Building','office building'],['🏥','Hospital','hospital medical'],['🏦','Bank','bank finance'],['🏫','School','school education'],['📦','Package','package delivery'],['📧','E-Mail','email message'],
];

export default function EmojiSearchPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return EMOJIS;
    const q = query.toLowerCase();
    return EMOJIS.filter(([e, name, tags]) =>
      name.toLowerCase().includes(q) || tags.toLowerCase().includes(q)
    );
  }, [query]);

  const copy = async (emoji) => {
    try { await navigator.clipboard.writeText(emoji); } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">☺</span>
        <h1 className="font-heading text-2xl font-bold text-text">Emoji Search</h1>
      </div>
      <GlassCard>
        <div className="p-4">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search emojis by name or keyword..."
            className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
        </div>
      </GlassCard>
      <div className="flex items-center justify-between mt-4 mb-2">
        <span className="text-xs text-text-tertiary">{filtered.length} emojis</span>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
        {filtered.map(([emoji, name]) => (
          <button key={emoji + name} onClick={() => copy(emoji)} title={name}
            className="aspect-square flex items-center justify-center text-2xl rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-badge-bg transition-all cursor-pointer">
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
