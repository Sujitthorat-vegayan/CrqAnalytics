import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  useTheme,
  Collapse,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Skeleton,
  Alert,
  Modal,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  // ── DOMAIN COVERAGE RADAR imports — commented out but kept ──────────────
  // RadarChart,
  // Radar,
  // PolarGrid,
  // PolarAngleAxis,
  // PolarRadiusAxis,
  // ────────────────────────────────────────────────────────────────────────
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";

import { useGetCRQAnalyticsDashboardQuery } from "./crqAnalytics.api";
import type {
  CRQWorkflowStage,
  CRQSlaDomain,
  CRQRaisedVsClosed,
  CRQBottleneck,
  CRQDomainSlaChart,
  CRQRadarCoverage,
  CRQDomainCount,
  CRQRunRate,
  ChartPopupType,
} from "./crqAnalytics.api";

import {
  workflowStages as MOCK_STAGES,
  slaDomains as MOCK_SLA_DOMAINS,
  raisedVsClosed as MOCK_RAISED,
  bottlenecks as MOCK_BOTTLENECK,
  domainSlaChart as MOCK_DOMAIN_SLA,
  radarCoverage as MOCK_RADAR_COVERAGE,
  domainCRQ as MOCK_DOMAIN_CRQ,
  chartTableRows as MOCK_TABLE_ROWS,
  runRateCCBtoSE as MOCK_RUN_RATE,
} from "./crqAnalytics.mock";

// ─── Palette helpers ──────────────────────────────────────────────────────────
const slaColor = (s: number) =>
  s >= 90
    ? { bar: "#89ecad", text: "#4ade80" }
    : s >= 80
      ? { bar: "#edd266", text: "#fbbf24" }
      : { bar: "#ef4444", text: "#f87171" };

const DOMAIN_PALETTE = [
  "#818cf8",
  "#6366f1",
  "#3b82f6",
  "#22d3ee",
  "#aaecc2",
  "#facc15",
  "#94a3b8",
] as const;

// const BOTTLENECK_PALETTE = [
//   "#ef4444",
//   "#f97316",
//   "#f59e0b",
//   "#3b82f6",
//   "#22c55e",
// ] as const;

const BOTTLENECK_PALETTE = [
  "#ef0000",
  "#dd8a4e",
  "#edb75b",
  "#91b4eb",
  "#aaecc2",
] as const;

// ─── Site Group mock data ─────────────────────────────────────────────────────
const SITE_GROUP_DATA = [
  { group: "AP",   raised: 1483, rejected: 93,  closed: 717  },
  { group: "BH",   raised: 990,  rejected: 85,  closed: 433  },
  { group: "GJ",   raised: 973,  rejected: 66,  closed: 406  },
  { group: "HPHP", raised: 1347, rejected: 72,  closed: 613  },
  { group: "J&K",  raised: 340,  rejected: 18,  closed: 145  },
  { group: "JH",   raised: 348,  rejected: 34,  closed: 144  },
  { group: "KK",   raised: 1140, rejected: 73,  closed: 513  },
  // { group: "KL",   raised: 337,  rejected: 20,  closed: 178  },
  // { group: "MPCG", raised: 1166, rejected: 126, closed: 516  },
  // { group: "MUM",  raised: 561,  rejected: 13,  closed: 285  },
  // { group: "NCR",  raised: 998,  rejected: 40,  closed: 452  },
  // { group: "NESA", raised: 577,  rejected: 38,  closed: 247  },
  // { group: "OR",   raised: 495,  rejected: 35,  closed: 240  },
  // { group: "Other",raised: 4008, rejected: 319, closed: 1716 },
  // { group: "RAJ",  raised: 1043, rejected: 88,  closed: 442  },
  // { group: "ROM",  raised: 1050, rejected: 84,  closed: 438  },
  // { group: "TN",   raised: 2409, rejected: 96,  closed: 1310 },
];

// ─── Rejection Reason mock data ───────────────────────────────────────────────
const REJECTION_REASONS_ALL = [
  { reason: "AT Banner not removed",            count: 500, pct: 5 },
  { reason: "Time Constraint",                  count: 470, pct: 5 },
  { reason: "Time Constraint- NOC",             count: 440, pct: 5 },
  { reason: "Time Constraint- Ops/Deployment",  count: 410, pct: 4 },
  { reason: "MOP Issue",                        count: 380, pct: 4 },
  { reason: "Wrong Flow/BIN/Details in CRQ",   count: 350, pct: 4 },
  { reason: "Network Issue (Server/IT)",        count: 330, pct: 3 },
  { reason: "CYGNET task not in NOC-SE Bin",    count: 290, pct: 3 },
  { reason: "Cancelled due to Wrong Type of CR",count: 260, pct: 3 },
  { reason: "Commissioning Sheet not available",count: 230, pct: 2 },
  { reason: "Node reachability issue",          count: 200, pct: 2 },
  { reason: "No response from OEM",             count: 170, pct: 2 },
  { reason: "Customer/Services live in OLT",    count: 140, pct: 1 },
  { reason: "Plan Issue",                       count: 110, pct: 1 },
  { reason: "Pre Check failed- Network",        count: 80,  pct: 1 },
  { reason: "Pre Check Failed- Planning",       count: 50,  pct: 1 },
  { reason: "Redundancy Failure",               count: 20,  pct: 0 },
  { reason: "Site Access Issue",                count: 10,  pct: 0 },
];
const TOP4_REJECTION_REASONS = REJECTION_REASONS_ALL.slice(0, 4);

// ─── CRQ Aging Heatmap data ───────────────────────────────────────────────────
const AGING_HEATMAP_DATA = [
  { bucket: "<2 Days",  ccb: 986,  se: 622  },
  { bucket: "2-4 Days", ccb: 408,  se: 580  },
  { bucket: "4-6 Days", ccb: 163,  se: 226  },
  { bucket: "6-8 Days", ccb: 259,  se: 397  },
  { bucket: ">8 Days",  ccb: 1012, se: 1821 },
];

// ─── Open CRQ Domain Wise data (CCB + SE only, no CCBV) ──────────────────────
const OPEN_CRQ_DOMAIN_DATA = [
  { domain: "IP Core",    ccb: 750,  se: 1000 },
  { domain: "Embedded Support",      ccb: 550,  se: 600  },
  { domain: "IP Access",   ccb: 500,  se: 400  },
  { domain: "Optics",           ccb: 500,  se: 400  },
  { domain: "Service Optimisation",     ccb: 450,  se: 180  },
  { domain: "Packet",    ccb: 400,  se: 150  },
  // { domain: "Svc Migration",    ccb: 400,  se: 150  },
  // { domain: "Embedded",         ccb: 300,  se: 200  },
  // { domain: "IP Access-OLT",    ccb: 350,  se: 100  },
];

// ─── Chart Popup Config ───────────────────────────────────────────────────────
interface PopupColConfig {
  key: string;
  label: string;
  getValue: (row: (typeof MOCK_TABLE_ROWS)[number], index: number) => string;
}

const CHART_POPUP_CONFIGS: Record<
  ChartPopupType,
  { title: string; extraCol: PopupColConfig }
> = {
  raised: {
    title: "CRQ Raised vs Closed — Ticket Aging Distribution",
    extraCol: {
      key: "type",
      label: "Type",
      getValue: (_r, i) => (i % 2 === 0 ? "Raised" : "Closed"),
    },
  },
  bottleneck: {
    title: "Bottleneck Detection — Ticket Aging Distribution",
    extraCol: {
      key: "avgWait",
      label: "Avg Wait",
      getValue: (_r, i) =>
        [
          "72h",
          "48h",
          "32h",
          "18h",
          "24h",
          "56h",
          "40h",
          "12h",
          "64h",
          "36h",
          "44h",
          "28h",
          "20h",
          "52h",
          "16h",
          "68h",
          "8h",
          "76h",
          "60h",
          "4h",
        ][i % 20],
    },
  },
  domainsla: {
    title: "Domain SLA Performance — Ticket Aging Distribution",
    extraCol: {
      key: "slaScore",
      label: "SLA Score",
      getValue: (_r, i) =>
        [
          "94%",
          "88%",
          "72%",
          "85%",
          "91%",
          "76%",
          "89%",
          "83%",
          "68%",
          "95%",
          "79%",
          "87%",
          "73%",
          "92%",
          "81%",
          "70%",
          "96%",
          "84%",
          "78%",
          "90%",
        ][i % 20],
    },
  },
  // ── DOMAIN COVERAGE RADAR popup config — commented out but kept ──────────
  radar: {
    title: "Domain Coverage Radar — Ticket Aging Distribution",
    extraCol: {
      key: "coverage",
      label: "Coverage %",
      getValue: (_r, i) =>
        [
          "82%",
          "91%",
          "75%",
          "88%",
          "94%",
          "70%",
          "86%",
          "79%",
          "93%",
          "68%",
          "85%",
          "77%",
          "90%",
          "83%",
          "72%",
          "89%",
          "76%",
          "95%",
          "81%",
          "74%",
        ][i % 20],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  domaincrq: {
    title: "Open CRQ Analysis (Domain Wise) — Ticket Aging Distribution",
    extraCol: {
      key: "domainGroup",
      label: "Domain Group",
      getValue: (_r, i) =>
        [
          "IP Core",
          "Packet",
          "Optics",
          "BRAS",
          "CEN",
          "MPLS",
          "IP Access",
          "IP Core",
          "Packet",
          "Optics",
          "BRAS",
          "CEN",
          "MPLS",
          "IP Access",
          "IP Core",
          "Packet",
          "Optics",
          "BRAS",
          "CEN",
          "MPLS",
        ][i % 20],
    },
  },
  // ── NEW: Run Rate popup config ────────────────────────────────────────────
  runrate: {
    title: "Run Rate: CCB to SE — Ticket Aging Distribution",
    extraCol: {
      key: "runRateStage",
      label: "Stage",
      getValue: (_r, i) =>
        ["CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE"][i % 20],
    },
  },
  // ── NEW: Site Group popup config ──────────────────────────────────────────
  sitegroup: {
    title: "Site Group Wise CRQ Analytics — Ticket Aging Distribution",
    extraCol: {
      key: "siteGroup",
      label: "Site Group",
      getValue: (_r, i) =>
        ["AP","BH","GJ","HPHP","J&K","JH","KK","KL","MPCG","MUM","NCR","NESA","OR","Other","RAJ","ROM","TN","AP","BH","GJ"][i % 20],
    },
  },
  // ── NEW: Rejection Reason popup config ───────────────────────────────────
  rejection: {
    title: "Analytics — Reason for Cancellation Rejection — Ticket Aging Distribution",
    extraCol: {
      key: "rejectionReason",
      label: "Rejection Reason",
      getValue: (_r, i) =>
        ["AT Banner not removed","Time Constraint","Time Constraint- NOC","Time Constraint- Ops/Deployment","MOP Issue","Wrong Flow/BIN","Network Issue","CYGNET task","Wrong Type of CR","Commissioning Sheet","AT Banner not removed","Time Constraint","Time Constraint- NOC","Time Constraint- Ops/Deployment","MOP Issue","Wrong Flow/BIN","Network Issue","CYGNET task","Wrong Type of CR","Commissioning Sheet"][i % 20],
    },
  },
  // ── NEW: Aging Heatmap popup config ──────────────────────────────────────
  agingheatmap: {
    title: "CRQ Aging Heatmap — Ticket Aging Distribution",
    extraCol: {
      key: "agingBucket",
      label: "Aging Bucket",
      getValue: (_r, i) =>
        ["<2 Days","2-4 Days","4-6 Days","6-8 Days",">8 Days","<2 Days","2-4 Days","4-6 Days","6-8 Days",">8 Days","<2 Days","2-4 Days","4-6 Days","6-8 Days",">8 Days","<2 Days","2-4 Days","4-6 Days","6-8 Days",">8 Days"][i % 20],
    },
  },
};

// ─── Style factories ──────────────────────────────────────────────────────────
const panelSx = (isDark: boolean): SxProps<Theme> => ({
  background: isDark
    ? "linear-gradient(145deg,#0f1a2e 0%,#0a1220 100%)"
    : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
  border: `1px solid ${isDark ? "rgba(99,130,180,0.15)" : "rgba(226,232,240,0.9)"}`,
  borderRadius: 3,
  p: 2,
  position: "relative",
  overflow: "hidden",
  boxShadow: isDark
    ? "0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)"
    : "0 2px 12px rgba(0,0,0,0.06)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: isDark
      ? "linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)"
      : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
  },
});

const sectionTitleSx = (isDark: boolean): SxProps<Theme> => ({
  fontSize: "0.65rem",
  fontWeight: 700,
  color: isDark ? "#94a3b8" : "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
});

const selectSx = (isDark: boolean): SxProps<Theme> => ({
  height: 32,
  fontSize: 12,
  color: isDark ? "#e2e8f0" : "#1e293b",
  bgcolor: isDark ? "rgba(15,26,46,0.9)" : "rgba(248,250,252,0.9)",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: isDark ? "rgba(99,130,180,0.3)" : "rgba(203,213,225,0.9)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: isDark ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.5)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: isDark ? "#38bdf8" : "#6366f1",
  },
  "& .MuiSelect-icon": {
    color: isDark ? "#64748b" : "#94a3b8",
    fontSize: 18,
  },
});

// ─── KPI config ───────────────────────────────────────────────────────────────
const KPI_CFG = [
  { id: "total",    label: "Total CRQ",   icon: "📊", color: "#38bdf8", iconBg: "rgba(56,189,248,0.15)",  expandable: true  },
  { id: "open",     label: "Open CRQ",    icon: "🔓", color: "#fb923c", iconBg: "rgba(251,146,60,0.15)",  expandable: true  },
  { id: "closed",   label: "Closed CRQ",  icon: "✅", color: "#4ade80", iconBg: "rgba(74,222,128,0.15)",  expandable: false },
  { id: "rejected", label: "Rejected",    icon: "❌", color: "#f87171", iconBg: "rgba(248,113,113,0.15)", expandable: false },
  { id: "sla",      label: "SLA Score",   icon: "🎯", color: "#8b5cf6", iconBg: "rgba(139,92,246,0.15)",  expandable: true  },
] as const;

