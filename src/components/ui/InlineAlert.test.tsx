import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineAlert } from "./InlineAlert";

describe("InlineAlert", () => {
  it("announces validation errors accessibly", () => {
    render(<InlineAlert message="Invalid action" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid action");
  });

  it("renders nothing without a message", () => {
    const { container } = render(<InlineAlert message={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
