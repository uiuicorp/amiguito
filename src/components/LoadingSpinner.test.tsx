import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

test("renders LoadingSpinner component", () => {
  const { getByLabelText } = render(<LoadingSpinner />);
  const spinnerElement = getByLabelText(/loading/i);
  expect(spinnerElement).toBeInTheDocument();
});
