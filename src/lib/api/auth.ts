import { AuthError } from "$lib/errors/auth";
// import { toast } from "svelte-sonner";

const API_BASE_URL = "https://focbackend.emmanuelngoka.work/api/v1/auth";

interface AuthResponse {
  message: string;
  email?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
}

function isUniportEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@uniport.edu.ng");
}

export async function requestOTP(email: string): Promise<AuthResponse> {
  if (!isUniportEmail(email)) {
    throw new AuthError("Please use your Uniport email address");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthError(
        data.message || "Failed to request OTP",
        response.status
      );
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to request OTP");
  }
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError("Invalid OTP. Please try again.", response.status);
      }
      throw new AuthError(
        data.message || "OTP verification failed",
        response.status
      );
    }

    // Ensure we have the required data
    if (!data.token || !data.user) {
      throw new AuthError("Invalid response from server");
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("OTP verification failed");
  }
}

export async function signup(email: string): Promise<AuthResponse> {
  if (!isUniportEmail(email)) {
    throw new AuthError("Please use your Uniport email address");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthError(
        data.message || "Registration failed",
        response.status
      );
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Registration failed");
  }
}
