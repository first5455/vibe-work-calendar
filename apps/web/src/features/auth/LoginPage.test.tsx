import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  it("renders login page with OAuth buttons", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check if the page title is rendered
    expect(screen.getByText(/Vibe Work Calendar/i)).toBeInTheDocument();

    // Check if OAuth login buttons are present
    expect(screen.getByRole("link", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();
  });

  it("has correct OAuth redirect links", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const googleLink = screen.getByRole("link", { name: /google/i });
    const githubLink = screen.getByRole("link", { name: /github/i });

    expect(googleLink).toHaveAttribute("href", expect.stringContaining("/auth/login/google"));
    expect(githubLink).toHaveAttribute("href", expect.stringContaining("/auth/login/github"));
  });
});
