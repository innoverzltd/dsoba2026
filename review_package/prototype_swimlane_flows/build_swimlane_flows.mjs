import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const palette = [
  { header: "#FFE8A6", body: "#F5F5F5", node: "#FFE8A6", stroke: "#D6AE3E" },
  { header: "#D9C2F5", body: "#F5F5F5", node: "#D9C2F5", stroke: "#9C6FD2" },
  { header: "#B9E1FA", body: "#F5F5F5", node: "#B9E1FA", stroke: "#6BAED6" },
  { header: "#FFC0BE", body: "#F5F5F5", node: "#FFC0BE", stroke: "#DE7D79" },
  { header: "#C8E6C9", body: "#F5F5F5", node: "#C8E6C9", stroke: "#6AA56D" },
  { header: "#FFD6A5", body: "#F5F5F5", node: "#FFD6A5", stroke: "#C17A22" },
];

const flows = [
  {
    id: "01-public-site-design-selection",
    title: "Public Site Design Selection",
    lanes: ["Prototype Team", "Stakeholders", "Project Lead"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["content", 0, 1, "process", "Prepare same dummy content"],
      ["variants", 0, 2, "process", "Build 3 visual design directions"],
      ["review", 1, 3, "process", "Review Home / Events / Membership"],
      ["accepted", 1, 4, "decision", "Direction accepted?"],
      ["revise", 0, 5, "process", "Revise or combine selected elements"],
      ["select", 2, 5, "process", "Confirm selected route"],
      ["apply", 0, 6, "process", "Apply to all public sections"],
      ["coverage", 2, 7, "decision", "All sitemap sections covered?"],
      ["gap", 0, 8, "process", "Add missing section page"],
      ["ready", 2, 9, "status", "Status: ready for sign-off"],
    ],
    edges: [
      ["start", "content"], ["content", "variants"], ["variants", "review"], ["review", "accepted"],
      ["accepted", "revise", "No"], ["revise", "review"], ["accepted", "select", "Yes"],
      ["select", "apply"], ["apply", "coverage"], ["coverage", "gap", "No"], ["gap", "coverage"],
      ["coverage", "ready", "Yes"],
    ],
  },
  {
    id: "02-public-event-guest-registration",
    title: "Public Event Guest Registration",
    lanes: ["Public Visitor", "Public Site", "Event System", "Notification"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["open", 0, 1, "process", "Open public event detail"],
      ["audience", 1, 2, "decision", "Event audience is public?"],
      ["blocked", 1, 3, "status", "Status: alumni login required"],
      ["capacity", 2, 3, "decision", "Capacity available?"],
      ["waitlist", 2, 4, "status", "Status: waitlisted / enquiry only"],
      ["form", 0, 4, "process", "Enter guest attendee details"],
      ["valid", 2, 5, "decision", "Required fields valid?"],
      ["draft", 0, 6, "status", "Status: validation error"],
      ["payment", 2, 6, "decision", "Payment required?"],
      ["pay", 0, 7, "process", "Pay or receive payment link"],
      ["paid", 2, 8, "decision", "Payment successful?"],
      ["pending", 2, 9, "status", "Status: pending payment"],
      ["confirmed", 2, 10, "status", "Status: confirmed registration"],
      ["notify", 3, 11, "process", "Send email / WhatsApp notification"],
    ],
    edges: [
      ["start", "open"], ["open", "audience"], ["audience", "blocked", "No"], ["audience", "capacity", "Yes"],
      ["capacity", "waitlist", "No"], ["capacity", "form", "Yes"], ["form", "valid"],
      ["valid", "draft", "No"], ["draft", "form"], ["valid", "payment", "Yes"],
      ["payment", "pay", "Yes"], ["payment", "confirmed", "No"], ["pay", "paid"],
      ["paid", "pending", "No"], ["pending", "pay"], ["paid", "confirmed", "Yes"], ["confirmed", "notify"],
    ],
  },
  {
    id: "03-optional-public-account",
    title: "Optional Public Account",
    lanes: ["Public Visitor", "Public Site", "Account System", "Membership Path"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["choice", 0, 1, "decision", "Create / login account?"],
      ["guest", 1, 2, "status", "Status: continue as guest"],
      ["existing", 2, 2, "decision", "Existing public account?"],
      ["login", 0, 3, "process", "Login with email / mobile"],
      ["signup", 0, 4, "process", "Enter basic profile"],
      ["verify", 2, 5, "process", "Send verification code"],
      ["verified", 2, 6, "decision", "Verification successful?"],
      ["pending", 2, 7, "status", "Status: verification pending"],
      ["active", 2, 8, "status", "Status: active public account"],
      ["history", 1, 9, "process", "Show profile and event history"],
      ["upgrade", 3, 10, "decision", "Apply for alumni membership?"],
      ["publicOnly", 2, 11, "status", "Status: remains public account"],
      ["applicant", 3, 11, "status", "Status: alumni applicant"],
    ],
    edges: [
      ["start", "choice"], ["choice", "guest", "No"], ["choice", "existing", "Yes"],
      ["existing", "login", "Yes"], ["existing", "signup", "No"], ["signup", "verify"], ["verify", "verified"],
      ["verified", "pending", "No"], ["pending", "verify"], ["verified", "active", "Yes"], ["login", "active"],
      ["active", "history"], ["history", "upgrade"], ["upgrade", "publicOnly", "No"], ["upgrade", "applicant", "Yes"],
    ],
  },
  {
    id: "04-membership-application-approval",
    title: "Membership Application And Approval",
    lanes: ["Applicant", "Membership Admin", "School / Records", "GenCom", "System"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["draft", 0, 1, "status", "Status: draft application"],
      ["submit", 0, 2, "process", "Submit application details"],
      ["complete", 1, 3, "decision", "Application complete?"],
      ["pendingInfo", 0, 4, "status", "Status: pending information"],
      ["duplicate", 1, 5, "decision", "Duplicate record risk?"],
      ["resolve", 1, 6, "process", "Resolve duplicate / link record"],
      ["check", 2, 7, "process", "Confirm school qualification"],
      ["qualified", 1, 8, "decision", "Qualification confirmed?"],
      ["gencom", 3, 9, "status", "Status: pending GenCom"],
      ["decision", 3, 10, "decision", "Approve application?"],
      ["rejected", 4, 11, "status", "Status: rejected"],
      ["approved", 4, 11, "status", "Status: approved"],
      ["classify", 4, 12, "process", "Classify Youth / Trial / Life payment"],
      ["notify", 4, 13, "process", "Send notification"],
    ],
    edges: [
      ["start", "draft"], ["draft", "submit"], ["submit", "complete"], ["complete", "pendingInfo", "No"],
      ["pendingInfo", "submit"], ["complete", "duplicate", "Yes"], ["duplicate", "resolve", "Yes"],
      ["duplicate", "check", "No"], ["resolve", "check"], ["check", "qualified"], ["qualified", "rejected", "No"],
      ["qualified", "gencom", "Yes"], ["gencom", "decision"], ["decision", "rejected", "No"],
      ["decision", "approved", "Yes"], ["approved", "classify"], ["classify", "notify"],
    ],
  },
  {
    id: "05-youth-to-trial-conversion",
    title: "Youth To Trial Conversion",
    lanes: ["Scheduler", "Membership System", "Membership Admin", "Member"],
    nodes: [
      ["start", 0, 0, "start", "Daily lifecycle check"],
      ["dob", 1, 1, "decision", "Valid date of birth?"],
      ["exception", 2, 2, "status", "Status: manual DOB completion"],
      ["age", 1, 3, "decision", "Active Youth and age >= 18?"],
      ["noChange", 1, 4, "status", "Status: no change"],
      ["convert", 1, 5, "process", "Convert Youth to Trial"],
      ["audit", 1, 6, "process", "Write lifecycle audit log"],
      ["notify", 3, 7, "process", "Send status-change notification"],
      ["trial", 3, 8, "status", "Status: Active Trial Member"],
    ],
    edges: [
      ["start", "dob"], ["dob", "exception", "No"], ["dob", "age", "Yes"], ["age", "noChange", "No"],
      ["age", "convert", "Yes"], ["convert", "audit"], ["audit", "notify"], ["notify", "trial"],
    ],
  },
  {
    id: "06-trial-to-life-payment",
    title: "Trial To Life Payment",
    lanes: ["Scheduler", "Membership System", "Trial Member", "Payment Service"],
    nodes: [
      ["start", 0, 0, "start", "Check Trial Member age"],
      ["soon", 1, 1, "decision", "Approaching age 28?"],
      ["reminder", 1, 2, "status", "Status: payment due soon"],
      ["age28", 1, 3, "decision", "Has turned 28?"],
      ["activeTrial", 1, 4, "status", "Status: Active Trial"],
      ["pending", 1, 5, "status", "Status: Pending Life Payment"],
      ["open", 2, 6, "process", "Open Life payment link"],
      ["pay", 3, 7, "process", "Process HKD 2000 payment"],
      ["paid", 1, 8, "decision", "Payment completed?"],
      ["life", 1, 9, "status", "Status: Active Life Member"],
      ["inactive", 1, 9, "status", "Status: Inactive membership"],
      ["notify", 2, 10, "process", "Send status notification"],
    ],
    edges: [
      ["start", "soon"], ["soon", "reminder", "Yes"], ["soon", "age28", "No"], ["reminder", "age28"],
      ["age28", "activeTrial", "No"], ["age28", "pending", "Yes"], ["pending", "open"], ["open", "pay"],
      ["pay", "paid"], ["paid", "life", "Yes"], ["paid", "inactive", "No"], ["life", "notify"], ["inactive", "notify"],
    ],
  },
  {
    id: "07-annual-dinner-registration",
    title: "Annual Dinner Registration",
    lanes: ["Member", "Event Page", "Event System", "Payment", "Event Staff"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["openPage", 0, 1, "process", "Open Annual Dinner page"],
      ["open", 1, 2, "decision", "Registration open?"],
      ["closed", 1, 3, "status", "Status: registration closed"],
      ["choose", 0, 4, "decision", "Individual ticket or table?"],
      ["individual", 2, 5, "status", "Status: draft individual ticket"],
      ["table", 2, 5, "status", "Status: draft table booking"],
      ["capacity", 2, 6, "decision", "Capacity available?"],
      ["waitlist", 2, 7, "status", "Status: waitlisted"],
      ["details", 0, 7, "process", "Enter attendee / representative details"],
      ["payment", 3, 8, "decision", "Payment completed?"],
      ["pending", 3, 9, "status", "Status: pending payment"],
      ["confirmed", 2, 10, "status", "Status: confirmed, seat pending"],
      ["assign", 4, 11, "process", "Assign seats/tables after close"],
      ["assigned", 4, 12, "status", "Status: seat/table assigned"],
    ],
    edges: [
      ["start", "openPage"], ["openPage", "open"], ["open", "closed", "No"], ["open", "choose", "Yes"],
      ["choose", "individual", "Individual"], ["choose", "table", "Table"], ["individual", "capacity"], ["table", "capacity"],
      ["capacity", "waitlist", "No"], ["capacity", "details", "Yes"], ["details", "payment"], ["payment", "pending", "No"],
      ["pending", "payment"], ["payment", "confirmed", "Yes"], ["confirmed", "assign"], ["assign", "assigned"],
    ],
  },
  {
    id: "08-member-event-registration-qr",
    title: "Member Event Registration And QR Ticket",
    lanes: ["Member", "Portal Events", "Event System", "Payment", "Check-in Staff"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["open", 0, 1, "process", "Open portal Events"],
      ["active", 2, 2, "decision", "Membership active?"],
      ["blocked", 1, 3, "status", "Status: blocked"],
      ["eligible", 2, 4, "decision", "Eligible for event audience?"],
      ["notEligible", 1, 5, "status", "Status: not eligible"],
      ["capacity", 2, 6, "decision", "Capacity available?"],
      ["waitlist", 2, 7, "status", "Status: waitlisted"],
      ["register", 0, 7, "process", "Submit registration"],
      ["pay", 3, 8, "decision", "Payment complete / not required?"],
      ["pending", 3, 9, "status", "Status: pending payment"],
      ["confirmed", 2, 10, "status", "Status: confirmed"],
      ["qr", 2, 11, "process", "Generate ticket QR"],
      ["scan", 4, 12, "decision", "QR scanned at event?"],
      ["ticket", 0, 13, "status", "Status: ticket active"],
      ["checked", 4, 13, "status", "Status: checked-in"],
    ],
    edges: [
      ["start", "open"], ["open", "active"], ["active", "blocked", "No"], ["active", "eligible", "Yes"],
      ["eligible", "notEligible", "No"], ["eligible", "capacity", "Yes"], ["capacity", "waitlist", "No"],
      ["capacity", "register", "Yes"], ["register", "pay"], ["pay", "pending", "No"], ["pending", "pay"],
      ["pay", "confirmed", "Yes"], ["confirmed", "qr"], ["qr", "scan"], ["scan", "ticket", "No"], ["scan", "checked", "Yes"],
    ],
  },
  {
    id: "09-portal-only-booking",
    title: "Portal-only Facility Booking",
    lanes: ["Member", "Portal Booking", "Booking System", "Payment / Approval", "Staff"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["open", 0, 1, "process", "Open portal Booking"],
      ["allowed", 2, 2, "decision", "Member allowed to book?"],
      ["blocked", 1, 3, "status", "Status: booking blocked"],
      ["select", 0, 4, "process", "Select facility and slot"],
      ["available", 2, 5, "decision", "Slot available and not blackout?"],
      ["unavailable", 1, 6, "status", "Status: unavailable slot"],
      ["draft", 2, 7, "status", "Status: draft request"],
      ["submit", 0, 8, "process", "Submit booking request"],
      ["approval", 3, 9, "decision", "Payment / approval required?"],
      ["pending", 3, 10, "status", "Status: pending payment / approval"],
      ["staffDecision", 4, 11, "decision", "Staff approve?"],
      ["rejected", 4, 12, "status", "Status: rejected"],
      ["approved", 2, 12, "status", "Status: approved"],
      ["cancel", 0, 13, "decision", "Cancel before cutoff?"],
      ["cancelled", 2, 14, "status", "Status: cancelled"],
    ],
    edges: [
      ["start", "open"], ["open", "allowed"], ["allowed", "blocked", "No"], ["allowed", "select", "Yes"],
      ["select", "available"], ["available", "unavailable", "No"], ["unavailable", "select"], ["available", "draft", "Yes"],
      ["draft", "submit"], ["submit", "approval"], ["approval", "approved", "No"], ["approval", "pending", "Yes"],
      ["pending", "staffDecision"], ["staffDecision", "rejected", "No"], ["staffDecision", "approved", "Yes"],
      ["approved", "cancel"], ["cancel", "cancelled", "Yes"], ["cancel", "approved", "No"],
    ],
  },
  {
    id: "10-support-case-submission",
    title: "Support Case Submission",
    lanes: ["Member", "Portal Support", "Support System", "Staff"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["open", 0, 1, "process", "Open portal Support"],
      ["type", 1, 2, "process", "Choose case type"],
      ["draft", 1, 3, "status", "Status: draft case"],
      ["details", 0, 4, "process", "Enter details / attachment"],
      ["valid", 2, 5, "decision", "Required fields complete?"],
      ["error", 1, 6, "status", "Status: validation error"],
      ["submitted", 2, 7, "status", "Status: submitted"],
      ["assign", 2, 8, "process", "Assign to staff queue"],
      ["openCase", 3, 9, "status", "Status: open"],
      ["needInfo", 3, 10, "decision", "Need more information?"],
      ["waiting", 0, 11, "status", "Status: waiting for member"],
      ["resolved", 3, 12, "status", "Status: resolved"],
      ["closed", 3, 13, "status", "Status: closed"],
    ],
    edges: [
      ["start", "open"], ["open", "type"], ["type", "draft"], ["draft", "details"], ["details", "valid"],
      ["valid", "error", "No"], ["error", "details"], ["valid", "submitted", "Yes"], ["submitted", "assign"],
      ["assign", "openCase"], ["openCase", "needInfo"], ["needInfo", "waiting", "Yes"], ["waiting", "details"],
      ["needInfo", "resolved", "No"], ["resolved", "closed"],
    ],
  },
  {
    id: "11-member-directory-visibility",
    title: "Member Directory Visibility",
    lanes: ["Viewing Member", "Portal Directory", "Directory System", "Project / Legal Review"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["open", 0, 1, "process", "Open portal Directory"],
      ["access", 2, 2, "decision", "Viewer has directory access?"],
      ["blocked", 1, 3, "status", "Status: access blocked"],
      ["search", 0, 4, "process", "Search member records"],
      ["visible", 2, 5, "decision", "Target member visible?"],
      ["hidden", 1, 6, "status", "Status: hidden by exception"],
      ["results", 2, 7, "status", "Status: visible in results"],
      ["profile", 0, 8, "process", "Open member profile"],
      ["fields", 2, 9, "status", "Status: all fields visible"],
      ["risk", 3, 10, "status", "Privacy / consent review required"],
      ["audit", 2, 11, "process", "Log profile view if required"],
    ],
    edges: [
      ["start", "open"], ["open", "access"], ["access", "blocked", "No"], ["access", "search", "Yes"],
      ["search", "visible"], ["visible", "hidden", "No"], ["visible", "results", "Yes"], ["results", "profile"],
      ["profile", "fields"], ["fields", "risk"], ["risk", "audit"],
    ],
  },
  {
    id: "12-admin-type-rights-audit",
    title: "Admin Type, Page Rights, And Audit",
    lanes: ["Admin", "Admin Portal", "Permission System", "Staff User", "Audit Log"],
    nodes: [
      ["start", 0, 0, "start", "Start"],
      ["type", 0, 1, "process", "Create / edit admin type"],
      ["rights", 1, 2, "process", "Set page and action rights"],
      ["valid", 2, 3, "decision", "Rights configuration valid?"],
      ["draft", 1, 4, "status", "Status: invalid / draft"],
      ["active", 2, 5, "status", "Status: admin type active"],
      ["assign", 0, 6, "process", "Assign admin type to Admin / Staff"],
      ["attempt", 3, 7, "process", "Attempt view / create / edit / delete"],
      ["allowed", 2, 8, "decision", "Action allowed?"],
      ["denied", 3, 9, "status", "Status: access denied"],
      ["reason", 3, 10, "process", "Enter audit reason"],
      ["log", 4, 11, "status", "Status: action completed and logged"],
    ],
    edges: [
      ["start", "type"], ["type", "rights"], ["rights", "valid"], ["valid", "draft", "No"], ["draft", "type"],
      ["valid", "active", "Yes"], ["active", "assign"], ["assign", "attempt"], ["attempt", "allowed"],
      ["allowed", "denied", "No"], ["allowed", "reason", "Yes"], ["reason", "log"],
    ],
  },
];

