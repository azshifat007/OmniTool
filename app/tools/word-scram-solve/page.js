'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const WORDS = [
  'THE', 'AND', 'FOR', 'ARE', 'NOT', 'BUT', 'YOU', 'ALL', 'CAN', 'HAD',
  'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HIM', 'ITS', 'MAN', 'NEW',
  'NOW', 'OLD', 'SAY', 'SEE', 'WAY', 'WHO', 'BOY', 'DID', 'GET', 'HOW',
  'LET', 'PUT', 'RUN', 'USE', 'ABLE', 'ALSO', 'AREA', 'BACK', 'BEST', 'CALL',
  'CARE', 'COME', 'COOL', 'DARK', 'DOOR', 'DOWN', 'EACH', 'EAST', 'EVEN', 'FACT',
  'FAIL', 'FAIR', 'FALL', 'FAST', 'FILL', 'FIND', 'FIRE', 'FISH', 'FIVE', 'FOOD',
  'FOUR', 'FREE', 'FULL', 'GAME', 'GIRL', 'GIVE', 'GOOD', 'HALL', 'HAND', 'HANG',
  'HARD', 'HATE', 'HAVE', 'HEAD', 'HEAR', 'HELP', 'HERE', 'HIGH', 'HOLD', 'HOME',
  'HOPE', 'JUMP', 'KEEP', 'KIND', 'KING', 'KNOW', 'LACK', 'LATE', 'LEAD', 'LEFT',
  'LIFE', 'LIKE', 'LINE', 'LIST', 'LIVE', 'LOAD', 'LONG', 'LOOK', 'LORD', 'LOSE',
  'LOVE', 'LUCK', 'MADE', 'MAIN', 'MAKE', 'MALE', 'MANY', 'MARK', 'MORE', 'MOST',
  'MOVE', 'MUCH', 'MUST', 'NAME', 'NEAR', 'NEED', 'NEXT', 'NICE', 'NOTE', 'ONCE',
  'ONLY', 'OPEN', 'OVER', 'PAGE', 'PAID', 'PARK', 'PART', 'PASS', 'PAST', 'PATH',
  'PICK', 'PLAN', 'PLAY', 'POEM', 'POOR', 'PULL', 'PUSH', 'RAIN', 'RANK', 'RARE',
  'READ', 'REAL', 'REST', 'RICE', 'RICH', 'RIDE', 'RING', 'RISK', 'ROCK', 'ROLL',
  'ROOM', 'ROOT', 'ROSE', 'RULE', 'SAFE', 'SAID', 'SAME', 'SEAT', 'SEEM', 'SELL',
  'SEND', 'SHIP', 'SHOP', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SING', 'SITE',
  'SIZE', 'SKIN', 'SLOW', 'SNOW', 'SOFT', 'SOME', 'SONG', 'SOON', 'SORT', 'STAR',
  'STAY', 'STEP', 'STOP', 'SURE', 'TAKE', 'TALK', 'TALL', 'TEAM', 'TELL', 'TEST',
  'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THIN', 'THIS', 'TILL', 'TIME', 'TOLL',
  'TOOL', 'TOUR', 'TREE', 'TRUE', 'TURN', 'TWIN', 'TYPE', 'UNIT', 'UPON', 'VAST',
  'VERY', 'VIEW', 'VOTE', 'WAGE', 'WAIT', 'WALK', 'WALL', 'WANT', 'WARM', 'WARN',
  'WASH', 'WAVE', 'WEEK', 'WELL', 'WENT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHOM',
  'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIRE', 'WISH', 'WITH',
  'WOMAN', 'WORLD', 'WATER', 'WHITE', 'YOUNG', 'THERE', 'WHERE', 'WHICH', 'THEIR',
  'THINK', 'THREE', 'SMALL', 'HOUSE', 'HUMAN', 'RIGHT', 'PLACE', 'POINT', 'LARGE',
  'LATER', 'LEVEL', 'LIGHT', 'MONEY', 'MONTH', 'MUSIC', 'NIGHT', 'ORDER', 'OTHER',
  'PAPER', 'PARTY', 'PEACE', 'PHONE', 'PHOTO', 'POWER', 'PRESS', 'PRICE', 'PRIDE',
  'PRIME', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RANGE', 'RAPID', 'REACH',
  'REFER', 'REIGN', 'RELAX', 'ROUND', 'ROUTE', 'RURAL', 'SCALE', 'SCENE', 'SHAPE',
  'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHIRT', 'SHOCK', 'SHORT',
  'SIGHT', 'SILLY', 'SINCE', 'SKILL', 'SLIDE', 'SMART', 'SMELL', 'SMILE', 'SMOKE',
  'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED',
  'SPELL', 'SPEND', 'SPITE', 'SPLIT', 'SPORT', 'SPRAY', 'SQUAD', 'STACK', 'STAFF',
  'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAL', 'STEAM', 'STEEL', 'STEEP',
  'STEER', 'STICK', 'STIFF', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM',
  'STORY', 'STRAIGHT', 'STRANGE', 'STREAM', 'STREET', 'STRESS', 'STRETCH', 'STRING',
  'STRIP', 'STRONG', 'STUDY', 'STUFF', 'STYLE', 'SUDDEN', 'SUGAR', 'SUMMER', 'SUNNY',
  'SUPER', 'SURVEY', 'SWEET', 'SWIFT', 'SWING', 'SWITCH', 'TABLE', 'TASTE', 'TEACH',
  'THANK', 'THEME', 'THICK', 'THING', 'THROW', 'TIGHT', 'TIRED', 'TITLE', 'TODAY',
  'TOWER', 'TRACK', 'TRADE', 'TRAFFIC', 'TRAIN', 'TRASH', 'TREAT', 'TREND', 'TRIAL',
  'TRIBE', 'TRICK', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'ULTRA', 'UNCLE',
  'UNDER', 'UNION', 'UNITE', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE',
  'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRAL', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL',
  'VOICE', 'WAGON', 'WASTE', 'WATCH', 'WATER', 'WEALTH', 'WEAPON', 'WEAR', 'WEATHER',
  'WEEKLY', 'WEIGHT', 'WHEEL', 'WHERE', 'WHILE', 'WHITE', 'WHOLE', 'WIDELY', 'WINTER',
  'WISDOM', 'WITHIN', 'WOMAN', 'WONDER', 'WOODEN', 'WORDS', 'WORKS', 'WORLD', 'WORRY',
  'WORTH', 'WOULD', 'WRITE', 'WRONG', 'YEAH', 'YEARLY', 'YELLOW', 'YOUNG', 'YOURS',
  'YOUTH', 'ALMOST', 'ALWAYS', 'AMERICA', 'ANIMAL', 'ANOTHER', 'ANSWER', 'ANYWAY',
  'APPEAR', 'ARRIVE', 'ARTICLE', 'BEAUTIFUL', 'BECOME', 'BEFORE', 'BEHAVE', 'BEHIND',
  'BELIEVE', 'BELONG', 'BESIDE', 'BEYOND', 'BOTTLE', 'BOTTOM', 'BRANCH', 'BREAK',
  'BRIDGE', 'BRIGHT', 'BROKEN', 'BROTHER', 'BUDGET', 'BUILD', 'BURDEN', 'BURST',
  'BUTTER', 'BUTTON', 'CAMERA', 'CAMPUS', 'CANCER', 'CANVAS', 'CAPTURE', 'CAREER',
  'CAREFUL', 'CARRIER', 'CARRY', 'CATCH', 'CAUGHT', 'CENTER', 'CHANCE', 'CHANGE',
  'CHARGE', 'CHEESE', 'CHOICE', 'CHOOSE', 'CHOSEN', 'CHURCH', 'CIRCLE', 'CLEAR',
  'CLIENT', 'CLIMATE', 'CLIMB', 'CLOSED', 'CLOSER', 'COFFEE', 'COLUMN', 'COMBAT',
  'COMFORT', 'COMMAND', 'COMMON', 'COMPANY', 'COMPARE', 'COMPETE', 'COMPLEX',
  'COMPOSE', 'CONCEPT', 'CONCERN', 'CONDUCT', 'CONFIRM', 'CONNECT', 'CONSENT',
  'CONSIST', 'CONTACT', 'CONTAIN', 'CONTENT', 'CONTEXT', 'CONTROL', 'CONVERT',
  'COOKIE', 'CORNER', 'COTTON', 'COUNTRY', 'COUNTY', 'COUPLE', 'COURSE', 'COUSIN',
  'COVER', 'CRACK', 'CRAFT', 'CRAZY', 'CREATE', 'CREDIT', 'CREW', 'CRIME',
  'CRISIS', 'CROSS', 'CROWD', 'CRUEL', 'CRYING', 'CULTURE', 'CURRENT', 'CUSTOM',
  'CYCLE', 'DAMAGE', 'DANGER', 'DEADLY', 'DEALER', 'DEARLY', 'DEBATE', 'DEBT',
  'DECADE', 'DECIDE', 'DECLARE', 'DECLINE', 'DEFEAT', 'DEFEND', 'DEFINE',
  'DEGREE', 'DELAY', 'DELIVER', 'DEMAND', 'DENIAL', 'DENY', 'DEPART', 'DEPEND',
  'DEPOSIT', 'DESCRIBE', 'DESERT', 'DESERVE', 'DESIGN', 'DESIRE', 'DESTROY',
  'DETAIL', 'DETECT', 'DEVELOP', 'DEVICE', 'DEVOTE', 'DIALOG', 'DIAMOND',
  'DINNER', 'DIRECT', 'DISCOVER', 'DISH', 'DISMISS', 'DISPLAY', 'DISTANT',
  'DIVIDE', 'DOCTOR', 'DOLLAR', 'DOMAIN', 'DOUBLE', 'DOUBT', 'DOZEN', 'DRAFT',
  'DRAW', 'DREAM', 'DRESS', 'DRIFT', 'DRINK', 'DRIVE', 'DROP', 'DRYING',
  'EAGER', 'EARN', 'EASILY', 'EFFECT', 'EFFORT', 'EITHER', 'ELECTRIC', 'ELEMENT',
  'EMERGE', 'EMOTION', 'EMPIRE', 'EMPLOY', 'EMPTY', 'ENABLE', 'ENDLESS', 'ENDURE',
  'ENERGY', 'ENGAGE', 'ENGINE', 'ENJOY', 'ENOUGH', 'ENSURE', 'ENTER', 'ENTIRE',
  'ENTRY', 'ENVELOPE', 'EQUAL', 'EQUIP', 'ERROR', 'ESCAPE', 'ESSAY', 'ESSENCE',
  'ESTATE', 'ESTIMATE', 'ETHICS', 'EVOLVE', 'EXCEED', 'EXCEPT', 'EXCHANGE',
  'EXCITE', 'EXCLUDE', 'EXCUSE', 'EXECUTE', 'EXERCISE', 'EXHIBIT', 'EXIST',
  'EXIT', 'EXPAND', 'EXPECT', 'EXPENSE', 'EXPERT', 'EXPLAIN', 'EXPLODE',
  'EXPLOIT', 'EXPLORE', 'EXPORT', 'EXPOSE', 'EXTEND', 'EXTENT', 'EXTRACT',
  'EXTRA', 'EXTREME', 'EYEBROW', 'FABRIC', 'FACIAL', 'FACING', 'FACTOR',
  'FACTORY', 'FAILURE', 'FAIRLY', 'FAITH', 'FAMILY', 'FAMOUS', 'FANCY',
  'FANTASY', 'FARMER', 'FASHION', 'FASTER', 'FATAL', 'FATHER', 'FAULT',
  'FEAR', 'FEATURE', 'FEEDBACK', 'FEMALE', 'FIBER', 'FIELD', 'FIERCE',
  'FIFTEEN', 'FIGHT', 'FIGURE', 'FILE', 'FILTER', 'FINAL', 'FINANCE',
  'FINGER', 'FINISH', 'FIRING', 'FIRMLY', 'FISCAL', 'FISHING', 'FITNESS',
  'FIXED', 'FLAG', 'FLAME', 'FLASH', 'FLAT', 'FLEET', 'FLEXIBLE', 'FLIGHT',
  'FLOAT', 'FLOOD', 'FLOOR', 'FLOUR', 'FLOW', 'FLOWER', 'FLUID', 'FLYING',
  'FOCUS', 'FOLDER', 'FOLLOW', 'FOOT', 'FORBID', 'FORCE', 'FOREIGN', 'FOREST',
  'FOREVER', 'FORGET', 'FORMAL', 'FORMAT', 'FORMER', 'FORTUNE', 'FORUM',
  'FORWARD', 'FOSSIL', 'FOSTER', 'FOUND', 'FOUNTAIN', 'FRACTION', 'FRAME',
  'FRANK', 'FRAUD', 'FREEDOM', 'FREEZE', 'FREQUENT', 'FRESHLY', 'FRIEND',
  'FRIGHT', 'FROZEN', 'FRUIT', 'FULFILL', 'FUNCTION', 'FUND', 'FUNERAL',
  'FURNISH', 'FURROW', 'FUTURE', 'GAIN', 'GALLERY', 'GANG', 'GARDEN', 'GARLIC',
  'GATHER', 'GENDER', 'GENERAL', 'GENERATE', 'GENTLE', 'GENUINE', 'GESTURE',
  'GIANT', 'GIFTED', 'GLANCE', 'GLASS', 'GLOBAL', 'GLORY', 'GOLDEN', 'GOVERN',
  'GRAB', 'GRACE', 'GRADE', 'GRADUAL', 'GRAIN', 'GRAND', 'GRANT', 'GRAPH',
  'GRASP', 'GRASS', 'GRATEFUL', 'GRAVITY', 'GREAT', 'GREET', 'GROUND',
  'GROUP', 'GROWTH', 'GUARANTEE', 'GUARD', 'GUESS', 'GUIDE', 'GUILT',
  'GUITAR', 'HABIT', 'HALF', 'HANDLE', 'HAPPEN', 'HAPPY', 'HARBOR',
  'HARDLY', 'HARMONY', 'HARSH', 'HARVEST', 'HAVEN', 'HEALING', 'HEALTH',
  'HEART', 'HEAT', 'HEAVEN', 'HEAVILY', 'HEIGHT', 'HELPER', 'HERO',
  'HERSELF', 'HIDDEN', 'HIGHLY', 'HIGHWAY', 'HIMSELF', 'HISTORY', 'HOLDER',
  'HOLIDAY', 'HONEST', 'HONEY', 'HONOR', 'HORIZON', 'HORROR', 'HOSTILE',
  'HOTEL', 'HUNGER', 'HUNTER', 'HURRY', 'HURTING', 'HUSBAND', 'ICONIC',
  'IDEAL', 'IGNORE', 'ILLEGAL', 'ILLNESS', 'IMAGE', 'IMAGINE', 'IMMUNE',
  'IMPACT', 'IMPORT', 'IMPOSE', 'IMPRESS', 'IMPROVE', 'INCLUDE', 'INCOME',
  'INCREASE', 'INDEED', 'INDIAN', 'INFANT', 'INFORM', 'INITIAL', 'INJURY',
  'INMATE', 'INNER', 'INPUT', 'INQUIRY', 'INSECT', 'INSIDE', 'INSIST',
  'INSTALL', 'INSTANT', 'INSTEAD', 'INTACT', 'INTEND', 'INTENSE', 'INTERACT',
  'INTEREST', 'INTERNAL', 'INTERVAL', 'INTIMATE', 'INVADE', 'INVEST',
  'INVITE', 'INVOLVE', 'IRON', 'ISLAND', 'ISOLATE', 'ISSUE', 'ITEM',
  'ITSELF', 'JEWELRY', 'JOURNAL', 'JOURNEY', 'JOYFUL', 'JUDGMENT', 'JUICE',
  'JUNGLE', 'JUNIOR', 'JUSTICE', 'JUSTIFY', 'KEEPING', 'KEYBOARD', 'KIDNAP',
  'KILLER', 'KINDLY', 'KISSING', 'KITCHEN', 'KNIGHT', 'KNOT', 'LABEL',
  'LADDER', 'LADY', 'LANDING', 'LANGUAGE', 'LAPTOP', 'LARGELY', 'LASER',
  'LASTING', 'LAUGH', 'LAUNCH', 'LAWYER', 'LAYER', 'LEADER', 'LEAGUE',
  'LEARNING', 'LEATHER', 'LECTURE', 'LEGACY', 'LEGAL', 'LENGTH', 'LESSON',
  'LETHAL', 'LETTER', 'LIBERAL', 'LIBRARY', 'LICENSE', 'LID', 'LIFT',
  'LIKELY', 'LIMIT', 'LINEAR', 'LINING', 'LINK', 'LIQUID', 'LISTEN',
  'LITERAL', 'LITTLE', 'LIVING', 'LOADED', 'LOCAL', 'LOCATE', 'LOCKED',
  'LOGICAL', 'LONELY', 'LONGER', 'LOOSELY', 'LORD', 'LOSING', 'LOSS',
  'LOUDLY', 'LOVELY', 'LOWER', 'LOYAL', 'LUCKY', 'LUNCH', 'LUXURY',
  'MACHINE', 'MAGIC', 'MAIL', 'MAINLY', 'MAINTAIN', 'MAJOR', 'MAKER',
  'MANAGE', 'MANNER', 'MANSION', 'MANUAL', 'MAPLE', 'MARCH', 'MARGIN',
  'MARINE', 'MARKER', 'MARKET', 'MASTER', 'MATCH', 'MATRIX', 'MATTER',
  'MATURE', 'MAXIMUM', 'MAYBE', 'MAYOR', 'MEADOW', 'MEAL', 'MEANING',
  'MEASURE', 'MEDIA', 'MEDICAL', 'MEDIUM', 'MEETING', 'MEMBER', 'MEMORY',
  'MENTAL', 'MENTION', 'MERCY', 'MERELY', 'MERGER', 'MERIT', 'MESSAGE',
  'METAL', 'METHOD', 'MIDDLE', 'MIGHTY', 'MILD', 'MILITARY', 'MILLION',
  'MIND', 'MINERAL', 'MINIMAL', 'MINIMUM', 'MINING', 'MINISTER', 'MINOR',
  'MINUTE', 'MIRACLE', 'MIRROR', 'MISSILE', 'MISSION', 'MISTAKE', 'MIXTURE',
  'MOBILE', 'MODE', 'MODEL', 'MODERN', 'MODEST', 'MOMENT', 'MONITOR',
  'MONTHLY', 'MOON', 'MORAL', 'MORTAL', 'MOSAIC', 'MOTHER', 'MOTION',
  'MOTIVE', 'MOUNTAIN', 'MOUSE', 'MOUTH', 'MOVEMENT', 'MURDER', 'MUSCLE',
  'MUSEUM', 'MUTUAL', 'MYSTERY', 'NAKED', 'NARROW', 'NATION', 'NATIVE',
  'NATURAL', 'NATURE', 'NAVY', 'NEARBY', 'NEARLY', 'NEATLY', 'NECK',
  'NEEDLE', 'NEGATIVE', 'NEGLECT', 'NEIGHBOR', 'NEITHER', 'NERVOUS', 'NETWORK',
  'NEUTRAL', 'NEVER', 'NEVERTHELESS', 'NOMINAL', 'NONE', 'NORMAL', 'NORTH',
  'NOTICE', 'NOTION', 'NOVEL', 'NUCLEAR', 'NUMBER', 'NUMEROUS', 'NURSE',
  'OBJECT', 'OBLIGED', 'OBTAIN', 'OBVIOUS', 'OCCASION', 'OCCUPY', 'OFFENCE',
  'OFFER', 'OFFICE', 'OFFICER', 'OFTEN', 'OLYMPIC', 'ONGOING', 'OPENLY',
  'OPERATE', 'OPINION', 'OPPOSE', 'OPTION', 'ORANGE', 'ORBIT', 'ORGAN',
  'ORGANIC', 'ORIGIN', 'OTHER', 'OUGHT', 'OUTCOME', 'OUTDOOR', 'OUTER',
  'OUTPUT', 'OUTSIDE', 'OVEN', 'OVERALL', 'OVERCOME', 'OVERLAP', 'OVERSEAS',
  'OWING', 'OWNER', 'OXYGEN', 'PACKAGE', 'PACKET', 'PAGEANT', 'PAINTING',
  'PALACE', 'PANEL', 'PANIC', 'PARADE', 'PARENT', 'PARISH', 'PARKING',
  'PARLIAMENT', 'PARTIAL', 'PARTLY', 'PARTNER', 'PASSAGE', 'PASSION', 'PASSIVE',
  'PASTURE', 'PATCH', 'PATENT', 'PATH', 'PATIENT', 'PATROL', 'PATTERN',
  'PAVEMENT', 'PAYMENT', 'PEACE', 'PEAK', 'PECULIAR', 'PENALTY', 'PENCIL',
  'PENNY', 'PEOPLE', 'PERCENT', 'PERFECT', 'PERFORM', 'PERHAPS', 'PERIOD',
  'PERMIT', 'PERSON', 'PERSUADE', 'PETROL', 'PHASE', 'PHENOMENON', 'PHILOSOPHY',
  'PHYSICS', 'PIANO', 'PICKLE', 'PICTURE', 'PIECE', 'PILOT', 'PIONEER',
  'PIPELINE', 'PIRATE', 'PITCH', 'PIZZA', 'PLACEBO', 'PLAIN', 'PLANET',
  'PLANT', 'PLASTIC', 'PLATEAU', 'PLAYER', 'PLEASE', 'PLEASURE', 'PLEDGE',
  'PLENTY', 'PLOT', 'PLUGIN', 'PLUNGE', 'POCKET', 'POEM', 'POETRY', 'POINTED',
  'POISON', 'POLAR', 'POLICE', 'POLICY', 'POLITE', 'POLLEN', 'PONDER',
  'POPULAR', 'PORCH', 'PORTION', 'POSITION', 'POSITIVE', 'POSSESS', 'POSSIBLE',
  'POSTAL', 'POSTER', 'POTATO', 'POTENTIAL', 'POUND', 'POVERTY', 'POWDER',
  'POWERFUL', 'PRACTICE', 'PRAISE', 'PRAYER', 'PRECISE', 'PREDICT', 'PREFER',
  'PREMIER', 'PREMIUM', 'PREPARE', 'PRESENT', 'PRESERVE', 'PRESIDENT', 'PRESSING',
  'PRESSURE', 'PRETEND', 'PRETTY', 'PREVENT', 'PREVIOUS', 'PRICING', 'PRIMARY',
  'PRINCE', 'PRINCESS', 'PRINCIPAL', 'PRINCIPLE', 'PRINTER', 'PRISON', 'PRIVACY',
  'PRIVATE', 'PRIVILEGE', 'PROBABLY', 'PROBLEM', 'PROCEED', 'PROCESS', 'PRODUCE',
  'PRODUCT', 'PROFILE', 'PROFIT', 'PROGRAM', 'PROJECT', 'PROMISE', 'PROMOTE',
  'PROMPT', 'PROPER', 'PROPERTY', 'PROPHET', 'PROPORTION', 'PROPOSAL', 'PROPOSE',
  'PROSPECT', 'PROTECT', 'PROTEIN', 'PROTEST', 'PROUDLY', 'PROVE', 'PROVIDE',
  'PROVINCE', 'PROVISION', 'PROVOKE', 'PRUDENT', 'PSYCHIC', 'PUBLIC', 'PULLEY',
  'PULSE', 'PUNCH', 'PUNISH', 'PUPIL', 'PURCHASE', 'PURELY', 'PURPLE', 'PURSUE',
  'PURSUIT', 'PUZZLE', 'QUALIFY', 'QUALITY', 'QUANTITY', 'QUARTER', 'QUESTION',
  'QUIETLY', 'QUIT', 'QUIZ', 'QUOTA', 'RABBIT', 'RACIAL', 'RACKET', 'RADAR',
  'RADIANT', 'RADICAL', 'RAGE', 'RAID', 'RAILWAY', 'RAINBOW', 'RAISIN', 'RALLY',
  'RANDOM', 'RANKING', 'RAPIDLY', 'RARE', 'RATIO', 'RATTLE', 'REACH', 'REACTOR',
  'READILY', 'READING', 'REALITY', 'REALIZE', 'REAR', 'REASON', 'REBEL', 'RECALL',
  'RECEIVE', 'RECENT', 'RECIPE', 'RECORD', 'RECOVER', 'RECRUIT', 'RECYCLE',
  'REDUCE', 'REFEREE', 'REFINE', 'REFORM', 'REFUGEE', 'REFUSE', 'REGARD',
  'REGIME', 'REGION', 'REGISTER', 'REGRET', 'REGULAR', 'REJECT', 'RELATE',
  'RELEASE', 'RELIEF', 'RELIGION', 'RELISH', 'RELY', 'REMAIN', 'REMARK',
  'REMEDY', 'REMEMBER', 'REMIND', 'REMOTE', 'REMOVAL', 'REMOVE', 'RENDER',
  'RENEW', 'RENTAL', 'REPAIR', 'REPEAT', 'REPLACE', 'REPLY', 'REPORT',
  'REQUEST', 'REQUIRE', 'RESCUE', 'RESERVE', 'RESIDE', 'RESIGN', 'RESIST',
  'RESOLVE', 'RESORT', 'RESOURCE', 'RESPECT', 'RESPOND', 'RESTORE', 'RESTRICT',
  'RESULT', 'RETAIN', 'RETIRE', 'RETREAT', 'RETURN', 'REUNION', 'REVEAL',
  'REVENUE', 'REVERSE', 'REVIEW', 'REVISE', 'REVIVE', 'REVOLT', 'REVOLVE',
  'REWARD', 'RHYTHM', 'RIDDLE', 'RIDGE', 'RIFLE', 'RIGHTLY', 'RIGID', 'RIM',
  'RING', 'RIOT', 'RIPPLE', 'RISING', 'RITUAL', 'RIVAL', 'RIVER', 'ROAD',
  'ROAR', 'ROBOT', 'ROCKET', 'ROD', 'ROLE', 'ROLLER', 'ROOF', 'ROOM',
  'ROOT', 'ROSARY', 'ROSTER', 'ROTATE', 'ROUGH', 'ROUND', 'ROUTINE', 'ROWING',
  'ROYAL', 'RUBBER', 'RUGGED', 'RUIN', 'RULING', 'RUNNER', 'RUNWAY', 'RURAL',
  'SACRED', 'SADDLE', 'SAFELY', 'SAFETY', 'SAILING', 'SAINT', 'SAKE', 'SALAD',
  'SALARY', 'SALMON', 'SALUTE', 'SAMPLE', 'SANCTION', 'SANDAL', 'SAPPHIRE',
  'SATISFY', 'SAUCE', 'SAVING', 'SAVOR', 'SCALE', 'SCAN', 'SCANDAL', 'SCARCE',
  'SCATTER', 'SCENE', 'SCHEDULE', 'SCHEME', 'SCHOLAR', 'SCHOOL', 'SCIENCE',
  'SCISSORS', 'SCOPE', 'SCORE', 'SCOUT', 'SCRAMBLE', 'SCRAP', 'SCREEN',
  'SCRIPT', 'SCROLL', 'SCRUTINY', 'SEAL', 'SEARCH', 'SEASON', 'SECOND',
  'SECRET', 'SECTION', 'SECTOR', 'SECURE', 'SEED', 'SEEK', 'SEGMENT',
  'SELECT', 'SELF', 'SELLER', 'SENATE', 'SENIOR', 'SENSE', 'SENSOR',
  'SENTENCE', 'SEPARATE', 'SEQUENCE', 'SERIES', 'SERVANT', 'SERVER', 'SERVICE',
  'SESSION', 'SETTLE', 'SETTLEMENT', 'SEVERE', 'SEWING', 'SHADOW', 'SHAKE',
  'SHALL', 'SHAME', 'SHAMPOO', 'SHAPE', 'SHARE', 'SHARK', 'SHARP', 'SHATTER',
  'SHAVEN', 'SHAWL', 'SHEER', 'SHEET', 'SHELF', 'SHELL', 'SHELTER', 'SHIELD',
  'SHIFT', 'SHINE', 'SHIPMENT', 'SHIRT', 'SHOCK', 'SHOE', 'SHOOT', 'SHOPPER',
  'SHORE', 'SHORTLY', 'SHOT', 'SHOULDER', 'SHOUT', 'SHOVEL', 'SHOWER',
  'SHRINK', 'SHUTTLE', 'SIBLING', 'SICKNESS', 'SIDE', 'SIEGE', 'SIGHT',
  'SIGNAL', 'SILENCE', 'SILICON', 'SILK', 'SILLY', 'SILVER', 'SIMILAR',
  'SIMPLE', 'SIMPLIFY', 'SINCERE', 'SINGER', 'SINGLE', 'SINK', 'SISTER',
  'SITUATION', 'SIXTEEN', 'SIXTH', 'SIZE', 'SKETCH', 'SKIING', 'SKILL',
  'SKIN', 'SKIP', 'SKULL', 'SKY', 'SLAM', 'SLAVE', 'SLEEP', 'SLICE',
  'SLIDE', 'SLIGHT', 'SLIM', 'SLIP', 'SLOPE', 'SMALL', 'SMART', 'SMELL',
  'SMILE', 'SMOKE', 'SMOOTH', 'SNAKE', 'SNAP', 'SNEAK', 'SNOW', 'SOAK',
  'SOAP', 'SOCIAL', 'SOCKET', 'SOFA', 'SOFTEN', 'SOFTLY', 'SOLAR', 'SOLDIER',
  'SOLEMN', 'SOLICIT', 'SOLID', 'SOLO', 'SOLUTION', 'SOMEHOW', 'SOMEONE',
  'SOMETHING', 'SOMETIME', 'SOMEWHAT', 'SONIC', 'SOON', 'SORROW', 'SORRY',
  'SOUL', 'SOUND', 'SOURCE', 'SOUTH', 'SOUVENIR', 'SPACE', 'SPADE', 'SPAN',
  'SPARE', 'SPARK', 'SPATIAL', 'SPEAK', 'SPEAKER', 'SPECIAL', 'SPECIES',
  'SPECIFY', 'SPEECH', 'SPEED', 'SPELL', 'SPHERE', 'SPICE', 'SPIDER',
  'SPINAL', 'SPINNER', 'SPIRAL', 'SPIRIT', 'SPLASH', 'SPLIT', 'SPOKEN',
  'SPONGE', 'SPONSOR', 'SPOON', 'SPORT', 'SPOT', 'SPRAY', 'SPREAD',
  'SPRING', 'SQUARE', 'SQUEEZE', 'STABILITY', 'STABLE', 'STADIUM', 'STAFF',
  'STAGE', 'STAIN', 'STAIRCASE', 'STAKE', 'STALE', 'STALL', 'STAMP',
  'STANCE', 'STAND', 'STANDARD', 'STAPLE', 'STAR', 'STARE', 'STARK',
  'START', 'STARVE', 'STATE', 'STATIC', 'STATION', 'STATUE', 'STATUS',
  'STAY', 'STEADY', 'STEAL', 'STEAM', 'STEEL', 'STEEP', 'STEER', 'STEM',
  'STEP', 'STEREO', 'STERN', 'STEWARD', 'STICK', 'STIFF', 'STILL',
  'STIMULUS', 'STING', 'STIR', 'STITCH', 'STOCK', 'STOMACH', 'STONE',
  'STOOP', 'STOP', 'STORAGE', 'STORE', 'STORM', 'STORY', 'STOVE',
  'STRAIGHT', 'STRAIN', 'STRAND', 'STRANGE', 'STRANGER', 'STRATEGY', 'STRAW',
  'STRAY', 'STREAM', 'STREET', 'STRENGTH', 'STRESS', 'STRETCH', 'STRICKEN',
  'STRICT', 'STRIDE', 'STRIKE', 'STRING', 'STRIP', 'STRIPE', 'STRIVE',
  'STROKE', 'STRONG', 'STRUCTURE', 'STRUGGLE', 'STUDENT', 'STUDIO', 'STUDY',
  'STUFF', 'STUMBLE', 'STYLE', 'SUBJECT', 'SUBMIT', 'SUBSCRIBE', 'SUBSTANCE',
  'SUBSTITUTE', 'SUBTLE', 'SUBURB', 'SUCCEED', 'SUCCESS', 'SUCK', 'SUFFER',
  'SUFFICIENT', 'SUGAR', 'SUGGEST', 'SUIT', 'SUITE', 'SULPHUR', 'SUMMIT',
  'SUNLIGHT', 'SUNNY', 'SUNSET', 'SUPERB', 'SUPERIOR', 'SUPPLY', 'SUPPORT',
  'SUPPOSE', 'SUPREME', 'SURELY', 'SURFACE', 'SURGE', 'SURGERY', 'SURPLUS',
  'SURPRISE', 'SURRENDER', 'SURROUND', 'SURVEY', 'SURVIVE', 'SUSPECT', 'SUSPEND',
  'SUSTAIN', 'SWALLOW', 'SWAMP', 'SWAP', 'SWARM', 'SWAY', 'SWEAR', 'SWEAT',
  'SWEEP', 'SWEET', 'SWELL', 'SWIFT', 'SWIM', 'SWING', 'SWITCH', 'SWORD',
  'SYMBOL', 'SYMPATHY', 'SYMPTOM', 'SYNDROME', 'SYSTEM', 'TABLE', 'TABLET',
  'TACKLE', 'TACTIC', 'TAIL', 'TAILOR', 'TAKEOVER', 'TALENT', 'TALK',
  'TANDEM', 'TANGIBLE', 'TANK', 'TAP', 'TAPE', 'TARGET', 'TARIFF', 'TASK',
  'TASTE', 'TAXATION', 'TAXI', 'TEACHER', 'TEAM', 'TEAR', 'TEASPOON',
  'TECHNIQUE', 'TECHNOLOGY', 'TEENAGE', 'TEMPLE', 'TEMPO', 'TEMPORARY',
  'TEMPT', 'TENDENCY', 'TENDER', 'TENNIS', 'TENSION', 'TENT', 'TERM',
  'TERMINAL', 'TERMS', 'TERRAIN', 'TERRIBLE', 'TERRIFY', 'TERROR', 'TESTIFY',
  'TESTIMONY', 'TESTING', 'TEXTBOOK', 'TEXTILE', 'TEXTURE', 'THANKFUL',
  'THEATER', 'THEFT', 'THEME', 'THEORY', 'THERAPY', 'THICK', 'THIEF',
  'THIGH', 'THIN', 'THINK', 'THIRST', 'THORN', 'THOROUGH', 'THOUGHT',
  'THREAD', 'THREAT', 'THRILL', 'THRIVE', 'THROAT', 'THRONE', 'THROUGH',
  'THROW', 'THRUST', 'THUMB', 'THUNDER', 'TICKET', 'TIDAL', 'TIDE',
  'TIGER', 'TIGHT', 'TIMBER', 'TIMELY', 'TINY', 'TIP', 'TISSUE',
  'TITLE', 'TOAST', 'TOBACCO', 'TODAY', 'TOILET', 'TOKEN', 'TOLERATE',
  'TOLL', 'TOMATO', 'TONGUE', 'TONIGHT', 'TOOL', 'TOOTH', 'TOPIC',
  'TORCH', 'TORNADO', 'TORQUE', 'TORSO', 'TOTAL', 'TOUCH', 'TOUGH',
  'TOURISM', 'TOURIST', 'TOURNAMENT', 'TOWEL', 'TOWER', 'TOXIC', 'TOY',
  'TRACE', 'TRACK', 'TRADE', 'TRADITION', 'TRAFFIC', 'TRAGEDY', 'TRAIL',
  'TRAILER', 'TRAIN', 'TRAIT', 'TRANSFER', 'TRANSFORM', 'TRANSITION', 'TRANSMIT',
  'TRANSPORT', 'TRAP', 'TRASH', 'TRAVEL', 'TRAY', 'TREASURE', 'TREAT',
  'TREATMENT', 'TREATY', 'TREE', 'TREMBLE', 'TREMENDOUS', 'TREND', 'TRIAL',
  'TRIANGLE', 'TRIBE', 'TRIBUNAL', 'TRICK', 'TRIGGER', 'TRIM', 'TRIP',
  'TRIUMPH', 'TROPHY', 'TROPICAL', 'TROUBLE', 'TRUCK', 'TRULY', 'TRUMPET',
  'TRUNK', 'TRUST', 'TRUTH', 'TRYING', 'TUBE', 'TUCK', 'TUITION',
  'TUMBLE', 'TUNE', 'TUNNEL', 'TURBINE', 'TURMOIL', 'TURN', 'TURNOVER',
  'TURTLE', 'TUTOR', 'TWICE', 'TWILIGHT', 'TWIN', 'TWIST', 'TYPE',
  'TYPICAL', 'UGLY', 'ULTIMATE', 'UMBRELLA', 'UNABLE', 'UNAWARE', 'UNBELIEVABLE',
  'UNCERTAIN', 'UNCHANGED', 'UNCLE', 'UNCOVER', 'UNDERGO', 'UNDERSTAND',
  'UNDERTAKE', 'UNIFORM', 'UNION', 'UNIQUE', 'UNIT', 'UNIVERSE', 'UNIVERSITY',
  'UNKNOWN', 'UNLESS', 'UNLIKE', 'UNLIKELY', 'UNLOCK', 'UNUSUAL', 'UPDATE',
  'UPGRADE', 'UPHOLD', 'UPON', 'UPPER', 'UPSET', 'URBAN', 'URGE',
  'URGENCY', 'USABLE', 'USAGE', 'USEFUL', 'USER', 'USUAL', 'UTILITY',
  'UTMOST', 'UTTER', 'VACANT', 'VACATION', 'VAGUE', 'VALID', 'VALLEY',
  'VALUABLE', 'VALUE', 'VANISH', 'VARIABLE', 'VARIATION', 'VARIETY', 'VARIOUS',
  'VARYING', 'VAST', 'VEGETABLE', 'VEHICLE', 'VELVET', 'VENTURE', 'VENUE',
  'VERBAL', 'VERDICT', 'VERSION', 'VERSUS', 'VERTICAL', 'VESSEL', 'VEST',
  'VETERAN', 'VIABLE', 'VIBRANT', 'VICTIM', 'VICTORY', 'VIDEO', 'VIEWER',
  'VIGOR', 'VILLAGE', 'VINTAGE', 'VIOLATE', 'VIOLENCE', 'VIOLET', 'VIRTUAL',
  'VIRTUE', 'VISION', 'VISITOR', 'VISUAL', 'VITAL', 'VIVID', 'VOCAL',
  'VOCATION', 'VOICE', 'VOLCANO', 'VOLUME', 'VOLUNTEER', 'VORTEX', 'VOTE',
  'VOTING', 'VOYAGE', 'WAGE', 'WAGON', 'WAITING', 'WAKE', 'WALKER',
  'WALLET', 'WANDER', 'WANTED', 'WARFARE', 'WARMTH', 'WARNING', 'WARRANT',
  'WARRIOR', 'WARY', 'WASHER', 'WASTE', 'WATCH', 'WATER', 'WAVE',
  'WAVER', 'WAX', 'WEALTH', 'WEAPON', 'WEARY', 'WEATHER', 'WEAVING',
  'WEB', 'WEDDING', 'WEED', 'WEEKEND', 'WEEKLY', 'WEIGHT', 'WEIRD',
  'WELCOME', 'WELFARE', 'WELLNESS', 'WESTERN', 'WET', 'WHALE', 'WHEAT',
  'WHEEL', 'WHEREAS', 'WHETHER', 'WHISPER', 'WHISTLE', 'WHOLE', 'WHOLESOME',
  'WICKED', 'WIDE', 'WIDEN', 'WIDOW', 'WIDTH', 'WIELD', 'WIFE',
  'WILDERNESS', 'WILLING', 'WIN', 'WINDOW', 'WINDY', 'WINE', 'WING',
  'WINNER', 'WINTER', 'WIPE', 'WIRE', 'WISDOM', 'WISE', 'WISH',
  'WITHDRAW', 'WITHHOLD', 'WITHIN', 'WITHOUT', 'WITNESS', 'WOMAN', 'WONDER',
  'WOOD', 'WOODEN', 'WOOL', 'WORD', 'WORKER', 'WORLD', 'WORM',
  'WORRIED', 'WORRY', 'WORSE', 'WORSHIP', 'WORST', 'WORTH', 'WORTHWHILE',
  'WORTHY', 'WOULD', 'WOUND', 'WRAP', 'WRATH', 'WRIST', 'WRITER',
  'WRITING', 'WRONG', 'YARD', 'YARN', 'YEAH', 'YEARLY', 'YELLOW',
  'YES', 'YESTERDAY', 'YET', 'YIELD', 'YOUNG', 'YOUTH', 'ZEAL',
  'ZEBRA', 'ZERO', 'ZONE', 'ZOOM',
];

