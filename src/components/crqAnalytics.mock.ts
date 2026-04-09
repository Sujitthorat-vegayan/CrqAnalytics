// ─── Static mock data for CRQ Analytics Dashboard ───────────────────────────

import type {
  CRQWorkflowStage,
  CRQSlaDomain,
  CRQRaisedVsClosed,
  CRQBottleneck,
  CRQDomainSlaChart,
  CRQRadarCoverage,
  CRQDomainCount,
  CRQTableRow,
  CRQRunRate,
} from "./crqAnalytics.api";

export const kpiCards = [
  {
    id: "total",
    label: "Total CRQ",
    value: 120,
    sub: "All requests",
    color: "#38bdf8",
    iconBg: "rgba(56,189,248,0.15)",
    icon: "📊",
    expandable: true,
    trend: 8,
  },
  {
    id: "open",
    label: "Open CRQ",
    value: 48,
    sub: "In progress",
    color: "#fb923c",
    iconBg: "rgba(251,146,60,0.15)",
    icon: "🔓",
    expandable: true,
    trend: -3,
  },
  {
    id: "closed",
    label: "Closed CRQ",
    value: 62,
    sub: "Completed",
    color: "#4ade80",
    iconBg: "rgba(74,222,128,0.15)",
    icon: "✅",
    expandable: false,
    trend: 12,
  },
  {
    id: "rejected",
    label: "Rejected",
    value: 10,
    sub: "Declined",
    color: "#f87171",
    iconBg: "rgba(248,113,113,0.15)",
    icon: "❌",
    expandable: false,
    trend: -2,
  },
  {
    id: "sla",
    label: "SLA Score",
    value: "87%",
    sub: "On-time rate",
    color: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.15)",
    icon: "🎯",
    expandable: true,
    trend: 1.2,
  },
] as const;

export const workflowStages: CRQWorkflowStage[] = [
  { stage: "Authorization Approval", totalCount: 18, openCount: 8 },
  { stage: "MOP Creation", totalCount: 15, openCount: 7 },
  { stage: "Plan & Inventory Valid.", totalCount: 14, openCount: 6 },
  { stage: "MOP Validation", totalCount: 12, openCount: 5 },
  { stage: "Impact Analysis", totalCount: 16, openCount: 7 },
  { stage: "CMB Approval", totalCount: 13, openCount: 5 },
  { stage: "Impact Approval", totalCount: 17, openCount: 8 },
  { stage: "Network Execution", totalCount: 15, openCount: 2 },
];

export const slaDomains: CRQSlaDomain[] = [
  { domain: "IP Core", score: 92 },
  { domain: "Packet", score: 85 },
  { domain: "Embedded Support", score: 78 },
  { domain: "IP Access", score: 95 },
  { domain: "Optics", score: 82 },
  { domain: "Service Optimisation", score: 89 },
];

export const raisedVsClosed: CRQRaisedVsClosed[] = [
  { label: "Jan", raised: 78, closed: 52 },
  { label: "Feb", raised: 62, closed: 48 },
  { label: "Mar", raised: 125, closed: 90 },
  { label: "Apr", raised: 138, closed: 130 },
  { label: "May", raised: 130, closed: 125 },
  { label: "Jun", raised: 142, closed: 138 },
  { label: "Jul", raised: 194, closed: 100 },
];

export const bottlenecks: CRQBottleneck[] = [
  { stage: "MOP Creation", avgWaitHours: 48 },
  { stage: "Impact Analysis", avgWaitHours: 36 },
  { stage: "CMB Approval", avgWaitHours: 28 },
  { stage: "Auth Approval", avgWaitHours: 20 },
  { stage: "Network Exec.", avgWaitHours: 16 },
];

export const domainSlaChart: CRQDomainSlaChart[] = [
  { domain: "IP Core", score: 81 },
  { domain: "Packet", score: 79 },
  { domain: "Embedded Support", score: 86 },
  { domain: "IP Access", score: 82 },
  { domain: "Optics", score: 85 },
  { domain: "Service Optimisation", score: 90 },
];

export const radarData: { labels: string[]; values: number[] } = {
  labels: [
    "Core",
    "Access",
    "Transport",
    "IP/MPLS",
    "Transmission",
    "Enterprise",
  ],
  values: [88, 72, 85, 91, 67, 79],
};

export const radarCoverage: CRQRadarCoverage[] = radarData.labels.map(
  (subject, i) => ({ subject, value: radarData.values[i] }),
);

export const domainCRQ: CRQDomainCount[] = [
  { domain: "Core", count: 32 },
  { domain: "Access", count: 24 },
  { domain: "Trans.", count: 18 },
  { domain: "IP/MPLS", count: 16 },
  { domain: "Tx", count: 12 },
  { domain: "Ent.", count: 10 },
  { domain: "Others", count: 8 },
];

