import app from "../src/app";

describe("App", () => {
  test("GET /", async () => {
    const res = await app.request("http://localhost:3000/api/v1");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello World");
  });
});