function getLetterCounts(word) {
  const counts = {};
  for (const ch of word) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  return counts;
}

function canForm(available, target) {
  const avail = { ...available };
  for (const ch of target) {
    if (!avail[ch]) return false;
    avail[ch]--;
  }
  return true;
}

export default function WordScramSolvePage() {
  const { addEntry } = useHistory();
  const [letters, setLetters] = useState('');
  const [results, setResults] = useState(null);
  const [minLen, setMinLen] = useState(3);

  const solve = useCallback(() => {
    const input = letters.trim().toUpperCase();
    if (!input) return;
    addEntry('Word Scramble Solver');
    const counts = getLetterCounts(input);
    const found = WORDS.filter(w => w.length >= minLen && w.length <= input.length && canForm(counts, w));
    found.sort((a, b) => b.length - a.length || a.localeCompare(b));
    setResults(found);
  }, [letters, minLen, addEntry]);

  const byLength = useMemo(() => {
    if (!results) return null;
    const groups = {};
    results.forEach(w => {
      const len = w.length;
      if (!groups[len]) groups[len] = [];
      groups[len].push(w);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [results]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🔤</span>
        <h1 className="font-heading text-2xl font-bold text-text">Word Scramble Solver</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Enter scrambled letters</label>
            <div className="flex gap-2">
              <input value={letters} onChange={e => setLetters(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && solve()}
                placeholder="e.g. lepmxa"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors uppercase" />
              <button onClick={solve} disabled={!letters.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
                Solve
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Min word length: {minLen}</label>
            <input type="range" min={2} max={8} value={minLen} onChange={e => setMinLen(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>
        </div>
      </GlassCard>

      {results !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="text-xs text-text-tertiary mb-3">
                Found <span className="text-text font-semibold">{results.length}</span> words
              </div>
              {results.length === 0 ? (
                <p className="text-xs text-cat-text">No words found. Try different letters or lower minimum length.</p>
              ) : (
                <div className="space-y-3">
                  {byLength.map(([len, words]) => (
                    <div key={len}>
                      <div className="text-xs text-text-tertiary mb-1">{len} letters ({words.length})</div>
                      <div className="flex flex-wrap gap-1.5">
                        {words.map(w => (
                          <span key={w} className="px-2 py-1 text-xs font-mono bg-surface rounded-lg border border-border/50 text-text">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
