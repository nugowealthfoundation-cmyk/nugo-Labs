import { useState, useRef, useEffect } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:"#07090f", card:"#0e1320", cardBorder:"#1a2640",
  accent:"#00c896", accentSoft:"#00c89618",
  gold:"#f5b731",   goldSoft:"#f5b73118",
  red:"#f04060",    redSoft:"#f0406018",
  blue:"#3d9eff",   blueSoft:"#3d9eff18",
  purple:"#a875f0", purpleSoft:"#a875f018",
  orange:"#ff7c3a", orangeSoft:"#ff7c3a18",
  teal:"#00d4d4",   tealSoft:"#00d4d418",
  text:"#ddeeff", textMuted:"#7a90b0", textDim:"#374a66",
};

const MONTH_NAMES=["January","February","March","April","May","June"];

const MARKETING_BOOSTS={0:8,100:16,250:28,500:44};

const BUSINESS_TYPES=[
  {id:"food",    label:"🍔 Food Business",   examples:"Burgers, snacks, meal prep, catering",  price:12, supplies:300},
  {id:"clothing",label:"👕 Clothing Brand",  examples:"T-shirts, hats, custom prints",         price:25, supplies:500},
  {id:"lawn",    label:"🌿 Lawn Care",       examples:"Mowing, trimming, landscaping",          price:40, supplies:150},
  {id:"digital", label:"💻 Digital Service", examples:"Design, tutoring, social media mgmt",    price:50, supplies:50 },
];

const ALL_EVENTS=[
  {id:"supplier", emoji:"📦",title:"Supplier Price Surge",     desc:"Wholesale costs jumped unexpectedly.",           effect:"expenses",  value:0.12, label:"+12% Expenses",    color:P.red   },
  {id:"complaint",emoji:"😤",title:"Customer Complaint",       desc:"A public bad review scared buyers away.",        effect:"customers", value:-6,   label:"−6 Customers",     color:P.red   },
  {id:"viral",    emoji:"🔥",title:"Went Viral!",              desc:"A social post exploded overnight.",              effect:"customers", value:22,   label:"+22 Customers",    color:P.accent},
  {id:"equipment",emoji:"🔧",title:"Equipment Breakdown",      desc:"Emergency repair bill hit hard.",                effect:"cash",      value:-350, label:"−$350 Repair",     color:P.red   },
  {id:"grant",    emoji:"🏆",title:"Grant Awarded!",           desc:"Local small-business grant came through.",       effect:"cash",      value:600,  label:"+$600 Cash",       color:P.gold  },
  {id:"latepay",  emoji:"⏳",title:"Late Client Payment",      desc:"Client finally paid — but it was overdue.",      effect:"cash",      value:-200, label:"−$200 Delayed",    color:P.purple},
  {id:"referral", emoji:"🤝",title:"Referral Wave",            desc:"Happy customers brought their networks in.",     effect:"customers", value:13,   label:"+13 Customers",    color:P.accent},
  {id:"tax",      emoji:"📋",title:"Quarterly Tax Notice",     desc:"Estimated taxes are due this month.",            effect:"cash",      value:-175, label:"−$175 Taxes",      color:P.red   },
  {id:"weather",  emoji:"🌧️",title:"Bad Weather Week",         desc:"Foot traffic dried up for a whole week.",        effect:"customers", value:-8,   label:"−8 Customers",     color:P.blue  },
  {id:"collab",   emoji:"🌟",title:"Free Brand Collab",        desc:"A local brand shared your promo at no cost.",    effect:"customers", value:15,   label:"+15 Customers",    color:P.accent},
  {id:"theft",    emoji:"🚨",title:"Inventory Theft",          desc:"Stock went missing — painful cash loss.",        effect:"cash",      value:-250, label:"−$250 Stolen",     color:P.red   },
  {id:"festival", emoji:"🎉",title:"Local Festival Boost",     desc:"A nearby event flooded you with walk-ins.",      effect:"customers", value:18,   label:"+18 Customers",    color:P.gold  },
  {id:"returns",  emoji:"↩️",title:"Product Returns Spike",    desc:"Refunds cut into this month's cash.",            effect:"cash",      value:-180, label:"−$180 Refunds",    color:P.orange},
  {id:"review",   emoji:"⭐",title:"5-Star Press Feature",     desc:"A local blog named you a top pick.",             effect:"customers", value:14,   label:"+14 Customers",    color:P.accent},
  {id:"rate",     emoji:"📈",title:"Interest Rate Hike",       desc:"Your loan payment went up this month.",          effect:"cash",      value:-100, label:"−$100 Rate Hike",  color:P.red   },
  {id:"contest",  emoji:"🥇",title:"Business Contest Win",     desc:"Cash prize from a local competition.",           effect:"cash",      value:400,  label:"+$400 Prize",      color:P.gold  },
  {id:"partner",  emoji:"🤜",title:"Partnership Revenue",      desc:"Partner paid a flat fee for cross-promo.",       effect:"cash",      value:300,  label:"+$300 Deal",       color:P.accent},
  {id:"shipping", emoji:"🚚",title:"Shipping Delay",           desc:"Late inventory — sales opportunities missed.",   effect:"customers", value:-10,  label:"−10 Customers",    color:P.orange},
  {id:"recession",emoji:"📉",title:"Local Economic Slowdown",  desc:"Customers pulled back spending this month.",     effect:"customers", value:-7,   label:"−7 Customers",     color:P.red   },
  {id:"loyalty",  emoji:"💳",title:"Loyalty Program Win",      desc:"Repeat buyers ordered more than expected.",      effect:"cash",      value:250,  label:"+$250 Loyalty",    color:P.gold  },
];

const DICE_FACES=["⚀","⚁","⚂","⚃","⚄","⚅"];

// Rounds: 1 Setup, 2 Pricing, 3 Marketing, 4-9 = Month 1-6 (ops each), 10 = Audit
const ROUNDS=[
  {num:1,  icon:"🚀", title:"Business Setup",         tag:"setup",  desc:"Name your business, pick funding & team"},
  {num:2,  icon:"💰", title:"Pricing Strategy",        tag:"setup",  desc:"Set your price and revenue goal"},
  {num:3,  icon:"📣", title:"Marketing Plan",          tag:"setup",  desc:"Choose your advertising budget"},
  {num:4,  icon:"📅", title:"January — Month 1",       tag:"ops",    desc:"Run Month 1 operations & roll for events"},
  {num:5,  icon:"📅", title:"February — Month 2",      tag:"ops",    desc:"Run Month 2 operations & roll for events"},
  {num:6,  icon:"📅", title:"March — Month 3",         tag:"ops",    desc:"Quarter 1 complete — roll for events"},
  {num:7,  icon:"📅", title:"April — Month 4",         tag:"ops",    desc:"Run Month 4 operations & roll for events"},
  {num:8,  icon:"📅", title:"May — Month 5",           tag:"ops",    desc:"Run Month 5 operations & roll for events"},
  {num:9,  icon:"📅", title:"June — Month 6",          tag:"ops",    desc:"Final month — last dice roll of the year"},
  {num:10, icon:"🔍", title:"Full Audit Simulation",   tag:"audit",  desc:"Trial Balance → Statements → Audit Opinion"},
];

const fmt  = n => "$" + Math.abs(Math.round(n)).toLocaleString();
const fmtS = n => (n >= 0 ? "+" : "−") + fmt(n);
const pct  = (a,b) => b === 0 ? "0%" : Math.round((a/b)*100)+"%";