type KpiId = (typeof KPI_CFG)[number]["id"];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  cfg: (typeof KPI_CFG)[number];
  value: string | number;
  sub: string;
  trend: number;
  isDark: boolean;
  isActive: boolean;
  onClick: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ cfg, value, sub, trend, isDark, isActive, onClick }) => {
  const trendColor = trend >= 0 ? "#4ade80" : "#f87171";
  const text  = isDark ? "#e2e8f0" : "#1e293b";
  const muted = isDark ? "#64748b" : "#94a3b8";

  return (
    <Box
      role={cfg.expandable ? "button" : undefined}
      tabIndex={cfg.expandable ? 0 : undefined}
      aria-expanded={cfg.expandable ? isActive : undefined}
      onClick={cfg.expandable ? onClick : undefined}
      onKeyDown={cfg.expandable ? (e) => e.key === "Enter" && onClick() : undefined}
      sx={{
        background: isDark
          ? "linear-gradient(160deg,#0d1b2e 0%,#0a1525 100%)"
          : "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)",
        border: `1px solid ${isActive ? `${cfg.color}55` : isDark ? `${cfg.color}22` : "rgba(226,232,240,0.9)"}`,
        borderRadius: 3,
        p: 2,
        position: "relative",
        overflow: "hidden",
        cursor: cfg.expandable ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: isActive
          ? `0 6px 28px ${cfg.color}30,inset 0 0 30px ${cfg.color}0d`
          : isDark
            ? `0 4px 20px rgba(0,0,0,0.4),inset 0 0 30px ${cfg.iconBg}`
            : "0 2px 10px rgba(0,0,0,0.06)",
        transform: isActive ? "translateY(-2px)" : "none",
        "&:hover": cfg.expandable ? { transform: "translateY(-2px)", boxShadow: `0 8px 32px ${cfg.color}28` } : {},
        "&:focus-visible": { outline: `2px solid ${cfg.color}`, outlineOffset: 2 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
            {cfg.icon}
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: text, lineHeight: 1.2 }}>{cfg.label}</Typography>
        </Box>
        {cfg.expandable && (
          <Box sx={{ px: 0.8, py: 0.15, borderRadius: 0.8, fontSize: 9, fontWeight: 700, bgcolor: isActive ? `${cfg.color}22` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${isActive ? `${cfg.color}44` : "transparent"}`, color: isActive ? cfg.color : muted, transition: "all 0.2s" }}>
            {isActive ? "▲" : "▼"}
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 9, color: trendColor }}>{trend >= 0 ? "▲" : "▼"}</Typography>
          <Typography sx={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>{Math.abs(trend).toFixed(1)}%</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 10, color: muted }}>{sub}</Typography>
      {isActive && <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${cfg.color},transparent)` }} />}
    </Box>
  );
};

// ─── Workflow Expand Panel ────────────────────────────────────────────────────
interface WorkflowExpandPanelProps {
  type: "total" | "open" | "sla";
  stages: CRQWorkflowStage[];
  slaDomains: CRQSlaDomain[];
  isDark: boolean;
}

const WorkflowExpandPanel: React.FC<WorkflowExpandPanelProps> = ({ type, stages, slaDomains, isDark }) => {
  const text  = isDark ? "#e2e8f0" : "#1e293b";
  const muted = isDark ? "#64748b" : "#94a3b8";
  const panelBg   = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
  const accentColor = type === "sla" ? "#8b5cf6" : type === "total" ? "#38bdf8" : "#fb923c";

  if (type === "sla") {
    return (
      <Box
        sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: "#8b5cf6" }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>SLA Score — Domain Breakdown</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 1.5 }}>
          {slaDomains.map((d) => {
            const c = slaColor(d.score);
            return (
              <Box key={d.domain} sx={{ background: panelBg, borderRadius: 2, p: 1.5, border: `1px solid ${isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}` }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: 11, color: muted, fontWeight: 500 }}>{d.domain}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.text, bgcolor: `${c.bar}20`, px: 0.8, borderRadius: 0.8 }}>{d.score}%</Typography>
                </Box>
                <Box
                  sx={{
                    height: 5,
                    bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${d.score}%`,
                      height: "100%",
                      bgcolor: c.bar,
                      borderRadius: 3,
                      transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  const data = stages.map((s) => ({ name: s.stage, count: type === "total" ? s.totalCount : s.openCount }));
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const total  = data.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: accentColor }}
          />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
            {type === "total" ? "Total CRQ" : "Open CRQ"} — Workflow Stage
            Breakdown
          </Typography>
        </Box>
        <Chip label={`${total} across ${data.length} stages`} size="small" sx={{ fontSize: 10, fontWeight: 600, bgcolor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33`, height: 22 }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 1.5 }}>
        {data.map((s) => {
          const pct      = Math.round((s.count / total) * 100);
          const ratio    = s.count / maxVal;
          const barColor = ratio >= 0.75 ? "#ef4444" : ratio >= 0.5 ? "#f59e0b" : "#3b82f6";
          const isMax    = s.count === maxVal;
          return (
            <Box key={s.name} sx={{ background: panelBg, borderRadius: 2, p: 1.5, position: "relative", border: `1px solid ${isMax ? `${barColor}44` : isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}`, transition: "transform 0.15s ease", "&:hover": { transform: "translateY(-1px)" } }}>
              {isMax && <Box sx={{ position: "absolute", top: 6, right: 6, fontSize: 8, color: "#ef4444", bgcolor: "rgba(239,68,68,0.12)", borderRadius: 0.5, px: 0.6, py: 0.1, fontWeight: 700, letterSpacing: "0.05em" }}>MAX</Box>}
              <Typography sx={{ fontSize: 10, color: muted, mb: 0.8, lineHeight: 1.4, pr: isMax ? 4 : 0 }}>{s.name}</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: text, lineHeight: 1 }}>{s.count}</Typography>
              <Typography sx={{ fontSize: 10, color: muted, mb: 1 }}>{pct}% of total</Typography>
              <Box sx={{ height: 4, bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: barColor, borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  isDark: boolean;
  height?: number;
  isLoading?: boolean;
  onTitleClick?: () => void;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, isDark, height = 185, isLoading, onTitleClick, children }) => (
  <Box sx={panelSx(isDark)}>
    <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>{title}</span>
      {onTitleClick && (
        <Box
          component="button"
          onClick={onTitleClick}
          sx={{
            background: "none",
            border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
            borderRadius: 1,
            cursor: "pointer",
            color: isDark ? "#38bdf8" : "#6366f1",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            px: 0.8,
            py: 0.3,
            textTransform: "uppercase",
            transition: "all 0.18s",
            "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
          }}
        >
          View All
        </Box>
      )}
    </Box>
    {isLoading
      ? <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9" }} />
      : <Box sx={{ height }}>{children}</Box>
    }
  </Box>
);

// ─── Chart Popup Table ────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Completed: { bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
  Open:      { bg: "rgba(56,189,248,0.15)",  text: "#38bdf8" },
  Rejected:  { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
};

interface ChartPopupTableProps {
  open: boolean;
  onClose: () => void;
  chartType: ChartPopupType | null;
  isDark: boolean;
}

const ChartPopupTable: React.FC<ChartPopupTableProps> = ({ open, onClose, chartType, isDark }) => {
  if (!chartType) return null;
  const cfg  = CHART_POPUP_CONFIGS[chartType];
  const rows = MOCK_TABLE_ROWS;

  const headerCellSx: SxProps<Theme> = {
    fontSize: "0.6rem",
    fontWeight: 700,
    color: isDark ? "#64748b" : "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    bgcolor: isDark ? "#060e1a" : "#f8fafc",
    borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.2)" : "rgba(226,232,240,0.9)"}`,
    whiteSpace: "nowrap",
    py: 1,
    px: 1.5,
  };

  const bodyCellSx: SxProps<Theme> = {
    fontSize: 11,
    color: isDark ? "#cbd5e1" : "#475569",
    borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.08)" : "rgba(226,232,240,0.6)"}`,
    whiteSpace: "nowrap",
    py: 0.9,
    px: 1.5,
  };

  return (
    <Modal open={open} onClose={onClose} keepMounted={false}>
      <Box
        sx={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: { xs: "95vw", md: "min(900px,90vw)" },
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: isDark
            ? "linear-gradient(145deg,#0a1525 0%,#060e1a 100%)"
            : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
          border: `1px solid ${isDark ? "rgba(99,130,180,0.25)" : "rgba(226,232,240,0.9)"}`,
          borderRadius: 3,
          boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.7)" : "0 12px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
          outline: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 2.5, py: 1.5,
            borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.18)" : "rgba(226,232,240,0.9)"}`,
            flexShrink: 0, position: "relative",
            "&::after": { content: '""', position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: isDark ? "linear-gradient(90deg,transparent,rgba(56,189,248,0.3),transparent)" : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)" },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{cfg.title}</Typography>
            <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mt: 0.25 }}>Showing {rows.length} records</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 1.5, width: 30, height: 30, "&:hover": { bgcolor: "rgba(248,113,113,0.22)" } }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>Change ID</TableCell>
                <TableCell sx={headerCellSx}>Submit Date</TableCell>
                <TableCell sx={headerCellSx}>Status</TableCell>
                <TableCell sx={headerCellSx}>Aging</TableCell>
                <TableCell sx={headerCellSx}>Impact</TableCell>
                <TableCell sx={headerCellSx}>Requester</TableCell>
                <TableCell sx={headerCellSx}>{cfg.extraCol.label}</TableCell>
                <TableCell sx={{ ...headerCellSx, minWidth: 220 }}>
                  Summary
                </TableCell>
                <TableCell sx={headerCellSx}>Region</TableCell>
                <TableCell sx={headerCellSx}>Circle</TableCell>
                <TableCell sx={headerCellSx}>Bin Group</TableCell>
                <TableCell sx={headerCellSx}>Coordinator</TableCell>
                <TableCell sx={headerCellSx}>Implementor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                const sc = STATUS_COLORS[row.status] ?? STATUS_COLORS["Open"];
                return (
                  <TableRow key={row.changeId} sx={{ "&:hover td": { bgcolor: isDark ? "rgba(56,189,248,0.04)" : "rgba(99,102,241,0.03)" } }}>
                    <TableCell sx={bodyCellSx}><Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#38bdf8" : "#3b82f6" }}>{row.changeId}</Typography></TableCell>
                    <TableCell sx={bodyCellSx}>{row.submitDate}</TableCell>
                    <TableCell sx={bodyCellSx}><Box component="span" sx={{ bgcolor: sc.bg, color: sc.text, borderRadius: 0.8, px: 1, py: 0.25, fontSize: 10, fontWeight: 700 }}>{row.status}</Box></TableCell>
                    <TableCell sx={bodyCellSx}><Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{row.aging}</Typography></TableCell>
                    <TableCell sx={bodyCellSx}>{row.impact}</TableCell>
                    <TableCell sx={bodyCellSx}>{row.requester}</TableCell>
                    <TableCell sx={bodyCellSx}>{cfg.extraCol.getValue(row, idx)}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.summary}</TableCell>
                    <TableCell sx={bodyCellSx}>{row.region}</TableCell>
                    <TableCell sx={bodyCellSx}>{row.circle}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, fontSize: 10, color: isDark ? "#94a3b8" : "#64748b" }}>{row.binGroup}</TableCell>
                    <TableCell sx={bodyCellSx}>{row.coordinator}</TableCell>
                    <TableCell sx={bodyCellSx}>{row.implementor}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({
  active, payload, label, isDark,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  isDark: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: isDark ? "#0d1b2e" : "#fff", border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 2, px: 1.5, py: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", fontSize: 11 }}>
      {label && <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mb: 0.5 }}>{label}</Typography>}
      {payload.map((p) => (
        <Box key={p.name} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
          <Typography sx={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>{p.name}:</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{p.value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Aging Heatmap Cell color ────────────────────────────────────────────────
const getHeatmapColor = (value: number, max: number): string => {
  const ratio = value / max;
  if (ratio >= 0.85) return "#dc2626"; // deep red
  if (ratio >= 0.7)  return "#ef4444"; // red
  if (ratio >= 0.55) return "#f97316"; // orange
  if (ratio >= 0.4)  return "#f59e0b"; // amber
  if (ratio >= 0.25) return "#eab308"; // yellow
  if (ratio >= 0.12) return "#84cc16"; // lime
  return "#22c55e";                    // green
};

// ─── CRQ Aging Heatmap component ─────────────────────────────────────────────
interface AgingHeatmapProps {
  isDark: boolean;
  onViewAll: () => void;
}

const CRQAgingHeatmap: React.FC<AgingHeatmapProps> = ({ isDark, onViewAll }) => {
  const text  = isDark ? "#e2e8f0" : "#1e293b";
  const muted = isDark ? "#64748b" : "#94a3b8";
  const maxVal = Math.max(...AGING_HEATMAP_DATA.flatMap(d => [d.ccb, d.se]));
  const highRisk = AGING_HEATMAP_DATA.find(d => d.bucket === ">8 Days");
  const totalHighRisk = (highRisk?.ccb ?? 0) + (highRisk?.se ?? 0);

  return (
    <Box sx={panelSx(isDark)}>
      <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>CRQ AGING HEATMAP</span>
        <Box
          component="button"
          onClick={onViewAll}
          sx={{
            background: "none",
            border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
            borderRadius: 1,
            cursor: "pointer",
            color: isDark ? "#38bdf8" : "#6366f1",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            px: 0.8,
            py: 0.3,
            textTransform: "uppercase",
            transition: "all 0.18s",
            "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
          }}
        >
          View All
        </Box>
      </Box>

      {/* Column headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", gap: 1, mb: 0.5 }}>
        <Box />
        {["CCB", "SE"].map(col => (
          <Box key={col} sx={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: muted, pb: 0.5, borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.2)" : "#e2e8f0"}` }}>
            {col}
          </Box>
        ))}
      </Box>

      {/* Heatmap rows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {AGING_HEATMAP_DATA.map((row) => (
          <Box key={row.bucket} sx={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", gap: 1, alignItems: "center" }}>
            <Typography sx={{ fontSize: 11, color: muted, fontWeight: row.bucket === ">8 Days" ? 700 : 400 }}>{row.bucket}</Typography>
            {[{ val: row.ccb, key: "ccb" }, { val: row.se, key: "se" }].map(({ val, key }) => {
              const bg = getHeatmapColor(val, maxVal);
              return (
                <Box
                  key={key}
                  sx={{
                    bgcolor: bg,
                    borderRadius: 1.5,
                    py: 1,
                    textAlign: "center",
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 0.85 },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {val.toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Color scale legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
        <Typography sx={{ fontSize: 10, color: muted }}>Low</Typography>
        <Box sx={{
          flex: 1, height: 6, borderRadius: 3,
          background: "linear-gradient(90deg,#22c55e,#84cc16,#eab308,#f59e0b,#f97316,#ef4444,#dc2626)",
        }} />
        <Typography sx={{ fontSize: 10, color: muted }}>High</Typography>
      </Box>

      {/* High risk summary */}
      {totalHighRisk > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1, p: 1, bgcolor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)", borderRadius: 1.5, border: `1px solid rgba(239,68,68,0.25)` }}>
          <Typography sx={{ fontSize: 14 }}>⚠️</Typography>
          <Typography sx={{ fontSize: 11, color: isDark ? "#fca5a5" : "#dc2626", fontWeight: 600 }}>
            High Risk CRQs (&gt;8 Days): <strong>{totalHighRisk.toLocaleString()}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterKey   = "function" | "domain" | "subDomain" | "circle";
type FilterState = Record<FilterKey, string>;

// ─── Site Group time filter ───────────────────────────────────────────────────
type SiteGroupFilter = "24h" | "1w" | "30d" | "custom";

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const CRQAnalyticsMain: React.FC = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [startDate, setStartDate] = useState<Dayjs>(() => dayjs().startOf("month"));
  const [endDate,   setEndDate]   = useState<Dayjs>(() => dayjs().endOf("month"));
  const [filters, setFilters] = useState<FilterState>({
    function: "All Functions",
    domain:   "All Domains",
    subDomain:"All Sub-Domains",
    circle:   "All Circles",
  });

  const [popupChart, setPopupChart] = useState<ChartPopupType | null>(null);
  const openPopup = useCallback(
    (type: ChartPopupType) => setPopupChart(type),
    [],
  );
  const closePopup = useCallback(() => setPopupChart(null), []);

  // Site Group filter state
  const [siteGroupFilter, setSiteGroupFilter] = useState<SiteGroupFilter>("24h");
  const [sgCustomStart, setSgCustomStart] = useState<Dayjs>(() => dayjs().subtract(7, "day"));
  const [sgCustomEnd,   setSgCustomEnd]   = useState<Dayjs>(() => dayjs());

  const domainOptions = useMemo(() => {
    if (filters.function === "All Functions") return ["All Domains"];
    return [
      "All Domains",
      ...Object.keys(FUNC_HIERARCHY[filters.function] || {}),
    ];
  }, [filters.function]);

  const subDomainOptions = useMemo(() => {
    if (filters.domain === "All Domains") return ["All Sub-Domains"];
    if (
      filters.function !== "All Functions" &&
      FUNC_HIERARCHY[filters.function]?.[filters.domain]
    ) {
      return [
        "All Sub-Domains",
        ...FUNC_HIERARCHY[filters.function][filters.domain],
      ];
    }
    return ["All Sub-Domains"];
  }, [filters.function, filters.domain]);

  const handleFunctionChange = (value: string) =>
    setFilters((prev) => ({ ...prev, function: value, domain: "All Domains", subDomain: "All Sub-Domains" }));

  const handleDomainChange = (value: string) =>
    setFilters((prev) => ({ ...prev, domain: value, subDomain: "All Sub-Domains" }));

  const [activePanel, setActivePanel] = useState<KpiId | null>(null);
  const handleCardClick = useCallback((id: KpiId) => {
    setActivePanel((prev) => (prev === id ? null : id));
  }, []);

  const { data, isFetching, isError } = useGetCRQAnalyticsDashboardQuery({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate:   endDate.format("YYYY-MM-DD"),
  });

  const workflowStages = useMemo<CRQWorkflowStage[]>  (() => data?.workflowStages  ?? MOCK_STAGES,         [data]);
  const slaDomains     = useMemo<CRQSlaDomain[]>      (() => data?.slaDomains      ?? MOCK_SLA_DOMAINS,    [data]);
  const raisedVsClosed = useMemo<CRQRaisedVsClosed[]> (() => data?.raisedVsClosed  ?? MOCK_RAISED,         [data]);
  const bottlenecks    = useMemo<CRQBottleneck[]>     (() => data?.bottlenecks     ?? MOCK_BOTTLENECK,     [data]);
  const domainSlaChart = useMemo<CRQDomainSlaChart[]> (() => data?.domainSlaChart  ?? MOCK_DOMAIN_SLA,     [data]);
  // radarCoverage kept in state but chart is commented out below
  const radarCoverage  = useMemo<CRQRadarCoverage[]>  (() => data?.radarCoverage   ?? MOCK_RADAR_COVERAGE, [data]);
  const domainCrqCount = useMemo<CRQDomainCount[]>    (() => data?.domainCrqCount  ?? MOCK_DOMAIN_CRQ,     [data]);
  const runRate        = useMemo<CRQRunRate[]>         (() => data?.runRate         ?? MOCK_RUN_RATE,       [data]);

   const CARD_HEIGHT = 300;
   
  const kpiValues = useMemo(() => ({
    total:    { value: data?.kpi?.totalCrq    ?? 120,    sub: "All requests",  trend: data?.kpi?.totalTrendPct    ?? 8   },
    open:     { value: data?.kpi?.openCrq     ?? 48,     sub: "In progress",   trend: data?.kpi?.openTrendPct     ?? -3  },
    closed:   { value: data?.kpi?.closedCrq   ?? 62,     sub: "Completed",     trend: data?.kpi?.closedTrendPct   ?? 12  },
    rejected: { value: data?.kpi?.rejected    ?? 10,     sub: "Declined",      trend: data?.kpi?.rejectedTrendPct ?? -2  },
    sla:      { value: `${data?.kpi?.slaScore ?? 87}%`,  sub: "On-time rate",  trend: data?.kpi?.slaTrendPct      ?? 1.2 },
  }), [data]);

  const gridColor    = isDark ? "rgba(99,130,180,0.08)" : "#f1f5f9";
  const tickColor    = isDark ? "#475569" : "#94a3b8";
  const tooltipStyle = {
    background: isDark ? "#0d1b2e" : "#fff",
    border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
    borderRadius: 8,
    fontSize: 11,
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    padding: "8px 12px",
  };
  const text  = isDark ? "#e2e8f0" : "#1e293b";
  const muted = isDark ? "#64748b" : "#94a3b8";

  // Pie chart data for top 4 rejection reasons
  const rejectionPieData = TOP4_REJECTION_REASONS.map((r, i) => ({
    name: r.reason.length > 28 ? r.reason.slice(0, 28) + "…" : r.reason,
    fullName: r.reason,
    value: r.pct,
    count: r.count,
  }));
  const PIE_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a78bfa"];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ pb: 2 }}>

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5,
            p: { xs: 1.5, md: 1.5 }, borderRadius: 2.5, mb: 2,
            background: isDark
              ? "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))"
              : "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.8))",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(226,232,240,0.95)"}`,
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.3)"
              : "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <DatePicker label="Start Date" value={startDate} maxDate={endDate} onChange={(v) => v && setStartDate(v)} slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }} />
          <DatePicker label="End Date"   value={endDate}   minDate={startDate} onChange={(v) => v && setEndDate(v)}   slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }} />
          <Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0 }} />
          <Select value={filters.function} onChange={(e) => handleFunctionChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
            {["All Functions","SE","CCB"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
          <Select value={filters.domain} onChange={(e) => handleDomainChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
            {domainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
          <Select value={filters.subDomain} onChange={(e) => setFilters((prev) => ({ ...prev, subDomain: e.target.value }))} sx={{ ...selectSx(isDark), minWidth: 132 }}>
            {subDomainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
          <FormControl size="small">
            <Select value={filters.circle} onChange={(e) => setFilters((prev) => ({ ...prev, circle: e.target.value }))} displayEmpty sx={{ ...selectSx(isDark), minWidth: 132 }}>
              {CIRCLE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {isError && (
          <Alert
            severity="warning"
            sx={{ mb: 2, fontSize: 12, borderRadius: 2 }}
          >
            API unavailable — showing demo data. Connect{" "}
            <strong>/crq-analytics/dashboard</strong> for live data.
          </Alert>
        )}

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(5,1fr)" }, gap: 1.5, mb: 1.5 }}>
          {KPI_CFG.map((cfg) => {
            const kv = kpiValues[cfg.id];
            return (
              <KPICard
                key={cfg.id}
                cfg={cfg}
                value={isFetching ? "…" : kv.value}
                sub={kv.sub}
                trend={kv.trend}
                isDark={isDark}
                isActive={activePanel === cfg.id}
                onClick={() => handleCardClick(cfg.id)}
              />
            );
          })}
        </Box>

        {/* ── Expandable KPI panel ────────────────────────────────────── */}
        <Collapse in={activePanel !== null} unmountOnExit>
          {(activePanel === "total" || activePanel === "open") && (
            <WorkflowExpandPanel
              type={activePanel}
              stages={workflowStages}
              slaDomains={slaDomains}
              isDark={isDark}
            />
          )}
          {activePanel === "sla" && (
            <WorkflowExpandPanel
              type="sla"
              stages={workflowStages}
              slaDomains={slaDomains}
              isDark={isDark}
            />
          )}
        </Collapse>

        {/* ── Row 1: Area + Bottleneck + Domain SLA ─────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {/* Raised vs Closed */}
          <ChartCard title="CRQ RAISED VS CLOSED" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("raised")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={raisedVsClosed}
                margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
              >
                <defs>
                  <linearGradient id="grRaised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
                  formatter={(v) => (
                    <span style={{ color: tickColor }}>{v}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="raised"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#grRaised)"
                  dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Raised"
                />
                <Area
                  type="monotone"
                  dataKey="closed"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#grClosed)"
                  dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Closed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bottleneck */}
          <ChartCard title="BOTTLENECK DETECTION" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("bottleneck")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottlenecks} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} unit="h" />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} width={88} />
                <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, "Avg Wait"]} />
                <Bar dataKey="avgWaitHours" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {bottlenecks.map((_, i) => <Cell key={i} fill={BOTTLENECK_PALETTE[Math.min(i, BOTTLENECK_PALETTE.length - 1)]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Domain SLA */}
          <ChartCard title="DOMAIN SLA PERFORMANCE" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("domainsla")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainSlaChart}
                margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="domain"
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <RTooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v}%`, "SLA Score"]}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {domainSlaChart.map((d, i) => (
                    <Cell key={i} fill={slaColor(d.score).bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

       

        {/* ── Row 2: Open CRQ Domain Wise Analysis + Run Rate ────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.5, mb: 1.5 }}>

          {/* ── OPEN CRQ DOMAIN WISE (CCB + SE only — CCBV removed) ─────── */}
          {/* NOTE: Original DOMAIN WISE CRQ ANALYSIS code below is commented out — do not remove */}
          {/*
          <ChartCard title="DOMAIN WISE CRQ ANALYSIS" isDark={isDark} height={240} isLoading={isFetching} onTitleClick={() => openPopup("domaincrq")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainCrqCount}
                margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="domain"
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [v, "CRQ Count"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {domainCrqCount.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          */}

          {/* Open CRQ Analysis (Domain Wise) — CCB + SE only */}
          <Box sx={panelSx(isDark)}>
            <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>OPEN CRQ ANALYSIS (DOMAIN WISE)</span>
              <Box
                component="button"
                onClick={() => openPopup("domaincrq")}
                sx={{
                  background: "none",
                  border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: isDark ? "#38bdf8" : "#6366f1",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  px: 0.8,
                  py: 0.3,
                  textTransform: "uppercase",
                  transition: "all 0.18s",
                  "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
                }}
              >
                View All
              </Box>
            </Box>
            {/* Legend */}
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              {[{ color: "#6366f1", label: "CCB" }, { color: "#94a3b8", label: "SE" }].map(({ color, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
                  <Typography sx={{ fontSize: 10, color: muted }}>{label}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OPEN_CRQ_DOMAIN_DATA} margin={{ top: 4, right: 8, bottom: 24, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="domain"
                    tick={{ fontSize: 11, fill: tickColor }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={48}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="ccb" name="CCB" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="se"  name="SE"  stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>


          {/* Run Rate: CCB to SE */}
          <ChartCard title="RUN RATE: CCB TO SE" isDark={isDark} height={240} isLoading={isFetching} onTitleClick={() => openPopup("runrate")}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={runRate} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grCCB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}  />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 8, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                  angle={-35}
                  textAnchor="end"
                  height={36}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                  formatter={(v) => <span style={{ color: tickColor }}>{v}</span>}
                />
                <Bar dataKey="receivedInCCB" name="Received in CCB" fill="url(#grCCB)" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Line
                  type="monotone"
                  dataKey="movedToSE"
                  name="Moved to SE"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="seToClosed"
                  name="SE to Closed"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#94a3b8", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

        {/* ── Site Group Wise CRQ Analytics (new chart) ─────────────────── */}
        <Box sx={{ ...panelSx(isDark), height: 295 }}>
          {/* Header + filters */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
            <Typography sx={{ ...sectionTitleSx(isDark) }}>SITE GROUP WISE CRQ ANALYTICS</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {/* Quick filter buttons */}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {(["24h", "1w", "30d", "custom"] as SiteGroupFilter[]).map((f) => (
                  <Box
                    key={f}
                    component="button"
                    onClick={() => setSiteGroupFilter(f)}
                    sx={{
                      background: siteGroupFilter === f
                        ? (isDark ? "rgba(56,189,248,0.18)" : "rgba(99,102,241,0.12)")
                        : "none",
                      border: `1px solid ${siteGroupFilter === f
                        ? (isDark ? "rgba(56,189,248,0.5)" : "rgba(99,102,241,0.5)")
                        : (isDark ? "rgba(99,130,180,0.3)" : "rgba(203,213,225,0.9)")}`,
                      borderRadius: 1,
                      cursor: "pointer",
                      color: siteGroupFilter === f ? (isDark ? "#38bdf8" : "#6366f1") : muted,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      px: 1,
                      py: 0.4,
                      transition: "all 0.18s",
                    }}
                  >
                    {f === "24h" ? "Last 24h" : f === "1w" ? "1 Week" : f === "30d" ? "30 Days" : "Custom"}
                  </Box>
                ))}
              </Box>
              {/* Custom date pickers — show only when custom is selected */}
              {siteGroupFilter === "custom" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DatePicker
                    label="From"
                    value={sgCustomStart}
                    maxDate={sgCustomEnd}
                    onChange={(v) => v && setSgCustomStart(v)}
                    slotProps={{ textField: { size: "small", sx: { minWidth: 130, "& .MuiInputBase-root": { height: 28, fontSize: 11 } } } }}
                  />
                  <DatePicker
                    label="To"
                    value={sgCustomEnd}
                    minDate={sgCustomStart}
                    onChange={(v) => v && setSgCustomEnd(v)}
                    slotProps={{ textField: { size: "small", sx: { minWidth: 130, "& .MuiInputBase-root": { height: 28, fontSize: 11 } } } }}
                  />
                </Box>
              )}
              <Box
                component="button"
                onClick={() => openPopup("sitegroup")}
                sx={{
                  background: "none",
                  border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: isDark ? "#38bdf8" : "#6366f1",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  px: 0.8,
                  py: 0.3,
                  textTransform: "uppercase",
                  transition: "all 0.18s",
                  "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
                }}
              >
                View All
              </Box>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            {[
              { color: "#4ade80", label: `CRQ_Raised  Total: ${SITE_GROUP_DATA.reduce((a,b) => a + b.raised, 0).toLocaleString()}` },
              { color: "#fbbf24", label: `CRQRejected  Total: ${SITE_GROUP_DATA.reduce((a,b) => a + b.rejected, 0).toLocaleString()}` },
              { color: "#60a5fa", label: `CRQClosed  Total: ${SITE_GROUP_DATA.reduce((a,b) => a + b.closed, 0).toLocaleString()}` },
            ].map(({ color, label }) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
                <Typography sx={{ fontSize: 10, color: muted }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SITE_GROUP_DATA} margin={{ top: 4, right: 8, bottom: 16, left: -16 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="group" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="raised"   name="CRQ Raised"   fill="#4ade80" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="rejected" name="CRQ Rejected" fill="#fbbf24" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="closed"   name="CRQ Closed"   fill="#60a5fa" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        </Box>


        

        {/* ── Row 3 (below Run Rate): Rejection Reasons Bar + Pie side-by-side ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.5, mb: 1.5 }}>

          {/* Analytics Reason For Cancellation/Rejection — full bar chart (top 4) */}
          <Box sx={panelSx(isDark)}>
            <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>ANALYTICS — REASON FOR CANCELLATION/REJECTION</span>
              <Box
                component="button"
                onClick={() => openPopup("rejection")}
                sx={{
                  background: "none",
                  border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: isDark ? "#38bdf8" : "#6366f1",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  px: 0.8,
                  py: 0.3,
                  textTransform: "uppercase",
                  transition: "all 0.18s",
                  "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
                }}
              >
                View All
              </Box>
            </Box>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TOP4_REJECTION_REASONS}
                  layout="vertical"
                  margin={{ top: 4, right: 56, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="reason"
                    type="category"
                    tick={{ fontSize: 9, fill: tickColor }}
                    axisLine={false}
                    tickLine={false}
                    width={145}
                    tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "…" : v}
                  />
                  <RTooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, _name: string, props: any) => [
                      `${v} CRQs (${props.payload.pct}%)`,
                      "Count",
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28} label={{ position: "right", fontSize: 10, fill: muted, formatter: (v: number) => v }}>
                    {TOP4_REJECTION_REASONS.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            {/* Percentage badges */}
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {TOP4_REJECTION_REASONS.map((r, i) => (
                <Box key={r.reason} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PIE_COLORS[i] }} />
                  <Typography sx={{ fontSize: 9, color: muted }}>{r.pct}%</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Rejection Reason Pie chart — top 4 breakdown */}
          <Box sx={panelSx(isDark)}>
            <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5 }}>
              <span>REJECTION REASON BREAKDOWN (TOP 4)</span>
            </Box>
            <Box sx={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rejectionPieData}
                    cx="45%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ pct, cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 18;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill={isDark ? "#94a3b8" : "#64748b"} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {rejectionPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, _name: string, props: any) => [
                      `${props.payload.count} CRQs (${value}%)`,
                      props.payload.fullName,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            {/* Legend */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 0.5 }}>
              {rejectionPieData.map((r, i) => (
                <Box key={r.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: PIE_COLORS[i], flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 10, color: muted, flex: 1, lineHeight: 1.3 }}>{r.name}</Typography>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{r.count}</Typography>
                  <Typography sx={{ fontSize: 10, color: PIE_COLORS[i], fontWeight: 600, minWidth: 32, textAlign: "right" }}>{r.value}%</Typography>
                </Box>
              ))}
            </Box>
          </Box>

        {/* ── CRQ Aging Heatmap + (below Run Rate: CCB TO SE chart) ────────── */}
        <CRQAgingHeatmap isDark={isDark} onViewAll={() => openPopup("agingheatmap")} />
        </Box>



        {/* ── Footer ────────────────────────────────────────────────────── */}
        <Box
          sx={{
            mt: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 10, color: muted }}>
            Filtered:{" "}
            <Box component="span" sx={{ color: text, fontWeight: 600 }}>
              {startDate.format("DD MMM YYYY")} →{" "}
              {endDate.format("DD MMM YYYY")}
            </Box>
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: data ? "#22c55e" : "#f59e0b",
              }}
            />
            <Typography sx={{ fontSize: 10, color: muted }}>
              {data ? "Live API data" : "Demo data — API offline"}
            </Typography>
          </Box>
        </Box>

        {/* ── Chart Popup Table ─────────────────────────────────────────── */}
        <ChartPopupTable open={popupChart !== null} onClose={closePopup} chartType={popupChart} isDark={isDark} />

      </Box>
    </LocalizationProvider>
  );
};

export default CRQAnalyticsMain;

// ─── Hierarchy + Circle constants ─────────────────────────────────────────────
const FUNC_HIERARCHY: Record<string, Record<string, string[]>> = {
  SE: {
    "IP Core": ["MPLS-Core", "BRAS-Core", "CEN-Core"],
    Packet: ["Packet-Change", "Packet_NI"],
    "Embedded Support": ["All"],
    "IP Access": ["MPLS-Access", "CEN-Access", "OLT Access"],
    Optics: ["Network_expansion", "NNI", "OTN/LCD", "Project"],
    "Service Optimisation": ["All"],
  },
  CCB: {
    "IP Core_CCB": ["MPLS-Core_CCB", "BRAS-Core_CCB", "CEN-Core_CCB"],
    Packet_CCB: ["Packet-Change_CCB", "Packet_NI_CCB"],
    "Embedded Support_CCB": ["All"],
    "IP Access_CCB": ["MPLS-Access_CCB", "CEN-Access_CCB", "OLT Access_CCB"],
    Optics_CCB: ["Network_expansion_CCB", "Project_CCB"],
    "Service Optimisation_CCB": ["All"],
  },
};

const CIRCLE_OPTIONS = [
  "All Circles","Maharashtra","Gujarat","Kerala","Tamil Nadu","Karnataka",
  "Delhi","Punjab","Rajasthan","UP East","UP West","Bihar","Odisha",
  "West Bengal","Andhra Pradesh","Haryana",
];




































// import React, { useState, useCallback, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   useTheme,
//   Collapse,
//   Chip,
//   FormControl,
//   Select,
//   MenuItem,
//   Divider,
//   Skeleton,
//   Alert,
//   Modal,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";
// import type { SxProps, Theme } from "@mui/material";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   ComposedChart,
//   Line,
//   // ── DOMAIN COVERAGE RADAR imports — commented out but kept ──────────────
//   // RadarChart,
//   // Radar,
//   // PolarGrid,
//   // PolarAngleAxis,
//   // PolarRadiusAxis,
//   // ────────────────────────────────────────────────────────────────────────
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RTooltip,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";
// import dayjs, { Dayjs } from "dayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import CloseIcon from "@mui/icons-material/Close";

// import { useGetCRQAnalyticsDashboardQuery } from "./crqAnalytics.api";
// import type {
//   CRQWorkflowStage,
//   CRQSlaDomain,
//   CRQRaisedVsClosed,
//   CRQBottleneck,
//   CRQDomainSlaChart,
//   CRQRadarCoverage,
//   CRQDomainCount,
//   CRQRunRate,
//   ChartPopupType,
// } from "./crqAnalytics.api";

// import {
//   workflowStages as MOCK_STAGES,
//   slaDomains as MOCK_SLA_DOMAINS,
//   raisedVsClosed as MOCK_RAISED,
//   bottlenecks as MOCK_BOTTLENECK,
//   domainSlaChart as MOCK_DOMAIN_SLA,
//   radarCoverage as MOCK_RADAR_COVERAGE,
//   domainCRQ as MOCK_DOMAIN_CRQ,
//   chartTableRows as MOCK_TABLE_ROWS,
//   runRateCCBtoSE as MOCK_RUN_RATE,
// } from "./crqAnalytics.mock";

// // ─── Palette helpers ──────────────────────────────────────────────────────────
// const slaColor = (s: number) =>
//   s >= 90
//     ? { bar: "#89ecad", text: "#4ade80" }
//     : s >= 80
//       ? { bar: "#edd266", text: "#fbbf24" }
//       : { bar: "#ef4444", text: "#f87171" };

// const DOMAIN_PALETTE = [
//   "#818cf8",
//   "#6366f1",
//   "#3b82f6",
//   "#22d3ee",
//   "#aaecc2",
//   "#facc15",
//   "#94a3b8",
// ] as const;

// // const BOTTLENECK_PALETTE = [
// //   "#ef4444",
// //   "#f97316",
// //   "#f59e0b",
// //   "#3b82f6",
// //   "#22c55e",
// // ] as const;

// const BOTTLENECK_PALETTE = [
//   "#ef0000",
//   "#dd8a4e",
//   "#edb75b",
//   "#91b4eb",
//   "#aaecc2",
// ] as const;

// // ─── Chart Popup Config ───────────────────────────────────────────────────────
// interface PopupColConfig {
//   key: string;
//   label: string;
//   getValue: (row: (typeof MOCK_TABLE_ROWS)[number], index: number) => string;
// }

// const CHART_POPUP_CONFIGS: Record<
//   ChartPopupType,
//   { title: string; extraCol: PopupColConfig }
// > = {
//   raised: {
//     title: "CRQ Raised vs Closed — Ticket Aging Distribution",
//     extraCol: {
//       key: "type",
//       label: "Type",
//       getValue: (_r, i) => (i % 2 === 0 ? "Raised" : "Closed"),
//     },
//   },
//   bottleneck: {
//     title: "Bottleneck Detection — Ticket Aging Distribution",
//     extraCol: {
//       key: "avgWait",
//       label: "Avg Wait",
//       getValue: (_r, i) =>
//         ["72h","48h","32h","18h","24h","56h","40h","12h","64h","36h","44h","28h","20h","52h","16h","68h","8h","76h","60h","4h"][i % 20],
//     },
//   },
//   domainsla: {
//     title: "Domain SLA Performance — Ticket Aging Distribution",
//     extraCol: {
//       key: "slaScore",
//       label: "SLA Score",
//       getValue: (_r, i) =>
//         ["94%","88%","72%","85%","91%","76%","89%","83%","68%","95%","79%","87%","73%","92%","81%","70%","96%","84%","78%","90%"][i % 20],
//     },
//   },
//   // ── DOMAIN COVERAGE RADAR popup config — commented out but kept ──────────
//   radar: {
//     title: "Domain Coverage Radar — Ticket Aging Distribution",
//     extraCol: {
//       key: "coverage",
//       label: "Coverage %",
//       getValue: (_r, i) =>
//         ["82%","91%","75%","88%","94%","70%","86%","79%","93%","68%","85%","77%","90%","83%","72%","89%","76%","95%","81%","74%"][i % 20],
//     },
//   },
//   // ─────────────────────────────────────────────────────────────────────────
//   domaincrq: {
//     title: "Domain Wise CRQ Analysis — Ticket Aging Distribution",
//     extraCol: {
//       key: "domainGroup",
//       label: "Domain Group",
//       getValue: (_r, i) =>
//         ["IP Core","Packet","Optics","BRAS","CEN","MPLS","IP Access","IP Core","Packet","Optics","BRAS","CEN","MPLS","IP Access","IP Core","Packet","Optics","BRAS","CEN","MPLS"][i % 20],
//     },
//   },
//   // ── NEW: Run Rate popup config ────────────────────────────────────────────
//   runrate: {
//     title: "Run Rate: CCB to SE — Ticket Aging Distribution",
//     extraCol: {
//       key: "runRateStage",
//       label: "Stage",
//       getValue: (_r, i) =>
//         ["CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE","Closed","CCB","SE"][i % 20],
//     },
//   },
// };

// // ─── Style factories ──────────────────────────────────────────────────────────
// const panelSx = (isDark: boolean): SxProps<Theme> => ({
//   background: isDark
//     ? "linear-gradient(145deg,#0f1a2e 0%,#0a1220 100%)"
//     : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
//   border: `1px solid ${isDark ? "rgba(99,130,180,0.15)" : "rgba(226,232,240,0.9)"}`,
//   borderRadius: 3,
//   p: 2,
//   position: "relative",
//   overflow: "hidden",
//   boxShadow: isDark
//     ? "0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)"
//     : "0 2px 12px rgba(0,0,0,0.06)",
//   "&::before": {
//     content: '""',
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: "1px",
//     background: isDark
//       ? "linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)"
//       : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
//   },
// });

// const sectionTitleSx = (isDark: boolean): SxProps<Theme> => ({
//   fontSize: "0.65rem",
//   fontWeight: 700,
//   color: isDark ? "#94a3b8" : "#64748b",
//   textTransform: "uppercase",
//   letterSpacing: "0.1em",
// });

// const selectSx = (isDark: boolean): SxProps<Theme> => ({
//   height: 32,
//   fontSize: 12,
//   color: isDark ? "#e2e8f0" : "#1e293b",
//   bgcolor: isDark ? "rgba(15,26,46,0.9)" : "rgba(248,250,252,0.9)",
//   "& .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(99,130,180,0.3)" : "rgba(203,213,225,0.9)",
//   },
//   "&:hover .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.5)",
//   },
//   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "#38bdf8" : "#6366f1",
//   },
//   "& .MuiSelect-icon": {
//     color: isDark ? "#64748b" : "#94a3b8",
//     fontSize: 18,
//   },
// });

// // ─── KPI config ───────────────────────────────────────────────────────────────
// const KPI_CFG = [
//   { id: "total",    label: "Total CRQ",   icon: "📊", color: "#38bdf8", iconBg: "rgba(56,189,248,0.15)",  expandable: true  },
//   { id: "open",     label: "Open CRQ",    icon: "🔓", color: "#fb923c", iconBg: "rgba(251,146,60,0.15)",  expandable: true  },
//   { id: "closed",   label: "Closed CRQ",  icon: "✅", color: "#4ade80", iconBg: "rgba(74,222,128,0.15)",  expandable: false },
//   { id: "rejected", label: "Rejected",    icon: "❌", color: "#f87171", iconBg: "rgba(248,113,113,0.15)", expandable: false },
//   { id: "sla",      label: "SLA Score",   icon: "🎯", color: "#8b5cf6", iconBg: "rgba(139,92,246,0.15)",  expandable: true  },
// ] as const;

// type KpiId = (typeof KPI_CFG)[number]["id"];

// // ─── KPI Card ─────────────────────────────────────────────────────────────────
// interface KPICardProps {
//   cfg: (typeof KPI_CFG)[number];
//   value: string | number;
//   sub: string;
//   trend: number;
//   isDark: boolean;
//   isActive: boolean;
//   onClick: () => void;
// }

// const KPICard: React.FC<KPICardProps> = ({ cfg, value, sub, trend, isDark, isActive, onClick }) => {
//   const trendColor = trend >= 0 ? "#4ade80" : "#f87171";
//   const text  = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <Box
//       role={cfg.expandable ? "button" : undefined}
//       tabIndex={cfg.expandable ? 0 : undefined}
//       aria-expanded={cfg.expandable ? isActive : undefined}
//       onClick={cfg.expandable ? onClick : undefined}
//       onKeyDown={cfg.expandable ? (e) => e.key === "Enter" && onClick() : undefined}
//       sx={{
//         background: isDark
//           ? "linear-gradient(160deg,#0d1b2e 0%,#0a1525 100%)"
//           : "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)",
//         border: `1px solid ${isActive ? `${cfg.color}55` : isDark ? `${cfg.color}22` : "rgba(226,232,240,0.9)"}`,
//         borderRadius: 3,
//         p: 2,
//         position: "relative",
//         overflow: "hidden",
//         cursor: cfg.expandable ? "pointer" : "default",
//         userSelect: "none",
//         transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
//         boxShadow: isActive
//           ? `0 6px 28px ${cfg.color}30,inset 0 0 30px ${cfg.color}0d`
//           : isDark
//             ? `0 4px 20px rgba(0,0,0,0.4),inset 0 0 30px ${cfg.iconBg}`
//             : "0 2px 10px rgba(0,0,0,0.06)",
//         transform: isActive ? "translateY(-2px)" : "none",
//         "&:hover": cfg.expandable ? { transform: "translateY(-2px)", boxShadow: `0 8px 32px ${cfg.color}28` } : {},
//         "&:focus-visible": { outline: `2px solid ${cfg.color}`, outlineOffset: 2 },
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           top: 0, left: 0, right: 0,
//           height: "2px",
//           background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
//         },
//       }}
//     >
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
//             {cfg.icon}
//           </Box>
//           <Typography sx={{ fontSize: 12, fontWeight: 700, color: text, lineHeight: 1.2 }}>{cfg.label}</Typography>
//         </Box>
//         {cfg.expandable && (
//           <Box sx={{ px: 0.8, py: 0.15, borderRadius: 0.8, fontSize: 9, fontWeight: 700, bgcolor: isActive ? `${cfg.color}22` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${isActive ? `${cfg.color}44` : "transparent"}`, color: isActive ? cfg.color : muted, transition: "all 0.2s" }}>
//             {isActive ? "▲" : "▼"}
//           </Box>
//         )}
//       </Box>
//       <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
//         <Typography sx={{ fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</Typography>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
//           <Typography sx={{ fontSize: 9, color: trendColor }}>{trend >= 0 ? "▲" : "▼"}</Typography>
//           <Typography sx={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>{Math.abs(trend).toFixed(1)}%</Typography>
//         </Box>
//       </Box>
//       <Typography sx={{ fontSize: 10, color: muted }}>{sub}</Typography>
//       {isActive && <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${cfg.color},transparent)` }} />}
//     </Box>
//   );
// };

// // ─── Workflow Expand Panel ────────────────────────────────────────────────────
// interface WorkflowExpandPanelProps {
//   type: "total" | "open" | "sla";
//   stages: CRQWorkflowStage[];
//   slaDomains: CRQSlaDomain[];
//   isDark: boolean;
// }

// const WorkflowExpandPanel: React.FC<WorkflowExpandPanelProps> = ({ type, stages, slaDomains, isDark }) => {
//   const text  = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";
//   const panelBg   = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
//   const accentColor = type === "sla" ? "#8b5cf6" : type === "total" ? "#38bdf8" : "#fb923c";

//   if (type === "sla") {
//     return (
//       <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
//           <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: "#8b5cf6" }} />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>SLA Score — Domain Breakdown</Typography>
//         </Box>
//         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 1.5 }}>
//           {slaDomains.map((d) => {
//             const c = slaColor(d.score);
//             return (
//               <Box key={d.domain} sx={{ background: panelBg, borderRadius: 2, p: 1.5, border: `1px solid ${isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}` }}>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                   <Typography sx={{ fontSize: 11, color: muted, fontWeight: 500 }}>{d.domain}</Typography>
//                   <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.text, bgcolor: `${c.bar}20`, px: 0.8, borderRadius: 0.8 }}>{d.score}%</Typography>
//                 </Box>
//                 <Box sx={{ height: 5, bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
//                   <Box sx={{ width: `${d.score}%`, height: "100%", bgcolor: c.bar, borderRadius: 3, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
//                 </Box>
//               </Box>
//             );
//           })}
//         </Box>
//       </Box>
//     );
//   }

//   const data = stages.map((s) => ({ name: s.stage, count: type === "total" ? s.totalCount : s.openCount }));
//   const maxVal = Math.max(...data.map((d) => d.count), 1);
//   const total  = data.reduce((a, b) => a + b.count, 0) || 1;

//   return (
//     <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: accentColor }} />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
//             {type === "total" ? "Total CRQ" : "Open CRQ"} — Workflow Stage Breakdown
//           </Typography>
//         </Box>
//         <Chip label={`${total} across ${data.length} stages`} size="small" sx={{ fontSize: 10, fontWeight: 600, bgcolor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33`, height: 22 }} />
//       </Box>
//       <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 1.5 }}>
//         {data.map((s) => {
//           const pct      = Math.round((s.count / total) * 100);
//           const ratio    = s.count / maxVal;
//           const barColor = ratio >= 0.75 ? "#ef4444" : ratio >= 0.5 ? "#f59e0b" : "#3b82f6";
//           const isMax    = s.count === maxVal;
//           return (
//             <Box key={s.name} sx={{ background: panelBg, borderRadius: 2, p: 1.5, position: "relative", border: `1px solid ${isMax ? `${barColor}44` : isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}`, transition: "transform 0.15s ease", "&:hover": { transform: "translateY(-1px)" } }}>
//               {isMax && <Box sx={{ position: "absolute", top: 6, right: 6, fontSize: 8, color: "#ef4444", bgcolor: "rgba(239,68,68,0.12)", borderRadius: 0.5, px: 0.6, py: 0.1, fontWeight: 700, letterSpacing: "0.05em" }}>MAX</Box>}
//               <Typography sx={{ fontSize: 10, color: muted, mb: 0.8, lineHeight: 1.4, pr: isMax ? 4 : 0 }}>{s.name}</Typography>
//               <Typography sx={{ fontSize: 22, fontWeight: 800, color: text, lineHeight: 1 }}>{s.count}</Typography>
//               <Typography sx={{ fontSize: 10, color: muted, mb: 1 }}>{pct}% of total</Typography>
//               <Box sx={{ height: 4, bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
//                 <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: barColor, borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// // ─── Chart Card wrapper ───────────────────────────────────────────────────────
// interface ChartCardProps {
//   title: string;
//   isDark: boolean;
//   height?: number;
//   isLoading?: boolean;
//   onTitleClick?: () => void;
//   children: React.ReactNode;
// }

// const ChartCard: React.FC<ChartCardProps> = ({ title, isDark, height = 185, isLoading, onTitleClick, children }) => (
//   <Box sx={panelSx(isDark)}>
//     <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//       <span>{title}</span>
//       {onTitleClick && (
//         <Box
//           component="button"
//           onClick={onTitleClick}
//           sx={{
//             background: "none",
//             border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
//             borderRadius: 1,
//             cursor: "pointer",
//             color: isDark ? "#38bdf8" : "#6366f1",
//             fontSize: "0.6rem",
//             fontWeight: 700,
//             letterSpacing: "0.08em",
//             px: 0.8,
//             py: 0.3,
//             textTransform: "uppercase",
//             transition: "all 0.18s",
//             "&:hover": { bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)" },
//           }}
//         >
//           View All
//         </Box>
//       )}
//     </Box>
//     {isLoading
//       ? <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9" }} />
//       : <Box sx={{ height }}>{children}</Box>
//     }
//   </Box>
// );

// // ─── Chart Popup Table ────────────────────────────────────────────────────────
// const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
//   Completed: { bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
//   Open:      { bg: "rgba(56,189,248,0.15)",  text: "#38bdf8" },
//   Rejected:  { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
// };

// interface ChartPopupTableProps {
//   open: boolean;
//   onClose: () => void;
//   chartType: ChartPopupType | null;
//   isDark: boolean;
// }

// const ChartPopupTable: React.FC<ChartPopupTableProps> = ({ open, onClose, chartType, isDark }) => {
//   if (!chartType) return null;
//   const cfg  = CHART_POPUP_CONFIGS[chartType];
//   const rows = MOCK_TABLE_ROWS;

//   const headerCellSx: SxProps<Theme> = {
//     fontSize: "0.6rem",
//     fontWeight: 700,
//     color: isDark ? "#64748b" : "#94a3b8",
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     bgcolor: isDark ? "#060e1a" : "#f8fafc",
//     borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.2)" : "rgba(226,232,240,0.9)"}`,
//     whiteSpace: "nowrap",
//     py: 1,
//     px: 1.5,
//   };

//   const bodyCellSx: SxProps<Theme> = {
//     fontSize: 11,
//     color: isDark ? "#cbd5e1" : "#475569",
//     borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.08)" : "rgba(226,232,240,0.6)"}`,
//     whiteSpace: "nowrap",
//     py: 0.9,
//     px: 1.5,
//   };

//   return (
//     <Modal open={open} onClose={onClose} keepMounted={false}>
//       <Box
//         sx={{
//           position: "absolute",
//           top: "50%", left: "50%",
//           transform: "translate(-50%,-50%)",
//           width: { xs: "95vw", md: "min(900px,90vw)" },
//           maxHeight: "85vh",
//           display: "flex",
//           flexDirection: "column",
//           background: isDark
//             ? "linear-gradient(145deg,#0a1525 0%,#060e1a 100%)"
//             : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
//           border: `1px solid ${isDark ? "rgba(99,130,180,0.25)" : "rgba(226,232,240,0.9)"}`,
//           borderRadius: 3,
//           boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.7)" : "0 12px 40px rgba(0,0,0,0.18)",
//           overflow: "hidden",
//           outline: "none",
//         }}
//       >
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex", alignItems: "center", justifyContent: "space-between",
//             px: 2.5, py: 1.5,
//             borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.18)" : "rgba(226,232,240,0.9)"}`,
//             flexShrink: 0, position: "relative",
//             "&::after": { content: '""', position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: isDark ? "linear-gradient(90deg,transparent,rgba(56,189,248,0.3),transparent)" : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)" },
//           }}
//         >
//           <Box>
//             <Typography sx={{ fontSize: 13, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{cfg.title}</Typography>
//             <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mt: 0.25 }}>Showing {rows.length} records</Typography>
//           </Box>
//           <IconButton onClick={onClose} size="small" sx={{ bgcolor: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 1.5, width: 30, height: 30, "&:hover": { bgcolor: "rgba(248,113,113,0.22)" } }}>
//             <CloseIcon sx={{ fontSize: 14 }} />
//           </IconButton>
//         </Box>

//         {/* Table */}
//         <TableContainer sx={{ flex: 1, overflow: "auto" }}>
//           <Table stickyHeader size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={headerCellSx}>Change ID</TableCell>
//                 <TableCell sx={headerCellSx}>Submit Date</TableCell>
//                 <TableCell sx={headerCellSx}>Status</TableCell>
//                 <TableCell sx={headerCellSx}>Aging</TableCell>
//                 <TableCell sx={headerCellSx}>Impact</TableCell>
//                 <TableCell sx={headerCellSx}>Requester</TableCell>
//                 <TableCell sx={headerCellSx}>{cfg.extraCol.label}</TableCell>
//                 <TableCell sx={{ ...headerCellSx, minWidth: 220 }}>Summary</TableCell>
//                 <TableCell sx={headerCellSx}>Region</TableCell>
//                 <TableCell sx={headerCellSx}>Circle</TableCell>
//                 <TableCell sx={headerCellSx}>Bin Group</TableCell>
//                 <TableCell sx={headerCellSx}>Coordinator</TableCell>
//                 <TableCell sx={headerCellSx}>Implementor</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((row, idx) => {
//                 const sc = STATUS_COLORS[row.status] ?? STATUS_COLORS["Open"];
//                 return (
//                   <TableRow key={row.changeId} sx={{ "&:hover td": { bgcolor: isDark ? "rgba(56,189,248,0.04)" : "rgba(99,102,241,0.03)" } }}>
//                     <TableCell sx={bodyCellSx}><Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#38bdf8" : "#3b82f6" }}>{row.changeId}</Typography></TableCell>
//                     <TableCell sx={bodyCellSx}>{row.submitDate}</TableCell>
//                     <TableCell sx={bodyCellSx}><Box component="span" sx={{ bgcolor: sc.bg, color: sc.text, borderRadius: 0.8, px: 1, py: 0.25, fontSize: 10, fontWeight: 700 }}>{row.status}</Box></TableCell>
//                     <TableCell sx={bodyCellSx}><Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{row.aging}</Typography></TableCell>
//                     <TableCell sx={bodyCellSx}>{row.impact}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.requester}</TableCell>
//                     <TableCell sx={bodyCellSx}>{cfg.extraCol.getValue(row, idx)}</TableCell>
//                     <TableCell sx={{ ...bodyCellSx, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.summary}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.region}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.circle}</TableCell>
//                     <TableCell sx={{ ...bodyCellSx, fontSize: 10, color: isDark ? "#94a3b8" : "#64748b" }}>{row.binGroup}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.coordinator}</TableCell>
//                     <TableCell sx={bodyCellSx}>{row.implementor}</TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//     </Modal>
//   );
// };

// // ─── Custom Tooltip ───────────────────────────────────────────────────────────
// const CustomTooltip = ({
//   active, payload, label, isDark,
// }: {
//   active?: boolean;
//   payload?: Array<{ name: string; value: number; color: string }>;
//   label?: string;
//   isDark: boolean;
// }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <Box sx={{ bgcolor: isDark ? "#0d1b2e" : "#fff", border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`, borderRadius: 2, px: 1.5, py: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", fontSize: 11 }}>
//       {label && <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mb: 0.5 }}>{label}</Typography>}
//       {payload.map((p) => (
//         <Box key={p.name} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.25 }}>
//           <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
//           <Typography sx={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>{p.name}:</Typography>
//           <Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>{p.value}</Typography>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// // ─── Filter types ─────────────────────────────────────────────────────────────
// type FilterKey   = "function" | "domain" | "subDomain" | "circle";
// type FilterState = Record<FilterKey, string>;

// // ─── Main Dashboard ───────────────────────────────────────────────────────────
// const CRQAnalyticsMain: React.FC = () => {
//   const theme  = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   const [startDate, setStartDate] = useState<Dayjs>(() => dayjs().startOf("month"));
//   const [endDate,   setEndDate]   = useState<Dayjs>(() => dayjs().endOf("month"));
//   const [filters, setFilters] = useState<FilterState>({
//     function: "All Functions",
//     domain:   "All Domains",
//     subDomain:"All Sub-Domains",
//     circle:   "All Circles",
//   });

//   const [popupChart, setPopupChart] = useState<ChartPopupType | null>(null);
//   const openPopup  = useCallback((type: ChartPopupType) => setPopupChart(type), []);
//   const closePopup = useCallback(() => setPopupChart(null), []);

//   const domainOptions = useMemo(() => {
//     if (filters.function === "All Functions") return ["All Domains"];
//     return ["All Domains", ...Object.keys(FUNC_HIERARCHY[filters.function] || {})];
//   }, [filters.function]);

//   const subDomainOptions = useMemo(() => {
//     if (filters.domain === "All Domains") return ["All Sub-Domains"];
//     if (filters.function !== "All Functions" && FUNC_HIERARCHY[filters.function]?.[filters.domain]) {
//       return ["All Sub-Domains", ...FUNC_HIERARCHY[filters.function][filters.domain]];
//     }
//     return ["All Sub-Domains"];
//   }, [filters.function, filters.domain]);

//   const handleFunctionChange = (value: string) =>
//     setFilters((prev) => ({ ...prev, function: value, domain: "All Domains", subDomain: "All Sub-Domains" }));

//   const handleDomainChange = (value: string) =>
//     setFilters((prev) => ({ ...prev, domain: value, subDomain: "All Sub-Domains" }));

//   const [activePanel, setActivePanel] = useState<KpiId | null>(null);
//   const handleCardClick = useCallback((id: KpiId) => {
//     setActivePanel((prev) => (prev === id ? null : id));
//   }, []);

//   const { data, isFetching, isError } = useGetCRQAnalyticsDashboardQuery({
//     startDate: startDate.format("YYYY-MM-DD"),
//     endDate:   endDate.format("YYYY-MM-DD"),
//   });

//   const workflowStages = useMemo<CRQWorkflowStage[]>  (() => data?.workflowStages  ?? MOCK_STAGES,         [data]);
//   const slaDomains     = useMemo<CRQSlaDomain[]>      (() => data?.slaDomains      ?? MOCK_SLA_DOMAINS,    [data]);
//   const raisedVsClosed = useMemo<CRQRaisedVsClosed[]> (() => data?.raisedVsClosed  ?? MOCK_RAISED,         [data]);
//   const bottlenecks    = useMemo<CRQBottleneck[]>     (() => data?.bottlenecks     ?? MOCK_BOTTLENECK,     [data]);
//   const domainSlaChart = useMemo<CRQDomainSlaChart[]> (() => data?.domainSlaChart  ?? MOCK_DOMAIN_SLA,     [data]);
//   // radarCoverage kept in state but chart is commented out below
//   const radarCoverage  = useMemo<CRQRadarCoverage[]>  (() => data?.radarCoverage   ?? MOCK_RADAR_COVERAGE, [data]);
//   const domainCrqCount = useMemo<CRQDomainCount[]>    (() => data?.domainCrqCount  ?? MOCK_DOMAIN_CRQ,     [data]);
//   const runRate        = useMemo<CRQRunRate[]>         (() => data?.runRate         ?? MOCK_RUN_RATE,       [data]);

//   const kpiValues = useMemo(() => ({
//     total:    { value: data?.kpi?.totalCrq    ?? 120,    sub: "All requests",  trend: data?.kpi?.totalTrendPct    ?? 8   },
//     open:     { value: data?.kpi?.openCrq     ?? 48,     sub: "In progress",   trend: data?.kpi?.openTrendPct     ?? -3  },
//     closed:   { value: data?.kpi?.closedCrq   ?? 62,     sub: "Completed",     trend: data?.kpi?.closedTrendPct   ?? 12  },
//     rejected: { value: data?.kpi?.rejected    ?? 10,     sub: "Declined",      trend: data?.kpi?.rejectedTrendPct ?? -2  },
//     sla:      { value: `${data?.kpi?.slaScore ?? 87}%`,  sub: "On-time rate",  trend: data?.kpi?.slaTrendPct      ?? 1.2 },
//   }), [data]);

//   const gridColor    = isDark ? "rgba(99,130,180,0.08)" : "#f1f5f9";
//   const tickColor    = isDark ? "#475569" : "#94a3b8";
//   const tooltipStyle = {
//     background: isDark ? "#0d1b2e" : "#fff",
//     border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
//     borderRadius: 8,
//     fontSize: 11,
//     boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
//     padding: "8px 12px",
//   };
//   const text  = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ pb: 2 }}>

//         {/* ── Filter bar ──────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5,
//             p: { xs: 1.5, md: 1.5 }, borderRadius: 2.5, mb: 2,
//             background: isDark
//               ? "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))"
//               : "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.8))",
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(226,232,240,0.95)"}`,
//             boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.06)",
//           }}
//         >
//           <DatePicker label="Start Date" value={startDate} maxDate={endDate} onChange={(v) => v && setStartDate(v)} slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }} />
//           <DatePicker label="End Date"   value={endDate}   minDate={startDate} onChange={(v) => v && setEndDate(v)}   slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }} />
//           <Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0 }} />
//           <Select value={filters.function} onChange={(e) => handleFunctionChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
//             {["All Functions","SE","CCB"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>
//           <Select value={filters.domain} onChange={(e) => handleDomainChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
//             {domainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>
//           <Select value={filters.subDomain} onChange={(e) => setFilters((prev) => ({ ...prev, subDomain: e.target.value }))} sx={{ ...selectSx(isDark), minWidth: 132 }}>
//             {subDomainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>
//           <FormControl size="small">
//             <Select value={filters.circle} onChange={(e) => setFilters((prev) => ({ ...prev, circle: e.target.value }))} displayEmpty sx={{ ...selectSx(isDark), minWidth: 132 }}>
//               {CIRCLE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//             </Select>
//           </FormControl>
//         </Box>

//         {/* ── Error banner ──────────────────────────────────────────────── */}
//         {isError && (
//           <Alert severity="warning" sx={{ mb: 2, fontSize: 12, borderRadius: 2 }}>
//             API unavailable — showing demo data. Connect <strong>/crq-analytics/dashboard</strong> for live data.
//           </Alert>
//         )}

//         {/* ── KPI Cards ─────────────────────────────────────────────────── */}
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(5,1fr)" }, gap: 1.5, mb: 1.5 }}>
//           {KPI_CFG.map((cfg) => {
//             const kv = kpiValues[cfg.id];
//             return (
//               <KPICard
//                 key={cfg.id}
//                 cfg={cfg}
//                 value={isFetching ? "…" : kv.value}
//                 sub={kv.sub}
//                 trend={kv.trend}
//                 isDark={isDark}
//                 isActive={activePanel === cfg.id}
//                 onClick={() => handleCardClick(cfg.id)}
//               />
//             );
//           })}
//         </Box>

//         {/* ── Expandable KPI panel ────────────────────────────────────── */}
//         <Collapse in={activePanel !== null} unmountOnExit>
//           {(activePanel === "total" || activePanel === "open") && (
//             <WorkflowExpandPanel type={activePanel} stages={workflowStages} slaDomains={slaDomains} isDark={isDark} />
//           )}
//           {activePanel === "sla" && (
//             <WorkflowExpandPanel type="sla" stages={workflowStages} slaDomains={slaDomains} isDark={isDark} />
//           )}
//         </Collapse>

//         {/* ── Row 1: Area + Bottleneck + Domain SLA ─────────────────────── */}
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.5, mb: 1.5 }}>

//           {/* Raised vs Closed */}
//           <ChartCard title="CRQ RAISED VS CLOSED" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("raised")}>
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={raisedVsClosed} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
//                 <defs>
//                   <linearGradient id="grRaised" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="grClosed" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="label" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <RTooltip contentStyle={tooltipStyle} />
//                 <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} formatter={(v) => <span style={{ color: tickColor }}>{v}</span>} />
//                 <Area type="monotone" dataKey="raised" stroke="#38bdf8" strokeWidth={2} fill="url(#grRaised)" dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Raised" />
//                 <Area type="monotone" dataKey="closed" stroke="#4ade80" strokeWidth={2} fill="url(#grClosed)" dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Closed" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Bottleneck */}
//           <ChartCard title="BOTTLENECK DETECTION" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("bottleneck")}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={bottlenecks} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
//                 <XAxis type="number" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} unit="h" />
//                 <YAxis dataKey="stage" type="category" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} width={88} />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, "Avg Wait"]} />
//                 <Bar dataKey="avgWaitHours" radius={[0, 4, 4, 0]} maxBarSize={18}>
//                   {bottlenecks.map((_, i) => <Cell key={i} fill={BOTTLENECK_PALETTE[Math.min(i, BOTTLENECK_PALETTE.length - 1)]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Domain SLA */}
//           <ChartCard title="DOMAIN SLA PERFORMANCE" isDark={isDark} isLoading={isFetching} onTitleClick={() => openPopup("domainsla")}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={domainSlaChart} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="domain" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} unit="%" />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "SLA Score"]} />
//                 <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
//                   {domainSlaChart.map((d, i) => <Cell key={i} fill={slaColor(d.score).bar} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Row 2: Domain CRQ Analysis + Run Rate: CCB to SE ──────────── */}
//         {/*   NOTE: DOMAIN COVERAGE RADAR has been commented out below.     */}
//         {/*   It previously occupied the left slot of this row.             */}
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>

//           {/* ── [COMMENTED OUT] DOMAIN COVERAGE RADAR ─────────────────────
//           <ChartCard
//             title="DOMAIN COVERAGE RADAR"
//             isDark={isDark}
//             height={240}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("radar")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <RadarChart data={radarCoverage} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
//                 <PolarGrid stroke={gridColor} />
//                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: tickColor }} />
//                 <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: tickColor }} tickCount={4} />
//                 <Radar
//                   name="Coverage"
//                   dataKey="value"
//                   stroke="#38bdf8"
//                   fill="#38bdf8"
//                   fillOpacity={0.15}
//                   strokeWidth={2}
//                   dot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 } as any}
//                 />
//                 <RTooltip contentStyle={tooltipStyle} />
//               </RadarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//           ── END DOMAIN COVERAGE RADAR ──────────────────────────────────── */}

//           {/* LEFT SLOT → Domain Wise CRQ Analysis (moved from old right slot) */}
//           <ChartCard title="DOMAIN WISE CRQ ANALYSIS" isDark={isDark} height={240} isLoading={isFetching} onTitleClick={() => openPopup("domaincrq")}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={domainCrqCount} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="domain" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "CRQ Count"]} />
//                 <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
//                   {domainCrqCount.map((_, i) => <Cell key={i} fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* RIGHT SLOT → NEW: Run Rate: CCB to SE (Composed: Bar + 2 Lines) */}
//           <ChartCard title="RUN RATE: CCB TO SE" isDark={isDark} height={240} isLoading={isFetching} onTitleClick={() => openPopup("runrate")}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={runRate} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
//                 <defs>
//                   <linearGradient id="grCCB" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.85} />
//                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}  />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis
//                   dataKey="date"
//                   tick={{ fontSize: 8, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                   interval={3}
//                   angle={-35}
//                   textAnchor="end"
//                   height={36}
//                 />
//                 <YAxis
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                   domain={[0, 10]}
//                   ticks={[0, 2, 4, 6, 8, 10]}
//                 />
//                 <RTooltip contentStyle={tooltipStyle} />
//                 <Legend
//                   wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
//                   formatter={(v) => <span style={{ color: tickColor }}>{v}</span>}
//                 />
//                 {/* Blue bars — Received in CCB */}
//                 <Bar dataKey="receivedInCCB" name="Received in CCB" fill="url(#grCCB)" radius={[3, 3, 0, 0]} maxBarSize={14} />
//                 {/* Orange line — Moved to SE */}
//                 <Line
//                   type="monotone"
//                   dataKey="movedToSE"
//                   name="Moved to SE"
//                   stroke="#f97316"
//                   strokeWidth={2}
//                   dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
//                   activeDot={{ r: 5 }}
//                 />
//                 {/* Gray line — SE to Closed */}
//                 <Line
//                   type="monotone"
//                   dataKey="seToClosed"
//                   name="SE to Closed"
//                   stroke="#94a3b8"
//                   strokeWidth={2}
//                   dot={{ r: 3, fill: "#94a3b8", strokeWidth: 0 }}
//                   activeDot={{ r: 5 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Footer ────────────────────────────────────────────────────── */}
//         <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <Typography sx={{ fontSize: 10, color: muted }}>
//             Filtered:{" "}
//             <Box component="span" sx={{ color: text, fontWeight: 600 }}>
//               {startDate.format("DD MMM YYYY")} → {endDate.format("DD MMM YYYY")}
//             </Box>
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
//             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: data ? "#22c55e" : "#f59e0b" }} />
//             <Typography sx={{ fontSize: 10, color: muted }}>
//               {data ? "Live API data" : "Demo data — API offline"}
//             </Typography>
//           </Box>
//         </Box>

//         {/* ── Chart Popup Table ─────────────────────────────────────────── */}
//         <ChartPopupTable open={popupChart !== null} onClose={closePopup} chartType={popupChart} isDark={isDark} />

//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default CRQAnalyticsMain;

// // ─── Hierarchy + Circle constants ─────────────────────────────────────────────
// const FUNC_HIERARCHY: Record<string, Record<string, string[]>> = {
//   SE: {
//     "IP Core":              ["MPLS-Core", "BRAS-Core", "CEN-Core"],
//     Packet:                 ["Packet-Change", "Packet_NI"],
//     "Embedded Support":     ["All"],
//     "IP Access":            ["MPLS-Access", "CEN-Access", "OLT Access"],
//     Optics:                 ["Network_expansion", "NNI", "OTN/LCD", "Project"],
//     "Service Optimisation": ["All"],
//   },
//   CCB: {
//     "IP Core_CCB":              ["MPLS-Core_CCB", "BRAS-Core_CCB", "CEN-Core_CCB"],
//     Packet_CCB:                 ["Packet-Change_CCB", "Packet_NI_CCB"],
//     "Embedded Support_CCB":     ["All"],
//     "IP Access_CCB":            ["MPLS-Access_CCB", "CEN-Access_CCB", "OLT Access_CCB"],
//     Optics_CCB:                 ["Network_expansion_CCB", "Project_CCB"],
//     "Service Optimisation_CCB": ["All"],
//   },
// };

// const CIRCLE_OPTIONS = [
//   "All Circles","Maharashtra","Gujarat","Kerala","Tamil Nadu","Karnataka",
//   "Delhi","Punjab","Rajasthan","UP East","UP West","Bihar","Odisha",
//   "West Bengal","Andhra Pradesh","Haryana",
// ];





































// import React, { useState, useCallback, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   useTheme,
//   Collapse,
//   Chip,
//   FormControl,
//   Select,
//   MenuItem,
//   Divider,
//   Skeleton,
//   Alert,
//   Modal,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";
// import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RTooltip,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";
// import dayjs, { Dayjs } from "dayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import CloseIcon from "@mui/icons-material/Close";

// import { useGetCRQAnalyticsDashboardQuery } from "./crqAnalytics.api";
// import type {
//   CRQWorkflowStage,
//   CRQSlaDomain,
//   CRQRaisedVsClosed,
//   CRQBottleneck,
//   CRQDomainSlaChart,
//   CRQRadarCoverage,
//   CRQDomainCount,
//   ChartPopupType,
// } from "./crqAnalytics.api";

// import {
//   workflowStages as MOCK_STAGES,
//   slaDomains as MOCK_SLA_DOMAINS,
//   raisedVsClosed as MOCK_RAISED,
//   bottlenecks as MOCK_BOTTLENECK,
//   domainSlaChart as MOCK_DOMAIN_SLA,
//   radarCoverage as MOCK_RADAR_COVERAGE,
//   domainCRQ as MOCK_DOMAIN_CRQ,
//   chartTableRows as MOCK_TABLE_ROWS,
// } from "./crqAnalytics.mock";

// // ─── Palette helpers ──────────────────────────────────────────────────────────
// const slaColor = (s: number) =>
//   s >= 90
//     ? { bar: "#22c55e", text: "#4ade80" }
//     : s >= 80
//       ? { bar: "#facc15", text: "#fbbf24" }
//       : { bar: "#ef4444", text: "#f87171" };

// const DOMAIN_PALETTE = [
//   "#818cf8",
//   "#6366f1",
//   "#3b82f6",
//   "#22d3ee",
//   "#4ade80",
//   "#facc15",
//   "#94a3b8",
// ] as const;

// const BOTTLENECK_PALETTE = [
//   "#ef4444",
//   "#f97316",
//   "#f59e0b",
//   "#3b82f6",
//   "#22c55e",
// ] as const;

// // ─── Chart Popup Config ───────────────────────────────────────────────────────
// interface PopupColConfig {
//   key: string;
//   label: string;
//   getValue: (row: (typeof MOCK_TABLE_ROWS)[number], index: number) => string;
// }

// const CHART_POPUP_CONFIGS: Record<
//   ChartPopupType,
//   { title: string; extraCol: PopupColConfig }
// > = {
//   raised: {
//     title: "CRQ Raised vs Closed — Ticket Aging Distribution",
//     extraCol: {
//       key: "type",
//       label: "Type",
//       getValue: (_r, i) => (i % 2 === 0 ? "Raised" : "Closed"),
//     },
//   },
//   bottleneck: {
//     title: "Bottleneck Detection — Ticket Aging Distribution",
//     extraCol: {
//       key: "avgWait",
//       label: "Avg Wait",
//       getValue: (_r, i) =>
//         ["72h","48h","32h","18h","24h","56h","40h","12h","64h","36h","44h","28h","20h","52h","16h","68h","8h","76h","60h","4h"][i % 20],
//     },
//   },
//   domainsla: {
//     title: "Domain SLA Performance — Ticket Aging Distribution",
//     extraCol: {
//       key: "slaScore",
//       label: "SLA Score",
//       getValue: (_r, i) =>
//         ["94%","88%","72%","85%","91%","76%","89%","83%","68%","95%","79%","87%","73%","92%","81%","70%","96%","84%","78%","90%"][i % 20],
//     },
//   },
//   radar: {
//     title: "Domain Coverage Radar — Ticket Aging Distribution",
//     extraCol: {
//       key: "coverage",
//       label: "Coverage %",
//       getValue: (_r, i) =>
//         ["82%","91%","75%","88%","94%","70%","86%","79%","93%","68%","85%","77%","90%","83%","72%","89%","76%","95%","81%","74%"][i % 20],
//     },
//   },
//   domaincrq: {
//     title: "Domain Wise CRQ Analysis — Ticket Aging Distribution",
//     extraCol: {
//       key: "domainGroup",
//       label: "Domain Group",
//       getValue: (_r, i) =>
//         ["IP Core","Packet","Optics","BRAS","CEN","MPLS","IP Access","IP Core","Packet","Optics","BRAS","CEN","MPLS","IP Access","IP Core","Packet","Optics","BRAS","CEN","MPLS"][i % 20],
//     },
//   },
// };

// // ─── Style factories ──────────────────────────────────────────────────────────
// const panelSx = (isDark: boolean): SxProps<Theme> => ({
//   background: isDark
//     ? "linear-gradient(145deg,#0f1a2e 0%,#0a1220 100%)"
//     : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
//   border: `1px solid ${isDark ? "rgba(99,130,180,0.15)" : "rgba(226,232,240,0.9)"}`,
//   borderRadius: 3,
//   p: 2,
//   position: "relative",
//   overflow: "hidden",
//   boxShadow: isDark
//     ? "0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)"
//     : "0 2px 12px rgba(0,0,0,0.06)",
//   "&::before": {
//     content: '""',
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: "1px",
//     background: isDark
//       ? "linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)"
//       : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
//   },
// });

// const sectionTitleSx = (isDark: boolean): SxProps<Theme> => ({
//   fontSize: "0.65rem",
//   fontWeight: 700,
//   color: isDark ? "#94a3b8" : "#64748b",
//   textTransform: "uppercase",
//   letterSpacing: "0.1em",
// });

// const selectSx = (isDark: boolean): SxProps<Theme> => ({
//   height: 32,
//   fontSize: 12,
//   color: isDark ? "#e2e8f0" : "#1e293b",
//   bgcolor: isDark ? "rgba(15,26,46,0.9)" : "rgba(248,250,252,0.9)",
//   "& .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(99,130,180,0.3)" : "rgba(203,213,225,0.9)",
//   },
//   "&:hover .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.5)",
//   },
//   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "#38bdf8" : "#6366f1",
//   },
//   "& .MuiSelect-icon": {
//     color: isDark ? "#64748b" : "#94a3b8",
//     fontSize: 18,
//   },
// });

// // ─── KPI config ───────────────────────────────────────────────────────────────
// const KPI_CFG = [
//   {
//     id: "total",
//     label: "Total CRQ",
//     icon: "📊",
//     color: "#38bdf8",
//     iconBg: "rgba(56,189,248,0.15)",
//     expandable: true,
//   },
//   {
//     id: "open",
//     label: "Open CRQ",
//     icon: "🔓",
//     color: "#fb923c",
//     iconBg: "rgba(251,146,60,0.15)",
//     expandable: true,
//   },
//   {
//     id: "closed",
//     label: "Closed CRQ",
//     icon: "✅",
//     color: "#4ade80",
//     iconBg: "rgba(74,222,128,0.15)",
//     expandable: false,
//   },
//   {
//     id: "rejected",
//     label: "Rejected",
//     icon: "❌",
//     color: "#f87171",
//     iconBg: "rgba(248,113,113,0.15)",
//     expandable: false,
//   },
//   {
//     id: "sla",
//     label: "SLA Score",
//     icon: "🎯",
//     color: "#8b5cf6",
//     iconBg: "rgba(139,92,246,0.15)",
//     expandable: true,
//   },
// ] as const;

// type KpiId = (typeof KPI_CFG)[number]["id"];

// // ─── KPI Card ─────────────────────────────────────────────────────────────────
// interface KPICardProps {
//   cfg: (typeof KPI_CFG)[number];
//   value: string | number;
//   sub: string;
//   trend: number;
//   isDark: boolean;
//   isActive: boolean;
//   onClick: () => void;
// }

// const KPICard: React.FC<KPICardProps> = ({
//   cfg,
//   value,
//   sub,
//   trend,
//   isDark,
//   isActive,
//   onClick,
// }) => {
//   const trendColor = trend >= 0 ? "#4ade80" : "#f87171";
//   const text = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <Box
//       role={cfg.expandable ? "button" : undefined}
//       tabIndex={cfg.expandable ? 0 : undefined}
//       aria-expanded={cfg.expandable ? isActive : undefined}
//       onClick={cfg.expandable ? onClick : undefined}
//       onKeyDown={
//         cfg.expandable ? (e) => e.key === "Enter" && onClick() : undefined
//       }
//       sx={{
//         background: isDark
//           ? "linear-gradient(160deg,#0d1b2e 0%,#0a1525 100%)"
//           : "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)",
//         border: `1px solid ${
//           isActive
//             ? `${cfg.color}55`
//             : isDark
//               ? `${cfg.color}22`
//               : "rgba(226,232,240,0.9)"
//         }`,
//         borderRadius: 3,
//         p: 2,
//         position: "relative",
//         overflow: "hidden",
//         cursor: cfg.expandable ? "pointer" : "default",
//         userSelect: "none",
//         transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
//         boxShadow: isActive
//           ? `0 6px 28px ${cfg.color}30,inset 0 0 30px ${cfg.color}0d`
//           : isDark
//             ? `0 4px 20px rgba(0,0,0,0.4),inset 0 0 30px ${cfg.iconBg}`
//             : "0 2px 10px rgba(0,0,0,0.06)",
//         transform: isActive ? "translateY(-2px)" : "none",
//         "&:hover": cfg.expandable
//           ? { transform: "translateY(-2px)", boxShadow: `0 8px 32px ${cfg.color}28` }
//           : {},
//         "&:focus-visible": { outline: `2px solid ${cfg.color}`, outlineOffset: 2 },
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           top: 0, left: 0, right: 0,
//           height: "2px",
//           background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
//         },
//       }}
//     >
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box
//             sx={{
//               width: 32, height: 32, borderRadius: 1.5,
//               bgcolor: cfg.iconBg,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: 15, flexShrink: 0,
//             }}
//           >
//             {cfg.icon}
//           </Box>
//           <Typography sx={{ fontSize: 12, fontWeight: 700, color: text, lineHeight: 1.2 }}>
//             {cfg.label}
//           </Typography>
//         </Box>
//         {cfg.expandable && (
//           <Box
//             sx={{
//               px: 0.8, py: 0.15, borderRadius: 0.8,
//               fontSize: 9, fontWeight: 700,
//               bgcolor: isActive ? `${cfg.color}22` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
//               border: `1px solid ${isActive ? `${cfg.color}44` : "transparent"}`,
//               color: isActive ? cfg.color : muted,
//               transition: "all 0.2s",
//             }}
//           >
//             {isActive ? "▲" : "▼"}
//           </Box>
//         )}
//       </Box>

//       <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
//         <Typography sx={{ fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: "-0.5px", lineHeight: 1 }}>
//           {value}
//         </Typography>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
//           <Typography sx={{ fontSize: 9, color: trendColor }}>{trend >= 0 ? "▲" : "▼"}</Typography>
//           <Typography sx={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
//             {Math.abs(trend).toFixed(1)}%
//           </Typography>
//         </Box>
//       </Box>
//       <Typography sx={{ fontSize: 10, color: muted }}>{sub}</Typography>

//       {isActive && (
//         <Box
//           sx={{
//             position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
//             background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
//           }}
//         />
//       )}
//     </Box>
//   );
// };

// // ─── Workflow Expand Panel ────────────────────────────────────────────────────
// interface WorkflowExpandPanelProps {
//   type: "total" | "open" | "sla";
//   stages: CRQWorkflowStage[];
//   slaDomains: CRQSlaDomain[];
//   isDark: boolean;
// }

// const WorkflowExpandPanel: React.FC<WorkflowExpandPanelProps> = ({
//   type,
//   stages,
//   slaDomains,
//   isDark,
// }) => {
//   const text = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";
//   const panelBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
//   const accentColor =
//     type === "sla" ? "#8b5cf6" : type === "total" ? "#38bdf8" : "#fb923c";

//   if (type === "sla") {
//     return (
//       <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
//           <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: "#8b5cf6" }} />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
//             SLA Score — Domain Breakdown
//           </Typography>
//         </Box>
//         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 1.5 }}>
//           {slaDomains.map((d) => {
//             const c = slaColor(d.score);
//             return (
//               <Box
//                 key={d.domain}
//                 sx={{
//                   background: panelBg, borderRadius: 2, p: 1.5,
//                   border: `1px solid ${isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}`,
//                 }}
//               >
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                   <Typography sx={{ fontSize: 11, color: muted, fontWeight: 500 }}>{d.domain}</Typography>
//                   <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.text, bgcolor: `${c.bar}20`, px: 0.8, borderRadius: 0.8 }}>
//                     {d.score}%
//                   </Typography>
//                 </Box>
//                 <Box sx={{ height: 5, bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
//                   <Box sx={{ width: `${d.score}%`, height: "100%", bgcolor: c.bar, borderRadius: 3, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
//                 </Box>
//               </Box>
//             );
//           })}
//         </Box>
//       </Box>
//     );
//   }

//   const data = stages.map((s) => ({
//     name: s.stage,
//     count: type === "total" ? s.totalCount : s.openCount,
//   }));
//   const maxVal = Math.max(...data.map((d) => d.count), 1);
//   const total = data.reduce((a, b) => a + b.count, 0) || 1;

//   return (
//     <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: accentColor }} />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
//             {type === "total" ? "Total CRQ" : "Open CRQ"} — Workflow Stage Breakdown
//           </Typography>
//         </Box>
//         <Chip
//           label={`${total} across ${data.length} stages`}
//           size="small"
//           sx={{ fontSize: 10, fontWeight: 600, bgcolor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33`, height: 22 }}
//         />
//       </Box>
//       <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 1.5 }}>
//         {data.map((s) => {
//           const pct = Math.round((s.count / total) * 100);
//           const ratio = s.count / maxVal;
//           const barColor = ratio >= 0.75 ? "#ef4444" : ratio >= 0.5 ? "#f59e0b" : "#3b82f6";
//           const isMax = s.count === maxVal;
//           return (
//             <Box
//               key={s.name}
//               sx={{
//                 background: panelBg, borderRadius: 2, p: 1.5, position: "relative",
//                 border: `1px solid ${isMax ? `${barColor}44` : isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}`,
//                 transition: "transform 0.15s ease",
//                 "&:hover": { transform: "translateY(-1px)" },
//               }}
//             >
//               {isMax && (
//                 <Box sx={{ position: "absolute", top: 6, right: 6, fontSize: 8, color: "#ef4444", bgcolor: "rgba(239,68,68,0.12)", borderRadius: 0.5, px: 0.6, py: 0.1, fontWeight: 700, letterSpacing: "0.05em" }}>
//                   MAX
//                 </Box>
//               )}
//               <Typography sx={{ fontSize: 10, color: muted, mb: 0.8, lineHeight: 1.4, pr: isMax ? 4 : 0 }}>{s.name}</Typography>
//               <Typography sx={{ fontSize: 22, fontWeight: 800, color: text, lineHeight: 1 }}>{s.count}</Typography>
//               <Typography sx={{ fontSize: 10, color: muted, mb: 1 }}>{pct}% of total</Typography>
//               <Box sx={{ height: 4, bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
//                 <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: barColor, borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// // ─── Chart Card wrapper ───────────────────────────────────────────────────────
// interface ChartCardProps {
//   title: string;
//   isDark: boolean;
//   height?: number;
//   isLoading?: boolean;
//   onTitleClick?: () => void;
//   children: React.ReactNode;
// }

// const ChartCard: React.FC<ChartCardProps> = ({
//   title,
//   isDark,
//   height = 185,
//   isLoading,
//   onTitleClick,
//   children,
// }) => (
//   <Box sx={panelSx(isDark)}>
//     <Box
//       sx={{
//         ...sectionTitleSx(isDark),
//         mb: 1.5,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//       }}
//     >
//       <span>{title}</span>
//       {onTitleClick && (
//         <Box
//           component="button"
//           onClick={onTitleClick}
//           sx={{
//             background: "none",
//             border: `1px solid ${isDark ? "rgba(56,189,248,0.35)" : "rgba(99,102,241,0.35)"}`,
//             borderRadius: 1,
//             cursor: "pointer",
//             color: isDark ? "#38bdf8" : "#6366f1",
//             fontSize: "0.6rem",
//             fontWeight: 700,
//             letterSpacing: "0.08em",
//             px: 0.8,
//             py: 0.3,
//             textTransform: "uppercase",
//             transition: "all 0.18s",
//             "&:hover": {
//               bgcolor: isDark ? "rgba(56,189,248,0.12)" : "rgba(99,102,241,0.08)",
//             },
//           }}
//         >
//           View All
//         </Box>
//       )}
//     </Box>
//     {isLoading ? (
//       <Skeleton
//         variant="rectangular"
//         height={height}
//         sx={{ borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9" }}
//       />
//     ) : (
//       <Box sx={{ height }}>{children}</Box>
//     )}
//   </Box>
// );

// // ─── Chart Popup Table ────────────────────────────────────────────────────────
// interface ChartPopupTableProps {
//   open: boolean;
//   onClose: () => void;
//   chartType: ChartPopupType | null;
//   isDark: boolean;
// }

// const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
//   Completed: { bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
//   Open:      { bg: "rgba(56,189,248,0.15)",  text: "#38bdf8" },
//   Rejected:  { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
// };

// const ChartPopupTable: React.FC<ChartPopupTableProps> = ({
//   open,
//   onClose,
//   chartType,
//   isDark,
// }) => {
//   if (!chartType) return null;
//   const cfg = CHART_POPUP_CONFIGS[chartType];
//   const rows = MOCK_TABLE_ROWS;

//   const headerCellSx: SxProps<Theme> = {
//     fontSize: "0.6rem",
//     fontWeight: 700,
//     color: isDark ? "#64748b" : "#94a3b8",
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     bgcolor: isDark ? "#060e1a" : "#f8fafc",
//     borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.2)" : "rgba(226,232,240,0.9)"}`,
//     whiteSpace: "nowrap",
//     py: 1,
//     px: 1.5,
//   };

//   const bodyCellSx: SxProps<Theme> = {
//     fontSize: 11,
//     color: isDark ? "#cbd5e1" : "#475569",
//     borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.08)" : "rgba(226,232,240,0.6)"}`,
//     whiteSpace: "nowrap",
//     py: 0.9,
//     px: 1.5,
//   };

//   return (
//     <Modal open={open} onClose={onClose} keepMounted={false}>
//       <Box
//         sx={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%,-50%)",
//           width: { xs: "95vw", md: "min(900px,90vw)" },
//           maxHeight: "85vh",
//           display: "flex",
//           flexDirection: "column",
//           background: isDark
//             ? "linear-gradient(145deg,#0a1525 0%,#060e1a 100%)"
//             : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
//           border: `1px solid ${isDark ? "rgba(99,130,180,0.25)" : "rgba(226,232,240,0.9)"}`,
//           borderRadius: 3,
//           boxShadow: isDark
//             ? "0 24px 64px rgba(0,0,0,0.7)"
//             : "0 12px 40px rgba(0,0,0,0.18)",
//           overflow: "hidden",
//           outline: "none",
//         }}
//       >
//         {/* ── Header ── */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             px: 2.5,
//             py: 1.5,
//             borderBottom: `1px solid ${isDark ? "rgba(99,130,180,0.18)" : "rgba(226,232,240,0.9)"}`,
//             flexShrink: 0,
//             position: "relative",
//             "&::after": {
//               content: '""',
//               position: "absolute",
//               bottom: 0, left: 0, right: 0, height: "1px",
//               background: isDark
//                 ? "linear-gradient(90deg,transparent,rgba(56,189,248,0.3),transparent)"
//                 : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
//             },
//           }}
//         >
//           <Box>
//             <Typography sx={{ fontSize: 13, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>
//               {cfg.title}
//             </Typography>
//             <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mt: 0.25 }}>
//               Showing {rows.length} records
//             </Typography>
//           </Box>
//           <IconButton
//             onClick={onClose}
//             size="small"
//             sx={{
//               bgcolor: "rgba(248,113,113,0.12)",
//               border: "1px solid rgba(248,113,113,0.3)",
//               color: "#f87171",
//               borderRadius: 1.5,
//               width: 30, height: 30,
//               "&:hover": { bgcolor: "rgba(248,113,113,0.22)" },
//             }}
//           >
//             <CloseIcon sx={{ fontSize: 14 }} />
//           </IconButton>
//         </Box>

//         {/* ── Table ── */}
//         <TableContainer sx={{ flex: 1, overflow: "auto" }}>
//           <Table stickyHeader size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={headerCellSx}>Change ID</TableCell>
//                 <TableCell sx={headerCellSx}>Submit Date</TableCell>
//                 <TableCell sx={headerCellSx}>Status</TableCell>
//                 <TableCell sx={headerCellSx}>Aging</TableCell>
//                 <TableCell sx={headerCellSx}>Impact</TableCell>
//                 <TableCell sx={headerCellSx}>Requester</TableCell>
//                 <TableCell sx={headerCellSx}>{cfg.extraCol.label}</TableCell>
//                 <TableCell sx={{ ...headerCellSx, minWidth: 220 }}>Summary</TableCell>
//                 <TableCell sx={headerCellSx}>Region</TableCell>
//                 <TableCell sx={headerCellSx}>Circle</TableCell>
//                 <TableCell sx={headerCellSx}>Bin Group</TableCell>
//                 <TableCell sx={headerCellSx}>Coordinator</TableCell>
//                 <TableCell sx={headerCellSx}>Implementor</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((row, idx) => {
//                 const sc = STATUS_COLORS[row.status] ?? STATUS_COLORS["Open"];
//                 return (
//                   <TableRow
//                     key={row.changeId}
//                     sx={{
//                       "&:hover td": {
//                         bgcolor: isDark ? "rgba(56,189,248,0.04)" : "rgba(99,102,241,0.03)",
//                       },
//                     }}
//                   >
//                     {/* Change ID */}
//                     <TableCell sx={bodyCellSx}>
//                       <Typography
//                         sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#38bdf8" : "#3b82f6" }}
//                       >
//                         {row.changeId}
//                       </Typography>
//                     </TableCell>

//                     {/* Submit Date */}
//                     <TableCell sx={bodyCellSx}>{row.submitDate}</TableCell>

//                     {/* Status */}
//                     <TableCell sx={bodyCellSx}>
//                       <Box
//                         component="span"
//                         sx={{
//                           bgcolor: sc.bg,
//                           color: sc.text,
//                           borderRadius: 0.8,
//                           px: 1,
//                           py: 0.25,
//                           fontSize: 10,
//                           fontWeight: 700,
//                         }}
//                       >
//                         {row.status}
//                       </Box>
//                     </TableCell>

//                     {/* Aging */}
//                     <TableCell sx={bodyCellSx}>
//                       <Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>
//                         {row.aging}
//                       </Typography>
//                     </TableCell>

//                     {/* Impact */}
//                     <TableCell sx={bodyCellSx}>{row.impact}</TableCell>

//                     {/* Requester */}
//                     <TableCell sx={bodyCellSx}>{row.requester}</TableCell>

//                     {/* Extra column (per-chart) */}
//                     <TableCell sx={bodyCellSx}>
//                       {cfg.extraCol.getValue(row, idx)}
//                     </TableCell>

//                     {/* Summary */}
//                     <TableCell
//                       sx={{
//                         ...bodyCellSx,
//                         maxWidth: 220,
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {row.summary}
//                     </TableCell>

//                     {/* Region */}
//                     <TableCell sx={bodyCellSx}>{row.region}</TableCell>

//                     {/* Circle */}
//                     <TableCell sx={bodyCellSx}>{row.circle}</TableCell>

//                     {/* Bin Group */}
//                     <TableCell sx={{ ...bodyCellSx, fontSize: 10, color: isDark ? "#94a3b8" : "#64748b" }}>
//                       {row.binGroup}
//                     </TableCell>

//                     {/* Coordinator */}
//                     <TableCell sx={bodyCellSx}>{row.coordinator}</TableCell>

//                     {/* Implementor */}
//                     <TableCell sx={bodyCellSx}>{row.implementor}</TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//     </Modal>
//   );
// };

// // ─── Custom Tooltip ───────────────────────────────────────────────────────────
// const CustomTooltip = ({
//   active,
//   payload,
//   label,
//   isDark,
// }: {
//   active?: boolean;
//   payload?: Array<{ name: string; value: number; color: string }>;
//   label?: string;
//   isDark: boolean;
// }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <Box
//       sx={{
//         bgcolor: isDark ? "#0d1b2e" : "#fff",
//         border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
//         borderRadius: 2,
//         px: 1.5,
//         py: 1,
//         boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
//         fontSize: 11,
//       }}
//     >
//       {label && (
//         <Typography sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mb: 0.5 }}>
//           {label}
//         </Typography>
//       )}
//       {payload.map((p) => (
//         <Box key={p.name} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.25 }}>
//           <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
//           <Typography sx={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>{p.name}:</Typography>
//           <Typography sx={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e2e8f0" : "#1e293b" }}>
//             {p.value}
//           </Typography>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// // ─── Filter dropdown config ───────────────────────────────────────────────────
// type FilterKey = "function" | "domain" | "subDomain" | "circle";
// type FilterState = Record<FilterKey, string>;

// // ─── Main Dashboard Component ─────────────────────────────────────────────────
// const CRQAnalyticsMain: React.FC = () => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   // ── Filter state ──────────────────────────────────────────────────────────
//   const [startDate, setStartDate] = useState<Dayjs>(() => dayjs().startOf("month"));
//   const [endDate, setEndDate]     = useState<Dayjs>(() => dayjs().endOf("month"));
//   const [filters, setFilters]     = useState<FilterState>({
//     function: "All Functions",
//     domain: "All Domains",
//     subDomain: "All Sub-Domains",
//     circle: "All Circles",
//   });

//   // ── Chart popup state ─────────────────────────────────────────────────────
//   const [popupChart, setPopupChart] = useState<ChartPopupType | null>(null);
//   const openPopup  = useCallback((type: ChartPopupType) => setPopupChart(type), []);
//   const closePopup = useCallback(() => setPopupChart(null), []);

//   const domainOptions = useMemo(() => {
//     if (filters.function === "All Functions") return ["All Domains"];
//     return ["All Domains", ...Object.keys(FUNC_HIERARCHY[filters.function] || {})];
//   }, [filters.function]);

//   const subDomainOptions = useMemo(() => {
//     if (filters.domain === "All Domains") return ["All Sub-Domains"];
//     if (filters.function !== "All Functions" && FUNC_HIERARCHY[filters.function]?.[filters.domain]) {
//       return ["All Sub-Domains", ...FUNC_HIERARCHY[filters.function][filters.domain]];
//     }
//     return ["All Sub-Domains"];
//   }, [filters.function, filters.domain]);

//   const handleFunctionChange = (value: string) => {
//     setFilters((prev) => ({ ...prev, function: value, domain: "All Domains", subDomain: "All Sub-Domains" }));
//   };

//   const handleDomainChange = (value: string) => {
//     setFilters((prev) => ({ ...prev, domain: value, subDomain: "All Sub-Domains" }));
//   };

//   // ── KPI expand state ──────────────────────────────────────────────────────
//   const [activePanel, setActivePanel] = useState<KpiId | null>(null);
//   const handleCardClick = useCallback((id: KpiId) => {
//     setActivePanel((prev) => (prev === id ? null : id));
//   }, []);

//   // ── API call ──────────────────────────────────────────────────────────────
//   const { data, isFetching, isError } = useGetCRQAnalyticsDashboardQuery({
//     startDate: startDate.format("YYYY-MM-DD"),
//     endDate: endDate.format("YYYY-MM-DD"),
//   });

//   // ── Resolved data (API → mock fallback) ───────────────────────────────────
//   const workflowStages  = useMemo<CRQWorkflowStage[]>  (() => data?.workflowStages  ?? MOCK_STAGES,          [data]);
//   const slaDomains      = useMemo<CRQSlaDomain[]>      (() => data?.slaDomains      ?? MOCK_SLA_DOMAINS,     [data]);
//   const raisedVsClosed  = useMemo<CRQRaisedVsClosed[]> (() => data?.raisedVsClosed  ?? MOCK_RAISED,          [data]);
//   const bottlenecks     = useMemo<CRQBottleneck[]>     (() => data?.bottlenecks     ?? MOCK_BOTTLENECK,      [data]);
//   const domainSlaChart  = useMemo<CRQDomainSlaChart[]> (() => data?.domainSlaChart  ?? MOCK_DOMAIN_SLA,      [data]);
//   const radarCoverage   = useMemo<CRQRadarCoverage[]>  (() => data?.radarCoverage   ?? MOCK_RADAR_COVERAGE,  [data]);
//   const domainCrqCount  = useMemo<CRQDomainCount[]>    (() => data?.domainCrqCount  ?? MOCK_DOMAIN_CRQ,      [data]);

//   // ── KPI display values ────────────────────────────────────────────────────
//   const kpiValues = useMemo(
//     () => ({
//       total:    { value: data?.kpi?.totalCrq   ?? 120,   sub: "All requests",  trend: data?.kpi?.totalTrendPct    ?? 8    },
//       open:     { value: data?.kpi?.openCrq    ?? 48,    sub: "In progress",   trend: data?.kpi?.openTrendPct     ?? -3   },
//       closed:   { value: data?.kpi?.closedCrq  ?? 62,    sub: "Completed",     trend: data?.kpi?.closedTrendPct   ?? 12   },
//       rejected: { value: data?.kpi?.rejected   ?? 10,    sub: "Declined",      trend: data?.kpi?.rejectedTrendPct ?? -2   },
//       sla:      { value: `${data?.kpi?.slaScore ?? 87}%`, sub: "On-time rate", trend: data?.kpi?.slaTrendPct      ?? 1.2  },
//     }),
//     [data],
//   );

//   // ── Chart style tokens ────────────────────────────────────────────────────
//   const gridColor    = isDark ? "rgba(99,130,180,0.08)" : "#f1f5f9";
//   const tickColor    = isDark ? "#475569" : "#94a3b8";
//   const tooltipStyle = {
//     background: isDark ? "#0d1b2e" : "#fff",
//     border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
//     borderRadius: 8,
//     fontSize: 11,
//     boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
//     padding: "8px 12px",
//   };

//   const text  = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ pb: 2 }}>

//         {/* ── Filter bar ────────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 1.5,
//             p: { xs: 1.5, md: 1.5 },
//             borderRadius: 2.5,
//             mb: 2,
//             background: isDark
//               ? "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))"
//               : "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.8))",
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(226,232,240,0.95)"}`,
//             boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.06)",
//           }}
//         >
//           <DatePicker
//             label="Start Date"
//             value={startDate}
//             maxDate={endDate}
//             onChange={(v) => v && setStartDate(v)}
//             slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }}
//           />
//           <DatePicker
//             label="End Date"
//             value={endDate}
//             minDate={startDate}
//             onChange={(v) => v && setEndDate(v)}
//             slotProps={{ textField: { size: "small", sx: { minWidth: 148, "& .MuiInputBase-root": { height: 32, fontSize: 12 } } } }}
//           />

//           <Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0 }} />

//           <Select value={filters.function} onChange={(e) => handleFunctionChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
//             {["All Functions", "SE", "CCB"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>

//           <Select value={filters.domain} onChange={(e) => handleDomainChange(e.target.value)} sx={{ ...selectSx(isDark), minWidth: 132 }}>
//             {domainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>

//           <Select
//             value={filters.subDomain}
//             onChange={(e) => setFilters((prev) => ({ ...prev, subDomain: e.target.value }))}
//             sx={{ ...selectSx(isDark), minWidth: 132 }}
//           >
//             {subDomainOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//           </Select>

//           <FormControl size="small">
//             <Select
//               value={filters.circle}
//               onChange={(e) => setFilters((prev) => ({ ...prev, circle: e.target.value }))}
//               displayEmpty
//               sx={{ ...selectSx(isDark), minWidth: 132 }}
//             >
//               {CIRCLE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//             </Select>
//           </FormControl>
//         </Box>

//         {/* ── Error banner ──────────────────────────────────────────────── */}
//         {isError && (
//           <Alert severity="warning" sx={{ mb: 2, fontSize: 12, borderRadius: 2 }}>
//             API unavailable — showing demo data. Connect <strong>/crq-analytics/dashboard</strong> for live data.
//           </Alert>
//         )}

//         {/* ── KPI Cards ─────────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(5,1fr)" },
//             gap: 1.5,
//             mb: 1.5,
//           }}
//         >
//           {KPI_CFG.map((cfg) => {
//             const kv = kpiValues[cfg.id];
//             return (
//               <KPICard
//                 key={cfg.id}
//                 cfg={cfg}
//                 value={isFetching ? "…" : kv.value}
//                 sub={kv.sub}
//                 trend={kv.trend}
//                 isDark={isDark}
//                 isActive={activePanel === cfg.id}
//                 onClick={() => handleCardClick(cfg.id)}
//               />
//             );
//           })}
//         </Box>

//         {/* ── Expandable KPI panel ───────────────────────────────────────── */}
//         <Collapse in={activePanel !== null} unmountOnExit>
//           {(activePanel === "total" || activePanel === "open") && (
//             <WorkflowExpandPanel type={activePanel} stages={workflowStages} slaDomains={slaDomains} isDark={isDark} />
//           )}
//           {activePanel === "sla" && (
//             <WorkflowExpandPanel type="sla" stages={workflowStages} slaDomains={slaDomains} isDark={isDark} />
//           )}
//         </Collapse>

//         {/* ── Row 1: Area + Bottleneck + Domain SLA ─────────────────────── */}
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.5, mb: 1.5 }}>

