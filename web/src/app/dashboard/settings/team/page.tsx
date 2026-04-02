"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Mail,
  Shield,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  UserPlus,
  Crown,
  Eye,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { teamService, TeamMember, TeamStats } from "@/lib/api/team";

const roles = [
  {
    id: "owner",
    name: "Owner",
    description: "Full access to all features and billing",
    icon: Crown,
    color: "text-yellow-500",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Manage agents, knowledge, and team settings",
    icon: Shield,
    color: "text-violet-500",
  },
  {
    id: "agent",
    name: "Agent",
    description: "Handle conversations and customer support",
    icon: Users,
    color: "text-green-500",
  },
  {
    id: "member",
    name: "Member",
    description: "View conversations and basic analytics",
    icon: Eye,
    color: "text-blue-500",
  },
];

function getRoleBadge(role: string) {
  const r = roles.find(ro => ro.id === role);
  if (!r) return null;
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      role === "owner" ? "bg-yellow-500/10 text-yellow-600" :
      role === "admin" ? "bg-violet-500/10 text-violet-600" :
      "bg-blue-500/10 text-blue-600"
    }`}>
      {r.name}
    </span>
  );
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "agent" | "member">("member");
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersResponse, statsData] = await Promise.all([
        teamService.getMembers({ search: searchQuery || undefined }),
        teamService.getStats(),
      ]);
      setTeamMembers(membersResponse.data);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await teamService.inviteMember({
        email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
        role: inviteRole,
      });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("member");
      await fetchTeamData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite member';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      setError(null);
      await teamService.removeMember(memberId);
      await fetchTeamData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
    }
  };

  const filteredMembers = teamMembers.filter(
    member => `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
              member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team and their access permissions</p>
        </div>
        <button 
          onClick={() => fetchTeamData()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats?.total ?? 0, icon: Users },
          { label: "Owners", value: stats?.by_role.owner ?? 0, icon: Crown },
          { label: "Admins", value: stats?.by_role.admin ?? 0, icon: Shield },
          { label: "Members", value: (stats?.by_role.agent ?? 0) + (stats?.by_role.member ?? 0), icon: CheckCircle2 },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <stat.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Team List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No team members found
          </div>
        ) : (
        <div className="divide-y divide-border">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {member.first_name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{member.first_name} {member.last_name}</p>
                  {getRoleBadge(member.role)}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowEditModal(member.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                {member.role !== "owner" && (
                  <button 
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Role Permissions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <role.icon className={`w-5 h-5 ${role.color}`} />
                <span className="font-medium">{role.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Invite Team Member</h2>
                  <p className="text-sm text-muted-foreground">Send an invitation to join your team</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.filter(r => r.id !== "owner").map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setInviteRole(role.id as "admin" | "agent" | "member")}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          inviteRole === role.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <role.icon className={`w-4 h-4 ${role.color}`} />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInvite}
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} 
                  {saving ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
