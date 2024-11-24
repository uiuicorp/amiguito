import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import { useSession } from "next-auth/react";
import SecretFriend from "./page";

jest.mock("next-auth/react");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: "test-event-id" }),
}));
jest.mock("../../components/LoadingSpinner", () =>
  jest.fn(() => <div>Loading...</div>)
);

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    redirected: false,
    json: () => Promise.resolve(null),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    clone: () => ({} as Response),
    formData: () => Promise.resolve(new FormData()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as Response)
);

describe("SecretFriend", () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
  });

  it("renders loading spinner when event is not loaded", async () => {
    await act(async () => {
      render(<SecretFriend />);
    });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
