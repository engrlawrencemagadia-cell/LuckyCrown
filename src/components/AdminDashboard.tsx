/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building, Sofa, Hammer, HelpCircle, Lock, UserPlus, LogOut, Loader2, Plus, Edit, Trash, 
  CheckCircle2, FolderHeart, Calendar, MapPin, User, DollarSign, Eye, EyeOff, Sparkles, MessageSquare, AlertCircle,
  Users, Trash2
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage.tsx";
import { Product, Service, Project, FAQ, DashboardStats } from "../types.ts";

interface AdminDashboardProps {
  onLoginStateChange: (loggedIn: boolean) => void;
}

export default function AdminDashboard({ onLoginStateChange }: AdminDashboardProps) {
  // Session states
  const [token, setToken] = useState<string | null>(localStorage.getItem("lcct_admin_token"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("lcct_admin_username"));
  const [isLoginView, setIsLoginView] = useState<boolean>(true); // Toggle to admin signup tab
  
  // Login/Signup form states
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupUser, setSignupUser] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // OTP states
  const [requiresOtp, setRequiresOtp] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  // Dev sandbox approval states
  const [signupDevApproval, setSignupDevApproval] = useState<string | null>(null);
  const [signupDevRejection, setSignupDevRejection] = useState<string | null>(null);

  // Core administrative layout tab
  const [adminTab, setAdminTab] = useState<"dashboard" | "products" | "services" | "projects" | "faqs" | "admins">("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Admin Management inside the dashboard states
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminError, setNewAdminError] = useState<string | null>(null);
  const [newAdminSuccess, setNewAdminSuccess] = useState<string | null>(null);
  const [newAdminSubmitting, setNewAdminSubmitting] = useState(false);
  const [deleteAdminConfirmId, setDeleteAdminConfirmId] = useState<number | null>(null);

  // Entities catalogs (fetched separately or from stats)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allFaqs, setAllFaqs] = useState<FAQ[]>([]);

  // Modals forms overlay controllers
  const [productModal, setProductModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: Product | null }>({ open: false, mode: "add" });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: Service | null }>({ open: false, mode: "add" });
  const [projectModal, setProjectModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: Project | null }>({ open: false, mode: "add" });
  const [faqModal, setFaqModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: FAQ | null }>({ open: false, mode: "add text" });

  // Add/Edit Form states with image uploads
  const [productForm, setProductForm] = useState({ name: "", category: "Office & Residential Furniture", description: "", specifications: "", price: "0", availability: "In Stock", images: [] as string[] });
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", pricing: "Contact for Estimate", availability: "Active", images: [] as string[] });
  const [projectForm, setProjectForm] = useState({ name: "", client: "", location: "", date: "", description: "", images: [] as string[] });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [crudLoading, setCrudLoading] = useState(false);

  // Custom dialogs & notification states
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: "product" | "service" | "project" | "faq"; title: string } | null>(null);
  const [customNotification, setCustomNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setCustomNotification({ text, type });
    // Auto-dismiss toast
    setTimeout(() => {
      setCustomNotification(prev => prev?.text === text ? null : prev);
    }, 4500);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    setCrudLoading(true);
    try {
      let endpoint = `/api/admin/products/${id}`;
      if (type === "service") endpoint = `/api/admin/services/${id}`;
      if (type === "project") endpoint = `/api/admin/projects/${id}`;
      if (type === "faq") endpoint = `/api/admin/faqs/${id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, "success");
        loadDashboardStats();
      } else {
        const err = await res.json();
        showToast(err.error || `Failed to delete ${type}.`, "error");
      }
    } catch {
      showToast(`Database error deleting ${type}.`, "error");
    } finally {
      setCrudLoading(false);
      setDeleteConfirm(null);
    }
  };

  // ----------------------------------------------------
  // SESSION VALIDATE & AUTO RETRIEVE DATA
  // ----------------------------------------------------
  useEffect(() => {
    if (token) {
      validateSession();
    } else {
      setDashboardLoading(false);
    }
  }, [token]);

  const validateSession = async () => {
    try {
      const res = await fetch("/api/admin/session", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        onLoginStateChange(true);
        loadDashboardStats();
      } else {
        handleLogoutClean();
      }
    } catch {
      handleLogoutClean();
    }
  };

  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      // 1. Stats and recently added
      const res = await fetch("/api/admin/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);

      // 2. Load lists fully for Crud manager tables
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      setAllProducts(prodData);

      const svcRes = await fetch("/api/services");
      const svcData = await svcRes.json();
      setAllServices(svcData);

      const projRes = await fetch("/api/projects");
      const projData = await projRes.json();
      setAllProjects(projData);

      const faqRes = await fetch("/api/faqs");
      const faqData = await faqRes.json();
      setAllFaqs(faqData);

      // 3. Fetch admin accounts safely
      if (token) {
        const adminRes = await fetch("/api/admin/accounts", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setAllAdmins(adminData);
        }
      }



    } catch (err) {
      console.error("Dashboard datasync error", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleLogoutClean = () => {
    fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    }).catch(() => {});
    
    localStorage.removeItem("lcct_admin_token");
    localStorage.removeItem("lcct_admin_username");
    setToken(null);
    setUsername(null);
    onLoginStateChange(false);
  };

  // ----------------------------------------------------
  // LOGIN / SIGNUP CONTROLLER ACTIONS
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!loginUser || !loginPass) return;

    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(textResponse || "Non-JSON response received.");
      }

      if (response.ok) {
        if (data.requiresOtp) {
          setRequiresOtp(true);
          setOtpEmail(data.email);
          setDevOtp(data.devOtp || null);
          setAuthSuccess(data.message);
        } else {
          localStorage.setItem("lcct_admin_token", data.token);
          localStorage.setItem("lcct_admin_username", data.username);
          setToken(data.token);
          setUsername(data.username);
          onLoginStateChange(true);
        }
      } else {
        setAuthError(data.error || "Incorrect login credentials.");
      }
    } catch (err: any) {
      if (err && err.message && (err.message.includes("<!DOCTYPE") || err.message.includes("<html"))) {
        setAuthError("Failed to communicate with authorization server: Server returned HTML (possible 504 Gateway Timeout or 502 Bad Gateway). Please verify your SMTP settings in your Render dashboard environment variables.");
      } else if (err && err.message) {
        setAuthError(`Failed to communicate with authorization server: ${err.message}`);
      } else {
        setAuthError("Failed to communicate with authorization server.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!otpCode) return;

    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, otpCode })
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(textResponse || "Non-JSON response received.");
      }

      if (response.ok) {
        localStorage.setItem("lcct_admin_token", data.token);
        localStorage.setItem("lcct_admin_username", data.username);
        setToken(data.token);
        setUsername(data.username);
        onLoginStateChange(true);
        // Clear OTP states
        setRequiresOtp(false);
        setOtpCode("");
        setDevOtp(null);
      } else {
        setAuthError(data.error || "Incorrect OTP code.");
      }
    } catch (err: any) {
      if (err && err.message && (err.message.includes("<!DOCTYPE") || err.message.includes("<html"))) {
        setAuthError("Failed to verify OTP with authorization server: Server returned HTML (possible 504 Gateway Timeout or 502 Bad Gateway). Please verify your SMTP settings in your Render dashboard environment variables.");
      } else if (err && err.message) {
        setAuthError(`Failed to verify OTP with authorization server: ${err.message}`);
      } else {
        setAuthError("Failed to verify OTP with authorization server.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminError(null);
    setNewAdminSuccess(null);
    if (!newAdminUser || !newAdminPass || !newAdminEmail) return;

    setNewAdminSubmitting(true);
    try {
      const response = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username: newAdminUser, password: newAdminPass, email: newAdminEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setNewAdminSuccess(data.message || "Administrator registered successfully!");
        setNewAdminUser("");
        setNewAdminPass("");
        setNewAdminEmail("");
        // Reload admins list immediately
        loadDashboardStats();
      } else {
        setNewAdminError(data.error || "Failed to create administrator account.");
      }
    } catch (err: any) {
      setNewAdminError("Connection error creating account.");
    } finally {
      setNewAdminSubmitting(false);
    }
  };

  const handleRevokeAdmin = async (adminId: number) => {
    try {
      const res = await fetch(`/api/admin/accounts/${adminId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Administrator account successfully revoked.", "success");
        setDeleteAdminConfirmId(null);
        loadDashboardStats();
      } else {
        showToast(data.error || "Failed to revoke admin account.", "error");
      }
    } catch {
      showToast("Connection error while revoking admin account.", "error");
    }
  };

  // ----------------------------------------------------
  // FILE ATTACHMENTS BASE64 ENCODER
  // ----------------------------------------------------
  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>, targetFormSetter: any) => {
    const files = e.target.files;
    if (!files) return;

    const promises = Array.from(files).map((f: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(f);
      });
    });

    Promise.all(promises).then((base64Strings) => {
      targetFormSetter((prev: any) => ({
        ...prev,
        images: [...prev.images, ...base64Strings]
      }));
    });
  };

  // ----------------------------------------------------
  // CRUD ENGINE: CRUD ENTITIES CONTROLLERS
  // ----------------------------------------------------

  // PRODUCTS SUBMISSIONS
  const openProductForm = (mode: "add" | "edit", item?: Product | null) => {
    if (mode === "edit" && item) {
      setProductForm({
        name: item.name,
        category: item.category,
        description: item.description,
        specifications: item.specifications || "",
        price: String(item.price),
        availability: item.availability,
        images: item.images || []
      });
      setProductModal({ open: true, mode: "edit", data: item });
    } else {
      setProductForm({ name: "", category: "Office & Residential Furniture", description: "", specifications: "", price: "0", availability: "In Stock", images: [] });
      setProductModal({ open: true, mode: "add", data: null });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudLoading(true);
    try {
      const url = productModal.mode === "edit" ? `/api/admin/products/${productModal.data?.id}` : "/api/admin/products";
      const method = productModal.mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      
      if (res.ok) {
        setProductModal({ open: false, mode: "add" });
        loadDashboardStats();
      } else {
        const err = await res.json();
        alert(err.error || "Crud operation failed.");
      }
    } catch {
      alert("Database error.");
    } finally {
      setCrudLoading(false);
    }
  };

  const handleProductDelete = async (id: number) => {
    setDeleteConfirm({
      id,
      type: "product",
      title: "Are you sure you want to delete this furniture item and its photos?"
    });
  };

  // SERVICES SUBMISSIONS
  const openServiceForm = (mode: "add" | "edit", item?: Service | null) => {
    if (mode === "edit" && item) {
      setServiceForm({
        name: item.name,
        description: item.description,
        pricing: item.pricing,
        availability: item.availability,
        images: item.images || []
      });
      setServiceModal({ open: true, mode: "edit", data: item });
    } else {
      setServiceForm({ name: "", description: "", pricing: "Contact for Estimate", availability: "Active", images: [] });
      setServiceModal({ open: true, mode: "add", data: null });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudLoading(true);
    try {
      const url = serviceModal.mode === "edit" ? `/api/admin/services/${serviceModal.data?.id}` : "/api/admin/services";
      const method = serviceModal.mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });

      if (res.ok) {
        setServiceModal({ open: false, mode: "add" });
        loadDashboardStats();
        showToast("Service saved successfully.");
      } else {
        const err = await res.json();
        showToast(err.error || "Crud error.", "error");
      }
    } catch {
      showToast("Database link failure.", "error");
    } finally {
      setCrudLoading(false);
    }
  };

  const handleServiceDelete = async (id: number) => {
    setDeleteConfirm({
      id,
      type: "service",
      title: "Are you sure you want to delete this service card?"
    });
  };

  // PROJECTS SUBMISSIONS
  const openProjectForm = (mode: "add" | "edit", item?: Project | null) => {
    if (mode === "edit" && item) {
      setProjectForm({
        name: item.name,
        client: item.client,
        location: item.location,
        date: item.date,
        description: item.description,
        images: item.images || []
      });
      setProjectModal({ open: true, mode: "edit", data: item });
    } else {
      setProjectForm({ name: "", client: "", location: "", date: "", description: "", images: [] });
      setProjectModal({ open: true, mode: "add", data: null });
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudLoading(true);
    try {
      const url = projectModal.mode === "edit" ? `/api/admin/projects/${projectModal.data?.id}` : "/api/admin/projects";
      const method = projectModal.mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(projectForm)
      });

      if (res.ok) {
        setProjectModal({ open: false, mode: "add" });
        loadDashboardStats();
        showToast("Project updated successfully.");
      } else {
        const err = await res.json();
        showToast(err.error || "Project save failed.", "error");
      }
    } catch {
      showToast("Database error.", "error");
    } finally {
      setCrudLoading(false);
    }
  };

  const handleProjectDelete = async (id: number) => {
    setDeleteConfirm({
      id,
      type: "project",
      title: "Confirm deletion of this completed project details?"
    });
  };

  // FAQS SUBMISSIONS
  const openFaqForm = (mode: "add" | "edit", item?: FAQ | null) => {
    if (mode === "edit" && item) {
      setFaqForm({ question: item.question, answer: item.answer });
      setFaqModal({ open: true, mode: "edit", data: item });
    } else {
      setFaqForm({ question: "", answer: "" });
      setFaqModal({ open: true, mode: "add", data: null });
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudLoading(true);
    try {
      const url = faqModal.mode === "edit" ? `/api/admin/faqs/${faqModal.data?.id}` : "/api/admin/faqs";
      const method = faqModal.mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(faqForm)
      });

      if (res.ok) {
        setFaqModal({ open: false, mode: "add" });
        loadDashboardStats();
        showToast("FAQ card saved successfully.");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save FAQ.", "error");
      }
    } catch {
      showToast("Connection failure.", "error");
    } finally {
      setCrudLoading(false);
    }
  };

  const handleFaqDelete = async (id: number) => {
    setDeleteConfirm({
      id,
      type: "faq",
      title: "Remove this FAQ card?"
    });
  };



  // ----------------------------------------------------
  // UNCONNECTED RENDER PANE (LOGIN / SECURE ACCESS GATE)
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="bg-slate-950 font-sans min-h-screen text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="admin-gate-wrapper">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <div className="p-3 bg-amber-500 rounded-sm w-12 h-12 text-slate-950 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="mt-6 text-xl font-display font-bold uppercase tracking-widest">LCCT Employees</h2>
          <p className="mt-2 text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Administrative Access Gate</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10" id="login-container">
          <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-sm shadow-xl">
            
            <div className="text-center pb-4 mb-6 border-b border-zinc-800">
              <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">Secure Personnel Sign In</span>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-850 text-red-300 rounded-sm text-xs flex items-center gap-2 mb-5 font-mono">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* OTP OR PASSWORD SIGN IN FORM */}
            {requiresOtp ? (
              <form onSubmit={handleOtpVerifySubmit} className="space-y-5" id="otp-verify-form">
                <div className="text-center pb-2">
                  <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">MFA Verification</p>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    A 6-digit verification code has been dispatched to:
                  </p>
                  <p className="text-xs font-bold text-amber-500 font-mono mt-1 break-all select-all bg-slate-950/50 py-1.5 px-3 rounded border border-slate-850">
                    {otpEmail}
                  </p>
                </div>

                {authSuccess && (
                  <div className="p-3 bg-slate-950/60 border border-slate-850 text-zinc-300 rounded-sm text-xs leading-relaxed font-mono">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Status</p>
                    <p>{authSuccess}</p>
                  </div>
                )}

                {devOtp && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-sm text-center">
                    <p className="text-[9px] uppercase tracking-widest font-mono font-bold text-amber-500">Secure Developer Sandbox Bypass</p>
                    <p className="text-[11px] font-mono mt-1 text-zinc-300">Your secure login verification code is:</p>
                    <p className="text-sm font-mono font-bold mt-1 text-white bg-slate-950 px-2.5 py-1 rounded inline-block border border-amber-500/20">{devOtp}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="otp-code" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 text-center">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    required
                    id="otp-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-slate-950 border border-slate-850 rounded-sm px-4 py-3 text-lg text-center tracking-[0.5em] font-mono text-zinc-200 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>



                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center px-4.5 py-3 border border-transparent text-xs font-mono font-bold tracking-widest uppercase rounded-sm text-slate-950 bg-amber-500 hover:bg-amber-400 transition focus:outline-none cursor-pointer disabled:bg-slate-800 disabled:text-zinc-500"
                  id="otp-verify-submit-btn"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP & Authorize</span>}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRequiresOtp(false);
                      setOtpCode("");
                      setDevOtp(null);
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-white underline font-mono cursor-pointer"
                  >
                    Back to sign-in credentials
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
                <div>
                  <label htmlFor="login-user" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    id="login-user"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-850 rounded-sm px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="login-pass" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">Security Password</label>
                  <input
                    type="password"
                    required
                    id="login-pass"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded-sm px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center px-4.5 py-3 border border-transparent text-xs font-mono font-bold tracking-widest uppercase rounded-sm text-slate-950 bg-amber-500 hover:bg-amber-400 transition focus:outline-none cursor-pointer disabled:bg-slate-800 disabled:text-zinc-500"
                  id="login-submit-btn"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Open Control Panel</span>}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-[10px] text-zinc-600 font-mono">
              <p>Lucky Crown Construction & Trading Manila</p>
              <p className="mt-1">Default credentials: admin / admin123</p>
              <p className="mt-1.5 text-[9px] text-zinc-500">Note: External sign-up is disabled. Registration must be authorized inside the dashboard by existing management.</p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // DOCK: AUTHORIZED MASTER CMS INTERFACE
  // ----------------------------------------------------
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col md:flex-row shadow-inner" id="admin-dashboard-dock">
      
      {/* 1. Left-hand dynamic column sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 md:sticky md:top-20 md:h-[calc(100vh-80px)] border-r border-slate-800 flex flex-col justify-between" id="admin-sidebar">
        <div>
          {/* Header info */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/65 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold truncate max-w-[150px]">{username}</span>
            </div>
            <button
              onClick={handleLogoutClean}
              className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 rounded transition cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setAdminTab("dashboard")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "dashboard" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Stats Overview</span>
            </button>

            <button
              onClick={() => setAdminTab("products")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "products" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sofa className="w-4 h-4" />
              <span>Furniture Manager</span>
            </button>

            <button
              onClick={() => setAdminTab("services")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "services" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>Services Manager</span>
            </button>

            <button
              onClick={() => setAdminTab("projects")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "projects" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Portfolio manager</span>
            </button>

            <button
              onClick={() => setAdminTab("faqs")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "faqs" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ sheets</span>
            </button>

            <button
              onClick={() => setAdminTab("admins")}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-2.5 cursor-pointer transition ${
                adminTab === "admins" ? "bg-amber-500 text-slate-950 font-bold" : "text-zinc-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manage Admins</span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 text-[10px] text-zinc-500 font-mono text-center">
          <p>LCCT Admin Client v1.3</p>
          <p className="mt-0.5">Secure SQLite sync</p>
        </div>
      </aside>

      {/* 2. Main working board pane */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto" id="admin-main-workboard">
        
        {dashboardLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Performing cryptographic key mapping...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-fadeIn" id="admin-tab-wrapper">
            
            {/* ==============================================
                SUB-TAB: STATS OVERVIEW
                ============================================== */}
            {adminTab === "dashboard" && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Control Panel Statistics</h2>
                  <p className="text-xs text-slate-500 font-mono uppercase mt-1">Live data sync metrics</p>
                </div>

                {/* Counter statistics cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Products Catalog</p>
                      <p className="text-3xl font-extrabold text-slate-950 mt-1">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Sofa className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Services Total</p>
                      <p className="text-3xl font-[800] text-slate-950 mt-1">{stats?.totalServices || 0}</p>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Hammer className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Projects Complete</p>
                      <p className="text-3xl font-[800] text-slate-950 mt-1">{stats?.totalProjects || 0}</p>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Building className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Sub-grid tables of recently added */}
                <div className="grid grid-cols-1 gap-8 mt-10">
                  <div className="bg-white p-6 border border-slate-200/60 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                      <span>Latest Added Furniture Items</span>
                      <button onClick={() => setAdminTab("products")} className="text-xs text-amber-600 font-mono">Manage all</button>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {allProducts.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center space-x-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden shrink-0">
                            <PlaceholderImage imageUrl={p.images?.[0] || ""} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-slate-400 font-mono mt-0.5 truncate">{p.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ==============================================
                SUB-TAB: PRODUCTS MANAGER
                ============================================== */}
            {adminTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Manage Furniture Catalog</h2>
                    <p className="text-xs text-slate-500 font-mono">Dynamic inventory rows</p>
                  </div>
                  <button
                    onClick={() => openProductForm("add")}
                    className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase rounded-full shadow cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Furniture</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden" id="products-table-wrapper">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 uppercase font-bold text-slate-500">Image</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Title</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Category</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Availability</th>
                        <th className="p-4 uppercase font-bold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                              <PlaceholderImage imageUrl={p.images?.[0] || ""} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{p.name}</td>
                          <td className="p-4 text-slate-500 font-medium">{p.category}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.availability === "In Stock" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>{p.availability}</span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openProductForm("edit", p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit row"><Edit className="w-4 h-4 inline" /></button>
                            <button onClick={() => handleProductDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete row"><Trash className="w-4 h-4 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==============================================
                SUB-TAB: SERVICES MANAGER
                ============================================== */}
            {adminTab === "services" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Manage Services Cards</h2>
                    <p className="text-xs text-slate-500 font-mono">Define layout designs & fit-out capabilities</p>
                  </div>
                  <button
                    onClick={() => openServiceForm("add")}
                    className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase rounded-full shadow cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Service card</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 uppercase font-bold text-slate-500">Thumbnail</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Service Name</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Availability</th>
                        <th className="p-4 uppercase font-bold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allServices.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                              <PlaceholderImage imageUrl={s.images?.[0] || ""} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{s.name}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px]">{s.availability}</span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openServiceForm("edit", s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 inline" /></button>
                            <button onClick={() => handleServiceDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash className="w-4 h-4 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==============================================
                SUB-TAB: PORTFOLIO WORKS MANAGER
                ============================================== */}
            {adminTab === "projects" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" gap-4>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Manage Completed Portfolio Projects</h2>
                    <p className="text-xs text-slate-500 font-mono">Publish case studies & blueprints</p>
                  </div>
                  <button
                    onClick={() => openProjectForm("add")}
                    className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase rounded-full shadow cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Completed Project</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 uppercase font-bold text-slate-500">Photo</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Project Name</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Client Partner</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Location Built</th>
                        <th className="p-4 uppercase font-bold text-slate-500">Date Turned over</th>
                        <th className="p-4 uppercase font-bold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allProjects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                              <PlaceholderImage imageUrl={proj.images?.[0] || ""} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900 truncate max-w-[150px]">{proj.name}</td>
                          <td className="p-4 text-slate-500 font-medium">{proj.client}</td>
                          <td className="p-4 font-semibold text-slate-500">{proj.location}</td>
                          <td className="p-4 text-slate-400 font-mono font-bold">{proj.date}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openProjectForm("edit", proj)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 inline" /></button>
                            <button onClick={() => handleProjectDelete(proj.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash className="w-4 h-4 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==============================================
                SUB-TAB: FAQ SHEETS ACTIONS
                ============================================== */}
            {adminTab === "faqs" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Manage FAQ Desk Sheets</h2>
                    <p className="text-xs text-slate-500 font-mono">Edit question & answers accordions</p>
                  </div>
                  <button
                    onClick={() => openFaqForm("add")}
                    className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase rounded-full shadow cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create FAQ entry</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 uppercase font-bold text-slate-500">FAQ Question</th>
                        <th className="p-4 uppercase font-bold text-slate-500">FAQ Answer Draft</th>
                        <th className="p-4 uppercase font-bold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allFaqs.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-900 w-2/5 leading-relaxed">{f.question}</td>
                          <td className="p-4 text-slate-500 w-2/5 leading-relaxed truncate max-w-xs">{f.answer}</td>
                          <td className="p-4 text-right w-1/5 space-x-2">
                            <button onClick={() => openFaqForm("edit", f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4 inline" /></button>
                            <button onClick={() => handleFaqDelete(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash className="w-4 h-4 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==============================================
                SUB-TAB: ADMINISTRATOR SECURITY CONSOLE
                ============================================== */}
            {adminTab === "admins" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Corporate Security & Personnel</h2>
                  <p className="text-xs text-slate-500 font-mono">Create, monitor, and revoke access keys for Lucky Crown administrators</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Side: Administrator Accounts List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Authorized System Access Keys</span>
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 font-mono text-[10px] font-bold uppercase tracking-wider">{allAdmins.length} Profiles Active</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                              <th className="p-4 uppercase font-bold text-slate-500 font-mono text-[10px]">Username</th>
                              <th className="p-4 uppercase font-bold text-slate-500 font-mono text-[10px]">Email Address</th>
                              <th className="p-4 uppercase font-bold text-slate-500 font-mono text-[10px]">Auth Status</th>
                              <th className="p-4 uppercase font-bold text-slate-500 font-mono text-[10px]">Created On</th>
                              <th className="p-4 uppercase font-bold text-slate-500 font-mono text-[10px] text-right">Access Management</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {allAdmins.map((adm) => {
                              const isCurrentUser = adm.username === username;
                              const isRootAdmin = adm.username === "admin";
                              return (
                                <tr key={adm.id} className="hover:bg-slate-50/30 transition">
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{adm.username}</span>
                                      {isCurrentUser && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded font-mono font-bold uppercase tracking-wider">YOU</span>
                                      )}
                                      {isRootAdmin && (
                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] rounded font-mono font-bold uppercase tracking-wider">ROOT</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-500 break-all">{adm.email}</td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                      adm.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${adm.status === "approved" ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                                      {adm.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                                    {adm.created_at ? new Date(adm.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                                  </td>
                                  <td className="p-4 text-right">
                                    {isCurrentUser || isRootAdmin ? (
                                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider select-none">Immutable</span>
                                    ) : (
                                      <div className="inline-flex items-center gap-1">
                                        {deleteAdminConfirmId === adm.id ? (
                                          <div className="flex items-center gap-1.5 animate-fadeIn">
                                            <button 
                                              onClick={() => handleRevokeAdmin(adm.id)}
                                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold font-mono uppercase cursor-pointer"
                                            >
                                              CONFIRM REVOKE
                                            </button>
                                            <button 
                                              onClick={() => setDeleteAdminConfirmId(null)}
                                              className="px-2 py-1 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded text-[10px] font-bold font-mono uppercase cursor-pointer"
                                            >
                                              CANCEL
                                            </button>
                                          </div>
                                        ) : (
                                          <button 
                                            onClick={() => setDeleteAdminConfirmId(adm.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                            title="Revoke Admin Access"
                                          >
                                            <Trash2 className="w-4 h-4 inline" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Add New Administrator Form */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-amber-500" />
                        <span>Add New Personnel</span>
                      </h3>

                      <form onSubmit={handleAddNewAdmin} className="space-y-4" id="add-new-admin-panel-form">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Proposed Username</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. officer_magadia"
                            value={newAdminUser} 
                            onChange={(e) => setNewAdminUser(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 font-mono" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address (For OTP Verification)</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="e.g. personnel@luckycrown.com"
                            value={newAdminEmail} 
                            onChange={(e) => setNewAdminEmail(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 font-mono" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Secure Password</label>
                          <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            value={newAdminPass} 
                            onChange={(e) => setNewAdminPass(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 font-mono" 
                          />
                          <p className="text-[9px] text-zinc-400 mt-1 font-mono">Password must be at least 5 characters long.</p>
                        </div>

                        {newAdminError && (
                          <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-mono leading-relaxed">
                            {newAdminError}
                          </div>
                        )}

                        {newAdminSuccess && (
                          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-mono leading-relaxed">
                            {newAdminSuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={newAdminSubmitting}
                          className="w-full inline-flex items-center justify-center px-4.5 py-3 border border-transparent text-xs font-mono font-bold tracking-widest uppercase rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-100 disabled:text-zinc-400 transition cursor-pointer"
                        >
                          {newAdminSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize Access Key</span>}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}



          </div>
        )}

      </main>

      {/* ==========================================================
          CRUD MODAL DRAWERS OVERLAYS (SHARED)
          ========================================================== */}
      
      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      {productModal.open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-8 border">
            <h3 className="text-lg font-bold text-slate-950 mb-6">{productModal.mode === "edit" ? "Modify Furniture metadata" : "Upload New Furniture Piece"}</h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-4" id="admin-product-control-form">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Furniture Item Name</label>
                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category Selector</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500">
                    <option value="Office & Residential Furniture">Office & Residential Furniture</option>
                    <option value="Fit Out Installations">Fit Out Installations</option>
                    <option value="Hardware Materials">Hardware Materials</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Concept Description</label>
                <textarea required rows={3} value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Specifications List (separate by lines)</label>
                <textarea rows={3} value={productForm.specifications} placeholder="Dimensions: 100cm x 100cm&#10;Material: Melamine finish wood" onChange={(e) => setProductForm({...productForm, specifications: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Availability Status</label>
                  <select value={productForm.availability} onChange={(e) => setProductForm({...productForm, availability: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500">
                    <option value="In Stock">In Stock</option>
                    <option value="Order on Demand">Order on Demand</option>
                    <option value="Out of stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Multi-Image Selector</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleLocalImageSelect(e, setProductForm)} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 cursor-pointer" />
                </div>
              </div>

              {/* Image thumbnails review */}
              {productForm.images.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto py-1">
                  {productForm.images.map((img, ix) => (
                    <div key={ix} className="relative w-12 h-12 bg-slate-100 rounded overflow-hidden">
                      <PlaceholderImage imageUrl={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setProductForm({...productForm, images: productForm.images.filter((_, idx) => idx !== ix)})} className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-[8px] p-0.5">X</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setProductModal({ open: false, mode: "add" })} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer">Discard</button>
                <button type="submit" disabled={crudLoading} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase rounded-lg transition shadow-md cursor-pointer">
                  {crudLoading ? "Saving transaction..." : "Commit Records"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE ADD/EDIT MODAL OVERLAY */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-8 border">
            <h3 className="text-lg font-bold text-slate-950 mb-6">{serviceModal.mode === "edit" ? "Edit Service Parameters" : "Publish New Service Card"}</h3>
            
            <form onSubmit={handleServiceSubmit} className="space-y-4" id="admin-service-form">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Service Name</label>
                <input type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Service details & Capability Scope</label>
                <textarea required rows={4} value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Available Status</label>
                  <select value={serviceForm.availability} onChange={(e) => setServiceForm({...serviceForm, availability: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none">
                    <option value="Active">Active</option>
                    <option value="Contact for Quote">Contact for Quote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Featured Photo</label>
                  <input type="file" mime-type="image/*" onChange={(e) => handleLocalImageSelect(e, setServiceForm)} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 text-xs">
                <button type="button" onClick={() => setServiceModal({ open: false, mode: "add" })} className="px-4 py-2 border rounded-lg hover:bg-slate-50 cursor-pointer">Discard</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold uppercase rounded-lg shadow cursor-pointer">{crudLoading ? "Processing..." : "Commit service"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECTS/PORTFOLIO ADD/EDIT MODAL OVERLAY */}
      {projectModal.open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-8 border">
            <h3 className="text-lg font-bold text-slate-950 mb-6">{projectModal.mode === "edit" ? "Edit Completed Project Details" : "Upload Completed Project"}</h3>
            
            <form onSubmit={handleProjectSubmit} className="space-y-4" id="admin-project-form">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project Name / Build target</label>
                <input type="text" required value={projectForm.name} placeholder="InnovateHub Co-Working Space" onChange={(e) => setProjectForm({...projectForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Client name / Sponsor</label>
                  <input type="text" required value={projectForm.client} placeholder="Private Residence or Corp Name" onChange={(e) => setProjectForm({...projectForm, client: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Location Built / Address</label>
                  <input type="text" required value={projectForm.location} placeholder="Ortigas Center, Pasig City" onChange={(e) => setProjectForm({...projectForm, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Turnover date</label>
                  <input type="date" required value={projectForm.date} onChange={(e) => setProjectForm({...projectForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Attach Media Photos</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleLocalImageSelect(e, setProjectForm)} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:rounded file:bg-amber-50 file:text-amber-700 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description of architectural specs / layout works</label>
                <textarea required rows={4} value={projectForm.description} placeholder="Meticulously designed partitions sheets with premium mesh chairs supply..." onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 text-xs">
                <button type="button" onClick={() => setProjectModal({ open: false, mode: "add" })} className="px-4 py-2 border rounded-lg hover:bg-slate-50 cursor-pointer">Discard</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold uppercase rounded-lg shadow cursor-pointer">Add to portfolio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAO MANAGER MODAL OVERLAY */}
      {faqModal.open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-8 border">
            <h3 className="text-lg font-bold text-slate-950 mb-6">{faqModal.mode === "edit" ? "Edit FAQ Desk Sheet" : "Publish New FAQ desk Entry"}</h3>
            
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">FAQ Question</label>
                <input type="text" required value={faqForm.question} placeholder="How long does a workspace fitout take?" onChange={(e) => setFaqForm({...faqForm, question: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">FAQ Answer Sheet</label>
                <textarea required rows={5} value={faqForm.answer} placeholder="Workspace designs typically span 30 to 45 calendar days..." onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none" />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 text-xs">
                <button type="button" onClick={() => setFaqModal({ open: false, mode: "add" })} className="px-4 py-2 border rounded-lg hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold uppercase rounded-lg shadow cursor-pointer">Publish card</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative bg-white max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 border border-slate-100 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Confirm Delete</h3>
            <p className="text-xs text-slate-500 mb-6 px-2">{deleteConfirm.title}</p>
            
            <div className="flex items-center justify-center space-x-3 text-xs font-semibold">
              <button 
                type="button" 
                onClick={() => setDeleteConfirm(null)} 
                disabled={crudLoading}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                No, Keep it
              </button>
              <button 
                type="button" 
                onClick={executeDelete} 
                disabled={crudLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition cursor-pointer disabled:bg-red-400 flex items-center gap-1.5"
              >
                {crudLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Yes, Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION WINDOW */}
      {customNotification && (
        <div className="fixed bottom-5 right-5 z-[120] animate-slideUp">
          <div className={`p-4 rounded-xl shadow-lg border text-xs font-mono font-medium flex items-center gap-2.5 max-w-sm ${
            customNotification.type === "success" 
              ? "bg-slate-900 border-slate-800 text-emerald-400" 
              : "bg-red-950 border-red-900/55 text-red-350"
          }`}>
            {customNotification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{customNotification.text}</span>
            <button 
              onClick={() => setCustomNotification(null)}
              className="ml-auto text-slate-500 hover:text-slate-300 font-bold px-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
