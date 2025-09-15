import { render, screen } from "@testing-library/vue";
import App from "./App.vue";

test("renders README heading", async () => {
  render(App);
  expect(
    await screen.findByRole("heading", {
      name: /klaay frontend developer take-home test/i,
    })
  ).toBeInTheDocument();
});
