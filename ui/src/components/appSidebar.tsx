import { 
  Home, 
  BarChart3, 
  Settings, 
  Layers,
  Brain,
  Users,
  Target,
  Shield,
  Smartphone,
  Activity,
  Gauge,
  FileText,
  Lock,
  Eye,
  Bug
} from 'lucide-react';
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="sticky top-12 h-[calc(100vh-3rem)] z-40">
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Home" isActive={isActive('/')} asChild>
                  <Link to="/">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Trading Analysis" isActive={isActive('/trading-analysis')} asChild>
                  <Link to="/trading-analysis">
                    <BarChart3 className="w-4 h-4" />
                    <span>Trading Analysis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="System Monitor" isActive={isActive('/system-monitor')} asChild>
                  <Link to="/system-monitor">
                    <Layers className="w-4 h-4" />
                    <span>System Monitor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Learning & Analytics" isActive={isActive('/learning-analytics')} asChild>
                  <Link to="/learning-analytics">
                    <Brain className="w-4 h-4" />
                    <span>Learning & Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="AI Management" isActive={isActive('/ai-management')} asChild>
                  <Link to="/ai-management">
                    <Target className="w-4 h-4" />
                    <span>AI Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Model Management removed in favor of integration within AI Management */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Security & PWA Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Security & PWA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Security Monitoring" isActive={isActive('/security-monitoring')} asChild>
                  <Link to="/security-monitoring">
                    <Eye className="w-4 h-4" />
                    <span>Security Monitoring</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="MFA Setup" isActive={isActive('/mfa-setup')} asChild>
                  <Link to="/mfa-setup">
                    <Shield className="w-4 h-4" />
                    <span>MFA Setup</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="PWA Status" isActive={isActive('/pwa-status')} asChild>
                  <Link to="/pwa-status">
                    <Smartphone className="w-4 h-4" />
                    <span>PWA Status</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Rate Limiting" isActive={isActive('/rate-limiting')} asChild>
                  <Link to="/rate-limiting">
                    <Activity className="w-4 h-4" />
                    <span>Rate Limiting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Security Audit" isActive={isActive('/security-audit')} asChild>
                  <Link to="/security-audit">
                    <FileText className="w-4 h-4" />
                    <span>Security Audit</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Security Headers" isActive={isActive('/security-headers')} asChild>
                  <Link to="/security-headers">
                    <Lock className="w-4 h-4" />
                    <span>Security Headers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Debug Console" isActive={isActive('/debug-logs')} asChild>
                  <Link to="/debug-logs">
                    <Bug className="w-4 h-4" />
                    <span>Debug Console</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" isActive={isActive('/settings')} asChild>
              <Link to="/settings">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 