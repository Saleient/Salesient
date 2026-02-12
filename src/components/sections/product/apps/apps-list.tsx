"use client";

import { CheckCircle2, Plug, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingGrid, LoadingSpinner } from "@/components/ui/loading-spinner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { apps as composioApps } from "@/lib/data";

type Toolkit = {
  slug: string;
  name: string;
  meta: {
    description: string;
    logo: string;
  };
};

type AuthConfig = {
  id: string;
  name: string;
  toolkit: string | { slug: string };
};

type ConnectedToolkit = {
  toolkit: Toolkit;
  authConfig: AuthConfig;
};

type AuthConfigResponse = {
  items: AuthConfig[];
};

type ConnectedAccount = {
  id: string;
  toolkit: {
    slug: string;
  };
  status: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

type ComposioApp = {
  id: string;
  appName: string;
  description: string;
  logo: string;
  toolkitSlug: string;
  categories: string[];
  meta: {
    description: string;
    logo: string;
  };
};

export function AppsList() {
  const { data: session } = useSession();
  const user = session?.user;

  const [toolkits, setToolkits] = useState<ConnectedToolkit[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [initiatingAccounts, setInitiatingAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [_timerTick, setTimerTick] = useState(0); // Forces re-render for timers

  const ALLOWED_CATEGORIES = [
    "sales & customer support",
    "crm",
    "erp",
    "email marketing",
    "marketing & social media",
    "productivity & project management",
    "productivity",
    "collaboration & communication",
    "scheduling & booking",
    "marketing",
    "sales automation",
    "contact management",
    "lead generation",
    "communication",
    "messaging",
    "customer onboarding",
    "professional services",
    "sales engagement",
    "b2b sales intelligence",
    "digital marketing",
    "advertising & marketing",
    "email automation",
    "survey",
    "customer management",
    "sales",
    "scheduling",
    "collaboration",
    "workflow automation",
    "analytics & data",
  ];

  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/apps/connection");

      if (response.ok) {
        const data = await response.json();

        // Separate connected and initiating accounts by status
        const allAccounts = data.connectedAccounts || [];
        const connected = allAccounts.filter(
          (acc: ConnectedAccount) =>
            acc.status === "ACTIVE" || acc.status === "CONNECTED"
        );
        const initiating = allAccounts.filter(
          (acc: ConnectedAccount) =>
            acc.status === "INITIATED" || acc.status === "PENDING"
        );

        setConnectedAccounts(connected);
        setInitiatingAccounts(initiating);
      }
    } catch (_error) {
      // Silently handle errors
    }
  }, []);

  const fetchAppsData = useCallback(async () => {
    try {
      // Step 1: Fetch auth configs and connected accounts in parallel
      const [authConfigsResponse, connectionStatusResponse] = await Promise.all(
        [
          fetch("/api/integrations", {
            method: "GET",
          }),
          fetch("/api/apps/connection"),
        ]
      );

      if (!authConfigsResponse.ok) {
        throw new Error("Failed to fetch auth configs");
      }

      const authConfigsData: AuthConfigResponse =
        await authConfigsResponse.json();
      const connectionData = connectionStatusResponse.ok
        ? await connectionStatusResponse.json()
        : { connectedAccounts: [] };

      // Separate connected and initiating accounts
      const allAccounts = connectionData.connectedAccounts || [];
      const connected = allAccounts.filter(
        (acc: ConnectedAccount) =>
          acc.status === "ACTIVE" || acc.status === "CONNECTED"
      );
      const initiating = allAccounts.filter(
        (acc: ConnectedAccount) =>
          acc.status === "INITIATED" || acc.status === "PENDING"
      );

      setConnectedAccounts(connected);
      setInitiatingAccounts(initiating);

      if (!authConfigsData.items || authConfigsData.items.length === 0) {
        setToolkits([]);
        return;
      }

      // Use all auth configs, no filtering
      const configsToUse = authConfigsData.items;

      // Step 2: For each auth config, fetch the toolkit details
      const appPromises = configsToUse.map(async (authConfig) => {
        try {
          // Handle both string and object formats for toolkit
          const toolkitSlug =
            typeof authConfig.toolkit === "string"
              ? authConfig.toolkit
              : authConfig.toolkit.slug;

          const toolkitResponse = await fetch("/api/integrations/toolkit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toolkit: toolkitSlug }),
          });

          if (!toolkitResponse.ok) {
            return null;
          }

          const toolkitData = await toolkitResponse.json();

          return {
            toolkit: {
              slug: toolkitData.slug,
              name: toolkitData.name,
              meta: toolkitData.meta,
            },
            authConfig,
          } as ConnectedToolkit;
        } catch (_error) {
          return null;
        }
      });

      const toolkitResults = await Promise.all(appPromises);
      const validToolkits = toolkitResults.filter(
        (toolkit): toolkit is ConnectedToolkit => toolkit !== null
      );

      setToolkits(validToolkits);
    } catch (_error) {
      setToolkits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppsData();
    }
  }, [user, fetchAppsData]);

  // Refresh connection data when component mounts (e.g., after OAuth callback)
  useEffect(() => {
    const refreshConnections = () => {
      fetchConnectedAccounts();
    };

    // Refresh immediately when component mounts
    if (user) {
      refreshConnections();
    }

    // Listen for connection success events from callback page
    const handleConnectionSuccess = (_event: CustomEvent) => {
      setTimeout(() => {
        refreshConnections();
      }, 1000); // Small delay to ensure backend is updated
    };

    // Also refresh when the window gains focus (user returns from OAuth popup)
    window.addEventListener("focus", refreshConnections);
    window.addEventListener(
      "connectionSuccess",
      handleConnectionSuccess as EventListener
    );

    return () => {
      window.removeEventListener("focus", refreshConnections);
      window.removeEventListener(
        "connectionSuccess",
        handleConnectionSuccess as EventListener
      );
    };
  }, [user, fetchConnectedAccounts]);

  // Timer refresh for initiating accounts display
  useEffect(() => {
    if (initiatingAccounts.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimerTick((prev) => prev + 1); // Force re-render for timers
    }, 1000);
    return () => clearInterval(interval);
  }, [initiatingAccounts]);

  // Auto-delete initiating accounts older than 10 minutes
  useEffect(() => {
    if (initiatingAccounts.length === 0) {
      return;
    }

    const checkAndDeleteOldAccounts = async () => {
      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;

      for (const account of initiatingAccounts) {
        const createdAt = new Date(
          account.created_at || account.createdAt || ""
        ).getTime();
        const ageMs = now - createdAt;

        if (ageMs > tenMinutesMs) {
          try {
            // Delete the account from the backend
            const response = await fetch("/api/apps/connection", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accountId: account.id }),
            });

            if (response.ok) {
              // Refresh connections to remove it from state
              await fetchConnectedAccounts();
            }
          } catch (_error) {
            // Silently handle errors for auto-cleanup
          }
        }
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkAndDeleteOldAccounts, 10_000);
    return () => clearInterval(interval);
  }, [initiatingAccounts, fetchConnectedAccounts]);

  const handleConnect = async (toolkit: ConnectedToolkit) => {
    setConnecting(toolkit.toolkit.slug);

    try {
      // Create a new chat and ask LLM to handle connection
      const response = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Hi Ellie, Please help me connect to ${toolkit.toolkit.name} which has the slug (${toolkit.toolkit.slug})`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create chat: ${response.status}`
        );
      }

      const { chatId } = await response.json();

      if (chatId) {
        // Redirect to the new chat
        window.location.href = `/dashboard/chat/${chatId}`;
      }
    } catch (error) {
      toast.error(`Failed to connect to ${toolkit.toolkit.name}`, {
        description: String(error),
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (
    toolkit: ConnectedToolkit,
    connectedAccount: ConnectedAccount
  ) => {
    setConnecting(toolkit.toolkit.slug);

    try {
      const response = await fetch("/api/apps/connection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: connectedAccount.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to disconnect: ${response.status}`
        );
      }

      // Immediately update the connected accounts list to remove the disconnected account
      setConnectedAccounts((prev) =>
        prev.filter((account) => account.id !== connectedAccount.id)
      );

      // Also refresh from server to ensure sync
      setTimeout(() => {
        fetchConnectedAccounts();
      }, 500);
    } catch (error) {
      toast.error(`Failed to disconnect ${toolkit.toolkit.name}`, {
        description: String(error),
      });
    } finally {
      setConnecting(null);
    }
  };

  const filteredToolkits = (toolkits || []).filter(
    (toolkit: ConnectedToolkit) =>
      toolkit.toolkit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedToolkits = filteredToolkits.filter((toolkit) =>
    connectedAccounts.some(
      (account) =>
        account.toolkit?.slug?.toLowerCase() ===
        toolkit.toolkit.slug.toLowerCase()
    )
  );

  const initiatingToolkits = filteredToolkits.filter((toolkit) =>
    initiatingAccounts.some(
      (account) =>
        account.toolkit?.slug?.toLowerCase() ===
        toolkit.toolkit.slug.toLowerCase()
    )
  );

  // Filter out already connected apps from the marketplace
  const availableToolkits = (toolkits || []).filter(
    (toolkit) =>
      !connectedAccounts.some(
        (account) =>
          account.toolkit?.slug?.toLowerCase() ===
          toolkit.toolkit.slug.toLowerCase()
      )
  );

  const _filteredAvailableToolkits = availableToolkits.filter(
    (toolkit: ConnectedToolkit) =>
      toolkit.toolkit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group marketplace apps by category (only allowed categories)
  const groupAppsByCategory = (
    appsToGroup: ComposioApp[]
  ): Record<string, ComposioApp[]> => {
    return appsToGroup.reduce(
      (acc, app) => {
        // Only use allowed categories
        const allowedAppCategories = app.categories.filter((cat) =>
          ALLOWED_CATEGORIES.includes(cat.toLowerCase())
        );

        if (allowedAppCategories.length === 0) {
          return acc;
        }

        allowedAppCategories.forEach((category) => {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(app);
        });
        return acc;
      },
      {} as Record<string, ComposioApp[]>
    );
  };

  // Get marketplace apps (not connected + matching search + allowed categories)
  const marketplaceApps = composioApps.apps.filter((app: ComposioApp) => {
    const isConnected = connectedAccounts.some(
      (account) =>
        account.toolkit?.slug?.toLowerCase() === app.toolkitSlug.toLowerCase()
    );
    const matchesSearch =
      !searchQuery ||
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const hasAllowedCategory = app.categories.some((cat) =>
      ALLOWED_CATEGORIES.includes(cat.toLowerCase())
    );
    return !isConnected && matchesSearch && hasAllowedCategory;
  });

  const categorizedApps = groupAppsByCategory(marketplaceApps);
  const sortedCategories = Object.keys(categorizedApps).sort();

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const getTimeRemaining = (
    createdAt: string | undefined
  ): { minutes: number; seconds: number } => {
    if (!createdAt) {
      return { minutes: 0, seconds: 0 };
    }
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const ageMs = now - created;
    const tenMinutesMs = 10 * 60 * 1000;
    const remainingMs = Math.max(0, tenMinutesMs - ageMs);
    const minutes = Math.floor(remainingMs / 1000 / 60);
    const seconds = Math.floor((remainingMs / 1000) % 60);
    return { minutes, seconds };
  };

  const renderMarketplaceAppCard = (app: ComposioApp) => (
    <Card className="flex flex-col transition-colors" key={app.toolkitSlug}>
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background sm:h-12 sm:w-12">
            {app.meta.logo ? (
              <img
                alt={app.appName}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
                src={app.meta.logo}
              />
            ) : null}
            <span
              className={`font-semibold text-lg text-primary ${
                app.meta.logo ? "hidden" : ""
              }`}
            >
              {getInitial(app.appName)}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-base">{app.appName}</h3>
          <p className="line-clamp-2 text-muted-foreground text-sm">
            {app.meta.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {app.categories.slice(0, 2).map((category) => (
            <span
              className="inline-block rounded-full bg-secondary px-2 py-1 font-medium text-secondary-foreground text-xs"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>

        <div className="pt-2">
          <Button
            className="w-full"
            disabled={connecting === app.toolkitSlug}
            onClick={() => handleComposioConnect(app)}
            size="sm"
            variant="outline"
          >
            {connecting === app.toolkitSlug ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" size="sm" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const handleComposioConnect = async (app: ComposioApp) => {
    setConnecting(app.toolkitSlug);
    try {
      // Create a new chat and ask LLM to handle connection
      const response = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Hi Ellie, Please help me connect to  ${app.appName} with the slug (${app.toolkitSlug})`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create chat: ${response.status}`
        );
      }

      const { chatId } = await response.json();

      if (chatId) {
        // Redirect to the new chat
        window.location.href = `/dashboard/chat/${chatId}`;
      }
    } catch (error) {
      toast.error(`Failed to connect to ${app.appName}`, {
        description: String(error),
      });
    } finally {
      setConnecting(null);
    }
  };

  const renderAppCard = (
    toolkit: ConnectedToolkit,
    isConnected: boolean,
    initiatingAccount?: ConnectedAccount
  ) => {
    const isConnecting = connecting === toolkit.toolkit.slug;
    const connectedAccount = connectedAccounts.find(
      (account) =>
        account.toolkit?.slug?.toLowerCase() ===
        toolkit.toolkit.slug.toLowerCase()
    );

    const isInitiating = !!initiatingAccount;
    const { minutes, seconds } = getTimeRemaining(
      initiatingAccount?.created_at || initiatingAccount?.createdAt
    );

    return (
      <Card
        className="flex flex-col transition-colors"
        key={`${toolkit.toolkit.slug}-${toolkit.authConfig.id}`}
      >
        <CardContent className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background sm:h-12 sm:w-12">
              {toolkit.toolkit.meta.logo ? (
                <img
                  alt={toolkit.toolkit.name}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                  src={toolkit.toolkit.meta.logo}
                />
              ) : null}
              <span
                className={`font-semibold text-lg text-primary ${
                  toolkit.toolkit.meta.logo ? "hidden" : ""
                }`}
              >
                {getInitial(toolkit.toolkit.name)}
              </span>
            </div>
            {isConnected && connectedAccount && (
              <div className="flex items-center rounded-full bg-green-50 px-2 py-1 font-medium text-green-600 text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </div>
            )}
            {isInitiating && initiatingAccount && (
              <div className="flex items-center rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-600 text-xs">
                <LoadingSpinner className="mr-1 h-3 w-3" size="sm" />
                Initiating
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-base">
              {toolkit.toolkit.name}
            </h3>
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {toolkit.toolkit.meta.description}
            </p>
            {isInitiating && initiatingAccount && (
              <div className="mt-2 text-amber-600 text-xs">
                Auto-cancel in {minutes}m {seconds}s
              </div>
            )}
          </div>

          <div className="pt-2">
            {isConnected && connectedAccount ? (
              <Button
                className="w-full text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                disabled={isConnecting}
                onClick={() => handleDisconnect(toolkit, connectedAccount)}
                size="sm"
                variant="outline"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" size="sm" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            ) : isInitiating && initiatingAccount ? (
              <Button
                className="w-full text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                disabled={isConnecting}
                onClick={() => handleDisconnect(toolkit, initiatingAccount)}
                size="sm"
                variant="outline"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" size="sm" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={isConnecting}
                onClick={() => handleConnect(toolkit)}
                size="sm"
                variant="outline"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" size="sm" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plug className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col space-y-4 overflow-hidden rounded-2xl bg-background p-4 md:h-[calc(100vh-3rem)] md:space-y-6 md:p-6">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col justify-between gap-4 pt-6 md:flex-row md:items-center md:pt-10">
          <div className="flex items-center gap-2 md:gap-0">
            <SidebarTrigger className="md:hidden" />
            <div>
              <h1 className="font-semibold text-2xl md:text-3xl">
                Integrations
              </h1>
              <p className="hidden text-muted-foreground text-xs sm:block md:text-sm">
                Connect your favorite tools to enhance your workflow.
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              type="text"
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-auto w-full max-w-[1440px]">
          {loading ? (
            <LoadingGrid count={6} />
          ) : (
            <Tabs className="w-full" defaultValue="connected">
              <TabsList
                className={`grid w-full max-w-lg ${initiatingToolkits.length > 0 ? "grid-cols-3" : "grid-cols-2"}`}
              >
                <TabsTrigger
                  className="flex items-center gap-2"
                  value="connected"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                  {connectedToolkits.length > 0 && (
                    <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs">
                      {connectedToolkits.length}
                    </span>
                  )}
                </TabsTrigger>
                {initiatingToolkits.length > 0 && (
                  <TabsTrigger
                    className="flex items-center gap-2"
                    value="initiating"
                  >
                    <LoadingSpinner className="h-4 w-4" size="sm" />
                    Initiating
                    <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs">
                      {initiatingToolkits.length}
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  className="flex items-center gap-2"
                  value="marketplace"
                >
                  <Plug className="h-4 w-4" />
                  Marketplace
                  {marketplaceApps.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 text-xs">
                      {marketplaceApps.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Connected Tab */}
              <TabsContent className="space-y-4 pt-6" value="connected">
                {connectedToolkits.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-accent/20 py-12 text-center text-muted-foreground">
                    <Plug className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No connected apps yet.</p>
                    <p className="text-xs">
                      Switch to Marketplace to connect your first app.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {connectedToolkits.map((toolkit) =>
                      renderAppCard(toolkit, true)
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Initiating Tab - Only show if there are initiating connections */}
              {initiatingToolkits.length > 0 && (
                <TabsContent className="space-y-4 pt-6" value="initiating">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {initiatingToolkits.map((toolkit) => {
                      const initiatingAccount = initiatingAccounts.find(
                        (account) =>
                          account.toolkit?.slug?.toLowerCase() ===
                          toolkit.toolkit.slug.toLowerCase()
                      );
                      return renderAppCard(toolkit, false, initiatingAccount);
                    })}
                  </div>
                </TabsContent>
              )}

              {/* Marketplace Tab */}
              <TabsContent className="space-y-8 pt-6" value="marketplace">
                {marketplaceApps.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-accent/20 py-12 text-center text-muted-foreground">
                    <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>
                      {searchQuery
                        ? "No apps found matching your search."
                        : "All available apps are connected!"}
                    </p>
                  </div>
                ) : (
                  sortedCategories.map((category) => (
                    <section key={category}>
                      <h2 className="mb-3 flex items-center gap-2 font-medium text-base capitalize md:mb-4 md:text-lg">
                        <Plug className="h-5 w-5 text-muted-foreground" />
                        {category}
                      </h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categorizedApps[category].map((app) =>
                          renderMarketplaceAppCard(app)
                        )}
                      </div>
                    </section>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
