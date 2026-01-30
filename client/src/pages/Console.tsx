export default function Console() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-white/10">
        <h1 className="text-2xl font-light tracking-tight text-white">Console</h1>
        <p className="text-sm text-white/50 mt-1">Trade workspace overview and active operations</p>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Active Trades</div>
            <div className="text-3xl font-light text-white">12</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Pending Actions</div>
            <div className="text-3xl font-light text-white">3</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Network Partners</div>
            <div className="text-3xl font-light text-white">8</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-light text-white">Recent Activity</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-light">Trade #{1000 + i} - Cotton shipment</div>
                  <div className="text-sm text-white/50 mt-1">Compliance check completed</div>
                </div>
                <div className="text-xs text-white/40">2h ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