function calcScores(ops){
  if(!ops.length) return {profit:0,cash:0,debt:0,growth:0,decisions:0,total:0};
  const avg = ops.reduce((a,r)=>a+(r.profit||0),0)/ops.length;
  const profit    = Math.min(100,Math.max(0,Math.round(50+avg/20)));
  const lastCash  = ops[ops.length-1].cashEnd||0;
  const cash      = Math.min(100,Math.max(0,Math.round(Math.min(100,lastCash/30))));
  const lastDebt  = ops[ops.length-1].debt||0;
  const debt      = Math.min(100,Math.max(0,Math.round(100-lastDebt/50)));
  const cg        = ops.length>1?(ops[ops.length-1].customers||0)-(ops[0].customers||0):0;
  const growth    = Math.min(100,Math.max(0,Math.round(50+cg*1.5)));
  const decisions = Math.min(100,Math.max(0,Math.round(ops.reduce((a,r)=>a+(r.mktBudget>0?18:4)+(r.profit>0?20:0),0)/ops.length)));
  const total     = Math.round((profit+cash+debt+growth+decisions)/5);
  return {profit,cash,debt,growth,decisions,total};
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Card({children,style={},glow,onClick}){
  return <div onClick={onClick} style={{background:P.card,border:`1px solid ${glow||P.cardBorder}`,borderRadius:16,
    padding:22,boxShadow:glow?`0 0 32px ${glow}33`:"0 2px 20px #00000055",cursor:onClick?"pointer":undefined,...style}}>{children}</div>;
}
function Badge({children,color=P.accent,size="sm"}){
  const fs=size==="lg"?13:11;
  return <span style={{background:color+"28",color,border:`1px solid ${color}44`,borderRadius:99,
    padding:size==="lg"?"4px 14px":"2px 10px",fontSize:fs,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
}
function Stat({label,value,color=P.accent,sm}){
  return(
    <div style={{textAlign:"center"}}>
      <div style={{color,fontSize:sm?16:20,fontWeight:800,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{value}</div>
      <div style={{color:P.textMuted,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{label}</div>
    </div>
  );
}
function PBar({pct:p,color=P.accent,h=8}){
  return(
    <div style={{background:"#151f35",borderRadius:99,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min(100,Math.max(0,p))}%`,height:"100%",background:color,borderRadius:99,transition:"width 1s cubic-bezier(.4,2,.6,1)"}}/>
    </div>
  );
}
function Inp({label,value,onChange,type="text",pre,suf,hint}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
      {hint&&<div style={{color:P.textDim,fontSize:10,marginTop:-3}}>{hint}</div>}
      <div style={{display:"flex",alignItems:"center",background:"#080c18",border:`1px solid ${P.cardBorder}`,borderRadius:9,overflow:"hidden"}}>
        {pre&&<span style={{color:P.textMuted,padding:"9px 11px",background:"#111825",fontSize:12,borderRight:`1px solid ${P.cardBorder}`}}>{pre}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)}
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:P.text,padding:"9px 13px",fontSize:14,fontFamily:"'Space Mono',monospace"}}/>
        {suf&&<span style={{color:P.textMuted,padding:"9px 11px",fontSize:11}}>{suf}</span>}
      </div>
    </div>
  );
}
function Btn({children,onClick,v="primary",sz="md",disabled}){
  const styles={
    primary:{bg:P.accent,   fg:"#060a12"},
    gold:   {bg:P.gold,     fg:"#060a12"},
    ghost:  {bg:"transparent",fg:P.accent,br:`1px solid ${P.accent}55`},
    purple: {bg:P.purple,   fg:"#fff"},
    red:    {bg:P.red,      fg:"#fff"},
    blue:   {bg:P.blue,     fg:"#060a12"},
    teal:   {bg:P.teal,     fg:"#060a12"},
  };
  const s=styles[v]||styles.primary;
  const pad=sz==="lg"?"13px 30px":sz==="xl"?"16px 40px":sz==="sm"?"6px 14px":"9px 20px";
  return(
    <button onClick={onClick} disabled={disabled} style={{
      background:s.bg,color:s.fg,border:s.br||`1px solid ${s.bg}`,borderRadius:10,
      padding:pad,fontWeight:800,fontSize:sz==="xl"?16:sz==="lg"?14:12,
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.35:1,
      transition:"opacity 0.2s,transform 0.1s",fontFamily:"'Space Mono',monospace",letterSpacing:0.3,
    }}>{children}</button>
  );
}

// ─── Dice Roller — 2 dice, sum (2–12) maps to 1 event automatically ───────────
// Die sum → event index mapping (20 events, sums 2-12 distributed across them)
// 2→0, 3→1, 4→2, 5→3, 6→4, 7→5, 8→6, 9→7, 10→8, 11→9, 12→10,
// re-rolling or using month offset to pick from upper half if needed
function sumToEventIndex(sum, monthOffset){
  // sum 2-12 (11 values) → spread across 20 events using month as secondary seed
  const base = sum - 2; // 0-10
  const idx = (base * 2 + monthOffset) % ALL_EVENTS.length;
  return idx;
}

function DiceRoller({onRolled, locked, monthIdx}){
  const [dice, setDice]   = useState([null, null]);
  const [phase, setPhase] = useState("idle"); // idle | rolling | reveal | done
  const [sum, setSum]     = useState(null);
  const [revealEv, setRevealEv] = useState(null); // event being revealed (face-down → flip)
  const [flipped, setFlipped]   = useState(false);
  const iv  = useRef(null);
  const n   = useRef(0);

  const roll = () => {
    if (locked || phase !== "idle") return;
    setPhase("rolling"); n.current = 0;
    iv.current = setInterval(() => {
      setDice([Math.floor(Math.random()*6), Math.floor(Math.random()*6)]);
      n.current++;
      if (n.current >= 20) {
        clearInterval(iv.current);
        const d1 = Math.floor(Math.random()*6);
        const d2 = Math.floor(Math.random()*6);
        const finalDice = [d1, d2];
        const total = d1 + d2 + 2; // 2-12
        setDice(finalDice);
        setSum(total);
        setPhase("reveal");
        // short pause then flip card
        const evIdx = sumToEventIndex(total, monthIdx||0);
        const ev = ALL_EVENTS[evIdx];
        setRevealEv(ev);
        setTimeout(() => setFlipped(true), 600);
        setTimeout(() => { setPhase("done"); onRolled(ev, finalDice, total); }, 1800);
      }
    }, 65);
  };

  useEffect(() => () => clearInterval(iv.current), []);

  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:16}}>
      {/* Two dice */}
      <div style={{display:"flex", gap:20, alignItems:"center"}}>
        {[0,1].map(i => (
          <div key={i} style={{
            width:74, height:74, borderRadius:14, fontSize:42,
            display:"flex", alignItems:"center", justifyContent:"center",
            border:`2px solid ${phase==="done"||phase==="reveal" ? P.gold : phase==="rolling" ? P.purple : P.cardBorder}`,
            background: phase==="done"||phase==="reveal" ? P.goldSoft : phase==="rolling" ? P.purpleSoft : P.card,
            boxShadow: phase==="done"||phase==="reveal" ? `0 0 22px ${P.gold}66` : phase==="rolling" ? `0 0 16px ${P.purple}55` : "none",
            animation: phase==="rolling" ? "diceShake 0.07s infinite" : "none",
            transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
          }}>
            {dice[i] !== null ? DICE_FACES[dice[i]] : "·"}
          </div>
        ))}
        {sum && (
          <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:3}}>
            <div style={{color:P.textDim, fontSize:10, textTransform:"uppercase", letterSpacing:1}}>Sum</div>
            <div style={{color:P.gold, fontSize:28, fontWeight:900, fontFamily:"'Space Mono',monospace",
              textShadow:`0 0 16px ${P.gold}88`}}>{sum}</div>
          </div>
        )}
      </div>

      {/* State labels */}
      {phase==="idle"   && <Btn v="purple" sz="lg" onClick={roll} disabled={locked}>🎲 Roll 2 Dice</Btn>}
      {phase==="rolling"&& <div style={{color:P.purple, fontWeight:800, fontSize:13, animation:"pulse 0.45s infinite"}}>Rolling…</div>}

      {/* Card flip reveal */}
      {(phase==="reveal"||phase==="done") && revealEv && (
        <div style={{width:"100%", marginTop:4}}>
          <div style={{color:P.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10, textAlign:"center"}}>
            🎴 Your Roll → Event Card
          </div>
          <div style={{
            perspective:800,
            transformStyle:"preserve-3d",
            transition:"transform 0.7s cubic-bezier(.4,0,.2,1)",
          }}>
            {!flipped ? (
              /* Face-down card */
              <div style={{
                background:"linear-gradient(135deg,#1a1030,#0e1828)",
                border:`2px solid ${P.purple}88`,
                borderRadius:16, padding:"20px 18px",
                display:"flex", alignItems:"center", justifyContent:"center",
                minHeight:80, animation:"pulse 0.6s infinite",
              }}>
                <div style={{fontSize:36}}>🎴</div>
                <div style={{color:P.purple, fontWeight:800, fontSize:14, marginLeft:12}}>Revealing…</div>
              </div>
            ) : (
              /* Revealed card — auto-applied, no click needed */
              <div style={{
                background: revealEv.color+"22",
                border:`2px solid ${revealEv.color}`,
                borderRadius:16, padding:"16px 18px",
                display:"flex", alignItems:"center", gap:14,
                boxShadow:`0 0 28px ${revealEv.color}55`,
                animation:"cardReveal 0.4s ease",
              }}>
                <span style={{fontSize:34, flexShrink:0}}>{revealEv.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                    <div style={{color:revealEv.color, fontWeight:900, fontSize:15}}>{revealEv.title}</div>
                    <Badge color={revealEv.color}>{revealEv.label}</Badge>
                  </div>
                  <div style={{color:P.textMuted, fontSize:12}}>{revealEv.desc}</div>
                </div>
                <div style={{flexShrink:0, textAlign:"center"}}>
                  <div style={{color:revealEv.color, fontSize:11, fontWeight:800}}>AUTO</div>
                  <div style={{color:revealEv.color, fontSize:10}}>APPLIED</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Round 1: Setup ───────────────────────────────────────────────────────────
function SetupRound({onDone}){
  const [bt,setBt]=useState("food");
  const [name,setName]=useState("");
  const [cash,setCash]=useState(1500);
  const [loan,setLoan]=useState(false);
  const [loanAmt,setLoanAmt]=useState(1000);
  const [solo,setSolo]=useState(true);
  const bizType=BUSINESS_TYPES.find(b=>b.id===bt);
  const total=+cash+(loan?+loanAmt:0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {BUSINESS_TYPES.map(b=>(
          <div key={b.id} onClick={()=>setBt(b.id)}
            style={{background:bt===b.id?P.accentSoft:"#0a0e1a",border:`2px solid ${bt===b.id?P.accent:P.cardBorder}`,
              borderRadius:12,padding:"13px 15px",cursor:"pointer",transition:"all 0.13s"}}>
            <div style={{fontSize:15,fontWeight:700}}>{b.label}</div>
            <div style={{color:P.textMuted,fontSize:11,marginTop:3}}>{b.examples}</div>
          </div>
        ))}
      </div>
      <Inp label="Business Name" value={name} onChange={setName} hint="Give your business a memorable name"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Starting Cash" value={cash} onChange={setCash} type="number" pre="$"/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Team</label>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            {[["Solo Owner",""],["+ Employee","+$400/mo"]].map(([l,s],i)=>(
              <div key={i} onClick={()=>setSolo(i===0)}
                style={{flex:1,textAlign:"center",padding:"9px 6px",borderRadius:9,cursor:"pointer",
                  border:`2px solid ${solo===(i===0)?P.accent:P.cardBorder}`,
                  background:solo===(i===0)?P.accentSoft:"#0a0e1a",fontSize:11,transition:"all 0.13s"}}>
                <div style={{color:P.text,fontWeight:700}}>{l}</div>
                {s&&<div style={{color:P.red,fontSize:10,marginTop:2}}>{s}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div onClick={()=>setLoan(!loan)}
            style={{width:42,height:22,borderRadius:99,background:loan?P.accent:P.cardBorder,cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
            <div style={{position:"absolute",top:3,left:loan?22:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </div>
          <span style={{color:P.text,fontWeight:700,fontSize:13}}>Take a Startup Loan</span>
          {loan&&<Badge color={P.red}>10%/mo Interest</Badge>}
        </div>
        {loan&&<Inp label="Loan Amount" value={loanAmt} onChange={setLoanAmt} type="number" pre="$"/>}
      </div>
      <Card style={{background:"#080c18"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          <Stat label="Your Cash"    value={fmt(cash)}  color={P.accent}/>
          <Stat label="Loan"         value={loan?fmt(loanAmt):"None"} color={loan?P.red:P.textMuted}/>
          <Stat label="Total Capital" value={fmt(total)} color={P.gold}/>
        </div>
      </Card>
      <Btn sz="lg" onClick={()=>{
        if(!name.trim()) return alert("Your business needs a name!");
        onDone({bizType:bt,bizLabel:bizType.label,name,startCash:+cash,loan,loanAmt:loan?+loanAmt:0,solo,totalCash:total,
          defaultPrice:bizType.price,defaultSupplies:bizType.supplies});
      }}>Round 2: Set Your Price →</Btn>
    </div>
  );
}

// ─── Round 2: Pricing ─────────────────────────────────────────────────────────
function PricingRound({biz,onDone}){
  const [price,setPrice]=useState(biz.defaultPrice);
  const [goal,setGoal]=useState(20);
  const rev=Math.round(+price*+goal);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <Card style={{background:"#080c18"}}>
        <p style={{margin:0,color:P.text,fontSize:13,lineHeight:1.75}}>
          Higher price = more revenue per transaction, fewer buyers. Lower price = more buyers, thinner margins.
          Set strategically for <strong style={{color:P.accent}}>{biz.name}</strong> over a <strong style={{color:P.gold}}>6-month run</strong>.
        </p>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Price per Sale" value={price} onChange={setPrice} type="number" pre="$" hint={`Suggested: $${biz.defaultPrice}`}/>
        <Inp label="Monthly Customer Goal" value={goal} onChange={setGoal} type="number" suf="customers"/>
      </div>
      <Card style={{background:P.accentSoft,border:`1px solid ${P.accent}44`}}>
        <div style={{textAlign:"center"}}>
          <div style={{color:P.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>Monthly Revenue Goal</div>
          <div style={{color:P.accent,fontSize:32,fontWeight:900,fontFamily:"'Space Mono',monospace",margin:"7px 0"}}>{fmt(rev)}</div>
          <div style={{color:P.textMuted,fontSize:12}}>{goal} customers × {fmt(price)} each</div>
          <div style={{color:P.textDim,fontSize:11,marginTop:6}}>6-month target: {fmt(rev*6)}</div>
        </div>
      </Card>
      <Btn sz="lg" onClick={()=>onDone({price:+price,custGoal:+goal,monthlyRevenueGoal:rev})}>Round 3: Plan Marketing →</Btn>
    </div>
  );
}

// ─── Round 3: Marketing ───────────────────────────────────────────────────────
function MarketingRound({biz,onDone}){
  const [budget,setBudget]=useState(100);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[0,100,250,500].map(b=>{
          const boost=MARKETING_BOOSTS[b]; const sel=budget===b;
          return(
            <div key={b} onClick={()=>setBudget(b)}
              style={{background:sel?P.accentSoft:"#0a0e1a",border:`2px solid ${sel?P.accent:P.cardBorder}`,
                borderRadius:13,padding:16,cursor:"pointer",transition:"all 0.13s",position:"relative"}}>
              {sel&&<span style={{position:"absolute",top:9,right:12,color:P.accent,fontSize:15}}>✓</span>}
              <div style={{color:sel?P.accent:P.text,fontSize:19,fontWeight:900,fontFamily:"'Space Mono',monospace"}}>{b===0?"Free":fmt(b)}</div>
              <div style={{color:P.gold,fontSize:21,fontWeight:900,margin:"6px 0"}}>{boost}</div>
              <div style={{color:P.textMuted,fontSize:11}}>customers/month</div>
              <div style={{marginTop:7,fontSize:10,color:P.textDim}}>{b===0?"Word of mouth only":b===100?"Flyers + social":b===250?"Paid ads + content":"Full campaign"}</div>
            </div>
          );
        })}
      </div>
      <Card glow={P.gold} style={{background:P.goldSoft}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          <Stat label="Monthly Spend"    value={fmt(budget)} color={P.gold}/>
          <Stat label="Customers/Month"  value={MARKETING_BOOSTS[budget]} color={P.accent}/>
          <Stat label="6-Month Ad Cost"  value={fmt(budget*6)} color={P.red}/>
        </div>
      </Card>
      <Btn sz="lg" onClick={()=>onDone({mktBudget:budget,baseCustomers:MARKETING_BOOSTS[budget]})}>
        Start Month 1 →
      </Btn>
    </div>
  );
}

// ─── Monthly Operations Round (Rounds 4-9) ───────────────────────────────────
function MonthRound({biz, monthIdx, prevCash, onDone}){
  const [supplies, setSupplies] = useState(biz.defaultSupplies);
  const [rent,     setRent]     = useState(250);
  const [misc,     setMisc]     = useState(80);
  const [rolled,   setRolled]   = useState(false);
  const [chosen,   setChosen]   = useState(null); // auto-set by dice

  const empCost  = biz.solo ? 0 : 400;
  const loanPmt  = biz.loan ? Math.round(biz.loanAmt * 0.10) : 0;
  const baseExp  = +supplies + +rent + +misc + empCost + biz.mktBudget + loanPmt;
  const cashStart = prevCash ?? biz.totalCash;

  let customers = biz.baseCustomers, cashAdj = 0, expMult = 1;
  if (chosen) {
    if (chosen.effect === "customers") customers = Math.max(0, customers + chosen.value);
    if (chosen.effect === "cash")      cashAdj = chosen.value;
    if (chosen.effect === "expenses")  expMult = 1 + chosen.value;
  }
  const adjExp  = Math.round(baseExp * expMult);
  const revenue = Math.round(customers * biz.price);
  const profit  = revenue - adjExp;
  const cashEnd = cashStart + revenue - adjExp + cashAdj;
  const debt    = biz.loan ? Math.max(0, biz.loanAmt - loanPmt * (monthIdx + 1)) : 0;

  return (
    <div style={{display:"flex", flexDirection:"column", gap:16}}>
      {/* Month banner */}
      <div style={{background:"linear-gradient(135deg,#0e1730,#131b2e)", border:`1px solid ${P.blue}33`,
        borderRadius:13, padding:"12px 16px", display:"flex", alignItems:"center", gap:12}}>
        <div style={{fontSize:28}}>📅</div>
        <div>
          <div style={{color:P.blue, fontWeight:800, fontSize:16}}>{MONTH_NAMES[monthIdx]} — Month {monthIdx+1} of 6</div>
          <div style={{color:P.textMuted, fontSize:11, marginTop:2}}>Set expenses, then roll 2 dice — your event is determined automatically</div>
        </div>
        <div style={{marginLeft:"auto", textAlign:"right"}}>
          <div style={{color:P.textMuted, fontSize:10, textTransform:"uppercase"}}>Cash In</div>
          <div style={{color:P.gold, fontWeight:800, fontFamily:"'Space Mono',monospace", fontSize:16}}>{fmt(cashStart)}</div>
        </div>
      </div>

      {/* Expenses */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <Inp label="Supplies / Inventory" value={supplies} onChange={setSupplies} type="number" pre="$"/>
        <Inp label="Rent / Workspace"     value={rent}     onChange={setRent}     type="number" pre="$"/>
        <Inp label="Misc Expenses"        value={misc}     onChange={setMisc}     type="number" pre="$"/>
        <div style={{display:"flex", flexDirection:"column", gap:5}}>
          <label style={{color:P.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>Fixed Auto-Costs</label>
          <div style={{background:"#080c18", border:`1px solid ${P.cardBorder}`, borderRadius:9, padding:"9px 13px", fontSize:11, display:"flex", flexDirection:"column", gap:5}}>
            {!biz.solo && <div style={{display:"flex", justifyContent:"space-between", color:P.textMuted}}><span>Employee</span><span style={{color:P.red}}>+$400</span></div>}
            {biz.loan  && <div style={{display:"flex", justifyContent:"space-between", color:P.textMuted}}><span>Loan (10%)</span><span style={{color:P.red}}>+{fmt(loanPmt)}</span></div>}
            <div style={{display:"flex", justifyContent:"space-between", color:P.textMuted}}><span>Marketing</span><span style={{color:P.gold}}>+{fmt(biz.mktBudget)}</span></div>
            <div style={{display:"flex", justifyContent:"space-between", color:P.textMuted, borderTop:`1px solid ${P.cardBorder}`, paddingTop:5}}>
              <span>Base Total</span><span style={{color:P.text, fontWeight:700}}>{fmt(baseExp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dice roll — auto-reveals event */}
      <Card style={{background:"linear-gradient(135deg,#110a28,#0a1020)", border:`2px solid ${P.purple}44`}}>
        <div style={{color:P.purple, fontWeight:800, fontSize:11, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14}}>
          🎲 {MONTH_NAMES[monthIdx]} — Roll 2 Dice · Your Event is Auto-Drawn
        </div>
        <DiceRoller
          locked={rolled}
          monthIdx={monthIdx}
          onRolled={(ev, diceVals, total) => {
            setChosen(ev);
            setRolled(true);
          }}
        />
      </Card>

      {/* Results preview — shown after dice */}
      {chosen && (
        <Card style={{background:"#080c18", border:`1px solid ${P.accent}33`}}>
          <div style={{color:P.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:13}}>
            📊 {MONTH_NAMES[monthIdx]} — Final Results
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
            <Stat label="Customers" value={customers}    color={P.accent}/>
            <Stat label="Revenue"   value={fmt(revenue)} color={P.blue}/>
            <Stat label="Expenses"  value={fmt(adjExp)}  color={P.red}/>
            <Stat label="Profit"    value={fmt(profit)}  color={profit>=0?P.accent:P.red}/>
          </div>
          <div style={{marginTop:13, paddingTop:13, borderTop:`1px solid ${P.cardBorder}`, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <Stat label="Cash Start" value={fmt(cashStart)} color={P.textMuted}/>
            <Stat label="Cash End"   value={fmt(cashEnd)}   color={cashEnd>=0?P.gold:P.red}/>
          </div>
          {/* Event impact reminder */}
          <div style={{marginTop:13, padding:"10px 14px", background:chosen.color+"18", border:`1px solid ${chosen.color}44`,
            borderRadius:9, display:"flex", alignItems:"center", gap:10}}>
            <span style={{fontSize:22}}>{chosen.emoji}</span>
            <div>
              <div style={{color:chosen.color, fontWeight:700, fontSize:12}}>{chosen.title}</div>
              <div style={{color:P.textMuted, fontSize:11}}>{chosen.desc} → <strong style={{color:chosen.color}}>{chosen.label}</strong></div>
            </div>
          </div>
        </Card>
      )}

      <Btn sz="lg" disabled={!chosen}
        onClick={() => onDone({
          month:monthIdx+1, monthName:MONTH_NAMES[monthIdx],
          supplies:+supplies, rent:+rent, misc:+misc,
          empCost, loanPmt, baseExp, adjExp, cashAdj,
          customers, revenue, profit, cashStart, cashEnd, debt,
          event:chosen, mktBudget:biz.mktBudget
        })}>
        Close {MONTH_NAMES[monthIdx]} Books →
      </Btn>
    </div>
  );
}

// ─── Round 10: Full Audit Simulation ─────────────────────────────────────────
const AUDIT_CHECKS=[
  {id:"revenue",  label:"Revenue is properly recognized",                     accounts:["Sales Revenue"],          risk:"low" },
  {id:"expenses", label:"All expenses are recorded and classified",           accounts:["Rent","Supplies","Wages"], risk:"low" },
  {id:"cash",     label:"Ending cash matches bank reconciliation",            accounts:["Cash"],                   risk:"medium"},
  {id:"inventory",label:"Inventory is valued at cost (not market)",           accounts:["Inventory"],              risk:"medium"},
  {id:"debt",     label:"Loan payable balance is accurate and disclosed",     accounts:["Loan Payable"],           risk:null  },
  {id:"equity",   label:"Owner's equity reflects net profit/loss correctly",  accounts:["Owner's Equity"],         risk:"low" },
  {id:"matching", label:"Expenses are matched to revenue in correct period",  accounts:["All Expense Accounts"],   risk:"medium"},
  {id:"cutoff",   label:"All transactions recorded in the correct month",     accounts:["Revenue & Expenses"],     risk:"low" },
  {id:"internal", label:"No single person controls both cash and records",    accounts:["Internal Controls"],      risk:null  },
  {id:"going",    label:"Business can continue operating (going concern)",    accounts:["Cash Flow"],              risk:null  },
];

function AuditRound({biz,ops}){
  const [activeTab,setActiveTab]=useState("trial");
  const [checks,setChecks]=useState({});
  const [opinionRevealed,setOpinionRevealed]=useState(false);
  const [finding,setFinding]=useState("");

  // Cumulative financials
  const totalRevenue   = ops.reduce((a,r)=>a+(r.revenue||0),0);
  const totalExpenses  = ops.reduce((a,r)=>a+(r.adjExp||0),0);
  const totalProfit    = totalRevenue-totalExpenses;
  const cashEnd        = ops[ops.length-1]?.cashEnd||0;
  const cashStart      = biz.totalCash;
  const debt           = ops[ops.length-1]?.debt||0;
  const inventory      = biz.defaultSupplies;
  const totalCashAdj   = ops.reduce((a,r)=>a+(r.cashAdj||0),0);
  const equity         = cashEnd+inventory-debt;
  const totalLoanPmts  = ops.reduce((a,r)=>a+(r.loanPmt||0),0);
  const totalEmpCost   = ops.reduce((a,r)=>a+(r.empCost||0),0);
  const totalMkt       = ops.reduce((a,r)=>a+(r.mktBudget||0),0);
  const totalRent      = ops.reduce((a,r)=>a+(r.rent||0),0);
  const totalSupplies  = ops.reduce((a,r)=>a+(r.supplies||0),0);
  const totalMisc      = ops.reduce((a,r)=>a+(r.misc||0),0);

  const allChecked = AUDIT_CHECKS.every(c=>checks[c.id]==="pass"||checks[c.id]==="flag");
  const flagCount  = Object.values(checks).filter(v=>v==="flag").length;
  const passCount  = Object.values(checks).filter(v=>v==="pass").length;

  // Derive audit opinion
  let opinion, opinionColor, opinionIcon;
  if(!allChecked){ opinion="Incomplete"; opinionColor=P.textMuted; opinionIcon="⏳"; }
  else if(flagCount===0&&cashEnd>0){ opinion="Unqualified (Clean)"; opinionColor=P.accent; opinionIcon="✅"; }
  else if(flagCount<=2){ opinion="Qualified Opinion"; opinionColor=P.gold; opinionIcon="⚠️"; }
  else { opinion="Adverse / Disclaimer"; opinionColor=P.red; opinionIcon="🚨"; }

  const scores=calcScores(ops);

  const tabs=[
    {id:"trial",    label:"Trial Balance",    icon:"📋"},
    {id:"income",   label:"Income Statement", icon:"📈"},
    {id:"balance",  label:"Balance Sheet",    icon:"⚖️"},
    {id:"cashflow", label:"Cash Flow",        icon:"💵"},
    {id:"checklist",label:"Audit Checklist",  icon:"🔍"},
    {id:"opinion",  label:"Audit Opinion",    icon:"🏛️"},
  ];

  // Statement rows
  const trialRows=[
    {label:"Cash",               dr:cashEnd,    cr:0,     side:"Dr"},
    {label:"Inventory/Supplies", dr:inventory,  cr:0,     side:"Dr"},
    {label:"Accounts Receivable",dr:0,          cr:0,     side:"Dr"},
    {label:"Loan Payable",       dr:0,          cr:debt,  side:"Cr"},
    {label:"Owner's Equity",     dr:0,          cr:equity,side:"Cr"},
    {label:"Sales Revenue",      dr:0,          cr:totalRevenue,side:"Cr"},
    {label:"Rent Expense",       dr:totalRent,  cr:0,     side:"Dr"},
    {label:"Supplies Expense",   dr:totalSupplies,cr:0,   side:"Dr"},
    {label:"Marketing Expense",  dr:totalMkt,   cr:0,     side:"Dr"},
    {label:"Wages Expense",      dr:totalEmpCost,cr:0,    side:"Dr"},
    {label:"Misc Expense",       dr:totalMisc,  cr:0,     side:"Dr"},
    {label:"Loan Interest",      dr:totalLoanPmts,cr:0,   side:"Dr"},
  ];
  const drTotal=trialRows.reduce((a,r)=>a+r.dr,0);
  const crTotal=trialRows.reduce((a,r)=>a+r.cr,0);
  const balanced=Math.abs(drTotal-crTotal)<5;

  const incomeRows=[
    {label:"Sales Revenue",         amount:totalRevenue,   type:"revenue"},
    {label:"  Rent Expense",        amount:-totalRent,     type:"expense"},
    {label:"  Supplies Expense",    amount:-totalSupplies, type:"expense"},
    {label:"  Marketing Expense",   amount:-totalMkt,      type:"expense"},
    {label:"  Wages Expense",       amount:-totalEmpCost,  type:"expense"},
    {label:"  Misc Expense",        amount:-totalMisc,     type:"expense"},
    {label:"  Loan Interest",       amount:-totalLoanPmts, type:"expense"},
    {label:"Total Expenses",        amount:-totalExpenses, type:"subtotal"},
    {label:"NET INCOME / (LOSS)",   amount:totalProfit,    type:"total"},
  ];
  const balRows=[
    {label:"ASSETS",                     header:true},
    {label:"  Cash",                     amount:cashEnd},
    {label:"  Inventory",                amount:inventory},
    {label:"  Total Assets",             amount:cashEnd+inventory, bold:true},
    {label:"LIABILITIES",                header:true},
    {label:"  Loan Payable",             amount:debt},
    {label:"  Total Liabilities",        amount:debt, bold:true},
    {label:"OWNER'S EQUITY",             header:true},
    {label:"  Beginning Capital",        amount:cashStart},
    {label:"  Net Income / (Loss)",      amount:totalProfit},
    {label:"  Total Owner's Equity",     amount:equity, bold:true},
    {label:"TOTAL LIABILITIES + EQUITY", amount:debt+equity, bold:true, accent:true},
  ];
  const cfRows=[
    {label:"OPERATING ACTIVITIES",   header:true},
    {label:"  Cash from Sales",       amount:totalRevenue},
    {label:"  Cash Paid for Expenses",amount:-totalExpenses},
    {label:"  Event Adjustments",     amount:totalCashAdj},
    {label:"  Net Operating Cash",    amount:totalRevenue-totalExpenses+totalCashAdj, bold:true},
    {label:"FINANCING ACTIVITIES",    header:true},
    {label:"  Loan Proceeds",         amount:biz.loan?biz.loanAmt:0},
    {label:"  Loan Repayments",       amount:-totalLoanPmts},
    {label:"  Net Financing Cash",    amount:(biz.loan?biz.loanAmt:0)-totalLoanPmts, bold:true},
    {label:"NET CHANGE IN CASH",      amount:cashEnd-cashStart, bold:true, accent:true},
    {label:"Beginning Cash Balance",  amount:cashStart},
    {label:"ENDING CASH BALANCE",     amount:cashEnd, bold:true},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Audit header */}
      <div style={{background:"linear-gradient(135deg,#0a1228,#0d1520)",border:`1px solid ${P.teal}44`,
        borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:32}}>🔍</div>
        <div>
          <div style={{color:P.teal,fontWeight:900,fontSize:16}}>Full Audit Simulation</div>
          <div style={{color:P.textMuted,fontSize:11,marginTop:2}}>{biz.name} · 6-Month Period · Jan – Jun</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:10,flexWrap:"wrap"}}>
          <Stat label="Net Profit" value={fmt(totalProfit)} color={totalProfit>=0?P.accent:P.red} sm/>
          <Stat label="Ending Cash" value={fmt(cashEnd)} color={P.gold} sm/>
          <Stat label="Audit Status" value={opinionIcon+" "+opinion} color={opinionColor} sm/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
            background:activeTab===t.id?P.teal:"#0a0e1a",
            color:activeTab===t.id?"#060a12":P.textMuted,
            border:`1px solid ${activeTab===t.id?P.teal:P.cardBorder}`,
            borderRadius:8,padding:"7px 12px",cursor:"pointer",
            fontSize:11,fontWeight:700,fontFamily:"'Space Mono',monospace",transition:"all 0.13s"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Trial Balance ── */}
      {activeTab==="trial"&&(
        <Card>
          <div style={{fontFamily:"'Space Mono',monospace"}}>
            <div style={{color:P.teal,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>
              📋 Trial Balance — {biz.name}
            </div>
            <div style={{color:P.textMuted,fontSize:10,marginBottom:14}}>Period: January – June (6 Months)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"5px 16px",marginBottom:8}}>
              <span style={{color:P.textDim,fontSize:9,textTransform:"uppercase"}}>Account</span>
              <span style={{color:P.accent,fontSize:9,textTransform:"uppercase"}}>Debit</span>
              <span style={{color:P.gold,fontSize:9,textTransform:"uppercase"}}>Credit</span>
            </div>
            {trialRows.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"5px 16px",padding:"7px 0",borderTop:`1px solid ${P.cardBorder}`}}>
                <span style={{color:P.text,fontSize:12}}>{r.label}</span>
                <span style={{color:r.dr>0?P.accent:P.textDim,fontWeight:r.dr>0?700:400,fontSize:12}}>{r.dr>0?fmt(r.dr):"—"}</span>
                <span style={{color:r.cr>0?P.gold:P.textDim,fontWeight:r.cr>0?700:400,fontSize:12}}>{r.cr>0?fmt(r.cr):"—"}</span>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"5px 16px",padding:"10px 0",borderTop:`2px solid ${P.cardBorder}`,marginTop:4}}>
              <span style={{color:P.text,fontWeight:800,fontSize:12}}>TOTALS</span>
              <span style={{color:P.accent,fontWeight:800,fontSize:12}}>{fmt(drTotal)}</span>
              <span style={{color:P.gold,fontWeight:800,fontSize:12}}>{fmt(crTotal)}</span>
            </div>
            <div style={{marginTop:10,padding:"10px 14px",background:balanced?P.accentSoft:P.redSoft,
              border:`1px solid ${balanced?P.accent:P.red}44`,borderRadius:9,fontSize:12,
              color:balanced?P.accent:P.red,fontWeight:700}}>
              {balanced?"✓ Trial Balance is BALANCED — Debits equal Credits":"⚠ Trial Balance is OUT OF BALANCE — Check your entries"}
            </div>
          </div>
        </Card>
      )}

      {/* ── Income Statement ── */}
      {activeTab==="income"&&(
        <Card>
          <div style={{fontFamily:"'Space Mono',monospace"}}>
            <div style={{color:P.teal,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>📈 Income Statement — {biz.name}</div>
            <div style={{color:P.textMuted,fontSize:10,marginBottom:14}}>For the 6-Month Period Ending June 30</div>
            {incomeRows.map((r,i)=>{
              const isTotal=r.type==="total"; const isSub=r.type==="subtotal";
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:isTotal?"10px 0":"7px 0",
                  borderTop:isTotal||isSub?`2px solid ${P.cardBorder}`:`1px solid ${P.cardBorder}33`,
                  marginTop:isTotal?4:0}}>
                  <span style={{color:isTotal?P.text:isSub?P.textMuted:P.textMuted,fontWeight:isTotal||isSub?800:400,fontSize:12,paddingLeft:r.label.startsWith("  ")?12:0}}>
                    {r.label.trim()}
                  </span>
                  <span style={{color:isTotal?(r.amount>=0?P.accent:P.red):isSub?P.red:(r.amount>=0?P.accent:P.red),fontWeight:isTotal||isSub?800:500,fontSize:12}}>
                    {r.amount>=0?fmt(r.amount):`(${fmt(Math.abs(r.amount))})`}
                  </span>
                </div>
              );
            })}
            <div style={{marginTop:12,padding:"10px 14px",background:totalProfit>=0?P.accentSoft:P.redSoft,border:`1px solid ${totalProfit>=0?P.accent:P.red}44`,borderRadius:9,display:"flex",justifyContent:"space-between"}}>
              <span style={{color:totalProfit>=0?P.accent:P.red,fontWeight:800,fontSize:13}}>Profit Margin</span>
              <span style={{color:totalProfit>=0?P.accent:P.red,fontWeight:800,fontFamily:"'Space Mono',monospace",fontSize:13}}>{pct(totalProfit,totalRevenue)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── Balance Sheet ── */}
      {activeTab==="balance"&&(
        <Card>
          <div style={{fontFamily:"'Space Mono',monospace"}}>
            <div style={{color:P.teal,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>⚖️ Balance Sheet — {biz.name}</div>
            <div style={{color:P.textMuted,fontSize:10,marginBottom:14}}>As of June 30 (End of Period)</div>
            {balRows.map((r,i)=>(
              r.header?(
                <div key={i} style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,padding:"10px 0 3px",borderTop:i>0?`1px solid ${P.cardBorder}`:"none"}}>{r.label}</div>
              ):(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${P.cardBorder}33`,fontWeight:r.bold?800:400}}>
                  <span style={{color:r.bold?P.text:P.textMuted,paddingLeft:r.label.startsWith("  ")?12:0,fontSize:12}}>{r.label.trim()}</span>
                  <span style={{color:r.accent?P.teal:r.bold?P.gold:(r.amount>=0?P.accent:P.red),fontWeight:r.bold?800:500,fontSize:12}}>
                    {r.amount>=0?fmt(r.amount):`(${fmt(Math.abs(r.amount))})`}
                  </span>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* ── Cash Flow ── */}
      {activeTab==="cashflow"&&(
        <Card>
          <div style={{fontFamily:"'Space Mono',monospace"}}>
            <div style={{color:P.teal,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>💵 Statement of Cash Flows — {biz.name}</div>
            <div style={{color:P.textMuted,fontSize:10,marginBottom:14}}>For the 6-Month Period Ending June 30</div>
            {cfRows.map((r,i)=>(
              r.header?(
                <div key={i} style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,padding:"10px 0 3px",borderTop:i>0?`1px solid ${P.cardBorder}`:"none"}}>{r.label}</div>
              ):(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${P.cardBorder}33`,fontWeight:r.bold?800:400}}>
                  <span style={{color:r.bold?P.text:P.textMuted,paddingLeft:r.label.startsWith("  ")?12:0,fontSize:12}}>{r.label.trim()}</span>
                  <span style={{color:r.accent?P.teal:r.bold?(r.amount>=0?P.gold:P.red):(r.amount>=0?P.accent:P.red),fontWeight:r.bold?800:500,fontSize:12}}>
                    {r.amount>=0?fmt(r.amount):`(${fmt(Math.abs(r.amount))})`}
                  </span>
                </div>
              )
            ))}
          </div>
        </Card>
      )}

      {/* ── Audit Checklist ── */}
      {activeTab==="checklist"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{background:"#080c18"}}>
            <div style={{color:P.teal,fontWeight:800,fontSize:12,marginBottom:4}}>🔍 Auditor's Checklist</div>
            <p style={{color:P.textMuted,fontSize:12,margin:0,lineHeight:1.65}}>
              Review each item. Mark <strong style={{color:P.accent}}>Pass</strong> if evidence supports it, or <strong style={{color:P.red}}>Flag</strong> if there is a concern or exception.
            </p>
          </Card>
          {AUDIT_CHECKS.map(c=>{
            const val=checks[c.id];
            return(
              <Card key={c.id} style={{padding:"14px 16px",background:val==="pass"?P.accentSoft:val==="flag"?P.redSoft:"#0a0e1a",
                border:`1px solid ${val==="pass"?P.accent:val==="flag"?P.red:P.cardBorder}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{color:P.text,fontWeight:700,fontSize:13}}>{c.label}</div>
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                      {c.accounts.map(a=><Badge key={a} color={P.blue} size="sm">{a}</Badge>)}
                      {c.risk&&<Badge color={c.risk==="low"?P.accent:P.gold}>Risk: {c.risk}</Badge>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <button onClick={()=>setChecks(p=>({...p,[c.id]:"pass"}))}
                      style={{background:val==="pass"?P.accent:"transparent",color:val==="pass"?"#060a12":P.accent,
                        border:`1px solid ${P.accent}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",
                        fontWeight:800,fontSize:11,fontFamily:"'Space Mono',monospace"}}>✓ Pass</button>
                    <button onClick={()=>setChecks(p=>({...p,[c.id]:"flag"}))}
                      style={{background:val==="flag"?P.red:"transparent",color:val==="flag"?"#fff":P.red,
                        border:`1px solid ${P.red}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",
                        fontWeight:800,fontSize:11,fontFamily:"'Space Mono',monospace"}}>⚑ Flag</button>
                  </div>
                </div>
              </Card>
            );
          })}
          <Card style={{background:"#080c18"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <Stat label="Checked" value={`${passCount+flagCount}/${AUDIT_CHECKS.length}`} color={P.blue}/>
              <Stat label="Passed"  value={passCount} color={P.accent}/>
              <Stat label="Flagged" value={flagCount} color={flagCount>0?P.red:P.textMuted}/>
            </div>
          </Card>
          {allChecked&&(
            <Btn sz="lg" v="teal" onClick={()=>setActiveTab("opinion")}>
              🏛️ View Audit Opinion →
            </Btn>
          )}
        </div>
      )}

      {/* ── Audit Opinion ── */}
      {activeTab==="opinion"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {!allChecked?(
            <Card glow={P.gold} style={{textAlign:"center",padding:"32px 20px"}}>
              <div style={{fontSize:36}}>⏳</div>
              <div style={{color:P.gold,fontWeight:800,fontSize:16,marginTop:10}}>Complete the Audit Checklist First</div>
              <div style={{color:P.textMuted,fontSize:13,marginTop:6}}>All 10 checklist items must be marked Pass or Flag before an opinion can be issued.</div>
              <div style={{marginTop:16}}><Btn v="gold" onClick={()=>setActiveTab("checklist")}>Go to Checklist →</Btn></div>
            </Card>
          ):(
            <>
              <Card glow={opinionColor} style={{background:opinionColor+"15",textAlign:"center",padding:"28px 20px"}}>
                <div style={{fontSize:44}}>{opinionIcon}</div>
                <div style={{color:opinionColor,fontSize:22,fontWeight:900,marginTop:10}}>Auditor's Opinion</div>
                <div style={{color:P.text,fontSize:18,fontWeight:800,marginTop:6}}>{opinion}</div>
                <div style={{color:P.textMuted,fontSize:12,marginTop:10,maxWidth:440,margin:"10px auto 0",lineHeight:1.7}}>
                  {flagCount===0&&cashEnd>0
                    ? "In our opinion, the financial statements present fairly, in all material respects, the financial position of the company. No material misstatements were identified."
                    : flagCount<=2
                    ? `Except for the ${flagCount} matter(s) flagged, the statements present fairly in all material respects. Management should address the flagged items in the next reporting period.`
                    : "The financial statements contain multiple material exceptions. The auditor is unable to confirm the statements present fairly. Significant corrective action is required."}
                </div>
              </Card>

              {/* Findings */}
              {flagCount>0&&(
                <Card>
                  <div style={{color:P.red,fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>⚑ Audit Findings — Items Requiring Attention</div>
                  {AUDIT_CHECKS.filter(c=>checks[c.id]==="flag").map((c,i)=>(
                    <div key={c.id} style={{padding:"10px 0",borderTop:i>0?`1px solid ${P.cardBorder}`:"none",display:"flex",gap:12,alignItems:"flex-start"}}>
                      <Badge color={P.red}>Finding {i+1}</Badge>
                      <div>
                        <div style={{color:P.text,fontWeight:700,fontSize:12}}>{c.label}</div>
                        <div style={{color:P.textMuted,fontSize:11,marginTop:3}}>Accounts: {c.accounts.join(", ")}</div>
                      </div>
                    </div>
                  ))}
                  <Inp label="Auditor Notes (Optional)" value={finding} onChange={setFinding} hint="Record management response or corrective plan"/>
                </Card>
              )}

              {/* 6-Month summary */}
              <Card glow={P.gold} style={{background:P.goldSoft}}>
                <div style={{color:P.gold,fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:1.5,marginBottom:14}}>
                  📊 6-Month Financial Summary
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
                  <Stat label="Total Revenue"  value={fmt(totalRevenue)}  color={P.accent}/>
                  <Stat label="Total Expenses" value={fmt(totalExpenses)} color={P.red}/>
                  <Stat label="Net Profit"     value={fmt(totalProfit)}   color={totalProfit>=0?P.accent:P.red}/>
                  <Stat label="Ending Cash"    value={fmt(cashEnd)}       color={P.gold}/>
                  <Stat label="Loan Balance"   value={debt>0?fmt(debt):"Paid Off"} color={debt>0?P.red:P.accent}/>
                  <Stat label="Owner Equity"   value={fmt(equity)}        color={equity>=0?P.blue:P.red}/>
                </div>
                {/* month-by-month mini chart */}
                <div style={{borderTop:`1px solid ${P.cardBorder}`,paddingTop:14}}>
                  <div style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Month-by-Month Profit</div>
                  {ops.map((m,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                      <span style={{color:P.textMuted,fontSize:10,width:22,flexShrink:0}}>M{i+1}</span>
                      <span style={{color:P.textDim,fontSize:10,width:60,flexShrink:0}}>{m.monthName}</span>
                      <div style={{flex:1,background:"#151f35",borderRadius:3,height:12,position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:P.cardBorder}}/>
                        {(() => {
                          const maxAbs=Math.max(...ops.map(o=>Math.abs(o.profit||0)),1);
                          const w=Math.min(50,Math.abs(m.profit)/maxAbs*50);
                          return <div style={{position:"absolute",top:0,bottom:0,
                            left:m.profit>=0?"50%":`${50-w}%`,width:`${w}%`,
                            background:m.profit>=0?P.accent:P.red}}/>;
                        })()}
                      </div>
                      <span style={{color:m.profit>=0?P.accent:P.red,fontSize:10,fontFamily:"'Space Mono',monospace",width:58,textAlign:"right",flexShrink:0}}>{fmtS(m.profit)}</span>
                      <span style={{fontSize:14,flexShrink:0}}>{m.event?.emoji}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Scores */}
              <Card>
                <div style={{color:P.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",marginBottom:14}}>🎯 Final Performance Scores</div>
                {[{k:"profit",l:"Profit Management",ic:"📈"},{k:"cash",l:"Cash Flow Control",ic:"💵"},{k:"debt",l:"Debt Management",ic:"🏦"},{k:"growth",l:"Growth & Customers",ic:"🚀"},{k:"decisions",l:"Financial Decisions",ic:"🎯"}].map(s=>(
                  <div key={s.k} style={{marginBottom:13}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{color:P.text,fontSize:12}}>{s.ic} {s.l}</span>
                      <span style={{color:P.accent,fontWeight:800,fontFamily:"'Space Mono',monospace"}}>{scores[s.k]}/100</span>
                    </div>
                    <PBar pct={scores[s.k]} color={scores[s.k]>70?P.accent:scores[s.k]>40?P.gold:P.red}/>
                  </div>
                ))}
                <div style={{marginTop:16,background:P.accentSoft,border:`1px solid ${P.accent}44`,borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:P.text,fontWeight:800,fontSize:14}}>🏆 Overall Score</span>
                  <span style={{color:P.gold,fontWeight:900,fontSize:26,fontFamily:"'Space Mono',monospace"}}>{scores.total}/100</span>
                </div>
              </Card>

              {/* Certificate */}
              <Card glow={P.gold} style={{background:"linear-gradient(135deg,#1a1300,#0e1a0a)",textAlign:"center",padding:"28px 20px"}}>
                <div style={{fontSize:44}}>🏆</div>
                <div style={{color:P.gold,fontSize:20,fontWeight:900,marginTop:8}}>Certificate of Completion</div>
                <div style={{color:P.text,fontSize:14,marginTop:6}}>nugO Business Builder Simulation</div>
                <div style={{color:P.textMuted,fontSize:12,marginTop:14}}>This certifies that</div>
                <div style={{color:P.gold,fontSize:19,fontWeight:800,margin:"6px 0"}}>{biz.name}</div>
                <div style={{color:P.textMuted,fontSize:12}}>completed all 10 rounds including a Full Audit Simulation</div>
                <div style={{color:P.teal,fontSize:14,fontWeight:700,marginTop:4}}>From Startup to Statements — 6 Month Business Journey</div>
                <div style={{display:"inline-flex",gap:16,marginTop:16,flexWrap:"wrap",justifyContent:"center"}}>
                  <Badge color={P.gold} size="lg">Score: {scores.total}/100</Badge>
                  <Badge color={opinionColor} size="lg">{opinionIcon} {opinion}</Badge>
                </div>
                <div style={{marginTop:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"left"}}>
                  {["Business Planning","Pricing Strategy","Marketing Decisions","6-Month Operations","Dice Event Management","Income Statement","Balance Sheet","Cash Flow Statement","Trial Balance","Audit Checklist & Opinion"].map((sk,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{color:P.accent,fontSize:12}}>✓</span>
                      <span style={{color:P.textMuted,fontSize:11}}>{sk}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── How To Play Modal ────────────────────────────────────────────────────────
const HTP_STEPS = [
  { icon:"🚀", title:"Round 1 — Business Setup",       color:P.accent,
    body:"Pick your business type (Food, Clothing, Lawn Care, or Digital). Name it, set your starting cash, choose to go solo or hire an employee, and decide whether to take a startup loan." },
  { icon:"💰", title:"Round 2 — Pricing Strategy",      color:P.gold,
    body:"Set your price per product or service and your monthly customer goal. The app calculates your revenue target. Higher price = fewer customers but more per sale. Lower price = more customers, thinner margin." },
  { icon:"📣", title:"Round 3 — Marketing Plan",        color:P.blue,
    body:"Choose your monthly advertising budget: $0 (word of mouth), $100 (flyers), $250 (paid ads), or $500 (full campaign). More spend = more customers reached every month for all 6 months." },
  { icon:"📅", title:"Rounds 4–9 — Monthly Operations", color:P.purple,
    body:"Each round = one month of business (January–June). Set your expenses (supplies, rent, misc). Then roll 2 dice — the total automatically draws your Event Card. The card is applied instantly. No choice — just like real business!" },
  { icon:"🎲", title:"The Dice & Event Cards",          color:P.purple,
    body:"Roll 2 dice each month. The sum (2–12) determines which of 20 random events hits your business — viral post, grant, equipment breakdown, tax notice, theft, festival boost, and more. You can't predict it. You can only react." },
  { icon:"📊", title:"Financial Statements",            color:P.teal,
    body:"After all 6 months, the app auto-generates your Income Statement, Balance Sheet, Statement of Cash Flows, and Trial Balance — all built from your real decisions throughout the simulation." },
  { icon:"🔍", title:"Round 10 — Full Audit",           color:P.teal,
    body:"Review all 4 financial statements. Then complete a 10-item Auditor's Checklist — marking each item Pass ✓ or Flag ⚑. Based on your flags, the system issues an official Audit Opinion: Clean, Qualified, or Adverse." },
  { icon:"🏆", title:"Your Score & Certificate",        color:P.gold,
    body:"You're scored on Profit Management, Cash Flow Control, Debt Management, Growth, and Financial Decisions. Complete the audit to earn your Certificate of Completion — printable for your nugO portfolio." },
];

function HowToPlayModal({ onClose }) {
  const [step, setStep] = useState(0);
  const s = HTP_STEPS[step];
  return (
    <div style={{ position:"fixed", inset:0, background:"#000000bb", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:P.card, border:`1px solid ${s.color}55`, borderRadius:20,
          padding:28, maxWidth:480, width:"100%", boxShadow:`0 0 48px ${s.color}33`,
          animation:"fadeUp 0.25s ease" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ color:P.teal, fontWeight:800, fontSize:11, textTransform:"uppercase", letterSpacing:1.5 }}>How to Play</div>
            <div style={{ color:P.textMuted, fontSize:11, marginTop:2 }}>Step {step+1} of {HTP_STEPS.length}</div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${P.cardBorder}`,
            color:P.textMuted, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontSize:12, fontFamily:"'Space Mono',monospace" }}>✕ Close</button>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {HTP_STEPS.map((_,i) => (
            <div key={i} onClick={()=>setStep(i)} style={{ flex:1, height:3, borderRadius:99, cursor:"pointer",
              background:i<=step?s.color:P.cardBorder, transition:"background 0.3s" }}/>
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign:"center", padding:"8px 0 20px" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>{s.icon}</div>
          <div style={{ color:s.color, fontWeight:900, fontSize:17, marginBottom:10 }}>{s.title}</div>
          <div style={{ color:P.textMuted, fontSize:13, lineHeight:1.8 }}>{s.body}</div>
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:10 }}>
          {step > 0
            ? <Btn v="ghost" sz="sm" onClick={()=>setStep(s=>s-1)}>← Back</Btn>
            : <div/>}
          <div style={{ flex:1 }}/>
          {step < HTP_STEPS.length-1
            ? <Btn v="blue" onClick={()=>setStep(s=>s+1)}>Next →</Btn>
            : <Btn v="gold" onClick={onClose}>Got it — Let's Go! 🚀</Btn>}
        </div>
      </div>
    </div>
  );
}

// ─── Save/Resume helpers (in-memory, survives re-renders but not refresh) ─────
// We also persist to window.storage for cross-session resume
const SAVE_KEY = "nugo-biz-sim-save";

function serializeState(round, biz, ops) {
  return JSON.stringify({ round, biz, ops, savedAt: new Date().toLocaleString() });
}
function deserializeState(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

// ─── Resume Banner ────────────────────────────────────────────────────────────
function ResumeBanner({ savedData, onResume, onDiscard }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#0e1a10,#0a1520)",
      border:`1px solid ${P.accent}55`, borderRadius:14, padding:"16px 18px",
      display:"flex", alignItems:"center", gap:14, marginBottom:20,
      boxShadow:`0 0 24px ${P.accent}22` }}>
      <div style={{ fontSize:28 }}>💾</div>
      <div style={{ flex:1 }}>
        <div style={{ color:P.accent, fontWeight:800, fontSize:14 }}>Saved Game Found</div>
        <div style={{ color:P.textMuted, fontSize:11, marginTop:2 }}>
          <strong style={{ color:P.gold }}>{savedData.biz?.name}</strong> · Round {savedData.round} of 10 · Saved {savedData.savedAt}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
        <Btn v="ghost" sz="sm" onClick={onDiscard}>Discard</Btn>
        <Btn v="primary" sz="sm" onClick={onResume}>▶ Resume</Btn>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const [round, setRound]       = useState(0);
  const [biz,   setBiz]         = useState(null);
  const [ops,   setOps]         = useState([]);
  const [showHTP, setShowHTP]   = useState(false);
  const [savedData, setSavedData] = useState(null);   // detected save
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error"
  const topRef = useRef();
  const scroll = () => topRef.current?.scrollIntoView({ behavior:"smooth" });

  // ── Load saved game on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const d = deserializeState(raw);
        if (d && d.round > 0 && d.biz) setSavedData(d);
      }
    } catch {}
  }, []);

  // ── Auto-save whenever round/biz/ops changes ──
  useEffect(() => {
    if (round === 0 || !biz) return;
    try {
      localStorage.setItem(SAVE_KEY, serializeState(round, biz, ops));
      setSaveStatus("saved");
      const t = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(t);
    } catch { setSaveStatus("error"); }
  }, [round, biz, ops]);

  const next = () => { scroll(); setRound(r => r+1); };
  const prevCash = ops.length > 0 ? ops[ops.length-1].cashEnd : biz?.totalCash;
  const monthIdx = round >= 4 ? round - 4 : 0;

  const handleResume = () => {
    setRound(savedData.round);
    setBiz(savedData.biz);
    setOps(savedData.ops || []);
    setSavedData(null);
    scroll();
  };
  const handleDiscard = () => {
    setSavedData(null);
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  };
  const handleRestart = () => {
    setRound(0); setBiz(null); setOps([]);
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    scroll();
  };

  return (
    <div ref={topRef} style={{ minHeight:"100vh", background:P.bg, fontFamily:"'DM Sans',sans-serif", color:P.text, paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#07090f;}::-webkit-scrollbar-thumb{background:#1a2640;border-radius:3px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.3s ease forwards;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes diceShake{0%{transform:rotate(-10deg)scale(1.1)}50%{transform:rotate(10deg)scale(0.91)}100%{transform:rotate(-5deg)scale(1.05)}}
        @keyframes cardReveal{0%{opacity:0;transform:scale(0.88) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>

      {/* How To Play Modal */}
      {showHTP && <HowToPlayModal onClose={() => setShowHTP(false)} />}

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(180deg,#0d1520,transparent)", padding:"20px 18px 0" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ background:P.accentSoft, border:`1px solid ${P.accent}44`, borderRadius:11, padding:"7px 13px", fontSize:19 }}>💼</div>
            <div>
              <div style={{ color:P.accent, fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>nugO Business Builder</div>
              <div style={{ color:P.textMuted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>6-Month Simulation · Workbook · Full Audit</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              {/* Save status indicator */}
              {saveStatus === "saved" && (
                <div style={{ color:P.accent, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                  <span>💾</span> Saved
                </div>
              )}
              {/* How To Play button — always visible */}
              <button onClick={() => setShowHTP(true)}
                style={{ background:P.purpleSoft, border:`1px solid ${P.purple}55`, color:P.purple,
                  borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:11, fontWeight:700,
                  fontFamily:"'Space Mono',monospace" }}>
                ❓ How to Play
              </button>
              {biz && round > 0 && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:P.gold, fontWeight:800, fontSize:13 }}>{biz.name}</div>
                  <div style={{ color:P.textMuted, fontSize:9 }}>{biz.bizLabel}</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {round > 0 && round < 11 && (
            <div style={{ marginTop:16, marginBottom:2 }}>
              <div style={{ display:"flex", gap:2 }}>
                {ROUNDS.map((_,i) => {
                  const done = i < round;
                  const col  = ROUNDS[i].tag==="audit" ? P.teal : ROUNDS[i].tag==="ops" ? P.blue : P.accent;
                  return <div key={i} style={{ flex:1, height:4, borderRadius:99,
                    background:done?col:i===round-1?col+"88":P.cardBorder, transition:"all 0.3s" }}/>;
                })}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                <span style={{ color:P.textMuted, fontSize:9 }}>Round {round} of 10</span>
                <span style={{ color:P.accent, fontSize:9 }}>{Math.round((round/10)*100)}% complete</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"8px 16px 0" }}>

        {/* ── Intro / Landing ── */}
        {round === 0 && (
          <div className="fu">
            {/* Resume banner if save exists */}
            {savedData && (
              <ResumeBanner savedData={savedData} onResume={handleResume} onDiscard={handleDiscard} />
            )}

            <div style={{ textAlign:"center", padding:"28px 0 20px" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🏢</div>
              <h1 style={{ color:P.text, fontSize:24, fontWeight:900, margin:"0 0 10px", lineHeight:1.25 }}>
                From Startup to<br/><span style={{ color:P.accent }}>Full Audit</span>
              </h1>
              <p style={{ color:P.textMuted, fontSize:13, lineHeight:1.75, maxWidth:460, margin:"0 auto 20px" }}>
                Run your business for <strong style={{ color:P.gold }}>6 months</strong>. Roll dice every month for random events. Generate real financial statements. Then face a <strong style={{ color:P.teal }}>Full Audit Simulation</strong>.
              </p>
              {/* CTA buttons */}
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:28 }}>
                <Btn v="gold" sz="xl" onClick={() => setRound(1)}>🚀 Start Your Journey</Btn>
                <Btn v="ghost" sz="lg" onClick={() => setShowHTP(true)}>❓ How to Play</Btn>
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:22 }}>
              {[
                ["📅","6 Business Months","January through June"],
                ["🎲","2 Dice Each Month","Your event is auto-drawn"],
                ["🔍","Full Audit Round","Trial Balance + Opinion"],
              ].map(([ic,t,d]) => (
                <Card key={t} style={{ textAlign:"center", padding:"16px 10px" }}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{ic}</div>
                  <div style={{ color:P.text, fontWeight:700, fontSize:11 }}>{t}</div>
                  <div style={{ color:P.textMuted, fontSize:10, marginTop:3 }}>{d}</div>
                </Card>
              ))}
            </div>

            {/* Quick-start guide */}
            <Card style={{ background:"#080c18", marginBottom:20 }}>
              <div style={{ color:P.teal, fontWeight:800, fontSize:11, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>
                ⚡ Quick Start — 3 Steps
              </div>
              {[
                ["1", P.accent, "Setup (Rounds 1–3)", "Name your business, set your price, choose your marketing budget. Takes about 3 minutes."],
                ["2", P.blue,   "Operate (Rounds 4–9)", "Run each month: set expenses → roll 2 dice → watch your random event apply automatically."],
                ["3", P.teal,   "Audit (Round 10)", "Review your financial statements, complete the audit checklist, and receive your official opinion."],
              ].map(([n, col, title, body]) => (
                <div key={n} style={{ display:"flex", gap:14, padding:"12px 0", borderTop:`1px solid ${P.cardBorder}` }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:col+"28", border:`1px solid ${col}55`,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                    color:col, fontWeight:900, fontSize:13, fontFamily:"'Space Mono',monospace" }}>{n}</div>
                  <div>
                    <div style={{ color:P.text, fontWeight:700, fontSize:13 }}>{title}</div>
                    <div style={{ color:P.textMuted, fontSize:11, marginTop:3, lineHeight:1.6 }}>{body}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* All rounds list */}
            <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:24 }}>
              {ROUNDS.map((r,i) => {
                const tagColor = r.tag==="audit" ? P.teal : r.tag==="ops" ? P.blue : P.accent;
                return (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 12px",
                    background:P.card, borderRadius:10, border:`1px solid ${P.cardBorder}` }}>
                    <div style={{ background:tagColor+"22", borderRadius:7, padding:"4px 8px", fontSize:14,
                      border:`1px solid ${tagColor}33`, flexShrink:0 }}>{r.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:P.text, fontWeight:700, fontSize:12 }}>Round {r.num}: {r.title}</div>
                      <div style={{ color:P.textMuted, fontSize:10 }}>{r.desc}</div>
                    </div>
                    <Badge color={tagColor}>{r.tag==="audit"?"🔍 Audit":r.tag==="ops"?"📅 Month":"⚙️ Setup"}</Badge>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign:"center" }}>
              <Btn v="gold" sz="xl" onClick={() => setRound(1)}>🚀 Start Your 6-Month Journey</Btn>
            </div>
          </div>
        )}

        {/* ── Active Round ── */}
        {round > 0 && round <= 10 && (
          <div className="fu">
            {/* Round header card */}
            <div style={{
              background:`linear-gradient(135deg,${ROUNDS[round-1].tag==="audit"?P.tealSoft:ROUNDS[round-1].tag==="ops"?P.blueSoft:P.accentSoft},transparent)`,
              border:`1px solid ${ROUNDS[round-1].tag==="audit"?P.teal:ROUNDS[round-1].tag==="ops"?P.blue:P.accent}44`,
              borderRadius:14, padding:"15px 18px", marginBottom:16, display:"flex", gap:14, alignItems:"center" }}>
              <div style={{ fontSize:24,
                background:ROUNDS[round-1].tag==="audit"?P.tealSoft:ROUNDS[round-1].tag==="ops"?P.blueSoft:P.accentSoft,
                borderRadius:10, padding:"9px 11px", flexShrink:0 }}>{ROUNDS[round-1].icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                  <Badge color={P.accent}>Round {round}</Badge>
                  <Badge color={P.textDim}>of 10</Badge>
                  {round>=4&&round<=9&&<Badge color={P.blue}>{MONTH_NAMES[monthIdx]}</Badge>}
                  {round===10&&<Badge color={P.teal}>Final Round</Badge>}
                </div>
                <div style={{ color:P.text, fontSize:17, fontWeight:900 }}>{ROUNDS[round-1].title}</div>
                <div style={{ color:P.textMuted, fontSize:11, marginTop:2 }}>{ROUNDS[round-1].desc}</div>
              </div>
              {/* Help button in round header */}
              <button onClick={() => setShowHTP(true)}
                style={{ background:"transparent", border:`1px solid ${P.cardBorder}`, color:P.textMuted,
                  borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:10,
                  fontFamily:"'Space Mono',monospace", flexShrink:0 }}>❓</button>
            </div>

            {round===1 && <SetupRound    onDone={d => { setBiz(d); next(); }}/>}
            {round===2 && biz && <PricingRound   biz={biz} onDone={d => { setBiz(b=>({...b,...d})); next(); }}/>}
            {round===3 && biz && <MarketingRound biz={biz} onDone={d => { setBiz(b=>({...b,...d})); next(); }}/>}
            {round>=4 && round<=9 && biz && (
              <MonthRound
                key={round}
                biz={biz}
                monthIdx={monthIdx}
                prevCash={prevCash}
                onDone={d => { setOps(p=>[...p,d]); next(); }}
              />
            )}
            {round===10 && biz && ops.length===6 && <AuditRound biz={biz} ops={ops}/>}

            {/* Bottom nav — restart link */}
            <div style={{ marginTop:24, textAlign:"center" }}>
              <button onClick={() => { if(window.confirm("Restart and lose all progress?")) handleRestart(); }}
                style={{ background:"transparent", border:"none", color:P.textDim, cursor:"pointer", fontSize:11,
                  fontFamily:"'Space Mono',monospace", textDecoration:"underline" }}>
                ↺ Restart from beginning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
