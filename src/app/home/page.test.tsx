import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import Home from "./page";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("Home", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to home page if unauthenticated", async () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("displays welcome message and events if authenticated", async () => {
    const mockSession = {
      user: { id: "1", name: "John Doe", email: "john@example.com" },
    };
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    const mockEvents = [
      { _id: "1", eventName: "Event 1", participants: [] },
      { _id: "2", eventName: "Event 2", participants: [] },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    ) as jest.Mock;

    await act(async () => {
      render(<Home />);
    });

    expect(
      screen.getByText("Amigo Secreto - Bem-vindo, John Doe")
    ).toBeInTheDocument();
    expect(screen.getByText("Criar Amigo Secreto")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
    });
  });

  it("navigates to create page on button click", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "1" } },
      status: "authenticated",
    });

    await act(async () => {
      render(<Home />);
    });

    fireEvent.click(screen.getByText("Criar Amigo Secreto"));

    expect(mockPush).toHaveBeenCalledWith("/create");
  });
});
