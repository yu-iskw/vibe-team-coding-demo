import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HelloWorld from "../HelloWorld.vue";

describe("HelloWorld", () => {
  it("renders properly", () => {
    const msg = "Hello Vitest";
    const wrapper = mount(HelloWorld, {
      props: { msg },
    });

    expect(wrapper.text()).toContain(msg);
  });

  it("increments count on button click", async () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: "Hello World" },
    });

    const button = wrapper.find("button");
    expect(button.text()).toContain("count is 0");

    await button.trigger("click");
    expect(button.text()).toContain("count is 1");
  });
});
