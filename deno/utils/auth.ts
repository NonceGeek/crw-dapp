/**
 * Authentication utilities for the multi-chain wallet system
 */

/**
 * Sets or updates the environment password in KV store
 * @param newPassword - The new password to set
 * @param currentPassword - The current password (required if password already exists)
 * @returns Result object with success status and message
 */
export async function set_env_password(
  newPassword: string, 
  currentPassword?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const kv = await Deno.openKv();
    const existingPassword = await kv.get(["env", "password"]);
    
    // If no password exists, set the new password
    if (existingPassword.value == null) {
      console.log("No existing password found, setting new password");
      await kv.set(["env", "password"], newPassword);
      return { 
        success: true, 
        message: "Password set successfully" 
      };
    } else {
      // Password exists, need to verify current password
      console.log("Existing password found, verifying current password");
      
      if (!currentPassword) {
        return { 
          success: false, 
          message: "Current password required to update existing password",
          error: "Current password required"
        };
      }
      
      if (currentPassword !== existingPassword.value) {
        return { 
          success: false, 
          message: "Invalid current password",
          error: "Invalid password" 
        };
      } else {
        await kv.set(["env", "password"], newPassword);
        return { 
          success: true, 
          message: "Password updated successfully" 
        };
      }
    }
  } catch (error) {
    console.error("Error setting password:", error);
    return { 
      success: false, 
      message: "Failed to set password",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Checks if the provided password matches the stored environment password
 * @param password - The password to verify
 * @returns Result object with validation status and message
 */
export async function check_env_password(password: string): Promise<{ 
  isValid: boolean; 
  message: string; 
  exists: boolean;
}> {
  try {
    const kv = await Deno.openKv();
    const storedPassword = await kv.get(["env", "password"]);
    
    // Check if password exists in KV store
    if (storedPassword.value == null) {
      return {
        isValid: false,
        message: "No password has been set",
        exists: false
      };
    }
    
    // Verify password
    const isValid = password === storedPassword.value;
    
    return {
      isValid,
      message: isValid ? "Password is valid" : "Invalid password",
      exists: true
    };
  } catch (error) {
    console.error("Error checking password:", error);
    return {
      isValid: false,
      message: "Failed to verify password",
      exists: false
    };
  }
}

/**
 * Gets whether a password has been set in the system
 * @returns Whether a password exists
 */
export async function has_env_password(): Promise<boolean> {
  try {
    const kv = await Deno.openKv();
    const storedPassword = await kv.get(["env", "password"]);
    return storedPassword.value != null;
  } catch (error) {
    console.error("Error checking if password exists:", error);
    return false;
  }
}

/**
 * Removes the environment password from KV store
 * @param currentPassword - The current password (required for verification)
 * @returns Result object with success status and message
 */
export async function remove_env_password(currentPassword: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const verification = await check_env_password(currentPassword);
    
    if (!verification.exists) {
      return {
        success: false,
        message: "No password exists to remove",
        error: "No password set"
      };
    }
    
    if (!verification.isValid) {
      return {
        success: false,
        message: "Invalid password provided",
        error: "Invalid password"
      };
    }
    
    const kv = await Deno.openKv();
    await kv.delete(["env", "password"]);
    
    return {
      success: true,
      message: "Password removed successfully"
    };
  } catch (error) {
    console.error("Error removing password:", error);
    return {
      success: false,
      message: "Failed to remove password",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
