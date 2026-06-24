import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  blue: "#1A56DB", blueLight: "#E8F0FE", blueMid: "#3B82F6",
  navy: "var(--navy-bg)", navyDark: "var(--navy-dark-bg)",
  green: "#059669", greenLight: "#D1FAE5",
  amber: "#D97706", amberLight: "#FEF3C7",
  red: "#DC2626", redLight: "#FEE2E2",
  purple: "#7C3AED", purpleLight: "#EDE9FE",
  gray50: "var(--bg-light)", gray100: "var(--bg-mid)", gray200: "var(--border)",
  gray300: "var(--border-dark)", gray400: "var(--text-muted)", gray500: "var(--text-secondary)",
  gray700: "var(--text-normal)", gray800: "var(--text-title)", gray900: "var(--text-title)",
  white: "var(--card-bg)",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
let STUDENTS = [
  {
    id: 1, name: "Sri Rakesh. R", roll_No: "10A-04", class_name: "10", section: "A",
    dob: "2011-03-15", photo: null, parent_name: "Rajesh",
    parent_email: "rajesh@email.com", academic_year: "2026-27",
    grade: "A", attendancePct: 92,
  },
];

let SUBJECTS = ["Mathematics","Science","English","Social Studies","Computer Science","Tamil"];

let ATTENDANCE = [];

let MONTHLY_ATT = [
  { month:"Jan", present:20, absent:2, late:1 },
  { month:"Feb", present:18, absent:2, late:2 },
  { month:"Mar", present:22, absent:1, late:0 },
  { month:"Apr", present:19, absent:3, late:1 },
  { month:"May", present:21, absent:1, late:2 },
  { month:"Jun", present:16, absent:2, late:2 },
];

let TESTS = [];

let ASSIGNMENTS = [];

let WEEKLY_REPORTS = [
  {
    id:1, week:"Week 23 (Jun 3–7)", attendance:"4/5 days present",
    subjects:["Mathematics","Science","English","Social Studies"],
    assignmentsCompleted:2, assignmentsTotal:3,
    remarks:"Aryan showed strong improvement in Mathematics this week. Participation in class discussions has increased. Please encourage more reading at home for Social Studies.",
    areas:["Social Studies comprehension","Time management for assignments"],
    teacher:"Ms. Priya Rajan",
  },
  {
    id:2, week:"Week 22 (May 27–31)", attendance:"5/5 days present",
    subjects:["Mathematics","Science","Computer Science","Tamil"],
    assignmentsCompleted:3, assignmentsTotal:3,
    remarks:"An excellent week overall. Computer Science project was outstanding. Keep up the momentum.",
    areas:["Science numerical problems"],
    teacher:"Ms. Priya Rajan",
  },
];

let ANNOUNCEMENTS = [
  { id:1, title:"Half-Yearly Examination Schedule Released", date:"2026-06-09", category:"Exam", read:false, body:"Half-yearly examinations for Class 10 will be held from July 14–21, 2026. Timetable attached on the school noticeboard." },
  { id:2, title:"Parent-Teacher Meeting – June 20", date:"2026-06-07", category:"Event", read:false, body:"The next Parent-Teacher Meeting is scheduled for Friday, June 20 from 9 AM to 1 PM. Please confirm your slot via the front office." },
  { id:3, title:"Science Exhibition – Entries Open", date:"2026-06-05", category:"Event", read:true, body:"Students are invited to submit project ideas for the Annual Science Exhibition on July 5. Register with your Science teacher by June 16." },
  { id:4, title:"Summer Reading List", date:"2026-06-01", category:"Academic", read:true, body:"The English department has released the summer reading list. Students are encouraged to read at least two books before the next term." },
];

let PERF_TREND = [
  { month:"Jan", Mathematics:72, Science:68, English:80, "Social Studies":65, "Computer Science":78, Tamil:70 },
  { month:"Feb", Mathematics:75, Science:71, English:83, "Social Studies":68, "Computer Science":82, Tamil:72 },
  { month:"Mar", Mathematics:80, Science:74, English:85, "Social Studies":70, "Computer Science":85, Tamil:75 },
  { month:"Apr", Mathematics:79, Science:77, English:88, "Social Studies":72, "Computer Science":88, Tamil:78 },
  { month:"May", Mathematics:84, Science:80, English:90, "Social Studies":75, "Computer Science":92, Tamil:80 },
  { month:"Jun", Mathematics:87, Science:74, English:92, "Social Studies":68, "Computer Science":95, Tamil:80 },
];

const SUBJECT_COLORS = {
  Mathematics: C.blue, Science: C.green, English: C.purple,
  "Social Studies": C.amber, "Computer Science": C.red, Tamil: "#0891B2",
};

let USERS = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const grade = (pct) => pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : "D";
const gradeColor = (pct) => pct >= 80 ? C.green : pct >= 60 ? C.amber : C.red;
const statusBadge = (s) => {
  const map = { Present:["#D1FAE5","#065F46"], Absent:["#FEE2E2","#991B1B"], Late:["#FEF3C7","#92400E"],
    Submitted:["#D1FAE5","#065F46"], Pending:["#EDE9FE","#5B21B6"], Overdue:["#FEE2E2","#991B1B"] };
  return map[s] || [C.gray100, C.gray700];
};

// ─── Reusable UI atoms ────────────────────────────────────────────────────────
const Badge = ({ label }) => {
  const [bg, fg] = statusBadge(label);
  return (
    <span style={{ background:bg, color:fg, fontSize:11, fontWeight:600, padding:"2px 8px",
      borderRadius:99, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>{label}</span>
  );
};

const StatCard = ({ icon, label, value, sub, accent, onClick }) => (
  <div onClick={onClick} style={{ background:C.white, border:`1px solid ${C.gray200}`, borderRadius:12, padding:"16px 18px",
    borderTop:`3px solid ${accent||C.blue}`, display:"flex", flexDirection:"column", gap:4, cursor: onClick ? "pointer" : "default" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontSize:12, color:C.gray500, fontWeight:500 }}>{label}</span>
    </div>
    <div style={{ fontSize:26, fontWeight:700, color:C.gray900, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:C.gray500 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ title, subtitle, onBack }) => (
  <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
    {onBack && (
      <button onClick={onBack} style={{ background:C.white, border:`1px solid ${C.gray200}`, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:8, color:C.gray700 }}>
        ←
      </button>
    )}
    <div>
      <h2 style={{ fontSize:18, fontWeight:700, color:C.gray900, margin:0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:13, color:C.gray500, margin:"4px 0 0" }}>{subtitle}</p>}
    </div>
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background:C.white, border:`1px solid ${C.gray200}`, borderRadius:12,
    padding:"20px 22px", ...style }}>{children}</div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"🏠" },
  { id:"profile", label:"Student Profile", icon:"👤" },
  { id:"attendance", label:"Attendance", icon:"📅" },
  { id:"tests", label:"Daily Tests", icon:"📝" },
  { id:"assignments", label:"Assignments", icon:"📋" },
  { id:"weekly", label:"Weekly Reports", icon:"📊" },
  { id:"subjects", label:"Subject Performance", icon:"📚" },
  { id:"yearly", label:"Yearly Progress", icon:"📈" },
  { id:"remarks", label:"Teacher Remarks", icon:"💬" },
  { id:"announcements", label:"Announcements", icon:"🔔" },
];