// ─── Shared base rows for all chart popup tables ──────────────────────────────
export const chartTableRows: CRQTableRow[] = [
  {
    changeId: "CRQ#81141",
    submitDate: "2026-01-09",
    status: "Completed",
    aging: "6d",
    impact: "SA",
    requester: "NOC",
    summary: "Access switch port VLAN change",
    region: "East",
    circle: "Odisha",
    binGroup: "NOC_SE_Upgrade",
    coordinator: "Rahul Sharma",
    implementor: "Naveen P",
  },
  {
    changeId: "CRQ#81144",
    submitDate: "2026-02-15",
    status: "Open",
    aging: "2d",
    impact: "SA",
    requester: "NOC",
    summary: "Packet switch firmware upgrade",
    region: "West",
    circle: "Gujarat",
    binGroup: "NOC_SE_Packet",
    coordinator: "Amit Patel",
    implementor: "Priya S",
  },
  {
    changeId: "CRQ#81146",
    submitDate: "2026-03-01",
    status: "Open",
    aging: "1d",
    impact: "NSA",
    requester: "Planning",
    summary: "New NI circuit provisioning on packet ring",
    region: "South",
    circle: "Tamil Nadu",
    binGroup: "TX_NI",
    coordinator: "Sanjay M",
    implementor: "Vikram R",
  },
  {
    changeId: "CRQ#81148",
    submitDate: "2026-01-28",
    status: "Open",
    aging: "5d",
    impact: "NSA",
    requester: "Planning",
    summary: "Embedded controller patching and reboot",
    region: "South",
    circle: "Tamil Nadu",
    binGroup: "NOC_SE_Embed",
    coordinator: "Neha Gupta",
    implementor: "Ravi K",
  },
  {
    changeId: "CRQ#81147",
    submitDate: "2026-02-20",
    status: "Open",
    aging: "3d",
    impact: "SA",
    requester: "Operations",
    summary: "MPLS access PE router config change",
    region: "East",
    circle: "West Bengal",
    binGroup: "TX_ACCESS",
    coordinator: "Rahul Sharma",
    implementor: "Suresh B",
  },
  {
    changeId: "CRQ#81149",
    submitDate: "2026-03-10",
    status: "Rejected",
    aging: "4d",
    impact: "SA",
    requester: "NOC",
    summary: "CEN access ring reconfiguration rejected due to conflict",
    region: "South",
    circle: "Kerala",
    binGroup: "NOC_SE_Access",
    coordinator: "Deepa Rao",
    implementor: "Ajay K",
  },
  {
    changeId: "CRQ#81150",
    submitDate: "2026-02-05",
    status: "Open",
    aging: "7d",
    impact: "SA",
    requester: "Planning",
    summary: "OLT access port activation for FTTH expansion",
    region: "North",
    circle: "Maharashtra",
    binGroup: "NOC_FTTH",
    coordinator: "Priya S",
    implementor: "Priya S",
  },
  {
    changeId: "CRQ#81151",
    submitDate: "2026-01-18",
    status: "Completed",
    aging: "9d",
    impact: "NSA",
    requester: "NOC",
    summary: "Network expansion — new fiber route commission",
    region: "North",
    circle: "UP East",
    binGroup: "TX_OPTICS",
    coordinator: "Amit Patel",
    implementor: "Vikram R",
  },
  {
    changeId: "CRQ#81152",
    submitDate: "2026-03-05",
    status: "Open",
    aging: "6d",
    impact: "NSA",
    requester: "NOC",
    summary: "NNI link capacity upgrade between exchanges",
    region: "South",
    circle: "Andhra Pradesh",
    binGroup: "TX_NNI",
    coordinator: "Sanjay M",
    implementor: "Ravi K",
  },
  {
    changeId: "CRQ#81153",
    submitDate: "2026-02-28",
    status: "Open",
    aging: "4d",
    impact: "NSA",
    requester: "NOC",
    summary: "OTN/LCD wavelength reallocation",
    region: "East",
    circle: "Bihar",
    binGroup: "TX_OTN",
    coordinator: "Neha Gupta",
    implementor: "Suresh B",
  },
  {
    changeId: "CRQ#81154",
    submitDate: "2026-03-15",
    status: "Open",
    aging: "1d",
    impact: "SA",
    requester: "Planning",
    summary: "Optics project — metro ring dark fiber activation",
    region: "West",
    circle: "Rajasthan",
    binGroup: "TX_PROJECT",
    coordinator: "Rahul Sharma",
    implementor: "Naveen P",
  },
  {
    changeId: "CRQ#81155",
    submitDate: "2026-01-25",
    status: "Completed",
    aging: "11d",
    impact: "SA",
    requester: "NOC",
    summary: "Service optimization — QoS policy tuning on PE",
    region: "South",
    circle: "Haryana",
    binGroup: "NOC_SE_QOS",
    coordinator: "Kavita Joshi",
    implementor: "Ajay K",
  },
  {
    changeId: "CRQ#81156",
    submitDate: "2026-02-10",
    status: "Open",
    aging: "6d",
    impact: "SA",
    requester: "NOC",
    summary: "Traffic engineering optimization across MPLS domain",
    region: "South",
    circle: "Karnataka",
    binGroup: "NOC_SE_TE",
    coordinator: "Deepa Rao",
    implementor: "Priya S",
  },
  {
    changeId: "CRQ#81157",
    submitDate: "2026-03-20",
    status: "Open",
    aging: "5d",
    impact: "SA",
    requester: "CCB",
    summary: "CCB review — MPLS core label range modification",
    region: "East",
    circle: "Odisha",
    binGroup: "CCB_MPLS",
    coordinator: "Amit Patel",
    implementor: "Vikram R",
  },
  {
    changeId: "CRQ#81158",
    submitDate: "2026-02-18",
    status: "Open",
    aging: "5d",
    impact: "SA",
    requester: "CCB",
    summary: "CCB BRAS core subscriber pool expansion review",
    region: "North",
    circle: "Punjab",
    binGroup: "CCB_BRAS",
    coordinator: "Sanjay M",
    implementor: "Ravi K",
  },
  {
    changeId: "CRQ#81159",
    submitDate: "2026-01-30",
    status: "Completed",
    aging: "8d",
    impact: "NSA",
    requester: "CCB",
    summary: "CCB approved CEN core routing policy change",
    region: "West",
    circle: "Gujarat",
    binGroup: "CCB_CEN",
    coordinator: "Neha Gupta",
    implementor: "Suresh B",
  },
  {
    changeId: "CRQ#81160",
    submitDate: "2026-03-08",
    status: "Open",
    aging: "3d",
    impact: "SA",
    requester: "CCB",
    summary: "CCB packet change — microwave backhaul reconfiguration",
    region: "South",
    circle: "Tamil Nadu",
    binGroup: "CCB_PKT",
    coordinator: "Rahul Sharma",
    implementor: "Naveen P",
  },
  {
    changeId: "CRQ#81161",
    submitDate: "2026-02-25",
    status: "Rejected",
    aging: "6d",
    impact: "SA",
    requester: "CCB",
    summary: "CCB NI provisioning rejected — incomplete MO documentation",
    region: "North",
    circle: "Delhi",
    binGroup: "CCB_NI",
    coordinator: "Kavita Joshi",
    implementor: "Ajay K",
  },
  {
    changeId: "CRQ#81162",
    submitDate: "2026-03-02",
    status: "Open",
    aging: "2d",
    impact: "NSA",
    requester: "Planning",
    summary: "IP access MPLS-Access node firmware upgrade",
    region: "West",
    circle: "Maharashtra",
    binGroup: "TX_ACCESS",
    coordinator: "Deepa Rao",
    implementor: "Vikram R",
  },
  {
    changeId: "CRQ#81163",
    submitDate: "2026-02-12",
    status: "Completed",
    aging: "10d",
    impact: "SA",
    requester: "NOC",
    summary: "Optics NNI capacity upgrade — inter-circle link",
    region: "North",
    circle: "Haryana",
    binGroup: "TX_NNI",
    coordinator: "Amit Patel",
    implementor: "Priya S",
  },
];

