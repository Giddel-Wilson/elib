<script lang="ts">
  import "../app.css";
  import "../lib/styles/theme.css";
  import { page, navigating } from "$app/stores";
  import { onMount } from "svelte";
  import {
    LayoutDashboard,
    Upload,
    Library,
    MessageSquare,
    User,
    LogOut,
    BookOpen,
    FileText,
  } from "lucide-svelte";
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { Toaster } from "svelte-sonner";
  import LoadingSpinner from "$lib/components/loading-spinner.svelte";
  import { browser } from "$app/environment";
  import Header from "$lib/components/header.svelte";
  import logo from "$lib/assets/nacos.png";

  let { children, data } = $props<{ data: { auth: any } }>();
  let isMobile = $state(false);
  let isDarkMode = $state(false);
  let authInitialized = $state(false);

  // Improved auth initialization with robust error handling
  onMount(() => {
    // Force exit loading state after max 3 seconds
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - forcing auth initialization");
      authInitialized = true;
    }, 3000);

    try {
      console.log("Layout mounted, initializing auth");
      // Try to initialize auth from stored credentials
      const initResult = auth.init();
      authInitialized = true;
      console.log(
        "Auth initialized:",
        initResult,
        "isAuthenticated:",
        $auth.isAuthenticated
      );

      // If we're on the auth page but already authenticated, redirect
      if ($auth.isAuthenticated && $page.url.pathname === "/auth" && browser) {
        console.log("Already authenticated, redirecting from auth page");
        if (isMobile) {
          window.location.href = "/"; // Use direct navigation for mobile
        } else {
          goto("/");
        }
      }

      // Check for mobile
      const checkMobile = () => {
        isMobile = window.innerWidth < 768;
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      
      // Always clear the safety timeout
      clearTimeout(safetyTimeout);
      
      return () => window.removeEventListener("resize", checkMobile);
    } catch (error) {
      console.error("Error during auth initialization:", error);
      // Ensure we don't stay in loading state
      authInitialized = true;
      // Clear the safety timeout 
      clearTimeout(safetyTimeout);
    }
  });

  // Remove the $effect for auth initialization to avoid race conditions
  // Just rely on the onMount initialization which is more predictable

  // Handle logout with more reliable navigation for mobile
  function handleLogout() {
    auth.logout();
    if (isMobile && browser) {
      window.location.href = "/auth";
    } else {
      goto("/auth");
    }
  }

  // Mobile navigation items
  const mobileNavItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/library", label: "Library", icon: Library },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
    {
      href: "#",
      label: "Logout",
      icon: LogOut,
      action: () => {
        auth.logout();
        goto("/auth");
      },
    },
  ];

  // Desktop navigation items
  const desktopNavItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/library", label: "Library", icon: FileText },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
  ];

  const bottomNavItems = [{ href: "/profile", label: "Profile", icon: User }];
</script>

