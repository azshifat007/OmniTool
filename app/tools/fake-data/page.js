'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';

const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle','Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Dennis','Maria','Jerry','Heather','Tyler','Diane'];

const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez'];

const DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','proton.me','aol.com','mail.com','zoho.com','fastmail.com'];

const STREETS = ['Main St','Oak Ave','Elm St','Park Rd','Maple Dr','Cedar Ln','Pine St','Washington Ave','Lake Dr','River Rd','Hill St','Forest Ave','Spring St','Church St','Market St','Broadway','Highland Ave','Sunset Blvd','View Ave','Mill St'];

const CITIES = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','Portland','Seattle','Denver','Boston','Nashville','Miami','Atlanta','Minneapolis','Tampa','Orlando'];

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return n.toString().padStart(2, '0'); }

function generateData(count, fields) {
  return Array.from({ length: count }, (_, i) => {
    const first = rand(FIRST_NAMES);
    const last = rand(LAST_NAMES);
    const row = { '#': i + 1 };
    if (fields.name) row.Name = `${first} ${last}`;
    if (fields.email) row.Email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,999)}@${rand(DOMAINS)}`;
    if (fields.phone) row.Phone = `(${randInt(200,999)}) ${randInt(200,999)}-${pad(randInt(0,9999))}`;
    if (fields.address) row.Address = `${randInt(100,9999)} ${rand(STREETS)}, ${rand(CITIES)}, ${rand(STATES)} ${randInt(10000,99999)}`;
    if (fields.date) {
      const d = new Date(1950 + randInt(0, 73), randInt(0, 11), randInt(1, 28));
      row.DOB = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    }
    if (fields.company) row.Company = `${rand(LAST_NAMES)} ${rand(['Inc','LLC','Corp','Group','Technologies','Solutions'])}`;
    return row;
  });
}

const allFields = ['name', 'email', 'phone', 'address', 'date', 'company'];

export default function FakeDataPage() {
  const [count, setCount] = useState(10);
  const [fields, setFields] = useState(Object.fromEntries(allFields.map(f => [f, true])));
  const [data, setData] = useState(null);

  const toggle = (f) => setFields(p => ({ ...p, [f]: !p[f] }));

  const handleGenerate = useCallback(() => {
    setData(generateData(count, fields));
  }, [count, fields]);

  const toCSV = () => data ? data.map(r => Object.values(r).join(',')).join('\n') : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">D</span>
        <h1 className="font-heading text-2xl font-bold text-text">Fake Data Generator</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Rows: {count}</label>
            <input type="range" min={1} max={100} value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="flex flex-wrap gap-3">
            {allFields.map(f => (
              <label key={f} className="flex items-center gap-1.5 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={fields[f]} onChange={() => toggle(f)}
                  className="accent-primary rounded cursor-pointer" />
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </label>
            ))}
          </div>
          <button onClick={handleGenerate}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Generate
          </button>
        </div>
      </GlassCard>
      {data && (
        <>
          <div className="flex items-center justify-between mt-6 mb-3">
            <span className="text-xs text-text-tertiary">{data.length} rows</span>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(data, null, 2)} className="!bg-surface !text-text-secondary !border-border" />
              <CopyButton text={toCSV()} className="!bg-surface !text-text-secondary !border-border" />
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {Object.keys(data[0]).map(k => (
                    <th key={k} className="text-left px-3 py-2 text-text-tertiary font-medium text-xs uppercase tracking-wide whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-text whitespace-nowrap">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}