export const runRateCCBtoSE: CRQRunRate[] = [
  { date: "01-Feb-26", receivedInCCB: 2, movedToSE: 1, seToClosed: 1 },
  { date: "02-Feb-26", receivedInCCB: 4, movedToSE: 2, seToClosed: 1 },
  { date: "03-Feb-26", receivedInCCB: 3, movedToSE: 4, seToClosed: 3 },
  { date: "04-Feb-26", receivedInCCB: 4, movedToSE: 3, seToClosed: 1 },
  { date: "05-Feb-26", receivedInCCB: 8, movedToSE: 2, seToClosed: 1 },
  { date: "06-Feb-26", receivedInCCB: 7, movedToSE: 7, seToClosed: 4 },
  { date: "07-Feb-26", receivedInCCB: 6, movedToSE: 6, seToClosed: 9 },
  { date: "08-Feb-26", receivedInCCB: 9, movedToSE: 8, seToClosed: 8 },
  { date: "09-Feb-26", receivedInCCB: 3, movedToSE: 5, seToClosed: 1 },
  { date: "10-Feb-26", receivedInCCB: 7, movedToSE: 2, seToClosed: 1 },
  { date: "11-Feb-26", receivedInCCB: 4, movedToSE: 6, seToClosed: 4 },
  { date: "12-Feb-26", receivedInCCB: 3, movedToSE: 3, seToClosed: 3 },
  { date: "13-Feb-26", receivedInCCB: 2, movedToSE: 4, seToClosed: 0 },
  { date: "14-Feb-26", receivedInCCB: 2, movedToSE: 8, seToClosed: 7 },
  { date: "15-Feb-26", receivedInCCB: 1, movedToSE: 2, seToClosed: 1 },
  { date: "16-Feb-26", receivedInCCB: 1, movedToSE: 1, seToClosed: 1 },
  { date: "18-Feb-26", receivedInCCB: 6, movedToSE: 3, seToClosed: 1 },
  { date: "19-Feb-26", receivedInCCB: 5, movedToSE: 2, seToClosed: 1 },
  { date: "20-Feb-26", receivedInCCB: 8, movedToSE: 7, seToClosed: 3 },
  { date: "21-Feb-26", receivedInCCB: 7, movedToSE: 8, seToClosed: 0 },
  { date: "22-Feb-26", receivedInCCB: 5, movedToSE: 6, seToClosed: 4 },
  { date: "24-Feb-26", receivedInCCB: 8, movedToSE: 5, seToClosed: 6 },
  { date: "25-Feb-26", receivedInCCB: 9, movedToSE: 8, seToClosed: 7 },
];