//           {/* Raised vs Closed */}
//           <ChartCard
//             title="CRQ RAISED VS CLOSED"
//             isDark={isDark}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("raised")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={raisedVsClosed} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
//                 <defs>
//                   <linearGradient id="grRaised" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="grClosed" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="label" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <RTooltip contentStyle={tooltipStyle} />
//                 <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} formatter={(v) => <span style={{ color: tickColor }}>{v}</span>} />
//                 <Area type="monotone" dataKey="raised" stroke="#38bdf8" strokeWidth={2} fill="url(#grRaised)" dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Raised" />
//                 <Area type="monotone" dataKey="closed" stroke="#4ade80" strokeWidth={2} fill="url(#grClosed)" dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Closed" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Bottleneck */}
//           <ChartCard
//             title="BOTTLENECK DETECTION"
//             isDark={isDark}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("bottleneck")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={bottlenecks} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
//                 <XAxis type="number" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} unit="h" />
//                 <YAxis dataKey="stage" type="category" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} width={88} />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, "Avg Wait"]} />
//                 <Bar dataKey="avgWaitHours" radius={[0, 4, 4, 0]} maxBarSize={18}>
//                   {bottlenecks.map((_, i) => (
//                     <Cell key={i} fill={BOTTLENECK_PALETTE[Math.min(i, BOTTLENECK_PALETTE.length - 1)]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Domain SLA */}
//           <ChartCard
//             title="DOMAIN SLA PERFORMANCE"
//             isDark={isDark}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("domainsla")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={domainSlaChart} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="domain" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} unit="%" />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "SLA Score"]} />
//                 <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
//                   {domainSlaChart.map((d, i) => <Cell key={i} fill={slaColor(d.score).bar} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Row 2: Radar + Domain CRQ count ───────────────────────────── */}
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>

