<script lang="ts">
    import { User, Sun, Moon } from 'lucide-svelte';
    import { Button } from './ui/button';
    import logo from '$lib/assets/nacos.png';
    
    export let isDarkMode: boolean;
</script>

<header class="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-card/80 backdrop-blur-lg md:hidden">
    <div class="flex h-full items-center justify-between px-3">
        <!-- Logo -->
        <div class="flex items-center gap-3">
            <img src={logo} alt="FOC Logo" class="h-8 w-8" />
            <span class="text-lg font-bold text-primary">FOC E-library</span>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                on:click={() => isDarkMode = !isDarkMode}
                aria-label="Toggle theme"
            >
                {#if isDarkMode}
                    <Sun class="h-5 w-5 text-foreground" />
                {:else}
                    <Moon class="h-5 w-5 text-foreground" />
                {/if}
            </Button>
            <a href="/profile" class="no-underline">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User profile"
                >
                    <User class="h-5 w-5 text-foreground" />
                </Button>
            </a>
        </div>
    </div>
</header>
