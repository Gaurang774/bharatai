"use client";

import React, { useState, useEffect } from "react";
import { policyApi } from "@/lib/api";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  FlaskConical,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const ACTIONS = ["BLOCK", "REDACT", "FLAG", "WARN"];
const MINISTRIES = ["ALL", "General", "Finance", "Defense", "Health", "Law", "Education", "Infrastructure"];

// FastAPI can return detail as a string OR an array of Pydantic validation objects
const parseApiError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (!detail) return "An unexpected error occurred.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d?.msg || JSON.stringify(d)).join(", ");
  return JSON.stringify(detail);
};


interface PolicyRule {
  id: number;
  name: string;
  pattern: string;
  action: "BLOCK" | "REDACT" | "FLAG" | "WARN";
  is_regex: boolean;
  clearance_required: number;
  ministry_scope: string;
  is_active: boolean;
}

const ACTION_COLORS: Record<string, string> = {
  BLOCK: "text-red-400 border-red-500/20 bg-red-500/5",
  REDACT: "text-orange-400 border-orange-500/20 bg-orange-500/5",
  FLAG: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
  WARN: "text-blue-400 border-blue-500/20 bg-blue-500/5",
};

const EMPTY_RULE = {
  name: "", pattern: "", action: "BLOCK", is_regex: false,
  clearance_required: 1, ministry_scope: "ALL", is_active: true
};

export const PolicyRulesPanel = () => {
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState<any>(EMPTY_RULE);
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await policyApi.getRules();
      // Guard: ensure we always set an array (API may return object or null)
      const data = res.data;
      setRules(Array.isArray(data) ? data : Array.isArray(data?.rules) ? data.rules : []);
    } catch {
      toast.error("Failed to fetch policy rules.");
      setRules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleCreate = async () => {
    if (!newRule.name || !newRule.pattern) return toast.error("Name and pattern required.");
    try {
      await policyApi.createRule(newRule);
      toast.success("Rule created.");
      setShowAdd(false);
      setNewRule(EMPTY_RULE);
      fetchRules();
    } catch (err: any) {
      toast.error(parseApiError(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this policy rule?")) return;
    try {
      await policyApi.deleteRule(id);
      toast.success("Rule deleted.");
      fetchRules();
    } catch {
      toast.error("Failed to delete rule.");
    }
  };

  const handleToggleActive = async (rule: PolicyRule) => {
    try {
      await policyApi.updateRule(rule.id, { ...rule, is_active: !rule.is_active });
      fetchRules();
    } catch {
      toast.error("Failed to update rule.");
    }
  };

  const handleTest = async () => {
    if (!testQuery) return toast.error("Enter a test query.");
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await policyApi.testRule({ query: testQuery, ministry: "Finance", clearance_level: 5 });
      setTestResult(res.data);
    } catch (err: any) {
      toast.error(parseApiError(err));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f5f5f5]">
          <Shield className="h-4 w-4 text-[#f59e0b]" />
          Policy Rules Engine ({rules.length} rules)
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </button>
      </div>

      {/* Add Rule Form */}
      {showAdd && (
        <div className="rounded-2xl border border-[#f59e0b]/20 bg-[#0e0e0e] p-5 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">New Rule</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Rule Name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-[#f5f5f5] placeholder-[#444] focus:border-[#f59e0b]/50 focus:outline-none"
            />
            <input
              placeholder="Pattern (keyword or regex)"
              value={newRule.pattern}
              onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
              className="rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-[#f5f5f5] placeholder-[#444] focus:border-[#f59e0b]/50 focus:outline-none"
            />
            <select
              value={newRule.action}
              onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
              className="rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-[#f5f5f5] focus:outline-none"
            >
              {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={newRule.ministry_scope}
              onChange={(e) => setNewRule({ ...newRule, ministry_scope: e.target.value })}
              className="rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-[#f5f5f5] focus:outline-none"
            >
              {MINISTRIES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#525252]">
                Min Clearance:
              </label>
              <input
                type="number"
                min={1} max={5}
                value={newRule.clearance_required}
                onChange={(e) => setNewRule({ ...newRule, clearance_required: parseInt(e.target.value) })}
                className="w-16 rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#525252]">
              <input
                type="checkbox"
                checked={newRule.is_regex}
                onChange={(e) => setNewRule({ ...newRule, is_regex: e.target.checked })}
                className="accent-[#f59e0b]"
              />
              Regex Pattern
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/10 transition-all"
            >
              <Check className="h-3 w-3" /> Save Rule
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewRule(EMPTY_RULE); }}
              className="flex items-center gap-1 rounded-lg border border-[#222] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#525252] hover:text-[#a3a3a3] transition-all"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#f59e0b]" />
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] px-4 py-3 transition-colors",
                !rule.is_active && "opacity-40"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-[#f5f5f5]">{rule.name}</span>
                  {rule.is_regex && (
                    <span className="rounded border border-[#222] px-1.5 py-px text-[8px] font-black uppercase tracking-widest text-[#525252]">
                      REGEX
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[9px] text-[#444]">
                  "{rule.pattern}" · Scope: {rule.ministry_scope} · Min Clearance: {rule.clearance_required}
                </p>
              </div>

              <span className={cn("shrink-0 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest", ACTION_COLORS[rule.action])}>
                {rule.action}
              </span>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleToggleActive(rule)}
                  title={rule.is_active ? "Deactivate" : "Activate"}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase transition-all",
                    rule.is_active
                      ? "border-green-500/20 bg-green-500/5 text-green-400 hover:bg-green-500/10"
                      : "border-[#222] text-[#525252] hover:text-[#a3a3a3]"
                  )}
                >
                  {rule.is_active ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="rounded-lg border border-red-500/10 p-1.5 text-red-500/40 hover:text-red-500 hover:border-red-500/30 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {rules.length === 0 && !isLoading && (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-[#222] text-[10px] font-black uppercase tracking-widest text-[#333]">
              No rules configured
            </div>
          )}
        </div>
      )}

      {/* Policy Sandbox Tester */}
      <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#f5f5f5]">
          <FlaskConical className="h-4 w-4 text-[#f59e0b]" />
          Rule Sandbox
        </h3>
        <div className="flex gap-2">
          <input
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter a test prompt to evaluate against all rules…"
            className="flex-1 rounded-lg border border-[#222] bg-[#111] px-3 py-2.5 text-xs text-[#f5f5f5] placeholder-[#444] focus:border-[#f59e0b]/50 focus:outline-none"
          />
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-all disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            Test
          </button>
        </div>

        {testResult && (
          <div className={cn(
            "mt-4 rounded-xl border p-4 font-mono text-xs",
            testResult.action === "BLOCK" ? "border-red-500/20 bg-red-500/5 text-red-400"
            : testResult.action === "REDACT" ? "border-orange-500/20 bg-orange-500/5 text-orange-400"
            : testResult.action === "FLAG" ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
            : "border-green-500/20 bg-green-500/5 text-green-400"
          )}>
            <div className="mb-2 font-black">Decision: {testResult.action ?? "ALLOW"}</div>
            {testResult.reason && <p className="text-[10px] opacity-70">{testResult.reason}</p>}
            {testResult.redacted_query && (
              <p className="mt-1 text-[10px] opacity-70">Redacted: {testResult.redacted_query}</p>
            )}
            {testResult.triggered_rules?.length > 0 && (
              <p className="mt-1 text-[10px] opacity-70">
                Triggered: {testResult.triggered_rules.map((r: any) => r.name || r).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