//           {/* Radar */}
//           <ChartCard
//             title="DOMAIN COVERAGE RADAR"
//             isDark={isDark}
//             height={240}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("radar")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <RadarChart data={radarCoverage} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
//                 <PolarGrid stroke={gridColor} />
//                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: tickColor }} />
//                 <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: tickColor }} tickCount={4} />
//                 <Radar
//                   name="Coverage"
//                   dataKey="value"
//                   stroke="#38bdf8"
//                   fill="#38bdf8"
//                   fillOpacity={0.15}
//                   strokeWidth={2}
//                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                   dot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 } as any}
//                 />
//                 <RTooltip contentStyle={tooltipStyle} />
//               </RadarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Domain CRQ count */}
//           <ChartCard
//             title="DOMAIN WISE CRQ ANALYSIS"
//             isDark={isDark}
//             height={240}
//             isLoading={isFetching}
//             onTitleClick={() => openPopup("domaincrq")}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={domainCrqCount} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis dataKey="domain" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
//                 <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "CRQ Count"]} />
//                 <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
//                   {domainCrqCount.map((_, i) => <Cell key={i} fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Footer ────────────────────────────────────────────────────── */}
//         <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <Typography sx={{ fontSize: 10, color: muted }}>
//             Filtered:{" "}
//             <Box component="span" sx={{ color: text, fontWeight: 600 }}>
//               {startDate.format("DD MMM YYYY")} → {endDate.format("DD MMM YYYY")}
//             </Box>
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
//             <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: data ? "#22c55e" : "#f59e0b" }} />
//             <Typography sx={{ fontSize: 10, color: muted }}>
//               {data ? "Live API data" : "Demo data — API offline"}
//             </Typography>
//           </Box>
//         </Box>