const TEACHER_NAV = [
  { id:"teacher_dashboard", label:"Overview", icon:"🏠" },
  { id:"teacher_edit", label:"Edit Records", icon:"✏️" },
];

const Sidebar = ({ active, onNav, collapsed, onToggle }) => (
  <aside className="app-sidebar" style={{
    width: collapsed ? 64 : 230, minHeight:"100vh", background:C.navyDark,
    display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0,
    position:"sticky", top:0, height:"100vh", overflowY:"auto", overflowX:"hidden",
  }}>
    {/* Logo */}
    <div style={{ padding: collapsed ? "18px 0" : "20px 18px", borderBottom:`1px solid rgba(255,255,255,0.08)`,
      display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ width:34, height:34, borderRadius:8, background:C.blue, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>P</div>
      {!collapsed && <div>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15, lineHeight:1 }}>Progress View</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginTop:2 }}>Sunrise Academy</div>
      </div>}
    </div>
    {/* Student pill */}
    {!collapsed && (
      <div style={{ margin:"14px 14px 6px", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:C.blue, display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>A</div>
          <div>
            <div style={{ color:"#fff", fontSize:12, fontWeight:600 }}>Sri Rakesh. R</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>Class 10-A • Roll 04</div>
          </div>
        </div>
      </div>
    )}
    {/* Nav items */}
    <nav style={{ padding:"8px 8px", flex:1 }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => onNav(n.id)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding: collapsed ? "10px 0" : "9px 12px",
            marginBottom:2, borderRadius:8, border:"none", cursor:"pointer", textAlign:"left",
            background: active===n.id ? "rgba(26,86,219,0.8)" : "transparent",
            color: active===n.id ? "#fff" : "rgba(255,255,255,0.65)",
            justifyContent: collapsed ? "center" : "flex-start",
            transition:"all 0.15s", fontSize:13, fontWeight: active===n.id ? 600 : 400,
          }}>
          <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
          {!collapsed && <span>{n.label}</span>}
          {!collapsed && n.id==="announcements" && <span style={{ marginLeft:"auto", background:C.red,
            color:"#fff", borderRadius:99, fontSize:10, padding:"1px 6px", fontWeight:700 }}>2</span>}
        </button>
      ))}
    </nav>
    {/* Footer */}
    {!collapsed && <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>AY 2026–27 • Term 1</div>
    </div>}
  </aside>
);

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ page, onLogout }) => (
  <header style={{ background:C.white, borderBottom:`1px solid ${C.gray200}`, padding:"0 24px",
    height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
    <div>
      <h1 style={{ fontSize:16, fontWeight:700, color:C.gray900, margin:0 }}>
        {NAV.find(n=>n.id===page)?.label || TEACHER_NAV.find(n=>n.id===page)?.label || "Progress View"}
      </h1>
      <p style={{ fontSize:11, color:C.gray400, margin:0 }}>Academic Year 2026–27</p>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ fontSize:12, color:C.gray600, textAlign:"right" }}>
        <div style={{ fontWeight:600, color:C.gray800 }}>{localStorage.getItem("userName") || "Rejina"}</div>
        <div style={{ color:C.gray400 }}>{localStorage.getItem("userRole") || "Parent"}</div>
      </div>
      <div style={{ width:34, height:34, borderRadius:"50%", background:C.blueLight,
        display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:C.blue, fontSize:14 }}>{(localStorage.getItem("userName") || "R")[0]}</div>
      <button onClick={onLogout} style={{ fontSize:12, color:C.gray500, background:"none", border:"none",
        cursor:"pointer", padding:"6px 10px", borderRadius:6, border:`1px solid ${C.gray200}` }}>Sign Out</button>
    </div>
  </header>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("parent@sunriseacademy.edu");
  const [password, setPassword] = useState("password123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your credentials.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://172.23.51.82/progress-view-api/api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userRole", data.role);
        window.alert(`Welcome ${data.name}`);
        onLogin();
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
      setLoading(false);
    } catch (err) {
      if (err === "Network Issue" || String(err).includes("Network")) {
        setError("Could not connect to the server.");
        setLoading(false);
      } else {
        setTimeout(() => {
          setLoading(false);
          const e = email.trim().toLowerCase();
          const p = password.trim();
          
          const foundUser = USERS.find(u => u.email.toLowerCase() === e && u.password === p);
          
          if (foundUser) {
            localStorage.setItem("userName", foundUser.name);
            localStorage.setItem("userRole", foundUser.role);
            window.alert(`Welcome ${foundUser.name}`);
            onLogin();
          } else {
            setError("Invalid credentials. Please try again.");
          }
        }, 500);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 60%, #1A56DB 100%)`,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:C.blue, margin:"0 auto 12px",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff" }}>P</div>
          <h1 style={{ color:"#fff", fontSize:24, fontWeight:800, margin:0 }}>Progress View</h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13, margin:"4px 0 0" }}>Sunrise Academy · Parent Portal</p>
        </div>
        {/* Card */}
        <div style={{ background:C.white, borderRadius:16, padding:"32px 30px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.gray900, marginBottom:20 }}>Sign in to your account</h2>
          {error && <div style={{ background:C.redLight, color:C.red, padding:"10px 14px", borderRadius:8,
            fontSize:13, marginBottom:16, fontWeight:500 }}>{error}</div>}
          <label style={{ fontSize:13, fontWeight:600, color:C.gray700 }}>Email address</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${C.gray300}`,
              background:C.gray50, color:C.gray900,
              fontSize:14, marginTop:6, marginBottom:16, boxSizing:"border-box", outline:"none" }}
            placeholder="you@example.com" />
          <label style={{ fontSize:13, fontWeight:600, color:C.gray700 }}>Password</label>
          <div style={{ position:"relative", marginTop:6, marginBottom:8 }}>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              type={show?"text":"password"}
              style={{ width:"100%", padding:"10px 40px 10px 12px", borderRadius:8, border:`1px solid ${C.gray300}`,
                background:C.gray50, color:C.gray900,
                fontSize:14, boxSizing:"border-box", outline:"none" }} placeholder="••••••••" />
            <button onClick={()=>setShow(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", cursor:"pointer", color:C.gray400, fontSize:16 }}>
              {show ? "🙈" : "👁"}
            </button>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <label style={{ display:"flex", gap:6, fontSize:13, color:C.gray600, alignItems:"center", cursor:"pointer" }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <span style={{ fontSize:13, color:C.blue, cursor:"pointer", fontWeight:500 }}>Forgot password?</span>
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width:"100%", padding:"12px", borderRadius:8, background:C.blue, color:"#fff",
              fontSize:15, fontWeight:700, border:"none", cursor:"pointer", opacity:loading?0.7:1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p style={{ textAlign:"center", fontSize:12, color:C.gray400, marginTop:16, marginBottom:0 }}>
            For account assistance, contact the school office.
          </p>
        </div>
        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:20 }}>
          © 2026 Sunrise Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ onNav }) => {
  const latestTest = TESTS[0];
  const avgMarks = Math.round(TESTS.reduce((a,t)=>a+t.marks/t.max*100,0)/TESTS.length);
  const pending = ASSIGNMENTS.filter(a=>a.status==="Pending").length;
  const unread = ANNOUNCEMENTS.filter(a=>!a.read).length;

  return (
    <div>
      {/* Welcome */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`, borderRadius:14,
        padding:"22px 26px", marginBottom:22, color:"#fff" }}>
        <div style={{ fontSize:13, opacity:0.7, marginBottom:4 }}>Good morning,</div>
        <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Rejina 👋</div>
        <div style={{ fontSize:13, opacity:0.7 }}>Aryan's academic summary for today, {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:22 }}>
        <StatCard onClick={() => onNav("attendance")} icon="📅" label="Attendance" value="92%" sub="This academic year" accent={C.green} />
        <StatCard onClick={() => onNav("tests")} icon="📝" label="Latest Test" value={latestTest ? `${latestTest.marks}/${latestTest.max}` : "N/A"} sub={latestTest ? latestTest.subject : "No Tests"} accent={C.blue} />
        <StatCard onClick={() => onNav("subjects")} icon="📊" label="Avg Performance" value={avgMarks ? `${avgMarks}%` : "N/A"} sub={avgMarks ? grade(avgMarks)+" Grade" : "N/A"} accent={C.purple} />
        <StatCard onClick={() => onNav("assignments")} icon="📋" label="Pending Tasks" value={pending} sub="assignments due" accent={C.amber} />
        <StatCard onClick={() => onNav("announcements")} icon="🔔" label="Announcements" value={unread} sub="unread notices" accent={C.red} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:22 }}>
        {/* Performance chart */}
        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Performance Trend (Last 6 Months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PERF_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis domain={[50,100]} tick={{ fontSize:11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="Mathematics" stroke={C.blue} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Science" stroke={C.green} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="English" stroke={C.purple} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Attendance pie */}
        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Attendance Breakdown</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={[{name:"Present",value:92},{name:"Absent",value:5},{name:"Late",value:3}]}
                cx="50%" cy="50%" outerRadius={60} dataKey="value">
                <Cell fill={C.green}/><Cell fill={C.red}/><Cell fill={C.amber}/>
              </Pie>
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize:22, fontWeight:800, textAlign:"center", color:C.green }}>92%</div>
          <div style={{ fontSize:12, textAlign:"center", color:C.gray500 }}>Overall attendance this year</div>
        </Card>
      </div>

      {/* Quick access */}
      <Card style={{ marginBottom:22 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Quick Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
          {[
            { icon:"📅", label:"Attendance", page:"attendance" },
            { icon:"📝", label:"Daily Tests", page:"tests" },
            { icon:"📊", label:"Weekly Reports", page:"weekly" },
            { icon:"📚", label:"Subjects", page:"subjects" },
            { icon:"📋", label:"Assignments", page:"assignments" },
            { icon:"🔔", label:"Notices", page:"announcements" },
          ].map(q => (
            <button key={q.page} onClick={()=>onNav(q.page)}
              style={{ background:C.gray50, border:`1px solid ${C.gray200}`, borderRadius:10, padding:"14px 8px",
                cursor:"pointer", textAlign:"center", display:"flex", flexDirection:"column",
                alignItems:"center", gap:6, transition:"all 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueLight}
              onMouseLeave={e=>e.currentTarget.style.background=C.gray50}>
              <span style={{ fontSize:22 }}>{q.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>{q.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent activity */}
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Recent Activity</div>
        {[
          { icon:"📝", text:"Mathematics test result uploaded: 87/100", time:"Today, 10:30 AM", color:C.blue },
          { icon:"📅", text:"Attendance marked: Present for June 10", time:"Today, 8:15 AM", color:C.green },
          { icon:"📋", text:"New assignment: Quadratic Equations Practice Set", time:"Yesterday, 3:00 PM", color:C.purple },
          { icon:"🔔", text:"Announcement: PTM scheduled for June 20", time:"June 7, 2:00 PM", color:C.amber },
          { icon:"💬", text:"Teacher remark added by Ms. Priya Rajan", time:"June 6, 5:00 PM", color:C.red },
        ].map((a,i) => (
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0",
            borderBottom: i<4 ? `1px solid ${C.gray100}` : "none" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:a.color+"22", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:C.gray800, fontWeight:500 }}>{a.text}</div>
              <div style={{ fontSize:11, color:C.gray400, marginTop:2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── STUDENT PROFILE ─────────────────────────────────────────────────────────
const StudentProfile = ({ onNav }) => {
  const s = STUDENTS[0];
  const avgMarks = Math.round(TESTS.reduce((a,t)=>a+t.marks/t.max*100,0)/TESTS.length);

  return (
    <div>
      <SectionHeader title="Student Profile" subtitle="Academic and personal information" onBack={() => onNav("dashboard")} />
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:18 }}>
        {/* Left: identity card */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ textAlign:"center", paddingBottom:16 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:C.blue, margin:"0 auto 12px",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff" }}>
                {s.name.split(" ").map(x=>x[0]).join("")}
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:C.gray900 }}>{s.name}</div>
              <div style={{ fontSize:13, color:C.gray500, marginTop:4 }}>Roll No: {s.roll_No}</div>
              <div style={{ marginTop:10, display:"inline-block", background:C.blueLight,
                color:C.blue, fontSize:12, fontWeight:600, padding:"4px 14px", borderRadius:99 }}>
                Class {s.class_name} – Section {s.section}
              </div>
            </div>
            <div style={{ borderTop:`1px solid ${C.gray100}`, paddingTop:14 }}>
              {[
  { l:"Academic Year", v:s.academic_year },
  { l:"Date of Birth", v:"15/3/2011" },
  { l:"Parent Name", v:s.parent_name },
  { l:"Parent Email", v:s.parent_email },
].map(r => (
                <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0",
                  borderBottom:`1px solid ${C.gray50}`, fontSize:13 }}>
                  <span style={{ color:C.gray500 }}>{r.l}</span>
                  <span style={{ color:C.gray800, fontWeight:500, textAlign:"right", maxWidth:160 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: academic overview */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            <StatCard onClick={() => onNav("subjects")} icon="📊" label="Overall Grade" value={grade(avgMarks)} sub={`${avgMarks}% average`} accent={C.purple} />
            <StatCard onClick={() => onNav("attendance")} icon="📅" label="Attendance" value="92%" sub="Present most days" accent={C.green} />
            <StatCard onClick={() => onNav("tests")} icon="📝" label="Tests Taken" value={TESTS.length} sub="This term" accent={C.blue} />
          </div>

          <Card>
            <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Subject Performance Overview</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {SUBJECTS.map(sub => {
                const subTests = TESTS.filter(t=>t.subject===sub);
                if (!subTests.length) return null;
                const avg = Math.round(subTests.reduce((a,t)=>a+t.marks/t.max*100,0)/subTests.length);
                return (
                  <div key={sub} style={{ background:C.gray50, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>{sub}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:gradeColor(avg) }}>{avg}%</span>
                    </div>
                    <div style={{ background:C.gray200, borderRadius:4, height:5 }}>
                      <div style={{ width:`${avg}%`, background:gradeColor(avg), borderRadius:4, height:5, transition:"width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:12 }}>Recent Achievements</div>
            {["Scored 95% in Computer Science Weekly Assessment","Submitted Science Lab Report on time","Consistent 90%+ in English all semester"].map((a,i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
                <span style={{ color:C.green, fontSize:14, flexShrink:0 }}>✓</span>
                <span style={{ fontSize:13, color:C.gray700 }}>{a}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
const AttendancePage = ({ onNav }) => {
  const present = ATTENDANCE.filter(a=>a.status==="Present").length;
  const absent = ATTENDANCE.filter(a=>a.status==="Absent").length;
  const late = ATTENDANCE.filter(a=>a.status==="Late").length;
  const total = ATTENDANCE.length;

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="Track daily and monthly attendance records" onBack={() => onNav("dashboard")} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <StatCard icon="📅" label="Total Days" value={total} accent={C.blue} />
        <StatCard icon="✅" label="Present" value={present} sub={`${Math.round(present/total*100)}%`} accent={C.green} />
        <StatCard icon="❌" label="Absent" value={absent} sub={`${Math.round(absent/total*100)}%`} accent={C.red} />
        <StatCard icon="⏰" label="Late" value={late} sub={`${Math.round(late/total*100)}%`} accent={C.amber} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Monthly Attendance</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_ATT}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="present" fill={C.green} name="Present" radius={[3,3,0,0]} />
              <Bar dataKey="absent" fill={C.red} name="Absent" radius={[3,3,0,0]} />
              <Bar dataKey="late" fill={C.amber} name="Late" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Attendance Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={[{name:"Present",value:present},{name:"Absent",value:absent},{name:"Late",value:late}]}
                cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                <Cell fill={C.green}/><Cell fill={C.red}/><Cell fill={C.amber}/>
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign:"center", marginTop:8 }}>
            <span style={{ fontSize:28, fontWeight:800, color:C.green }}>92%</span>
            <div style={{ fontSize:12, color:C.gray500 }}>Overall attendance</div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Daily Attendance Log</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:8 }}>
          {ATTENDANCE.map(a => {
            const [bg,fg] = statusBadge(a.status);
            return (
              <div key={a.date} style={{ background:bg, borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:fg, fontWeight:600 }}>{new Date(a.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                <div style={{ fontSize:12, color:fg, fontWeight:700, marginTop:2 }}>{a.status}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── DAILY TESTS ──────────────────────────────────────────────────────────────
const TestsPage = ({ onNav }) => {
  const [filterSub, setFilterSub] = useState("All");
  const filtered = filterSub==="All" ? TESTS : TESTS.filter(t=>t.subject===filterSub);

  return (
    <div>
      <SectionHeader title="Daily Tests" subtitle="All test results and marks across subjects" onBack={() => onNav("dashboard")} />

      {/* Filter */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
        {["All",...SUBJECTS].map(s => (
          <button key={s} onClick={()=>setFilterSub(s)}
            style={{ padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${C.gray200}`,
              cursor:"pointer", background:filterSub===s?C.blue:C.white, color:filterSub===s?"#fff":C.gray600 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, marginBottom:22 }}>
        {filtered.map(t => {
          const pct = Math.round(t.marks/t.max*100);
          return (
            <Card key={t.id} style={{ borderLeft:`4px solid ${gradeColor(pct)}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>{t.subject}</div>
                  <div style={{ fontSize:11, color:C.gray500, marginTop:2 }}>{new Date(t.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
                <Badge label={t.type.replace(" ","\u00A0")} />
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, margin:"10px 0 6px" }}>
                <span style={{ fontSize:28, fontWeight:800, color:gradeColor(pct) }}>{t.marks}</span>
                <span style={{ fontSize:14, color:C.gray400 }}>/ {t.max}</span>
                <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:gradeColor(pct) }}>{pct}% · {grade(pct)}</span>
              </div>
              <div style={{ background:C.gray100, borderRadius:4, height:6, marginBottom:10 }}>
                <div style={{ width:`${pct}%`, background:gradeColor(pct), borderRadius:4, height:6 }} />
              </div>
              {t.remarks && <div style={{ fontSize:12, color:C.gray500, fontStyle:"italic" }}>"{t.remarks}"</div>}
            </Card>
          );
        })}
      </div>

      {/* Analytics */}
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Subject Comparison (Avg Marks %)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SUBJECTS.map(s => {
            const sub = TESTS.filter(t=>t.subject===s);
            return { subject:s.split(" ")[0], avg:sub.length?Math.round(sub.reduce((a,t)=>a+t.marks/t.max*100,0)/sub.length):0 };
          })}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
            <XAxis dataKey="subject" tick={{ fontSize:11 }} />
            <YAxis domain={[0,100]} tick={{ fontSize:11 }} />
            <Tooltip />
            <Bar dataKey="avg" fill={C.blue} name="Average %" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
const AssignmentsPage = ({ onNav }) => {
  const [filter, setFilter] = useState("All");
  const counts = { All:ASSIGNMENTS.length, Pending:ASSIGNMENTS.filter(a=>a.status==="Pending").length,
    Submitted:ASSIGNMENTS.filter(a=>a.status==="Submitted").length, Overdue:ASSIGNMENTS.filter(a=>a.status==="Overdue").length };
  const filtered = filter==="All" ? ASSIGNMENTS : ASSIGNMENTS.filter(a=>a.status===filter);

  return (
    <div>
      <SectionHeader title="Assignments" subtitle="Track all assignments across subjects" onBack={() => onNav("dashboard")} />
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        {["All","Pending","Submitted","Overdue"].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"7px 16px", borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${C.gray200}`,
              cursor:"pointer", background:filter===f?C.blue:C.white, color:filter===f?"#fff":C.gray600 }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(a => (
          <Card key={a.id} style={{ borderLeft:`4px solid ${a.status==="Submitted"?C.green:a.status==="Overdue"?C.red:C.amber}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{a.title}</span>
                  <Badge label={a.status} />
                </div>
                <div style={{ fontSize:13, color:C.gray500, marginBottom:6 }}>
                  <span style={{ background:C.gray100, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, color:C.gray600 }}>{a.subject}</span>
                  <span style={{ marginLeft:10 }}>Due: {new Date(a.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                <div style={{ fontSize:12, color:C.gray600 }}>{a.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── WEEKLY REPORTS ───────────────────────────────────────────────────────────
const WeeklyReports = ({ onNav }) => {
  const [selected, setSelected] = useState(WEEKLY_REPORTS[0]);

  return (
    <div>
      <SectionHeader title="Weekly Reports" subtitle="Comprehensive weekly academic summaries" onBack={() => onNav("dashboard")} />
      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:18 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {WEEKLY_REPORTS.map(r => (
            <button key={r.id} onClick={()=>setSelected(r)}
              style={{ background:selected.id===r.id?C.blueLight:C.white, border:`1px solid ${selected.id===r.id?C.blue:C.gray200}`,
                borderRadius:10, padding:"14px 16px", textAlign:"left", cursor:"pointer" }}>
              <div style={{ fontSize:13, fontWeight:700, color:selected.id===r.id?C.blue:C.gray800 }}>{r.week}</div>
              <div style={{ fontSize:11, color:C.gray500, marginTop:4 }}>{r.attendance}</div>
            </button>
          ))}
        </div>

        <Card>
          <div style={{ fontSize:16, fontWeight:800, color:C.gray900, marginBottom:4 }}>{selected.week}</div>
          <div style={{ fontSize:12, color:C.gray500, marginBottom:18 }}>By {selected.teacher}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
            <StatCard icon="📅" label="Attendance" value={selected.attendance.split(" ")[0]} sub="days present" accent={C.green} />
            <StatCard icon="📋" label="Assignments" value={`${selected.assignmentsCompleted}/${selected.assignmentsTotal}`} sub="completed" accent={C.blue} />
            <StatCard icon="📚" label="Subjects" value={selected.subjects.length} sub="covered this week" accent={C.purple} />
          </div>
          <div style={{ background:C.gray50, borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:8 }}>TEACHER'S REMARKS</div>
            <div style={{ fontSize:14, color:C.gray800, lineHeight:1.7 }}>{selected.remarks}</div>
          </div>
          <div style={{ background:"#FEF3C7", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#92400E", marginBottom:8 }}>AREAS FOR IMPROVEMENT</div>
            {selected.areas.map((a,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <span style={{ color:C.amber, fontWeight:700 }}>→</span>
                <span style={{ fontSize:13, color:C.gray700 }}>{a}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── SUBJECT PERFORMANCE ──────────────────────────────────────────────────────
const SubjectPerformance = ({ onNav }) => {
  const [activeSub, setActiveSub] = useState("Mathematics");
  const subTests = TESTS.filter(t=>t.subject===activeSub);
  const avg = subTests.length ? Math.round(subTests.reduce((a,t)=>a+t.marks/t.max*100,0)/subTests.length) : 0;
  const highest = subTests.length ? Math.max(...subTests.map(t=>t.marks/t.max*100)) : 0;
  const lowest = subTests.length ? Math.min(...subTests.map(t=>t.marks/t.max*100)) : 0;

  return (
    <div>
      <SectionHeader title="Subject Performance" subtitle="Deep-dive into each subject's progress" onBack={() => onNav("dashboard")} />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {SUBJECTS.map(s => (
          <button key={s} onClick={()=>setActiveSub(s)}
            style={{ padding:"7px 16px", borderRadius:99, fontSize:12, fontWeight:600, border:`1px solid ${activeSub===s?SUBJECT_COLORS[s]:C.gray200}`,
              cursor:"pointer", background:activeSub===s?SUBJECT_COLORS[s]:C.white, color:activeSub===s?"#fff":C.gray600 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        <StatCard icon="📝" label="Tests Taken" value={subTests.length} accent={SUBJECT_COLORS[activeSub]} />
        <StatCard icon="📊" label="Average" value={`${avg}%`} sub={grade(avg)} accent={SUBJECT_COLORS[activeSub]} />
        <StatCard icon="⬆" label="Highest" value={`${Math.round(highest)}%`} accent={C.green} />
        <StatCard icon="⬇" label="Lowest" value={`${Math.round(lowest)}%`} accent={C.red} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Score History</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={subTests.slice().reverse().map((t,i)=>({ test:`Test ${i+1}`, score:Math.round(t.marks/t.max*100) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
              <XAxis dataKey="test" tick={{ fontSize:11 }} />
              <YAxis domain={[0,100]} tick={{ fontSize:11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke={SUBJECT_COLORS[activeSub]} fill={SUBJECT_COLORS[activeSub]+"22"} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>All Subjects Comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SUBJECTS.map(s => {
              const sub = TESTS.filter(t=>t.subject===s);
              return { name:s.split(" ")[0], avg:sub.length?Math.round(sub.reduce((a,t)=>a+t.marks/t.max*100,0)/sub.length):0 };
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
              <XAxis dataKey="name" tick={{ fontSize:10 }} />
              <YAxis domain={[0,100]} tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="avg" radius={[4,4,0,0]}>
                {SUBJECTS.map(s => <Cell key={s} fill={s===activeSub?SUBJECT_COLORS[activeSub]:C.gray300} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Test History – {activeSub}</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.gray50 }}>
              {["Date","Type","Marks","Out Of","%","Grade","Remarks"].map(h => (
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontWeight:700, color:C.gray600,
                  fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subTests.map(t => {
              const pct = Math.round(t.marks/t.max*100);
              return (
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.gray100}` }}>
                  <td style={{ padding:"10px 12px", color:C.gray700 }}>{new Date(t.date).toLocaleDateString("en-IN")}</td>
                  <td style={{ padding:"10px 12px" }}><Badge label={t.type.split(" ")[0]} /></td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:gradeColor(pct) }}>{t.marks}</td>
                  <td style={{ padding:"10px 12px", color:C.gray500 }}>{t.max}</td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:gradeColor(pct) }}>{pct}%</td>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:gradeColor(pct) }}>{grade(pct)}</td>
                  <td style={{ padding:"10px 12px", color:C.gray500, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.remarks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── YEARLY PROGRESS ──────────────────────────────────────────────────────────
const YearlyProgress = ({ onNav }) => (
  <div>
    <SectionHeader title="Yearly Progress" subtitle="Academic growth across the full year" onBack={() => onNav("dashboard")} />
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
      <StatCard icon="📈" label="Year Average" value="83%" sub="Strong performer" accent={C.blue} />
      <StatCard icon="🏆" label="Best Subject" value="Comp. Sci" sub="Avg 91%" accent={C.green} />
      <StatCard icon="📅" label="Annual Attendance" value="92%" sub="Well above 75% threshold" accent={C.purple} />
    </div>

    <Card style={{ marginBottom:18 }}>
      <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>All Subjects – Monthly Trend</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={PERF_TREND}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
          <XAxis dataKey="month" tick={{ fontSize:11 }} />
          <YAxis domain={[50,100]} tick={{ fontSize:11 }} />
          <Tooltip />
          <Legend iconSize={10} wrapperStyle={{ fontSize:12 }} />
          {SUBJECTS.map(s => (
            <Line key={s} type="monotone" dataKey={s} stroke={SUBJECT_COLORS[s]} dot={{ r:3 }} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Strength Areas</div>
        {["Computer Science – consistently above 88%","English – steady improvement all year","Mathematics – strong upward trend"].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
            <span style={{ color:C.green, fontWeight:700, fontSize:16 }}>↑</span>
            <span style={{ fontSize:13, color:C.gray700 }}>{s}</span>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Areas for Improvement</div>
        {["Social Studies – inconsistent scores","Science – needs revision of Physics chapters"].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
            <span style={{ color:C.amber, fontWeight:700, fontSize:16 }}>!</span>
            <span style={{ fontSize:13, color:C.gray700 }}>{s}</span>
          </div>
        ))}
      </Card>
    </div>

    <Card>
      <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Predicted Half-Yearly Performance</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
        {SUBJECTS.map(s => {
          const trend = PERF_TREND.slice(-2);
          const pred = Math.min(100, Math.round(trend[1][s] + (trend[1][s]-trend[0][s])*0.5));
          return (
            <div key={s} style={{ background:C.gray50, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gray600, marginBottom:4 }}>{s.split(" ")[0]}</div>
              <div style={{ fontSize:22, fontWeight:800, color:gradeColor(pred) }}>{pred}%</div>
              <div style={{ fontSize:11, color:C.gray500 }}>Predicted</div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

// ─── TEACHER REMARKS ──────────────────────────────────────────────────────────
let REMARKS = [];

const TeacherRemarks = ({ onNav }) => {
  const remarks = REMARKS;
  const typeColor = { Achievement:[C.greenLight,"#065F46"], Recommendation:[C.blueLight,C.blue], Improvement:[C.amberLight,"#92400E"] };

  return (
    <div>
      <SectionHeader title="Teacher Remarks" subtitle="Feedback from Aryan's teachers" onBack={() => onNav("dashboard")} />
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {remarks.map((r,i) => {
          const [bg,fg] = typeColor[r.type] || [C.gray100,C.gray700];
          return (
            <Card key={i} style={{ borderLeft:`4px solid ${fg}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:22 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{r.teacher}</div>
                    <div style={{ fontSize:12, color:C.gray500 }}>{r.subject} · {new Date(r.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                </div>
                <span style={{ background:bg, color:fg, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99 }}>{r.type}</span>
              </div>
              <div style={{ fontSize:14, color:C.gray700, lineHeight:1.7, fontStyle:"italic" }}>"{r.text}"</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const AnnouncementsPage = ({ onNav }) => {
  const [ann, setAnn] = useState(ANNOUNCEMENTS);
  const markRead = (id) => setAnn(a=>a.map(n=>n.id===id?{...n,read:true}:n));
  const catColor = { Exam:[C.redLight,C.red], Event:[C.blueLight,C.blue], Academic:[C.purpleLight,C.purple] };

  return (
    <div>
      <SectionHeader title="Announcements" subtitle="School notices and important communications" onBack={() => onNav("dashboard")} />
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {ann.map(a => {
          const [bg,fg] = catColor[a.category] || [C.gray100,C.gray700];
          return (
            <Card key={a.id} style={{ opacity:a.read?0.75:1, borderLeft:`4px solid ${a.read?C.gray300:fg}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    {!a.read && <span style={{ width:8, height:8, borderRadius:"50%", background:fg, display:"inline-block" }} />}
                    <span style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{a.title}</span>
                    <span style={{ background:bg, color:fg, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99 }}>{a.category}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.gray500, marginBottom:8 }}>{new Date(a.date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
                  <div style={{ fontSize:13, color:C.gray700, lineHeight:1.6 }}>{a.body}</div>
                </div>
              </div>
              {!a.read && (
                <button onClick={()=>markRead(a.id)} style={{ marginTop:10, fontSize:12, color:C.blue, background:"none",
                  border:`1px solid ${C.blue}`, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontWeight:600 }}>
                  Mark as read
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const ADMIN_NAV = [
  { id: "admin_dashboard", label: "User Management", icon: "👥" }
];

const AdminSidebar = ({ active, onNav, collapsed, onToggle }) => (
  <aside className="app-sidebar" style={{
    width: collapsed ? 64 : 230, minHeight:"100vh", background:C.navyDark,
    display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0,
    position:"sticky", top:0, height:"100vh", overflowY:"auto", overflowX:"hidden",
  }}>
    <div style={{ padding: collapsed ? "18px 0" : "20px 18px", borderBottom:`1px solid rgba(255,255,255,0.08)`,
      display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ width:34, height:34, borderRadius:8, background:C.purple, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>A</div>
      {!collapsed && <div>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15, lineHeight:1 }}>Admin Portal</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginTop:2 }}>Sunrise Academy</div>
      </div>}
    </div>
    {!collapsed && (
      <div style={{ margin:"14px 14px 6px", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:C.purple, display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>A</div>
          <div>
            <div style={{ color:"#fff", fontSize:12, fontWeight:600 }}>{localStorage.getItem("userName") || "Admin"}</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>Administrator</div>
          </div>
        </div>
      </div>
    )}
    <nav style={{ padding:"8px 8px", flex:1 }}>
      {ADMIN_NAV.map(n => (
        <button key={n.id} onClick={() => onNav(n.id)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding: collapsed ? "10px 0" : "9px 12px",
            marginBottom:2, borderRadius:8, border:"none", cursor:"pointer", textAlign:"left",
            background: active===n.id ? "rgba(124,58,237,0.8)" : "transparent",
            color: active===n.id ? "#fff" : "rgba(255,255,255,0.65)",
            justifyContent: collapsed ? "center" : "flex-start",
            transition:"all 0.15s", fontSize:13, fontWeight: active===n.id ? 600 : 400,
          }}>
          <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
          {!collapsed && <span>{n.label}</span>}
        </button>
      ))}
    </nav>
  </aside>
);

const AdminDashboard = ({ onNav }) => {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Parent" });
  const [loading, setLoading] = useState(false);

  const API = `http://172.23.51.82/progress-view-api/api.php`;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}?action=getAllData`);
      const data = await res.json();
      if (data.success && data.data && data.data.users) {
        setUsers(data.data.users);
        USERS = data.data.users;
      }
    } catch(e) {
      alert("Could not reach server: " + e.message);
    }
  };

  // Always fetch fresh users from server on mount
  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const isEdit = !!newUser.id;
      const res = await fetch(`${API}?action=${isEdit ? 'editUser' : 'addUser'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        alert(isEdit ? "✅ User updated successfully!" : "✅ User added successfully!");
        setNewUser({ name: "", email: "", password: "", role: "Parent" });
        setShowAdd(false);
        await fetchUsers(); // await so table refreshes immediately
      } else {
        alert("❌ Error: " + (data.message || "Unknown error"));
      }
    } catch(err) {
      alert("❌ Network Error: Could not reach server.\n" + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`${API}?action=deleteUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
          await fetchUsers();
        } else {
          alert("❌ Error: " + data.message);
        }
      } catch(err) {
        alert("❌ Network Error: " + err.message);
      }
    }
  };

  const handleCopy = (user) => {
    // No id so it will call addUser (not editUser)
    setNewUser({ name: user.name + " (Copy)", email: "", password: user.password, role: user.role });
    setShowAdd(true);
  };

  return (
    <div>
      <SectionHeader title="User Management" subtitle="Manage system access and credentials" />
      
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: 16 }}>
        <button onClick={() => { setShowAdd(v => { if (v) setNewUser({ name: "", email: "", password: "", role: "Parent" }); return !v; })} } style={{
          background: C.blue, color: "#fff", padding: "8px 16px", borderRadius: 6,
          fontWeight: 600, border: "none", cursor: "pointer", display:"flex", alignItems:"center", gap:6
        }}>
          {showAdd ? "Cancel" : "Add New User"}
        </button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>{newUser.id ? "✏️ Edit User" : "➕ Add New User"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Full Name</label>
              <input type="text" value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})}
                style={{ width:"100%", padding:"8px 12px", borderRadius:6, border:`1px solid ${C.gray300}` }} placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Email Address</label>
              <input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})}
                style={{ width:"100%", padding:"8px 12px", borderRadius:6, border:`1px solid ${C.gray300}` }} placeholder="user@email.com" />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Password</label>
              <input type="text" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}
                style={{ width:"100%", padding:"8px 12px", borderRadius:6, border:`1px solid ${C.gray300}` }} placeholder="Password" />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Role</label>
              <select value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}
                style={{ width:"100%", padding:"8px 12px", borderRadius:6, border:`1px solid ${C.gray300}`, background:"#fff" }}>
                <option value="Parent">Parent</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <button onClick={handleAddUser} disabled={loading} style={{
            background: C.green, color: "#fff", padding: "8px 16px", borderRadius: 6,
            fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Saving…" : (newUser.id ? "Save Changes" : "Save User")}
          </button>
        </Card>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.gray200}`, color: C.gray500 }}>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>Password</th>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>Role</th>
                <th style={{ padding: "12px 8px", fontWeight: 600 }}>Created At</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                  <td style={{ padding: "12px 8px", color: C.gray500 }}>{u.id}</td>
                  <td style={{ padding: "12px 8px", fontWeight: 600, color: C.gray800 }}>{u.name}</td>
                  <td style={{ padding: "12px 8px", color: C.gray700 }}>{u.email}</td>
                  <td style={{ padding: "12px 8px", color: C.gray500 }}>{u.password}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: u.role === "Admin" ? C.purpleLight : u.role === "Teacher" ? C.amberLight : C.blueLight,
                      color: u.role === "Admin" ? C.purple : u.role === "Teacher" ? C.amber : C.blue
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px 8px", color: C.gray500, fontSize: 12 }}>{u.createdAt}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    <button onClick={() => {
                      setNewUser(u);
                      setShowAdd(true);
                    }} style={{ background:"none", border:"none", color: C.blue, cursor:"pointer", marginRight:8, fontSize:13, fontWeight:600 }}>Edit</button>
                    <button onClick={() => handleCopy(u)} style={{ background:"none", border:"none", color: C.amber, cursor:"pointer", marginRight:8, fontSize:13, fontWeight:600 }}>Copy</button>
                    <button onClick={() => handleDelete(u.id)} style={{ background:"none", border:"none", color: C.red, cursor:"pointer", fontSize:13, fontWeight:600 }}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: C.gray400 }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── TEACHER UI COMPONENTS ────────────────────────────────────────────────────
const TeacherSidebar = ({ active, onNav, collapsed, onToggle }) => (
  <aside className="app-sidebar" style={{
    width: collapsed ? 64 : 230, minHeight:"100vh", background:C.navyDark,
    display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0,
    position:"sticky", top:0, height:"100vh", overflowY:"auto", overflowX:"hidden",
  }}>
    <div style={{ padding: collapsed ? "18px 0" : "20px 18px", borderBottom:`1px solid rgba(255,255,255,0.08)`,
      display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ width:34, height:34, borderRadius:8, background:C.amber, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>T</div>
      {!collapsed && <div>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15, lineHeight:1 }}>Teacher Portal</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginTop:2 }}>Sunrise Academy</div>
      </div>}
    </div>
    {!collapsed && (
      <div style={{ margin:"14px 14px 6px", background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:C.amber, display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>K</div>
          <div>
            <div style={{ color:"#fff", fontSize:12, fontWeight:600 }}>{localStorage.getItem("userName") || "Teacher"}</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>Class 10-A</div>
          </div>
        </div>
      </div>
    )}
    <nav style={{ padding:"8px 8px", flex:1 }}>
      {TEACHER_NAV.map(n => (
        <button key={n.id} onClick={() => onNav(n.id)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding: collapsed ? "10px 0" : "9px 12px",
            marginBottom:2, borderRadius:8, border:"none", cursor:"pointer", textAlign:"left",
            background: active===n.id ? "rgba(217,119,6,0.8)" : "transparent",
            color: active===n.id ? "#fff" : "rgba(255,255,255,0.65)",
            justifyContent: collapsed ? "center" : "flex-start",
            transition:"all 0.15s", fontSize:13, fontWeight: active===n.id ? 600 : 400,
          }}>
          <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
          {!collapsed && <span>{n.label}</span>}
        </button>
      ))}
    </nav>
  </aside>
);

const TeacherDashboard = ({ onNav }) => {
  return (
    <div>
      <SectionHeader title="Class Overview" subtitle="Quick view of Class 10-A" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <StatCard icon="👥" label="Total Students" value={STUDENTS.length} accent={C.blue} />
        <StatCard icon="📅" label="Avg Attendance" value="92%" accent={C.green} />
        <StatCard icon="📝" label="Assignments Pending" value={ASSIGNMENTS.filter(a=>a.status==="Pending").length} accent={C.amber} />
      </div>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.gray800, marginBottom:14 }}>Students List</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.gray50 }}>
              <th style={{ padding:"10px 12px", textAlign:"left", fontWeight:700, color:C.gray600 }}>Roll No</th>
              <th style={{ padding:"10px 12px", textAlign:"left", fontWeight:700, color:C.gray600 }}>Name</th>
              <th style={{ padding:"10px 12px", textAlign:"left", fontWeight:700, color:C.gray600 }}>Grade</th>
              <th style={{ padding:"10px 12px", textAlign:"center", fontWeight:700, color:C.gray600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map(s => (
              <tr key={s.id} style={{ borderBottom:`1px solid ${C.gray100}` }}>
                <td style={{ padding:"10px 12px", color:C.gray700 }}>{s.roll_No}</td>
                <td style={{ padding:"10px 12px", fontWeight:600, color:C.gray900 }}>{s.name}</td>
                <td style={{ padding:"10px 12px", fontWeight:700, color:C.green }}>{s.grade}</td>
                <td style={{ padding:"10px 12px", textAlign:"center" }}>
                  <button onClick={() => onNav("teacher_edit")} style={{ padding:"4px 12px", background:C.blueLight, color:C.blue, border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 }}>Edit Records</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const TeacherEditAcademic = ({ updateApp }) => {
  const [tab, setTab] = useState("Tests");

  const [testForm, setTestForm] = useState({ subject:SUBJECTS[0], date:new Date().toISOString().split('T')[0], marks:"", max:100, type:"Daily Test", remarks:"" });
  const [attForm, setAttForm] = useState({ date:new Date().toISOString().split('T')[0], status:"Present" });
  const [assForm, setAssForm] = useState({ title:"", subject:SUBJECTS[0], dueDate:new Date().toISOString().split('T')[0], status:"Pending", desc:"" });
  const [remForm, setRemForm] = useState({ type:"Achievement", text:"" });

  const submitTest = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...testForm, marks: Number(testForm.marks), max: Number(testForm.max) };
      const res = await fetch(`http://172.23.51.82/progress-view-api/api.php?action=addTest`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        TESTS.unshift(data.data);
        alert("Test added successfully!");
        setTestForm({ ...testForm, marks:"", remarks:"" });
        updateApp();
      } else {
        alert("Server Error: " + data.message);
      }
    } catch(err) {
      alert("Network Error");
    }
  };

  const submitAtt = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://172.23.51.82/progress-view-api/api.php?action=addAttendance`, {
        method: 'POST',
        body: JSON.stringify(attForm)
      });
      const data = await res.json();
      if (data.success) {
        ATTENDANCE.unshift(data.data);
        alert("Attendance recorded!");
        updateApp();
      } else {
        alert("Server Error: " + data.message);
      }
    } catch(err) {
      alert("Network Error");
    }
  };

  const submitAss = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://172.23.51.82/progress-view-api/api.php?action=addAssignment`, {
        method: 'POST',
        body: JSON.stringify(assForm)
      });
      const data = await res.json();
      if (data.success) {
        ASSIGNMENTS.unshift(data.data);
        alert("Assignment added!");
        setAssForm({ ...assForm, title:"", desc:"" });
        updateApp();
      } else {
        alert("Server Error: " + data.message);
      }
    } catch(err) {
      alert("Network Error");
    }
  };

  const submitRem = async (e) => {
    e.preventDefault();
    const iconMap = { Achievement:"🏆", Recommendation:"📝", Improvement:"📊" };
    const payload = {
      teacher: localStorage.getItem("userName") || "Teacher",
      subject: "Class Teacher",
      date: new Date().toISOString().split('T')[0],
      type: remForm.type,
      text: remForm.text,
      icon: iconMap[remForm.type] || "💬"
    };
    try {
      const res = await fetch(`http://172.23.51.82/progress-view-api/api.php?action=addRemark`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        REMARKS.unshift(data.data);
        alert("Remark added!");
        setRemForm({ ...remForm, text:"" });
        updateApp();
      } else {
        alert("Server Error: " + data.message);
      }
    } catch(err) {
      alert("Network Error");
    }
  };

  const tabs = ["Tests", "Assignments", "Attendance", "Remarks"];

  return (
    <div>
      <SectionHeader title="Edit Student Records" subtitle="Add new academic entries for Sri Rakesh. R" />
      <div style={{ display:"flex", gap:10, marginBottom:20, borderBottom:`1px solid ${C.gray200}`, paddingBottom:10 }}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"8px 16px", borderRadius:8, border:"none", background:tab===t?C.blue:C.gray100, color:tab===t?"#fff":C.gray700, fontWeight:600, cursor:"pointer" }}>
            {t}
          </button>
        ))}
      </div>

      <Card>
        {tab === "Tests" && (
          <form onSubmit={submitTest} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ margin:0, fontSize:16, color:C.gray900 }}>Add New Test Score</h3>
            <div className="responsive-row">
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Subject</label><select value={testForm.subject} onChange={e=>setTestForm({...testForm,subject:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}` }}>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Type</label><select value={testForm.type} onChange={e=>setTestForm({...testForm,type:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}` }}><option>Daily Test</option><option>Weekly Assessment</option><option>Monthly Assessment</option></select></div>
            </div>
            <div className="responsive-row">
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Date</label><input type="date" required value={testForm.date} onChange={e=>setTestForm({...testForm,date:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Marks</label><input type="number" required value={testForm.marks} onChange={e=>setTestForm({...testForm,marks:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Max Marks</label><input type="number" required value={testForm.max} onChange={e=>setTestForm({...testForm,max:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Remarks</label>
              <textarea value={testForm.remarks} onChange={e=>setTestForm({...testForm,remarks:e.target.value})} rows={3} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} />
            </div>
            <button type="submit" style={{ padding:"10px 16px", background:C.blue, color:"#fff", border:"none", borderRadius:6, fontWeight:600, cursor:"pointer", width:"fit-content" }}>Save Test Score</button>
          </form>
        )}
        
        {tab === "Assignments" && (
          <form onSubmit={submitAss} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ margin:0, fontSize:16, color:C.gray900 }}>Create New Assignment</h3>
            <div className="responsive-row">
              <div style={{ flex:2 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Title</label><input type="text" required value={assForm.title} onChange={e=>setAssForm({...assForm,title:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Subject</label><select value={assForm.subject} onChange={e=>setAssForm({...assForm,subject:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}` }}>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="responsive-row">
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Due Date</label><input type="date" required value={assForm.dueDate} onChange={e=>setAssForm({...assForm,dueDate:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Status</label><select value={assForm.status} onChange={e=>setAssForm({...assForm,status:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}` }}><option>Pending</option><option>Submitted</option><option>Overdue</option></select></div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Description</label>
              <textarea required value={assForm.desc} onChange={e=>setAssForm({...assForm,desc:e.target.value})} rows={3} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} />
            </div>
            <button type="submit" style={{ padding:"10px 16px", background:C.blue, color:"#fff", border:"none", borderRadius:6, fontWeight:600, cursor:"pointer", width:"fit-content" }}>Save Assignment</button>
          </form>
        )}

        {tab === "Attendance" && (
          <form onSubmit={submitAtt} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ margin:0, fontSize:16, color:C.gray900 }}>Record Attendance</h3>
            <div className="responsive-row">
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Date</label><input type="date" required value={attForm.date} onChange={e=>setAttForm({...attForm,date:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} /></div>
              <div style={{ flex:1 }}><label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Status</label><select value={attForm.status} onChange={e=>setAttForm({...attForm,status:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}` }}><option>Present</option><option>Absent</option><option>Late</option></select></div>
            </div>
            <button type="submit" style={{ padding:"10px 16px", background:C.blue, color:"#fff", border:"none", borderRadius:6, fontWeight:600, cursor:"pointer", width:"fit-content" }}>Save Attendance</button>
          </form>
        )}

        {tab === "Remarks" && (
          <form onSubmit={submitRem} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ margin:0, fontSize:16, color:C.gray900 }}>Add Teacher Remark</h3>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Type</label>
              <select value={remForm.type} onChange={e=>setRemForm({...remForm,type:e.target.value})} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }}>
                <option>Achievement</option><option>Improvement</option><option>Recommendation</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>Remark Text</label>
              <textarea required value={remForm.text} onChange={e=>setRemForm({...remForm,text:e.target.value})} rows={4} style={{ width:"100%", padding:8, marginTop:4, borderRadius:6, border:`1px solid ${C.gray300}`, boxSizing:"border-box" }} />
            </div>
            <button type="submit" style={{ padding:"10px 16px", background:C.blue, color:"#fff", border:"none", borderRadius:6, fontWeight:600, cursor:"pointer", width:"fit-content" }}>Save Remark</button>
          </form>
        )}
      </Card>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const role = typeof localStorage !== 'undefined' ? localStorage.getItem("userRole") : null;
  const [page, setPage] = useState(role === "Admin" ? "admin_dashboard" : role === "Teacher" ? "teacher_dashboard" : "dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetch(`http://172.23.51.82/progress-view-api/api.php?action=getAllData`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          TESTS = res.data.tests || [];
          ASSIGNMENTS = res.data.assignments || [];
          ATTENDANCE = res.data.attendance || [];
          REMARKS = res.data.remarks || [];
          USERS = res.data.users || [];
        }
        setDataLoaded(true);
      })
      .catch(err => {
        console.error("API Error:", err);
        setDataLoaded(true);
      });
  }, []);

  const forceUpdate = () => setUpdateKey(k => k + 1);

  if (!dataLoaded) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.navyDark, color:"#fff", fontSize: 18, fontWeight: 'bold' }}>Loading database...</div>;

  if (!loggedIn) return <LoginPage onLogin={() => {
    setLoggedIn(true);
    const r = localStorage.getItem("userRole");
    setPage(r === "Admin" ? "admin_dashboard" : r === "Teacher" ? "teacher_dashboard" : "dashboard");
  }} />;

  const pageMap = {
    dashboard: <Dashboard onNav={setPage} />,
    profile: <StudentProfile onNav={setPage} />,
    attendance: <AttendancePage onNav={setPage} />,
    tests: <TestsPage onNav={setPage} />,
    assignments: <AssignmentsPage onNav={setPage} />,
    weekly: <WeeklyReports onNav={setPage} />,
    subjects: <SubjectPerformance onNav={setPage} />,
    yearly: <YearlyProgress onNav={setPage} />,
    remarks: <TeacherRemarks onNav={setPage} />,
    announcements: <AnnouncementsPage onNav={setPage} />,
    teacher_dashboard: <TeacherDashboard onNav={setPage} />,
    teacher_edit: <TeacherEditAcademic updateApp={forceUpdate} />,
    admin_dashboard: <AdminDashboard onNav={setPage} />
  };

  return (
    <div key={updateKey} className="app-layout" style={{ background:C.gray50, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {role === "Admin" ?
        <AdminSidebar active={page} onNav={setPage} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(v=>!v)} /> :
       role === "Teacher" ? 
        <TeacherSidebar active={page} onNav={setPage} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(v=>!v)} /> :
        <Sidebar active={page} onNav={setPage} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(v=>!v)} />
      }
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar page={page} onLogout={()=>setLoggedIn(false)} />
        <main className="app-main-content" style={{ flex:1, padding:"22px 24px", overflowY:"auto" }}>
          {pageMap[page]}
        </main>
      </div>
    </div>
  );
}