// ─── CCB-specific mock data ───────────────────────────────────────────────────

export const workflowStagesCCB: CRQWorkflowStage[] = [
  { stage: "CCB Authorization", totalCount: 22, openCount: 10 },
  { stage: "MOP Review", totalCount: 18, openCount: 9 },
  { stage: "Plan & Inventory Check", totalCount: 16, openCount: 7 },
  { stage: "MOP Sign-off", totalCount: 14, openCount: 6 },
  { stage: "Risk Assessment", totalCount: 19, openCount: 8 },
  { stage: "CCB Board Approval", totalCount: 15, openCount: 6 },
  { stage: "Change Freeze Check", totalCount: 20, openCount: 9 },
  { stage: "Deployment Handoff", totalCount: 17, openCount: 3 },
];

export const slaDomainsCCB: CRQSlaDomain[] = [
  { domain: "IP Core_CCB", score: 88 },
  { domain: "Packet_CCB", score: 81 },
  { domain: "Embedded Support_CCB", score: 74 },
  { domain: "IP Access_CCB", score: 91 },
  { domain: "Optics_CCB", score: 79 },
  { domain: "Service Optimisation_CCB", score: 85 },
];

export const domainSlaChartCCB: CRQDomainSlaChart[] = [
  { domain: "IP Core_CCB", score: 84 },
  { domain: "Packet_CCB", score: 86 },
  { domain: "Embedded Support_CCB", score: 91 },
  { domain: "IP Access_CCB", score: 88 },
  { domain: "Optics_CCB", score: 89 },
  { domain: "Service Optimisation_CCB", score: 92 },
];

export const domainCRQCCB: CRQDomainCount[] = [
  { domain: "IP Core_CCB", count: 28 },
  { domain: "Packet_CCB", count: 20 },
  { domain: "Optics_CCB", count: 15 },
  { domain: "IP Access_CCB", count: 14 },
  { domain: "Emb. Sup_CCB", count: 11 },
  { domain: "Svc Opt_CCB", count: 9 },
  { domain: "Others", count: 6 },
];

export const kpiCardsCCB = [
  { id: "total", value: 103, sub: "All requests", trend: 5 },
  { id: "open", value: 41, sub: "In progress", trend: -1 },
  { id: "closed", value: 52, sub: "Completed", trend: 9 },
  { id: "rejected", value: 10, sub: "Declined", trend: -1 },
  { id: "sla", value: "83%", sub: "On-time rate", trend: 0.8 },
] as const;

// // ─── Static mock data for CRQ Analytics Dashboard ───────────────────────────

// import type {
//   CRQWorkflowStage,
//   CRQSlaDomain,
//   CRQRaisedVsClosed,
//   CRQBottleneck,
//   CRQDomainSlaChart,
//   CRQRadarCoverage,
//   CRQDomainCount,
//   CRQTableRow,
//   CRQRunRate,
// } from "./crqAnalytics.api";

// export const kpiCards = [
//   {
//     id: "total",
//     label: "Total CRQ",
//     value: 120,
//     sub: "All requests",
//     color: "#38bdf8",
//     iconBg: "rgba(56,189,248,0.15)",
//     icon: "📊",
//     expandable: true,
//     trend: 8,
//   },
//   {
//     id: "open",
//     label: "Open CRQ",
//     value: 48,
//     sub: "In progress",
//     color: "#fb923c",
//     iconBg: "rgba(251,146,60,0.15)",
//     icon: "🔓",
//     expandable: true,
//     trend: -3,
//   },
//   {
//     id: "closed",
//     label: "Closed CRQ",
//     value: 62,
//     sub: "Completed",
//     color: "#4ade80",
//     iconBg: "rgba(74,222,128,0.15)",
//     icon: "✅",
//     expandable: false,
//     trend: 12,
//   },
//   {
//     id: "rejected",
//     label: "Rejected",
//     value: 10,
//     sub: "Declined",
//     color: "#f87171",
//     iconBg: "rgba(248,113,113,0.15)",
//     icon: "❌",
//     expandable: false,
//     trend: -2,
//   },
//   {
//     id: "sla",
//     label: "SLA Score",
//     value: "87%",
//     sub: "On-time rate",
//     color: "#8b5cf6",
//     iconBg: "rgba(139,92,246,0.15)",
//     icon: "🎯",
//     expandable: true,
//     trend: 1.2,
//   },
// ] as const;

// export const workflowStages: CRQWorkflowStage[] = [
//   { stage: "Authorization Approval",  totalCount: 18, openCount: 8 },
//   { stage: "MOP Creation",            totalCount: 15, openCount: 7 },
//   { stage: "Plan & Inventory Valid.", totalCount: 14, openCount: 6 },
//   { stage: "MOP Validation",          totalCount: 12, openCount: 5 },
//   { stage: "Impact Analysis",         totalCount: 16, openCount: 7 },
//   { stage: "CMB Approval",            totalCount: 13, openCount: 5 },
//   { stage: "Impact Approval",         totalCount: 17, openCount: 8 },
//   { stage: "Network Execution",       totalCount: 15, openCount: 2 },
// ];