//         {/* ── Chart Popup Table ─────────────────────────────────────────── */}
//         <ChartPopupTable
//           open={popupChart !== null}
//           onClose={closePopup}
//           chartType={popupChart}
//           isDark={isDark}
//         />

//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default CRQAnalyticsMain;

// // ─── Hierarchy + Circle constants ─────────────────────────────────────────────
// const FUNC_HIERARCHY: Record<string, Record<string, string[]>> = {
//   SE: {
//     "IP Core":              ["MPLS-Core", "BRAS-Core", "CEN-Core"],
//     Packet:                 ["Packet-Change", "Packet_NI"],
//     "Embedded Support":     ["All"],
//     "IP Access":            ["MPLS-Access", "CEN-Access", "OLT Access"],
//     Optics:                 ["Network_expansion", "NNI", "OTN/LCD", "Project"],
//     "Service Optimisation": ["All"],
//   },
//   CCB: {
//     "IP Core_CCB":              ["MPLS-Core_CCB", "BRAS-Core_CCB", "CEN-Core_CCB"],
//     Packet_CCB:                 ["Packet-Change_CCB", "Packet_NI_CCB"],
//     "Embedded Support_CCB":     ["All"],
//     "IP Access_CCB":            ["MPLS-Access_CCB", "CEN-Access_CCB", "OLT Access_CCB"],
//     Optics_CCB:                 ["Network_expansion_CCB", "Project_CCB"],
//     "Service Optimisation_CCB": ["All"],
//   },
// };

