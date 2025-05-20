import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "./Login";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: "fake-token" }),
  })
);

describe("Login Component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders login form", () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("submits login form", async () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "testpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "testpass" }),
      })
    );
    expect(mockOnLogin).toHaveBeenCalled();
  });
});
