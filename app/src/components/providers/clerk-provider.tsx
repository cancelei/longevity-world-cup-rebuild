"use client";

import { ClerkProvider as ClerkProviderBase } from "@clerk/nextjs";

interface ClerkProviderProps {
  children: React.ReactNode;
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#00BCD4",
    colorBackground: "#1E1E32",
    colorInputBackground: "#252542",
    colorInputText: "#FFFFFF",
    colorText: "#FFFFFF",
    colorTextSecondary: "#B0B0C0",
    borderRadius: "12px",
  },
  elements: {
    formButtonPrimary:
      "bg-[#00BCD4] hover:bg-[#00ACC1] text-[#0D0D1A] font-semibold",
    card: "bg-[#1E1E32] border border-[#2A2A40]",
    headerTitle: "text-white font-display",
    headerSubtitle: "text-[#B0B0C0]",
    socialButtonsBlockButton:
      "bg-[#252542] border border-[#2A2A40] hover:bg-[#2A2A40]",
    formFieldInput:
      "bg-[#252542] border-[#2A2A40] focus:border-[#00BCD4]",
    footerActionLink: "text-[#00BCD4] hover:text-[#00ACC1]",
    identityPreviewEditButton: "text-[#00BCD4]",
  },
};

export function ClerkProvider({ children }: ClerkProviderProps) {
  // Skip Clerk during build if no publishable key is set
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProviderBase appearance={clerkAppearance}>
      {children}
    </ClerkProviderBase>
  );
}