// const CIRCLE_OPTIONS = [
//   "All Circles",
//   "Maharashtra",
//   "Gujarat",
//   "Kerala",
//   "Tamil Nadu",
//   "Karnataka",
//   "Delhi",
//   "Punjab",
//   "Rajasthan",
//   "UP East",
//   "UP West",
//   "Bihar",
//   "Odisha",
//   "West Bengal",
//   "Andhra Pradesh",
//   "Haryana",
// ];































// import React, { useState, useCallback, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   useTheme,
//   Collapse,
//   Chip,
//   FormControl,
//   Select,
//   MenuItem,
//   Divider,
//   Skeleton,
//   Alert,
// } from "@mui/material";
// import type { SelectChangeEvent, SxProps, Theme } from "@mui/material";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RTooltip,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";
// import dayjs, { Dayjs } from "dayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// import { useGetCRQAnalyticsDashboardQuery } from "./crqAnalytics.api";
// import type {
//   CRQWorkflowStage,
//   CRQSlaDomain,
//   CRQRaisedVsClosed,
//   CRQBottleneck,
//   CRQDomainSlaChart,
//   CRQRadarCoverage,
//   CRQDomainCount,
// } from "./crqAnalytics.api";

// import {
//   workflowStages as MOCK_STAGES,
//   slaDomains as MOCK_SLA_DOMAINS,
//   raisedVsClosed as MOCK_RAISED,
//   bottlenecks as MOCK_BOTTLENECK,
//   domainSlaChart as MOCK_DOMAIN_SLA,
//   radarCoverage as MOCK_RADAR_COVERAGE,
//   domainCRQ as MOCK_DOMAIN_CRQ,
// } from "./crqAnalytics.mock";

