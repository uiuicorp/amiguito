import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Home from "./page";
import LoadingSpinner from "../components/LoadingSpinner";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock("../components/LoadingSpinner", () =>
  jest.fn(() => <div>Loading...</div>)
);

describe("Home", () => {
  const useRouterMock = useRouter as jest.Mock;
  const useSessionMock = useSession as jest.Mock;
  const signInMock = signIn as jest.Mock;

  beforeEach(() => {
    useRouterMock.mockReturnValue({ push: jest.fn() });
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders login button when not authenticated", () => {
    render(<Home />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders loading spinner when loading", () => {
    useSessionMock.mockReturnValue({ data: null, status: "loading" });
    render(<Home />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /home when authenticated", () => {
    const pushMock = jest.fn();
    useRouterMock.mockReturnValue({ push: pushMock });
    useSessionMock.mockReturnValue({
      data: { user: { name: "Test User" } },
      status: "authenticated",
    });

    render(<Home />);
    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("calls signIn with google provider on login button click", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Login"));
    expect(signInMock).toHaveBeenCalledWith("google", { callbackUrl: "/home" });
  });
});