// export const slaDomains: CRQSlaDomain[] = [
//   { domain: "IP Core", score: 92 },
//   { domain: "Packet",       score: 85 },
//   { domain: "Embedded Support",    score: 78 },
//   { domain: "IP Access",   score: 95 },
//   { domain: "Optics", score: 82 },
//   { domain: "Service Optimisation",   score: 89 },
// ];

// export const raisedVsClosed: CRQRaisedVsClosed[] = [
//   { label: "Jan", raised: 28, closed: 22 },
//   { label: "Feb", raised: 32, closed: 28 },
//   { label: "Mar", raised: 25, closed: 20 },
//   { label: "Apr", raised: 38, closed: 30 },
//   { label: "May", raised: 30, closed: 25 },
//   { label: "Jun", raised: 42, closed: 38 },
//   { label: "Jul", raised: 35, closed: 30 },
// ];

// export const bottlenecks: CRQBottleneck[] = [
//   { stage: "MOP Creation",    avgWaitHours: 48 },
//   { stage: "Impact Analysis", avgWaitHours: 36 },
//   { stage: "CMB Approval",    avgWaitHours: 28 },
//   { stage: "Auth Approval",   avgWaitHours: 20 },
//   { stage: "Network Exec.",   avgWaitHours: 16 },
// ];

// export const domainSlaChart: CRQDomainSlaChart[] = [
//   { domain: "IP Core",    score: 92 },
//   { domain: "Packet",  score: 85 },
//   { domain: "Embedded Support",  score: 78 },
//   { domain: "IP Access", score: 95 },
//   { domain: "Optics",      score: 82 },
//   { domain: "Service Optimisation",    score: 89 },
// ];

// export const radarData: { labels: string[]; values: number[] } = {
//   labels: ["Core", "Access", "Transport", "IP/MPLS", "Transmission", "Enterprise"],
//   values: [88, 72, 85, 91, 67, 79],
// };

// export const radarCoverage: CRQRadarCoverage[] = radarData.labels.map(
//   (subject, i) => ({ subject, value: radarData.values[i] }),
// );

// export const domainCRQ: CRQDomainCount[] = [
//   { domain: "Core",    count: 32 },
//   { domain: "Access",  count: 24 },
//   { domain: "Trans.",  count: 18 },
//   { domain: "IP/MPLS", count: 16 },
//   { domain: "Tx",      count: 12 },
//   { domain: "Ent.",    count: 10 },
//   { domain: "Others",  count: 8  },
// ];

