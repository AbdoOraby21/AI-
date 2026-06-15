import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are رودمابك للـ AI. You speak Egyptian Arabic mixed with English tech terms. Ask 2-3 questions max then output JSON roadmap.

CRITICAL: After enough info, output ONLY this exact JSON format inside triple backticks:

\`\`\`json
{
  "track": "Track Name",
  "trackIcon": "🤖",
  "trackDescription": "وصف بالعربي",
  "level": "Beginner",
  "phases": [
    {
      "id": 1,
      "title": "Phase Title بالعربي",
      "duration": "6-8 أسابيع",
      "color": "#6366f1",
      "todos": [
        {
          "id": "p1t1",
          "task": "المهمة بالعربي مع English technical terms",
          "type": "course",
          "link": "https://www.coursera.org/learn/python",
          "linkLabel": "Python for Everybody - Coursera (Free)"
        }
      ]
    }
  ],
  "summary": "رسالة تشجيعية"
}
\`\`\`

REAL FREE LINKS to use:
- Python basics: https://www.coursera.org/learn/python
- Python practice: https://www.hackerrank.com/domains/python
- AI for Everyone: https://www.coursera.org/learn/ai-for-everyone
- ML Crash Course: https://developers.google.com/machine-learning/crash-course
- Deep Learning: https://www.coursera.org/specializations/deep-learning
- FastAPI: https://fastapi.tiangolo.com/tutorial/
- Flask: https://www.youtube.com/watch?v=Z1RJmh_OqeA
- React: https://react.dev/learn
- Streamlit: https://www.youtube.com/watch?v=VqgUkExPvLY
- OpenAI API: https://platform.openai.com/docs/quickstart
- Prompt Engineering: https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/
- Computer Vision: https://www.youtube.com/watch?v=oXlwWbU8l2o
- NLP Hugging Face: https://www.youtube.com/watch?v=8rXD5-xhemo
- Git: https://www.youtube.com/watch?v=RGOj5yH7evk
- HTML/CSS: https://www.freecodecamp.org/learn/2022/responsive-web-design/
- JavaScript: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/
- Arduino/IoT: https://www.youtube.com/watch?v=BtLwoNJ6klE
- Raspberry Pi AI: https://www.youtube.com/watch?v=ElzHBp3RMQU
- Data Science Kaggle: https://www.kaggle.com/learn
- TensorFlow: https://www.tensorflow.org/tutorials
- PyTorch: https://pytorch.org/tutorials/
- SQL: https://sqlzoo.net/
- Docker: https://www.youtube.com/watch?v=pg19Z8LL06w

Keep 3-4 phases, 3-5 todos per phase. Every todo MUST have a real link.
If still chatting, respond in plain Arabic text ONLY — no JSON.`;

const COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899"];
const TYPE_ICON = { course:"📚", project:"🛠️", tool:"⚙️", concept:"💡", practice:"🎯" };
const TYPE_LABEL = { course:"Course", project:"Project", tool:"Tool", concept:"Concept", practice:"Practice" };

function detectDir(text) {
  if (!text) return "ltr";
  return (text.match(/[\u0600-\u06FF]/g)||[]).length > text.length*0.25 ? "rtl" : "ltr";
}

function MsgText({ content }) {
  return (
    <div style={{fontSize:14,lineHeight:1.75}}>
      {content.split("\n").map((line,i)=>{
        const dir = detectDir(line);
        return <div key={i} style={{direction:dir,textAlign:dir==="rtl"?"right":"left",minHeight:line?"auto":10}}>{line||"\u00A0"}</div>;
      })}
    </div>
  );
}

function Particles({ dark }) {
  const pts = Array.from({length:14},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*3+1, dur:Math.random()*8+6,
    delay:Math.random()*5, op:Math.random()*0.25+0.05
  }));
  if(!dark) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {pts.map(p=>(
        <div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",opacity:p.op,animation:`float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`}}/>
      ))}
    </div>
  );
}

function Card3D({ children, style={}, color="#6366f1", glow=false }) {
  const [tilt,setTilt]=useState({x:0,y:0,s:1});
  const ref=useRef();
  return (
    <div ref={ref}
      onMouseMove={e=>{const r=ref.current?.getBoundingClientRect();if(!r)return;setTilt({x:((e.clientY-r.top)/r.height-0.5)*10,y:((e.clientX-r.left)/r.width-0.5)*-10,s:1.015});}}
      onMouseLeave={()=>setTilt({x:0,y:0,s:1})}
      style={{...style,transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.s})`,transition:"transform 0.15s ease",boxShadow:glow?`0 0 28px ${color}44,0 8px 32px #00000055`:"0 4px 20px #00000033"}}>
      {children}
    </div>
  );
}