// // ─── Palette helpers ──────────────────────────────────────────────────────────
// const slaColor = (s: number) =>
//   s >= 90
//     ? { bar: "#22c55e", text: "#4ade80" }
//     : s >= 80
//       ? { bar: "#facc15", text: "#fbbf24" }
//       : { bar: "#ef4444", text: "#f87171" };

// const DOMAIN_PALETTE = [
//   "#818cf8",
//   "#6366f1",
//   "#3b82f6",
//   "#22d3ee",
//   "#4ade80",
//   "#facc15",
//   "#94a3b8",
// ] as const;

// const BOTTLENECK_PALETTE = [
//   "#ef4444",
//   "#f97316",
//   "#f59e0b",
//   "#3b82f6",
//   "#22c55e",
// ] as const;

// // ─── Style factories ──────────────────────────────────────────────────────────
// const panelSx = (isDark: boolean): SxProps<Theme> => ({
//   background: isDark
//     ? "linear-gradient(145deg,#0f1a2e 0%,#0a1220 100%)"
//     : "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
//   border: `1px solid ${isDark ? "rgba(99,130,180,0.15)" : "rgba(226,232,240,0.9)"}`,
//   borderRadius: 3,
//   p: 2,
//   position: "relative",
//   overflow: "hidden",
//   boxShadow: isDark
//     ? "0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)"
//     : "0 2px 12px rgba(0,0,0,0.06)",
//   "&::before": {
//     content: '""',
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: "1px",
//     background: isDark
//       ? "linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)"
//       : "linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)",
//   },
// });

// const sectionTitleSx = (isDark: boolean): SxProps<Theme> => ({
//   fontSize: "0.65rem",
//   fontWeight: 700,
//   color: isDark ? "#94a3b8" : "#64748b",
//   textTransform: "uppercase",
//   letterSpacing: "0.1em",
// });

// const selectSx = (isDark: boolean): SxProps<Theme> => ({
//   height: 32,
//   fontSize: 12,
//   color: isDark ? "#e2e8f0" : "#1e293b",
//   bgcolor: isDark ? "rgba(15,26,46,0.9)" : "rgba(248,250,252,0.9)",
//   "& .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(99,130,180,0.3)" : "rgba(203,213,225,0.9)",
//   },
//   "&:hover .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.5)",
//   },
//   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: isDark ? "#38bdf8" : "#6366f1",
//   },
//   "& .MuiSelect-icon": {
//     color: isDark ? "#64748b" : "#94a3b8",
//     fontSize: 18,
//   },
// });

// // ─── KPI config ───────────────────────────────────────────────────────────────
// const KPI_CFG = [
//   {
//     id: "total",
//     label: "Total CRQ",
//     icon: "📊",
//     color: "#38bdf8",
//     iconBg: "rgba(56,189,248,0.15)",
//     expandable: true,
//   },
//   {
//     id: "open",
//     label: "Open CRQ",
//     icon: "🔓",
//     color: "#fb923c",
//     iconBg: "rgba(251,146,60,0.15)",
//     expandable: true,
//   },
//   {
//     id: "closed",
//     label: "Closed CRQ",
//     icon: "✅",
//     color: "#4ade80",
//     iconBg: "rgba(74,222,128,0.15)",
//     expandable: false,
//   },
//   {
//     id: "rejected",
//     label: "Rejected",
//     icon: "❌",
//     color: "#f87171",
//     iconBg: "rgba(248,113,113,0.15)",
//     expandable: false,
//   },
//   {
//     id: "sla",
//     label: "SLA Score",
//     icon: "🎯",
//     color: "#8b5cf6",
//     iconBg: "rgba(139,92,246,0.15)",
//     expandable: true,
//   },
// ] as const;

// type KpiId = (typeof KPI_CFG)[number]["id"];

// // ─── KPI Card ─────────────────────────────────────────────────────────────────
// interface KPICardProps {
//   cfg: (typeof KPI_CFG)[number];
//   value: string | number;
//   sub: string;
//   trend: number;
//   isDark: boolean;
//   isActive: boolean;
//   onClick: () => void;
// }

// const KPICard: React.FC<KPICardProps> = ({
//   cfg,
//   value,
//   sub,
//   trend,
//   isDark,
//   isActive,
//   onClick,
// }) => {
//   const trendColor = trend >= 0 ? "#4ade80" : "#f87171";
//   const text = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <Box
//       role={cfg.expandable ? "button" : undefined}
//       tabIndex={cfg.expandable ? 0 : undefined}
//       aria-expanded={cfg.expandable ? isActive : undefined}
//       onClick={cfg.expandable ? onClick : undefined}
//       onKeyDown={
//         cfg.expandable ? (e) => e.key === "Enter" && onClick() : undefined
//       }
//       sx={{
//         background: isDark
//           ? "linear-gradient(160deg,#0d1b2e 0%,#0a1525 100%)"
//           : "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)",
//         border: `1px solid ${
//           isActive
//             ? `${cfg.color}55`
//             : isDark
//               ? `${cfg.color}22`
//               : "rgba(226,232,240,0.9)"
//         }`,
//         borderRadius: 3,
//         p: 2,
//         position: "relative",
//         overflow: "hidden",
//         cursor: cfg.expandable ? "pointer" : "default",
//         userSelect: "none",
//         transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
//         boxShadow: isActive
//           ? `0 6px 28px ${cfg.color}30,inset 0 0 30px ${cfg.color}0d`
//           : isDark
//             ? `0 4px 20px rgba(0,0,0,0.4),inset 0 0 30px ${cfg.iconBg}`
//             : "0 2px 10px rgba(0,0,0,0.06)",
//         transform: isActive ? "translateY(-2px)" : "none",
//         "&:hover": cfg.expandable
//           ? {
//               transform: "translateY(-2px)",
//               boxShadow: `0 8px 32px ${cfg.color}28`,
//             }
//           : {},
//         "&:focus-visible": {
//           outline: `2px solid ${cfg.color}`,
//           outlineOffset: 2,
//         },
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: "2px",
//           background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
//         },
//       }}
//     >
//       {/* Header row */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mb: 1.5,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box
//             sx={{
//               width: 32,
//               height: 32,
//               borderRadius: 1.5,
//               bgcolor: cfg.iconBg,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 15,
//               flexShrink: 0,
//             }}
//           >
//             {cfg.icon}
//           </Box>
//           <Typography
//             sx={{ fontSize: 12, fontWeight: 700, color: text, lineHeight: 1.2 }}
//           >
//             {cfg.label}
//           </Typography>
//         </Box>
//         {cfg.expandable && (
//           <Box
//             sx={{
//               px: 0.8,
//               py: 0.15,
//               borderRadius: 0.8,
//               fontSize: 9,
//               fontWeight: 700,
//               bgcolor: isActive
//                 ? `${cfg.color}22`
//                 : isDark
//                   ? "rgba(255,255,255,0.05)"
//                   : "rgba(0,0,0,0.04)",
//               border: `1px solid ${isActive ? `${cfg.color}44` : "transparent"}`,
//               color: isActive ? cfg.color : muted,
//               transition: "all 0.2s",
//             }}
//           >
//             {isActive ? "▲" : "▼"}
//           </Box>
//         )}
//       </Box>

//       {/* Value row */}
//       <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
//         <Typography
//           sx={{
//             fontSize: 28,
//             fontWeight: 800,
//             color: cfg.color,
//             letterSpacing: "-0.5px",
//             lineHeight: 1,
//           }}
//         >
//           {value}
//         </Typography>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
//           <Typography sx={{ fontSize: 9, color: trendColor }}>
//             {trend >= 0 ? "▲" : "▼"}
//           </Typography>
//           <Typography sx={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
//             {Math.abs(trend).toFixed(1)}%
//           </Typography>
//         </Box>
//       </Box>
//       <Typography sx={{ fontSize: 10, color: muted }}>{sub}</Typography>

//       {/* Active bottom glow */}
//       {isActive && (
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             height: 3,
//             background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`,
//           }}
//         />
//       )}
//     </Box>
//   );
// };

// // ─── Workflow Expand Panel ────────────────────────────────────────────────────
// interface WorkflowExpandPanelProps {
//   type: "total" | "open" | "sla";
//   stages: CRQWorkflowStage[];
//   slaDomains: CRQSlaDomain[];
//   isDark: boolean;
// }

// const WorkflowExpandPanel: React.FC<WorkflowExpandPanelProps> = ({
//   type,
//   stages,
//   slaDomains,
//   isDark,
// }) => {
//   const text = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";
//   const panelBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
//   const accentColor =
//     type === "sla" ? "#8b5cf6" : type === "total" ? "#38bdf8" : "#fb923c";

//   // ── SLA domain breakdown ──
//   if (type === "sla") {
//     return (
//       <Box
//         sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
//           <Box
//             sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: "#8b5cf6" }}
//           />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
//             SLA Score — Domain Breakdown
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
//             gap: 1.5,
//           }}
//         >
//           {slaDomains.map((d) => {
//             const c = slaColor(d.score);
//             return (
//               <Box
//                 key={d.domain}
//                 sx={{
//                   background: panelBg,
//                   borderRadius: 2,
//                   p: 1.5,
//                   border: `1px solid ${isDark ? "rgba(99,130,180,0.12)" : "#e2e8f0"}`,
//                 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 1,
//                   }}
//                 >
//                   <Typography
//                     sx={{ fontSize: 11, color: muted, fontWeight: 500 }}
//                   >
//                     {d.domain}
//                   </Typography>
//                   <Typography
//                     sx={{
//                       fontSize: 11,
//                       fontWeight: 700,
//                       color: c.text,
//                       bgcolor: `${c.bar}20`,
//                       px: 0.8,
//                       borderRadius: 0.8,
//                     }}
//                   >
//                     {d.score}%
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     height: 5,
//                     bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0",
//                     borderRadius: 3,
//                     overflow: "hidden",
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: `${d.score}%`,
//                       height: "100%",
//                       bgcolor: c.bar,
//                       borderRadius: 3,
//                       transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
//                     }}
//                   />
//                 </Box>
//               </Box>
//             );
//           })}
//         </Box>
//       </Box>
//     );
//   }

//   // ── Total / Open workflow breakdown ──
//   const data = stages.map((s) => ({
//     name: s.stage,
//     count: type === "total" ? s.totalCount : s.openCount,
//   }));
//   const maxVal = Math.max(...data.map((d) => d.count), 1);
//   const total = data.reduce((a, b) => a + b.count, 0) || 1;

//   return (
//     <Box sx={{ ...panelSx(isDark), mb: 1.5, "&::before": { display: "none" } }}>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mb: 2,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box
//             sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: accentColor }}
//           />
//           <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>
//             {type === "total" ? "Total CRQ" : "Open CRQ"} — Workflow Stage
//             Breakdown
//           </Typography>
//         </Box>
//         <Chip
//           label={`${total} across ${data.length} stages`}
//           size="small"
//           sx={{
//             fontSize: 10,
//             fontWeight: 600,
//             bgcolor: `${accentColor}18`,
//             color: accentColor,
//             border: `1px solid ${accentColor}33`,
//             height: 22,
//           }}
//         />
//       </Box>
//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
//           gap: 1.5,
//         }}
//       >
//         {data.map((s) => {
//           const pct = Math.round((s.count / total) * 100);
//           const ratio = s.count / maxVal;
//           const barColor =
//             ratio >= 0.75 ? "#ef4444" : ratio >= 0.5 ? "#f59e0b" : "#3b82f6";
//           const isMax = s.count === maxVal;

//           return (
//             <Box
//               key={s.name}
//               sx={{
//                 background: panelBg,
//                 borderRadius: 2,
//                 p: 1.5,
//                 position: "relative",
//                 border: `1px solid ${
//                   isMax
//                     ? `${barColor}44`
//                     : isDark
//                       ? "rgba(99,130,180,0.12)"
//                       : "#e2e8f0"
//                 }`,
//                 transition: "transform 0.15s ease",
//                 "&:hover": { transform: "translateY(-1px)" },
//               }}
//             >
//               {isMax && (
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     top: 6,
//                     right: 6,
//                     fontSize: 8,
//                     color: "#ef4444",
//                     bgcolor: "rgba(239,68,68,0.12)",
//                     borderRadius: 0.5,
//                     px: 0.6,
//                     py: 0.1,
//                     fontWeight: 700,
//                     letterSpacing: "0.05em",
//                   }}
//                 >
//                   MAX
//                 </Box>
//               )}
//               <Typography
//                 sx={{
//                   fontSize: 10,
//                   color: muted,
//                   mb: 0.8,
//                   lineHeight: 1.4,
//                   pr: isMax ? 4 : 0,
//                 }}
//               >
//                 {s.name}
//               </Typography>
//               <Typography
//                 sx={{
//                   fontSize: 22,
//                   fontWeight: 800,
//                   color: text,
//                   lineHeight: 1,
//                 }}
//               >
//                 {s.count}
//               </Typography>
//               <Typography sx={{ fontSize: 10, color: muted, mb: 1 }}>
//                 {pct}% of total
//               </Typography>
//               <Box
//                 sx={{
//                   height: 4,
//                   bgcolor: isDark ? "rgba(30,41,59,0.8)" : "#e2e8f0",
//                   borderRadius: 2,
//                   overflow: "hidden",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     width: `${pct}%`,
//                     height: "100%",
//                     bgcolor: barColor,
//                     borderRadius: 2,
//                     transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
//                   }}
//                 />
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// // ─── Chart Card wrapper ───────────────────────────────────────────────────────
// interface ChartCardProps {
//   title: string;
//   isDark: boolean;
//   height?: number;
//   isLoading?: boolean;
//   children: React.ReactNode;
// }

