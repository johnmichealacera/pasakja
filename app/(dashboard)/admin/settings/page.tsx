import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Bell, Database, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure system-wide settings</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">System Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">System Name</span>
              <span className="font-medium">Pasakja</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Version</span>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">Socorro, Surigao del Norte</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">Philippine Peso (₱)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
            <CardDescription>Authentication and access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Authentication</span>
              <Badge>NextAuth.js</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Session Strategy</span>
              <Badge variant="secondary">JWT</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Password Hashing</span>
              <Badge variant="secondary">bcryptjs (12 rounds)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Database</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Database</span>
              <Badge>PostgreSQL</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ORM</span>
              <Badge variant="secondary">Prisma</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
            <CardDescription>System notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In-app notifications</span>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SOS Alerts</span>
              <Badge className="bg-green-600">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Tech Stack</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Framework", value: "Next.js 15 (App Router)" },
              { label: "Language", value: "TypeScript" },
              { label: "UI Library", value: "shadcn/ui + Tailwind CSS v4" },
              { label: "ORM", value: "Prisma" },
              { label: "Database", value: "PostgreSQL" },
              { label: "Auth", value: "NextAuth.js" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
