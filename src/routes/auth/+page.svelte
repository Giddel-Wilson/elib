<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { BookOpen, Mail, KeyRound } from "lucide-svelte";
  import { auth } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { requestOTP, verifyOTP, signup } from "$lib/api/auth";
  import { AuthError } from "$lib/errors/auth";
  import { toast } from "svelte-sonner";
  import { onDestroy } from "svelte";
  import { browser } from "$app/environment";

  let isLogin = true;
  let email = "";
  let otp = "";
  let loading = false;
  let otpRequested = false;
  let otpLoading = false;
  let otpExpiryTime: number | null = null;
  let otpExpiryTimer: ReturnType<typeof setInterval> | undefined;
  let redirectTimer: ReturnType<typeof setInterval> | undefined;
  let countdown = 0;
  let otpError = "";
  let otpInvalid = false;

  function isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@uniport\.edu\.ng$/.test(email);
  }

  function handleEmailChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && !isValidEmail(value)) {
      input.setCustomValidity(
        "Please enter your Uniport email address (@uniport.edu.ng)"
      );
    } else {
      input.setCustomValidity("");
    }
  }

  onDestroy(() => {
    if (redirectTimer) clearInterval(redirectTimer);
    if (otpExpiryTimer) clearInterval(otpExpiryTimer);
  });

  async function startRedirectCountdown(): Promise<void> {
    countdown = 5;
    return new Promise((resolve) => {
      redirectTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(redirectTimer);
          resolve();
        }
      }, 1000);
    });
  }

  function getRemainingMinutes(): number {
    if (!otpExpiryTime) return 0;
    const remaining = Math.max(0, (otpExpiryTime - Date.now()) / 1000 / 60);
    return Math.floor(remaining);
  }

  async function handleGetOTP() {
    if (!isValidEmail(email)) {
      toast.error("Please use your Uniport email address");
      return;
    }

    otpLoading = true;
    try {
      await requestOTP(email);
      otpRequested = true;
      otpExpiryTime = Date.now() + 10 * 60 * 1000;

      otpExpiryTimer = setInterval(() => {
        if (otpExpiryTime && Date.now() >= otpExpiryTime) {
          clearInterval(otpExpiryTimer);
          otpRequested = false;
          otpExpiryTime = null;
          toast.error("OTP has expired. Please request a new one.");
        }
      }, 1000);

      toast.success("OTP sent to your email");
    } catch (error: unknown) {
      console.error("OTP request failed:", error);
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send OTP");
      }
    } finally {
      otpLoading = false;
    }
  }

  async function handleAuth(event: Event) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please use your Uniport email address");
      return;
    }

    if (isLogin && (!otp || otp.length !== 6)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    loading = true;
    try {
      if (isLogin) {
        if (!otpExpiryTime || Date.now() >= otpExpiryTime) {
          otpError = "OTP has expired. Please request a new one.";
          otpInvalid = true;
          toast.error(otpError);
          otpRequested = false;
          loading = false;
          return;
        }

        try {
          console.log("Attempting login with:", { email, otp });
          const result = await verifyOTP(email, otp);
          console.log("Login Response:", result);

          if (!result || !result.token) {
            otpError = "Invalid OTP. Please try again.";
            otpInvalid = true;
            toast.error(otpError);
            return;
          }

          // Reset error state on success
          otpError = "";
          otpInvalid = false;

          // Update auth store first
          auth.login({
            email,
            token: result.token,
            id: result.user?.id,
          });

          toast.success("Successfully logged in");

          // Use a more mobile-friendly navigation approach with delay
          if (browser) {
            // Delay slightly to ensure storage operations complete
            setTimeout(() => {
              console.log("Redirecting to home page");
              // Force a complete page reload for mobile
              window.location.replace("/");
            }, 500);
          }
        } catch (error: unknown) {
          console.error("Login error:", error);
          if (error instanceof AuthError) {
            otpError = error.message;
            otpInvalid = true;
            toast.error(error.message);
          } else {
            otpError = "Login failed. Please try again.";
            otpInvalid = true;
            toast.error("Login failed. Please try again.");
          }
          return;
        }
      } else {
        try {
          const result = await signup(email);
          console.log("Signup Response:", result);

          if (result.message?.includes("already exists")) {
            toast.error("This email is already registered");
            await startRedirectCountdown();
            isLogin = true;
            otpRequested = false;
            otp = "";
            toast.success("Please sign in with your email");
          } else {
            toast.success(
              result.message || "Account created! Please check your email."
            );
            isLogin = true;
            otpRequested = false;
            otp = "";
          }
        } catch (error: unknown) {
          console.error("Signup error:", error);
          if (error instanceof AuthError) {
            if (error.message.includes("already exists")) {
              toast.error("This email is already registered");
              await startRedirectCountdown();
              isLogin = true;
              otpRequested = false;
              otp = "";
              toast.success("Please sign in with your email");
            } else {
              toast.error(error.message);
            }
          } else {
            toast.error("Failed to create account");
          }
        }
      }
    } catch (error: unknown) {
      console.error("Authentication failed:", error);
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Authentication failed");
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
    <div class="flex min-h-screen items-center justify-center px-4">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center">
          <div class="flex justify-center">
            <div class="rounded-full bg-primary/10 p-3">
              <BookOpen class="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 class="mt-4 text-3xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p class="mt-2 text-muted-foreground">
            {isLogin
              ? "Sign in with your school email"
              : "Sign up with your school email"}
          </p>
        </div>

        <Card class="p-6">
          <form class="space-y-4" on:submit|preventDefault={handleAuth}>
            <div class="space-y-2">
              <Label for="email">School Email</Label>
              <div class="relative">
                <Mail
                  class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
                />
                <Input
                  id="email"
                  type="email"
                  bind:value={email}
                  on:input={handleEmailChange}
                  placeholder="example@uniport.edu.ng"
                  class="pl-10"
                  required
                  pattern="[a-zA-Z0-9._%+\-]+@uniport\.edu\.ng$"
                  title="Please enter your Uniport email address"
                />
              </div>
            </div>

            {#if isLogin}
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="otp">OTP</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={Boolean(
                      otpLoading ||
                        !isValidEmail(email) ||
                        (otpExpiryTime && Date.now() < otpExpiryTime)
                    )}
                    on:click={handleGetOTP}
                  >
                    {#if otpLoading}
                      <span class="flex items-center gap-2">
                        <div
                          class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                        ></div>
                        Sending...
                      </span>
                    {:else}
                      Get OTP
                    {/if}
                  </Button>
                </div>

                {#if otpRequested && otpExpiryTime && Date.now() < otpExpiryTime}
                  <p class="text-xs text-muted-foreground">
                    OTP will expire in {getRemainingMinutes()} minutes
                  </p>
                {/if}

                <div class="relative">
                  <div
                    class={`absolute left-3 top-2.5 ${otpInvalid ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    <KeyRound class="h-5 w-5" />
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    inputmode="numeric"
                    bind:value={otp}
                    placeholder="Enter 6-digit OTP"
                    class={`pl-10 ${otpInvalid ? "border-destructive" : ""}`}
                    required={isLogin}
                    maxlength="6"
                    aria-invalid={otpInvalid}
                    aria-describedby={otpError ? "otp-error" : undefined}
                    on:input={(e) => {
                      const value = e.currentTarget.value;
                      // Only allow numbers and limit to 6 digits
                      const numericValue = value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      e.currentTarget.value = numericValue;
                      otp = numericValue;

                      // Reset error state when user starts typing
                      if (otpInvalid) {
                        otpInvalid = false;
                        otpError = "";
                      }
                    }}
                  />
                  {#if otpError}
                    <p id="otp-error" class="mt-2 text-sm text-destructive">
                      {otpError}
                    </p>
                  {/if}
                </div>
              </div>
            {/if}

            <Button
              type="submit"
              class="w-full"
              disabled={loading ||
                (isLogin && (!otpRequested || !otp || String(otp).length !== 6))}
            >
              {#if loading}
                <span class="flex items-center gap-2">
                  <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"
                  ></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              {:else}
                {isLogin ? "Sign in" : "Create account"}
              {/if}
            </Button>
          </form>

          <div class="mt-4 text-center text-sm">
            <span class="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              class="font-medium text-primary hover:underline"
              on:click={() => {
                isLogin = !isLogin;
                otpRequested = false;
                otp = "";
              }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </Card>

        {#if countdown > 0}
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div class="space-y-4 rounded-lg bg-card p-6 text-center shadow-lg">
              <h2 class="text-xl font-semibold">User already exists</h2>
              <p class="text-muted-foreground">
                You'll be redirected to login in {countdown}
                {countdown === 1 ? "second" : "seconds"}
              </p>
              <div class="h-2 w-full rounded-full bg-muted">
                <div
                  class="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                  style="width: {(countdown / 5) * 100}%"
                ></div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