// const ChartCard: React.FC<ChartCardProps> = ({
//   title,
//   isDark,
//   height = 185,
//   isLoading,
//   children,
// }) => (
//   <Box sx={panelSx(isDark)}>
//     <Box sx={{ ...sectionTitleSx(isDark), mb: 1.5 }}>{title}</Box>
//     {isLoading ? (
//       <Skeleton
//         variant="rectangular"
//         height={height}
//         sx={{
//           borderRadius: 2,
//           bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
//         }}
//       />
//     ) : (
//       <Box sx={{ height }}>{children}</Box>
//     )}
//   </Box>
// );

// // ─── Custom Tooltip ───────────────────────────────────────────────────────────
// const CustomTooltip = ({
//   active,
//   payload,
//   label,
//   isDark,
// }: {
//   active?: boolean;
//   payload?: Array<{ name: string; value: number; color: string }>;
//   label?: string;
//   isDark: boolean;
// }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <Box
//       sx={{
//         bgcolor: isDark ? "#0d1b2e" : "#fff",
//         border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
//         borderRadius: 2,
//         px: 1.5,
//         py: 1,
//         boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
//         fontSize: 11,
//       }}
//     >
//       {label && (
//         <Typography
//           sx={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", mb: 0.5 }}
//         >
//           {label}
//         </Typography>
//       )}
//       {payload.map((p) => (
//         <Box
//           key={p.name}
//           sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.25 }}
//         >
//           <Box
//             sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }}
//           />
//           <Typography
//             sx={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}
//           >
//             {p.name}:
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: 11,
//               fontWeight: 700,
//               color: isDark ? "#e2e8f0" : "#1e293b",
//             }}
//           >
//             {p.value}
//           </Typography>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// // ─── Filter dropdown config ───────────────────────────────────────────────────
// const FILTER_CONFIGS = [
//   {
//     key: "function",
//     label: "Function",
//     opts: ["All Functions", "SE", "CCB"],
//   },
//   {
//     key: "domain",
//     label: "Domain",
//     opts: [
//       "All Domains",
//       "IP Core",
//       "Optics",
//       "Service Optimisation",
//       "IP Access_CCB",
//       "Service Optimisation ",
//       "Packet",
//       "BRAS",
//       "BRAS_IP",
//       "CEN",
//       "MPLS",
//     ],
//   },
//   {
//     key: "subDomain",
//     label: "Sub-Domain",
//     opts: [
//       "All Sub-Domains",
//       "MPLS-Core",
//       "CEN-Core",
//       "Packet Change_CCB - Packet ECI_CCB",
//       "BRAS Core_CCB",
//     ],
//   },
//   {
//     key: "circle",
//     label: "Circle",
//     opts: ["All Circles", "Gujrat", "Bihar", "Kerala", "Maharashtra"],
//   },
// ] as const;

// type FilterKey = (typeof FILTER_CONFIGS)[number]["key"];
// type FilterState = Record<FilterKey, string>;

// // ─── Main Dashboard Component ─────────────────────────────────────────────────
// const CRQAnalyticsMain: React.FC = () => {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   // ── Filter state ──────────────────────────────────────────────────────────
//   const [startDate, setStartDate] = useState<Dayjs>(() =>
//     dayjs().startOf("month"),
//   );
//   const [endDate, setEndDate] = useState<Dayjs>(() => dayjs().endOf("month"));
//   // const [filters, setFilters] = useState<FilterState>({
//   //   function: "All Functions",
//   //   domain: "All Domains",
//   //   subDomain: "All Sub-Domains",
//   //   circle: "All Circles",
//   // });
//   const [filters, setFilters] = useState<FilterState>({
//     function: "All Functions",
//     domain: "All Domains",
//     subDomain: "All Sub-Domains",
//     circle: "All Circles",
//   });

//   const domainOptions = useMemo(() => {
//     if (filters.function === "All Functions") {
//       return ["All Domains"];
//     }
//     return [
//       "All Domains",
//       ...Object.keys(FUNC_HIERARCHY[filters.function] || {}),
//     ];
//   }, [filters.function]);

//   const subDomainOptions = useMemo(() => {
//     if (filters.domain === "All Domains") {
//       return ["All Sub-Domains"];
//     }

//     if (
//       filters.function !== "All Functions" &&
//       FUNC_HIERARCHY[filters.function]?.[filters.domain]
//     ) {
//       return [
//         "All Sub-Domains",
//         ...FUNC_HIERARCHY[filters.function][filters.domain],
//       ];
//     }

//     return ["All Sub-Domains"];
//   }, [filters.function, filters.domain]);

//   const handleFilterChange = useCallback(
//     (key: FilterKey) => (e: SelectChangeEvent) => {
//       setFilters((prev) => ({ ...prev, [key]: e.target.value }));
//     },
//     [],
//   );

//   const handleFunctionChange = (value: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       function: value,
//       domain: "All Domains",
//       subDomain: "All Sub-Domains",
//     }));
//   };

//   const handleDomainChange = (value: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       domain: value,
//       subDomain: "All Sub-Domains",
//     }));
//   };
//   // ── KPI expand state ──────────────────────────────────────────────────────
//   const [activePanel, setActivePanel] = useState<KpiId | null>(null);
//   const handleCardClick = useCallback((id: KpiId) => {
//     setActivePanel((prev) => (prev === id ? null : id));
//   }, []);

//   // ── API call ──────────────────────────────────────────────────────────────
//   const { data, isFetching, isError } = useGetCRQAnalyticsDashboardQuery({
//     startDate: startDate.format("YYYY-MM-DD"),
//     endDate: endDate.format("YYYY-MM-DD"),
//   });

//   // ── Resolved data (API → mock fallback) ───────────────────────────────────
//   const workflowStages = useMemo<CRQWorkflowStage[]>(
//     () => data?.workflowStages ?? MOCK_STAGES,
//     [data],
//   );
//   const slaDomains = useMemo<CRQSlaDomain[]>(
//     () => data?.slaDomains ?? MOCK_SLA_DOMAINS,
//     [data],
//   );
//   const raisedVsClosed = useMemo<CRQRaisedVsClosed[]>(
//     () => data?.raisedVsClosed ?? MOCK_RAISED,
//     [data],
//   );
//   const bottlenecks = useMemo<CRQBottleneck[]>(
//     () => data?.bottlenecks ?? MOCK_BOTTLENECK,
//     [data],
//   );
//   const domainSlaChart = useMemo<CRQDomainSlaChart[]>(
//     () => data?.domainSlaChart ?? MOCK_DOMAIN_SLA,
//     [data],
//   );
//   const radarCoverage = useMemo<CRQRadarCoverage[]>(
//     () => data?.radarCoverage ?? MOCK_RADAR_COVERAGE,
//     [data],
//   );
//   const domainCrqCount = useMemo<CRQDomainCount[]>(
//     () => data?.domainCrqCount ?? MOCK_DOMAIN_CRQ,
//     [data],
//   );

//   // ── KPI display values ────────────────────────────────────────────────────
//   const kpiValues = useMemo(
//     () => ({
//       total: {
//         value: data?.kpi?.totalCrq ?? 120,
//         sub: "All requests",
//         trend: data?.kpi?.totalTrendPct ?? 8,
//       },
//       open: {
//         value: data?.kpi?.openCrq ?? 48,
//         sub: "In progress",
//         trend: data?.kpi?.openTrendPct ?? -3,
//       },
//       closed: {
//         value: data?.kpi?.closedCrq ?? 62,
//         sub: "Completed",
//         trend: data?.kpi?.closedTrendPct ?? 12,
//       },
//       rejected: {
//         value: data?.kpi?.rejected ?? 10,
//         sub: "Declined",
//         trend: data?.kpi?.rejectedTrendPct ?? -2,
//       },
//       sla: {
//         value: `${data?.kpi?.slaScore ?? 87}%`,
//         sub: "On-time rate",
//         trend: data?.kpi?.slaTrendPct ?? 1.2,
//       },
//     }),
//     [data],
//   );

//   // ── Chart style tokens ────────────────────────────────────────────────────
//   const gridColor = isDark ? "rgba(99,130,180,0.08)" : "#f1f5f9";
//   const tickColor = isDark ? "#475569" : "#94a3b8";
//   const tooltipStyle = {
//     background: isDark ? "#0d1b2e" : "#fff",
//     border: `1px solid ${isDark ? "#1e3a5f" : "#e2e8f0"}`,
//     borderRadius: 8,
//     fontSize: 11,
//     boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
//     padding: "8px 12px",
//   };

//   const text = isDark ? "#e2e8f0" : "#1e293b";
//   const muted = isDark ? "#64748b" : "#94a3b8";

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ pb: 2 }}>
//         {/* ── Filter bar ────────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 1.5,
//             p: { xs: 1.5, md: 1.5 },
//             borderRadius: 2.5,
//             mb: 2,
//             background: isDark
//               ? "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))"
//               : "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.8))",
//             backdropFilter: "blur(16px)",
//             WebkitBackdropFilter: "blur(16px)",
//             border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(226,232,240,0.95)"}`,
//             boxShadow: isDark
//               ? "0 4px 20px rgba(0,0,0,0.3)"
//               : "0 2px 10px rgba(0,0,0,0.06)",
//           }}
//         >
//           {/* Date pickers */}
//           <DatePicker
//             label="Start Date"
//             value={startDate}
//             maxDate={endDate}
//             onChange={(v) => v && setStartDate(v)}
//             slotProps={{
//               textField: {
//                 size: "small",
//                 sx: {
//                   minWidth: 148,
//                   "& .MuiInputBase-root": { height: 32, fontSize: 12 },
//                 },
//               },
//             }}
//           />
//           <DatePicker
//             label="End Date"
//             value={endDate}
//             minDate={startDate}
//             onChange={(v) => v && setEndDate(v)}
//             slotProps={{
//               textField: {
//                 size: "small",
//                 sx: {
//                   minWidth: 148,
//                   "& .MuiInputBase-root": { height: 32, fontSize: 12 },
//                 },
//               },
//             }}
//           />

//           <Divider orientation="vertical" flexItem sx={{ my: 0.5, mx: 0 }} />

//           {/* Dropdowns */}
//           {/* Function */}
//           <Select
//             value={filters.function}
//             onChange={(e) => handleFunctionChange(e.target.value)}
//             sx={{ ...selectSx(isDark), minWidth: 132 }}
//           >
//             {["All Functions", "SE", "CCB"].map((o) => (
//               <MenuItem key={o} value={o}>
//                 {o}
//               </MenuItem>
//             ))}
//           </Select>

//           {/* Domain */}
//           <Select
//             value={filters.domain}
//             onChange={(e) => handleDomainChange(e.target.value)}
//             sx={{ ...selectSx(isDark), minWidth: 132 }}
//           >
//             {domainOptions.map((o) => (
//               <MenuItem key={o} value={o}>
//                 {o}
//               </MenuItem>
//             ))}
//           </Select>

//           {/* SubDomain */}
//           <Select
//             value={filters.subDomain}
//             onChange={(e) =>
//               setFilters((prev) => ({ ...prev, subDomain: e.target.value }))
//             }
//             sx={{ ...selectSx(isDark), minWidth: 132 }}
//           >
//             {subDomainOptions.map((o) => (
//               <MenuItem key={o} value={o}>
//                 {o}
//               </MenuItem>
//             ))}
//           </Select>

//           <FormControl size="small">
//             <Select
//               value={filters.circle}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, circle: e.target.value }))
//               }
//               displayEmpty
//               sx={{ ...selectSx(isDark), minWidth: 132 }}
//             >
//               {CIRCLE_OPTIONS.map((o) => (
//                 <MenuItem key={o} value={o}>
//                   {o}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>

//         {/* ── Error banner ──────────────────────────────────────────────── */}
//         {isError && (
//           <Alert
//             severity="warning"
//             sx={{ mb: 2, fontSize: 12, borderRadius: 2 }}
//           >
//             API unavailable — showing demo data. Connect{" "}
//             <strong>/crq-analytics/dashboard</strong> for live data.
//           </Alert>
//         )}

//         {/* ── KPI Cards ─────────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: {
//               xs: "1fr 1fr",
//               sm: "repeat(3,1fr)",
//               md: "repeat(5,1fr)",
//             },
//             gap: 1.5,
//             mb: 1.5,
//           }}
//         >
//           {KPI_CFG.map((cfg) => {
//             const kv = kpiValues[cfg.id];
//             return (
//               <KPICard
//                 key={cfg.id}
//                 cfg={cfg}
//                 value={isFetching ? "…" : kv.value}
//                 sub={kv.sub}
//                 trend={kv.trend}
//                 isDark={isDark}
//                 isActive={activePanel === cfg.id}
//                 onClick={() => handleCardClick(cfg.id)}
//               />
//             );
//           })}
//         </Box>

//         {/* ── Expandable panel ──────────────────────────────────────────── */}
//         <Collapse in={activePanel !== null} unmountOnExit>
//           {(activePanel === "total" || activePanel === "open") && (
//             <WorkflowExpandPanel
//               type={activePanel}
//               stages={workflowStages}
//               slaDomains={slaDomains}
//               isDark={isDark}
//             />
//           )}
//           {activePanel === "sla" && (
//             <WorkflowExpandPanel
//               type="sla"
//               stages={workflowStages}
//               slaDomains={slaDomains}
//               isDark={isDark}
//             />
//           )}
//         </Collapse>

//         {/* ── Row 1: Area + Bottleneck + Domain SLA ─────────────────────── */}
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
//             gap: 1.5,
//             mb: 1.5,
//           }}
//         >
//           {/* Raised vs Closed */}
//           <ChartCard
//             title="CRQ RAISED VS CLOSED"
//             isDark={isDark}
//             isLoading={isFetching}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart
//                 data={raisedVsClosed}
//                 margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
//               >
//                 <defs>
//                   <linearGradient id="grRaised" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="grClosed" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35} />
//                     <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis
//                   dataKey="label"
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <RTooltip contentStyle={tooltipStyle} />
//                 <Legend
//                   wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
//                   formatter={(v) => (
//                     <span style={{ color: tickColor }}>{v}</span>
//                   )}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="raised"
//                   stroke="#38bdf8"
//                   strokeWidth={2}
//                   fill="url(#grRaised)"
//                   dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }}
//                   activeDot={{ r: 5 }}
//                   name="Raised"
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="closed"
//                   stroke="#4ade80"
//                   strokeWidth={2}
//                   fill="url(#grClosed)"
//                   dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }}
//                   activeDot={{ r: 5 }}
//                   name="Closed"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Bottleneck */}
//           <ChartCard
//             title="BOTTLENECK DETECTION"
//             isDark={isDark}
//             isLoading={isFetching}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={bottlenecks}
//                 layout="vertical"
//                 margin={{ top: 4, right: 24, bottom: 0, left: 0 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke={gridColor}
//                   horizontal={false}
//                 />
//                 <XAxis
//                   type="number"
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                   unit="h"
//                 />
//                 <YAxis
//                   dataKey="stage"
//                   type="category"
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                   width={88}
//                 />
//                 <RTooltip
//                   contentStyle={tooltipStyle}
//                   formatter={(v: number) => [`${v}h`, "Avg Wait"]}
//                 />
//                 <Bar
//                   dataKey="avgWaitHours"
//                   radius={[0, 4, 4, 0]}
//                   maxBarSize={18}
//                 >
//                   {bottlenecks.map((_, i) => (
//                     <Cell
//                       key={i}
//                       fill={
//                         BOTTLENECK_PALETTE[
//                           Math.min(i, BOTTLENECK_PALETTE.length - 1)
//                         ]
//                       }
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Domain SLA */}
//           <ChartCard
//             title="DOMAIN SLA PERFORMANCE"
//             isDark={isDark}
//             isLoading={isFetching}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={domainSlaChart}
//                 margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis
//                   dataKey="domain"
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   domain={[60, 100]}
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                   unit="%"
//                 />
//                 <RTooltip
//                   contentStyle={tooltipStyle}
//                   formatter={(v: number) => [`${v}%`, "SLA Score"]}
//                 />
//                 <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
//                   {domainSlaChart.map((d, i) => (
//                     <Cell key={i} fill={slaColor(d.score).bar} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Row 2: Radar + Domain CRQ count ───────────────────────────── */}
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
//             gap: 1.5,
//           }}
//         >
//           {/* Radar */}
//           <ChartCard
//             title="DOMAIN COVERAGE RADAR"
//             isDark={isDark}
//             height={240}
//             isLoading={isFetching}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <RadarChart
//                 data={radarCoverage}
//                 margin={{ top: 12, right: 24, bottom: 12, left: 24 }}
//               >
//                 <PolarGrid stroke={gridColor} />
//                 <PolarAngleAxis
//                   dataKey="subject"
//                   tick={{ fontSize: 10, fill: tickColor }}
//                 />
//                 <PolarRadiusAxis
//                   angle={90}
//                   domain={[0, 100]}
//                   tick={{ fontSize: 8, fill: tickColor }}
//                   tickCount={4}
//                 />
//                 <Radar
//                   name="Coverage"
//                   dataKey="value"
//                   stroke="#38bdf8"
//                   fill="#38bdf8"
//                   fillOpacity={0.15}
//                   strokeWidth={2}
//                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                   dot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 } as any}
//                 />
//                 <RTooltip contentStyle={tooltipStyle} />
//               </RadarChart>
//             </ResponsiveContainer>
//           </ChartCard>

//           {/* Domain CRQ count */}
//           <ChartCard
//             title="DOMAIN WISE CRQ ANALYSIS"
//             isDark={isDark}
//             height={240}
//             isLoading={isFetching}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={domainCrqCount}
//                 margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                 <XAxis
//                   dataKey="domain"
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fontSize: 9, fill: tickColor }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <RTooltip
//                   contentStyle={tooltipStyle}
//                   formatter={(v: number) => [v, "CRQ Count"]}
//                 />
//                 <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
//                   {domainCrqCount.map((_, i) => (
//                     <Cell
//                       key={i}
//                       fill={DOMAIN_PALETTE[i % DOMAIN_PALETTE.length]}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartCard>
//         </Box>

//         {/* ── Footer ────────────────────────────────────────────────────── */}
//         <Box
//           sx={{
//             mt: 2.5,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Typography sx={{ fontSize: 10, color: muted }}>
//             Filtered:{" "}
//             <Box component="span" sx={{ color: text, fontWeight: 600 }}>
//               {startDate.format("DD MMM YYYY")} →{" "}
//               {endDate.format("DD MMM YYYY")}
//             </Box>
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
//             <Box
//               sx={{
//                 width: 6,
//                 height: 6,
//                 borderRadius: "50%",
//                 bgcolor: data ? "#22c55e" : "#f59e0b",
//               }}
//             />
//             <Typography sx={{ fontSize: 10, color: muted }}>
//               {data ? "Live API data" : "Demo data — API offline"}
//             </Typography>
//           </Box>
//         </Box>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default CRQAnalyticsMain;

// // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// const FUNC_HIERARCHY: Record<string, Record<string, string[]>> = {
//   SE: {
//     "IP Core": ["MPLS-Core", "BRAS-Core", "CEN-Core"],
//     Packet: ["Packet-Change", "Packet_NI"],
//     "Embedded Support": ["All"],
//     "IP Access": ["MPLS-Access", "CEN-Access", "OLT Access"],
//     Optics: ["Network_expansion", "NNI", "OTN/LCD", "Project"],
//     "Service Optimisation": ["All"],
//   },
//   CCB: {
//     "IP Core_CCB": ["MPLS-Core_CCB", "BRAS-Core_CCB", "CEN-Core_CCB"],
//     Packet_CCB: ["Packet-Change_CCB", "Packet_NI_CCB"],
//     "Embedded Support_CCB": ["All"],
//     "IP Access_CCB": ["MPLS-Access_CCB", "CEN-Access_CCB", "OLT Access_CCB"],
//     Optics_CCB: ["Network_expansion_CCB", "Project_CCB"],
//     "Service Optimisation_CCB": ["All"],
//   },
// };

// const CIRCLE_OPTIONS = [
//   "All Circles",
//   "Maharashtra",
//   "Gujarat",
//   "Kerala",
//   "Tamil Nadu",
//   "Karnataka",
//   "Delhi",
//   "Punjab",
//   "Rajasthan",
//   "UP East",
//   "UP West",
//   "Bihar",
//   "Odisha",
//   "West Bengal",
//   "Andhra Pradesh",
//   "Haryana",
// ];