function wrapText(text, max = 18) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function esc(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nodeCenter(node, laneWidth, gap, headerHeight, rowHeight) {
  return {
    x: 40 + node[1] * (laneWidth + gap) + laneWidth / 2,
    y: headerHeight + 34 + node[2] * rowHeight + 46,
  };
}

function nodeShape(flow, node, laneWidth, gap, headerHeight, rowHeight) {
  const [, lane, row, type, text] = node;
  const x = 40 + lane * (laneWidth + gap) + 32;
  const y = headerHeight + 34 + row * rowHeight;
  const w = laneWidth - 64;
  const h = type === "decision" ? 96 : 92;
  const laneColor = palette[lane % palette.length];
  const fill = type === "start" ? "#B9E1FA" : type === "decision" ? "#B9E1FA" : type === "status" ? laneColor.node : laneColor.node;
  const stroke = type === "start" || type === "decision" ? "#6BAED6" : laneColor.stroke;
  const lines = wrapText(text, type === "decision" ? 20 : 19);
  const textSvg = lines
    .map((line, index) => `<tspan x="${x + w / 2}" dy="${index === 0 ? 0 : 17}">${esc(line)}</tspan>`)
    .join("");
  const textY = y + h / 2 - ((lines.length - 1) * 17) / 2 + 5;

  if (type === "start") {
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text text-anchor="middle" font-size="15" fill="#172033" font-family="Arial" x="${x + w / 2}" y="${textY}">${textSvg}</text>`;
  }
  if (type === "decision") {
    const points = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text text-anchor="middle" font-size="14" fill="#172033" font-family="Arial" x="${x + w / 2}" y="${textY}">${textSvg}</text>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <text text-anchor="middle" font-size="14" fill="#172033" font-family="Arial" x="${x + w / 2}" y="${textY}">${textSvg}</text>`;
}

function svgFor(flow) {
  const laneWidth = 250;
  const gap = 34;
  const headerHeight = 82;
  const rowHeight = 118;
  const maxRow = Math.max(...flow.nodes.map((n) => n[2]));
  const width = 80 + flow.lanes.length * laneWidth + (flow.lanes.length - 1) * gap;
  const height = headerHeight + 76 + (maxRow + 1) * rowHeight;

  const laneRects = flow.lanes.map((lane, index) => {
    const x = 40 + index * (laneWidth + gap);
    const color = palette[index % palette.length];
    const headerLines = wrapText(lane, 18)
      .map((line, i) => `<tspan x="${x + laneWidth / 2}" dy="${i === 0 ? 0 : 20}">${esc(line)}</tspan>`)
      .join("");
    return `
      <rect x="${x}" y="10" width="${laneWidth}" height="62" fill="${color.header}" stroke="none"/>
      <text text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#222" x="${x + laneWidth / 2}" y="${lane.includes(" ") ? 33 : 48}">${headerLines}</text>
      <rect x="${x}" y="${headerHeight}" width="${laneWidth}" height="${height - headerHeight - 26}" fill="${color.body}" stroke="none"/>
    `;
  }).join("");

  const nodes = new Map(flow.nodes.map((node) => [node[0], node]));
  const outgoingCounts = flow.edges.reduce((acc, [from]) => {
    acc[from] = (acc[from] ?? 0) + 1;
    return acc;
  }, {});
  const outgoingSeen = {};

  const edges = flow.edges.map(([from, to, label]) => {
    const seen = outgoingSeen[from] ?? 0;
    outgoingSeen[from] = seen + 1;
    const siblingCount = outgoingCounts[from] ?? 1;
    const labelOffset = (seen - (siblingCount - 1) / 2) * 18;
    const a = nodeCenter(nodes.get(from), laneWidth, gap, headerHeight, rowHeight);
    const b = nodeCenter(nodes.get(to), laneWidth, gap, headerHeight, rowHeight);
    const midY = a.y + (b.y - a.y) / 2;
    const path = Math.abs(a.x - b.x) < 10
      ? `M ${a.x} ${a.y + 48} L ${b.x} ${b.y - 48}`
      : `M ${a.x} ${a.y + 48} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y - 48}`;
    const labelSvg = label
      ? `<rect x="${(a.x + b.x) / 2 - 28}" y="${midY - 19 + labelOffset}" width="56" height="18" fill="#ffffff" opacity="0.86"/>
        <text x="${(a.x + b.x) / 2}" y="${midY - 6 + labelOffset}" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#333">${esc(label)}</text>`
      : "";
    return `<path d="${path}" fill="none" stroke="#9AA3AF" stroke-width="1.5" marker-end="url(#arrow)"/>${labelSvg}`;
  }).join("");

  const nodeSvgs = flow.nodes.map((node) => nodeShape(flow, node, laneWidth, gap, headerHeight, rowHeight)).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M 0 0 L 10 4 L 0 8 z" fill="#9AA3AF"/>
      </marker>
    </defs>
    <rect width="${width}" height="${height}" fill="#ffffff"/>
    ${laneRects}
    ${edges}
    ${nodeSvgs}
    <text x="40" y="${height - 10}" font-family="Arial" font-size="13" fill="#6B7280">${esc(flow.id)}.mmd</text>
  </svg>`;
}

function mermaidFor(flow) {
  const lines = [
    "---",
    "config:",
    "  theme: base",
    "  flowchart:",
    "    curve: basis",
    "---",
    "flowchart TD",
    `  %% ${flow.title}`,
  ];

  for (const [index, lane] of flow.lanes.entries()) {
    lines.push(`  subgraph L${index}["${lane}"]`);
    for (const node of flow.nodes.filter((n) => n[1] === index)) {
      const [id, , , type, text] = node;
      if (type === "start") lines.push(`    ${id}(["${text}"])`);
      if (type === "process") lines.push(`    ${id}["${text}"]`);
      if (type === "decision") lines.push(`    ${id}{"${text}"}`);
      if (type === "status") lines.push(`    ${id}[/"${text}"/]`);
    }
    lines.push("  end");
  }

  for (const [from, to, label] of flow.edges) {
    lines.push(label ? `  ${from} -- "${label}" --> ${to}` : `  ${from} --> ${to}`);
  }

  lines.push("  classDef start fill:#B9E1FA,stroke:#6BAED6,color:#172033;");
  lines.push("  classDef process fill:#FFE8A6,stroke:#D6AE3E,color:#172033;");
  lines.push("  classDef decision fill:#B9E1FA,stroke:#6BAED6,color:#172033;");
  lines.push("  classDef status fill:#D9C2F5,stroke:#9C6FD2,color:#172033;");
  for (const [id, , , type] of flow.nodes) {
    lines.push(`  class ${id} ${type};`);
  }
  return `${lines.join("\n")}\n`;
}

await mkdir(resolve(__dirname, "mermaid"), { recursive: true });
await mkdir(resolve(__dirname, "svg"), { recursive: true });
await mkdir(resolve(__dirname, "exports"), { recursive: true });

for (const flow of flows) {
  await writeFile(resolve(__dirname, "mermaid", `${flow.id}.mmd`), mermaidFor(flow), "utf8");
  await writeFile(resolve(__dirname, "svg", `${flow.id}.svg`), svgFor(flow), "utf8");
}

await writeFile(resolve(__dirname, "flows.json"), JSON.stringify(flows, null, 2), "utf8");
console.log(`Generated ${flows.length} swimlane Mermaid and SVG files.`);
