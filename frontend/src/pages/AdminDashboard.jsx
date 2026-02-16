import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Users,
  CreditCard,
  IndianRupee,
  TrendingUp,
  FileText,
  Linkedin,
  FileCheck,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Lock,
  Loader2,
  UserPlus,
  UserCheck,
  Filter
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  
  const labels = {
    completed: "Paid",
    pending: "Pending",
    failed: "Failed"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

// Lead type badge
const LeadTypeBadge = ({ type }) => {
  if (type === "repeat") {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
        🔄 Repeat
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
      🆕 New
    </span>
  );
};

// Metric card component
const MetricCard = ({ icon: Icon, label, value, subtext, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0A0A0F] border border-white/10 rounded-xl p-5 hover:border-primary/30 transition-colors"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">{label}</p>
        <p className="text-3xl font-mono font-medium text-white">{value}</p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1 text-emerald-400 text-xs">
        <TrendingUp className="w-3 h-3" />
        <span>{trend}</span>
      </div>
    )}
  </motion.div>
);

// File viewer modal
const FileViewerModal = ({ isOpen, onClose, title, content, type }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0A0A0F] border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(80vh-60px)]">
            {type === "text" ? (
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">{content}</pre>
            ) : (
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                {JSON.stringify(content, null, 2)}
              </pre>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Login screen
const LoginScreen = ({ onLogin, isLoading }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await onLogin(password);
    if (!success) {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">CareerIQ Admin</h1>
          <p className="text-zinc-500 text-sm">Enter password to access dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pl-10 bg-white/5 border-white/10 h-11"
                data-testid="admin-password-input"
              />
            </div>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-primary hover:bg-primary/90 h-11"
            data-testid="admin-login-btn"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Access Dashboard"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [utmSources, setUtmSources] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [utmFilter, setUtmFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [viewerModal, setViewerModal] = useState({ isOpen: false, title: "", content: "", type: "text" });
  
  // Auto-refresh
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleLogin = async (pwd) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/admin/login`, { password: pwd });
      setPassword(pwd);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    if (!password) return;
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats?password=${encodeURIComponent(password)}`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [password]);

  const fetchLeads = useCallback(async () => {
    if (!password) return;
    try {
      const params = new URLSearchParams({
        password,
        page: currentPage.toString(),
        limit: "15"
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (utmFilter !== "all") params.append("utm_source", utmFilter);
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await axios.get(`${API_URL}/api/admin/leads?${params.toString()}`);
      setLeads(res.data.leads);
      setTotalLeads(res.data.total);
      setTotalPages(res.data.total_pages);
      setUtmSources(res.data.utm_sources || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  }, [password, currentPage, statusFilter, utmFilter, searchQuery]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchLeads()]);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  const handleExport = () => {
    window.open(`${API_URL}/api/admin/export?password=${encodeURIComponent(password)}`, "_blank");
  };

  const handleViewFile = async (sessionId, fileType, title) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/view-file/${sessionId}/${fileType}?password=${encodeURIComponent(password)}`
      );
      setViewerModal({
        isOpen: true,
        title,
        content: res.data.content,
        type: res.data.type
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to load file");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchLeads();
    }
  }, [isAuthenticated, fetchStats, fetchLeads]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return "—";
    // Format: +91 98765 43210
    return phone.replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2 $3");
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">CareerIQ Admin</h1>
            <p className="text-xs text-zinc-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-white/10 hover:bg-white/5"
              data-testid="export-csv-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-white/10 hover:bg-white/5"
              data-testid="refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Users}
              label="Total Leads"
              value={stats.total_leads}
              subtext={`${stats.unique_leads} unique, ${stats.repeat_leads} repeat`}
            />
            <MetricCard
              icon={CreditCard}
              label="Paid Users"
              value={stats.paid_users}
              subtext={`${stats.reports_generated} reports generated`}
            />
            <MetricCard
              icon={IndianRupee}
              label="Revenue"
              value={`₹${stats.revenue.toLocaleString()}`}
              subtext="Total collected"
            />
            <MetricCard
              icon={TrendingUp}
              label="Conversion"
              value={`${stats.conversion_rate}%`}
              subtext="Lead to paid"
            />
          </div>
        )}

        {/* Funnel Stats */}
        {stats?.funnel && (
          <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Funnel Overview</h3>
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
              <div className="text-center min-w-[100px]">
                <p className="text-2xl font-mono text-white">{stats.funnel.uploaded}</p>
                <p className="text-xs text-zinc-500">Uploaded</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
              <div className="text-center min-w-[100px]">
                <p className="text-2xl font-mono text-white">{stats.funnel.payment_initiated}</p>
                <p className="text-xs text-zinc-500">Payment Init</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
              <div className="text-center min-w-[100px]">
                <p className="text-2xl font-mono text-emerald-400">{stats.funnel.paid}</p>
                <p className="text-xs text-zinc-500">Paid</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
              <div className="text-center min-w-[100px]">
                <p className="text-2xl font-mono text-primary">{stats.funnel.reports}</p>
                <p className="text-xs text-zinc-500">Reports</p>
              </div>
            </div>
          </div>
        )}

        {/* UTM Performance */}
        {stats?.utm_breakdown && Object.keys(stats.utm_breakdown).length > 0 && (
          <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">UTM Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.utm_breakdown).map(([source, data]) => (
                <div key={source} className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 uppercase">{source}</p>
                  <p className="text-lg font-mono text-white">{data.leads} <span className="text-xs text-zinc-500">leads</span></p>
                  <p className="text-sm text-emerald-400">{data.paid} paid • ₹{data.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0A0A0F] border border-white/10 rounded-xl p-4">
          <Filter className="w-4 h-4 text-zinc-500" />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={utmFilter} onValueChange={setUtmFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-9">
              <SelectValue placeholder="UTM Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {utmSources.map((source) => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search phone or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 h-9"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-[#0A0A0F] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-xs uppercase text-zinc-500 font-semibold">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Target Role</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Lead Type</th>
                  <th className="py-3 px-4 text-center">Resume</th>
                  <th className="py-3 px-4 text-center">LinkedIn</th>
                  <th className="py-3 px-4 text-center">Report</th>
                  <th className="py-3 px-4 text-left">UTM Source</th>
                  <th className="py-3 px-4 text-left">LP Ver</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr 
                    key={lead.session_id || idx} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-zinc-400 text-xs whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="py-3 px-4 text-white font-mono text-xs">
                      {formatPhone(lead.mobile_number)}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-[150px] truncate">
                      {lead.target_role || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lead.payment_status} />
                    </td>
                    <td className="py-3 px-4">
                      <LeadTypeBadge type={lead.lead_type} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lead.has_resume ? (
                        <button
                          onClick={() => handleViewFile(lead.session_id, "resume", "Resume")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-primary"
                          title="View Resume"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lead.has_linkedin ? (
                        <button
                          onClick={() => handleViewFile(lead.session_id, "linkedin", "LinkedIn")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400"
                          title="View LinkedIn"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lead.has_report ? (
                        <button
                          onClick={() => handleViewFile(lead.session_id, "report", "Report")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-xs">
                      {lead.utm_source || "direct"}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-xs">
                      {lead.lp_version}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-zinc-500">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-zinc-500">
              Showing {leads.length} of {totalLeads} leads
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-white/10 hover:bg-white/5 h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-white/10 hover:bg-white/5 h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
        title={viewerModal.title}
        content={viewerModal.content}
        type={viewerModal.type}
      />
    </div>
  );
}