// // ─── Shared base rows for all chart popup tables ──────────────────────────────
// export const chartTableRows: CRQTableRow[] = [
//   { changeId: "CRQ#81141", submitDate: "2026-01-09", status: "Completed", aging: "6d",  impact: "SA",  requester: "NOC",       summary: "Access switch port VLAN change",                                  region: "East",  circle: "Odisha",          binGroup: "NOC_SE_Upgrade",  coordinator: "Rahul Sharma", implementor: "Naveen P"  },
//   { changeId: "CRQ#81144", submitDate: "2026-02-15", status: "Open",      aging: "2d",  impact: "SA",  requester: "NOC",       summary: "Packet switch firmware upgrade",                                  region: "West",  circle: "Gujarat",         binGroup: "NOC_SE_Packet",   coordinator: "Amit Patel",   implementor: "Priya S"   },
//   { changeId: "CRQ#81146", submitDate: "2026-03-01", status: "Open",      aging: "1d",  impact: "NSA", requester: "Planning",  summary: "New NI circuit provisioning on packet ring",                      region: "South", circle: "Tamil Nadu",      binGroup: "TX_NI",           coordinator: "Sanjay M",     implementor: "Vikram R"  },
//   { changeId: "CRQ#81148", submitDate: "2026-01-28", status: "Open",      aging: "5d",  impact: "NSA", requester: "Planning",  summary: "Embedded controller patching and reboot",                        region: "South", circle: "Tamil Nadu",      binGroup: "NOC_SE_Embed",    coordinator: "Neha Gupta",   implementor: "Ravi K"    },
//   { changeId: "CRQ#81147", submitDate: "2026-02-20", status: "Open",      aging: "3d",  impact: "SA",  requester: "Operations",summary: "MPLS access PE router config change",                             region: "East",  circle: "West Bengal",     binGroup: "TX_ACCESS",       coordinator: "Rahul Sharma", implementor: "Suresh B"  },
//   { changeId: "CRQ#81149", submitDate: "2026-03-10", status: "Rejected",  aging: "4d",  impact: "SA",  requester: "NOC",       summary: "CEN access ring reconfiguration rejected due to conflict",        region: "South", circle: "Kerala",          binGroup: "NOC_SE_Access",   coordinator: "Deepa Rao",    implementor: "Ajay K"    },
//   { changeId: "CRQ#81150", submitDate: "2026-02-05", status: "Open",      aging: "7d",  impact: "SA",  requester: "Planning",  summary: "OLT access port activation for FTTH expansion",                  region: "North", circle: "Maharashtra",     binGroup: "NOC_FTTH",        coordinator: "Priya S",      implementor: "Priya S"   },
//   { changeId: "CRQ#81151", submitDate: "2026-01-18", status: "Completed", aging: "9d",  impact: "NSA", requester: "NOC",       summary: "Network expansion — new fiber route commission",                 region: "North", circle: "UP East",         binGroup: "TX_OPTICS",       coordinator: "Amit Patel",   implementor: "Vikram R"  },
//   { changeId: "CRQ#81152", submitDate: "2026-03-05", status: "Open",      aging: "6d",  impact: "NSA", requester: "NOC",       summary: "NNI link capacity upgrade between exchanges",                    region: "South", circle: "Andhra Pradesh",  binGroup: "TX_NNI",          coordinator: "Sanjay M",     implementor: "Ravi K"    },
//   { changeId: "CRQ#81153", submitDate: "2026-02-28", status: "Open",      aging: "4d",  impact: "NSA", requester: "NOC",       summary: "OTN/LCD wavelength reallocation",                                region: "East",  circle: "Bihar",           binGroup: "TX_OTN",          coordinator: "Neha Gupta",   implementor: "Suresh B"  },
//   { changeId: "CRQ#81154", submitDate: "2026-03-15", status: "Open",      aging: "1d",  impact: "SA",  requester: "Planning",  summary: "Optics project — metro ring dark fiber activation",              region: "West",  circle: "Rajasthan",       binGroup: "TX_PROJECT",      coordinator: "Rahul Sharma", implementor: "Naveen P"  },
//   { changeId: "CRQ#81155", submitDate: "2026-01-25", status: "Completed", aging: "11d", impact: "SA",  requester: "NOC",       summary: "Service optimization — QoS policy tuning on PE",                region: "South", circle: "Haryana",         binGroup: "NOC_SE_QOS",      coordinator: "Kavita Joshi", implementor: "Ajay K"    },
//   { changeId: "CRQ#81156", submitDate: "2026-02-10", status: "Open",      aging: "6d",  impact: "SA",  requester: "NOC",       summary: "Traffic engineering optimization across MPLS domain",            region: "South", circle: "Karnataka",       binGroup: "NOC_SE_TE",       coordinator: "Deepa Rao",    implementor: "Priya S"   },
//   { changeId: "CRQ#81157", submitDate: "2026-03-20", status: "Open",      aging: "5d",  impact: "SA",  requester: "CCB",       summary: "CCB review — MPLS core label range modification",                region: "East",  circle: "Odisha",          binGroup: "CCB_MPLS",        coordinator: "Amit Patel",   implementor: "Vikram R"  },
//   { changeId: "CRQ#81158", submitDate: "2026-02-18", status: "Open",      aging: "5d",  impact: "SA",  requester: "CCB",       summary: "CCB BRAS core subscriber pool expansion review",                 region: "North", circle: "Punjab",          binGroup: "CCB_BRAS",        coordinator: "Sanjay M",     implementor: "Ravi K"    },
//   { changeId: "CRQ#81159", submitDate: "2026-01-30", status: "Completed", aging: "8d",  impact: "NSA", requester: "CCB",       summary: "CCB approved CEN core routing policy change",                    region: "West",  circle: "Gujarat",         binGroup: "CCB_CEN",         coordinator: "Neha Gupta",   implementor: "Suresh B"  },
//   { changeId: "CRQ#81160", submitDate: "2026-03-08", status: "Open",      aging: "3d",  impact: "SA",  requester: "CCB",       summary: "CCB packet change — microwave backhaul reconfiguration",         region: "South", circle: "Tamil Nadu",      binGroup: "CCB_PKT",         coordinator: "Rahul Sharma", implementor: "Naveen P"  },
//   { changeId: "CRQ#81161", submitDate: "2026-02-25", status: "Rejected",  aging: "6d",  impact: "SA",  requester: "CCB",       summary: "CCB NI provisioning rejected — incomplete MO documentation",    region: "North", circle: "Delhi",           binGroup: "CCB_NI",          coordinator: "Kavita Joshi", implementor: "Ajay K"    },
//   { changeId: "CRQ#81162", submitDate: "2026-03-02", status: "Open",      aging: "2d",  impact: "NSA", requester: "Planning",  summary: "IP access MPLS-Access node firmware upgrade",                   region: "West",  circle: "Maharashtra",     binGroup: "TX_ACCESS",       coordinator: "Deepa Rao",    implementor: "Vikram R"  },
//   { changeId: "CRQ#81163", submitDate: "2026-02-12", status: "Completed", aging: "10d", impact: "SA",  requester: "NOC",       summary: "Optics NNI capacity upgrade — inter-circle link",               region: "North", circle: "Haryana",         binGroup: "TX_NNI",          coordinator: "Amit Patel",   implementor: "Priya S"   },
// ];