// Download roadmap as text file
function downloadRoadmap(roadmap, checked) {
  const total = roadmap.phases.flatMap(p=>p.todos).length;
  const done = roadmap.phases.flatMap(p=>p.todos).filter(t=>checked[t.id]).length;
  let txt = `رودمابك للـ AI 🎯\n`;
  txt += `${"=".repeat(40)}\n`;
  txt += `الـ Track: ${roadmap.track} ${roadmap.trackIcon}\n`;
  txt += `المستوى: ${roadmap.level}\n`;
  txt += `${roadmap.trackDescription}\n`;
  txt += `التقدم: ${done}/${total} tasks (${Math.round(done/total*100)}%)\n`;
  txt += `${"=".repeat(40)}\n\n`;
  roadmap.phases.forEach(ph=>{
    txt += `\nPhase ${ph.id}: ${ph.title}\n`;
    txt += `المدة: ${ph.duration}\n`;
    txt += `${"-".repeat(30)}\n`;
    ph.todos.forEach((t,i)=>{
      const isDone = checked[t.id];
      txt += `${i+1}. [${isDone?"✓":" "}] ${t.task}\n`;
      if(t.link) txt += `   🔗 ${t.linkLabel||t.link}\n   ${t.link}\n`;
      txt += `\n`;
    });
  });
  txt += `\n${"=".repeat(40)}\n`;
  txt += `جميع الحقوق محفوظة © ${new Date().getFullYear()} Abdo Oraby\n`;
  txt += `Portfolio: https://abdo-oraby.myftp.org\n`;
  txt += `\nمعلش يا هندسة حمّل الـ Roadmap عشان لسه معملناش Database 😂\n`;

  const blob = new Blob([txt], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `roadmap-${roadmap.track.replace(/\s+/g,"-")}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadTodos(roadmap, checked) {
  let txt = `To-Do List — ${roadmap.track} ${roadmap.trackIcon}\n`;
  txt += `${"=".repeat(40)}\n`;
  const total = roadmap.phases.flatMap(p=>p.todos).length;
  const done = roadmap.phases.flatMap(p=>p.todos).filter(t=>checked[t.id]).length;
  txt += `التقدم: ${done}/${total}\n\n`;
  roadmap.phases.forEach(ph=>{
    txt += `\n📌 Phase ${ph.id}: ${ph.title} (${ph.duration})\n`;
    ph.todos.forEach((t,i)=>{
      txt += `  ${i+1}. [${checked[t.id]?"✓":" "}] ${t.task}\n`;
      if(t.link) txt += `       🔗 ${t.link}\n`;
    });
  });
  txt += `\n© ${new Date().getFullYear()} Abdo Oraby — جميع الحقوق محفوظة\n`;

  const blob = new Blob([txt],{type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `todos-${roadmap.track.replace(/\s+/g,"-")}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [msgs, setMsgs] = useState([{role:"assistant",content:"أهلاً! أنا رودمابك للـ AI 🎯\n\nأنا هنا أساعدك تلاقي طريقك في عالم الـ AI وتعمل Roadmap مخصص ليك مع لينكات لكورسات مجانية.\n\nإبدأ بأي طريقة:\n• قولي عن نفسك وإيه اللي بيشدك\n• أو قولي على track معين\n• أو \"مش عارف أبدأ منين\" 😄"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [roadmap,setRoadmap]=useState(null);
  const [checked,setChecked]=useState({});
  const [activePhase,setActivePhase]=useState(0);
  const [view,setView]=useState("chat");
  const [dlMenu,setDlMenu]=useState(false);
  const bottomRef=useRef();
  const inputRef=useRef();

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  useEffect(()=>{ const close=()=>setDlMenu(false); window.addEventListener("click",close); return ()=>window.removeEventListener("click",close); },[]);

  const D = dark ? {
    bg:"#07070f", bg2:"rgba(13,12,26,0.92)", bg3:"rgba(19,16,36,0.95)",
    border:"#1e1b4b66", border2:"#2d2b5566", text:"#e2e8f0", text2:"#a5b4fc",
    text3:"#64748b", text4:"#374151", card:"rgba(13,12,26,0.85)",
    input:"rgba(10,9,20,0.9)", hdr:"rgba(7,7,15,0.88)", tag:"#0a0a14",
    bubble:"rgba(19,16,36,0.95)", chip:"rgba(19,16,36,0.8)"
  } : {
    bg:"#f1f5f9", bg2:"#fff", bg3:"#f8fafc",
    border:"#e2e8f0", border2:"#cbd5e1", text:"#1e293b", text2:"#4f46e5",
    text3:"#64748b", text4:"#94a3b8", card:"#fff",
    input:"#fff", hdr:"rgba(241,245,249,0.92)", tag:"#f1f5f9",
    bubble:"#fff", chip:"#fff"
  };

  const parseJSON = t => {
    const m=t.match(/```json\s*([\s\S]*?)\s*```/);
    if(m){try{return JSON.parse(m[1]);}catch{try{return JSON.parse(m[1].replace(/,(\s*[}\]])/g,"$1"));}catch{}}}
    return null;
  };

  const send = async () => {
    if(!input.trim()||loading) return;
    const um={role:"user",content:input.trim()};
    const next=[...msgs,um];
    setMsgs(next);setInput("");setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,system:SYSTEM_PROMPT,messages:next.map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json();
      const reply=data.content?.find(b=>b.type==="text")?.text||"";
      const parsed=parseJSON(reply);
      if(parsed?.phases){
        setRoadmap(parsed);setActivePhase(0);
        setMsgs(p=>[...p,{role:"assistant",content:parsed.summary||"جهزتلك الـ Roadmap مع اللينكات! 🚀\nروح تاب الـ Roadmap فوق وشوفه 👆"}]);
        setTimeout(()=>setView("roadmap"),900);
      } else setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"حصل خطأ، حاول تاني 🙁"}]);}
    setLoading(false);
  };

  const total=roadmap?.phases?.flatMap(p=>p.todos).length||0;
  const done=Object.values(checked).filter(Boolean).length;
  const pct=total?Math.round(done/total*100):0;

  const btnBase={padding:"10px 22px",borderRadius:12,border:`1px solid ${D.border2}`,background:D.card,fontWeight:700,fontSize:13,fontFamily:"inherit",transition:"all 0.2s",cursor:"pointer"};

  return (
    <div style={{fontFamily:"'Segoe UI','Cairo',system-ui,sans-serif",minHeight:"100vh",background:D.bg,color:D.text,display:"flex",flexDirection:"column",position:"relative",transition:"background 0.3s,color 0.3s"}}>
      <Particles dark={dark}/>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:100,background:D.hdr,backdropFilter:"blur(16px)",borderBottom:`1px solid ${D.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 20px #6366f155"}}>🎯</div>
          <div>
            <div style={{fontWeight:900,fontSize:17,letterSpacing:"-0.5px",lineHeight:1,color:D.text}}>
              رودمابك{" "}
              <span style={{background:"linear-gradient(90deg,#6366f1,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>للـ AI</span>
            </div>
            <div style={{fontSize:10,color:"#6366f1",marginTop:2,letterSpacing:"0.3px"}}>طريقك في عالم الذكاء الاصطناعي</div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Dark/Light toggle */}
          <button onClick={()=>setDark(d=>!d)} title={dark?"وضع نهاري":"وضع ليلي"} style={{width:38,height:38,borderRadius:10,border:`1px solid ${D.border2}`,background:D.card,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",color:D.text,transition:"all 0.2s"}}>
            {dark?"☀️":"🌙"}
          </button>

          {/* Tab switcher */}
          {roadmap&&(
            <div style={{display:"flex",gap:4,background:dark?"#0f0f1a":D.bg3,padding:"4px",borderRadius:12,border:`1px solid ${D.border2}`}}>
              {["chat","roadmap"].map(v=>(
                <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",borderRadius:9,border:"none",cursor:"pointer",background:view===v?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent",color:view===v?"#fff":D.text3,fontSize:12,fontWeight:700,transition:"all 0.2s",fontFamily:"inherit"}}>
                  {v==="chat"?"💬 Chat":"🗺️ Roadmap"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT ── */}
      {view==="chat"&&(
        <div style={{flex:1,maxWidth:700,width:"100%",margin:"0 auto",padding:"20px 16px 0",display:"flex",flexDirection:"column",height:"calc(100vh - 67px)",position:"relative",zIndex:1}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14,paddingBottom:10,scrollbarWidth:"thin",scrollbarColor:`${D.border2} transparent`}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                {m.role==="assistant"&&(
                  <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,boxShadow:"0 0 10px #6366f144"}}>🎯</div>
                )}
                <div style={{maxWidth:"76%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?"linear-gradient(135deg,#4f46e5,#7c3aed)":D.bubble,border:m.role==="assistant"?`1px solid ${D.border}`:"none",boxShadow:m.role==="user"?"0 4px 18px #6366f133":"0 2px 10px #00000022",direction:"rtl",textAlign:"right",color:m.role==="user"?"#fff":D.text}}>
                  <MsgText content={m.content}/>
                </div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎯</div>
                <div style={{background:D.bubble,border:`1px solid ${D.border}`,borderRadius:"18px 18px 18px 4px",padding:"13px 18px",display:"flex",gap:5}}>
                  {[0,1,2].map(d=><div key={d} style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",animation:`bounce 1s ease ${d*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {msgs.length===1&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10,direction:"rtl"}}>
              {["مش عارف أبدأ منين 😅","بحب Computer Vision","عايز أشتغل في NLP & LLMs","مشاريع AI مع Arduino"].map(q=>(
                <button key={q} onClick={()=>{setInput(q);inputRef.current?.focus();}} style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${D.border2}`,background:D.chip,color:D.text2,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
              ))}
            </div>
          )}

          <div style={{padding:"10px 0 16px",borderTop:`1px solid ${D.border}`}}>
            <div style={{display:"flex",gap:10,background:D.input,border:`1px solid ${D.border2}`,borderRadius:16,padding:"8px 8px 8px 16px",boxShadow:"0 4px 20px #00000022"}}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="اكتب هنا..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:D.text,fontSize:14,direction:"rtl",textAlign:"right",fontFamily:"inherit"}}/>
              <button onClick={send} disabled={loading||!input.trim()} style={{width:40,height:40,borderRadius:12,border:"none",background:input.trim()?"linear-gradient(135deg,#6366f1,#8b5cf6)":dark?"#1a1830":D.bg3,color:"#fff",cursor:input.trim()?"pointer":"default",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:input.trim()?"0 0 14px #6366f144":"none",flexShrink:0}}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP ── */}
      {view==="roadmap"&&roadmap&&(
        <div style={{flex:1,maxWidth:880,width:"100%",margin:"0 auto",padding:"24px 16px 40px",overflowY:"auto",position:"relative",zIndex:1}}>

          {/* Track Hero */}
          <Card3D color="#6366f1" glow style={{background:dark?"linear-gradient(135deg,rgba(30,27,75,0.9),rgba(20,16,50,0.95))":D.bg2,border:`1px solid ${dark?"#4338ca44":D.border}`,borderRadius:24,padding:"32px 28px",marginBottom:22,textAlign:"center",position:"relative",overflow:"hidden"}}>
            {dark&&<div style={{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",width:240,height:240,borderRadius:"50%",background:"#6366f111",filter:"blur(50px)",pointerEvents:"none"}}/>}
            <div style={{fontSize:54,marginBottom:10,filter:dark?"drop-shadow(0 0 18px #a855f788)":"none"}}>{roadmap.trackIcon}</div>
            <div style={{fontSize:25,fontWeight:900,color:D.text,marginBottom:8,letterSpacing:"-0.5px"}}>{roadmap.track}</div>
            <div style={{fontSize:13,color:D.text2,marginBottom:20,direction:"rtl",lineHeight:1.7,maxWidth:480,margin:"0 auto 20px"}}>{roadmap.trackDescription}</div>
            <span style={{padding:"6px 20px",borderRadius:20,background:roadmap.level==="Beginner"?"#064e3b":roadmap.level==="Intermediate"?"#78350f":"#4c1d95",color:"#fff",fontSize:12,fontWeight:700}}>
              {roadmap.level==="Beginner"?"🟢 مبتدئ":roadmap.level==="Intermediate"?"🟡 متوسط":"🔴 متقدم"}
            </span>
          </Card3D>

          {/* Progress */}
          <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:18,padding:"18px 22px",marginBottom:22,backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",direction:"rtl",marginBottom:10}}>
              <span style={{color:D.text2,fontWeight:700,fontSize:13}}>📊 تقدمك الكلي</span>
              <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                <span style={{color:"#a855f7",fontWeight:900,fontSize:26,lineHeight:1}}>{pct}</span>
                <span style={{color:D.text3,fontSize:14}}>%</span>
              </div>
            </div>
            <div style={{height:8,background:dark?"#0a0a14":D.bg3,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)",borderRadius:4,transition:"width 0.6s cubic-bezier(.4,0,.2,1)",boxShadow:"0 0 8px #a855f755"}}/>
            </div>
            <div style={{marginTop:8,color:D.text4,fontSize:11,direction:"rtl"}}>{done} من {total} tasks اتخلصوا ✓</div>
          </div>

          {/* Download buttons */}
          <div style={{display:"flex",gap:8,marginBottom:18,direction:"rtl",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <div style={{position:"relative"}}>
              <button onClick={()=>setDlMenu(d=>!d)} style={{...btnBase,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",boxShadow:"0 0 14px #6366f133",display:"flex",alignItems:"center",gap:7}}>
                <span>⬇️</span> تحميل <span style={{fontSize:10,opacity:0.8}}>▼</span>
              </button>
              {dlMenu&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:D.bg2,border:`1px solid ${D.border2}`,borderRadius:14,overflow:"hidden",zIndex:50,minWidth:220,boxShadow:"0 8px 32px #00000033"}}>
                  <button onClick={()=>{downloadRoadmap(roadmap,checked);setDlMenu(false);}} style={{width:"100%",padding:"12px 18px",background:"transparent",border:"none",color:D.text,fontSize:13,cursor:"pointer",textAlign:"right",direction:"rtl",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9,borderBottom:`1px solid ${D.border}`}}>
                    <span>🗺️</span> تحميل الـ Roadmap كاملاً
                  </button>
                  <button onClick={()=>{downloadTodos(roadmap,checked);setDlMenu(false);}} style={{width:"100%",padding:"12px 18px",background:"transparent",border:"none",color:D.text,fontSize:13,cursor:"pointer",textAlign:"right",direction:"rtl",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9}}>
                    <span>✅</span> تحميل الـ To-Do List
                  </button>
                </div>
              )}
            </div>
            <div style={{flex:1,background:dark?"#0a0a1488":"#fef9c3",border:`1px solid ${dark?"#a855f733":"#fde68a"}`,borderRadius:12,padding:"10px 16px",fontSize:12,color:dark?"#a855f7":"#b45309",direction:"rtl",display:"flex",alignItems:"center",gap:7}}>
              <span>😂</span> معلش يا هندسة حمّل الـ Roadmap عشان لسه معملناش Database!
            </div>
          </div>

          {/* Phase Tabs */}
          <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
            {roadmap.phases.map((ph,i)=>{
              const c=COLORS[i]||"#6366f1";
              const ia=activePhase===i;
              const pd=(ph.todos||[]).filter(t=>checked[t.id]).length;
              return (
                <button key={i} onClick={()=>setActivePhase(i)} style={{padding:"10px 18px",borderRadius:12,border:`1.5px solid ${ia?c:D.border2}`,background:ia?`${c}22`:D.card,color:ia?"#fff":D.text3,cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",transition:"all 0.2s",fontFamily:"inherit",direction:"rtl",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:110}}>
                  <span>{ph.title}</span>
                  <span style={{fontSize:10,color:ia?c+"99":D.text4}}>{pd}/{(ph.todos||[]).length}</span>
                </button>
              );
            })}
          </div>

          {/* Active Phase */}
          {(()=>{
            const ph=roadmap.phases[activePhase];
            if(!ph) return null;
            const c=COLORS[activePhase]||"#6366f1";
            const todos=ph.todos||[];
            const phDone=todos.filter(t=>checked[t.id]).length;
            return (
              <Card3D color={c} glow={dark} style={{background:D.card,border:`1px solid ${c}33`,borderRadius:20,overflow:"hidden",marginBottom:18}}>
                <div style={{background:`linear-gradient(135deg,${c}22,${c}08)`,padding:"20px 24px",borderBottom:`1px solid ${c}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{direction:"rtl"}}>
                    <div style={{fontWeight:800,fontSize:17,color:D.text,letterSpacing:"-0.3px"}}>Phase {ph.id} — {ph.title}</div>
                    <div style={{color:D.text3,fontSize:12,marginTop:4}}>⏱ {ph.duration}</div>
                  </div>
                  <div style={{width:52,height:52,borderRadius:"50%",border:`2.5px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:c,fontSize:16,background:`${c}11`,flexShrink:0,boxShadow:`0 0 14px ${c}33`}}>
                    {Math.round(phDone/(todos.length||1)*100)}%
                  </div>
                </div>

                <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:10}}>
                  {todos.map(todo=>{
                    const isDone=checked[todo.id];
                    return (
                      <div key={todo.id} style={{borderRadius:14,background:dark?(isDone?"#0a0a14":"#0f0f1a"):(isDone?D.bg3:D.bg2),border:`1px solid ${isDone?c+"44":D.border}`,overflow:"hidden",transition:"all 0.2s",opacity:isDone?0.55:1}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",cursor:"pointer",direction:"rtl"}} onClick={()=>setChecked(p=>({...p,[todo.id]:!p[todo.id]}))}>
                          <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${isDone?c:D.text4}`,background:isDone?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.2s",boxShadow:isDone?`0 0 8px ${c}55`:"none"}}>
                            {isDone&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap",flexDirection:"row-reverse"}}>
                              <span style={{fontSize:15}}>{TYPE_ICON[todo.type]||"✅"}</span>
                              <span style={{color:isDone?D.text3:D.text,fontSize:13.5,fontWeight:500,textDecoration:isDone?"line-through":"none",lineHeight:1.6,flex:1,direction:"rtl"}}>{todo.task}</span>
                              <span style={{padding:"2px 8px",borderRadius:6,background:D.tag,border:`1px solid ${D.border}`,color:D.text3,fontSize:10,fontWeight:700,flexShrink:0}}>{TYPE_LABEL[todo.type]||todo.type}</span>
                            </div>
                          </div>
                        </div>
                        {todo.link&&(
                          <div style={{padding:"0 16px 12px",direction:"rtl"}}>
                            <a href={todo.link} target="_blank" rel="noopener noreferrer"
                              style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:10,background:`${c}15`,border:`1px solid ${c}44`,color:c,fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.2s"}}
                              onMouseEnter={e=>{e.currentTarget.style.background=`${c}28`;}}
                              onMouseLeave={e=>{e.currentTarget.style.background=`${c}15`;}}>
                              🔗 {todo.linkLabel||"افتح الكورس"} <span style={{fontSize:10,opacity:0.7}}>↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card3D>
            );
          })()}

          {/* Nav */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,direction:"rtl",marginBottom:32}}>
            <button onClick={()=>setActivePhase(p=>Math.min(roadmap.phases.length-1,p+1))} disabled={activePhase===roadmap.phases.length-1} style={{...btnBase,color:activePhase===roadmap.phases.length-1?D.text4:D.text2,cursor:activePhase===roadmap.phases.length-1?"default":"pointer"}}>التالي ←</button>
            <button onClick={()=>setView("chat")} style={{...btnBase,color:"#a855f7",borderColor:"#a855f755"}}>💬 رجّع للشات</button>
            <button onClick={()=>setActivePhase(p=>Math.max(0,p-1))} disabled={activePhase===0} style={{...btnBase,color:activePhase===0?D.text4:D.text2,cursor:activePhase===0?"default":"pointer"}}>→ السابق</button>
          </div>

          {/* Footer inside roadmap */}
          <div style={{textAlign:"center",borderTop:`1px solid ${D.border}`,paddingTop:20,direction:"rtl",marginTop:8}}>
            <div style={{fontSize:12,color:D.text3,marginBottom:5}}>
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()}{" "}
              <a href="https://abdo-oraby.myftp.org" target="_blank" rel="noopener noreferrer"
                style={{color:"#8b5cf6",fontWeight:700,textDecoration:"none"}}
                onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
                onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
                Abdo Oraby
              </a>
            </div>
            <div style={{fontSize:10,color:D.text4,letterSpacing:"0.3px"}}>رودمابك للـ AI — طريقك في عالم الذكاء الاصطناعي</div>
          </div>
        </div>
      )}

      {/* Global footer — always visible in chat view */}
      {view==="chat"&&(
        <div style={{textAlign:"center",borderTop:`1px solid ${D.border}`,padding:"14px 16px",direction:"rtl",position:"relative",zIndex:1,background:D.hdr,backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:12,color:D.text3}}>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()}{" "}
            <a href="https://abdo-oraby.myftp.org" target="_blank" rel="noopener noreferrer"
              style={{color:"#8b5cf6",fontWeight:700,textDecoration:"none"}}
              onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
              onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
              Abdo Oraby
            </a>
            {" "}&nbsp;·&nbsp;{" "}
            <span style={{color:D.text4,fontSize:11}}>رودمابك للـ AI</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes float{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-18px) scale(1.08)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#6366f144;border-radius:2px}
        input::placeholder{color:#4b5563}
        a{font-family:inherit}
      `}</style>
    </div>
  );
}