{#if $auth.isAuthenticated}
  <div class="min-h-screen bg-background" class:dark={isDarkMode}>
    <LoadingSpinner visible={$navigating !== null} />
    {#if isMobile}
      <Header bind:isDarkMode />
    {/if}

    <!-- Desktop Sidebar - Professional Design -->
    <nav
      class="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col justify-between bg-gradient-to-b from-background via-background/98 to-background/95 shadow-[5px_0_30px_-15px_rgba(0,0,0,0.1)] border-r border-primary/5 backdrop-blur-xl md:flex"
    >
      <!-- Logo Area -->
      <div class="px-6 pt-8 pb-6 border-b border-border/30">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div
              class="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
            ></div>
            <div
              class="relative rounded-xl bg-gradient-to-br from-primary/30 to-primary/5Desktop p-1.5 ring-1 ring-primary/10 backdrop-blur-sm"
            >
              <img src={logo} alt="FOC Logo" class="h-10 w-10" />
            </div>
          </div>
          <div>
            <h1
              class="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Faculty E-Library
            </h1>
            <p class="text-xs text-muted-foreground/70">Faculty of Computing</p>
          </div>
        </div>
      </div>

      <!-- Main Navigation Area -->
      <div
        class="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
      >
        <!-- Main Navigation Section -->
        <div>
          <h3
            class="mb-3 ml-3 text-xs uppercase font-medium text-muted-foreground/70 tracking-wider"
          >
            Main Navigation
          </h3>
          <div class="space-y-1.5">
            {#each desktopNavItems as item}
              <a
                href={item.href}
                class="group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all hover:bg-muted/40 duration-300 ease-out {$page
                  .url.pathname === item.href
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]'
                  : ''}"
              >
                <div
                  class="mr-3.5 flex items-center justify-center rounded-lg p-2.5 transition-all duration-300 shadow-sm group-hover:from-primary/15 group-hover:to-primary/5 {$page
                    .url.pathname === item.href
                    ? 'bg-gradient-to-br from-primary/25 to-primary/10 shadow-inner shadow-primary/5'
                    : 'bg-gradient-to-br from-muted/50 to-muted/20'}"
                >
                  <svelte:component
                    this={item.icon}
                    class={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${$page.url.pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary/80"}`}
                  />
                </div>
                <span
                  class={`transition-all duration-300 ${$page.url.pathname === item.href ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  {item.label}
                </span>
              </a>
            {/each}
          </div>
        </div>
      </div>

      <!-- Bottom Area -->
      <div
        class="border-t bg-gradient-to-b from-background/50 to-muted/30 backdrop-blur-sm p-4 space-y-2.5"
      >
        <div class="mb-3 px-2">
          <h3
            class="text-xs uppercase font-medium text-muted-foreground/70 tracking-wider"
          >
            Account
          </h3>
        </div>

        {#each bottomNavItems as item}
          <a
            href={item.href}
            class="group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-muted/40 duration-300 ease-out {$page
              .url.pathname === item.href
              ? 'bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/20'
              : ''}"
          >
            <div
              class="mr-3.5 flex items-center justify-center rounded-lg p-2.5 shadow-sm transition-all duration-300 group-hover:from-primary/15 group-hover:to-primary/5 {$page
                .url.pathname === item.href
                ? 'bg-gradient-to-br from-primary/25 to-primary/10 shadow-primary/5'
                : 'bg-gradient-to-br from-muted/50 to-muted/20'}"
            >
              <svelte:component
                this={item.icon}
                class={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${$page.url.pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary/80"}`}
              />
            </div>
            <span
              class={`transition-all duration-300 ${$page.url.pathname === item.href ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
            >
              {item.label}
            </span>
          </a>
        {/each}

        <button
          onclick={handleLogout}
          class="group w-full flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-destructive/5 duration-300 ease-out mt-4"
        >
          <div
            class="mr-3.5 flex items-center justify-center rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 p-2.5 shadow-sm transition-all duration-300 group-hover:from-destructive/15 group-hover:to-destructive/5"
          >
            <LogOut
              class="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span
            class="text-muted-foreground group-hover:text-destructive transition-all duration-300"
          >
            Logout
          </span>
        </button>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    {#if isMobile}
      <nav
        class="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t bg-card/80 backdrop-blur-lg"
      >
        {#each mobileNavItems as item}
          {#if item.action}
            <button
              class="flex flex-col items-center p-2 text-xs text-foreground hover:text-primary"
              onclick={item.action}
            >
              {#if item.icon}
                <svelte:component this={item.icon} class="h-5 w-5" />
              {/if}
              <span class="mt-1">{item.label}</span>
            </button>
          {:else}
            <a
              href={item.href}
              class="flex flex-col items-center p-2 text-xs text-foreground hover:text-primary"
              class:text-primary={$page.url.pathname === item.href}
            >
              {#if item.icon}
                <svelte:component this={item.icon} class="h-5 w-5" />
              {/if}
              <span class="mt-1">{item.label}</span>
            </a>
          {/if}
        {/each}
      </nav>
    {/if}

    <!-- Main Content -->
    <main
      class="flex min-h-screen flex-col pb-20 pt-16 md:pb-4 md:pt-0 md:pl-72"
    >
      <div class="flex-1 px-3 md:px-6">
        {@render children()}
      </div>
    </main>
  </div>
{:else if !authInitialized}
  <!-- Show minimal loading while auth initializes -->
  <div
    class="min-h-screen bg-background flex items-center justify-center"
    class:dark={isDarkMode}
  >
    <div class="flex flex-col items-center">
      <LoadingSpinner visible={true} />
      <p class="mt-4 text-muted-foreground">Initializing...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-background" class:dark={isDarkMode}>
    <LoadingSpinner visible={$navigating !== null} />
    {@render children()}
  </div>
{/if}

<Toaster richColors />