// export const runRateCCBtoSE: CRQRunRate[] = [
//   { date: "01-Feb-26", receivedInCCB: 2,  movedToSE: 1,  seToClosed: 1  },
//   { date: "02-Feb-26", receivedInCCB: 4,  movedToSE: 2,  seToClosed: 1  },
//   { date: "03-Feb-26", receivedInCCB: 3,  movedToSE: 4,  seToClosed: 3  },
//   { date: "04-Feb-26", receivedInCCB: 4,  movedToSE: 3,  seToClosed: 1  },
//   { date: "05-Feb-26", receivedInCCB: 8,  movedToSE: 2,  seToClosed: 1  },
//   { date: "06-Feb-26", receivedInCCB: 7,  movedToSE: 7,  seToClosed: 4  },
//   { date: "07-Feb-26", receivedInCCB: 6,  movedToSE: 6,  seToClosed: 9  },
//   { date: "08-Feb-26", receivedInCCB: 9,  movedToSE: 8,  seToClosed: 8  },
//   { date: "09-Feb-26", receivedInCCB: 3,  movedToSE: 5,  seToClosed: 1  },
//   { date: "10-Feb-26", receivedInCCB: 7,  movedToSE: 2,  seToClosed: 1  },
//   { date: "11-Feb-26", receivedInCCB: 4,  movedToSE: 6,  seToClosed: 4  },
//   { date: "12-Feb-26", receivedInCCB: 3,  movedToSE: 3,  seToClosed: 3  },
//   { date: "13-Feb-26", receivedInCCB: 2,  movedToSE: 4,  seToClosed: 0  },
//   { date: "14-Feb-26", receivedInCCB: 2,  movedToSE: 8,  seToClosed: 7  },
//   { date: "15-Feb-26", receivedInCCB: 1,  movedToSE: 2,  seToClosed: 1  },
//   { date: "16-Feb-26", receivedInCCB: 1,  movedToSE: 1,  seToClosed: 1  },
//   { date: "18-Feb-26", receivedInCCB: 6,  movedToSE: 3,  seToClosed: 1  },
//   { date: "19-Feb-26", receivedInCCB: 5,  movedToSE: 2,  seToClosed: 1  },
//   { date: "20-Feb-26", receivedInCCB: 8,  movedToSE: 7,  seToClosed: 3  },
//   { date: "21-Feb-26", receivedInCCB: 7,  movedToSE: 8,  seToClosed: 0  },
//   { date: "22-Feb-26", receivedInCCB: 5,  movedToSE: 6,  seToClosed: 4  },
//   { date: "24-Feb-26", receivedInCCB: 8,  movedToSE: 5,  seToClosed: 6  },
//   { date: "25-Feb-26", receivedInCCB: 9,  movedToSE: 8,  seToClosed: 7  },
// ];

// // ─── CCB-specific mock data ───────────────────────────────────────────────────

// export const workflowStagesCCB: CRQWorkflowStage[] = [
//   { stage: "CCB Authorization",      totalCount: 22, openCount: 10 },
//   { stage: "MOP Review",             totalCount: 18, openCount:  9 },
//   { stage: "Plan & Inventory Check", totalCount: 16, openCount:  7 },
//   { stage: "MOP Sign-off",           totalCount: 14, openCount:  6 },
//   { stage: "Risk Assessment",        totalCount: 19, openCount:  8 },
//   { stage: "CCB Board Approval",     totalCount: 15, openCount:  6 },
//   { stage: "Change Freeze Check",    totalCount: 20, openCount:  9 },
//   { stage: "Deployment Handoff",     totalCount: 17, openCount:  3 },
// ];

// export const slaDomainsCCB: CRQSlaDomain[] = [
//   { domain: "IP Core_CCB",               score: 88 },
//   { domain: "Packet_CCB",                score: 81 },
//   { domain: "Embedded Support_CCB",      score: 74 },
//   { domain: "IP Access_CCB",             score: 91 },
//   { domain: "Optics_CCB",                score: 79 },
//   { domain: "Service Optimisation_CCB",  score: 85 },
// ];

// export const domainSlaChartCCB: CRQDomainSlaChart[] = [
//   { domain: "IP Core_CCB",              score: 88 },
//   { domain: "Packet_CCB",               score: 81 },
//   { domain: "Embedded Support_CCB",     score: 74 },
//   { domain: "IP Access_CCB",            score: 91 },
//   { domain: "Optics_CCB",               score: 79 },
//   { domain: "Service Optimisation_CCB", score: 85 },
// ];

// export const domainCRQCCB: CRQDomainCount[] = [
//   { domain: "IP Core_CCB",  count: 28 },
//   { domain: "Packet_CCB",   count: 20 },
//   { domain: "Optics_CCB",   count: 15 },
//   { domain: "IP Access_CCB",count: 14 },
//   { domain: "Emb. Sup_CCB", count: 11 },
//   { domain: "Svc Opt_CCB",  count:  9 },
//   { domain: "Others",       count:  6 },
// ];

// export const kpiCardsCCB = [
//   { id: "total",    value: 103,   sub: "All requests",  trend:  5   },
//   { id: "open",     value:  41,   sub: "In progress",   trend: -1   },
//   { id: "closed",   value:  52,   sub: "Completed",     trend:  9   },
//   { id: "rejected", value:  10,   sub: "Declined",      trend: -1   },
//   { id: "sla",      value: "83%", sub: "On-time rate",  trend:  0.8 },
// ] as const;

// // // ─── Static mock data for CRQ Analytics Dashboard ───────────────────────────
// // // Exported shapes match the API response interfaces 1-to-1 so the component
// // // can use mock data as a drop-in fallback with no conditional type casting.

