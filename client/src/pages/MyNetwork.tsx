import { useState } from "react";
import { Plus, Users, Mail } from "lucide-react";

export default function MyNetwork() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-white">My Network</h1>
          <p className="text-sm text-white/50 mt-1">Manage trade networks and partner connections</p>
        </div>
        
        <div className="flex gap-3">
          <button
            data-testid="button-join-network"
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Join Network
          </button>
          <button
            data-testid="button-create-network"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Network
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="space-y-4">
          {[
            { name: "Global Cotton Network", members: 24, status: "Active" },
            { name: "EU Trade Alliance", members: 18, status: "Active" },
            { name: "Asia-Pacific Partners", members: 12, status: "Pending" },
          ].map((network, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-light">{network.name}</h3>
                    <p className="text-sm text-white/50 mt-1">{network.members} members</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  network.status === "Active" 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {network.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-light text-white mb-4">Create Network</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Network Name</label>
                <input
                  data-testid="input-network-name"
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter network name"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Description</label>
                <textarea
                  data-testid="input-network-description"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  data-testid="button-cancel-create"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  data-testid="button-confirm-create"
                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowJoinModal(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-light text-white mb-4">Join Network</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Invitation Code</label>
                <input
                  data-testid="input-invitation-code"
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter invitation code"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  data-testid="button-cancel-join"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  data-testid="button-confirm-join"
                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
