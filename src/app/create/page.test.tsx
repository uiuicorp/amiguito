import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreateSecretFriend from "./page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("CreateSecretFriend", () => {
  const mockPush = jest.fn();
  const mockUseSession = useSession as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSession.mockReturnValue({
      data: { user: { id: "1", name: "Test User" } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form", () => {
    render(<CreateSecretFriend />);
    expect(screen.getByPlaceholderText("Event Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Event Date")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("displays welcome message with user name", () => {
    render(<CreateSecretFriend />);
    expect(
      screen.getByText("Criar Amigo Secreto - Bem-vindo, Test User")
    ).toBeInTheDocument();
  });

  it("displays error message on failed event creation", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Error message"),
      })
    ) as jest.Mock;

    render(<CreateSecretFriend />);
    fireEvent.change(screen.getByPlaceholderText("Event Name"), {
      target: { value: "Test Event" },
    });
    fireEvent.change(screen.getByPlaceholderText("Event Date"), {
      target: { value: "2023-12-25" },
    });
    fireEvent.click(screen.getByText("Create"));

    const errorMessage = await screen.findByText(
      "Failed to create event: Error message"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("redirects to event page on successful event creation", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    ) as jest.Mock;

    render(<CreateSecretFriend />);
    fireEvent.change(screen.getByPlaceholderText("Event Name"), {
      target: { value: "Test Event" },
    });
    fireEvent.change(screen.getByPlaceholderText("Event Date"), {
      target: { value: "2023-12-25" },
    });
    fireEvent.click(screen.getByText("Create"));

    await screen.findByText("Create");
    expect(mockPush).toHaveBeenCalledWith("/Test Event");
  });
});
