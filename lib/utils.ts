// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Username validation utilities
export function validateUsername(
  username: string,
  required: boolean = false
): {
  isValid: boolean;
  message: string;
} {
  // If username is empty and not required, it's valid
  if (!username || !username.trim()) {
    if (required) {
      return { isValid: false, message: "Username is required" };
    }
    return { isValid: true, message: "" };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters long",
    };
  }

  if (trimmedUsername.length > 30) {
    return {
      isValid: false,
      message: "Username must be less than 30 characters",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { isValid: true, message: "" };
}

// Date validation utility
export function validateDate(dateString: string): {
  isValid: boolean;
  message: string;
} {
  if (!dateString || !dateString.trim()) {
    return { isValid: true, message: "" }; // Date is optional
  }

  const date = new Date(dateString);
  const today = new Date();

  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    return { isValid: false, message: "Please enter a valid date" };
  }

  // Check if date is in the future
  if (date > today) {
    return { isValid: false, message: "Date of birth cannot be in the future" };
  }

  // Check if date is too far in the past (e.g., more than 150 years ago)
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 150);
  if (date < minDate) {
    return {
      isValid: false,
      message: "Date of birth seems too far in the past",
    };
  }

  return { isValid: true, message: "" };
}

export function sanitizeProfileData(data: any): any {
  const sanitized: any = {};

  // Only include non-empty values and convert empty strings to null
  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Skip undefined values
    if (value === undefined) {
      return;
    }

    // Handle null values
    if (value === null) {
      sanitized[key] = null;
      return;
    }

    // Handle string values
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        sanitized[key] = trimmed;
      } else {
        // Convert empty strings to null for database compatibility
        sanitized[key] = null;
      }
      return;
    }

    // Handle other types (numbers, booleans, objects, etc.)
    sanitized[key] = value;
  });

  return sanitized;
}

// Profile data validation
export function validateProfileData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate full name
  if (!data.full_name || !data.full_name.trim()) {
    errors.push("Full name is required");
  } else if (data.full_name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  } else if (data.full_name.trim().length > 100) {
    errors.push("Full name must be less than 100 characters");
  }

  // Validate username if provided
  if (data.username && data.username.trim()) {
    const usernameValidation = validateUsername(data.username, false);
    if (!usernameValidation.isValid) {
      errors.push(usernameValidation.message);
    }
  }

  // Validate date of birth if provided
  if (data.date_of_birth && data.date_of_birth.trim()) {
    const dateValidation = validateDate(data.date_of_birth);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
