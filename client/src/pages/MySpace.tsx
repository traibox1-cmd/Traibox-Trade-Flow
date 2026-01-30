export default function MySpace() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-light tracking-tight">My Space</h1>
        <p className="text-sm text-muted-foreground mt-1">Trade workspace overview and active operations</p>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Active Trades</div>
            <div className="text-3xl font-light">12</div>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pending Actions</div>
            <div className="text-3xl font-light">3</div>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Network Partners</div>
            <div className="text-3xl font-light">8</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-light">Recent Activity</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-card-border rounded-lg p-4 hover:bg-accent transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-light">Trade #{1000 + i} - Cotton shipment</div>
                  <div className="text-sm text-muted-foreground mt-1">Compliance check completed</div>
                </div>
                <div className="text-xs text-muted-foreground">2h ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
