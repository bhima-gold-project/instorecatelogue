"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Users,
  Smartphone,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Shield,
  KeyRound,
  Mail,
  CheckCircle2,
  X,
  Copy,
  ChevronRight,
  ChevronDown,
  Filter,
  Layers,
  ArrowLeft,
  Phone,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Lock,
  Link2,
  ExternalLink,
  Sparkles,
  Share2
} from "lucide-react";
import Link from "next/link";
import {
  getAllUsers,
  createUserManager,
  updateUserManager,
  deleteUserManager,
  getBranches,
  GenerateMagicLink
} from "@/app/function/action";
import { decodeJwtToken, saveAuthSession } from "@/app/function/authUtils";

interface RoleItem {
  RoleID: number;
  RoleName: string;
}

interface UserItem {
  LoginID: number;
  UserName: string;
  Email?: string;
  MobileNo?: string;
  Branch_Code?: string;
  DeviceID?: string;
  RoleID?: number;
  RoleName?: string;
}

export function MobileAdminContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([
    { RoleID: 1, RoleName: "Admin" },
    { RoleID: 2, RoleName: "User" },
    { RoleID: 3, RoleName: "CPC User" }
  ]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState(
    "Authentication required. You do not have permission to access the User & Device Mapping administration panel without logging in."
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Helper for Role Badges
  const getRoleBadge = (roleName?: string, roleId?: number) => {
    const raw = (roleName || (roleId === 1 ? "Admin" : (roleId === 3 ? "CPC User" : "User"))).trim();
    const lower = raw.toLowerCase();

    if (lower === "admin") {
      return {
        name: "Admin",
        className: "bg-[#1E3354]/10 text-[#1E3354] border border-[#1E3354]/25",
        icon: <Shield className="w-3.5 h-3.5 text-[#1E3354]" />
      };
    }
    if (lower.includes("cpc")) {
      return {
        name: "CPC User",
        className: "bg-amber-50 text-[#8C6B33] border border-amber-300/80",
        icon: <Sparkles className="w-3.5 h-3.5 text-[#8C6B33]" />
      };
    }
    return {
      name: "User",
      className: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      icon: <Users className="w-3.5 h-3.5 text-emerald-700" />
    };
  };

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Magic Link Modal States
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [magicUser, setMagicUser] = useState<UserItem | null>(null);
  const [magicTokenType, setMagicTokenType] = useState<string>("MAGIC_LINK");
  const [magicExpiryMinutes, setMagicExpiryMinutes] = useState<number>(15);
  const [magicRedirect, setMagicRedirect] = useState<string>("/");
  const [generatedMagicResult, setGeneratedMagicResult] = useState<any | null>(null);
  const [isGeneratingMagic, setIsGeneratingMagic] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    UserName: "",
    Password: "",
    Email: "",
    MobileNo: "",
    Branch_Code: "",
    DeviceID: "",
    RoleID: "2"
  });

  const handleOpenMagicModal = (user: UserItem) => {
    setMagicUser(user);
    setMagicTokenType("MAGIC_LINK");
    setMagicExpiryMinutes(15);
    setMagicRedirect("/");
    setGeneratedMagicResult(null);
    setIsMagicModalOpen(true);
  };

  const handleGenerateMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!magicUser) return;

    setIsGeneratingMagic(true);
    try {
      const response = await GenerateMagicLink({
        UserName: magicUser.UserName,
        LoginID: magicUser.LoginID,
        TokenType: magicTokenType,
        ExpiresInMinutes: Number(magicExpiryMinutes),
        TargetRedirect: magicRedirect || "/",
        MobileNo: magicUser.MobileNo,
        CreatedBy: "admin"
      });

      if (response && response.success) {
        setGeneratedMagicResult(response);
        toast.success("Login Token generated successfully!");
      } else {
        toast.error(response?.message || "Failed to generate login token.");
      }
    } catch (err: any) {
      console.error("Login token generation error:", err);
      toast.error(err?.message || "Server error generating login token.");
    } finally {
      setIsGeneratingMagic(false);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, branchData] = await Promise.all([
        getAllUsers(),
        getBranches()
      ]);

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
      if (Array.isArray(branchData)) {
        setBranches(branchData);
      }
    } catch (err: any) {
      console.error("Error loading admin data:", err);
      toast.error("Failed to load users or branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check for token passed in query string (?token=...) or path param (/mobile/admin/[token])
    const queryToken = searchParams?.get("token");
    const pathToken = typeof params?.token === "string" ? params.token : null;
    const incomingToken = queryToken || pathToken;

    if (incomingToken) {
      try {
        let decodedToken = incomingToken;
        try {
          decodedToken = decodeURIComponent(incomingToken);
        } catch {
          decodedToken = incomingToken;
        }
        const decoded = decodeJwtToken(decodedToken);

        if (!decoded) {
          setAccessDenied(true);
          setDeniedMessage("Invalid authentication token format. Access denied.");
          setAuthChecking(false);
          setLoading(false);
          return;
        }

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          setAccessDenied(true);
          setDeniedMessage("Authentication token has expired. Access denied.");
          setAuthChecking(false);
          setLoading(false);
          return;
        }

        // Token is valid! Store token in 'mobile_auth_token' cookie specifically for mobile admin (without affecting main site)
        Cookies.set("mobile_auth_token", decodedToken, { expires: 7, path: "/" });

        setAccessDenied(false);
        setAuthChecking(false);
        fetchData();
        return;
      } catch (err: any) {
        console.error("Mobile admin token auth error:", err);
        setAccessDenied(true);
        setDeniedMessage("Failed to verify access token credentials. Access denied.");
        setAuthChecking(false);
        setLoading(false);
        return;
      }
    }

    // 2. Check existing auth cookies if no token in URL
    const activeToken = Cookies.get("mobile_auth_token") || Cookies.get("auth_token");
    if (!activeToken) {
      setAccessDenied(true);
      setDeniedMessage("Authentication required. You do not have permission to access the User & Device Mapping administration panel without logging in.");
      setAuthChecking(false);
      setLoading(false);
      return;
    }

    // If token exists, verify expiration
    const decoded = decodeJwtToken(activeToken);
    if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
      setAccessDenied(true);
      setDeniedMessage("Your authentication session has expired. Access denied.");
      setAuthChecking(false);
      setLoading(false);
      return;
    }

    setAccessDenied(false);
    setAuthChecking(false);
    fetchData();
  }, [searchParams, params]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.UserName && u.UserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.Email && u.Email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.MobileNo && u.MobileNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.Branch_Code && u.Branch_Code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.DeviceID && u.DeviceID.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.RoleName && u.RoleName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBranch =
        selectedBranchFilter === "ALL" ||
        (u.Branch_Code && u.Branch_Code.toUpperCase() === selectedBranchFilter.toUpperCase());

      const userRoleName = (u.RoleName || (u.RoleID === 1 ? "Admin" : (u.RoleID === 3 ? "CPC User" : "User"))).toLowerCase();
      const matchesRole =
        selectedRoleFilter === "ALL" ||
        String(u.RoleID) === selectedRoleFilter ||
        userRoleName === selectedRoleFilter.toLowerCase();

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [users, searchQuery, selectedBranchFilter, selectedRoleFilter]);

  // Unique branches extracted from users and branch master
  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    branches.forEach((b) => {
      if (b.branch_code && b.branch_code.toUpperCase() !== "ALL") {
        set.add(b.branch_code.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [branches, users]);

  // Branch Combobox Search & Dropdown State
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Filtered Branch suggestions for combobox
  const filteredBranchSuggestions = useMemo(() => {
    if (!branchSearchQuery.trim()) return availableBranches;
    return availableBranches.filter((br) =>
      br.toLowerCase().includes(branchSearchQuery.toLowerCase())
    );
  }, [availableBranches, branchSearchQuery]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      UserName: "",
      Password: "",
      Email: "",
      MobileNo: "",
      Branch_Code: "",
      DeviceID: "",
      RoleID: "2" // Default to User
    });
    setBranchSearchQuery("");
    setIsBranchDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    const fallbackRoleId = user.RoleName === "Admin" ? "1" : (user.RoleName === "CPC User" ? "3" : "2");
    setFormData({
      UserName: user.UserName || "",
      Password: "", // Keep blank unless updating
      Email: user.Email || "",
      MobileNo: user.MobileNo || "",
      Branch_Code: user.Branch_Code || "",
      DeviceID: user.DeviceID || "",
      RoleID: String(user.RoleID || fallbackRoleId)
    });
    setBranchSearchQuery(user.Branch_Code || "");
    setIsBranchDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.UserName.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (!formData.Branch_Code.trim()) {
      toast.error("Please select a Branch Code.");
      return;
    }

    if (!editingUser && !formData.Password.trim()) {
      toast.error("Password is required for new users.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await updateUserManager(editingUser.LoginID, formData);
        if (res && res.message) {
          toast.success(res.message);
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res?.message || "Failed to update user.");
        }
      } else {
        // Create user
        const res = await createUserManager(formData);
        if (res && res.message) {
          toast.success(res.message);
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res?.message || "Failed to create user.");
        }
      }
    } catch (err: any) {
      console.error("Save user error:", err);
      toast.error(err?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDelete = async (user: UserItem) => {
    if (!confirm(`Are you sure you want to delete user "${user.UserName}"?`)) {
      return;
    }

    try {
      const res = await deleteUserManager(user.LoginID);
      if (res && res.message) {
        toast.success(res.message);
        fetchData();
      } else {
        toast.error(res?.message || "Failed to delete user.");
      }
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error("Failed to delete user.");
    }
  };

  // Robust Copy Helper (Supports modern async Clipboard API, HTTP/HTTPS, and fallback textarea)
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string = "Copied to clipboard!") => {
    if (!text) return;

    let success = false;

    // 1. Try modern async Clipboard API if available and in secure context
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn("navigator.clipboard failed, attempting fallback:", err);
      }
    }

    // 2. Fallback: document.execCommand('copy') with invisible textarea
    if (!success && typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-999999px";
        textArea.style.left = "-999999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const res = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (res) success = true;
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }

    if (success) {
      setCopiedText(text);
      toast.success(label);
      setTimeout(() => setCopiedText(null), 2500);
    } else {
      toast.error("Unable to copy to clipboard automatically. Please copy the text manually.");
    }
  };

  // Auth verification check
  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#B8924F] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">Verifying permissions...</span>
        </div>
      </div>
    );
  }

  // Access Denied screen if not logged in
  if (accessDenied) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1] p-4 select-none">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E1D5] p-8 text-center transition-all duration-300">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#2B3E34] text-base font-bold shadow-sm"
              style={{
                background: "conic-gradient(from 180deg, #B8924F, #E9C77B, #8C6B33, #B8924F)"
              }}
            >
              IC
            </span>
            <span className="text-xl font-bold tracking-wide text-[#2A2420]">
              Instore Catalogue
            </span>
          </div>

          {/* Access Denied Icon & Content */}
          <div className="py-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#2A2420] mb-2 font-serif">
              Access Denied
            </h1>

            <p className="text-sm text-[#6B5F55] max-w-xs leading-relaxed mb-2 font-medium">
              {deniedMessage}
            </p>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-[#F0EBE1] text-xs text-[#9E948A] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Admin Gateway</span>
          </div>
        </div>
      </div>
    );
  }

  // Group stats
  const totalUsers = users.length;
  const mappedDeviceUsers = users.filter((u) => u.DeviceID && u.DeviceID.trim()).length;
  const totalBranchCount = availableBranches.length;
  const adminCount = users.filter((u) => u.RoleName?.toLowerCase() === "admin" || u.RoleID === 1).length;
  const cpcCount = users.filter((u) => u.RoleName?.toLowerCase().includes("cpc") || u.RoleID === 3).length;
  const standardUserCount = users.length - adminCount - cpcCount;

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#2A2420] pb-24 selection:bg-amber-100">
      <Toaster position="top-center" richColors duration={2500} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#ECE6DC] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a054] via-[#dec58e] to-[#9c7530] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm hover:scale-105 transition-transform"
            >
              IC
            </Link>
            <div>
              <h1 className="font-serif font-bold text-lg md:text-xl text-[#1E3354] leading-tight">
                User & Device Mapping
              </h1>
              <p className="text-xs text-[#8C6B33] font-medium tracking-wide">
                Branch Multi-User Access Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg text-[#6B5F55] hover:text-[#2B3E34] hover:bg-[#F3EDE2] transition-colors"
              title="Refresh users"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-[#B8924F]" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B3E34] hover:bg-[#3C5448] text-[#F4EFE6] font-medium text-xs md:text-sm transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-[#ECE6DC] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#B8924F]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-[#2A2420]">{totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#ECE6DC] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-[#1E3354]">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider mb-1">
                Roles
              </p>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="bg-[#1E3354]/10 text-[#1E3354] font-bold px-2 py-0.5 rounded text-[11px]">
                  Admin: {adminCount}
                </span>
                <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  User: {standardUserCount}
                </span>
                <span className="bg-amber-50 text-[#8C6B33] font-bold px-2 py-0.5 rounded text-[11px]">
                  CPC: {cpcCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#ECE6DC] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">
                Active Branches
              </p>
              <h3 className="text-2xl font-bold text-[#2A2420]">{totalBranchCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#ECE6DC] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">
                Device Mapped
              </p>
              <h3 className="text-2xl font-bold text-[#2A2420]">{mappedDeviceUsers}</h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-[#ECE6DC] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6B33]" />
            <input
              type="text"
              placeholder="Search username, role, mobile, branch, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-[#E0D8CC] bg-[#FBF7F1]/50 text-sm focus:outline-none focus:border-[#B8924F] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C6B33] hover:text-[#2A2420] transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Container */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Role Filter Dropdown */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <Shield className="w-4 h-4 text-[#8C6B33]" />
              <span className="text-xs font-medium text-[#6B5F55]">Role:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E0D8CC] bg-[#FBF7F1]/50 text-sm font-medium text-[#2A2420] focus:outline-none focus:border-[#B8924F] transition-colors flex-1 md:flex-none"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="Admin">Admin ({adminCount})</option>
                <option value="User">User ({standardUserCount})</option>
                <option value="CPC User">CPC User ({cpcCount})</option>
              </select>
            </div>

            {/* Branch Filter Dropdown */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <Filter className="w-4 h-4 text-[#8C6B33]" />
              <span className="text-xs font-medium text-[#6B5F55]">Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E0D8CC] bg-[#FBF7F1]/50 text-sm font-medium text-[#2A2420] focus:outline-none focus:border-[#B8924F] transition-colors flex-1 md:flex-none"
              >
                <option value="ALL">All Branches ({users.length})</option>
                {availableBranches.map((br) => {
                  const count = users.filter((u) => u.Branch_Code?.toUpperCase() === br).length;
                  return (
                    <option key={br} value={br}>
                      {br}  ({count} {count === 1 ? "user" : "users"})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table / Card Grid */}
        <div className="bg-white rounded-2xl border border-[#ECE6DC] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#ECE6DC] bg-[#FAF6F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#B8924F]" />
              <h2 className="text-sm font-bold text-[#2A2420] uppercase tracking-wider">
                Mapped User Accounts ({filteredUsers.length})
              </h2>
            </div>
            <p className="text-xs text-[#8C6B33] hidden sm:block">
              Multiple users can be registered under a single branch code
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#6B5F55] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#B8924F]" />
              <p className="text-sm font-medium">Loading user mappings...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-[#6B5F55] flex flex-col items-center justify-center gap-2">
              <Users className="w-12 h-12 text-[#B8924F]/50 stroke-[1.5]" />
              <h3 className="text-base font-semibold text-[#2A2420]">No users found</h3>
              <p className="text-xs max-w-sm text-[#8C6B33]">
                {searchQuery || selectedBranchFilter !== "ALL" || selectedRoleFilter !== "ALL"
                  ? "No users match your search/filter criteria. Try changing filters."
                  : "Click 'Create User' above to register your first branch user."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#ECE6DC] text-[11.5px] uppercase tracking-wider text-[#8C6B33] bg-[#FDFBF7]">
                    <th className="py-3.5 px-4 font-semibold">User</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Branch Code</th>
                    <th className="py-3.5 px-4 font-semibold">Mapped Device ID</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Login Token</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EDE4]">
                  {filteredUsers.map((user) => (
                    <tr key={user.LoginID} className="hover:bg-[#FAF6F0]/60 transition-colors">
                      {/* User & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2A2420] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#2B3E34]/10 text-[#2B3E34] font-bold text-xs flex items-center justify-center uppercase">
                            {user.UserName ? user.UserName.slice(0, 2) : "U"}
                          </div>
                          <span>{user.UserName}</span>
                        </div>
                        {user.MobileNo && (
                          <span className="text-xs text-[#2B3E34] flex items-center gap-1 mt-0.5 ml-9 font-medium">
                            <Phone className="w-3 h-3 text-[#B8924F]" />
                            {user.MobileNo}
                          </span>
                        )}
                        {user.Email && (
                          <span className="text-xs text-[#8C6B33] flex items-center gap-1 mt-0.5 ml-9">
                            <Mail className="w-3 h-3" />
                            {user.Email}
                          </span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const badge = getRoleBadge(user.RoleName, user.RoleID);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${badge.className}`}>
                              {badge.icon}
                              <span>{badge.name}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Branch Code */}
                      <td className="py-3.5 px-4">
                        {user.Branch_Code ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 border border-amber-200 text-[#8C6B33]">
                            <Building2 className="w-3.5 h-3.5" />
                            {user.Branch_Code}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Branch</span>
                        )}
                      </td>

                      {/* Device ID */}
                      <td className="py-3.5 px-4">
                        {user.DeviceID && user.DeviceID.trim() ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-[#1E3354] bg-[#F3EDE2] px-2.5 py-1 rounded border border-[#E0D8CC] max-w-[190px] truncate">
                              {user.DeviceID}
                            </span>
                            <button
                              onClick={() => handleCopy(user.DeviceID!)}
                              className="p-1 text-[#8C6B33] hover:text-[#2B3E34] hover:bg-white rounded transition-colors"
                              title="Copy Device ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-amber-600/80 bg-amber-50/60 px-2 py-0.5 rounded border border-dashed border-amber-200">
                            Unrestricted
                          </span>
                        )}
                      </td>

                      {/* Login Token Dedicated Column */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenMagicModal(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-[#B8924F] text-[#8C6B33] hover:text-white border border-amber-200/80 hover:border-[#B8924F] transition-all duration-200 shadow-2xs"
                          title="Generate Login Token for this user"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Generate Token</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-[#2B3E34] hover:bg-[#FAF6F0] hover:text-[#B8924F] rounded-lg transition-colors border border-transparent hover:border-[#ECE6DC]"
                            title="Edit user and device mapping"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8E1D5] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ECE6DC] bg-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2B3E34] text-white flex items-center justify-center text-sm font-bold">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2420]">
                    {editingUser ? `Edit User: ${editingUser.UserName}` : "Create New Branch User"}
                  </h3>
                  <p className="text-xs text-[#8C6B33]">
                    Map credentials and device ID for access control
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C6B33] hover:text-[#2A2420] hover:bg-[#ECE6DC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. branch_staff_1"
                  value={formData.UserName}
                  onChange={(e) => setFormData({ ...formData, UserName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                  Password {editingUser ? "(Leave blank to keep unchanged)" : <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder={editingUser ? "Enter new password if changing" : "Enter password"}
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6B33]" />
                </div>
              </div>

              {/* Mobile Number & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.MobileNo}
                      onChange={(e) => setFormData({ ...formData, MobileNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                    />
                    <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6B33]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="user@store.com"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                    />
                    <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6B33]" />
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                  Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.RoleID}
                    onChange={(e) => setFormData({ ...formData, RoleID: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors cursor-pointer appearance-none pr-9 font-medium text-[#2A2420]"
                  >
                    {roles.map((r) => (
                      <option key={r.RoleID} value={String(r.RoleID)}>
                        {r.RoleName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6B33] pointer-events-none" />
                </div>
              </div>

              {/* Branch Code Mapping (Searchable Dropdown) */}
              <div className="relative">
                <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Branch Code <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-[#8C6B33] font-normal lowercase">(search & select branch)</span>
                </label>

                {/* Input Container */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search or select branch..."
                    value={branchSearchQuery}
                    onFocus={() => setIsBranchDropdownOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setBranchSearchQuery(val);
                      setFormData({ ...formData, Branch_Code: val });
                      setIsBranchDropdownOpen(true);
                    }}
                    className="w-full pl-3.5 pr-16 py-2.5 rounded-lg border border-[#DCD3C6] text-sm font-semibold uppercase focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#8C6B33]">
                    {branchSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setBranchSearchQuery("");
                          setFormData({ ...formData, Branch_Code: "" });
                          setIsBranchDropdownOpen(true);
                        }}
                        className="p-1 hover:text-[#2A2420] transition-colors"
                        title="Clear branch"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
                      className="p-1 hover:text-[#2A2420] transition-colors"
                      title="Toggle branches"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBranchDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isBranchDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsBranchDropdownOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-[#DCD3C6] rounded-xl shadow-xl max-h-48 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150">
                      {filteredBranchSuggestions.length === 0 ? (
                        <div className="px-3.5 py-3 text-xs text-center text-[#8C6B33]">
                          No matching branch found for &ldquo;<span className="font-bold">{branchSearchQuery}</span>&rdquo;
                        </div>
                      ) : (
                        filteredBranchSuggestions.map((br) => {
                          const isSelected = formData.Branch_Code.toUpperCase() === br.toUpperCase();
                          return (
                            <button
                              key={br}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, Branch_Code: br });
                                setBranchSearchQuery(br);
                                setIsBranchDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2 text-left text-xs font-semibold uppercase flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-[#FAF6F0] text-[#B8924F] font-bold"
                                  : "text-[#2A2420] hover:bg-[#FAF6F0]/80"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-[#8C6B33]" />
                                {br}
                              </span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B8924F]" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}

                {/* <p className="text-[11px] text-[#8C6B33] mt-1">
                  Single branch code can have multiple users assigned.
                </p> */}
              </div>

              {/* Device ID Mapping */}
              <div>
                <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Mobile Device ID (Hardware UUID / IMEI)</span>
                  <span className="text-[10px] text-[#8C6B33] font-normal lowercase">(optional restriction)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 4d7f89ab-12cd-34ef-5678-90abcdef1234"
                    value={formData.DeviceID}
                    onChange={(e) => setFormData({ ...formData, DeviceID: e.target.value.trim() })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD3C6] text-sm font-mono focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                  />
                  <Smartphone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6B33]" />
                </div>
                <p className="text-[11px] text-[#8C6B33] mt-1">
                  When set, this user will only be permitted to log in from this specific mobile device.
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ECE6DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#DCD3C6] text-[#6B5F55] hover:bg-[#FAF6F0] font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-[#2B3E34] hover:bg-[#3C5448] text-[#F4EFE6] font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{editingUser ? "Save Changes" : "Create User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Magic Link / Kiosk URL Generation Modal */}
      {isMagicModalOpen && magicUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8E1D5] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ECE6DC] bg-[#FAF6F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B8924F] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2420]">
                    Generate Login Token
                  </h3>
                  <p className="text-xs text-[#8C6B33]">
                    Generate direct tokenized login URL for {magicUser.UserName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMagicModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C6B33] hover:text-[#2A2420] hover:bg-[#ECE6DC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0]/80 border border-[#ECE6DC] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#2A2420] flex items-center gap-2">
                    <span>{magicUser.UserName}</span>
                    {magicUser.Branch_Code && (
                      <span className="text-[11px] font-medium text-[#8C6B33] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {magicUser.Branch_Code}
                      </span>
                    )}
                  </div>
                  {magicUser.MobileNo && (
                    <div className="text-xs text-[#6B5F55] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#B8924F]" />
                      <span>{magicUser.MobileNo}</span>
                    </div>
                  )}
                </div>
                {(() => {
                  const badge = getRoleBadge(magicUser.RoleName, magicUser.RoleID);
                  return (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                      {badge.icon}
                      <span>{badge.name}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Form Controls */}
              <div className="space-y-3">
                {/* Use Case / Token Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                    Token Type / Scenario
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMagicTokenType("MAGIC_LINK");
                        setMagicExpiryMinutes(15);
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                        magicTokenType === "MAGIC_LINK"
                          ? "border-[#B8924F] bg-[#FAF6F0] text-[#8C6B33] font-bold shadow-sm"
                          : "border-[#DCD3C6] text-[#6B5F55] hover:bg-[#FAF6F0]/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <KeyRound className="w-3.5 h-3.5 text-[#B8924F]" />
                        <span>Direct Token</span>
                      </div>
                      <p className="text-[10px] text-[#8C6B33] font-normal">Quick login</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMagicTokenType("KIOSK");
                        setMagicExpiryMinutes(1440); // 24 hours
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                        magicTokenType === "KIOSK"
                          ? "border-[#B8924F] bg-[#FAF6F0] text-[#8C6B33] font-bold shadow-sm"
                          : "border-[#DCD3C6] text-[#6B5F55] hover:bg-[#FAF6F0]/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Smartphone className="w-3.5 h-3.5 text-[#B8924F]" />
                        <span>Kiosk Tablet</span>
                      </div>
                      <p className="text-[10px] text-[#8C6B33] font-normal">In-store displays</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMagicTokenType("WHATSAPP_LINK");
                        setMagicExpiryMinutes(60);
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                        magicTokenType === "WHATSAPP_LINK"
                          ? "border-[#B8924F] bg-[#FAF6F0] text-[#8C6B33] font-bold shadow-sm"
                          : "border-[#DCD3C6] text-[#6B5F55] hover:bg-[#FAF6F0]/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Share2 className="w-3.5 h-3.5 text-[#B8924F]" />
                        <span>WhatsApp / SMS</span>
                      </div>
                      <p className="text-[10px] text-[#8C6B33] font-normal">Customer share</p>
                    </button>
                  </div>

                  {/* Tablet Device Binding Notice */}
                  {magicTokenType === "KIOSK" && (
                    <div className="mt-2.5">
                      {magicUser.DeviceID && magicUser.DeviceID.trim() ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Hardware Device Lock Active:</span>{" "}
                            This tablet token will strictly verify that the device hardware matches{" "}
                            <span className="font-mono font-bold bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">{magicUser.DeviceID}</span>.
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">No Device ID Mapped:</span>{" "}
                            User has no registered Device ID. Tablet login will fail unless you assign a Device ID in the Edit User dialog first.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Expiration */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                      Token Expiration
                    </label>
                    <select
                      value={magicExpiryMinutes}
                      onChange={(e) => setMagicExpiryMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#DCD3C6] text-xs font-medium text-[#2A2420] focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={360}>6 Hours</option>
                      <option value={1440}>24 Hours (1 Day)</option>
                      <option value={10080}>7 Days (1 Week)</option>
                      <option value={43200}>30 Days (1 Month)</option>
                    </select>
                  </div>

                  {/* Target Redirect */}
                  {/* <div>
                    <label className="block text-xs font-semibold text-[#6B5F55] uppercase tracking-wider mb-1.5">
                      Landing Page
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. / or /newcart"
                      value={magicRedirect}
                      onChange={(e) => setMagicRedirect(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DCD3C6] text-xs font-medium text-[#2A2420] focus:outline-none focus:border-[#B8924F] bg-[#FAF6F0]/40 transition-colors"
                    />
                  </div> */}
                </div>
              </div>

              {/* Generate Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleGenerateMagicLink()}
                  disabled={isGeneratingMagic}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2B3E34] hover:bg-[#3C5448] text-[#F4EFE6] font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {isGeneratingMagic ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B8924F]" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-[#B8924F]" />
                  )}
                  <span>{generatedMagicResult ? "Re-generate Login Token" : "Generate Login Token"}</span>
                </button>
              </div>

              {/* Generated Result Card */}
              {generatedMagicResult && generatedMagicResult.magicUrl && (
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#B8924F]/30 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C6B33] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Login Token URL Ready
                    </span>
                    <span className="text-[10px] text-[#6B5F55]">
                      Expires in {generatedMagicResult.expiresInMinutes || magicExpiryMinutes} mins
                    </span>
                  </div>

                  {/* URL Box */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedMagicResult.magicUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#DCD3C6] text-xs font-mono bg-white text-[#2A2420] focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedMagicResult.magicUrl, "Magic Login Link copied to clipboard!")}
                      className={`px-3 py-2 border rounded-lg transition-all flex items-center gap-1.5 shadow-sm text-xs font-semibold ${
                        copiedText === generatedMagicResult.magicUrl
                          ? "bg-emerald-600 border-emerald-600 text-white font-bold"
                          : "bg-white border-[#DCD3C6] hover:border-[#B8924F] text-[#8C6B33] hover:text-[#2B3E34]"
                      }`}
                      title="Copy URL"
                    >
                      {copiedText === generatedMagicResult.magicUrl ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Link Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={generatedMagicResult.magicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-white border border-[#DCD3C6] hover:bg-[#FAF6F0] rounded-lg text-xs font-medium text-[#2A2420] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#B8924F]" />
                      <span>Test in New Tab</span>
                    </a>

                    {magicUser.MobileNo && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${magicUser.MobileNo.replace(/\D/g, "")}&text=${encodeURIComponent(
                          `Here is your direct login link to In-Store Catalogue: ${generatedMagicResult.magicUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Send WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#ECE6DC] bg-[#FAF6F0] flex items-center justify-between">
              <span className="text-[11px] text-[#6B5F55] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#B8924F]" />
                Single-use cryptographically signed link
              </span>
              <button
                type="button"
                onClick={() => setIsMagicModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-[#DCD3C6] text-[#6B5F55] hover:bg-white text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MobileAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF7F1]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-[#B8924F] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-[#8C6B33] uppercase tracking-wider">Loading...</span>
          </div>
        </div>
      }
    >
      <MobileAdminContent />
    </Suspense>
  );
}