// // import type {
// //   CRQWorkflowStage,
// //   CRQSlaDomain,
// //   CRQRaisedVsClosed,
// //   CRQBottleneck,
// //   CRQDomainSlaChart,
// //   CRQRadarCoverage,
// //   CRQDomainCount,
// // } from "./crqAnalytics.api";

// // export const kpiCards = [
// //   {
// //     id: "total",
// //     label: "Total CRQ",
// //     value: 120,
// //     sub: "All requests",
// //     color: "#38bdf8",
// //     iconBg: "rgba(56,189,248,0.15)",
// //     icon: "📊",
// //     expandable: true,
// //     trend: 8,
// //   },
// //   {
// //     id: "open",
// //     label: "Open CRQ",
// //     value: 48,
// //     sub: "In progress",
// //     color: "#fb923c",
// //     iconBg: "rgba(251,146,60,0.15)",
// //     icon: "🔓",
// //     expandable: true,
// //     trend: -3,
// //   },
// //   {
// //     id: "closed",
// //     label: "Closed CRQ",
// //     value: 62,
// //     sub: "Completed",
// //     color: "#4ade80",
// //     iconBg: "rgba(74,222,128,0.15)",
// //     icon: "✅",
// //     expandable: false,
// //     trend: 12,
// //   },
// //   {
// //     id: "rejected",
// //     label: "Rejected",
// //     value: 10,
// //     sub: "Declined",
// //     color: "#f87171",
// //     iconBg: "rgba(248,113,113,0.15)",
// //     icon: "❌",
// //     expandable: false,
// //     trend: -2,
// //   },
// //   {
// //     id: "sla",
// //     label: "SLA Score",
// //     value: "87%",
// //     sub: "On-time rate",
// //     color: "#8b5cf6",
// //     iconBg: "rgba(139,92,246,0.15)",
// //     icon: "🎯",
// //     expandable: true,
// //     trend: 1.2,
// //   },
// // ] as const;

// // export const workflowStages: CRQWorkflowStage[] = [
// //   { stage: "Authorization Approval",   totalCount: 18, openCount: 8 },
// //   { stage: "MOP Creation",             totalCount: 15, openCount: 7 },
// //   { stage: "Plan & Inventory Valid.",  totalCount: 14, openCount: 6 },
// //   { stage: "MOP Validation",           totalCount: 12, openCount: 5 },
// //   { stage: "Impact Analysis",          totalCount: 16, openCount: 7 },
// //   { stage: "CMB Approval",             totalCount: 13, openCount: 5 },
// //   { stage: "Impact Approval",          totalCount: 17, openCount: 8 },
// //   { stage: "Network Execution",        totalCount: 15, openCount: 2 },
// // ];

// // export const slaDomains: CRQSlaDomain[] = [
// //   { domain: "Core Network", score: 92 },
// //   { domain: "Access",       score: 85 },
// //   { domain: "Transport",    score: 78 },
// //   { domain: "IP / MPLS",   score: 95 },
// //   { domain: "Transmission", score: 82 },
// //   { domain: "Enterprise",   score: 89 },
// // ];

// // export const raisedVsClosed: CRQRaisedVsClosed[] = [
// //   { label: "Jan", raised: 28, closed: 22 },
// //   { label: "Feb", raised: 32, closed: 28 },
// //   { label: "Mar", raised: 25, closed: 20 },
// //   { label: "Apr", raised: 38, closed: 30 },
// //   { label: "May", raised: 30, closed: 25 },
// //   { label: "Jun", raised: 42, closed: 38 },
// //   { label: "Jul", raised: 35, closed: 30 },
// // ];

// // export const bottlenecks: CRQBottleneck[] = [
// //   { stage: "MOP Creation",    avgWaitHours: 48 },
// //   { stage: "Impact Analysis", avgWaitHours: 36 },
// //   { stage: "CMB Approval",    avgWaitHours: 28 },
// //   { stage: "Auth Approval",   avgWaitHours: 20 },
// //   { stage: "Network Exec.",   avgWaitHours: 16 },
// // ];

// // export const domainSlaChart: CRQDomainSlaChart[] = [
// //   { domain: "Core",    score: 92 },
// //   { domain: "Access",  score: 85 },
// //   { domain: "Trans.",  score: 78 },
// //   { domain: "IP/MPLS", score: 95 },
// //   { domain: "Tx",      score: 82 },
// //   { domain: "Ent.",    score: 89 },
// // ];

// // export const radarData: { labels: string[]; values: number[] } = {
// //   labels: ["Core", "Access", "Transport", "IP/MPLS", "Transmission", "Enterprise"],
// //   values: [88, 72, 85, 91, 67, 79],
// // };

// // // Derived shape used by the component
// // export const radarCoverage: CRQRadarCoverage[] = radarData.labels.map(
// //   (subject, i) => ({ subject, value: radarData.values[i] }),
// // );

// // export const domainCRQ: CRQDomainCount[] = [
// //   { domain: "Core",    count: 32 },
// //   { domain: "Access",  count: 24 },
// //   { domain: "Trans.",  count: 18 },
// //   { domain: "IP/MPLS", count: 16 },
// //   { domain: "Tx",      count: 12 },
// //   { domain: "Ent.",    count: 10 },
// //   { domain: "Others",  count: 8 },
// // ];
